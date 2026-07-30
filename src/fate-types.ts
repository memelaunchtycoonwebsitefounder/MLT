/**
 * Fate System Type Definitions
 * 命運系統類型定義
 */

// ============================================================================
// 基礎類型
// ============================================================================

/**
 * 幣種類別
 */
export type CoinCategory = 'animal' | 'food' | 'meme' | 'tech' | 'celebrity' | 'random';

/**
 * 市場趨勢
 */
export type MarketTrend = 'bull' | 'bear' | 'sideways';

/**
 * 命運結果類型
 */
export type FateOutcome = 'moon' | 'stable' | 'rug' | 'slow_death';

/**
 * 幣種狀態
 */
export type CoinStatus = 'active' | 'dead';

// ============================================================================
// 輸入數據結構
// ============================================================================

/**
 * 新幣輸入數據
 */
export interface CoinInput {
  coin_name: string;
  coin_symbol: string;
  initial_supply: number;
  initial_price: number;
  category: CoinCategory;
  creator_reputation: number; // 0-100
  creator_previous_coins: number; // 創作者之前發行的幣數量
  market_trend: MarketTrend;
  competition_level: number; // 1-10, 當前市場競爭程度
  has_website: boolean;
  has_twitter: boolean;
  has_telegram: boolean;
  marketing_budget: number; // USD
  initial_holders: number;
  initial_volume: number;
}

// ============================================================================
// 歷史案例結構
// ============================================================================

/**
 * 歷史案例完整數據
 */
export interface HistoricalCase {
  id: number;
  coin_name: string;
  coin_symbol: string;
  initial_supply: number;
  initial_price: number;
  category: CoinCategory;
  creator_reputation: number;
  creator_previous_coins: number;
  market_trend: MarketTrend;
  competition_level: number;
  has_website: number; // SQLite boolean (0/1)
  has_twitter: number;
  has_telegram: number;
  marketing_budget: number;
  initial_holders: number;
  initial_volume: number;
  first_week_growth: number;
  outcome: FateOutcome;
  max_price: number;
  max_market_cap: number;
  days_to_peak: number;
  final_status: CoinStatus;
  created_at: string;
}

// ============================================================================
// 相似度匹配結果
// ============================================================================

/**
 * 相似案例及相似度分數
 */
export interface SimilarCase {
  case: HistoricalCase;
  similarity_score: number; // 0-1, 相似度分數
  feature_scores: {
    category_match: number; // 類別匹配 (0 或 1)
    creator_similarity: number; // 創作者質量相似度
    market_similarity: number; // 市場環境相似度
    resource_similarity: number; // 資源投入相似度
    scale_similarity: number; // 規模相似度
  };
}

// ============================================================================
// 影響因子
// ============================================================================

/**
 * 五大影響因子分數
 */
export interface InfluenceFactors {
  creator_score: number; // 0-1, 創作者因子
  marketing_score: number; // 0-1, 營銷因子
  community_score: number; // 0-1, 社群因子
  timing_score: number; // 0-1, 時機因子
  luck_score: number; // 0-1, 運氣因子 (隨機)
}

// ============================================================================
// 命運預測結果
// ============================================================================

/**
 * 命運軌跡預測
 */
export interface FateTrajectory {
  predicted_outcome: FateOutcome;
  confidence: number; // 0-1, 預測信心度
  outcome_probabilities: {
    moon: number; // 0-1
    stable: number;
    rug: number;
    slow_death: number;
  };
  expected_peak_day: number; // 預計達到峰值的天數
  expected_max_multiplier: number; // 預計最大價格倍數
  risk_level: 'low' | 'medium' | 'high' | 'extreme';
}

/**
 * 完整命運預測結果
 */
export interface FatePrediction {
  coin_input: CoinInput;
  trajectory: FateTrajectory;
  influence_factors: InfluenceFactors;
  similar_cases: SimilarCase[]; // 前 10 個最相似案例
  recommendations: string[]; // 投資建議
  warnings: string[]; // 風險警告
  quality_score: number; // 0-1, 綜合質量分數
  predicted_at: string; // ISO timestamp
}

// ============================================================================
// 用戶決策與互動
// ============================================================================

/**
 * 用戶決策類型
 */
export type UserDecisionType = 
  | 'increase_marketing' // 增加營銷預算
  | 'build_community' // 建設社群
  | 'add_features' // 添加功能
  | 'celebrity_endorsement' // 尋求名人背書
  | 'partner_collaboration' // 合作夥伴
  | 'hold' // 持有不動
  | 'sell'; // 賣出

/**
 * 用戶決策
 */
export interface UserDecision {
  coin_id: number;
  decision_type: UserDecisionType;
  investment_amount?: number; // 投資金額 (如適用)
  description?: string;
  decided_at: string;
}

/**
 * 決策影響結果
 */
export interface DecisionImpact {
  decision: UserDecision;
  influence_change: Partial<InfluenceFactors>; // 因子變化
  trajectory_update: Partial<FateTrajectory>; // 軌跡更新
  new_events: RandomEvent[]; // 觸發的新事件
}

// ============================================================================
// 隨機事件
// ============================================================================

/**
 * 隨機事件類型
 */
export type RandomEventType = 
  | 'whale_buy' // 巨鯨買入
  | 'whale_sell' // 巨鯨賣出
  | 'exchange_listing' // 交易所上架
  | 'hack' // 黑客攻擊
  | 'regulation' // 監管政策
  | 'viral_tweet' // 推文爆紅
  | 'celebrity_mention' // 名人提及
  | 'competitor_launch' // 競爭對手推出
  | 'tech_breakthrough' // 技術突破
  | 'scandal'; // 醜聞

/**
 * 隨機事件
 */
export interface RandomEvent {
  id?: number;
  event_type: RandomEventType;
  event_name: string;
  description: string;
  impact_on_outcome: number; // -1 到 1, 對結果的影響
  probability: number; // 0-1, 發生概率
  triggered_at?: string;
}

// ============================================================================
// 數據庫綁定 (Cloudflare D1)
// ============================================================================

/**
 * Cloudflare 環境綁定
 */
export interface Env {
  DB: D1Database;
}

// ============================================================================
// FateEngine 配置
// ============================================================================

/**
 * FateEngine 配置選項
 */
export interface FateEngineConfig {
  similarity_threshold: number; // 相似度閾值 (0-1)
  max_similar_cases: number; // 返回最多相似案例數
  random_event_enabled: boolean; // 是否啟用隨機事件
  confidence_boost_factor: number; // 信心度提升因子
}
