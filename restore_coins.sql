INSERT OR REPLACE INTO coins (id, creator_id, name, symbol, description, image_url, total_supply, circulating_supply, current_price, market_cap, hype_score, holders_count, transaction_count, created_at, launch_date, status) 
VALUES 
  (1, 1, 'Test Coin', 'TEST', 'A test coin for development', 'https://via.placeholder.com/150', 1000000, 0, 0.01, 0, 100, 0, 0, datetime('now'), datetime('now'), 'active'),
  (2, 1, 'Moon Token', 'MOON', 'To the moon!', 'https://via.placeholder.com/150', 5000000, 0, 0.02, 0, 150, 0, 0, datetime('now'), datetime('now'), 'active'),
  (3, 1, 'Doge Plus', 'DOGE+', 'Much wow, very coin', 'https://via.placeholder.com/150', 10000000, 0, 0.03, 0, 120, 0, 0, datetime('now'), datetime('now'), 'active'),
  (4, 1, 'Pepe Token', 'PEPE', 'Rare pepe meme coin', 'https://via.placeholder.com/150', 2000000, 0, 0.04, 0, 180, 0, 0, datetime('now'), datetime('now'), 'active'),
  (5, 1, 'Chart Coin', 'CHART', 'For chart testing', 'https://via.placeholder.com/150', 1000000, 0, 0.025, 0, 110, 0, 0, datetime('now'), datetime('now'), 'active');
