import { Hono } from 'hono';
import { Env } from '../types';
import { errorResponse, successResponse } from '../utils';

const leaderboard = new Hono<{ Bindings: Env }>();

// Unified leaderboard endpoint with category support
leaderboard.get('/rankings', async (c) => {
  try {
    const category = c.req.query('category') || 'net_worth';
    const limit = parseInt(c.req.query('limit') || '100');
    const userId = c.req.query('userId'); // Optional: to get current user's rank

    let query = '';
    let orderBy = '';
    let valueField = '';

    switch (category) {
      case 'net_worth':
        // 淨資產 = 餘額 + 持倉價值
        query = `
          SELECT 
            u.id,
            u.username,
            u.level,
            u.experience_points as xp,
            u.virtual_balance,
            COALESCE(SUM(h.current_value), 0) as portfolio_value,
            (u.virtual_balance + COALESCE(SUM(h.current_value), 0)) as value,
            COUNT(DISTINCT CASE WHEN c.creator_id = u.id THEN c.id END) as coins_created
          FROM users u
          LEFT JOIN holdings h ON u.id = h.user_id
          LEFT JOIN coins c ON c.creator_id = u.id
          GROUP BY u.id
          ORDER BY value DESC
          LIMIT ?
        `;
        valueField = 'value';
        break;

      case 'trades':
        // 交易量
        query = `
          SELECT 
            u.id,
            u.username,
            u.level,
            u.experience_points as xp,
            COUNT(t.id) as value,
            u.virtual_balance,
            COUNT(DISTINCT CASE WHEN c.creator_id = u.id THEN c.id END) as coins_created
          FROM users u
          LEFT JOIN transactions t ON u.id = t.user_id
          LEFT JOIN coins c ON c.creator_id = u.id
          GROUP BY u.id
          HAVING value > 0
          ORDER BY value DESC
          LIMIT ?
        `;
        valueField = 'value';
        break;

      case 'level':
        // 等級
        query = `
          SELECT 
            u.id,
            u.username,
            u.level,
            u.experience_points as xp,
            u.level as value,
            u.virtual_balance,
            COUNT(DISTINCT CASE WHEN c.creator_id = u.id THEN c.id END) as coins_created
          FROM users u
          LEFT JOIN coins c ON c.creator_id = u.id
          GROUP BY u.id
          ORDER BY u.level DESC, u.experience_points DESC
          LIMIT ?
        `;
        valueField = 'level';
        break;

      case 'profit':
        // 利潤
        query = `
          SELECT 
            u.id,
            u.username,
            u.level,
            u.experience_points as xp,
            COALESCE(
              SUM(CASE WHEN t.type = 'sell' THEN t.total_cost ELSE 0 END) -
              SUM(CASE WHEN t.type = 'buy' THEN t.total_cost ELSE 0 END), 
              0
            ) as value,
            COUNT(t.id) as total_trades,
            u.virtual_balance,
            COUNT(DISTINCT CASE WHEN c.creator_id = u.id THEN c.id END) as coins_created
          FROM users u
          LEFT JOIN transactions t ON u.id = t.user_id
          LEFT JOIN coins c ON c.creator_id = u.id
          GROUP BY u.id
          HAVING total_trades > 0
          ORDER BY value DESC
          LIMIT ?
        `;
        valueField = 'value';
        break;

      case 'coins_created':
        // 創建的幣種數量
        query = `
          SELECT 
            u.id,
            u.username,
            u.level,
            u.experience_points as xp,
            COUNT(DISTINCT c.id) as value,
            u.virtual_balance,
            COUNT(DISTINCT c.id) as coins_created
          FROM users u
          LEFT JOIN coins c ON c.creator_id = u.id
          GROUP BY u.id
          HAVING value > 0
          ORDER BY value DESC
          LIMIT ?
        `;
        valueField = 'value';
        break;

      default:
        return errorResponse('無效的排行榜類別', 400);
    }

    const result = await c.env.DB.prepare(query).bind(limit).all();

    // Add rank
    const rankedResults = result.results.map((player: any, index: number) => ({
      ...player,
      rank: index + 1,
    }));

    // If userId is provided, find user's rank
    let currentUserRank = null;
    if (userId) {
      const userIdNum = parseInt(userId);
      const userIndex = rankedResults.findIndex((p: any) => p.id === userIdNum);
      
      if (userIndex !== -1) {
        // User is in top 100
        currentUserRank = rankedResults[userIndex];
      } else {
        // User not in top 100, query all results to find their rank
        const allQuery = query.replace(`LIMIT ?`, '');
        try {
          const allResults = await c.env.DB.prepare(allQuery).all();
          const allRanked = allResults.results.map((player: any, index: number) => ({
            ...player,
            rank: index + 1,
          }));
          const userInAll = allRanked.find((p: any) => p.id === userIdNum);
          if (userInAll) {
            currentUserRank = userInAll;
          }
        } catch (error) {
          console.error('Error finding user rank:', error);
          // If error, return null
        }
      }
    }

    return successResponse({
      category,
      rankings: rankedResults,
      currentUser: currentUserRank,
    });
  } catch (error: any) {
    console.error('Get rankings error:', error);
    return errorResponse('獲取排行榜時發生錯誤', 500);
  }
});

// Get top players by portfolio value (legacy endpoint)
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
