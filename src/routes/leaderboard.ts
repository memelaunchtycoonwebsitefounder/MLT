import { Hono } from 'hono';
import { Env } from '../types';
import { errorResponse, successResponse } from '../utils';

const leaderboard = new Hono<{ Bindings: Env }>();

// Get top players by portfolio value
leaderboard.get('/players', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');

    const result = await c.env.DB.prepare(
      `SELECT 
        u.id,
        u.username,
        u.level,
        u.virtual_balance,
        COALESCE(SUM(h.current_value), 0) as portfolio_value,
        (u.virtual_balance + COALESCE(SUM(h.current_value), 0)) as total_net_worth
      FROM users u
      LEFT JOIN holdings h ON u.id = h.user_id
      GROUP BY u.id
      ORDER BY total_net_worth DESC
      LIMIT ?`
    )
      .bind(limit)
      .all();

    // Add rank
    const rankedResults = result.results.map((player: any, index: number) => ({
      ...player,
      rank: index + 1,
    }));

    return successResponse(rankedResults);
  } catch (error: any) {
    console.error('Get players leaderboard error:', error);
    return errorResponse('獲取玩家排行榜時發生錯誤', 500);
  }
});

// Get top coins by market cap
leaderboard.get('/coins', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const sortBy = c.req.query('sortBy') || 'market_cap';

    const validSorts = ['market_cap', 'hype_score', 'holders_count', 'transaction_count'];
    const sort = validSorts.includes(sortBy) ? sortBy : 'market_cap';

    const result = await c.env.DB.prepare(
      `SELECT 
        c.*,
        u.username as creator_username
      FROM coins c
      JOIN users u ON c.creator_id = u.id
      WHERE c.status = 'active'
      ORDER BY ${sort} DESC
      LIMIT ?`
    )
      .bind(limit)
      .all();

    // Add rank
    const rankedResults = result.results.map((coin: any, index: number) => ({
      ...coin,
      rank: index + 1,
    }));

    return successResponse(rankedResults);
  } catch (error: any) {
    console.error('Get coins leaderboard error:', error);
    return errorResponse('獲取幣種排行榜時發生錯誤', 500);
  }
});

// Get top traders by profit
leaderboard.get('/traders', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');

    const result = await c.env.DB.prepare(
      `SELECT 
        u.id,
        u.username,
        u.level,
        COUNT(DISTINCT t.id) as total_trades,
        SUM(CASE WHEN t.type = 'sell' THEN t.total_cost ELSE 0 END) -
        SUM(CASE WHEN t.type = 'buy' THEN t.total_cost ELSE 0 END) as total_profit
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id
      WHERE t.type IN ('buy', 'sell')
      GROUP BY u.id
      HAVING total_trades > 0
      ORDER BY total_profit DESC
      LIMIT ?`
    )
      .bind(limit)
      .all();

    // Add rank
    const rankedResults = result.results.map((trader: any, index: number) => ({
      ...trader,
      rank: index + 1,
    }));

    return successResponse(rankedResults);
  } catch (error: any) {
    console.error('Get traders leaderboard error:', error);
    return errorResponse('獲取交易員排行榜時發生錯誤', 500);
  }
});

export default leaderboard;
