PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" VALUES(1,'0001_initial_schema.sql','2026-02-11 11:02:36');
INSERT INTO "d1_migrations" VALUES(2,'0002_email_subscribers.sql','2026-02-11 11:02:36');
INSERT INTO "d1_migrations" VALUES(3,'0003_auth_enhancements.sql','2026-02-11 11:02:37');
INSERT INTO "d1_migrations" VALUES(4,'0003_password_reset.sql','2026-02-11 11:02:37');
INSERT INTO "d1_migrations" VALUES(5,'0004_advanced_trading.sql','2026-02-11 11:02:38');
INSERT INTO "d1_migrations" VALUES(6,'0005_social_gamification.sql','2026-02-11 11:02:38');
INSERT INTO "d1_migrations" VALUES(7,'0006_add_achievement_rarity.sql','2026-02-11 11:02:39');
INSERT INTO "d1_migrations" VALUES(8,'0007_add_user_gamification_fields.sql','2026-02-11 11:02:39');
INSERT INTO "d1_migrations" VALUES(9,'0008_social_enhancements.sql','2026-02-11 11:02:40');
INSERT INTO "d1_migrations" VALUES(10,'0009_user_profiles.sql','2026-02-11 11:02:40');
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  virtual_balance REAL DEFAULT 10000.0,
  premium_balance REAL DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  achievements TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT 0
, remember_me_token TEXT, remember_me_expires DATETIME, experience_points INTEGER DEFAULT 0, followers_count INTEGER DEFAULT 0, following_count INTEGER DEFAULT 0);
INSERT INTO "users" VALUES(1,'profile-test@example.com','ProfileUser','$2b$10$dvmYJrNAAVEPa.y3mr0N4u4/ZZmtZnvi5QSI9SrRx1ieDrx2BGmsS',10000,0,1,0,'[]','2026-02-11 11:05:29','2026-02-11 11:05:29',0,NULL,NULL,0,0,0);
INSERT INTO "users" VALUES(2,'testuser7788@example.com','TestUser24547','$2b$10$.0YMZBu23UjAin.EUmEhleDBblt0ScpI2rnHrLAP/9AfxEJ0bm8im',10000,0,1,0,'[]','2026-02-11 11:05:39','2026-02-11 11:05:39',0,NULL,NULL,0,0,0);
INSERT INTO "users" VALUES(3,'testuser28733@example.com','TestUser29038','$2b$10$Fx7pqvK.4TvYwJrPerIKVeIChJSCIJ0pdVLT8J9.LTQP6yGtV2qTu',10000,0,1,0,'[]','2026-02-11 11:06:11','2026-02-11 11:06:11',0,NULL,NULL,0,0,0);
INSERT INTO "users" VALUES(4,'manual1770808020@example.com','Manual1770808020','$2b$10$XHEbC9RZQS4CQ0GK71E3G.jAVdOeRfw23EVJJZg28EtF1SVTbuvZm',10000,0,1,0,'[]','2026-02-11 11:07:00','2026-02-11 11:07:00',0,NULL,NULL,0,0,0);
INSERT INTO "users" VALUES(5,'quicktest@example.com','QuickTest','$2b$10$8gwoGZ/sIOIRr6H6b/50t.8j1.yDjJSpxcuXt0HxLQumn8nHPxFLS',10000,0,1,0,'[]','2026-02-11 11:08:13','2026-02-11 11:25:21',0,NULL,NULL,0,0,0);
INSERT INTO "users" VALUES(6,'navtest@example.com','NavTestUser','$2b$10$nMaJXzgYXe/f9uWg99lNhe/U2boeVq64aTyk8NQaL1okKAFnBpZyu',10000,0,1,0,'[]','2026-02-11 11:48:21','2026-02-11 12:02:23',0,NULL,NULL,0,0,0);
INSERT INTO "users" VALUES(7,'trade1770651466@example.com','trade1770651466','$2b$10$7J/OqTAHX.qfYdWd2EI9Fu9DSByD2nMX1asUTaQgMEfPLV9UjDjVC',9800,0,1,0,'[]','2026-02-11 12:11:11','2026-02-11 12:13:45',0,NULL,NULL,0,0,0);
INSERT INTO "users" VALUES(8,'yhomg1@example.com','yhomg1','$2b$10$Y4aqKrUlkGOD8V00hmhk5OpUO5LEDQzMVwlScdCH68PRtCeuU/0OS',9800,0,1,0,'[]','2026-02-11 12:11:12','2026-02-11 12:19:26',0,NULL,NULL,0,0,0);
CREATE TABLE coins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  total_supply REAL NOT NULL,
  circulating_supply REAL DEFAULT 0,
  current_price REAL DEFAULT 0.01,
  market_cap REAL DEFAULT 0,
  hype_score REAL DEFAULT 100,
  holders_count INTEGER DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  launch_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active',
  FOREIGN KEY (creator_id) REFERENCES users(id)
);
INSERT INTO "coins" VALUES(1,7,'testing3','T3','A testing meme coin','/static/default-coin.svg',4000,0,0.01,0,100,0,0,'2026-02-11 12:12:17','2026-02-11 12:12:17','active');
INSERT INTO "coins" VALUES(2,7,'MoonShot','MOON','To the moon!','/static/default-coin.svg',4000,0,0.01,0,100,0,0,'2026-02-11 12:12:18','2026-02-11 12:12:18','active');
INSERT INTO "coins" VALUES(3,8,'newyear','CNE','Chinese New Year celebration coin','/static/default-coin.svg',4000,0,0.01,0,100,0,0,'2026-02-11 12:12:19','2026-02-11 12:12:19','active');
INSERT INTO "coins" VALUES(4,8,'DogeCopy','DOGE2','Not the real doge','/static/default-coin.svg',4000,0,0.01,0,100,0,0,'2026-02-11 12:12:20','2026-02-11 12:12:20','active');
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('buy', 'sell', 'create')),
  amount REAL NOT NULL,
  price REAL NOT NULL,
  total_cost REAL NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);
