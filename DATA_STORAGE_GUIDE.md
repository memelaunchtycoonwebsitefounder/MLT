# MemeLaunch Tycoon - Data Storage Guide
## 數據存儲指南

**Updated**: 2026-02-20  
**Database**: Cloudflare D1 (SQLite)

---

## 📊 Data Storage Overview

All application data is stored in **Cloudflare D1 Database** (SQLite-based).

### Database Configuration
- **Database Name**: `memelaunch-db`
- **Database ID**: `21402e76-3247-4655-bb05-b2e3b52c608c`
- **Location**: 
  - **Local Development**: `.wrangler/state/v3/d1/`
  - **Production**: Cloudflare D1 (globally distributed)

---

## 🗄️ Database Tables

### 1. **users** - User Accounts
**Stores**: User registration data, authentication, profiles

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  
  -- OAuth fields
  google_id TEXT UNIQUE,
  twitter_id TEXT UNIQUE,
  oauth_provider TEXT,
  
  -- Web3 fields
  wallet_address TEXT UNIQUE,
  
  -- Verification
  email_verified BOOLEAN DEFAULT 0,
  verification_token TEXT,
  verification_token_expires DATETIME,
  
  -- Password reset
  reset_token TEXT,
  reset_token_expires DATETIME,
  
  -- Profile
  display_name TEXT,
  avatar_url TEXT,
  
  -- Game balances
  virtual_balance REAL DEFAULT 10000,
  mlt_balance REAL DEFAULT 10000,
  premium_balance REAL DEFAULT 0,
  
  -- Level & XP
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);
```

**Example Data**:
```json
{
  "id": 4,
  "email": "test202602@example.com",
  "username": "testuser202602",
  "virtual_balance": 10000,
  "mlt_balance": 10000,
  "level": 1,
  "xp": 0,
  "created_at": "2026-02-20 17:45:26"
}
```

### 2. **coins** - Meme Coins
**Stores**: All created meme coins with market data

```sql
CREATE TABLE coins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  creator_id INTEGER,
  
  -- Market data
  total_supply REAL DEFAULT 1000000000,
  current_supply REAL DEFAULT 1000000000,
  market_cap REAL DEFAULT 0,
  price REAL DEFAULT 0.0001,
  
  -- Bonding curve
  bonding_curve_progress REAL DEFAULT 0,
  is_graduated BOOLEAN DEFAULT 0,
  graduated_at DATETIME,
  
  -- Statistics
  volume_24h REAL DEFAULT 0,
  holders_count INTEGER DEFAULT 0,
  trades_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (creator_id) REFERENCES users(id)
);
```

### 3. **holdings** - User Token Holdings
**Stores**: User's meme coin portfolio

```sql
CREATE TABLE holdings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  average_buy_price REAL DEFAULT 0,
  total_invested REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id),
  UNIQUE(user_id, coin_id)
);
```

### 4. **transactions** - Trading History
**Stores**: All buy/sell transactions

```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'buy' or 'sell'
  amount REAL NOT NULL,
  price REAL NOT NULL,
  total REAL NOT NULL,
  fee REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);
```

### 5. **user_achievements** - Achievement Progress
**Stores**: User achievement unlocks

```sql
CREATE TABLE user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  achievement_id INTEGER NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT 0,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (achievement_id) REFERENCES achievement_definitions(id),
  UNIQUE(user_id, achievement_id)
);
```

### 6. **achievement_definitions** - Achievement Types
**Stores**: Available achievements

```sql
CREATE TABLE achievement_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  target INTEGER DEFAULT 1,
  reward_mlt INTEGER DEFAULT 0,
  reward_xp INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 7. **comments** - Coin Comments
**Stores**: User comments on coins

