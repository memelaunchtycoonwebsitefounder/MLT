import { Hono } from 'hono';
import { Env, JWTPayload } from '../types';
import { errorResponse, successResponse } from '../utils';
import { authMiddleware } from '../middleware';

const gamification = new Hono<{ Bindings: Env }>();

// Apply authentication middleware to all gamification routes
gamification.use('*', authMiddleware);

// ==================== ACHIEVEMENTS ====================

// Get all achievements with user progress
gamification.get('/achievements', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) return errorResponse('未授權', 401);
    
    // Get locale from query param or default to 'en'
    const locale = c.req.query('locale') || 'en';
    
    const achievements = await c.env.DB.prepare(
      `SELECT 
        a.id,
        a.key,
        COALESCE(t.name, a.name) as name,
        COALESCE(t.description, a.description) as description,
        a.category,
        a.icon,
        a.points,
        a.requirement_type,
        a.requirement_value,
        a.created_at,
        COALESCE(ua.progress, 0) as user_progress,
        COALESCE(ua.completed, 0) as completed,
        ua.completed_at
       FROM achievement_definitions a
       LEFT JOIN achievement_translations t ON a.id = t.achievement_id AND t.locale = ?
       LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
       ORDER BY a.category, a.points`
    ).bind(locale, user.userId).all();
    
    return successResponse({ achievements: achievements.results });
  } catch (error: any) {
    console.error('Get achievements error:', error);
    return errorResponse('獲取成就失敗', 500);
  }
});

// Check and update user achievements
gamification.post('/achievements/check', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) return errorResponse('未授權', 401);
    
    const newAchievements: any[] = [];
    
    // Get user stats
    const userStats = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(user.userId).first() as any;
    
    // Get trade count
    const tradeCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?'
    ).bind(user.userId).first() as any;
    
    // Get coins created
    const coinsCreated = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM coins WHERE creator_id = ?'
    ).bind(user.userId).first() as any;
    
    // Get comments count
    const commentsCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM comments WHERE user_id = ?'
    ).bind(user.userId).first() as any;
    
    // Get followers count
    const followersCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM follows WHERE following_id = ?'
    ).bind(user.userId).first() as any;
    
    // Check each achievement
    const achievementChecks = [
      { key: 'first_trade', value: tradeCount.count, threshold: 1 },
      { key: 'trader_10', value: tradeCount.count, threshold: 10 },
      { key: 'trader_100', value: tradeCount.count, threshold: 100 },
      { key: 'first_coin', value: coinsCreated.count, threshold: 1 },
      { key: 'commentator', value: commentsCount.count, threshold: 50 },
      { key: 'social_butterfly', value: followersCount.count, threshold: 10 },
      { key: 'influencer', value: followersCount.count, threshold: 100 },
      { key: 'level_10', value: userStats.level, threshold: 10 },
    ];
    
    for (const check of achievementChecks) {
      // Get achievement definition
      const achievement = await c.env.DB.prepare(
        'SELECT * FROM achievement_definitions WHERE key = ?'
      ).bind(check.key).first() as any;
      
      if (!achievement) continue;
      
      // Check if user has this achievement
      const userAchievement = await c.env.DB.prepare(
        'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?'
      ).bind(user.userId, achievement.id).first() as any;
      
      if (!userAchievement) {
        // Create new user achievement
        if (check.value >= check.threshold) {
          await c.env.DB.prepare(
            `INSERT INTO user_achievements 
             (user_id, achievement_id, progress, completed, completed_at)
             VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)`
          ).bind(user.userId, achievement.id, check.value).run();
          
          // Add XP
          await c.env.DB.prepare(
            'UPDATE users SET xp = xp + ? WHERE id = ?'
          ).bind(achievement.points, user.userId).run();
          
          newAchievements.push(achievement);
        } else {
          // Create with progress
          await c.env.DB.prepare(
            `INSERT INTO user_achievements 
             (user_id, achievement_id, progress, completed)
             VALUES (?, ?, ?, 0)`
          ).bind(user.userId, achievement.id, check.value).run();
        }
      } else if (!userAchievement.completed && check.value >= check.threshold) {
        // Complete existing achievement
        await c.env.DB.prepare(
          `UPDATE user_achievements 
           SET completed = 1, completed_at = CURRENT_TIMESTAMP, progress = ?
           WHERE user_id = ? AND achievement_id = ?`
        ).bind(check.value, user.userId, achievement.id).run();
        
        // Add XP
        await c.env.DB.prepare(
          'UPDATE users SET xp = xp + ? WHERE id = ?'
        ).bind(achievement.points, user.userId).run();
        
        newAchievements.push(achievement);
      } else if (!userAchievement.completed) {
        // Update progress
        await c.env.DB.prepare(
          'UPDATE user_achievements SET progress = ? WHERE user_id = ? AND achievement_id = ?'
        ).bind(check.value, user.userId, achievement.id).run();
      }
    }
    
    // Check level up
    const newUserStats = await c.env.DB.prepare(
      'SELECT xp, level FROM users WHERE id = ?'
    ).bind(user.userId).first() as any;
    
    const xpForNextLevel = newUserStats.level * 1000;
    if (newUserStats.xp >= xpForNextLevel) {
      await c.env.DB.prepare(
        'UPDATE users SET level = level + 1, xp = xp - ? WHERE id = ?'
      ).bind(xpForNextLevel, user.userId).run();
    }
    
    return successResponse({
      message: '成就檢查完成',
      newAchievements,
      count: newAchievements.length
    });
  } catch (error: any) {
    console.error('Check achievements error:', error);
    return errorResponse('檢查成就失敗', 500);
  }
});

