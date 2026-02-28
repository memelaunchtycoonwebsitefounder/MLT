-- Migration: Add rarity values to achievements
-- Date: 2026-02-27
-- Description: Add rarity field and update all achievements with appropriate rarity

-- First check if rarity column exists, if not add it
-- SQLite doesn't have IF NOT EXISTS for ALTER TABLE, so we use a workaround
-- The column might already exist from 0006_add_achievement_rarity.sql

-- Update rarity values for all achievements
-- Common rarity (beginner achievements)
UPDATE achievement_definitions SET rarity = 'common' 
WHERE key IN ('first_trade', 'first_coin');

-- Rare rarity (intermediate achievements)
UPDATE achievement_definitions SET rarity = 'rare' 
WHERE key IN ('trader_10', 'commentator', 'social_butterfly');

-- Epic rarity (advanced achievements)
UPDATE achievement_definitions SET rarity = 'epic' 
WHERE key IN ('trader_100', 'level_10', 'trending_coin', 'influencer');

-- Legendary rarity (master achievements)
UPDATE achievement_definitions SET rarity = 'legendary' 
WHERE key IN ('trader_1000', 'profit_king', 'viral_spread', 'early_adopter', 'millionaire');
