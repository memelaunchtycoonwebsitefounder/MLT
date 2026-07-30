/**
 * FateEngine - 命運預測引擎核心類
 * 基於 11,005+ 歷史案例的統計學習和相似度匹配
 */

import type {
  CoinInput,
  HistoricalCase,
  SimilarCase,
  InfluenceFactors,
  FateTrajectory,
  FatePrediction,
  FateOutcome,
  UserDecision,
  DecisionImpact,
  RandomEvent,
  FateEngineConfig,
  CoinCategory,
} from './fate-types';

import { RandomEventEngine } from './random-event-engine';

/**
 * FateEngine 主類
 */
export class FateEngine {
  private db: D1Database;
  private config: FateEngineConfig;
  private randomEventEngine: RandomEventEngine;

  // 類別基礎成功率 (基於 11,005 案例統計)
  private readonly CATEGORY_SUCCESS_RATES: Record<CoinCategory, { moon: number; stable: number }> = {
    celebrity: { moon: 0.3081, stable: 0.2847 }, // 59.28% 成功率
    meme: { moon: 0.2458, stable: 0.2900 }, // 53.58% 成功率
    animal: { moon: 0.1868, stable: 0.2778 }, // 46.47% 成功率
    tech: { moon: 0.1471, stable: 0.2831 }, // 43.02% 成功率
    random: { moon: 0.1134, stable: 0.3062 }, // 42% 成功率
    food: { moon: 0.10, stable: 0.25 }, // ~35% 成功率 (估算)
  };

  constructor(db: D1Database, config?: Partial<FateEngineConfig>) {
    this.db = db;
    this.config = {
      similarity_threshold: 0.5,
      max_similar_cases: 10,
      random_event_enabled: true,
      confidence_boost_factor: 1.2,
      ...config,
    };
    this.randomEventEngine = new RandomEventEngine();
  }

  // ============================================================================
  // 主要預測方法
  // ============================================================================

  /**
   * 預測新幣的命運
   */
  async predictFate(coinInput: CoinInput): Promise<FatePrediction> {
    // 1. 查找相似案例
    const similarCases = await this.findSimilarCases(coinInput);

    // 2. 計算影響因子
    const influenceFactors = this.calculateInfluenceFactors(coinInput);

    // 3. 生成命運軌跡預測
    const trajectory = this.predictTrajectory(coinInput, similarCases, influenceFactors);

    // 4. 生成隨機事件 (如果啟用)
    let randomEvents: RandomEvent[] = [];
    if (this.config.random_event_enabled) {
      const qualityScore = this.calculateQualityScore(influenceFactors);
      // 假設平均生命週期為 90 天
      const totalDays = 90;
      randomEvents = this.randomEventEngine.generateEvents(
        coinInput.category,
        0, // 當前天數從 0 開始
        totalDays,
        qualityScore
      );
      
      // 5. 應用隨機事件影響到軌跡
      if (randomEvents.length > 0) {
        const adjustedProbs = this.randomEventEngine.applyEventsToOutcome(
          trajectory.outcome_probabilities,
          randomEvents
        );
        trajectory.outcome_probabilities = adjustedProbs;
        
        // 重新確定最高概率的結果
        const maxProb = Math.max(...Object.values(adjustedProbs));
        const predictedOutcome = Object.entries(adjustedProbs).find(
          ([_, prob]) => prob === maxProb
        )?.[0] as FateOutcome;
        
        if (predictedOutcome) {
          trajectory.predicted_outcome = predictedOutcome;
          trajectory.confidence = maxProb;
        }
      }
    }

    // 6. 生成建議和警告
    const recommendations = this.generateRecommendations(coinInput, trajectory, influenceFactors);
    const warnings = this.generateWarnings(coinInput, trajectory);

    // 7. 計算綜合質量分數
    const qualityScore = this.calculateQualityScore(influenceFactors);

    return {
      coin_input: coinInput,
      trajectory,
      influence_factors: influenceFactors,
      similar_cases: similarCases,
      random_events: randomEvents,
      recommendations,
      warnings,
      quality_score: qualityScore,
      predicted_at: new Date().toISOString(),
    };
  }

  // ============================================================================
  // 相似度匹配算法
  // ============================================================================

