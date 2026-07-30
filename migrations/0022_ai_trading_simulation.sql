-- AI Trading Simulation Tables
-- 模擬交易系統數據表

-- 模擬狀態表
CREATE TABLE IF NOT EXISTS coin_simulations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  fate_outcome TEXT NOT NULL CHECK(fate_outcome IN ('moon', 'stable', 'rug', 'slow_death')),
  total_days INTEGER NOT NULL,
  current_day INTEGER DEFAULT 0,
  initial_price REAL NOT NULL,
  current_price REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE INDEX IF NOT EXISTS idx_coin_simulations_coin_id ON coin_simulations(coin_id);

-- 模擬交易記錄表
CREATE TABLE IF NOT EXISTS simulated_trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  bot_id TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('buy', 'sell')),
  amount REAL NOT NULL,
  price REAL NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE INDEX IF NOT EXISTS idx_simulated_trades_coin_id ON simulated_trades(coin_id);
CREATE INDEX IF NOT EXISTS idx_simulated_trades_timestamp ON simulated_trades(timestamp);

-- 價格歷史表（用於圖表）
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  price REAL NOT NULL,
  volume REAL NOT NULL,
  market_cap REAL NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE INDEX IF NOT EXISTS idx_price_history_coin_id ON price_history(coin_id);
CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp);

-- 事件記錄表
CREATE TABLE IF NOT EXISTS simulation_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  description TEXT,
  impact REAL NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE INDEX IF NOT EXISTS idx_simulation_events_coin_id ON simulation_events(coin_id);
CREATE INDEX IF NOT EXISTS idx_simulation_events_timestamp ON simulation_events(timestamp);