```sql
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  reports_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (coin_id) REFERENCES coins(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 8. **leaderboard** - User Rankings
**Stores**: User leaderboard data

```sql
CREATE TABLE leaderboard (
  user_id INTEGER PRIMARY KEY,
  rank INTEGER,
  total_value REAL DEFAULT 0,
  total_profit REAL DEFAULT 0,
  portfolio_value REAL DEFAULT 0,
  coins_created INTEGER DEFAULT 0,
  successful_trades INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 9. **price_history** - Price Charts
**Stores**: Historical price data for charts

```sql
CREATE TABLE price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  price REAL NOT NULL,
  volume REAL DEFAULT 0,
  market_cap REAL DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);
```

### 10. **notifications** - User Notifications
**Stores**: System notifications

```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data TEXT, -- JSON
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 📁 Additional Tables

### Email & Authentication
- `email_subscribers` - Newsletter subscriptions
- `email_verification_tokens` - Email verification tokens
- `password_reset_tokens` - Password reset tokens
- `sessions` - User sessions

### Social Features
- `follows` / `user_follows` - User following relationships
- `favorites` - Favorite coins
- `comment_likes` - Comment likes
- `comment_reports` - Comment reports

### Game Mechanics
- `activities` - User activity feed
- `ai_traders` - AI bot traders
- `orders` - Pending orders
- `trade_history` - Detailed trade history
- `mlt_transactions` - MLT token transactions

### Advanced Features
- `coin_events` - Special coin events
- `coin_protection` - Anti-rugpull protection
- `market_events` / `market_events_enhanced` - Market-wide events
- `user_profiles` - Extended profile data
- `user_stats` - User statistics

---

## 🔍 How to Access Data

### Local Development (Sandbox)

**View all tables:**
```bash
npx wrangler d1 execute memelaunch-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"
```

**View users:**
```bash
npx wrangler d1 execute memelaunch-db --local --command="SELECT * FROM users;"
```

**View coins:**
```bash
npx wrangler d1 execute memelaunch-db --local --command="SELECT * FROM coins;"
```

**Count records:**
```bash
npx wrangler d1 execute memelaunch-db --local --command="SELECT COUNT(*) FROM users;"
```

**View specific user:**
```bash
npx wrangler d1 execute memelaunch-db --local --command="SELECT * FROM users WHERE email='test@example.com';"
```

### Production Database

**Add `--remote` flag to access production:**
```bash
npx wrangler d1 execute memelaunch-db --remote --command="SELECT COUNT(*) FROM users;"
```

---

## 📊 Current Data Status

### Users Table ✅
- **Local**: 4 users registered
- **Storage**: Email, username, password_hash, balances, OAuth data
- **Features**: Email verification, password reset, MetaMask wallet linking

### Example User:
```json
{
  "id": 4,
  "email": "test202602@example.com",
  "username": "testuser202602",
  "virtual_balance": 10000,
  "mlt_balance": 10000,
  "premium_balance": 0,
  "level": 1,
  "xp": 0,
  "created_at": "2026-02-20 17:45:26"
}
```

### Coins Table ✅
- **Ready**: Schema created
- **Storage**: Coin name, symbol, description, image, market data
- **Features**: Bonding curve, graduation, volume tracking

### Other Tables ✅
- All 34 tables created and ready
- Indexes applied for performance
- Foreign keys configured

---

## 🔐 Data Security

### Password Storage
- **Algorithm**: bcrypt
- **Rounds**: 10
- **Storage**: `password_hash` column (never plain text)

### Tokens
- **JWT**: 7-day expiry for authentication
- **Reset Tokens**: 1-hour expiry for password reset
- **Verification Tokens**: 24-hour expiry for email verification

### OAuth Data
- Google ID, Twitter ID stored separately
- No access tokens stored (used only during authentication)

### Web3 Wallet
- Wallet addresses stored in lowercase
- Nonce-based authentication
- Signature verification

---

## 📈 Data Flow

### Registration Flow
1. User submits email/username/password
2. Backend validates input
3. Password hashed with bcrypt
4. User record created in `users` table
5. Initial balances set (10,000 virtual + 10,000 MLT)
6. JWT token generated and returned

### Login Flow
1. User submits email/password
2. Backend retrieves user from `users` table
3. Password verified with bcrypt
4. `last_login` timestamp updated
5. JWT token generated and returned

### Coin Creation Flow
1. User creates coin with name, symbol, image
2. Record inserted into `coins` table
3. Initial supply and price set
4. Creator receives initial allocation
5. Holding record created in `holdings` table

### Trading Flow
1. User places buy/sell order
2. Transaction recorded in `transactions` table
3. Holding updated in `holdings` table
4. User balance updated in `users` table
5. Coin statistics updated (volume, holders, etc.)

---

## 🚀 Database Migrations

### Applied Migrations (22 total)
- ✅ 0001_initial_schema.sql
- ✅ 0002_add_user_profiles.sql
- ✅ 0003_add_achievements.sql
- ✅ 0004_add_notifications.sql
- ✅ 0005_add_email_verification.sql
- ✅ 0006_add_oauth_fields.sql
- ✅ 0007_add_wallet_address.sql
- ✅ 0008_add_password_reset.sql
- ✅ 0009_add_leaderboard.sql
- ✅ 0010_add_price_history.sql
- ✅ ... (through 0020)

### How to Apply New Migrations
```bash
# Local
npx wrangler d1 migrations apply memelaunch-db --local

# Production
npx wrangler d1 migrations apply memelaunch-db --remote
```

---

## 🎯 Data Access via API

### User Data
- `GET /api/auth/profile` - Get current user data
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login and get user data

### Coin Data
- `GET /api/coins` - List all coins
- `GET /api/coins/:id` - Get specific coin
- `POST /api/coins` - Create new coin

### Transaction Data
- `GET /api/transactions` - User's transaction history
- `POST /api/transactions/buy` - Buy coins
- `POST /api/transactions/sell` - Sell coins

### Leaderboard Data
- `GET /api/leaderboard` - Top users
- `GET /api/leaderboard/:userId` - User's rank

---

## 📝 Database Location Summary

**All data is stored in Cloudflare D1 Database:**

| Data Type | Table Name | Example Count |
|-----------|-----------|---------------|
| Users | `users` | 4 |
| Meme Coins | `coins` | 0 (ready) |
| Holdings | `holdings` | 0 (ready) |
| Transactions | `transactions` | 0 (ready) |
| Achievements | `achievement_definitions` | 0 (ready) |
| Comments | `comments` | 0 (ready) |
| Leaderboard | `leaderboard` | 0 (ready) |

**Database Path:**
- Local: `/home/user/webapp/.wrangler/state/v3/d1/`
- Production: Cloudflare D1 (globally distributed)

---

## ✅ Verification

### Test Database Connection
```bash
cd /home/user/webapp
npx wrangler d1 execute memelaunch-db --local --command="SELECT COUNT(*) as count FROM users;"
```

### Test User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test@1234"}'
```

### Test User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

---

## 🎉 Summary

✅ **All data is stored in Cloudflare D1 Database**  
✅ **34 tables created and ready**  
✅ **User registration and login working**  
✅ **Secure password hashing with bcrypt**  
✅ **JWT token authentication**  
✅ **OAuth and MetaMask data support**  
✅ **Local and production environments configured**

**Database Status**: 🟢 **Fully Operational**

---

**Last Updated**: 2026-02-20  
**Database Version**: v1.0  
**Total Tables**: 34
