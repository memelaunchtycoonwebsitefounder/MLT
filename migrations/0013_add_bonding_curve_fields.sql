-- Migration 0013: Add bonding curve and gameplay fields to coins table

-- Add bonding curve related columns
ALTER TABLE coins ADD COLUMN initial_mlt_investment REAL DEFAULT 2000.0;
ALTER TABLE coins ADD COLUMN bonding_curve_progress REAL DEFAULT 0.0;
ALTER TABLE coins ADD COLUMN bonding_curve_k REAL DEFAULT 4.0;

-- Add gameplay related columns
ALTER TABLE coins ADD COLUMN destiny_type TEXT DEFAULT 'normal';
ALTER TABLE coins ADD COLUMN is_ai_active BOOLEAN DEFAULT 1;
