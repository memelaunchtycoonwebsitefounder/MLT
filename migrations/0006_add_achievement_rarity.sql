-- Migration: Add rarity field to achievements
-- Date: 2026-02-10

-- Add rarity column to achievement_definitions
ALTER TABLE achievement_definitions ADD COLUMN rarity TEXT DEFAULT 'common';

-- Update existing achievements with appropriate rarity levels
UPDATE achievement_definitions SET rarity = 'common' WHERE key IN ('first_trade', 'first_coin');
UPDATE achievement_definitions SET rarity = 'rare' WHERE key IN ('trader_10', 'social_butterfly', 'commentator');
UPDATE achievement_definitions SET rarity = 'epic' WHERE key IN ('trader_100', 'whale', 'level_10', 'popular_coin', 'influencer');
UPDATE achievement_definitions SET rarity = 'legendary' WHERE key IN ('profit_king', 'millionaire', 'viral_coin', 'early_adopter');
