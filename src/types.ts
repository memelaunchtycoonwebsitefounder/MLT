export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  STARTING_BALANCE: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  virtual_balance: number;
  premium_balance: number;
  level: number;
  xp: number;
  achievements: string;
  created_at: string;
  last_login: string;
  is_verified: number;
}

export interface Coin {
  id: number;
  creator_id: number;
  name: string;
  symbol: string;
  description: string;
  image_url: string;
  total_supply: number;
  circulating_supply: number;
  current_price: number;
  market_cap: number;
  hype_score: number;
  holders_count: number;
  transaction_count: number;
  created_at: string;
  launch_date: string;
  status: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  coin_id: number;
  type: 'buy' | 'sell' | 'create';
  amount: number;
  price: number;
  total_cost: number;
  timestamp: string;
}

export interface Holding {
  id: number;
  user_id: number;
  coin_id: number;
  amount: number;
  avg_buy_price: number;
  current_value: number;
  profit_loss_percent: number;
  last_updated: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
}
