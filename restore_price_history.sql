-- Test Coin
INSERT INTO price_history (coin_id, price, volume, market_cap, timestamp) VALUES
  (1, 0.01, 1000, 0, datetime('now', '-10 minutes')),
  (1, 0.011, 1200, 0, datetime('now', '-8 minutes')),
  (1, 0.0105, 1100, 0, datetime('now', '-5 minutes')),
  (1, 0.012, 1300, 0, datetime('now', '-2 minutes')),
  (1, 0.01, 1000, 0, datetime('now'));

-- Moon Token
INSERT INTO price_history (coin_id, price, volume, market_cap, timestamp) VALUES
  (2, 0.02, 800, 0, datetime('now', '-10 minutes')),
  (2, 0.022, 900, 0, datetime('now', '-8 minutes')),
  (2, 0.021, 850, 0, datetime('now', '-5 minutes')),
  (2, 0.023, 950, 0, datetime('now', '-2 minutes')),
  (2, 0.02, 800, 0, datetime('now'));

-- Doge Plus
INSERT INTO price_history (coin_id, price, volume, market_cap, timestamp) VALUES
  (3, 0.03, 600, 0, datetime('now', '-10 minutes')),
  (3, 0.032, 650, 0, datetime('now', '-8 minutes')),
  (3, 0.031, 620, 0, datetime('now', '-5 minutes')),
  (3, 0.033, 700, 0, datetime('now', '-2 minutes')),
  (3, 0.03, 600, 0, datetime('now'));

-- Pepe Token
INSERT INTO price_history (coin_id, price, volume, market_cap, timestamp) VALUES
  (4, 0.04, 500, 0, datetime('now', '-10 minutes')),
  (4, 0.042, 550, 0, datetime('now', '-8 minutes')),
  (4, 0.041, 520, 0, datetime('now', '-5 minutes')),
  (4, 0.043, 580, 0, datetime('now', '-2 minutes')),
  (4, 0.04, 500, 0, datetime('now'));

-- Chart Coin
INSERT INTO price_history (coin_id, price, volume, market_cap, timestamp) VALUES
  (5, 0.025, 700, 0, datetime('now', '-10 minutes')),
  (5, 0.027, 750, 0, datetime('now', '-8 minutes')),
  (5, 0.026, 720, 0, datetime('now', '-5 minutes')),
  (5, 0.028, 800, 0, datetime('now', '-2 minutes')),
  (5, 0.025, 700, 0, datetime('now'));
