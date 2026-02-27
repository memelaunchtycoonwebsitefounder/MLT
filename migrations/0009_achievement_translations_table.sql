-- Migration: Add achievement i18n support
-- Date: 2026-02-27
-- Description: Add translations table for achievement names and descriptions

-- Achievement translations table
CREATE TABLE IF NOT EXISTS achievement_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  achievement_id INTEGER NOT NULL,
  locale TEXT NOT NULL CHECK(locale IN ('en', 'zh')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(achievement_id, locale),
  FOREIGN KEY (achievement_id) REFERENCES achievement_definitions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_achievement_translations_achievement ON achievement_translations(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievement_translations_locale ON achievement_translations(locale);
