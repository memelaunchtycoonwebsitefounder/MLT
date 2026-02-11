import { Hono } from 'hono'

const profile = new Hono<{ Bindings: { DB: D1Database; JWT_SECRET: string } }>()

// Note: Authentication is handled by authMiddleware in index.tsx
// No need to apply JWT middleware again here

// GET /api/profile/:userId - Get user profile
profile.get('/:userId', async (c) => {
  const { DB } = c.env
  const userId = parseInt(c.req.param('userId'))
  const currentUserId = c.get('user')?.userId

  try {
    // Get user basic info
    const user = await DB.prepare(`
      SELECT u.id, u.username, u.email, u.level, u.xp, u.virtual_balance, u.premium_balance,
             p.bio, p.avatar_url, p.banner_url, p.location, p.website, 
             p.twitter_handle, p.discord_handle, p.joined_date, p.last_active,
             p.is_verified, p.is_premium
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `).bind(userId).first()

    if (!user) {
      return c.json({ error: '用戶不存在' }, 404)
    }

    // Get user stats
    const stats = await DB.prepare(`
      SELECT * FROM user_stats WHERE user_id = ?
    `).bind(userId).first()

    // Get followers/following counts
    const followStats = await DB.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM user_follows WHERE following_id = ?) as followers_count,
        (SELECT COUNT(*) FROM user_follows WHERE follower_id = ?) as following_count
    `).bind(userId, userId).first()

    // Check if current user is following this user
    let isFollowing = false
    if (currentUserId && currentUserId !== userId) {
      const follow = await DB.prepare(`
        SELECT id FROM user_follows WHERE follower_id = ? AND following_id = ?
      `).bind(currentUserId, userId).first()
      isFollowing = !!follow
    }

    return c.json({
      success: true,
      data: {
        user: {
          ...user,
          // Don't expose email to others
          email: currentUserId === userId ? user.email : undefined
        },
        stats,
        followStats,
        isFollowing,
        isOwnProfile: currentUserId === userId
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return c.json({ error: '獲取用戶資料失敗' }, 500)
  }
})

// PATCH /api/profile - Update own profile
profile.patch('/', async (c) => {
  const { DB } = c.env
  const userId = c.get('user')?.userId

  try {
    const body = await c.req.json()
    const { bio, avatar_url, banner_url, location, website, twitter_handle, discord_handle } = body

    // Insert or update user profile
    await DB.prepare(`
      INSERT INTO user_profiles (user_id, bio, avatar_url, banner_url, location, website, twitter_handle, discord_handle, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        bio = COALESCE(?, bio),
        avatar_url = COALESCE(?, avatar_url),
        banner_url = COALESCE(?, banner_url),
        location = COALESCE(?, location),
        website = COALESCE(?, website),
        twitter_handle = COALESCE(?, twitter_handle),
        discord_handle = COALESCE(?, discord_handle),
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      userId,
      bio ?? '',
      avatar_url ?? '',
      banner_url ?? '',
      location ?? '',
      website ?? '',
      twitter_handle ?? '',
      discord_handle ?? '',
      bio ?? null,
      avatar_url ?? null,
      banner_url ?? null,
      location ?? null,
      website ?? null,
      twitter_handle ?? null,
      discord_handle ?? null
    ).run()

    // Get updated profile
    const profile = await DB.prepare(`
      SELECT * FROM user_profiles WHERE user_id = ?
    `).bind(userId).first()

    return c.json({
      success: true,
      message: '資料更新成功',
      data: profile
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return c.json({ error: '更新資料失敗' }, 500)
  }
})

// POST /api/profile/:userId/follow - Follow a user
profile.post('/:userId/follow', async (c) => {
  const { DB } = c.env
  const followingId = parseInt(c.req.param('userId'))
  const followerId = c.get('user')?.userId

  if (followerId === followingId) {
    return c.json({ error: '不能關注自己' }, 400)
  }

  try {
    // Check if already following
    const existing = await DB.prepare(`
      SELECT id FROM user_follows WHERE follower_id = ? AND following_id = ?
    `).bind(followerId, followingId).first()

    if (existing) {
      return c.json({ error: '已經關注此用戶' }, 400)
    }

    // Add follow
    await DB.prepare(`
      INSERT INTO user_follows (follower_id, following_id)
      VALUES (?, ?)
    `).bind(followerId, followingId).run()

    return c.json({
      success: true,
      message: '關注成功'
    })
  } catch (error) {
    console.error('Follow error:', error)
    return c.json({ error: '關注失敗' }, 500)
  }
})

// DELETE /api/profile/:userId/follow - Unfollow a user
profile.delete('/:userId/follow', async (c) => {
  const { DB } = c.env
  const followingId = parseInt(c.req.param('userId'))
  const followerId = c.get('user')?.userId

  try {
    await DB.prepare(`
      DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?
    `).bind(followerId, followingId).run()

    return c.json({
      success: true,
      message: '取消關注成功'
    })
  } catch (error) {
    console.error('Unfollow error:', error)
    return c.json({ error: '取消關注失敗' }, 500)
  }
})

// GET /api/profile/:userId/followers - Get followers list
profile.get('/:userId/followers', async (c) => {
  const { DB } = c.env
  const userId = parseInt(c.req.param('userId'))
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = parseInt(c.req.query('offset') || '0')

  try {
    const followers = await DB.prepare(`
      SELECT u.id, u.username, u.level, p.avatar_url, p.bio, p.is_verified
      FROM user_follows f
      JOIN users u ON f.follower_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all()

    const total = await DB.prepare(`
      SELECT COUNT(*) as count FROM user_follows WHERE following_id = ?
    `).bind(userId).first()

    return c.json({
      success: true,
      data: {
        followers: followers.results,
        total: total?.count || 0,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('Get followers error:', error)
    return c.json({ error: '獲取粉絲列表失敗' }, 500)
  }
})

// GET /api/profile/:userId/following - Get following list
profile.get('/:userId/following', async (c) => {
  const { DB } = c.env
  const userId = parseInt(c.req.param('userId'))
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = parseInt(c.req.query('offset') || '0')

  try {
    const following = await DB.prepare(`
      SELECT u.id, u.username, u.level, p.avatar_url, p.bio, p.is_verified
      FROM user_follows f
      JOIN users u ON f.following_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all()

    const total = await DB.prepare(`
      SELECT COUNT(*) as count FROM user_follows WHERE follower_id = ?
    `).bind(userId).first()

    return c.json({
      success: true,
      data: {
        following: following.results,
        total: total?.count || 0,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('Get following error:', error)
    return c.json({ error: '獲取關注列表失敗' }, 500)
  }
})

// GET /api/profile/:userId/trades - Get user trade history
profile.get('/:userId/trades', async (c) => {
  const { DB } = c.env
  const userId = parseInt(c.req.param('userId'))
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = parseInt(c.req.query('offset') || '0')
  const type = c.req.query('type') // 'buy', 'sell', or 'all'

  try {
    let query = `
      SELECT 
        t.id, t.amount, t.price, t.total_value, t.timestamp, t.trade_type,
        CASE 
          WHEN t.buyer_id = ? THEN 'buy'
          ELSE 'sell'
        END as action,
        c.id as coin_id, c.name as coin_name, c.symbol as coin_symbol, c.image_url as coin_image
      FROM trade_history t
      JOIN coins c ON t.coin_id = c.id
      WHERE t.buyer_id = ? OR t.seller_id = ?
    `

    const params = [userId, userId, userId]

    if (type === 'buy') {
      query += ' AND t.buyer_id = ?'
      params.push(userId)
    } else if (type === 'sell') {
      query += ' AND t.seller_id = ?'
      params.push(userId)
    }

    query += ' ORDER BY t.timestamp DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const trades = await DB.prepare(query).bind(...params).all()

    const total = await DB.prepare(`
      SELECT COUNT(*) as count FROM trade_history
      WHERE buyer_id = ? OR seller_id = ?
    `).bind(userId, userId).first()

    return c.json({
      success: true,
      data: {
        trades: trades.results,
        total: total?.count || 0,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('Get trades error:', error)
    return c.json({ error: '獲取交易記錄失敗' }, 500)
  }
})

// GET /api/profile/:userId/achievements - Get user achievements
profile.get('/:userId/achievements', async (c) => {
  const { DB } = c.env
  const userId = parseInt(c.req.param('userId'))

  try {
    // Get user achievements
    const achievements = await DB.prepare(`
      SELECT 
        ad.key, ad.name, ad.description, ad.icon, ad.rarity, ad.xp_reward,
        ua.unlocked_at, ua.progress, ua.target
      FROM user_achievements ua
      JOIN achievement_definitions ad ON ua.achievement_key = ad.key
      WHERE ua.user_id = ?
      ORDER BY ua.unlocked_at DESC
    `).bind(userId).all()

    // Get achievement stats
    const stats = await DB.prepare(`
      SELECT 
        COUNT(*) as total_unlocked,
        COALESCE(SUM(ad.xp_reward), 0) as total_xp_earned
      FROM user_achievements ua
      JOIN achievement_definitions ad ON ua.achievement_key = ad.key
      WHERE ua.user_id = ?
    `).bind(userId).first()

    // Get total available achievements
    const totalAvailable = await DB.prepare(`
      SELECT COUNT(*) as count FROM achievement_definitions
    `).first()

    return c.json({
      success: true,
      data: {
        achievements: achievements.results || [],
        stats: {
          total_unlocked: stats?.total_unlocked || 0,
          total_xp_earned: stats?.total_xp_earned || 0,
          total_available: totalAvailable?.count || 0,
          completion_rate: totalAvailable?.count > 0 
            ? ((stats?.total_unlocked || 0) / totalAvailable.count * 100).toFixed(1)
            : 0
        }
      }
    })
  } catch (error) {
    console.error('Get achievements error:', error)
    // Return empty data instead of error for better UX
    return c.json({
      success: true,
      data: {
        achievements: [],
        stats: {
          total_unlocked: 0,
          total_xp_earned: 0,
          total_available: 0,
          completion_rate: 0
        }
      }
    })
  }
})

export default profile
