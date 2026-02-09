import { Hono } from 'hono';
import { Env, JWTPayload } from '../types';
import { errorResponse, successResponse } from '../utils';

const social = new Hono<{ Bindings: Env }>();

// ==================== COMMENTS ====================

// Get comments for a coin
social.get('/comments/:coinId', async (c) => {
  try {
    const coinId = parseInt(c.req.param('coinId'));
    const limit = parseInt(c.req.query('limit') || '50');
    
    const comments = await c.env.DB.prepare(
      `SELECT 
        c.*,
        u.username,
        u.level,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as likes_count
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.coin_id = ? AND c.parent_id IS NULL
       ORDER BY c.created_at DESC
       LIMIT ?`
    ).bind(coinId, limit).all();
    
    return successResponse({ comments: comments.results });
  } catch (error: any) {
    console.error('Get comments error:', error);
    return errorResponse('獲取評論失敗', 500);
  }
});

// Post a comment
social.post('/comments', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) return errorResponse('未授權', 401);
    
    const { coinId, content, parentId } = await c.req.json();
    
    if (!coinId || !content || content.trim().length === 0) {
      return errorResponse('請提供有效的內容');
    }
    
    if (content.length > 1000) {
      return errorResponse('評論長度不能超過 1000 字');
    }
    
    const result = await c.env.DB.prepare(
      `INSERT INTO comments (user_id, coin_id, parent_id, content)
       VALUES (?, ?, ?, ?)`
    ).bind(user.userId, coinId, parentId || null, content).run();
    
    // Create activity
    await c.env.DB.prepare(
      `INSERT INTO activities (user_id, activity_type, entity_id, entity_type, content)
       VALUES (?, 'comment', ?, 'coin', ?)`
    ).bind(user.userId, coinId, content.substring(0, 100)).run();
    
    return successResponse({
      commentId: result.meta.last_row_id,
      message: '評論發表成功'
    });
  } catch (error: any) {
    console.error('Post comment error:', error);
    return errorResponse('發表評論失敗', 500);
  }
});

// Like a comment
social.post('/comments/:id/like', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) return errorResponse('未授權', 401);
    
    const commentId = parseInt(c.req.param('id'));
    
    // Toggle like
    const existing = await c.env.DB.prepare(
      'SELECT id FROM comment_likes WHERE user_id = ? AND comment_id = ?'
    ).bind(user.userId, commentId).first();
    
    if (existing) {
      // Unlike
      await c.env.DB.prepare(
        'DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?'
      ).bind(user.userId, commentId).run();
      
      return successResponse({ liked: false, message: '已取消按讚' });
    } else {
      // Like
      await c.env.DB.prepare(
        'INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)'
      ).bind(user.userId, commentId).run();
      
      return successResponse({ liked: true, message: '已按讚' });
    }
  } catch (error: any) {
    console.error('Like comment error:', error);
    return errorResponse('操作失敗', 500);
  }
});

// ==================== FOLLOWS ====================

// Follow a user
social.post('/follow/:userId', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) return errorResponse('未授權', 401);
    
    const targetUserId = parseInt(c.req.param('userId'));
    
    if (user.userId === targetUserId) {
      return errorResponse('不能關注自己');
    }
    
    // Check if already following
    const existing = await c.env.DB.prepare(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?'
    ).bind(user.userId, targetUserId).first();
    
    if (existing) {
      return errorResponse('已經關注該用戶');
    }
    
    await c.env.DB.prepare(
      'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)'
    ).bind(user.userId, targetUserId).run();
    
    // Create activity
    await c.env.DB.prepare(
      `INSERT INTO activities (user_id, activity_type, entity_id, entity_type)
       VALUES (?, 'follow', ?, 'user')`
    ).bind(user.userId, targetUserId).run();
    
    return successResponse({ message: '關注成功' });
  } catch (error: any) {
    console.error('Follow error:', error);
    return errorResponse('關注失敗', 500);
  }
});

// Unfollow a user
social.delete('/follow/:userId', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) return errorResponse('未授權', 401);
    
    const targetUserId = parseInt(c.req.param('userId'));
    
    await c.env.DB.prepare(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?'
    ).bind(user.userId, targetUserId).run();
    
    return successResponse({ message: '已取消關注' });
  } catch (error: any) {
    console.error('Unfollow error:', error);
    return errorResponse('取消關注失敗', 500);
  }
});

// Get followers
social.get('/followers/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'));
    
    const followers = await c.env.DB.prepare(
      `SELECT u.id, u.username, u.level, u.xp
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ?
       ORDER BY f.created_at DESC`
    ).bind(userId).all();
    
    return successResponse({ followers: followers.results });
  } catch (error: any) {
    console.error('Get followers error:', error);
    return errorResponse('獲取粉絲列表失敗', 500);
  }
});

// Get following
social.get('/following/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'));
    
    const following = await c.env.DB.prepare(
      `SELECT u.id, u.username, u.level, u.xp
       FROM follows f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = ?
       ORDER BY f.created_at DESC`
    ).bind(userId).all();
    
    return successResponse({ following: following.results });
  } catch (error: any) {
    console.error('Get following error:', error);
    return errorResponse('獲取關注列表失敗', 500);
  }
});

// ==================== FAVORITES ====================

// Add to favorites
social.post('/favorites', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) return errorResponse('未授權', 401);
    
    const { coinId } = await c.req.json();
    
    await c.env.DB.prepare(
      'INSERT OR IGNORE INTO favorites (user_id, coin_id) VALUES (?, ?)'
    ).bind(user.userId, coinId).run();
    
    return successResponse({ message: '已加入我的最愛' });
  } catch (error: any) {
    console.error('Add favorite error:', error);
    return errorResponse('添加失敗', 500);
  }
});

// Remove from favorites
social.delete('/favorites/:coinId', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) return errorResponse('未授權', 401);
    
    const coinId = parseInt(c.req.param('coinId'));
    
    await c.env.DB.prepare(
      'DELETE FROM favorites WHERE user_id = ? AND coin_id = ?'
    ).bind(user.userId, coinId).run();
    
    return successResponse({ message: '已從我的最愛移除' });
  } catch (error: any) {
    console.error('Remove favorite error:', error);
    return errorResponse('移除失敗', 500);
  }
});

// Get user's favorites
social.get('/favorites', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) return errorResponse('未授權', 401);
    
    const favorites = await c.env.DB.prepare(
      `SELECT c.*, f.created_at as favorited_at
       FROM favorites f
       JOIN coins c ON f.coin_id = c.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`
    ).bind(user.userId).all();
    
    return successResponse({ favorites: favorites.results });
  } catch (error: any) {
    console.error('Get favorites error:', error);
    return errorResponse('獲取我的最愛失敗', 500);
  }
});

// ==================== ACTIVITY FEED ====================

// Get activity feed (following + own)
social.get('/feed', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) return errorResponse('未授權', 401);
    
    const limit = parseInt(c.req.query('limit') || '50');
    
    const activities = await c.env.DB.prepare(
      `SELECT 
        a.*,
        u.username,
        u.level
       FROM activities a
       JOIN users u ON a.user_id = u.id
       WHERE a.is_public = 1 
         AND (a.user_id = ? OR a.user_id IN (
           SELECT following_id FROM follows WHERE follower_id = ?
         ))
       ORDER BY a.created_at DESC
       LIMIT ?`
    ).bind(user.userId, user.userId, limit).all();
    
    return successResponse({ activities: activities.results });
  } catch (error: any) {
    console.error('Get feed error:', error);
    return errorResponse('獲取動態失敗', 500);
  }
});

export default social;
