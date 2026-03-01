-- Migration: Add compliance and legal tables
-- Date: 2026-03-01

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  ip_address TEXT,
  status TEXT DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at);

-- Privacy requests (GDPR/CCPA)
CREATE TABLE IF NOT EXISTS privacy_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  request_type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_privacy_user ON privacy_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_status ON privacy_requests(status);
CREATE INDEX IF NOT EXISTS idx_privacy_type ON privacy_requests(request_type);

-- Cookie consent log (GDPR compliance)
CREATE TABLE IF NOT EXISTS cookie_consent_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  ip_address TEXT,
  essential INTEGER DEFAULT 1,
  analytics INTEGER DEFAULT 0,
  marketing INTEGER DEFAULT 0,
  ccpa_optout INTEGER DEFAULT 0,
  consent_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_consent_user ON cookie_consent_log(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_ip ON cookie_consent_log(ip_address);
