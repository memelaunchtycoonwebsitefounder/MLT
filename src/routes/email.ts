import { Hono } from 'hono';
import { Env } from '../types';
import { errorResponse, successResponse, validateEmail } from '../utils';

const email = new Hono<{ Bindings: Env }>();

// Root endpoint - alias for subscribe
email.post('/', async (c) => {
  try {
    const { email: emailAddress, source } = await c.req.json();

    // Validation
    if (!emailAddress) {
      return errorResponse('請輸入郵箱地址', 400);
    }

    if (!validateEmail(emailAddress)) {
      return errorResponse('請輸入有效的郵箱地址', 400);
    }

    // Get IP and User Agent for tracking
    const ipAddress = c.req.header('cf-connecting-ip') || 
                     c.req.header('x-forwarded-for') || 
                     'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';

    // Check if email already exists
    const existing = await c.env.DB.prepare(
      'SELECT id, status FROM email_subscribers WHERE email = ?'
    )
      .bind(emailAddress)
      .first();

    if (existing) {
      if (existing.status === 'active') {
        return errorResponse('此郵箱已註冊', 409);
      } else {
        // Reactivate if was unsubscribed
        await c.env.DB.prepare(
          'UPDATE email_subscribers SET status = ?, subscribed_at = CURRENT_TIMESTAMP WHERE email = ?'
        )
          .bind('active', emailAddress)
          .run();

        return successResponse({
          message: '歡迎回來！您已重新訂閱',
          email: emailAddress
        });
      }
    }

    // Insert new subscriber
    const result = await c.env.DB.prepare(
      `INSERT INTO email_subscribers (email, source, ip_address, user_agent) 
       VALUES (?, ?, ?, ?)`
    )
      .bind(
        emailAddress,
        source || 'landing_page',
        ipAddress.substring(0, 45), // Truncate to fit TEXT field
        userAgent.substring(0, 255)
      )
      .run();

    if (!result.success) {
      return errorResponse('提交失敗，請稍後重試', 500);
    }

    return successResponse({
      message: '🎉 謝謝！我們已收到您的郵箱',
      email: emailAddress
    }, 201);

  } catch (error: any) {
    console.error('Email subscribe error:', error);
    return errorResponse('提交失敗，請稍後重試', 500);
  }
});

// Subscribe to mailing list
email.post('/subscribe', async (c) => {
  try {
    const { email: emailAddress, source } = await c.req.json();

    // Validation
    if (!emailAddress) {
      return errorResponse('請輸入郵箱地址', 400);
    }

    if (!validateEmail(emailAddress)) {
      return errorResponse('請輸入有效的郵箱地址', 400);
    }

    // Get IP and User Agent for tracking
    const ipAddress = c.req.header('cf-connecting-ip') || 
                     c.req.header('x-forwarded-for') || 
                     'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';

    // Check if email already exists
    const existing = await c.env.DB.prepare(
      'SELECT id, status FROM email_subscribers WHERE email = ?'
    )
      .bind(emailAddress)
      .first();

    if (existing) {
      if (existing.status === 'active') {
        return errorResponse('此郵箱已註冊', 409);
      } else {
        // Reactivate if was unsubscribed
        await c.env.DB.prepare(
          'UPDATE email_subscribers SET status = ?, subscribed_at = CURRENT_TIMESTAMP WHERE email = ?'
        )
          .bind('active', emailAddress)
          .run();

        return successResponse({
          message: '歡迎回來！您已重新訂閱',
          email: emailAddress
        });
      }
    }

    // Insert new subscriber
    const result = await c.env.DB.prepare(
      `INSERT INTO email_subscribers (email, source, ip_address, user_agent) 
       VALUES (?, ?, ?, ?)`
    )
      .bind(
        emailAddress,
        source || 'landing_page',
        ipAddress.substring(0, 45), // Truncate to fit TEXT field
        userAgent.substring(0, 255)
      )
      .run();

    if (!result.success) {
      return errorResponse('提交失敗，請稍後重試', 500);
    }

    return successResponse({
      message: '🎉 謝謝！我們已收到您的郵箱',
      email: emailAddress
    }, 201);

  } catch (error: any) {
    console.error('Email subscribe error:', error);
    return errorResponse('提交失敗，請稍後重試', 500);
  }
});

// Unsubscribe from mailing list
email.post('/unsubscribe', async (c) => {
  try {
    const { email: emailAddress } = await c.req.json();

    if (!emailAddress || !validateEmail(emailAddress)) {
      return errorResponse('無效的郵箱地址', 400);
    }

    const result = await c.env.DB.prepare(
      'UPDATE email_subscribers SET status = ? WHERE email = ?'
    )
      .bind('unsubscribed', emailAddress)
      .run();

    if (result.meta.changes === 0) {
      return errorResponse('郵箱未找到', 404);
    }

    return successResponse({
      message: '您已成功取消訂閱'
    });

  } catch (error: any) {
    console.error('Email unsubscribe error:', error);
    return errorResponse('操作失敗，請稍後重試', 500);
  }
});

// Get subscriber count (for admin/stats)
email.get('/stats', async (c) => {
  try {
    const stats = await c.env.DB.prepare(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'unsubscribed' THEN 1 END) as unsubscribed
       FROM email_subscribers`
    )
      .first() as any;

    return successResponse(stats);

  } catch (error: any) {
    console.error('Email stats error:', error);
    return errorResponse('獲取統計數據失敗', 500);
  }
});

export default email;
