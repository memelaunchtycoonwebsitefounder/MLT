/**
 * User Decision Points API
 * 用户决策点 API
 */

import { Hono } from 'hono';
import type { Env } from '../types';

const decisions = new Hono<{ Bindings: Env }>();

// GET /api/decisions/:coinId/pending - 获取待决策的选项
decisions.get('/:coinId/pending', async (c) => {
  try {
    const coinId = parseInt(c.req.param('coinId'));
    
    // 获取所有未过期且未选择的决策点
    const result = await c.env.DB.prepare(`
      SELECT * FROM decision_points 
      WHERE coin_id = ? 
        AND status = 'pending' 
        AND (expires_at IS NULL OR expires_at > datetime('now'))
      ORDER BY triggered_at DESC
      LIMIT 1
    `).bind(coinId).first();

    return c.json({
      success: true,
      data: result || null,
    });
  } catch (error) {
    console.error('Error fetching pending decisions:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// POST /api/decisions/:decisionId/choose - 用户做出选择
decisions.post('/:decisionId/choose', async (c) => {
  try {
    const decisionId = parseInt(c.req.param('decisionId'));
    const { option, userId, coinId } = await c.req.json();

    if (!option || !['A', 'B'].includes(option)) {
      return c.json({ success: false, error: 'Invalid option' }, 400);
    }

    // 获取决策点信息
    const decision = await c.env.DB.prepare(
      'SELECT * FROM decision_points WHERE id = ? AND status = \'pending\''
    ).bind(decisionId).first() as any;

    if (!decision) {
      return c.json({ success: false, error: 'Decision not found or already decided' }, 404);
    }

    // 检查是否过期
    if (decision.expires_at && new Date(decision.expires_at) < new Date()) {
      await c.env.DB.prepare(
        'UPDATE decision_points SET status = \'expired\' WHERE id = ?'
      ).bind(decisionId).run();
      return c.json({ success: false, error: 'Decision expired' }, 410);
    }

    // 更新决策点状态
    await c.env.DB.prepare(`
      UPDATE decision_points 
      SET status = 'chosen', 
          chosen_option = ?,
          decided_at = datetime('now')
      WHERE id = ?
    `).bind(option, decisionId).run();

    // 记录用户决策历史
    if (userId && coinId) {
      await c.env.DB.prepare(`
        INSERT INTO user_decision_history (user_id, coin_id, decision_point_id, chosen_option)
        VALUES (?, ?, ?, ?)
      `).bind(userId, coinId, decisionId, option).run();
    }

    // 应用决策影响到价格
    const impact = option === 'A' ? decision.option_a_impact : decision.option_b_impact;
    const effect = option === 'A' ? decision.option_a_effect : decision.option_b_effect;
    
    // 获取当前币的模拟状态
    const simulation = await c.env.DB.prepare(
      'SELECT * FROM coin_simulations WHERE coin_id = ?'
    ).bind(decision.coin_id).first() as any;

    if (simulation) {
      const currentPrice = simulation.current_price || simulation.initial_price;
      const newPrice = currentPrice * (1 + impact);

      // 更新模拟价格
      await c.env.DB.prepare(
        'UPDATE coin_simulations SET current_price = ? WHERE coin_id = ?'
      ).bind(newPrice, decision.coin_id).run();

      // 添加价格历史记录
      await c.env.DB.prepare(`
        INSERT INTO price_history (coin_id, price, volume, market_cap)
        VALUES (?, ?, ?, ?)
      `).bind(decision.coin_id, newPrice, 0, newPrice * 10000).run();

      // 添加事件记录
      await c.env.DB.prepare(`
        INSERT INTO simulation_events (coin_id, event_type, event_name, description, impact)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        decision.coin_id,
        'user_decision',
        decision.title,
        `User chose: ${option === 'A' ? decision.option_a_text : decision.option_b_text}. ${effect}`,
        impact
      ).run();
    }

    return c.json({
      success: true,
      data: {
        decisionId,
        chosenOption: option,
        effect,
        impact,
        newPrice: simulation ? simulation.current_price * (1 + impact) : null,
      },
    });
  } catch (error) {
    console.error('Error making decision:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// GET /api/decisions/:coinId/history - 获取历史决策
decisions.get('/:coinId/history', async (c) => {
  try {
    const coinId = parseInt(c.req.param('coinId'));
    
    const result = await c.env.DB.prepare(`
      SELECT * FROM decision_points 
      WHERE coin_id = ? 
      ORDER BY triggered_at DESC
      LIMIT 20
    `).bind(coinId).all();

    return c.json({
      success: true,
      data: result.results || [],
    });
  } catch (error) {
    console.error('Error fetching decision history:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

export default decisions;
