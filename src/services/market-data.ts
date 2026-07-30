/**
 * Market Data Service - 即時市場數據模擬服務
 * 提供價格、交易量、市場趨勢等實時數據
 */

export interface MarketSnapshot {
  timestamp: string;
  global_trend: 'bull' | 'bear' | 'sideways';
  total_market_cap: number;
  total_volume_24h: number;
  active_traders: number;
  trending_categories: {
    category: string;
    growth_rate: number;
    volume_change: number;
  }[];
}

export interface CoinMarketData {
  coin_symbol: string;
  current_price: number;
  price_change_24h: number;
  volume_24h: number;
  market_cap: number;
  holder_count: number;
  liquidity: number;
  social_sentiment: number; // -1 到 1
  momentum_score: number; // 0 到 100
}

export interface MarketTrendAnalysis {
  trend: 'bull' | 'bear' | 'sideways';
  confidence: number;
  duration_days: number;
  predicted_next_trend: 'bull' | 'bear' | 'sideways';
  key_indicators: {
    indicator: string;
    value: number;
    signal: 'positive' | 'negative' | 'neutral';
  }[];
}

export class MarketDataService {
  private static instance: MarketDataService;
  private currentSnapshot: MarketSnapshot | null = null;
  private lastUpdate: number = 0;
  private updateInterval: number = 60000; // 1 minute

  private constructor() {
    this.initializeSnapshot();
  }

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  /**
   * 初始化市場快照
   */
  private initializeSnapshot(): void {
    this.currentSnapshot = {
      timestamp: new Date().toISOString(),
      global_trend: this.randomTrend(),
      total_market_cap: this.randomInRange(1000000000, 5000000000),
      total_volume_24h: this.randomInRange(50000000, 200000000),
      active_traders: Math.floor(this.randomInRange(10000, 50000)),
      trending_categories: this.generateTrendingCategories(),
    };
    this.lastUpdate = Date.now();
  }

  /**
   * 獲取全局市場快照
   */
  getMarketSnapshot(): MarketSnapshot {
    // 如果超過更新間隔，刷新數據
    if (Date.now() - this.lastUpdate > this.updateInterval) {
      this.updateSnapshot();
    }
    return this.currentSnapshot!;
  }

  /**
   * 更新市場快照（模擬實時變化）
   */
  private updateSnapshot(): void {
    if (!this.currentSnapshot) {
      this.initializeSnapshot();
      return;
    }

    // 市場趨勢有 10% 機率變化
    if (Math.random() < 0.1) {
      this.currentSnapshot.global_trend = this.randomTrend();
    }

    // 市值和交易量波動 ±5%
    this.currentSnapshot.total_market_cap *= this.randomInRange(0.95, 1.05);
    this.currentSnapshot.total_volume_24h *= this.randomInRange(0.95, 1.05);
    this.currentSnapshot.active_traders = Math.floor(
      this.currentSnapshot.active_traders * this.randomInRange(0.98, 1.02)
    );

    // 更新熱門類別
    this.currentSnapshot.trending_categories = this.generateTrendingCategories();
    this.currentSnapshot.timestamp = new Date().toISOString();
    this.lastUpdate = Date.now();
  }

  /**
   * 獲取特定幣種的市場數據
   */
  getCoinMarketData(coinSymbol: string, category: string): CoinMarketData {
    const snapshot = this.getMarketSnapshot();
    
    // 基於類別和全局趨勢生成數據
    const trendingCat = snapshot.trending_categories.find((c) => c.category === category);
    const categoryBoost = trendingCat ? trendingCat.growth_rate : 0;

    const trendMultiplier = {
      bull: 1.3,
      sideways: 1.0,
      bear: 0.7,
    }[snapshot.global_trend];

    return {
      coin_symbol: coinSymbol,
      current_price: this.randomInRange(0.00001, 1) * trendMultiplier,
      price_change_24h: (this.randomInRange(-30, 50) + categoryBoost) * trendMultiplier,
      volume_24h: this.randomInRange(1000, 1000000) * trendMultiplier,
      market_cap: this.randomInRange(10000, 10000000) * trendMultiplier,
      holder_count: Math.floor(this.randomInRange(100, 50000)),
      liquidity: this.randomInRange(5000, 500000) * trendMultiplier,
      social_sentiment: this.randomInRange(-1, 1),
      momentum_score: Math.min(100, this.randomInRange(0, 100) + categoryBoost),
    };
  }

  /**
   * 分析市場趨勢
   */
  analyzeTrend(): MarketTrendAnalysis {
    const snapshot = this.getMarketSnapshot();
    
    const indicators = [
      {
        indicator: 'Volume Momentum',
        value: this.randomInRange(40, 90),
        signal: snapshot.global_trend === 'bull' ? 'positive' : 'negative',
      },
      {
        indicator: 'Market Cap Growth',
        value: this.randomInRange(-10, 30),
        signal: snapshot.global_trend === 'bear' ? 'negative' : 'positive',
      },
      {
        indicator: 'Active Traders',
        value: snapshot.active_traders,
        signal: snapshot.active_traders > 30000 ? 'positive' : 'neutral',
      },
      {
        indicator: 'Social Sentiment',
        value: this.randomInRange(-50, 50),
        signal: snapshot.global_trend === 'bull' ? 'positive' : 'negative',
      },
    ];

    // 預測下一個趨勢（基於當前趨勢的轉換概率）
    let predictedNext: 'bull' | 'bear' | 'sideways';
    const rand = Math.random();
    
    if (snapshot.global_trend === 'bull') {
      predictedNext = rand < 0.6 ? 'bull' : rand < 0.9 ? 'sideways' : 'bear';
    } else if (snapshot.global_trend === 'bear') {
      predictedNext = rand < 0.6 ? 'bear' : rand < 0.9 ? 'sideways' : 'bull';
    } else {
      predictedNext = rand < 0.4 ? 'bull' : rand < 0.8 ? 'sideways' : 'bear';
    }

    return {
      trend: snapshot.global_trend,
      confidence: this.randomInRange(0.6, 0.95),
      duration_days: Math.floor(this.randomInRange(3, 30)),
      predicted_next_trend: predictedNext,
      key_indicators: indicators as any,
    };
  }

  /**
   * 獲取類別趨勢數據
   */
  getCategoryTrends(): { category: string; trend: string; strength: number }[] {
    const categories = ['celebrity', 'meme', 'animal', 'tech', 'random', 'food'];
    const snapshot = this.getMarketSnapshot();

    return categories.map((cat) => {
      const trending = snapshot.trending_categories.find((c) => c.category === cat);
      const growthRate = trending?.growth_rate || this.randomInRange(-20, 20);

      let trend: string;
      if (growthRate > 10) trend = 'strong_bull';
      else if (growthRate > 0) trend = 'bull';
      else if (growthRate > -10) trend = 'sideways';
      else trend = 'bear';

      return {
        category: cat,
        trend,
        strength: Math.abs(growthRate),
      };
    });
  }

  // ===== Helper Methods =====

  private randomTrend(): 'bull' | 'bear' | 'sideways' {
    const rand = Math.random();
    if (rand < 0.35) return 'bull';
    if (rand < 0.7) return 'sideways';
    return 'bear';
  }

  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private generateTrendingCategories() {
    const categories = ['celebrity', 'meme', 'animal', 'tech', 'random', 'food'];
    const shuffled = categories.sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, 3).map((cat) => ({
      category: cat,
      growth_rate: this.randomInRange(-20, 50),
      volume_change: this.randomInRange(-30, 100),
    }));
  }
}
