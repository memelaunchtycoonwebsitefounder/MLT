-- ========================================
-- 用户决策点系统
-- User Decision Points System
-- ========================================

-- 决策点表 - 关键时刻出现的选择
CREATE TABLE IF NOT EXISTS decision_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  decision_type TEXT NOT NULL CHECK(decision_type IN (
    'whale_offer',        -- 鲸鱼提议 (买入/拒绝大额投资)
    'rug_warning',        -- Rug Pull 警告 (卖出/持有)
    'viral_opportunity',  -- 病毒营销机会 (推广/不推广)
    'fud_crisis',         -- FUD 危机 (澄清/忽略)
    'partnership',        -- 合作机会 (接受/拒绝)
    'liquidity_choice',   -- 流动性选择 (锁定/保持灵活)
    'community_vote'      -- 社区投票 (烧币/空投)
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- 选项 A
  option_a_text TEXT NOT NULL,
  option_a_effect TEXT NOT NULL,
  option_a_impact REAL NOT NULL,
  
  -- 选项 B
  option_b_text TEXT NOT NULL,
  option_b_effect TEXT NOT NULL,
  option_b_impact REAL NOT NULL,
  
  -- 状态
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'chosen', 'expired')),
  chosen_option TEXT CHECK(chosen_option IN ('A', 'B', NULL)),
  
  -- 时间限制
  triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  decided_at DATETIME,
  
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

-- 用户决策历史表
CREATE TABLE IF NOT EXISTS user_decision_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  decision_point_id INTEGER NOT NULL,
  chosen_option TEXT NOT NULL CHECK(chosen_option IN ('A', 'B')),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id),
  FOREIGN KEY (decision_point_id) REFERENCES decision_points(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_decision_points_coin ON decision_points(coin_id);
CREATE INDEX IF NOT EXISTS idx_decision_points_status ON decision_points(status);
CREATE INDEX IF NOT EXISTS idx_decision_history_user ON user_decision_history(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_history_coin ON user_decision_history(coin_id);

-- 示例决策点数据
INSERT INTO decision_points (
  coin_id, decision_type, title, description,
  option_a_text, option_a_effect, option_a_impact,
  option_b_text, option_b_effect, option_b_impact,
  expires_at
) VALUES
(
  1,
  'whale_offer',
  '🐋 Whale Investment Offer',
  'A crypto whale wants to invest $50,000 in your coin! This will pump the price immediately, but they might dump later.',
  'Accept Investment',
  'Immediate +30% price boost, but risk of future dump',
  0.30,
  'Reject Offer',
  'Maintain organic growth, community trusts you more',
  0.05,
  datetime('now', '+5 minutes')
);

SELECT 'User decision system created successfully!' as message;
