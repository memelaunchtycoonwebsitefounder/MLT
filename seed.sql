-- Seed data for testing

-- Insert test users
INSERT OR IGNORE INTO users (id, email, username, password_hash, virtual_balance, premium_balance, level, xp) VALUES
(27, 'trade1770651466@example.com', 'trade1770651466', '$2a$10$YourHashedPasswordHere', 9950.77, 0, 2, 150),
(16, 'yhomg1@example.com', 'yhomg1', '$2a$10$YourHashedPasswordHere', 10000, 0, 1, 50);

-- Insert some test coins
INSERT OR IGNORE INTO coins (id, name, symbol, creator_id, current_price, market_cap, total_supply, image_url) VALUES
(9, 'testing3', 'T3', 27, 0.0164, 65.76, 4000, '/static/default-coin.svg'),
(7, 'newyear', 'CNE', 16, 0.0106, 42.4, 4000, '/images/coins/1770640963717-0g554.png');

-- Insert user profiles
INSERT OR IGNORE INTO user_profiles (user_id, bio, location) VALUES
(27, '', ''),
(16, '', '');

-- Insert user stats
INSERT OR IGNORE INTO user_stats (user_id, total_trades, total_volume, coins_created) VALUES
(27, 5, 150.50, 1),
(16, 3, 80.25, 1);
