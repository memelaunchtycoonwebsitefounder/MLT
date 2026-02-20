-- Migration 0010: Add email verification and OAuth support
-- Created: 2026-02-20

-- Email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  used INTEGER DEFAULT 0,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_verification_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_user ON email_verification_tokens(user_id);

-- Note: Adding columns to existing users table
-- If columns already exist, these statements will fail safely
-- Run manually if needed:
-- 
-- ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN oauth_provider TEXT;
-- ALTER TABLE users ADD COLUMN oauth_id TEXT;
-- ALTER TABLE users ADD COLUMN wallet_address TEXT UNIQUE;
-- 
-- CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id);
-- CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);

