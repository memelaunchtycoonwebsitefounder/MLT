-- User Profiles and Social System
-- Migration: 0009_user_profiles
-- Description: Add user profiles, follows system, and enhanced user data

-- 1. User Profiles Table (擴展用戶資料)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY,
  bio TEXT DEFAULT '',                    -- 個人簡介
  avatar_url TEXT DEFAULT '',             -- 頭像URL
  banner_url TEXT DEFAULT '',             -- 橫幅URL
  location TEXT DEFAULT '',               -- 所在地
  website TEXT DEFAULT '',                -- 個人網站
  twitter_handle TEXT DEFAULT '',         -- Twitter帳號
  discord_handle TEXT DEFAULT '',         -- Discord帳號
  joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_verified INTEGER DEFAULT 0,          -- 是否認證
  is_premium INTEGER DEFAULT 0,           -- 是否高級會員
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 2. User Follows Table (關注系統)
CREATE TABLE IF NOT EXISTS user_follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER NOT NULL,          -- 關注者ID
  following_id INTEGER NOT NULL,         -- 被關注者ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(id),
  FOREIGN KEY (following_id) REFERENCES users(id),
  UNIQUE(follower_id, following_id)      -- 防止重複關注
);

-- 3. User Statistics Table (用戶統計)
CREATE TABLE IF NOT EXISTS user_stats (
  user_id INTEGER PRIMARY KEY,
  total_trades INTEGER DEFAULT 0,        -- 總交易次數
  total_volume REAL DEFAULT 0,           -- 總交易量
  total_profit REAL DEFAULT 0,           -- 總利潤
  total_comments INTEGER DEFAULT 0,      -- 總評論數
  total_likes_given INTEGER DEFAULT 0,   -- 給出的讚數
  total_likes_received INTEGER DEFAULT 0, -- 收到的讚數
  coins_created INTEGER DEFAULT 0,       -- 創建的幣種數
  achievements_unlocked INTEGER DEFAULT 0, -- 解鎖的成就數
  current_streak INTEGER DEFAULT 0,      -- 當前連續登入天數
  longest_streak INTEGER DEFAULT 0,      -- 最長連續登入天數
  last_trade_date DATETIME,              -- 最後交易日期
  last_login_date DATETIME,              -- 最後登入日期
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user ON user_stats(user_id);

-- 5. Initialize profiles for existing users
INSERT OR IGNORE INTO user_profiles (user_id)
SELECT id FROM users;

-- 6. Initialize stats for existing users
INSERT OR IGNORE INTO user_stats (user_id)
SELECT id FROM users;

-- 7. Update user_stats with existing data
UPDATE user_stats
SET total_trades = (
  SELECT COUNT(*) FROM trade_history WHERE buyer_id = user_stats.user_id OR seller_id = user_stats.user_id
),
total_volume = (
  SELECT COALESCE(SUM(total_value), 0) FROM trade_history WHERE buyer_id = user_stats.user_id
),
total_comments = (
  SELECT COUNT(*) FROM comments WHERE user_id = user_stats.user_id AND deleted = 0
),
coins_created = (
  SELECT COUNT(*) FROM coins WHERE creator_id = user_stats.user_id
),
achievements_unlocked = (
  SELECT COUNT(*) FROM user_achievements WHERE user_id = user_stats.user_id
);
