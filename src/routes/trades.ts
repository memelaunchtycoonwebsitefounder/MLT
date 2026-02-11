import { Hono } from 'hono';
import { Env, Coin, JWTPayload, Transaction } from '../types';
import {
  errorResponse,
  successResponse,
  calculateBondingCurvePrice,
  calculateHypeMultiplier,
  calculateFinalPrice,
  calculateMarketCap,
} from '../utils';

const trades = new Hono<{ Bindings: Env }>();

// Helper function to check and update achievements after trade
async function checkTradeAchievements(db: any, userId: number, totalCost: number) {
  try {
    // Get user's total trade count
    const tradeCount = await db.prepare(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?'
    ).bind(userId).first();

    const count = tradeCount?.count || 0;

    // Achievement: first_trade (1 trade) - Always update progress
    await updateAchievement(db, userId, 'first_trade', Math.min(count, 1), 1);

    // Achievement: trader_10 (10 trades)
    await updateAchievement(db, userId, 'trader_10', Math.min(count, 10), 10);

    // Achievement: trader_100 (100 trades)
    await updateAchievement(db, userId, 'trader_100', Math.min(count, 100), 100);

    // Achievement: whale (single trade > 10000)
    if (totalCost >= 10000) {
      await updateAchievement(db, userId, 'whale', 1, 1);
    }

    // Achievement: profit_king (total profit > 50000)
    const profitResult = await db.prepare(
      `SELECT 
         SUM(CASE WHEN type = 'sell' THEN total_cost ELSE -total_cost END) as total_profit
       FROM transactions
       WHERE user_id = ?`
    ).bind(userId).first();

    if (profitResult && profitResult.total_profit >= 50000) {
      await updateAchievement(db, userId, 'profit_king', 1, 1);
    }
  } catch (error) {
    console.error('Error checking trade achievements:', error);
  }
}

// Helper function to update achievement progress
async function updateAchievement(db: any, userId: number, achievementKey: string, progress: number, requirement: number) {
  try {
    // Get achievement definition
    const achievement = await db.prepare(
      'SELECT id FROM achievement_definitions WHERE key = ?'
    ).bind(achievementKey).first();

    if (!achievement) return;

    const achievementId = achievement.id;

    // Check if user achievement exists
    const userAchievement = await db.prepare(
      'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?'
    ).bind(userId, achievementId).first();

    const completed = progress >= requirement ? 1 : 0;

    if (userAchievement) {
      // Update existing
      if (!userAchievement.completed && completed) {
        // Just completed!
        await db.prepare(
          `UPDATE user_achievements 
           SET progress = ?, completed = 1, completed_at = CURRENT_TIMESTAMP
           WHERE user_id = ? AND achievement_id = ?`
        ).bind(progress, userId, achievementId).run();
      } else if (!userAchievement.completed) {
        // Update progress
        await db.prepare(
          'UPDATE user_achievements SET progress = ? WHERE user_id = ? AND achievement_id = ?'
        ).bind(progress, userId, achievementId).run();
      }
    } else {
      // Create new
      await db.prepare(
        `INSERT INTO user_achievements (user_id, achievement_id, progress, completed, completed_at)
         VALUES (?, ?, ?, ?, ${completed ? 'CURRENT_TIMESTAMP' : 'NULL'})`
      ).bind(userId, achievementId, progress, completed).run();
    }

    // If just completed, add XP to user
    if (completed && (!userAchievement || !userAchievement.completed)) {
      const achDef = await db.prepare(
        'SELECT points FROM achievement_definitions WHERE id = ?'
      ).bind(achievementId).first();

      if (achDef) {
        await db.prepare(
          'UPDATE users SET experience_points = experience_points + ? WHERE id = ?'
        ).bind(achDef.points, userId).run();
      }
    }
  } catch (error) {
    console.error('Error updating achievement:', error);
  }
}

