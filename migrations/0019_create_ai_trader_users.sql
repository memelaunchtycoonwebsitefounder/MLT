-- Create user records for all existing AI traders
-- This allows AI traders to record transactions in the transactions table
-- IMPORTANT: Only create users for AI trader IDs >= 10001 to avoid conflicts

INSERT INTO users (id, username, email, password_hash, virtual_balance, mlt_balance)
SELECT 
  ai.id as id,
  'ai_trader_' || ai.id || '_' || LOWER(ai.trader_type) as username,
  'ai_trader_' || ai.id || '_' || LOWER(ai.trader_type) || '@ai.memelaunch.system' as email,
  'AI_TRADER_NO_LOGIN' as password_hash,
  0 as virtual_balance,
  0 as mlt_balance
FROM ai_traders ai
WHERE ai.id >= 10001  -- Only process AI traders with IDs >= 10001
  AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = ai.id
  );
