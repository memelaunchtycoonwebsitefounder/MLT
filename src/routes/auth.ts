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
    
    console.log('[REGISTER] Attempt for:', email, username);

    // Validation
    if (!email || !username || !password) {
      console.log('[REGISTER] Missing fields');
      return errorResponse('所有欄位都是必填的');
    }

    if (!validateEmail(email)) {
      console.log('[REGISTER] Invalid email format');
      return errorResponse('無效的電子郵件格式');
    }

    if (!validateUsername(username)) {
      console.log('[REGISTER] Invalid username format');
      return errorResponse('用戶名必須是 3-20 個字符，只能包含字母、數字和下劃線');
    }

    if (!validatePassword(password)) {
      console.log('[REGISTER] Invalid password format');
      return errorResponse('密碼必須至少 8 個字符');
    }

    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    )
      .bind(email, username)
      .first();

    if (existingUser) {
      console.log('[REGISTER] User already exists');
      return errorResponse('電子郵件或用戶名已被使用');
    }

    // Hash password
    console.log('[REGISTER] Hashing password...');
    let passwordHash;
    try {
      passwordHash = await hashPassword(password);
      console.log('[REGISTER] Password hashed successfully, length:', passwordHash.length);
    } catch (hashError: any) {
      console.error('[REGISTER] Password hashing error:', hashError.message);
      return errorResponse('密碼處理失敗，請稍後再試', 500);
    }

    // Create user with MLT balance
    const startingBalance = parseFloat(c.env.STARTING_BALANCE || '10000');
    const startingMLT = parseFloat(c.env.STARTING_MLT || '10000');
    
    console.log('[REGISTER] Creating user with balances:', startingBalance, startingMLT);
    
    const result = await c.env.DB.prepare(
      `INSERT INTO users (email, username, password_hash, virtual_balance, mlt_balance) 
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(email, username, passwordHash, startingBalance, startingMLT)
      .run();

    if (!result.success) {
      console.error('[REGISTER] Database insert failed');
      return errorResponse('註冊失敗，請稍後再試', 500);
    }

    // Get the created user
    const newUser = await c.env.DB.prepare(
      'SELECT id, email, username, virtual_balance, mlt_balance FROM users WHERE email = ?'
    )
      .bind(email)
      .first() as any;
      
    console.log('[REGISTER] User created successfully:', newUser.id, newUser.username);

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
          mlt_balance: newUser.mlt_balance || 10000,
        },
      },
      201
    );
  } catch (error: any) {
    console.error('[REGISTER] Unexpected error:', error.message, error.stack);
    return errorResponse('註冊過程中發生錯誤: ' + error.message, 500);
  }
});

// Login
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    console.log('[LOGIN] Attempt for email:', email);

    if (!email || !password) {
      console.log('[LOGIN] Missing credentials');
      return errorResponse('電子郵件和密碼都是必填的');
    }

    // Find user
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    )
      .bind(email)
      .first() as User | null;

    if (!user) {
      console.log('[LOGIN] User not found:', email);
      return errorResponse('無效的電子郵件或密碼');
    }
    
    console.log('[LOGIN] User found:', user.id, user.username);
    console.log('[LOGIN] Password hash length:', user.password_hash?.length);

    // Verify password
    try {
      const isValid = await comparePassword(password, user.password_hash);
      console.log('[LOGIN] Password verification result:', isValid);
      
      if (!isValid) {
        console.log('[LOGIN] Invalid password for user:', email);
        return errorResponse('無效的電子郵件或密碼');
      }
    } catch (pwdError: any) {
      console.error('[LOGIN] Password comparison error:', pwdError.message, pwdError.stack);
      return errorResponse('密碼驗證失敗，請稍後再試', 500);
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
    
    console.log('[LOGIN] Success for user:', user.username);

    return successResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        virtual_balance: user.virtual_balance,
        mlt_balance: user.mlt_balance || 10000,
        premium_balance: user.premium_balance,
        level: user.level,
        xp: user.xp,
      },
    });
  } catch (error: any) {
    console.error('[LOGIN] Unexpected error:', error.message, error.stack);
    return errorResponse('登入過程中發生錯誤: ' + error.message, 500);
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
      `SELECT id, email, username, virtual_balance, mlt_balance, premium_balance, 
              level, experience_points as xp, created_at, last_login
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
      return errorResponse('密碼必須至少 8 個字符,並包含大寫字母、小寫字母、數字和特殊字符');
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

// Email Verification - Send verification email
auth.post('/send-verification', async (c) => {
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
      'SELECT id, email, username, email_verified FROM users WHERE email = ?'
    )
      .bind(email)
      .first() as any;

    if (!user) {
      return errorResponse('用戶不存在', 404);
    }

    if (user.email_verified) {
      return successResponse({
        message: '您的電子郵箱已經驗證過了'
      });
    }

    // Generate verification token
    const verificationToken = Array.from({ length: 32 }, () => 
      Math.random().toString(36).charAt(2)
    ).join('');

    // Token expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Save token to database
    await c.env.DB.prepare(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at) 
       VALUES (?, ?, ?)`
    )
      .bind(user.id, verificationToken, expiresAt)
      .run();

    // In production, send email here
    const host = c.req.header('host') || 'localhost:3000';
    const verificationLink = `https://${host}/verify-email?token=${verificationToken}`;
    console.log('Email verification link:', verificationLink);

    return successResponse({
      message: '驗證連結已發送到您的郵箱',
      // For development only - remove in production
      verificationLink: verificationLink
    });
  } catch (error: any) {
    console.error('Send verification error:', error);
    return errorResponse('發送驗證郵件時發生錯誤', 500);
  }
});

