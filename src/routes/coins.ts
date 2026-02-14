import { Hono } from 'hono';
import { Env, Coin, JWTPayload } from '../types';
import {
  errorResponse,
  successResponse,
  generateCoinSymbol,
  calculateMarketCap,
} from '../utils';
import {
  calculateInitialPrice,
  calculateMinimumPrePurchase,
  calculateBuyTrade,
} from '../utils/bonding-curve';
import {
  determineDestiny,
  initializeAITraders,
} from '../services/ai-trader-engine';
import {
  scheduleEventsForCoin,
  recordEvent,
} from '../services/market-events';
import {
  startCoinScheduler,
} from '../services/scheduler';

const coins = new Hono<{ Bindings: Env }>();

// Get all coins (with pagination and filters)
coins.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const sortBy = c.req.query('sortBy') || 'created_at';
    const order = c.req.query('order') || 'DESC';
    const search = c.req.query('search') || '';
    const symbol = c.req.query('symbol') || '';
    const destinyType = c.req.query('destinyType') || '';

    const offset = (page - 1) * limit;

    // Build query with JOIN to get creator username
    let query = `
      SELECT 
        coins.*,
        users.username as creator_username
      FROM coins
      LEFT JOIN users ON coins.creator_id = users.id
      WHERE coins.status = ?
    `;
    const params: any[] = ['active'];

    if (search) {
      query += ' AND (coins.name LIKE ? OR coins.symbol LIKE ? OR coins.description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (symbol) {
      query += ' AND coins.symbol = ?';
      params.push(symbol);
    }

    if (destinyType) {
      query += ' AND coins.destiny_type = ?';
      params.push(destinyType);
    }

    query += ` ORDER BY coins.${sortBy} ${order} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await c.env.DB.prepare(query)
      .bind(...params)
      .all();

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM coins WHERE status = ?';
    const countParams: any[] = ['active'];

    if (search) {
      countQuery += ' AND (name LIKE ? OR symbol LIKE ? OR description LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (symbol) {
      countQuery += ' AND symbol = ?';
      countParams.push(symbol);
    }

    if (destinyType) {
      countQuery += ' AND destiny_type = ?';
      countParams.push(destinyType);
    }

    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...countParams)
      .first() as any;

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return successResponse({
      coins: result.results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Get coins error:', error);
    return errorResponse('獲取幣種列表時發生錯誤', 500);
  }
});

// Get single coin details
coins.get('/:id', async (c) => {
  try {
    const coinId = c.req.param('id');

    const coin = await c.env.DB.prepare(
      `SELECT 
        coins.*,
        users.username as creator_username
      FROM coins
      LEFT JOIN users ON coins.creator_id = users.id
      WHERE coins.id = ?`
    )
      .bind(coinId)
      .first() as any;

    if (!coin) {
      return errorResponse('幣種未找到', 404);
    }

    return successResponse(coin);
  } catch (error: any) {
    console.error('Get coin details error:', error);
    return errorResponse('獲取幣種詳情時發生錯誤', 500);
  }
});

// Create new coin with MLT economy and AI system
coins.post('/', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const body = await c.req.json();
    const { 
      name, 
      symbol, 
      description, 
      image_url, 
      total_supply,
      initial_mlt_investment,
      pre_purchase_amount,
      twitter_url,
      telegram_url,
      website_url
    } = body;

    // Debug logging
    console.log('📊 Create coin request:', {
      name,
      symbol,
      total_supply,
      initial_mlt_investment,
      pre_purchase_amount
    });

    // Validation
    if (!name || !total_supply || !initial_mlt_investment) {
      return errorResponse('幣種名稱、總供應量和初始 MLT 投資是必填的');
    }

    if (name.length < 3 || name.length > 50) {
      return errorResponse('幣種名稱必須是 3-50 個字符');
    }

    if (symbol && (symbol.length < 2 || symbol.length > 10)) {
      return errorResponse('幣種符號必須是 2-10 個字符');
    }

    if (total_supply <= 0 || total_supply > 1000000000) {
      return errorResponse('總供應量必須在 1 到 1,000,000,000 之間');
    }

    // Validate MLT investment (1,800 - 10,000)
    if (initial_mlt_investment < 1800 || initial_mlt_investment > 10000) {
      return errorResponse('初始 MLT 投資必須在 1,800 到 10,000 之間');
    }

    // Auto-generate symbol if not provided
    const coinSymbol = (symbol || generateCoinSymbol(name)).toUpperCase();

    // Check if symbol already exists
    const existingCoin = await c.env.DB.prepare(
      'SELECT id FROM coins WHERE symbol = ?'
    )
      .bind(coinSymbol)
      .first();

    if (existingCoin) {
      return errorResponse('該幣種代號已被使用');
    }

    // Calculate initial price and minimum pre-purchase
    const initialPrice = calculateInitialPrice(initial_mlt_investment, total_supply);
    const minimumPrePurchase = calculateMinimumPrePurchase(100, initial_mlt_investment, total_supply);

    console.log('💰 Calculated values:', {
      initialPrice,
      minimumPrePurchase,
      pre_purchase_amount,
      isValid: pre_purchase_amount >= minimumPrePurchase
    });

    // Validate pre-purchase amount
    if (!pre_purchase_amount || pre_purchase_amount < minimumPrePurchase) {
      // Calculate actual cost for validation
      const actualCost = calculateBuyTrade(
        initial_mlt_investment,
        total_supply,
        0,
        pre_purchase_amount || 0,
        4.0
      );
      
      return errorResponse(
        `預購數量不足! 您選擇的 ${(pre_purchase_amount || 0).toLocaleString()} 個幣僅價值 ${actualCost.mltAmount.toFixed(2)} MLT。` +
        `最低要求至少 ${minimumPrePurchase.toLocaleString()} 個幣 (價值 100 MLT)。`,
        400
      );
    }

    if (pre_purchase_amount > total_supply * 0.5) {
      return errorResponse('預購數量不能超過總供應量的 50%');
    }

    // Calculate pre-purchase cost
    const prePurchaseTrade = calculateBuyTrade(
      initial_mlt_investment,
      total_supply,
      0,
      pre_purchase_amount,
      4.0
    );

    // Total cost = initial investment + pre-purchase cost
    const totalCost = initial_mlt_investment + prePurchaseTrade.mltAmount;

    // Check user MLT balance
    const userBalance = await c.env.DB.prepare(
      'SELECT mlt_balance FROM users WHERE id = ?'
    )
      .bind(user.userId)
      .first() as any;

    if (!userBalance || userBalance.mlt_balance < totalCost) {
      return errorResponse(`MLT 餘額不足。需要: ${totalCost.toFixed(2)} MLT，當前: ${userBalance?.mlt_balance || 0} MLT`);
    }

    // Determine destiny for this coin
    const destinyType = determineDestiny();

    // Use provided image URL or default
    const finalImageUrl = image_url || '/static/default-coin.svg';

    // Create coin with MLT economy parameters
    const result = await c.env.DB.prepare(
      `INSERT INTO coins (
        creator_id, name, symbol, description, image_url,
        total_supply, circulating_supply, current_price, market_cap,
        hype_score, holders_count,
        initial_mlt_investment, bonding_curve_progress, bonding_curve_k,
        destiny_type, is_ai_active,
        creation_cost_mlt,
        twitter_url, telegram_url, website_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        user.userId,
        name,
        coinSymbol,
        description || '',
        finalImageUrl,
        total_supply,
        pre_purchase_amount,                    // Initial circulating supply
        prePurchaseTrade.newPrice,              // Price after pre-purchase
        prePurchaseTrade.newMarketCap,          // Market cap
        100,                                     // Initial hype score
        1,                                       // Creator is first holder
        initial_mlt_investment,
        prePurchaseTrade.newProgress,           // Progress after pre-purchase
        4.0,                                     // Bonding curve k
        destinyType,
        1,                                       // AI active
        totalCost,
        twitter_url || null,
        telegram_url || null,
        website_url || null
      )
      .run();

    if (!result.success) {
      return errorResponse('創建幣種失敗', 500);
    }

    const coinId = result.meta.last_row_id;

    // Deduct total MLT cost from user
    await c.env.DB.prepare(
      'UPDATE users SET mlt_balance = mlt_balance - ?, total_mlt_spent = total_mlt_spent + ? WHERE id = ?'
    )
      .bind(totalCost, totalCost, user.userId)
      .run();

    // Create holding record for creator
    await c.env.DB.prepare(
      `INSERT INTO holdings (user_id, coin_id, amount, avg_buy_price, current_value)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(
        user.userId,
        coinId,
        pre_purchase_amount,
        prePurchaseTrade.averagePrice,
        prePurchaseTrade.newPrice * pre_purchase_amount
      )
      .run();

    // Record creation transaction
    await c.env.DB.prepare(
      `INSERT INTO transactions (user_id, coin_id, type, amount, price, total_cost)
       VALUES (?, ?, 'create', ?, ?, ?)`
    )
      .bind(user.userId, coinId, pre_purchase_amount, prePurchaseTrade.averagePrice, totalCost)
      .run();

    // Record initial price history
    await c.env.DB.prepare(
      `INSERT INTO price_history (coin_id, price, volume, market_cap, circulating_supply)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(
        coinId,
        prePurchaseTrade.newPrice,
        pre_purchase_amount,
        prePurchaseTrade.newMarketCap,
        pre_purchase_amount
      )
      .run();

    // Initialize AI traders
    await initializeAITraders(c.env.DB, coinId, total_supply, destinyType);

    // Schedule market events
    const scheduledEvents = await scheduleEventsForCoin(
      coinId,
      destinyType,
      new Date()
    );

    // Start scheduler for this coin
    startCoinScheduler(coinId, new Date(), scheduledEvents);

    // Record coin creation event
    await recordEvent(c.env.DB, {
      coin_id: coinId,
      event_type: 'COIN_CREATED',
      event_data: `Destiny: ${destinyType}, Initial Investment: ${initial_mlt_investment} MLT, Pre-purchase: ${pre_purchase_amount} tokens`,
      impact_percent: 0
    });

    // Get the created coin
    const newCoin = await c.env.DB.prepare(
      'SELECT * FROM coins WHERE id = ?'
    )
      .bind(coinId)
      .first();

    console.log(`🚀 New coin created: ${name} (${coinSymbol}) - Destiny: ${destinyType}, AI Traders initialized`);

    return successResponse({
      coin: newCoin,
      cost: {
        initial_investment: initial_mlt_investment,
        pre_purchase_cost: prePurchaseTrade.mltAmount,
        total_cost: totalCost
      },
      pre_purchase: {
        amount: pre_purchase_amount,
        average_price: prePurchaseTrade.averagePrice,
        final_price: prePurchaseTrade.newPrice,
        progress: prePurchaseTrade.newProgress
      },
      ai_system: {
        destiny: destinyType,
        events_scheduled: scheduledEvents.length,
        scheduler_started: true
      }
    }, 201);
  } catch (error: any) {
    console.error('Create coin error:', error);
    return errorResponse('創建幣種時發生錯誤: ' + error.message, 500);
  }
});

