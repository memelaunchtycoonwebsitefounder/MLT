-- Migration: Achievement Definitions i18n
-- Date: 2026-02-27
-- Description: Add English/Chinese bilingual achievement definitions

-- Clear existing achievements first (if any)
DELETE FROM user_achievements;
DELETE FROM achievement_definitions;

-- ==================== TRADING ACHIEVEMENTS ====================

-- First Trade (首次交易)
INSERT INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value)
VALUES (
  'first_trade',
  'First Trade',
  'Complete your first trade',
  'trading',
  '💰',
  100,
  'count',
  1
);

-- Trading Novice (交易新手)
INSERT INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value)
VALUES (
  'trader_10',
  'Trading Novice',
  'Complete 10 trades',
  'trading',
  '📈',
  200,
  'count',
  10
);

-- Whale (巨鯨)
INSERT INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value)
VALUES (
  'trader_100',
  'Whale',
  'Complete 100 trades',
  'trading',
  '🐋',
  500,
  'count',
  100
);

-- Trading Expert (交易專家)
INSERT INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value)
VALUES (
  'trader_1000',
  'Trading Expert',
  'Complete 1000 trades',
  'trading',
  '💎',
  1000,
  'count',
  1000
);

-- Profit King (盈利之王)
INSERT INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value)
VALUES (
  'profit_king',
  'Profit King',
  'Earn $100,000 in total profit',
  'trading',
  '👑',
  2000,
  'value',
  100000
);

-- ==================== CREATION ACHIEVEMENTS ====================

-- Creator (創造者)
INSERT INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value)
VALUES (
  'first_coin',
  'Creator',
  'Create your first coin',
  'creation',
  '🎨',
  150,
  'count',
  1
);

-- Trending Coin (網紅幣)
INSERT INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value)
VALUES (
  'trending_coin',
  'Trending Coin',
  'Create a coin that reaches top 10',
  'creation',
  '🔥',
  500,
  'special',
  NULL
);

-- Viral Spread (病毒傳播)
INSERT INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value)
VALUES (
  'viral_spread',
  'Viral Spread',
  'Your coin gets 1000+ holders',
  'creation',
  '🚀',
  1000,
  'value',
  1000
);

-- ==================== SOCIAL ACHIEVEMENTS ====================

-- Commentator (評論家)
INSERT INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value)
VALUES (
  'commentator',
  'Commentator',
  'Post 50 comments',
  'social',
  '💬',
  200,
  'count',
  50
);

-- Social Butterfly (社交達人)
INSERT INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value)
VALUES (
  'social_butterfly',
  'Social Butterfly',
  'Get 10 followers',
  'social',
  '🦋',
  300,
  'count',
  10
);

-- Influencer (KOL)
INSERT INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value)
VALUES (
  'influencer',
  'Influencer',
  'Get 100 followers',
  'social',
  '⭐',
  800,
  'count',
  100
);

-- ==================== MILESTONE ACHIEVEMENTS ====================

-- Level 10 (等級 10)
INSERT INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value)
VALUES (
  'level_10',
  'Level 10',
  'Reach level 10',
  'milestone',
  '🏆',
  500,
  'count',
  10
);

-- Early Adopter (早期用戶)
INSERT INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value)
VALUES (
  'early_adopter',
  'Early Adopter',
  'Join in the first month',
  'milestone',
  '🌟',
  300,
  'special',
  NULL
);

-- Millionaire (百萬富翁)
INSERT INTO achievement_definitions (key, name, description, category, icon, points, requirement_type, requirement_value)
VALUES (
  'millionaire',
  'Millionaire',
  'Reach $1,000,000 net worth',
  'milestone',
  '💰',
  2000,
  'value',
  1000000
);
