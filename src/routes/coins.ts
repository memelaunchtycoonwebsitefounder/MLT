import { Hono } from 'hono';
import { Env, Coin, JWTPayload } from '../types';
import {
  errorResponse,
  successResponse,
  generateCoinSymbol,
  calculateBondingCurvePrice,
  calculateHypeMultiplier,
  calculateFinalPrice,
  calculateMarketCap,
} from '../utils';

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

// Create new coin
coins.post('/', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const body = await c.req.json();
    const { name, symbol, description, image_url, total_supply, quality_score } = body;

    // Validation
    if (!name || !total_supply) {
      return errorResponse('幣種名稱和總供應量是必填的');
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

    // Check user balance for creation fee (100 gold coins)
    const creationFee = 100;
    const userBalance = await c.env.DB.prepare(
      'SELECT virtual_balance FROM users WHERE id = ?'
    )
      .bind(user.userId)
      .first() as any;

    if (!userBalance || userBalance.virtual_balance < creationFee) {
      return errorResponse(`余額不足。創建幣種需要 ${creationFee} 金幣`);
    }

    // Calculate initial values
    const initialPrice = 0.01;
    const baseHype = 100;
    const qualityBonus = quality_score ? Math.floor((quality_score - 50) / 2) : 0;
    const initialHype = Math.max(50, Math.min(200, baseHype + qualityBonus));

    // Use provided image URL or default
    const finalImageUrl = image_url || '/static/default-coin.svg';

    // Create coin
    const result = await c.env.DB.prepare(
      `INSERT INTO coins (creator_id, name, symbol, description, image_url, 
                          total_supply, current_price, hype_score) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        user.userId,
        name,
        coinSymbol,
        description || '',
        finalImageUrl,
        total_supply,
        initialPrice,
        initialHype
      )
      .run();

    if (!result.success) {
      return errorResponse('創建幣種失敗', 500);
    }

    // Get the created coin ID
    const coinId = result.meta.last_row_id;

    // Deduct creation fee
    await c.env.DB.prepare(
      'UPDATE users SET virtual_balance = virtual_balance - ? WHERE id = ?'
    )
      .bind(creationFee, user.userId)
      .run();

    // Record transaction
    await c.env.DB.prepare(
      `INSERT INTO transactions (user_id, coin_id, type, amount, price, total_cost) 
       VALUES (?, ?, 'create', 0, 0, ?)`
    )
      .bind(user.userId, result.meta.last_row_id, creationFee)
      .run();

    // Get the created coin
    const newCoin = await c.env.DB.prepare(
      'SELECT * FROM coins WHERE id = ?'
    )
      .bind(result.meta.last_row_id)
      .first();

    return successResponse(newCoin, 201);
  } catch (error: any) {
    console.error('Create coin error:', error);
    return errorResponse('創建幣種時發生錯誤', 500);
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

export default coins;
