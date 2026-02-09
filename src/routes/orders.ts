import { Hono } from 'hono';
import { Env, JWTPayload } from '../types';
import { errorResponse, successResponse } from '../utils';

const orders = new Hono<{ Bindings: Env }>();

// Place a new order
orders.post('/', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const body = await c.req.json();
    const coinId = body.coinId;
    const side = body.side || body.type; // Support both 'side' and 'type'
    const orderType = body.orderType || body.type || 'market'; // Default to market if not specified
    const amount = body.amount;
    const price = body.price;
    const triggerPrice = body.triggerPrice;
    const expiresIn = body.expiresIn;

    // Validate inputs
    if (!coinId || !side || !amount || amount <= 0) {
      return errorResponse('無效的訂單參數：需要 coinId, side/type, amount');
    }

    if (!['buy', 'sell'].includes(side)) {
      return errorResponse('無效的訂單類型：必須是 buy 或 sell');
    }

    if (!['market', 'limit', 'stop_loss', 'take_profit'].includes(orderType)) {
      return errorResponse('無效的訂單種類：必須是 market, limit, stop_loss 或 take_profit');
    }
    
    const type = side; // Normalize to 'type' for internal use

    // Get coin details
    const coin = await c.env.DB.prepare(
      'SELECT * FROM coins WHERE id = ? AND status = ?'
    ).bind(coinId, 'active').first() as any;

    if (!coin) {
      return errorResponse('幣種未找到或已停用', 404);
    }

    // For sell orders, check if user has enough holdings
    if (type === 'sell') {
      const holding = await c.env.DB.prepare(
        'SELECT amount FROM holdings WHERE user_id = ? AND coin_id = ?'
      ).bind(user.userId, coinId).first() as any;

      if (!holding || holding.amount < amount) {
        return errorResponse('持有量不足');
      }
    }

    // For market orders, execute immediately
    if (orderType === 'market') {
      // Execute market order logic (similar to existing buy/sell)
      // For now, redirect to existing trade endpoints
      return c.json({
        success: false,
        message: '市價單請使用 /api/trades/buy 或 /api/trades/sell'
      });
    }

    // Check user balance for limit buy orders
    if (type === 'buy' && orderType === 'limit') {
      if (!price || price <= 0) {
        return errorResponse('限價單需要指定價格');
      }

      const totalCost = price * amount;
      const userBalance = await c.env.DB.prepare(
        'SELECT virtual_balance FROM users WHERE id = ?'
      ).bind(user.userId).first() as any;

      if (userBalance.virtual_balance < totalCost) {
        return errorResponse(`餘額不足。需要: ${totalCost.toFixed(2)} 金幣`);
      }
    }

    // Calculate expiration
    let expiresAt = null;
    if (expiresIn && expiresIn > 0) {
      const now = new Date();
      now.setHours(now.getHours() + expiresIn);
      expiresAt = now.toISOString();
    }

    // Create order
    const result = await c.env.DB.prepare(
      `INSERT INTO orders 
       (user_id, coin_id, type, order_type, amount, price, trigger_price, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      user.userId,
      coinId,
      type,
      orderType,
      amount,
      price || null,
      triggerPrice || null,
      expiresAt
    ).run();

    return successResponse({
      orderId: result.meta.last_row_id,
      message: '訂單已創建',
      type,
      orderType,
      amount,
      price,
      status: 'pending'
    });

  } catch (error: any) {
    console.error('Create order error:', error);
    return errorResponse('創建訂單時發生錯誤', 500);
  }
});

// Get user's orders
orders.get('/', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const status = c.req.query('status') || 'all';
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    let query = `
      SELECT 
        o.*,
        c.name as coin_name,
        c.symbol as coin_symbol,
        c.current_price as current_coin_price
      FROM orders o
      LEFT JOIN coins c ON o.coin_id = c.id
      WHERE o.user_id = ?
    `;

    const params: any[] = [user.userId];

    if (status !== 'all') {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await c.env.DB.prepare(query).bind(...params).all();

    return successResponse({
      orders: result.results,
      count: result.results.length
    });

  } catch (error: any) {
    console.error('Get orders error:', error);
    return errorResponse('獲取訂單時發生錯誤', 500);
  }
});

// Cancel an order
orders.delete('/:id', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const orderId = parseInt(c.req.param('id'));

    // Check if order exists and belongs to user
    const order = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?'
    ).bind(orderId, user.userId).first() as any;

    if (!order) {
      return errorResponse('訂單未找到', 404);
    }

    if (order.status !== 'pending') {
      return errorResponse('只能取消待處理的訂單');
    }

    // Cancel order
    await c.env.DB.prepare(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind('cancelled', orderId).run();

    return successResponse({
      message: '訂單已取消',
      orderId
    });

  } catch (error: any) {
    console.error('Cancel order error:', error);
    return errorResponse('取消訂單時發生錯誤', 500);
  }
});

// Get order book for a coin
orders.get('/book/:coinId', async (c) => {
  try {
    const coinId = parseInt(c.req.param('coinId'));

    // Get pending buy orders (bids)
    const bids = await c.env.DB.prepare(
      `SELECT price, SUM(amount - filled_amount) as total_amount, COUNT(*) as order_count
       FROM orders
       WHERE coin_id = ? AND type = 'buy' AND order_type = 'limit' AND status = 'pending'
       GROUP BY price
       ORDER BY price DESC
       LIMIT 10`
    ).bind(coinId).all();

    // Get pending sell orders (asks)
    const asks = await c.env.DB.prepare(
      `SELECT price, SUM(amount - filled_amount) as total_amount, COUNT(*) as order_count
       FROM orders
       WHERE coin_id = ? AND type = 'sell' AND order_type = 'limit' AND status = 'pending'
       GROUP BY price
       ORDER BY price ASC
       LIMIT 10`
    ).bind(coinId).all();

    return successResponse({
      bids: bids.results,
      asks: asks.results,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Get order book error:', error);
    return errorResponse('獲取訂單簿時發生錯誤', 500);
  }
});

export default orders;
