-- Create price history table for tracking coin price changes
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  price REAL NOT NULL,
  volume REAL NOT NULL DEFAULT 0,
  market_cap REAL DEFAULT 0,
  circulating_supply REAL DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coin_id) REFERENCES coins(id) ON DELETE CASCADE
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_price_history_coin_time 
  ON price_history(coin_id, timestamp DESC);

-- Insert initial price for existing coins
INSERT INTO price_history (coin_id, price, volume, market_cap, circulating_supply, timestamp)
SELECT 
  id,
  current_price,
  0 as volume,
  market_cap,
  circulating_supply,
  created_at
FROM coins
WHERE id NOT IN (SELECT DISTINCT coin_id FROM price_history);
