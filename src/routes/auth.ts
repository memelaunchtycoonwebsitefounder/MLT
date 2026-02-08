import { Hono } from 'hono';
import { Env, User, JWTPayload } from '../types';
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  validateEmail,
  validatePassword,
  validateUsername,
  errorResponse,
  successResponse,
} from '../utils';

const auth = new Hono<{ Bindings: Env }>();

// Register
auth.post('/register', async (c) => {
  try {
    const { email, username, password } = await c.req.json();

    // Validation
    if (!email || !username || !password) {
      return errorResponse('所有欄位都是必填的');
    }

    if (!validateEmail(email)) {
      return errorResponse('無效的電子郵件格式');
    }

    if (!validateUsername(username)) {
      return errorResponse('用戶名必須是 3-20 個字符，只能包含字母、數字和下劃線');
    }

    if (!validatePassword(password)) {
      return errorResponse('密碼必須至少 6 個字符');
    }

    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    )
      .bind(email, username)
      .first();

    if (existingUser) {
      return errorResponse('電子郵件或用戶名已被使用');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const startingBalance = parseFloat(c.env.STARTING_BALANCE || '10000');
    
    const result = await c.env.DB.prepare(
      `INSERT INTO users (email, username, password_hash, virtual_balance) 
       VALUES (?, ?, ?, ?)`
    )
      .bind(email, username, passwordHash, startingBalance)
      .run();

    if (!result.success) {
      return errorResponse('註冊失敗，請稍後再試', 500);
    }

    // Get the created user
    const newUser = await c.env.DB.prepare(
      'SELECT id, email, username, virtual_balance FROM users WHERE email = ?'
    )
      .bind(email)
      .first() as any;

    // Generate token
    const tokenPayload: JWTPayload = {
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    };
    
    const token = await generateToken(tokenPayload, c.env.JWT_SECRET);

    return successResponse(
      {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          virtual_balance: newUser.virtual_balance,
        },
      },
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return errorResponse('註冊過程中發生錯誤', 500);
  }
});

// Login
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return errorResponse('電子郵件和密碼都是必填的');
    }

    // Find user
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    )
      .bind(email)
      .first() as User | null;

    if (!user) {
      return errorResponse('無效的電子郵件或密碼');
    }

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      return errorResponse('無效的電子郵件或密碼');
    }

    // Update last login
    await c.env.DB.prepare(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
    )
      .bind(user.id)
      .run();

    // Generate token
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };
    
    const token = await generateToken(tokenPayload, c.env.JWT_SECRET);

    return successResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        virtual_balance: user.virtual_balance,
        premium_balance: user.premium_balance,
        level: user.level,
        xp: user.xp,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse('登入過程中發生錯誤', 500);
  }
});

// Get current user profile (requires manual auth check)
auth.get('/me', async (c) => {
  try {
    // Manually verify token
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('未提供認證令牌', 401);
    }

    const token = authHeader.substring(7);
    const jwtSecret = c.env.JWT_SECRET;
    
    const payload = verifyToken(token, jwtSecret);
    
    if (!payload) {
      return errorResponse('無效或已過期的令牌', 401);
    }

    const userProfile = await c.env.DB.prepare(
      `SELECT id, email, username, virtual_balance, premium_balance, 
              level, xp, achievements, created_at, last_login 
       FROM users WHERE id = ?`
    )
      .bind(payload.userId)
      .first();

    if (!userProfile) {
      return errorResponse('用戶未找到', 404);
    }

    return successResponse(userProfile);
  } catch (error: any) {
    console.error('Get profile error:', error);
    return errorResponse('獲取用戶資料時發生錯誤', 500);
  }
});

// Forgot Password - Request reset token
auth.post('/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return errorResponse('請提供電子郵箱');
    }

    if (!validateEmail(email)) {
      return errorResponse('無效的電子郵件格式');
    }

    // Find user
    const user = await c.env.DB.prepare(
      'SELECT id, email, username FROM users WHERE email = ?'
    )
      .bind(email)
      .first() as any;

    // Always return success (security best practice - don't leak user existence)
    if (!user) {
      return successResponse({
        message: '如果該郵箱已註冊，您將收到密碼重置連結'
      });
    }

    // Generate reset token (simple random string for demo)
    const resetToken = Array.from({ length: 32 }, () => 
      Math.random().toString(36).charAt(2)
    ).join('');

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Save token to database
    await c.env.DB.prepare(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
       VALUES (?, ?, ?)`
    )
      .bind(user.id, resetToken, expiresAt)
      .run();

    // In production, send email here
    // For now, just log the reset link
    const host = c.req.header('host') || 'localhost:3000';
    const resetLink = `https://${host}/reset-password?token=${resetToken}`;
    console.log('Password reset link:', resetLink);

    return successResponse({
      message: '如果該郵箱已註冊，您將收到密碼重置連結',
      // For development only - remove in production
      resetLink: resetLink
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return errorResponse('處理請求時發生錯誤', 500);
  }
});

// Reset Password - Verify token and update password
auth.post('/reset-password', async (c) => {
  try {
    const { token, newPassword } = await c.req.json();

    if (!token || !newPassword) {
      return errorResponse('缺少必要參數');
    }

    if (!validatePassword(newPassword)) {
      return errorResponse('密碼必須至少 6 個字符');
    }

    // Find valid token
    const resetToken = await c.env.DB.prepare(
      `SELECT * FROM password_reset_tokens 
       WHERE token = ? AND used = 0 AND expires_at > datetime('now')`
    )
      .bind(token)
      .first() as any;

    if (!resetToken) {
      return errorResponse('無效或已過期的重置令牌', 400);
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await c.env.DB.prepare(
      'UPDATE users SET password_hash = ? WHERE id = ?'
    )
      .bind(passwordHash, resetToken.user_id)
      .run();

    // Mark token as used
    await c.env.DB.prepare(
      'UPDATE password_reset_tokens SET used = 1 WHERE id = ?'
    )
      .bind(resetToken.id)
      .run();

    return successResponse({
      message: '密碼已成功重置，請使用新密碼登入'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return errorResponse('重置密碼時發生錯誤', 500);
  }
});

// Logout (client-side token removal, but we can track it)
auth.post('/logout', async (c) => {
  try {
    // In a more complex system, you might invalidate the token here
    // For JWT, logout is typically handled client-side by removing the token
    
    return successResponse({
      message: '成功登出'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return errorResponse('登出時發生錯誤', 500);
  }
});

export default auth;