// Email Verification - Verify token
auth.post('/verify-email', async (c) => {
  try {
    const { token } = await c.req.json();

    if (!token) {
      return errorResponse('缺少驗證令牌');
    }

    // Find valid token
    const verificationToken = await c.env.DB.prepare(
      `SELECT * FROM email_verification_tokens 
       WHERE token = ? AND used = 0 AND expires_at > datetime('now')`
    )
      .bind(token)
      .first() as any;

    if (!verificationToken) {
      return errorResponse('無效或已過期的驗證令牌', 400);
    }

    // Update user email_verified status
    await c.env.DB.prepare(
      'UPDATE users SET email_verified = 1 WHERE id = ?'
    )
      .bind(verificationToken.user_id)
      .run();

    // Mark token as used
    await c.env.DB.prepare(
      'UPDATE email_verification_tokens SET used = 1 WHERE id = ?'
    )
      .bind(verificationToken.id)
      .run();

    return successResponse({
      message: '電子郵箱驗證成功！'
    });
  } catch (error: any) {
    console.error('Verify email error:', error);
    return errorResponse('驗證郵箱時發生錯誤', 500);
  }
});

// OAuth - Google Login/Register
auth.get('/oauth/google', async (c) => {
  try {
    // Google OAuth redirect
    const redirectUri = `${c.req.url.split('/oauth')[0]}/oauth/google/callback`;
    const clientId = c.env.GOOGLE_CLIENT_ID || '';
    
    if (!clientId) {
      return errorResponse('Google OAuth 未配置', 500);
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=email profile&` +
      `access_type=offline`;

    return c.redirect(googleAuthUrl);
  } catch (error: any) {
    console.error('Google OAuth initiation error:', error);
    return errorResponse('Google 登入失敗', 500);
  }
});

// OAuth - Google Callback
auth.get('/oauth/google/callback', async (c) => {
  try {
    const code = c.req.query('code');
    
    if (!code) {
      return errorResponse('缺少授權碼', 400);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${c.req.url.split('/oauth')[0]}/oauth/google/callback`,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return errorResponse('獲取 Google 訪問令牌失敗', 400);
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const googleUser = await userResponse.json();

    // Check if user exists
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    )
      .bind(googleUser.email)
      .first() as any;

    if (!user) {
      // Create new user
      const username = googleUser.email.split('@')[0] + Math.floor(Math.random() * 1000);
      const startingBalance = parseFloat(c.env.STARTING_BALANCE || '10000');
      const startingMLT = parseFloat(c.env.STARTING_MLT || '10000');

      await c.env.DB.prepare(
        `INSERT INTO users (email, username, password_hash, virtual_balance, mlt_balance, email_verified, oauth_provider, oauth_id) 
         VALUES (?, ?, ?, ?, ?, 1, 'google', ?)`
      )
        .bind(googleUser.email, username, '', startingBalance, startingMLT, googleUser.id)
        .run();

      user = await c.env.DB.prepare(
        'SELECT * FROM users WHERE email = ?'
      )
        .bind(googleUser.email)
        .first() as any;
    }

    // Generate JWT token
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };
    
    const token = await generateToken(tokenPayload, c.env.JWT_SECRET);

    // Redirect to frontend with token
    return c.redirect(`/dashboard?token=${token}`);
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    return errorResponse('Google 登入處理失敗', 500);
  }
});

// OAuth - Twitter Login/Register
auth.get('/oauth/twitter', async (c) => {
  try {
    const redirectUri = `${c.req.url.split('/oauth')[0]}/oauth/twitter/callback`;
    const clientId = c.env.TWITTER_CLIENT_ID || '';
    
    if (!clientId) {
      return errorResponse('Twitter OAuth 未配置', 500);
    }

    // Twitter OAuth 2.0
    const twitterAuthUrl = `https://twitter.com/i/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=tweet.read users.read&` +
      `state=${Math.random().toString(36).substring(7)}&` +
      `code_challenge=challenge&` +
      `code_challenge_method=plain`;

    return c.redirect(twitterAuthUrl);
  } catch (error: any) {
    console.error('Twitter OAuth initiation error:', error);
    return errorResponse('Twitter 登入失敗', 500);
  }
});

// MetaMask - Web3 Wallet Authentication
auth.post('/web3/metamask', async (c) => {
  try {
    const { address, signature, message } = await c.req.json();

    if (!address || !signature || !message) {
      return errorResponse('缺少必要參數');
    }

    // In production, verify the signature here
    // For now, we'll trust the client-side verification

    // Check if user exists
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE wallet_address = ?'
    )
      .bind(address)
      .first() as any;

    if (!user) {
      // Create new user with wallet
      const username = `user_${address.substring(2, 8)}`;
      const startingBalance = parseFloat(c.env.STARTING_BALANCE || '10000');
      const startingMLT = parseFloat(c.env.STARTING_MLT || '10000');

      await c.env.DB.prepare(
        `INSERT INTO users (email, username, password_hash, virtual_balance, mlt_balance, wallet_address, email_verified) 
         VALUES (?, ?, ?, ?, ?, ?, 1)`
      )
        .bind(`${address}@wallet.local`, username, '', startingBalance, startingMLT, address)
        .run();

      user = await c.env.DB.prepare(
        'SELECT * FROM users WHERE wallet_address = ?'
      )
        .bind(address)
        .first() as any;
    }

    // Generate JWT token
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
        wallet_address: user.wallet_address,
        virtual_balance: user.virtual_balance,
        mlt_balance: user.mlt_balance || 10000,
      },
    });
  } catch (error: any) {
    console.error('MetaMask auth error:', error);
    return errorResponse('MetaMask 認證失敗', 500);
  }
});

export default auth;