INSERT INTO "transactions" VALUES(1,7,1,'create',0,0,100,'2026-02-11 12:12:17');
INSERT INTO "transactions" VALUES(2,7,2,'create',0,0,100,'2026-02-11 12:12:18');
INSERT INTO "transactions" VALUES(3,8,3,'create',0,0,100,'2026-02-11 12:12:19');
INSERT INTO "transactions" VALUES(4,8,4,'create',0,0,100,'2026-02-11 12:12:20');
CREATE TABLE holdings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  avg_buy_price REAL NOT NULL,
  current_value REAL DEFAULT 0,
  profit_loss_percent REAL DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id),
  UNIQUE(user_id, coin_id)
);
CREATE TABLE market_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT,
  impact_multiplier REAL DEFAULT 1.0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);
CREATE TABLE leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total_profit REAL DEFAULT 0,
  best_trade_roi REAL DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  season TEXT DEFAULT 'season_1',
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE email_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'landing_page',
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'unsubscribed', 'bounced'))
);
CREATE TABLE password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  remember_me BOOLEAN DEFAULT 0,
  expires_at DATETIME NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('buy', 'sell')),
  order_type TEXT NOT NULL CHECK(order_type IN ('market', 'limit', 'stop_loss', 'take_profit')),
  amount REAL NOT NULL CHECK(amount > 0),
  price REAL, 
  trigger_price REAL, 
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'filled', 'cancelled', 'expired')),
  filled_amount REAL DEFAULT 0,
  filled_at DATETIME,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);
CREATE TABLE trade_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_id INTEGER NOT NULL,
  seller_id INTEGER,
  coin_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  price REAL NOT NULL,
  total_value REAL NOT NULL,
  buyer_order_id INTEGER,
  seller_order_id INTEGER,
  trade_type TEXT DEFAULT 'direct' CHECK(trade_type IN ('direct', 'order_match')),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id),
  FOREIGN KEY (buyer_order_id) REFERENCES orders(id),
  FOREIGN KEY (seller_order_id) REFERENCES orders(id)
);
CREATE TABLE ai_traders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  personality TEXT NOT NULL CHECK(personality IN ('conservative', 'moderate', 'aggressive', 'random')),
  virtual_balance REAL NOT NULL DEFAULT 10000,
  active BOOLEAN DEFAULT 1,
  total_trades INTEGER DEFAULT 0,
  win_rate REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_trade_at DATETIME
);
INSERT INTO "ai_traders" VALUES(1,'Warren Bot','conservative',100000,1,0,0,'2026-02-11 11:02:38',NULL);
INSERT INTO "ai_traders" VALUES(2,'Degen Dave','aggressive',50000,1,0,0,'2026-02-11 11:02:38',NULL);
INSERT INTO "ai_traders" VALUES(3,'Steady Steve','moderate',75000,1,0,0,'2026-02-11 11:02:38',NULL);
INSERT INTO "ai_traders" VALUES(4,'Random Rick','random',60000,1,0,0,'2026-02-11 11:02:38',NULL);
INSERT INTO "ai_traders" VALUES(5,'Whale Walter','aggressive',500000,1,0,0,'2026-02-11 11:02:38',NULL);
CREATE TABLE market_events_enhanced (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL CHECK(event_type IN ('pump', 'dump', 'news', 'whale', 'rug_pull', 'viral')),
  coin_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  impact_multiplier REAL NOT NULL DEFAULT 1.0,
  duration_minutes INTEGER DEFAULT 60,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);
