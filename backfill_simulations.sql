-- Backfill simulation data for existing coins
-- This script creates simulations for coins that don't have them yet

-- For testing: Insert a simulation for coin ID 1
INSERT INTO coin_simulations (
  coin_id,
  fate_outcome,
  total_days,
  current_day,
  initial_price,
  current_price
) VALUES (
  1,
  'moon', -- Random fate for testing
  45, -- 45 days total
  0, -- Just started
  0.01, -- Initial price
  0.011 -- Current price (after some trades)
);

-- Insert initial AI bots for this coin (no bot_type column)
INSERT INTO simulated_trades (coin_id, bot_id, bot_name, type, amount, price, timestamp)
VALUES 
  (1, 'whale_001', 'Whale_001', 'buy', 500, 0.01, datetime('now', '-5 minutes')),
  (1, 'whale_002', 'Whale_002', 'buy', 300, 0.0102, datetime('now', '-4 minutes')),
  (1, 'trader_alpha', 'Trader_Alpha', 'buy', 150, 0.0105, datetime('now', '-3 minutes')),
  (1, 'trader_beta', 'Trader_Beta', 'buy', 200, 0.0108, datetime('now', '-2 minutes')),
  (1, 'holder_gamma', 'Holder_Gamma', 'buy', 100, 0.011, datetime('now', '-1 minute'));

-- Insert initial price history
INSERT INTO price_history (coin_id, price, volume, market_cap, timestamp)
VALUES 
  (1, 0.01, 500, 100, datetime('now', '-5 minutes')),
  (1, 0.0102, 300, 102, datetime('now', '-4 minutes')),
  (1, 0.0105, 150, 105, datetime('now', '-3 minutes')),
  (1, 0.0108, 200, 108, datetime('now', '-2 minutes')),
  (1, 0.011, 100, 110, datetime('now', '-1 minute'));

-- Insert initial events
INSERT INTO simulation_events (coin_id, event_type, event_name, description, impact, timestamp)
VALUES 
  (1, 'whale_buy', 'Whale Entry', '🐋 A whale bought 500 tokens!', 0.02, datetime('now', '-5 minutes')),
  (1, 'viral_tweet', 'Social Media Buzz', '🔥 Tweet went viral, attracting attention!', 0.05, datetime('now', '-3 minutes'));

SELECT 'Backfill completed successfully!' as message;