// Buy coins
trades.post('/buy', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const { coinId, amount } = await c.req.json();

    if (!coinId || !amount || amount <= 0) {
      return errorResponse('無效的幣種 ID 或數量');
    }

    // Get coin details
    const coin = await c.env.DB.prepare(
      'SELECT * FROM coins WHERE id = ? AND status = ?'
    )
      .bind(coinId, 'active')
      .first() as Coin | null;

    if (!coin) {
      return errorResponse('幣種未找到或已停用', 404);
    }

    // Check if enough supply available
    const availableSupply = coin.total_supply - coin.circulating_supply;
    if (amount > availableSupply) {
      return errorResponse(`可用供應量不足。剩餘: ${availableSupply}`);
    }

    // Calculate price using bonding curve
    const basePrice = calculateBondingCurvePrice(
      0.01,
      coin.circulating_supply,
      coin.total_supply
    );
    const hypeMultiplier = calculateHypeMultiplier(coin.hype_score);
    const currentPrice = calculateFinalPrice(basePrice, hypeMultiplier);
    const totalCost = currentPrice * amount;

    // Check user balance
    const userBalance = await c.env.DB.prepare(
      'SELECT virtual_balance FROM users WHERE id = ?'
    )
      .bind(user.userId)
      .first() as any;

    if (userBalance.virtual_balance < totalCost) {
      return errorResponse(`余額不足。需要: ${totalCost.toFixed(2)} 金幣`);
    }

    // Start transaction (simulated - D1 doesn't support transactions yet)
    // 1. Deduct user balance
    await c.env.DB.prepare(
      'UPDATE users SET virtual_balance = virtual_balance - ? WHERE id = ?'
    )
      .bind(totalCost, user.userId)
      .run();

    // 2. Update coin stats
    const newCirculatingSupply = coin.circulating_supply + amount;
    const newMarketCap = calculateMarketCap(currentPrice, newCirculatingSupply);
    const newTransactionCount = coin.transaction_count + 1;

    await c.env.DB.prepare(
      `UPDATE coins 
       SET circulating_supply = ?, 
           current_price = ?, 
           market_cap = ?, 
           transaction_count = ?,
           hype_score = hype_score + ?
       WHERE id = ?`
    )
      .bind(
        newCirculatingSupply,
        currentPrice,
        newMarketCap,
        newTransactionCount,
        amount * 0.01, // Small hype boost per transaction
        coinId
      )
      .run();

    // 3. Record transaction
    const txResult = await c.env.DB.prepare(
      `INSERT INTO transactions (user_id, coin_id, type, amount, price, total_cost) 
       VALUES (?, ?, 'buy', ?, ?, ?)`
    )
      .bind(user.userId, coinId, amount, currentPrice, totalCost)
      .run();

    // 4. Update or create holding
    const existingHolding = await c.env.DB.prepare(
      'SELECT * FROM holdings WHERE user_id = ? AND coin_id = ?'
    )
      .bind(user.userId, coinId)
      .first() as any;

    if (existingHolding) {
      const newAmount = existingHolding.amount + amount;
      const newAvgPrice =
        (existingHolding.avg_buy_price * existingHolding.amount +
          currentPrice * amount) /
        newAmount;

      await c.env.DB.prepare(
        `UPDATE holdings 
         SET amount = ?, 
             avg_buy_price = ?,
             current_value = ?,
             last_updated = CURRENT_TIMESTAMP
         WHERE user_id = ? AND coin_id = ?`
      )
        .bind(newAmount, newAvgPrice, currentPrice * newAmount, user.userId, coinId)
        .run();
    } else {
      await c.env.DB.prepare(
        `INSERT INTO holdings (user_id, coin_id, amount, avg_buy_price, current_value) 
         VALUES (?, ?, ?, ?, ?)`
      )
        .bind(user.userId, coinId, amount, currentPrice, currentPrice * amount)
        .run();

      // Update holders count
      await c.env.DB.prepare(
        'UPDATE coins SET holders_count = holders_count + 1 WHERE id = ?'
      )
        .bind(coinId)
        .run();
    }

    // Check and update achievements
    await checkTradeAchievements(c.env.DB, user.userId, totalCost);

    // 5. Record price history
    await c.env.DB.prepare(
      `INSERT INTO price_history (coin_id, price, volume, market_cap, circulating_supply)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(coinId, currentPrice, amount, newMarketCap, newCirculatingSupply).run();

    return successResponse({
      transactionId: txResult.meta.last_row_id,
      amount,
      price: currentPrice,
      totalCost,
      newBalance: userBalance.virtual_balance - totalCost,
    });
  } catch (error: any) {
    console.error('Buy error:', error);
    return errorResponse('購買時發生錯誤', 500);
  }
});

// Sell coins
trades.post('/sell', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const { coinId, amount } = await c.req.json();

    if (!coinId || !amount || amount <= 0) {
      return errorResponse('無效的幣種 ID 或數量');
    }

    // Check user holding
    const holding = await c.env.DB.prepare(
      'SELECT * FROM holdings WHERE user_id = ? AND coin_id = ?'
    )
      .bind(user.userId, coinId)
      .first() as any;

    if (!holding || holding.amount < amount) {
      return errorResponse('持有量不足');
    }

    // Get coin details
    const coin = await c.env.DB.prepare(
      'SELECT * FROM coins WHERE id = ?'
    )
      .bind(coinId)
      .first() as Coin | null;

    if (!coin) {
      return errorResponse('幣種未找到', 404);
    }

    // Calculate current price
    const basePrice = calculateBondingCurvePrice(
      0.01,
      coin.circulating_supply - amount, // Selling reduces circulating supply
      coin.total_supply
    );
    const hypeMultiplier = calculateHypeMultiplier(coin.hype_score);
    const currentPrice = calculateFinalPrice(basePrice, hypeMultiplier);
    const totalRevenue = currentPrice * amount;

    // 1. Add to user balance
    await c.env.DB.prepare(
      'UPDATE users SET virtual_balance = virtual_balance + ? WHERE id = ?'
    )
      .bind(totalRevenue, user.userId)
      .run();

    // 2. Update coin stats
    const newCirculatingSupply = coin.circulating_supply - amount;
    const newMarketCap = calculateMarketCap(currentPrice, newCirculatingSupply);
    const newTransactionCount = coin.transaction_count + 1;

    await c.env.DB.prepare(
      `UPDATE coins 
       SET circulating_supply = ?, 
           current_price = ?, 
           market_cap = ?, 
           transaction_count = ?,
           hype_score = hype_score - ?
       WHERE id = ?`
    )
      .bind(
        newCirculatingSupply,
        currentPrice,
        newMarketCap,
        newTransactionCount,
        amount * 0.005, // Small hype decrease when selling
        coinId
      )
      .run();

    // 3. Record transaction
    const txResult = await c.env.DB.prepare(
      `INSERT INTO transactions (user_id, coin_id, type, amount, price, total_cost) 
       VALUES (?, ?, 'sell', ?, ?, ?)`
    )
      .bind(user.userId, coinId, amount, currentPrice, totalRevenue)
      .run();

    // 4. Update holding
    const newHoldingAmount = holding.amount - amount;
    
    if (newHoldingAmount <= 0) {
      // Remove holding if all sold
      await c.env.DB.prepare(
        'DELETE FROM holdings WHERE user_id = ? AND coin_id = ?'
      )
        .bind(user.userId, coinId)
        .run();

      // Update holders count
      await c.env.DB.prepare(
        'UPDATE coins SET holders_count = holders_count - 1 WHERE id = ?'
      )
        .bind(coinId)
        .run();
    } else {
      await c.env.DB.prepare(
        `UPDATE holdings 
         SET amount = ?, 
             current_value = ?,
             last_updated = CURRENT_TIMESTAMP
         WHERE user_id = ? AND coin_id = ?`
      )
        .bind(newHoldingAmount, currentPrice * newHoldingAmount, user.userId, coinId)
        .run();
    }

    // Get new balance
    const newBalance = await c.env.DB.prepare(
      'SELECT virtual_balance FROM users WHERE id = ?'
    )
      .bind(user.userId)
      .first() as any;

    // Check and update achievements
    await checkTradeAchievements(c.env.DB, user.userId, totalRevenue);

    // 5. Record price history
    await c.env.DB.prepare(
      `INSERT INTO price_history (coin_id, price, volume, market_cap, circulating_supply)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(coinId, currentPrice, amount, newMarketCap, newCirculatingSupply).run();

    return successResponse({
      transactionId: txResult.meta.last_row_id,
      amount,
      price: currentPrice,
      totalRevenue,
      newBalance: newBalance.virtual_balance,
    });
  } catch (error: any) {
    console.error('Sell error:', error);
    return errorResponse('出售時發生錯誤', 500);
  }
});

