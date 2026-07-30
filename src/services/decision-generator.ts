/**
 * Decision Point Generator
 * 决策点生成器 - 在关键时刻创建用户选择
 */

import type { D1Database } from '@cloudflare/workers-types';

export class DecisionPointGenerator {
  constructor(private db: D1Database) {}

  /**
   * 决策模板库
   */
  private readonly DECISION_TEMPLATES = {
    whale_offer: {
      early: {
        title: '🐋 Early Whale Interest',
        description: 'A whale noticed your coin and wants to buy 20% of supply. Quick pump but risky!',
        optionA: { text: 'Accept - Quick +25% pump', effect: 'Price pumps but whale controls supply', impact: 0.25 },
        optionB: { text: 'Reject - Organic growth', effect: 'Slower but healthier growth', impact: 0.05 },
      },
      mid: {
        title: '🐳 Whale Partnership Offer',
        description: 'A famous crypto whale offers to promote your coin on social media',
        optionA: { text: 'Accept - Massive exposure', effect: '+40% price, huge volume', impact: 0.40 },
        optionB: { text: 'Decline - Stay independent', effect: 'Community respects authenticity', impact: 0.08 },
      },
    },
    
    rug_warning: {
      title: '⚠️ Suspicious Wallet Activity',
      description: 'Large wallet is accumulating tokens. Could be a whale or potential rug pull setup',
      optionA: { text: 'Alert Community - Transparency', effect: 'Trust +10%, price stable', impact: 0.02 },
      optionB: { text: 'Ignore - Let it play out', effect: 'Risky, could pump or dump', impact: 0 },
    },
    
    viral_opportunity: {
      title: '🔥 Viral Marketing Opportunity',
      description: 'An influencer with 500K followers offers to promote your coin for $5000',
      optionA: { text: 'Pay for promotion', effect: 'Viral exposure, +50% price spike', impact: 0.50 },
      optionB: { text: 'Organic growth only', effect: 'Save money, slower growth', impact: 0.03 },
    },
    
    fud_crisis: {
      title: '💀 FUD Attack!',
      description: 'Someone is spreading FUD about your coin on Twitter. Community is panicking!',
      optionA: { text: 'Fight back - Make statement', effect: 'Defend reputation, -5% dip', impact: -0.05 },
      optionB: { text: 'Ignore - Let it pass', effect: 'FUD spreads, -15% dump', impact: -0.15 },
    },
    
    partnership: {
      title: '🤝 Partnership Proposal',
      description: 'Another successful meme coin wants to partner for cross-promotion',
      optionA: { text: 'Accept partnership', effect: 'Access to their community, +20%', impact: 0.20 },
      optionB: { text: 'Stay solo -独立发展', effect: 'Keep unique identity', impact: 0.05 },
    },
    
    liquidity_choice: {
      title: '🔒 Liquidity Lock Decision',
      description: 'Should you lock liquidity for 6 months to build trust?',
      optionA: { text: 'Lock liquidity - Trust boost', effect: 'Community trusts you, +30%', impact: 0.30 },
      optionB: { text: 'Keep flexible', effect: 'More control, but less trust', impact: 0.05 },
    },
    
    community_vote: {
      title: '🗳️ Community Governance',
      description: 'Community wants a vote: Should we burn 10% of supply or airdrop to holders?',
      optionA: { text: 'Burn tokens - Deflationary', effect: 'Scarcity increases, +25%', impact: 0.25 },
      optionB: { text: 'Airdrop - Reward holders', effect: 'Holder loyalty increases', impact: 0.15 },
    },
  };

  /**
   * 检查是否应该触发决策点
   */
  async shouldTriggerDecision(coinId: number): Promise<boolean> {
    // 获取模拟状态
    const simulation = await this.db.prepare(
      'SELECT * FROM coin_simulations WHERE coin_id = ?'
    ).bind(coinId).first() as any;

    if (!simulation) return false;

    // 获取最近的决策点
    const lastDecision = await this.db.prepare(
      'SELECT * FROM decision_points WHERE coin_id = ? ORDER BY triggered_at DESC LIMIT 1'
    ).bind(coinId).first() as any;

    // 至少间隔5分钟
    if (lastDecision) {
      const timeSinceLastDecision = Date.now() - new Date(lastDecision.triggered_at).getTime();
      if (timeSinceLastDecision < 5 * 60 * 1000) return false;
    }

    // 基于当前进度和命运的概率
    const progress = simulation.current_day / simulation.total_days;
    const fate = simulation.fate_outcome;

    // 不同命运不同触发概率
    const triggerChance = {
      moon: progress < 0.3 ? 0.3 : 0.5,      // moon: 早期和中期都有机会
      stable: progress > 0.2 ? 0.4 : 0.2,    // stable: 中后期更多决策
      rug: progress < 0.5 ? 0.6 : 0.3,       // rug: 早期警告信号多
      slow_death: progress > 0.3 ? 0.5 : 0.2, // slow_death: 中后期挣扎
    };

    return Math.random() < (triggerChance[fate as keyof typeof triggerChance] || 0.3);
  }

  /**
   * 生成决策点
   */
  async generateDecision(coinId: number): Promise<any> {
    const simulation = await this.db.prepare(
      'SELECT * FROM coin_simulations WHERE coin_id = ?'
    ).bind(coinId).first() as any;

    if (!simulation) return null;

    const progress = simulation.current_day / simulation.total_days;
    const fate = simulation.fate_outcome;

    // 根据进度选择决策类型
    let decisionType: string;
    let template: any;

    if (progress < 0.3) {
      // 早期决策
      const earlyTypes = ['whale_offer', 'liquidity_choice', 'partnership'];
      decisionType = earlyTypes[Math.floor(Math.random() * earlyTypes.length)];
      template = decisionType === 'whale_offer' 
        ? this.DECISION_TEMPLATES.whale_offer.early
        : this.DECISION_TEMPLATES[decisionType as keyof typeof this.DECISION_TEMPLATES];
    } else if (progress < 0.7) {
      // 中期决策
      const midTypes = ['viral_opportunity', 'fud_crisis', 'community_vote'];
      decisionType = midTypes[Math.floor(Math.random() * midTypes.length)];
      template = this.DECISION_TEMPLATES[decisionType as keyof typeof this.DECISION_TEMPLATES];
    } else {
      // 后期决策
      const lateTypes = ['rug_warning', 'partnership'];
      decisionType = lateTypes[Math.floor(Math.random() * lateTypes.length)];
      template = this.DECISION_TEMPLATES[decisionType as keyof typeof this.DECISION_TEMPLATES];
    }

    // 针对 rug 命运的特殊处理
    if (fate === 'rug' && progress > 0.4) {
      decisionType = 'rug_warning';
      template = this.DECISION_TEMPLATES.rug_warning;
    }

    // 插入决策点
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10分钟后过期

    const result = await this.db.prepare(`
      INSERT INTO decision_points (
        coin_id, decision_type, title, description,
        option_a_text, option_a_effect, option_a_impact,
        option_b_text, option_b_effect, option_b_impact,
        expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      coinId,
      decisionType,
      template.title,
      template.description,
      template.optionA.text,
      template.optionA.effect,
      template.optionA.impact,
      template.optionB.text,
      template.optionB.effect,
      template.optionB.impact,
      expiresAt
    ).run();

    return {
      decisionId: result.meta.last_row_id,
      decisionType,
      ...template,
      expiresAt,
    };
  }
}
