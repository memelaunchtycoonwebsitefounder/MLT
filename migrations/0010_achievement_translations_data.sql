-- Migration: Achievement translations data
-- Date: 2026-02-27
-- Description: Populate achievement translations for EN and ZH

-- Clear existing translations
DELETE FROM achievement_translations;

-- ==================== TRADING ACHIEVEMENTS ====================

-- First Trade
INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'en', 'First Trade', 'Complete your first trade'
FROM achievement_definitions WHERE key = 'first_trade';

INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'zh', '首次交易', '完成你的第一筆交易'
FROM achievement_definitions WHERE key = 'first_trade';

-- Trading Novice
INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'en', 'Trading Novice', 'Complete 10 trades'
FROM achievement_definitions WHERE key = 'trader_10';

INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'zh', '交易新手', '完成 10 筆交易'
FROM achievement_definitions WHERE key = 'trader_10';

-- Whale
INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'en', 'Whale', 'Complete 100 trades'
FROM achievement_definitions WHERE key = 'trader_100';

INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'zh', '巨鯨', '完成 100 筆交易'
FROM achievement_definitions WHERE key = 'trader_100';

-- Trading Expert
INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'en', 'Trading Expert', 'Complete 1000 trades'
FROM achievement_definitions WHERE key = 'trader_1000';

INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'zh', '交易專家', '完成 1000 筆交易'
FROM achievement_definitions WHERE key = 'trader_1000';

-- Profit King
INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'en', 'Profit King', 'Earn $100,000 in total profit'
FROM achievement_definitions WHERE key = 'profit_king';

INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'zh', '盈利之王', '總盈利達到 $100,000'
FROM achievement_definitions WHERE key = 'profit_king';

-- ==================== CREATION ACHIEVEMENTS ====================

-- Creator
INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'en', 'Creator', 'Create your first coin'
FROM achievement_definitions WHERE key = 'first_coin';

INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'zh', '創造者', '創建你的第一個幣種'
FROM achievement_definitions WHERE key = 'first_coin';

-- Trending Coin
INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'en', 'Trending Coin', 'Create a coin that reaches top 10'
FROM achievement_definitions WHERE key = 'trending_coin';

INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'zh', '網紅幣', '創建一個進入前 10 名的幣種'
FROM achievement_definitions WHERE key = 'trending_coin';

-- Viral Spread
INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'en', 'Viral Spread', 'Your coin gets 1000+ holders'
FROM achievement_definitions WHERE key = 'viral_spread';

INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'zh', '病毒傳播', '你的幣種擁有 1000+ 持有者'
FROM achievement_definitions WHERE key = 'viral_spread';

-- ==================== SOCIAL ACHIEVEMENTS ====================

-- Commentator
INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'en', 'Commentator', 'Post 50 comments'
FROM achievement_definitions WHERE key = 'commentator';

INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'zh', '評論家', '發表 50 條評論'
FROM achievement_definitions WHERE key = 'commentator';

-- Social Butterfly
INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'en', 'Social Butterfly', 'Get 10 followers'
FROM achievement_definitions WHERE key = 'social_butterfly';

INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'zh', '社交達人', '獲得 10 個關注者'
FROM achievement_definitions WHERE key = 'social_butterfly';

-- Influencer
INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'en', 'Influencer', 'Get 100 followers'
FROM achievement_definitions WHERE key = 'influencer';

INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'zh', 'KOL', '獲得 100 個關注者'
FROM achievement_definitions WHERE key = 'influencer';

-- ==================== MILESTONE ACHIEVEMENTS ====================

-- Level 10
INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'en', 'Level 10', 'Reach level 10'
FROM achievement_definitions WHERE key = 'level_10';

INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'zh', '等級 10', '達到等級 10'
FROM achievement_definitions WHERE key = 'level_10';

-- Early Adopter
INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'en', 'Early Adopter', 'Join in the first month'
FROM achievement_definitions WHERE key = 'early_adopter';

INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'zh', '早期用戶', '在第一個月加入'
FROM achievement_definitions WHERE key = 'early_adopter';

-- Millionaire
INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'en', 'Millionaire', 'Reach $1,000,000 net worth'
FROM achievement_definitions WHERE key = 'millionaire';

INSERT INTO achievement_translations (achievement_id, locale, name, description)
SELECT id, 'zh', '百萬富翁', '淨資產達到 $1,000,000'
FROM achievement_definitions WHERE key = 'millionaire';
