/**
 * Fate System API Routes
 * 命運系統 API 路由
 */

import { Hono } from 'hono';
import { FateEngine } from '../fate-engine';
import type { CoinInput } from '../fate-types';
import type { Env } from '../types';

const fate = new Hono<{ Bindings: Env }>();

// ============================================================================
// POST /api/fate/predict - 預測新幣命運
// ============================================================================
fate.post('/predict', async (c) => {
  try {
    const coinInput: CoinInput = await c.req.json();

    // 驗證必填字段
    if (!coinInput.coin_name || !coinInput.coin_symbol || !coinInput.category) {
      return c.json(
        {
          success: false,
          error: 'Missing required fields: coin_name, coin_symbol, category',
        },
        400
      );
    }

    // 設置默認值
    const input: CoinInput = {
      creator_reputation: 50,
      creator_previous_coins: 0,
      market_trend: 'sideways',
      competition_level: 5,
      has_website: false,
      has_twitter: false,
      has_telegram: false,
      marketing_budget: 0,
      initial_holders: 10,
      initial_volume: 1000,
      ...coinInput,
    };

    // 創建 FateEngine 實例
    const engine = new FateEngine(c.env.DB);

    // 預測命運
    const prediction = await engine.predictFate(input);

    return c.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    console.error('Error predicting fate:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// ============================================================================
// GET /api/fate/stats - 獲取統計數據
// ============================================================================
fate.get('/stats', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_cases,
        COUNT(CASE WHEN outcome = 'moon' THEN 1 END) as moon_cases,
        COUNT(CASE WHEN outcome = 'stable' THEN 1 END) as stable_cases,
        COUNT(CASE WHEN outcome = 'rug' THEN 1 END) as rug_cases,
        COUNT(CASE WHEN outcome = 'slow_death' THEN 1 END) as slow_death_cases
      FROM coin_history_cases
    `).first();

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// ============================================================================
// GET /api/fate/stats/:category - 獲取類別統計
// ============================================================================
fate.get('/stats/:category', async (c) => {
  try {
    const category = c.req.param('category');

    const result = await c.env.DB.prepare(
      `
      SELECT 
        category,
        COUNT(*) as total,
        COUNT(CASE WHEN outcome = 'moon' THEN 1 END) as moon,
        COUNT(CASE WHEN outcome = 'stable' THEN 1 END) as stable,
        COUNT(CASE WHEN outcome = 'rug' THEN 1 END) as rug,
        COUNT(CASE WHEN outcome = 'slow_death' THEN 1 END) as slow_death,
        ROUND(AVG(creator_reputation), 2) as avg_creator_reputation,
        ROUND(AVG(marketing_budget), 2) as avg_marketing_budget,
        ROUND(AVG(days_to_peak), 2) as avg_days_to_peak
      FROM coin_history_cases
      WHERE category = ?
      GROUP BY category
    `
    )
      .bind(category)
      .first();

    if (!result) {
      return c.json(
        {
          success: false,
          error: 'Category not found',
        },
        404
      );
    }

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// ============================================================================
// POST /api/fate/batch-predict - 批量預測
// ============================================================================
fate.post('/batch-predict', async (c) => {
  try {
    const { coins } = await c.req.json<{ coins: CoinInput[] }>();

    if (!Array.isArray(coins) || coins.length === 0) {
      return c.json(
        {
          success: false,
          error: 'Invalid input: coins must be a non-empty array',
        },
        400
      );
    }

    if (coins.length > 10) {
      return c.json(
        {
          success: false,
          error: 'Maximum 10 coins per batch request',
        },
        400
      );
    }

    const engine = new FateEngine(c.env.DB);
    const predictions = await Promise.all(
      coins.map(async (coin) => {
        try {
          return await engine.predictFate(coin);
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : 'Prediction failed',
            coin_name: coin.coin_name,
          };
        }
      })
    );

    return c.json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    console.error('Error in batch prediction:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// ============================================================================
// GET /api/fate/categories - 獲取所有類別列表
// ============================================================================
fate.get('/categories', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        category,
        COUNT(*) as total_cases,
        ROUND(COUNT(CASE WHEN outcome IN ('moon', 'stable') THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate,
        ROUND(COUNT(CASE WHEN outcome = 'moon' THEN 1 END) * 100.0 / COUNT(*), 2) as moon_rate
      FROM coin_history_cases
      GROUP BY category
      ORDER BY success_rate DESC
    `).all();

    return c.json({
      success: true,
      data: result.results,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default fate;