  /**
   * 查找最相似的歷史案例
   */
  private async findSimilarCases(coinInput: CoinInput): Promise<SimilarCase[]> {
    // 查詢同類別的所有歷史案例
    const query = `
      SELECT * FROM coin_history_cases
      WHERE category = ?
      ORDER BY created_at DESC
      LIMIT 200
    `;

    const result = await this.db.prepare(query).bind(coinInput.category).all<HistoricalCase>();

    if (!result.results || result.results.length === 0) {
      // 如果同類別沒有案例,查詢所有案例
      const allResult = await this.db.prepare('SELECT * FROM coin_history_cases LIMIT 500').all<HistoricalCase>();
      result.results = allResult.results || [];
    }

    // 計算每個案例的相似度
    const similarCases: SimilarCase[] = result.results.map((histCase) => {
      const similarity = this.calculateSimilarity(coinInput, histCase);
      return {
        case: histCase,
        similarity_score: similarity.total_score,
        feature_scores: similarity.feature_scores,
      };
    });

    // 按相似度排序並返回前 N 個
    return similarCases
      .filter((sc) => sc.similarity_score >= this.config.similarity_threshold)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, this.config.max_similar_cases);
  }

  /**
   * 計算兩個幣種的相似度
   */
  private calculateSimilarity(
    coinInput: CoinInput,
    histCase: HistoricalCase
  ): {
    total_score: number;
    feature_scores: SimilarCase['feature_scores'];
  } {
    // 1. 類別匹配 (權重: 30%)
    const categoryMatch = coinInput.category === histCase.category ? 1 : 0;

    // 2. 創作者質量相似度 (權重: 25%)
    const creatorSimilarity = this.calculateCreatorSimilarity(
      {
        reputation: coinInput.creator_reputation,
        previous_coins: coinInput.creator_previous_coins,
      },
      {
        reputation: histCase.creator_reputation,
        previous_coins: histCase.creator_previous_coins,
      }
    );

    // 3. 市場環境相似度 (權重: 15%)
    const marketSimilarity = this.calculateMarketSimilarity(
      {
        trend: coinInput.market_trend,
        competition: coinInput.competition_level,
      },
      {
        trend: histCase.market_trend,
        competition: histCase.competition_level,
      }
    );

    // 4. 資源投入相似度 (權重: 20%)
    const resourceSimilarity = this.calculateResourceSimilarity(
      {
        has_website: coinInput.has_website,
        has_twitter: coinInput.has_twitter,
        has_telegram: coinInput.has_telegram,
        marketing_budget: coinInput.marketing_budget,
      },
      {
        has_website: histCase.has_website === 1,
        has_twitter: histCase.has_twitter === 1,
        has_telegram: histCase.has_telegram === 1,
        marketing_budget: histCase.marketing_budget,
      }
    );

    // 5. 規模相似度 (權重: 10%)
    const scaleSimilarity = this.calculateScaleSimilarity(
      {
        supply: coinInput.initial_supply,
        holders: coinInput.initial_holders,
        volume: coinInput.initial_volume,
      },
      {
        supply: histCase.initial_supply,
        holders: histCase.initial_holders,
        volume: histCase.initial_volume,
      }
    );

    // 加權總分
    const totalScore =
      categoryMatch * 0.3 +
      creatorSimilarity * 0.25 +
      marketSimilarity * 0.15 +
      resourceSimilarity * 0.2 +
      scaleSimilarity * 0.1;

    return {
      total_score: totalScore,
      feature_scores: {
        category_match: categoryMatch,
        creator_similarity: creatorSimilarity,
        market_similarity: marketSimilarity,
        resource_similarity: resourceSimilarity,
        scale_similarity: scaleSimilarity,
      },
    };
  }

  /**
   * 計算創作者質量相似度
   */
  private calculateCreatorSimilarity(
    a: { reputation: number; previous_coins: number },
    b: { reputation: number; previous_coins: number }
  ): number {
    // 聲譽相似度 (0-100 標準化)
    const reputationDiff = Math.abs(a.reputation - b.reputation) / 100;
    const reputationSim = 1 - reputationDiff;

    // 經驗相似度 (對數尺度,因為 0-10 差異很大)
    const expA = Math.log10(a.previous_coins + 1);
    const expB = Math.log10(b.previous_coins + 1);
    const expDiff = Math.abs(expA - expB) / Math.log10(11); // 最大 log10(11)
    const expSim = 1 - expDiff;

    // 加權平均 (聲譽更重要)
    return reputationSim * 0.7 + expSim * 0.3;
  }

  /**
   * 計算市場環境相似度
   */
  private calculateMarketSimilarity(
    a: { trend: string; competition: number },
    b: { trend: string; competition: number }
  ): number {
    // 趨勢匹配
    const trendMatch = a.trend === b.trend ? 1 : 0;

    // 競爭程度相似度 (1-10)
    const compDiff = Math.abs(a.competition - b.competition) / 9;
    const compSim = 1 - compDiff;

    return trendMatch * 0.6 + compSim * 0.4;
  }

  /**
   * 計算資源投入相似度
   */
  private calculateResourceSimilarity(
    a: { has_website: boolean; has_twitter: boolean; has_telegram: boolean; marketing_budget: number },
    b: { has_website: boolean; has_twitter: boolean; has_telegram: boolean; marketing_budget: number }
  ): number {
    // 社交媒體覆蓋相似度
    const socialA = [a.has_website, a.has_twitter, a.has_telegram].filter(Boolean).length;
    const socialB = [b.has_website, b.has_twitter, b.has_telegram].filter(Boolean).length;
    const socialSim = 1 - Math.abs(socialA - socialB) / 3;

    // 營銷預算相似度 (對數尺度)
    const budgetA = Math.log10(a.marketing_budget + 1);
    const budgetB = Math.log10(b.marketing_budget + 1);
    const maxBudget = Math.log10(50001); // 最大 50000
    const budgetDiff = Math.abs(budgetA - budgetB) / maxBudget;
    const budgetSim = 1 - budgetDiff;

    return socialSim * 0.5 + budgetSim * 0.5;
  }

  /**
   * 計算規模相似度
   */
  private calculateScaleSimilarity(
    a: { supply: number; holders: number; volume: number },
    b: { supply: number; holders: number; volume: number }
  ): number {
    // 使用對數尺度,因為數量級差異大
    const supplyA = Math.log10(a.supply);
    const supplyB = Math.log10(b.supply);
    const supplySim = 1 - Math.abs(supplyA - supplyB) / 3; // 假設最大差 3 個數量級

    const holdersA = Math.log10(a.holders + 1);
    const holdersB = Math.log10(b.holders + 1);
    const holdersSim = 1 - Math.abs(holdersA - holdersB) / 5; // 假設最大差 5 個數量級

    const volumeA = Math.log10(a.volume + 1);
    const volumeB = Math.log10(b.volume + 1);
    const volumeSim = 1 - Math.abs(volumeA - volumeB) / 7; // 假設最大差 7 個數量級

    return supplySim * 0.3 + holdersSim * 0.4 + volumeSim * 0.3;
  }

  // ============================================================================
  // 影響因子計算
  // ============================================================================

  /**
   * 計算五大影響因子
   */
  private calculateInfluenceFactors(coinInput: CoinInput): InfluenceFactors {
    // 1. 創作者因子 (聲譽 + 經驗)
    const creatorScore =
      coinInput.creator_reputation / 100 * 0.7 + Math.min(coinInput.creator_previous_coins / 10, 1) * 0.3;

    // 2. 營銷因子 (預算 + 渠道)
    const budgetScore = Math.min(coinInput.marketing_budget / 50000, 1); // 50k 為滿分
    const channelCount = [coinInput.has_website, coinInput.has_twitter, coinInput.has_telegram].filter(Boolean).length;
    const channelScore = channelCount / 3;
    const marketingScore = budgetScore * 0.6 + channelScore * 0.4;

    // 3. 社群因子 (持有者 + 交易量)
    const holdersScore = Math.min(Math.log10(coinInput.initial_holders + 1) / 5, 1); // log scale
    const volumeScore = Math.min(Math.log10(coinInput.initial_volume + 1) / 7, 1);
    const communityScore = holdersScore * 0.6 + volumeScore * 0.4;

    // 4. 時機因子 (市場趨勢 + 競爭程度)
    const trendScore = coinInput.market_trend === 'bull' ? 1 : coinInput.market_trend === 'sideways' ? 0.5 : 0;
    const competitionScore = 1 - coinInput.competition_level / 10; // 競爭越低越好
    const timingScore = trendScore * 0.7 + competitionScore * 0.3;

    // 5. 運氣因子 (隨機 0.3-0.7)
    const luckScore = 0.3 + Math.random() * 0.4;

    return {
      creator_score: creatorScore,
      marketing_score: marketingScore,
      community_score: communityScore,
      timing_score: timingScore,
      luck_score: luckScore,
    };
  }

  // ============================================================================
  // 命運軌跡預測
  // ============================================================================

  /**
   * 預測命運軌跡
   */
  private predictTrajectory(
    coinInput: CoinInput,
    similarCases: SimilarCase[],
    influenceFactors: InfluenceFactors
  ): FateTrajectory {
    // 1. 基於相似案例統計結果分布
    const baseProbs = this.calculateBaselineProbabilities(similarCases, coinInput.category);

    // 2. 根據影響因子調整概率
    const adjustedProbs = this.adjustProbabilitiesByInfluence(baseProbs, influenceFactors);

    // 3. 歸一化概率
    const totalProb = adjustedProbs.moon + adjustedProbs.stable + adjustedProbs.rug + adjustedProbs.slow_death;
    const normalizedProbs = {
      moon: adjustedProbs.moon / totalProb,
      stable: adjustedProbs.stable / totalProb,
      rug: adjustedProbs.rug / totalProb,
      slow_death: adjustedProbs.slow_death / totalProb,
    };

    // 4. 確定最可能的結果
    const predictedOutcome = this.getMostLikelyOutcome(normalizedProbs);

    // 5. 計算信心度
    const confidence = this.calculateConfidence(normalizedProbs, similarCases.length);

    // 6. 預測峰值時間和倍數
    const { expectedPeakDay, expectedMultiplier } = this.predictPeakMetrics(
      predictedOutcome,
      similarCases,
      influenceFactors
    );

    // 7. 評估風險等級
    const riskLevel = this.assessRiskLevel(normalizedProbs, influenceFactors);

    return {
      predicted_outcome: predictedOutcome,
      confidence,
      outcome_probabilities: normalizedProbs,
      expected_peak_day: expectedPeakDay,
      expected_max_multiplier: expectedMultiplier,
      risk_level: riskLevel,
    };
  }

  /**
   * 計算基準概率 (基於相似案例)
   */
  private calculateBaselineProbabilities(
    similarCases: SimilarCase[],
    category: CoinCategory
  ): Record<FateOutcome, number> {
    if (similarCases.length === 0) {
      // 沒有相似案例,使用類別統計平均值
      const rates = this.CATEGORY_SUCCESS_RATES[category];
      return {
        moon: rates.moon,
        stable: rates.stable,
        rug: 0.225, // 平均 rug 率
        slow_death: 1 - rates.moon - rates.stable - 0.225,
      };
    }

    // 基於相似案例的加權統計
    let moon = 0,
      stable = 0,
      rug = 0,
      slow_death = 0;
    let totalWeight = 0;

    for (const sc of similarCases) {
      const weight = sc.similarity_score; // 相似度作為權重
      totalWeight += weight;

      if (sc.case.outcome === 'moon') moon += weight;
      else if (sc.case.outcome === 'stable') stable += weight;
      else if (sc.case.outcome === 'rug') rug += weight;
      else if (sc.case.outcome === 'slow_death') slow_death += weight;
    }

    return {
      moon: moon / totalWeight,
      stable: stable / totalWeight,
      rug: rug / totalWeight,
      slow_death: slow_death / totalWeight,
    };
  }

  /**
   * 根據影響因子調整概率
   */
  private adjustProbabilitiesByInfluence(
    baseProbs: Record<FateOutcome, number>,
    factors: InfluenceFactors
  ): Record<FateOutcome, number> {
    // 計算綜合質量分數 (0-1)
    const qualityScore =
      factors.creator_score * 0.3 +
      factors.marketing_score * 0.25 +
      factors.community_score * 0.25 +
      factors.timing_score * 0.15 +
      factors.luck_score * 0.05;

    // 質量分數提升成功概率,降低失敗概率
    // 高質量 (>0.7): 大幅提升 moon/stable, 降低 rug/slow_death
    // 低質量 (<0.3): 大幅降低 moon/stable, 提升 rug/slow_death
    const successBoost = (qualityScore - 0.5) * 1.5; // -0.75 到 +0.75

    return {
      moon: Math.max(0.01, baseProbs.moon * (1 + successBoost * 1.2)), // moon 受質量影響最大
      stable: Math.max(0.01, baseProbs.stable * (1 + successBoost * 0.8)),
      rug: Math.max(0.01, baseProbs.rug * (1 - successBoost * 0.6)),
      slow_death: Math.max(0.01, baseProbs.slow_death * (1 - successBoost * 0.4)),
    };
  }

  /**
   * 獲取最可能的結果
   */
  private getMostLikelyOutcome(probs: Record<FateOutcome, number>): FateOutcome {
    const entries = Object.entries(probs) as [FateOutcome, number][];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }

  /**
   * 計算預測信心度
   */
  private calculateConfidence(probs: Record<FateOutcome, number>, numSimilarCases: number): number {
    // 1. 概率分佈的確定性 (最高概率與第二高概率的差距)
    const sortedProbs = Object.values(probs).sort((a, b) => b - a);
    const certainty = sortedProbs[0] - sortedProbs[1]; // 0-1

    // 2. 相似案例數量 (越多越可信)
    const caseConfidence = Math.min(numSimilarCases / 20, 1); // 20 個案例為滿分

    // 綜合信心度
    return certainty * 0.6 + caseConfidence * 0.4;
  }

  /**
   * 預測峰值指標
   */
  private predictPeakMetrics(
    predictedOutcome: FateOutcome,
    similarCases: SimilarCase[],
    factors: InfluenceFactors
  ): { expectedPeakDay: number; expectedMultiplier: number } {
    // 從相似案例中統計平均值
    const relevantCases = similarCases.filter((sc) => sc.case.outcome === predictedOutcome);

    if (relevantCases.length === 0) {
      // 使用默認值
      const defaults: Record<FateOutcome, { days: number; multiplier: number }> = {
        moon: { days: 30, multiplier: 500 },
        stable: { days: 60, multiplier: 10 },
        rug: { days: 7, multiplier: 2 },
        slow_death: { days: 90, multiplier: 0.5 },
      };
      return {
        expectedPeakDay: defaults[predictedOutcome].days,
        expectedMultiplier: defaults[predictedOutcome].multiplier,
      };
    }

    // 加權平均
    let totalDays = 0,
      totalMultiplier = 0,
      totalWeight = 0;
    for (const sc of relevantCases) {
      const weight = sc.similarity_score;
      totalWeight += weight;
      totalDays += sc.case.days_to_peak * weight;
      totalMultiplier += (sc.case.max_price / sc.case.initial_price) * weight;
    }

    const avgDays = Math.round(totalDays / totalWeight);
    const avgMultiplier = totalMultiplier / totalWeight;

    // 根據影響因子調整
    const qualityScore =
      factors.creator_score * 0.3 +
      factors.marketing_score * 0.25 +
      factors.community_score * 0.25 +
      factors.timing_score * 0.15 +
      factors.luck_score * 0.05;

    const adjustedMultiplier = avgMultiplier * (0.7 + qualityScore * 0.6); // 質量提升倍數

    return {
      expectedPeakDay: avgDays,
      expectedMultiplier: Math.round(adjustedMultiplier * 100) / 100,
    };
  }

  /**
   * 評估風險等級
   */
  private assessRiskLevel(
    probs: Record<FateOutcome, number>,
    factors: InfluenceFactors
  ): 'low' | 'medium' | 'high' | 'extreme' {
    // 失敗概率
    const failureProb = probs.rug + probs.slow_death;

    // 綜合質量分數
    const qualityScore =
      factors.creator_score * 0.3 +
      factors.marketing_score * 0.25 +
      factors.community_score * 0.25 +
      factors.timing_score * 0.15 +
      factors.luck_score * 0.05;

    // 綜合風險評分
    const riskScore = failureProb * 0.7 + (1 - qualityScore) * 0.3;

    if (riskScore < 0.3) return 'low';
    if (riskScore < 0.5) return 'medium';
    if (riskScore < 0.7) return 'high';
    return 'extreme';
  }

  // ============================================================================
  // 建議和警告生成
  // ============================================================================

  /**
   * 生成投資建議
   */
  private generateRecommendations(
    coinInput: CoinInput,
    trajectory: FateTrajectory,
    factors: InfluenceFactors
  ): string[] {
    const recommendations: string[] = [];

    // 基於預測結果
    if (trajectory.predicted_outcome === 'moon') {
      recommendations.push(`🚀 高潛力項目！預測有 ${(trajectory.outcome_probabilities.moon * 100).toFixed(1)}% 概率飛月`);
      recommendations.push(`預期峰值: ${trajectory.expected_peak_day} 天內達到 ${trajectory.expected_max_multiplier}x`);
    } else if (trajectory.predicted_outcome === 'stable') {
      recommendations.push(`✅ 穩健項目,預計穩定增長 ${trajectory.expected_max_multiplier}x`);
    } else if (trajectory.predicted_outcome === 'rug') {
      recommendations.push(`⚠️ 高風險項目！有 ${(trajectory.outcome_probabilities.rug * 100).toFixed(1)}% 概率為跑路盤`);
    } else {
      recommendations.push(`💀 不推薦投資,預計逐漸衰落`);
    }

    // 基於類別統計
    const categoryRates = this.CATEGORY_SUCCESS_RATES[coinInput.category];
    const categorySuccessRate = (categoryRates.moon + categoryRates.stable) * 100;
    recommendations.push(`📊 ${coinInput.category} 類別歷史成功率: ${categorySuccessRate.toFixed(1)}%`);

    // 基於影響因子
    if (factors.creator_score > 0.7) {
      recommendations.push(`👤 創作者質量優秀 (${(factors.creator_score * 100).toFixed(0)}/100)`);
    } else if (factors.creator_score < 0.3) {
      recommendations.push(`⚠️ 創作者聲譽較低,需謹慎`);
    }

    if (factors.marketing_score > 0.6) {
      recommendations.push(`📢 營銷資源充足`);
    } else if (factors.marketing_score < 0.3) {
      recommendations.push(`⚠️ 營銷投入不足,可能影響傳播`);
    }

    if (factors.timing_score > 0.7) {
      recommendations.push(`⏰ 市場時機絕佳`);
    } else if (factors.timing_score < 0.3) {
      recommendations.push(`⚠️ 市場環境不利`);
    }

    return recommendations;
  }

  /**
   * 生成風險警告
   */
  private generateWarnings(coinInput: CoinInput, trajectory: FateTrajectory): string[] {
    const warnings: string[] = [];

    // 風險等級警告
    if (trajectory.risk_level === 'extreme') {
      warnings.push(`🚨 極高風險！失敗概率超過 70%`);
    } else if (trajectory.risk_level === 'high') {
      warnings.push(`⚠️ 高風險項目,失敗概率 50-70%`);
    }

    // Rug 風險
    if (trajectory.outcome_probabilities.rug > 0.3) {
      warnings.push(`🚨 跑路風險警告: ${(trajectory.outcome_probabilities.rug * 100).toFixed(1)}% 概率`);
    }

    // 缺乏基本要素
    if (!coinInput.has_website && !coinInput.has_twitter && !coinInput.has_telegram) {
      warnings.push(`🚨 無任何社交媒體或網站,極高風險`);
    }

    // 新手創作者
    if (coinInput.creator_reputation < 30 && coinInput.creator_previous_coins === 0) {
      warnings.push(`⚠️ 新手創作者,無發幣經驗`);
    }

    // 熊市預警
    if (coinInput.market_trend === 'bear') {
      warnings.push(`📉 當前處於熊市,整體環境不利`);
    }

    // 高競爭環境
    if (coinInput.competition_level >= 8) {
      warnings.push(`⚠️ 市場競爭激烈,突圍困難`);
    }

    // Food/Random 類別警告
    if (coinInput.category === 'food' || coinInput.category === 'random') {
      warnings.push(`⚠️ ${coinInput.category} 類別歷史表現較差,成功率不足 40%`);
    }

    return warnings;
  }

  /**
   * 計算綜合質量分數
   */
  private calculateQualityScore(factors: InfluenceFactors): number {
    return (
      factors.creator_score * 0.3 +
      factors.marketing_score * 0.25 +
      factors.community_score * 0.25 +
      factors.timing_score * 0.15 +
      factors.luck_score * 0.05
    );
  }

  // ============================================================================
  // 用戶決策影響系統
  // ============================================================================

  /**
   * 應用用戶決策並計算對命運的影響
   */
  async applyDecision(
    coinInput: CoinInput,
    currentPrediction: FatePrediction,
    decision: UserDecision
  ): Promise<DecisionImpact> {
    // 1. 計算決策對影響因子的改變
    const influenceChange = this.calculateDecisionInfluence(decision, coinInput);

    // 2. 計算新的影響因子
    const newInfluenceFactors: InfluenceFactors = {
      creator_score: Math.min(
        1,
        currentPrediction.influence_factors.creator_score + (influenceChange.creator_score || 0)
      ),
      marketing_score: Math.min(
        1,
        currentPrediction.influence_factors.marketing_score + (influenceChange.marketing_score || 0)
      ),
      community_score: Math.min(
        1,
        currentPrediction.influence_factors.community_score + (influenceChange.community_score || 0)
      ),
      timing_score: Math.min(
        1,
        currentPrediction.influence_factors.timing_score + (influenceChange.timing_score || 0)
      ),
      luck_score: Math.min(
        1,
        currentPrediction.influence_factors.luck_score + (influenceChange.luck_score || 0)
      ),
    };

    // 3. 基於新影響因子重新預測軌跡
    const updatedTrajectory = this.predictTrajectory(
      coinInput,
      currentPrediction.similar_cases,
      newInfluenceFactors
    );

    // 4. 生成決策觸發的隨機事件
    const triggeredEvents = this.randomEventEngine.generateDecisionTriggeredEvents(
      decision.decision_type,
      decision.investment_amount || 0
    );

    // 5. 應用事件影響
    if (triggeredEvents.length > 0) {
      const adjustedProbs = this.randomEventEngine.applyEventsToOutcome(
        updatedTrajectory.outcome_probabilities,
        triggeredEvents
      );
      updatedTrajectory.outcome_probabilities = adjustedProbs;

      // 重新確定最高概率的結果
      const maxProb = Math.max(...Object.values(adjustedProbs));
      const predictedOutcome = Object.entries(adjustedProbs).find(
        ([_, prob]) => prob === maxProb
      )?.[0] as FateOutcome;

      if (predictedOutcome) {
        updatedTrajectory.predicted_outcome = predictedOutcome;
        updatedTrajectory.confidence = maxProb;
      }
    }

    return {
      decision,
      influence_change: influenceChange,
      trajectory_update: updatedTrajectory,
      new_events: triggeredEvents,
    };
  }

  /**
   * 計算決策對影響因子的改變
   */
  private calculateDecisionInfluence(
    decision: UserDecision,
    coinInput: CoinInput
  ): Partial<InfluenceFactors> {
    const changes: Partial<InfluenceFactors> = {};

    switch (decision.decision_type) {
      case 'increase_marketing':
        // 增加營銷預算 -> 提升 marketing_score
        const budgetIncrease = decision.investment_amount || 0;
        changes.marketing_score = Math.min(0.2, budgetIncrease / 50000); // 最多 +0.2
        break;

      case 'build_community':
        // 建設社群 -> 提升 community_score
        changes.community_score = 0.15;
        changes.marketing_score = 0.05; // 間接提升營銷
        break;

      case 'add_features':
        // 添加功能 -> 提升 creator_score (顯示能力)
        changes.creator_score = 0.1;
        changes.community_score = 0.05; // 增加社群活躍度
        break;

      case 'celebrity_endorsement':
        // 名人背書 -> 大幅提升 marketing 和 community
        const endorsementCost = decision.investment_amount || 0;
        if (endorsementCost >= 10000) {
          changes.marketing_score = 0.25;
          changes.community_score = 0.2;
          changes.creator_score = 0.1; // 聲譽提升
        } else {
          changes.marketing_score = 0.15;
          changes.community_score = 0.1;
        }
        break;

      case 'partner_collaboration':
        // 合作夥伴 -> 提升 creator_score 和 timing_score
        changes.creator_score = 0.12;
        changes.timing_score = 0.08;
        changes.community_score = 0.05;
        break;

      case 'hold':
        // 持有不動 -> 小幅提升 timing (耐心等待)
        changes.timing_score = 0.03;
        break;

      case 'sell':
        // 賣出 -> 降低所有因子 (放棄項目)
        changes.creator_score = -0.1;
        changes.marketing_score = -0.15;
        changes.community_score = -0.2;
        break;
    }

    return changes;
  }
}
