-- 恢復舊用戶數據（添加 mlt_balance 欄位）
-- 從備份中恢復用戶，給每個用戶 10000 MLT

-- User 5: quicktest@example.com (QuickTest) - 這是您的主要測試帳號
INSERT OR REPLACE INTO users (
  id, email, username, password_hash, 
  virtual_balance, premium_balance, level, xp, achievements,
  created_at, last_login, is_verified,
  mlt_balance, total_mlt_earned, total_mlt_spent
) VALUES (
  5, 
  'quicktest@example.com', 
  'QuickTest',
  '$2b$10$8gwoGZ/sIOIRr6H6b/50t.8j1.yDjJSpxcuXt0HxLQumn8nHPxFLS',
  10000, 0, 1, 0, '[]',
  '2026-02-11 11:08:13',
  CURRENT_TIMESTAMP,
  0,
  10000.0,  -- 初始 MLT 餘額
  0,        -- 總共賺取的 MLT
  0         -- 總共花費的 MLT
);

-- User 6: navtest@example.com (NavTestUser)
INSERT OR REPLACE INTO users (
  id, email, username, password_hash, 
  virtual_balance, premium_balance, level, xp, achievements,
  created_at, last_login, is_verified,
  mlt_balance, total_mlt_earned, total_mlt_spent
) VALUES (
  6,
  'navtest@example.com',
  'NavTestUser',
  '$2b$10$nMaJXzgYXe/f9uWg99lNhe/U2boeVq64aTyk8NQaL1okKAFnBpZyu',
  10000, 0, 1, 0, '[]',
  '2026-02-11 11:48:21',
  CURRENT_TIMESTAMP,
  0,
  10000.0,
  0,
  0
);

-- User 7: trade1770651466@example.com
INSERT OR REPLACE INTO users (
  id, email, username, password_hash, 
  virtual_balance, premium_balance, level, xp, achievements,
  created_at, last_login, is_verified,
  mlt_balance, total_mlt_earned, total_mlt_spent
) VALUES (
  7,
  'trade1770651466@example.com',
  'trade1770651466',
  '$2b$10$7J/OqTAHX.qfYdWd2EI9Fu9DSByD2nMX1asUTaQgMEfPLV9UjDjVC',
  9800, 0, 1, 0, '[]',
  '2026-02-11 12:11:11',
  CURRENT_TIMESTAMP,
  0,
  10000.0,
  0,
  0
);

-- User 8: yhomg1@example.com
INSERT OR REPLACE INTO users (
  id, email, username, password_hash, 
  virtual_balance, premium_balance, level, xp, achievements,
  created_at, last_login, is_verified,
  mlt_balance, total_mlt_earned, total_mlt_spent
) VALUES (
  8,
  'yhomg1@example.com',
  'yhomg1',
  '$2b$10$Y4aqKrUlkGOD8V00hmhk5OpUO5LEDQzMVwlScdCH68PRtCeuU/0OS',
  9800, 0, 1, 0, '[]',
  '2026-02-11 12:11:12',
  CURRENT_TIMESTAMP,
  0,
  10000.0,
  0,
  0
);

SELECT 'Restored ' || COUNT(*) || ' users' as result FROM users WHERE id IN (5, 6, 7, 8);