// ==================== LEADERBOARD ====================

// Get leaderboard (enhanced)
gamification.get('/leaderboard', async (c) => {
  try {
    const type = c.req.query('type') || 'networth'; // networth, trades, level, profit
    const limit = parseInt(c.req.query('limit') || '100');
    
    let query = '';
    let orderBy = '';
    
    switch (type) {
      case 'networth':
        query = `
          SELECT 
            u.id, u.username, u.level, u.xp,
            u.virtual_balance + COALESCE(
              (SELECT SUM(h.amount * c.current_price) 
               FROM holdings h 
               JOIN coins c ON h.coin_id = c.id 
               WHERE h.user_id = u.id), 0
            ) as total_networth,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
            (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id AND completed = 1) as achievements_count
          FROM users u
          ORDER BY total_networth DESC
          LIMIT ?
        `;
        break;
        
      case 'trades':
        query = `
          SELECT 
            u.id, u.username, u.level, u.xp,
            COUNT(t.id) as trade_count,
            u.virtual_balance as balance,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count
          FROM users u
          LEFT JOIN transactions t ON u.id = t.user_id
          GROUP BY u.id
          ORDER BY trade_count DESC
          LIMIT ?
        `;
        break;
        
      case 'level':
        query = `
          SELECT 
            u.id, u.username, u.level, u.xp,
            u.virtual_balance as balance,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
            (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id AND completed = 1) as achievements_count
          FROM users u
          ORDER BY u.level DESC, u.xp DESC
          LIMIT ?
        `;
        break;
        
      case 'profit':
        query = `
          SELECT 
            u.id, u.username, u.level, u.xp,
            COALESCE(
              (SELECT SUM(
                (h.amount * c.current_price) - (h.amount * h.avg_buy_price)
              )
              FROM holdings h 
              JOIN coins c ON h.coin_id = c.id 
              WHERE h.user_id = u.id), 0
            ) as total_profit,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count
          FROM users u
          ORDER BY total_profit DESC
          LIMIT ?
        `;
        break;
        
      default:
        query = `
          SELECT u.id, u.username, u.level, u.xp, u.virtual_balance as balance
          FROM users u
          ORDER BY u.virtual_balance DESC
          LIMIT ?
        `;
    }
    
    const result = await c.env.DB.prepare(query).bind(limit).all();
    
    return successResponse({
      leaderboard: result.results,
      type
    });
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    return errorResponse('獲取排行榜失敗', 500);
  }
});

// Get user rank
gamification.get('/rank/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'));
    
    // Calculate rank by networth
    const rank = await c.env.DB.prepare(
      `SELECT COUNT(*) + 1 as rank
       FROM users u
       WHERE (u.virtual_balance + COALESCE(
         (SELECT SUM(h.amount * c.current_price) 
          FROM holdings h 
          JOIN coins c ON h.coin_id = c.id 
          WHERE h.user_id = u.id), 0
       )) > (
         SELECT u2.virtual_balance + COALESCE(
           (SELECT SUM(h2.amount * c2.current_price) 
            FROM holdings h2 
            JOIN coins c2 ON h2.coin_id = c2.id 
            WHERE h2.user_id = u2.id), 0
         )
         FROM users u2
         WHERE u2.id = ?
       )`
    ).bind(userId).first() as any;
    
    return successResponse({ rank: rank.rank });
  } catch (error: any) {
    console.error('Get rank error:', error);
    return errorResponse('獲取排名失敗', 500);
  }
});

export default gamification;
