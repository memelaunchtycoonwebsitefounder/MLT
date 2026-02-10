-- Add social features enhancements

-- Add missing fields to comments table
ALTER TABLE comments ADD COLUMN deleted INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN edited_at DATETIME;
ALTER TABLE comments ADD COLUMN pinned INTEGER DEFAULT 0;

-- Create comment_reports table
CREATE TABLE IF NOT EXISTS comment_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  comment_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, reviewed, resolved
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (comment_id) REFERENCES comments(id),
  UNIQUE(user_id, comment_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_comments_pinned ON comments(coin_id, pinned, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_deleted ON comments(deleted);
CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON comment_reports(status);