CREATE TABLE price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  price REAL NOT NULL,
  volume REAL DEFAULT 0,
  market_cap REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('order_filled', 'price_alert', 'system', 'achievement')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT 0,
  data TEXT, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  parent_id INTEGER, 
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, deleted INTEGER DEFAULT 0, edited_at DATETIME, pinned INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id),
  FOREIGN KEY (parent_id) REFERENCES comments(id)
);
CREATE TABLE comment_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  comment_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, comment_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (comment_id) REFERENCES comments(id)
);
CREATE TABLE follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER NOT NULL,
  following_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id),
  FOREIGN KEY (following_id) REFERENCES users(id),
  CHECK(follower_id != following_id)
);
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, coin_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);
CREATE TABLE achievement_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('trading', 'social', 'creation', 'milestone')),
  icon TEXT, 
  points INTEGER DEFAULT 100,
  requirement_type TEXT NOT NULL CHECK(requirement_type IN ('count', 'value', 'special')),
  requirement_value INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
, rarity TEXT DEFAULT 'common');
INSERT INTO "achievement_definitions" VALUES(1,'first_trade','首次交易','完成你的第一筆交易','trading','💰',50,'count',1,'2026-02-11 11:02:38','common');
INSERT INTO "achievement_definitions" VALUES(2,'trader_10','交易新手','完成 10 筆交易','trading','📈',100,'count',10,'2026-02-11 11:02:38','rare');
INSERT INTO "achievement_definitions" VALUES(3,'trader_100','交易專家','完成 100 筆交易','trading','🎯',500,'count',100,'2026-02-11 11:02:38','epic');
INSERT INTO "achievement_definitions" VALUES(4,'whale','巨鯨','單筆交易超過 10,000 金幣','trading','🐋',300,'value',10000,'2026-02-11 11:02:38','epic');
INSERT INTO "achievement_definitions" VALUES(5,'profit_king','盈利之王','總盈利超過 50,000 金幣','trading','👑',1000,'value',50000,'2026-02-11 11:02:38','legendary');
INSERT INTO "achievement_definitions" VALUES(6,'first_coin','創造者','創建你的第一個模因幣','creation','🚀',100,'count',1,'2026-02-11 11:02:38','common');
INSERT INTO "achievement_definitions" VALUES(7,'popular_coin','網紅幣','你的幣種達到 100 個持有者','creation','🔥',500,'count',100,'2026-02-11 11:02:38','epic');
INSERT INTO "achievement_definitions" VALUES(8,'viral_coin','病毒傳播','你的幣種市值超過 1,000,000','creation','💥',1000,'value',1000000,'2026-02-11 11:02:38','legendary');
INSERT INTO "achievement_definitions" VALUES(9,'social_butterfly','社交達人','獲得 10 個關注者','social','🦋',200,'count',10,'2026-02-11 11:02:38','rare');
INSERT INTO "achievement_definitions" VALUES(10,'influencer','KOL','獲得 100 個關注者','social','⭐',500,'count',100,'2026-02-11 11:02:38','epic');
INSERT INTO "achievement_definitions" VALUES(11,'commentator','評論家','發表 50 條評論','social','💬',150,'count',50,'2026-02-11 11:02:38','rare');
INSERT INTO "achievement_definitions" VALUES(12,'level_10','等級 10','達到等級 10','milestone','🎖️',300,'count',10,'2026-02-11 11:02:38','epic');
INSERT INTO "achievement_definitions" VALUES(13,'millionaire','百萬富翁','總資產達到 1,000,000 金幣','milestone','💎',1500,'value',1000000,'2026-02-11 11:02:38','legendary');
INSERT INTO "achievement_definitions" VALUES(14,'early_adopter','早期用戶','註冊後 7 天內完成 10 筆交易','milestone','🌟',400,'special',0,'2026-02-11 11:02:38','legendary');
CREATE TABLE user_achievements (
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
CREATE TABLE activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  activity_type TEXT NOT NULL CHECK(activity_type IN ('trade', 'create_coin', 'comment', 'follow', 'achievement')),
  entity_id INTEGER, 
  entity_type TEXT, 
  content TEXT, 
  is_public BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE comment_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  comment_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (comment_id) REFERENCES comments(id),
  UNIQUE(user_id, comment_id)
);
CREATE TABLE user_profiles (
  user_id INTEGER PRIMARY KEY,
  bio TEXT DEFAULT '',                    
  avatar_url TEXT DEFAULT '',             
  banner_url TEXT DEFAULT '',             
  location TEXT DEFAULT '',               
  website TEXT DEFAULT '',                
  twitter_handle TEXT DEFAULT '',         
  discord_handle TEXT DEFAULT '',         
  joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_verified INTEGER DEFAULT 0,          
  is_premium INTEGER DEFAULT 0,           
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
INSERT INTO "user_profiles" VALUES(5,'我是MemeLaunch用戶 🚀 test','','','China','https://memelaunch.com','@yhomg1','','2026-02-11 11:08:25','2026-02-11 11:08:25',0,0,'2026-02-11 11:08:25','2026-02-11 11:24:35');
INSERT INTO "user_profiles" VALUES(7,'我是MemeLaunch的早期用戶 🚀','','','Taiwan','https://memelaunch.com','','','2026-02-11 12:11:12','2026-02-11 12:11:12',0,0,'2026-02-11 12:11:12','2026-02-11 12:11:12');
INSERT INTO "user_profiles" VALUES(8,'喜歡創建有趣的幣種','','','Hong Kong','','','','2026-02-11 12:11:12','2026-02-11 12:11:12',0,0,'2026-02-11 12:11:12','2026-02-11 12:11:12');
CREATE TABLE user_follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER NOT NULL,          
  following_id INTEGER NOT NULL,         
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(id),
  FOREIGN KEY (following_id) REFERENCES users(id),
  UNIQUE(follower_id, following_id)      
);
INSERT INTO "user_follows" VALUES(1,5,1,'2026-02-11 11:08:25');
CREATE TABLE user_stats (
  user_id INTEGER PRIMARY KEY,
  total_trades INTEGER DEFAULT 0,        
  total_volume REAL DEFAULT 0,           
  total_profit REAL DEFAULT 0,           
  total_comments INTEGER DEFAULT 0,      
  total_likes_given INTEGER DEFAULT 0,   
  total_likes_received INTEGER DEFAULT 0, 
  coins_created INTEGER DEFAULT 0,       
  achievements_unlocked INTEGER DEFAULT 0, 
  current_streak INTEGER DEFAULT 0,      
  longest_streak INTEGER DEFAULT 0,      
  last_trade_date DATETIME,              
  last_login_date DATETIME,              
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('d1_migrations',10);
INSERT INTO "sqlite_sequence" VALUES('ai_traders',5);
INSERT INTO "sqlite_sequence" VALUES('achievement_definitions',14);
INSERT INTO "sqlite_sequence" VALUES('users',8);
INSERT INTO "sqlite_sequence" VALUES('user_follows',1);
INSERT INTO "sqlite_sequence" VALUES('coins',4);
INSERT INTO "sqlite_sequence" VALUES('transactions',4);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_coins_creator ON coins(creator_id);
CREATE INDEX idx_coins_symbol ON coins(symbol);
CREATE INDEX idx_coins_status ON coins(status);
CREATE INDEX idx_coins_market_cap ON coins(market_cap DESC);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_coin ON transactions(coin_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX idx_holdings_user ON holdings(user_id);
CREATE INDEX idx_holdings_coin ON holdings(coin_id);
CREATE INDEX idx_market_events_coin ON market_events(coin_id);
CREATE INDEX idx_market_events_timestamp ON market_events(timestamp DESC);
CREATE INDEX idx_leaderboard_season ON leaderboard(season);
CREATE INDEX idx_leaderboard_profit ON leaderboard(total_profit DESC);
CREATE INDEX idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX idx_email_subscribers_status ON email_subscribers(status);
CREATE INDEX idx_email_subscribers_subscribed_at ON email_subscribers(subscribed_at DESC);
CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_reset_tokens_expires ON password_reset_tokens(expires_at);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_users_remember_token ON users(remember_me_token);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_coin_status ON orders(coin_id, status);
CREATE INDEX idx_orders_type_status ON orders(order_type, status);
CREATE INDEX idx_trade_history_coin ON trade_history(coin_id);
CREATE INDEX idx_trade_history_timestamp ON trade_history(timestamp);
CREATE INDEX idx_price_history_coin ON price_history(coin_id, timestamp);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_comments_coin ON comments(coin_id, created_at);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_activities_user ON activities(user_id, created_at);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id, completed);
CREATE INDEX idx_comments_pinned ON comments(coin_id, pinned, created_at);
CREATE INDEX idx_comments_deleted ON comments(deleted);
CREATE INDEX idx_comment_reports_status ON comment_reports(status);
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_user_stats_user ON user_stats(user_id);