// Get trending coins
coins.get('/trending/list', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');

    const result = await c.env.DB.prepare(
      `SELECT * FROM coins 
       WHERE status = 'active' 
       ORDER BY hype_score DESC, transaction_count DESC 
       LIMIT ?`
    )
      .bind(limit)
      .all();

    return successResponse(result.results);
  } catch (error: any) {
    console.error('Get trending coins error:', error);
    return errorResponse('獲取熱門幣種時發生錯誤', 500);
  }
});

// Get price history for a coin
coins.get('/:id/price-history', async (c) => {
  try {
    const coinId = parseInt(c.req.param('id'));
    const limit = parseInt(c.req.query('limit') || '100');
    const interval = c.req.query('interval') || '1h'; // Not used yet, future feature

    // Get price history ordered by timestamp
    const history = await c.env.DB.prepare(
      `SELECT 
        price,
        volume,
        market_cap,
        timestamp
       FROM price_history
       WHERE coin_id = ?
       ORDER BY timestamp ASC
       LIMIT ?`
    ).bind(coinId, limit).all();

    return successResponse({
      coin_id: coinId,
      interval,
      data: history.results
    });
  } catch (error: any) {
    console.error('Get price history error:', error);
    return errorResponse('獲取價格歷史時發生錯誤', 500);
  }
});

export default coins;
