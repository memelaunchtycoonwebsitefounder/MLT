-- Migration: 0021_fate_system.sql
-- Description: Create Dynamic Fate System tables for meme coin destiny prediction
-- Date: 2026-04-01

-- =====================================================
-- 1. Historical Cases Table
-- =====================================================
-- Stores 100k+ historical meme coin cases for pattern matching
CREATE TABLE IF NOT EXISTS coin_history_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  initial_supply INTEGER NOT NULL,
  initial_price REAL NOT NULL,
  category TEXT NOT NULL, -- 'animal', 'food', 'meme', 'tech', 'celebrity', 'random'
  
  -- Creator characteristics
  creator_reputation INTEGER DEFAULT 50, -- 0-100
  creator_previous_coins INTEGER DEFAULT 0,
  
  -- Market conditions
  market_trend TEXT NOT NULL, -- 'bull', 'bear', 'sideways'
  competition_level INTEGER DEFAULT 5, -- 1-10
  
  -- Marketing strategy
  has_website BOOLEAN DEFAULT 0,
  has_twitter BOOLEAN DEFAULT 0,
  has_telegram BOOLEAN DEFAULT 0,
  marketing_budget INTEGER DEFAULT 0,
  
  -- Community engagement
  initial_holders INTEGER DEFAULT 0,
  initial_volume REAL DEFAULT 0,
  first_week_growth REAL DEFAULT 0, -- percentage
  
  -- Outcome data
  outcome TEXT NOT NULL, -- 'moon', 'stable', 'rug', 'slow_death'
  max_price REAL NOT NULL,
  max_market_cap REAL DEFAULT 0,
  days_to_peak INTEGER DEFAULT 0,
  final_status TEXT NOT NULL, -- 'active', 'dead', 'scam'
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast similarity matching
CREATE INDEX IF NOT EXISTS idx_history_category ON coin_history_cases(category);
CREATE INDEX IF NOT EXISTS idx_history_outcome ON coin_history_cases(outcome);
CREATE INDEX IF NOT EXISTS idx_history_market_trend ON coin_history_cases(market_trend);
CREATE INDEX IF NOT EXISTS idx_history_creator_rep ON coin_history_cases(creator_reputation);
CREATE INDEX IF NOT EXISTS idx_history_final_status ON coin_history_cases(final_status);

-- =====================================================
-- 2. User Actions Tracking Table
-- =====================================================
-- Records every user action that affects coin fate
CREATE TABLE IF NOT EXISTS user_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  action_type TEXT NOT NULL, -- 'launch', 'buy', 'sell', 'promote', 'abandon', 'website_create', 'social_create', 'airdrop', 'partnership'
  action_details TEXT, -- JSON format
  impact_score REAL DEFAULT 0, -- -1.0 to 1.0
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE INDEX IF NOT EXISTS idx_actions_user ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_coin ON user_actions(coin_id);
CREATE INDEX IF NOT EXISTS idx_actions_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_actions_timestamp ON user_actions(timestamp);

-- =====================================================
-- 3. User Decisions Table
-- =====================================================
-- Tracks specific decisions users make
CREATE TABLE IF NOT EXISTS user_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  decision_type TEXT NOT NULL, -- 'pricing', 'marketing', 'liquidity', 'partnership', 'community'
  chosen_option TEXT NOT NULL,
  alternative_options TEXT, -- JSON array
  result_impact REAL DEFAULT 0, -- -1.0 to 1.0
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE INDEX IF NOT EXISTS idx_decisions_coin ON user_decisions(coin_id);
CREATE INDEX IF NOT EXISTS idx_decisions_type ON user_decisions(decision_type);

