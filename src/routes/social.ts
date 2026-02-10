import { Hono } from 'hono';
import { Env, JWTPayload } from '../types';
import { errorResponse, successResponse } from '../utils';

const social = new Hono<{ Bindings: Env }>();

// ==================== COMMENTS ====================

// Get comments for a coin with nested replies
social.get('/comments/:coinId', async (c) => {
  try {
    const coinId = parseInt(c.req.param('coinId'));
    const limit = parseInt(c.req.query('limit') || '50');
    const sortBy = c.req.query('sortBy') || 'time'; // time, hot
    const userId = c.req.query('userId'); // For checking if user liked
    
    let orderBy = 'c.created_at DESC';
    if (sortBy === 'hot') {
      orderBy = '(SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) DESC, c.created_at DESC';
    }
    
    // Get top-level comments
    const comments = await c.env.DB.prepare(
      `SELECT 
        c.*,
        u.username,
        u.level,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE parent_id = c.id) as replies_count
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.coin_id = ? AND c.parent_id IS NULL AND c.deleted = 0
       ORDER BY ${orderBy}
       LIMIT ?`
    ).bind(coinId, limit).all();
    
    // Get user's likes if userId provided
    let userLikes = new Set();
    if (userId) {
      const likes = await c.env.DB.prepare(
        `SELECT comment_id FROM comment_likes WHERE user_id = ?`
      ).bind(parseInt(userId)).all();
      userLikes = new Set(likes.results.map((l: any) => l.comment_id));
    }
    
    // For each comment, get up to 3 replies
    const commentsWithReplies = await Promise.all(
      comments.results.map(async (comment: any) => {
        const replies = await c.env.DB.prepare(
          `SELECT 
            c.*,
            u.username,
            u.level,
            (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE parent_id = c.id) as replies_count
           FROM comments c
           LEFT JOIN users u ON c.user_id = u.id
           WHERE c.parent_id = ? AND c.deleted = 0
           ORDER BY c.created_at ASC
           LIMIT 3`
        ).bind(comment.id).all();
        
        return {
          ...comment,
          user_liked: userLikes.has(comment.id),
          replies: replies.results.map((r: any) => ({
            ...r,
            user_liked: userLikes.has(r.id)
          })),
          has_more_replies: comment.replies_count > 3
        };
      })
    );
    
    return successResponse({ comments: commentsWithReplies });
  } catch (error: any) {
    console.error('Get comments error:', error);
    return errorResponse('獲取評論失敗', 500);
  }
});

// Get more replies for a comment
social.get('/comments/:commentId/replies', async (c) => {
  try {
    const commentId = parseInt(c.req.param('commentId'));
    const offset = parseInt(c.req.query('offset') || '0');
    const limit = parseInt(c.req.query('limit') || '10');
    const userId = c.req.query('userId');
    
    const replies = await c.env.DB.prepare(
      `SELECT 
        c.*,
        u.username,
        u.level,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE parent_id = c.id) as replies_count
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.parent_id = ? AND c.deleted = 0
       ORDER BY c.created_at ASC
       LIMIT ? OFFSET ?`
    ).bind(commentId, limit, offset).all();
    
    // Get user's likes if userId provided
    let userLikes = new Set();
    if (userId) {
      const likes = await c.env.DB.prepare(
        `SELECT comment_id FROM comment_likes WHERE user_id = ?`
      ).bind(parseInt(userId)).all();
      userLikes = new Set(likes.results.map((l: any) => l.comment_id));
    }
    
    const repliesWithLikes = replies.results.map((r: any) => ({
      ...r,
      user_liked: userLikes.has(r.id)
    }));
    
    return successResponse({ replies: repliesWithLikes });
  } catch (error: any) {
    console.error('Get replies error:', error);
    return errorResponse('獲取回覆失敗', 500);
  }
});

// Edit a comment
social.put('/comments/:id', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) return errorResponse('未授權', 401);
    
    const commentId = parseInt(c.req.param('id'));
    const { content } = await c.req.json();
    
    if (!content || content.trim().length === 0) {
      return errorResponse('請提供有效的內容');
    }
    
    if (content.length > 1000) {
      return errorResponse('評論長度不能超過 1000 字');
    }
    
    // Check if user owns the comment
    const comment = await c.env.DB.prepare(
      'SELECT user_id FROM comments WHERE id = ?'
    ).bind(commentId).first() as any;
    
    if (!comment || comment.user_id !== user.userId) {
      return errorResponse('無權編輯此評論', 403);
    }
    
    await c.env.DB.prepare(
      `UPDATE comments 
       SET content = ?, edited_at = CURRENT_TIMESTAMP 
       WHERE id = ?`
    ).bind(content, commentId).run();
    
    return successResponse({ message: '評論已更新' });
  } catch (error: any) {
    console.error('Edit comment error:', error);
    return errorResponse('編輯評論失敗', 500);
  }
});

// Delete a comment (soft delete)
social.delete('/comments/:id', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) return errorResponse('未授權', 401);
    
    const commentId = parseInt(c.req.param('id'));
    
    // Check if user owns the comment
    const comment = await c.env.DB.prepare(
      'SELECT user_id FROM comments WHERE id = ?'
    ).bind(commentId).first() as any;
    
    if (!comment || comment.user_id !== user.userId) {
      return errorResponse('無權刪除此評論', 403);
    }
    
    // Soft delete
    await c.env.DB.prepare(
      `UPDATE comments 
       SET deleted = 1, content = '[已刪除]'
       WHERE id = ?`
    ).bind(commentId).run();
    
    return successResponse({ message: '評論已刪除' });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    return errorResponse('刪除評論失敗', 500);
  }
});

