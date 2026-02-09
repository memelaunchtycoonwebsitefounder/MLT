-- Migration: Social Features & Gamification
-- Date: 2026-02-09
-- Description: Add comments, follows, achievements, and enhanced leaderboard

-- Comments table for coin discussions
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  parent_id INTEGER, -- For nested replies
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id),
  FOREIGN KEY (parent_id) REFERENCES comments(id)
);

-- Comment likes
CREATE TABLE IF NOT EXISTS comment_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  comment_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, comment_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (comment_id) REFERENCES comments(id)
);

-- Follow system
CREATE TABLE IF NOT EXISTS follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER NOT NULL,
  following_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id),
  FOREIGN KEY (following_id) REFERENCES users(id),
  CHECK(follower_id != following_id)
);

-- Coin favorites/watchlist
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, coin_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

-- Achievements definitions
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('trading', 'social', 'creation', 'milestone')),
  icon TEXT, -- emoji or icon name
  points INTEGER DEFAULT 100,
  requirement_type TEXT NOT NULL CHECK(requirement_type IN ('count', 'value', 'special')),
  requirement_value INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  achievement_id INTEGER NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT 0,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (achievement_id) REFERENCES achievement_definitions(id)
);

-- Activity feed
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  activity_type TEXT NOT NULL CHECK(activity_type IN ('trade', 'create_coin', 'comment', 'follow', 'achievement')),
  entity_id INTEGER, -- coin_id, trade_id, comment_id, etc.
  entity_type TEXT, -- 'coin', 'trade', 'comment', etc.
  content TEXT, -- JSON or text description
  is_public BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_coin ON comments(coin_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id, completed);

-- Insert achievement definitions
INSERT OR IGNORE INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value) VALUES
  ('first_trade', '首次交易', '完成你的第一筆交易', 'trading', '💰', 50, 'count', 1),
  ('trader_10', '交易新手', '完成 10 筆交易', 'trading', '📈', 100, 'count', 10),
  ('trader_100', '交易專家', '完成 100 筆交易', 'trading', '🎯', 500, 'count', 100),
  ('whale', '巨鯨', '單筆交易超過 10,000 金幣', 'trading', '🐋', 300, 'value', 10000),
  ('profit_king', '盈利之王', '總盈利超過 50,000 金幣', 'trading', '👑', 1000, 'value', 50000),
  
  ('first_coin', '創造者', '創建你的第一個模因幣', 'creation', '🚀', 100, 'count', 1),
  ('popular_coin', '網紅幣', '你的幣種達到 100 個持有者', 'creation', '🔥', 500, 'count', 100),
  ('viral_coin', '病毒傳播', '你的幣種市值超過 1,000,000', 'creation', '💥', 1000, 'value', 1000000),
  
  ('social_butterfly', '社交達人', '獲得 10 個關注者', 'social', '🦋', 200, 'count', 10),
  ('influencer', 'KOL', '獲得 100 個關注者', 'social', '⭐', 500, 'count', 100),
  ('commentator', '評論家', '發表 50 條評論', 'social', '💬', 150, 'count', 50),
  
  ('level_10', '等級 10', '達到等級 10', 'milestone', '🎖️', 300, 'count', 10),
  ('millionaire', '百萬富翁', '總資產達到 1,000,000 金幣', 'milestone', '💎', 1500, 'value', 1000000),
  ('early_adopter', '早期用戶', '註冊後 7 天內完成 10 筆交易', 'milestone', '🌟', 400, 'special', 0);

-- Add follower/following counts to users table (if not exists)
-- Note: These should be updated via triggers or manually in code
