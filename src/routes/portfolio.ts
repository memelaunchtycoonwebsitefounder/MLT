import { Hono } from 'hono';
import { Env, JWTPayload } from '../types';
import { errorResponse, successResponse } from '../utils';

const portfolio = new Hono<{ Bindings: Env }>();

// Get user's portfolio
portfolio.get('/', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    
    if (!user) {
      return errorResponse('未授權', 401);
    }

    // Get user's holdings with coin details
    const holdings = await c.env.DB.prepare(
      `SELECT 
        h.*,
        c.name,
        c.symbol,
        c.image_url,
        c.current_price
      FROM holdings h
      JOIN coins c ON h.coin_id = c.id
      WHERE h.user_id = ?
      ORDER BY h.current_value DESC`
    )
      .bind(user.userId)
      .all();

    // Calculate portfolio stats
    let totalValue = 0;
    let totalInvested = 0;
    let totalProfitLoss = 0;

    const enrichedHoldings = holdings.results.map((holding: any) => {
      const currentValue = holding.current_price * holding.amount;
      const invested = holding.avg_buy_price * holding.amount;
      const profitLoss = currentValue - invested;
      const profitLossPercent = invested > 0 ? (profitLoss / invested) * 100 : 0;

      totalValue += currentValue;
      totalInvested += invested;
      totalProfitLoss += profitLoss;

      return {
        ...holding,
        current_value: currentValue,
        invested,
        profit_loss: profitLoss,
        profit_loss_percent: profitLossPercent,
      };
    });

    const totalProfitLossPercent =
      totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    // Get user balance
    const userBalance = await c.env.DB.prepare(
      'SELECT virtual_balance, premium_balance FROM users WHERE id = ?'
    )
      .bind(user.userId)
      .first() as any;

    return successResponse({
      holdings: enrichedHoldings,
      stats: {
        totalValue,
        totalInvested,
        totalProfitLoss,
        totalProfitLossPercent,
        cashBalance: userBalance.virtual_balance,
        premiumBalance: userBalance.premium_balance,
        totalNetWorth: totalValue + userBalance.virtual_balance,
      },
    });
  } catch (error: any) {
    console.error('Get portfolio error:', error);
    return errorResponse('獲取投資組合時發生錯誤', 500);
  }
});

// Get portfolio performance chart data
portfolio.get('/performance', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const days = parseInt(c.req.query('days') || '7');

    // Get transactions for the period
    const transactions = await c.env.DB.prepare(
      `SELECT 
        DATE(timestamp) as date,
        SUM(CASE WHEN type = 'buy' THEN -total_cost ELSE total_cost END) as net_flow
      FROM transactions
      WHERE user_id = ? AND timestamp >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(timestamp)
      ORDER BY date ASC`
    )
      .bind(user.userId, days)
      .all();

    return successResponse({
      chartData: transactions.results,
    });
  } catch (error: any) {
    console.error('Get performance error:', error);
    return errorResponse('獲取投資表現時發生錯誤', 500);
  }
});

export default portfolio;
