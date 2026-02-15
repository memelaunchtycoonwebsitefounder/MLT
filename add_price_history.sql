-- Add initial price history for all 5 test coins
INSERT INTO price_history (coin_id, price, volume, market_cap, timestamp) VALUES
  -- Test Coin (id=1, price=0.01)
  (1, 0.01, 1000, 0, datetime('now', '-10 minutes')),
  (1, 0.011, 1200, 0, datetime('now', '-8 minutes')),
  (1, 0.0105, 1100, 0, datetime('now', '-5 minutes')),
  (1, 0.012, 1300, 0, datetime('now', '-2 minutes')),
  (1, 0.01, 1000, 0, datetime('now')),
  
  -- Moon Token (id=2, price=0.02)
  (2, 0.02, 2000, 0, datetime('now', '-10 minutes')),
  (2, 0.021, 2100, 0, datetime('now', '-8 minutes')),
  (2, 0.0205, 2050, 0, datetime('now', '-5 minutes')),
  (2, 0.022, 2200, 0, datetime('now', '-2 minutes')),
  (2, 0.02, 2000, 0, datetime('now')),
  
  -- Doge Plus (id=3, price=0.03)
  (3, 0.03, 3000, 0, datetime('now', '-10 minutes')),
  (3, 0.032, 3200, 0, datetime('now', '-8 minutes')),
  (3, 0.031, 3100, 0, datetime('now', '-5 minutes')),
  (3, 0.033, 3300, 0, datetime('now', '-2 minutes')),
  (3, 0.03, 3000, 0, datetime('now')),
  
  -- Pepe Token (id=4, price=0.04)
  (4, 0.04, 4000, 0, datetime('now', '-10 minutes')),
  (4, 0.042, 4200, 0, datetime('now', '-8 minutes')),
  (4, 0.041, 4100, 0, datetime('now', '-5 minutes')),
  (4, 0.043, 4300, 0, datetime('now', '-2 minutes')),
  (4, 0.04, 4000, 0, datetime('now')),
  
  -- Chart Coin (id=5, price=0.025)
  (5, 0.025, 2500, 0, datetime('now', '-10 minutes')),
  (5, 0.026, 2600, 0, datetime('now', '-8 minutes')),
  (5, 0.0255, 2550, 0, datetime('now', '-5 minutes')),
  (5, 0.027, 2700, 0, datetime('now', '-2 minutes')),
  (5, 0.025, 2500, 0, datetime('now'));