-- =====================================================
-- 4. Coin Fate Tracker Table
-- =====================================================
-- Real-time tracking of each coin's destiny
CREATE TABLE IF NOT EXISTS coin_fate_tracker (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL UNIQUE,
  
  -- Current state
  current_phase TEXT DEFAULT 'launch', -- 'launch', 'growth', 'peak', 'decline', 'dead'
  fate_trajectory TEXT DEFAULT 'unknown', -- 'moon', 'stable', 'risky', 'dying'
  fate_probability REAL DEFAULT 0.5, -- 0.0-1.0
  
  -- Factor scores (0.0-1.0)
  creator_score REAL DEFAULT 0.5,
  marketing_score REAL DEFAULT 0.0,
  community_score REAL DEFAULT 0.0,
  timing_score REAL DEFAULT 0.5,
  luck_factor REAL DEFAULT 0.5,
  
  -- Predictions
  predicted_max_price REAL DEFAULT 0,
  predicted_peak_day INTEGER DEFAULT 7,
  survival_chance REAL DEFAULT 0.5,
  
  -- Historical matching
  matched_cases TEXT, -- JSON array of similar historical case IDs
  similarity_score REAL DEFAULT 0,
  
  -- Metadata
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  prediction_count INTEGER DEFAULT 0,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE INDEX IF NOT EXISTS idx_fate_coin ON coin_fate_tracker(coin_id);
CREATE INDEX IF NOT EXISTS idx_fate_trajectory ON coin_fate_tracker(fate_trajectory);
CREATE INDEX IF NOT EXISTS idx_fate_phase ON coin_fate_tracker(current_phase);

-- =====================================================
-- 5. Random Events Table
-- =====================================================
-- Stores random game events that can affect coin fate
CREATE TABLE IF NOT EXISTS fate_random_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL, -- 'celebrity_tweet', 'market_crash', 'viral_meme', 'whale_buy', 'exchange_listing'
  event_title TEXT NOT NULL,
  event_description TEXT NOT NULL,
  impact_min REAL DEFAULT -0.5, -- -1.0 to 1.0
  impact_max REAL DEFAULT 0.5,
  rarity TEXT DEFAULT 'common', -- 'common', 'uncommon', 'rare', 'epic', 'legendary'
  probability REAL DEFAULT 0.1, -- 0.0-1.0 chance per day
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default random events
INSERT INTO fate_random_events (event_type, event_title, event_description, impact_min, impact_max, rarity, probability) VALUES
('celebrity_tweet', 'Celebrity Mention', 'A famous celebrity mentioned your coin on Twitter!', 0.3, 0.8, 'rare', 0.01),
('viral_meme', 'Viral Meme', 'Your coin became a viral meme on social media!', 0.2, 0.6, 'uncommon', 0.05),
('whale_buy', 'Whale Purchase', 'A crypto whale bought a large amount of your coin!', 0.4, 0.9, 'rare', 0.02),
('market_crash', 'Market Crash', 'The crypto market crashed, affecting all coins.', -0.7, -0.3, 'uncommon', 0.03),
('exchange_listing', 'Exchange Listing', 'Your coin got listed on a major exchange!', 0.5, 1.0, 'epic', 0.005),
('rug_rumor', 'Rug Pull Rumor', 'Rumors spread about a potential rug pull.', -0.6, -0.2, 'uncommon', 0.04),
('partnership', 'Major Partnership', 'Your coin partnered with a major project!', 0.3, 0.7, 'rare', 0.015),
('fud_attack', 'FUD Attack', 'Coordinated FUD (Fear, Uncertainty, Doubt) campaign against your coin.', -0.5, -0.1, 'common', 0.08),
('community_milestone', 'Community Milestone', 'Your community reached a major milestone!', 0.1, 0.4, 'common', 0.10),
('hack_scare', 'Security Scare', 'A security vulnerability was discovered (but patched).', -0.4, -0.1, 'uncommon', 0.02);

-- =====================================================
-- 6. Coin Event History Table
-- =====================================================
-- Tracks all events that happened to each coin
CREATE TABLE IF NOT EXISTS coin_event_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  event_id INTEGER,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  impact_value REAL DEFAULT 0,
  occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coin_id) REFERENCES coins(id),
  FOREIGN KEY (event_id) REFERENCES fate_random_events(id)
);

CREATE INDEX IF NOT EXISTS idx_event_history_coin ON coin_event_history(coin_id);
CREATE INDEX IF NOT EXISTS idx_event_history_date ON coin_event_history(occurred_at);

-- =====================================================
-- 7. Fate Achievements Table
-- =====================================================
-- Special achievements for the fate system
CREATE TABLE IF NOT EXISTS fate_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  achievement_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT DEFAULT 'common',
  condition_type TEXT NOT NULL, -- 'fate_trajectory', 'event_count', 'survival_days', 'max_price_multiplier'
  condition_value TEXT NOT NULL, -- JSON with conditions
  reward_mlt INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert fate-specific achievements
INSERT INTO fate_achievements (achievement_key, title, description, icon, rarity, condition_type, condition_value, reward_mlt) VALUES
('fate_moon', 'To the Moon!', 'Create a coin that achieves "moon" trajectory', '🚀', 'epic', 'fate_trajectory', '{"trajectory": "moon"}', 5000),
('fate_survivor', 'Diamond Hands', 'Keep a coin alive for 30+ days', '💎', 'rare', 'survival_days', '{"days": 30}', 2000),
('fate_perfect_timing', 'Perfect Timing', 'Launch a coin during a bull market and achieve moon trajectory', '⏰', 'legendary', 'fate_trajectory', '{"trajectory": "moon", "market": "bull"}', 10000),
('fate_comeback', 'The Comeback', 'Recover a coin from "dying" trajectory to "stable"', '📈', 'epic', 'fate_trajectory', '{"from": "dying", "to": "stable"}', 3000),
('fate_100x', '100x Gains', 'Create a coin that reaches 100x its initial price', '💰', 'legendary', 'max_price_multiplier', '{"multiplier": 100}', 15000),
('fate_event_master', 'Event Master', 'Experience 10+ random events on a single coin', '🎭', 'rare', 'event_count', '{"count": 10}', 1500),
('fate_luck_master', 'Lucky Star', 'Have luck factor above 0.8 at coin launch', '🍀', 'uncommon', 'luck_factor', '{"min": 0.8}', 500);

-- =====================================================
-- Migration Complete
-- =====================================================
-- Created 7 new tables:
-- 1. coin_history_cases - Historical data (100k+ records)
-- 2. user_actions - User behavior tracking
-- 3. user_decisions - Decision tracking
-- 4. coin_fate_tracker - Real-time fate tracking
-- 5. fate_random_events - Random event definitions
-- 6. coin_event_history - Event occurrence log
-- 7. fate_achievements - Fate-specific achievements