// Pin/Unpin a comment (coin creator or admin only)
social.post('/comments/:id/pin', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) return errorResponse('未授權', 401);
    
    const commentId = parseInt(c.req.param('id'));
    
    // Get comment and coin info
    const comment = await c.env.DB.prepare(
      `SELECT c.coin_id, co.creator_id 
       FROM comments c
       JOIN coins co ON c.coin_id = co.id
       WHERE c.id = ?`
    ).bind(commentId).first() as any;
    
    if (!comment) {
      return errorResponse('評論不存在', 404);
    }
    
    // Check if user is coin creator
    if (comment.creator_id !== user.userId) {
      return errorResponse('只有幣種創建者可以釘選評論', 403);
    }
    
    // Toggle pin status
    const currentComment = await c.env.DB.prepare(
      'SELECT pinned FROM comments WHERE id = ?'
    ).bind(commentId).first() as any;
    
    const newPinStatus = currentComment.pinned ? 0 : 1;
    
    await c.env.DB.prepare(
      'UPDATE comments SET pinned = ? WHERE id = ?'
    ).bind(newPinStatus, commentId).run();
    
    return successResponse({ 
      pinned: newPinStatus === 1,
      message: newPinStatus ? '評論已釘選' : '已取消釘選'
    });
  } catch (error: any) {
    console.error('Pin comment error:', error);
    return errorResponse('操作失敗', 500);
  }
});

// Report a comment
social.post('/comments/:id/report', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;
    if (!user) return errorResponse('未授權', 401);
    
    const commentId = parseInt(c.req.param('id'));
    const { reason } = await c.req.json();
    
    if (!reason || reason.trim().length === 0) {
      return errorResponse('請提供舉報原因');
    }
    
    // Check if already reported by this user
    const existing = await c.env.DB.prepare(
      'SELECT id FROM comment_reports WHERE user_id = ? AND comment_id = ?'
    ).bind(user.userId, commentId).first();
    
    if (existing) {
      return errorResponse('您已舉報過此評論');
    }
    
    // Create report (need to add comment_reports table in migration)
    await c.env.DB.prepare(
      `INSERT INTO comment_reports (user_id, comment_id, reason)
       VALUES (?, ?, ?)`
    ).bind(user.userId, commentId, reason).run();
    
    return successResponse({ message: '舉報已提交，感謝您的反饋' });
  } catch (error: any) {
    console.error('Report comment error:', error);
    return errorResponse('舉報失敗', 500);
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

// Get recent comments across all coins
social.get('/recent-comments', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const page = parseInt(c.req.query('page') || '1');
    const offset = (page - 1) * limit;
    
    const comments = await c.env.DB.prepare(
      `SELECT 
        c.*,
        u.username,
        u.level,
        co.name as coin_name,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as likes_count
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN coins co ON c.coin_id = co.id
       WHERE c.deleted = 0
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();
    
    return successResponse({ comments: comments.results });
  } catch (error: any) {
    console.error('Get recent comments error:', error);
    return errorResponse('獲取最新評論失敗', 500);
  }
});

// Get popular comments (by likes)
social.get('/popular-comments', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const page = parseInt(c.req.query('page') || '1');
    const offset = (page - 1) * limit;
    const timeframe = c.req.query('timeframe') || '7d'; // 1d, 7d, 30d, all
    
    let timeFilter = '';
    if (timeframe === '1d') {
      timeFilter = "AND c.created_at >= datetime('now', '-1 day')";
    } else if (timeframe === '7d') {
      timeFilter = "AND c.created_at >= datetime('now', '-7 days')";
    } else if (timeframe === '30d') {
      timeFilter = "AND c.created_at >= datetime('now', '-30 days')";
    }
    
    const comments = await c.env.DB.prepare(
      `SELECT 
        c.*,
        u.username,
        u.level,
        co.name as coin_name,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as likes_count
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN coins co ON c.coin_id = co.id
       WHERE c.deleted = 0 ${timeFilter}
       ORDER BY likes_count DESC, c.created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();
    
    return successResponse({ comments: comments.results });
  } catch (error: any) {
    console.error('Get popular comments error:', error);
    return errorResponse('獲取熱門評論失敗', 500);
  }
});

// Get social statistics
social.get('/stats', async (c) => {
  try {
    // Total comments
    const totalComments = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM comments WHERE deleted = 0`
    ).first();
    
    // Today's comments
    const todayComments = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM comments 
       WHERE deleted = 0 AND created_at >= datetime('now', 'start of day')`
    ).first();
    
    // Active users (users who commented in last 7 days)
    const activeUsers = await c.env.DB.prepare(
      `SELECT COUNT(DISTINCT user_id) as count FROM comments 
       WHERE deleted = 0 AND created_at >= datetime('now', '-7 days')`
    ).first();
    
    return successResponse({
      total_comments: (totalComments as any)?.count || 0,
      today_comments: (todayComments as any)?.count || 0,
      active_users: (activeUsers as any)?.count || 0
    });
  } catch (error: any) {
    console.error('Get social stats error:', error);
    return errorResponse('獲取社交統計失敗', 500);
  }
});

export default social;
