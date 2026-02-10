-- Migration: Add gamification fields to users table
-- Date: 2026-02-10

-- Add experience points (level already exists)
ALTER TABLE users ADD COLUMN experience_points INTEGER DEFAULT 0;

-- Add follower/following counts for social features
ALTER TABLE users ADD COLUMN followers_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN following_count INTEGER DEFAULT 0;
