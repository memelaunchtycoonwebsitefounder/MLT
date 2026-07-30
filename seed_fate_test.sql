-- Test data for fate system
INSERT INTO coin_history_cases (
  coin_name, coin_symbol, initial_supply, initial_price, category,
  creator_reputation, creator_previous_coins, market_trend, competition_level,
  has_website, has_twitter, has_telegram, marketing_budget,
  initial_holders, initial_volume, first_week_growth,
  outcome, max_price, max_market_cap, days_to_peak, final_status
) VALUES
('DogeRocket', 'DOGR', 10000000, 0.001, 'animal', 75, 2, 'bull', 5, 1, 1, 1, 10000, 500, 50000, 250, 'moon', 1.5, 15000000, 14, 'active'),
('PizzaCoin', 'PIZZ', 50000000, 0.0005, 'food', 45, 0, 'sideways', 7, 0, 1, 0, 2000, 200, 10000, -20, 'slow_death', 0.0008, 40000, 45, 'dead'),
('WojakToken', 'WOJ', 100000000, 0.0001, 'meme', 60, 1, 'bull', 6, 1, 1, 1, 5000, 350, 30000, 150, 'stable', 0.005, 500000, 30, 'active'),
('QuantumFinance', 'QFIN', 20000000, 0.01, 'tech', 80, 3, 'bull', 4, 1, 1, 1, 25000, 800, 200000, 400, 'moon', 5.0, 100000000, 20, 'active'),
('TrumpCoin', 'TRMP', 75000000, 0.0002, 'celebrity', 35, 0, 'bear', 8, 0, 0, 0, 500, 100, 5000, -50, 'rug', 0.001, 75000, 7, 'scam');
