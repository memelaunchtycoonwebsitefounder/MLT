import { Hono } from 'hono';
import { Env, User, JWTPayload } from '../types';
import {
  hashPassword,
  comparePassword,
  generateToken,
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

// Get current user profile
auth.get('/me', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const userProfile = await c.env.DB.prepare(
      `SELECT id, email, username, virtual_balance, premium_balance, 
              level, xp, achievements, created_at, last_login 
       FROM users WHERE id = ?`
    )
      .bind(user.userId)
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

export default auth;