// Get user's trading history
trades.get('/history', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    const result = await c.env.DB.prepare(
      `SELECT t.*, c.name as coin_name, c.symbol as coin_symbol, c.image_url 
       FROM transactions t 
       JOIN coins c ON t.coin_id = c.id 
       WHERE t.user_id = ? 
       ORDER BY t.timestamp DESC 
       LIMIT ? OFFSET ?`
    )
      .bind(user.userId, limit, offset)
      .all();

    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?'
    )
      .bind(user.userId)
      .first() as any;

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return successResponse({
      transactions: result.results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Get history error:', error);
    return errorResponse('獲取交易歷史時發生錯誤', 500);
  }
});

// Get recent transactions (for dashboard)
trades.get('/recent', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const limit = parseInt(c.req.query('limit') || '5');

    const result = await c.env.DB.prepare(
      `SELECT 
         t.id,
         t.type,
         t.amount,
         t.price,
         t.total_cost,
         t.timestamp,
         c.id as coin_id,
         c.name as coin_name,
         c.symbol as coin_symbol,
         c.image_url as coin_image
       FROM transactions t
       LEFT JOIN coins c ON t.coin_id = c.id
       WHERE t.user_id = ?
       ORDER BY t.timestamp DESC
       LIMIT ?`
    )
      .bind(user.userId, limit)
      .all();

    return successResponse(result.results || []);
  } catch (error: any) {
    console.error('Get recent transactions error:', error);
    return errorResponse('獲取最近交易時發生錯誤', 500);
  }
});


export default trades;
