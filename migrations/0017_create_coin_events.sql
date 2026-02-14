-- Migration 0017: Create coin_events table

CREATE TABLE IF NOT EXISTS coin_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  event_data TEXT,
  impact_percent REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE INDEX IF NOT EXISTS idx_coin_events_coin_id ON coin_events(coin_id);
CREATE INDEX IF NOT EXISTS idx_coin_events_type ON coin_events(event_type);
CREATE INDEX IF NOT EXISTS idx_coin_events_created_at ON coin_events(created_at);
