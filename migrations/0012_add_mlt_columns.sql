-- Migration 0012: Add MLT columns to existing tables

-- Add MLT columns to users table (will fail if they already exist, which is okay)
ALTER TABLE users ADD COLUMN mlt_balance REAL DEFAULT 10000.0;
ALTER TABLE users ADD COLUMN total_mlt_earned REAL DEFAULT 0;
ALTER TABLE users ADD COLUMN total_mlt_spent REAL DEFAULT 0;

-- Add social and protection columns to coins table (skip description as it exists)
ALTER TABLE coins ADD COLUMN twitter_url TEXT;
ALTER TABLE coins ADD COLUMN telegram_url TEXT;
ALTER TABLE coins ADD COLUMN website_url TEXT;
ALTER TABLE coins ADD COLUMN creation_cost_mlt REAL DEFAULT 1800.0;
ALTER TABLE coins ADD COLUMN has_revoke_freeze BOOLEAN DEFAULT 0;
ALTER TABLE coins ADD COLUMN has_revoke_mint BOOLEAN DEFAULT 0;
ALTER TABLE coins ADD COLUMN has_revoke_update BOOLEAN DEFAULT 0;
