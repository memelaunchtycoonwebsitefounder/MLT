# 🚀 MemeLaunch Tycoon - Complete API Documentation

## Base URL
```
Local Development: http://localhost:3000
Production: https://your-deployment.pages.dev
```

---

## 📝 Table of Contents
1. [Authentication](#authentication)
2. [Coins](#coins)
3. [Trading](#trading)
4. [Portfolio](#portfolio)
5. [Admin](#admin)
6. [Leaderboard](#leaderboard)

---

## 🔐 Authentication

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "mlt_balance": 10000,
      "virtual_balance": 10000
    }
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

---

## 💰 Coins

### Create New Coin (MLT Economy + AI)
```http
POST /api/coins
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Rocket Moon",
  "symbol": "RMOON",
  "description": "To the moon! 🚀",
  "total_supply": 1000000,
  "initial_mlt_investment": 2000,
  "pre_purchase_amount": 50000,
  "twitter_url": "https://twitter.com/rocketmoon",
  "telegram_url": "https://t.me/rocketmoon",
  "website_url": "https://rocketmoon.com"
}
```

**Parameters:**
- `name` (required): 3-50 characters
- `symbol` (optional): 2-10 characters, auto-generated if not provided
- `description` (optional): Coin description
- `total_supply` (required): 1 - 1,000,000,000
- `initial_mlt_investment` (required): 1,800 - 10,000 MLT
- `pre_purchase_amount` (required): Minimum based on 100 MLT value
- `twitter_url`, `telegram_url`, `website_url` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "coin": {
      "id": 4,
      "name": "Rocket Moon",
      "symbol": "RMOON",
      "total_supply": 1000000,
      "circulating_supply": 50000,
      "current_price": 0.00244,
      "bonding_curve_progress": 0.05,
      "destiny_type": "RUG_PULL",
      "is_ai_active": 1,
      "ai_trade_count": 0,
      "real_trade_count": 0
    },
    "cost": {
      "initial_investment": 2000,
      "pre_purchase_cost": 110.59,
      "total_cost": 2110.59
    },
    "pre_purchase": {
      "amount": 50000,
      "average_price": 0.002212,
      "final_price": 0.00244,
      "progress": 0.05
    },
    "ai_system": {
      "destiny": "RUG_PULL",
      "events_scheduled": 4,
      "scheduler_started": true
    }
  }
}
```

### Get All Coins
```http
GET /api/coins?page=1&limit=20&sortBy=created_at&order=DESC&search=moon
```

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page
- `sortBy` (default: created_at): Sort field
- `order` (default: DESC): Sort order
- `search` (optional): Search in name, symbol, description
- `symbol` (optional): Filter by exact symbol

### Get Single Coin
```http
GET /api/coins/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "creator_id": 2,
    "name": "Rocket Moon",
    "symbol": "RMOON",
    "description": "To the moon! 🚀",
    "total_supply": 1000000,
    "circulating_supply": 51505,
    "current_price": 0.002458,
    "market_cap": 126.58,
    "bonding_curve_progress": 0.051505,
    "bonding_curve_k": 4,
    "destiny_type": "RUG_PULL",
    "is_ai_active": 1,
    "ai_trade_count": 3,
    "real_trade_count": 0,
    "has_sniper_attack": 0,
    "has_whale_buy": 0,
    "creator_username": "testcreator"
  }
}
```

### Get Price History
```http
GET /api/coins/:id/price-history?limit=100
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coin_id": 4,
    "interval": "1h",
    "data": [
      {
        "price": 0.00244,
        "volume": 50000,
        "market_cap": 122.14,
        "trader_type": null,
        "timestamp": "2026-02-14 04:24:50"
      }
    ]
  }
}
```

### Get Trending Coins
```http
GET /api/coins/trending/list?limit=10
```

---

## 📈 Trading

### Buy Tokens (Bonding Curve)
```http
POST /api/trades/buy
Authorization: Bearer {token}
Content-Type: application/json

{
  "coinId": 4,
  "amount": 10000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": 123,
    "amount": 10000,
    "price": 0.00260,
    "averagePrice": 0.00254,
    "totalCost": 25.40,
    "newBalance": 7864.01,
    "bondingCurveProgress": 0.0615,
    "priceIncrease": "+5.69%"
  }
}
```

### Sell Tokens (Bonding Curve)
```http
POST /api/trades/sell
Authorization: Bearer {token}
Content-Type: application/json

{
  "coinId": 4,
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": 124,
    "amount": 5000,
    "price": 0.00252,
    "averagePrice": 0.00256,
    "totalRevenue": 12.80,
    "newBalance": 7876.81,
    "bondingCurveProgress": 0.0565,
    "priceDecrease": "-3.08%"
  }
}
```

### Get Trade History
```http
GET /api/trades/history?page=1&limit=20
Authorization: Bearer {token}
```

### Get Recent Trades
```http
GET /api/trades/recent?limit=5
Authorization: Bearer {token}
```

---

## 💼 Portfolio

### Get User Portfolio
```http
GET /api/portfolio
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_value": 12340.56,
    "mlt_balance": 7876.81,
    "holdings_value": 4463.75,
    "total_profit": 2340.56,
    "holdings": [
      {
        "coin_id": 4,
        "coin_name": "Rocket Moon",
        "coin_symbol": "RMOON",
        "amount": 45000,
        "avg_buy_price": 0.00212,
        "current_price": 0.00252,
        "current_value": 113.40,
        "profit_loss": 18.00,
        "profit_loss_percent": 18.87
      }
    ]
  }
}
```

---

## 🛠️ Admin (Testing/Monitoring)

### Start Global Scheduler
```http
POST /api/admin/scheduler/start
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Global scheduler started",
    "status": {
      "isRunning": true,
      "activeCoins": 1,
      "schedulers": [
        {
          "coinId": 4,
          "isActive": true,
          "age": 308,
          "pendingEvents": 4
        }
      ]
    }
  }
}
```

### Stop Global Scheduler
```http
POST /api/admin/scheduler/stop
```

### Get Scheduler Status
```http
GET /api/admin/scheduler/status
```

### Initialize AI for Coin
```http
POST /api/admin/coins/:id/init-ai
```

### Manual Trading Cycle
```http
POST /api/admin/coins/:id/trade-cycle
```

### Get System Statistics
```http
GET /api/admin/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coins": {
      "total_coins": 4,
      "active_coins": 4,
      "dead_coins": 0,
      "graduated_coins": 0,
      "avg_progress": 0.069983,
      "total_ai_trades": 18,
      "total_real_trades": 0
    },
    "traders": [
      {
        "trader_type": "BOT",
        "count": 11
      },
      {
        "trader_type": "SNIPER",
        "count": 1
      }
    ],
    "events": [
      {
        "event_type": "COIN_CREATED",
        "count": 2
      }
    ],
    "scheduler": {
      "isRunning": true,
      "activeCoins": 1
    }
  }
}
```

---

## 🏆 Leaderboard

### Get Top Users
```http
GET /api/leaderboard?limit=10
```

---

## 📊 Bonding Curve Formula

### Price Calculation
```
Current Price = Initial Price × e^(k × progress)

Where:
- Initial Price = initial_mlt_investment / total_supply
- k = 4.0 (default curve steepness)
- progress = circulating_supply / total_supply (0 to 1)
```

### Example Price Points (k=4.0)
```
Progress  | Multiplier | Example (0.002 initial)
----------|------------|------------------------
0%        | 1.00x      | 0.002000 MLT
10%       | 1.49x      | 0.002984 MLT
25%       | 2.72x      | 0.005437 MLT
50%       | 7.39x      | 0.014778 MLT
75%       | 20.09x     | 0.040171 MLT
100%      | 54.60x     | 0.109196 MLT
```

---

## 🎮 AI Trader Types

### SNIPER
- Entry: 5-30 seconds after launch
- Buy Amount: 5-15% of supply
- Target Profit: 30-100%
- Behavior: Quick entry, fast exit

### WHALE
- Entry: 5-20 minutes after launch
- Buy Amount: 10-30% of supply
- Target Profit: 50-200%
- Behavior: Large buys, gradual exit

### RETAIL
- Entry: 1-10 minutes
- Buy Amount: 0.1-2% of supply
- Target Profit: 10-50%
- Behavior: Random, emotional

### BOT
- Entry: 10-60 seconds
- Buy Amount: 0.01-0.5% of supply
- Target Profit: 5-15%
- Behavior: High-frequency, mechanical

### MARKET_MAKER
- Entry: 30-120 seconds
- Buy Amount: 1-5% of supply
- Target Profit: 20-50%
- Behavior: Provides liquidity, stabilizes

---

## 🎯 Destiny Types

### GRADUATED (5% probability)
- Reaches 100% bonding curve
- Most events are positive
- Long timeline

### DEATH_5MIN (35% probability)
- Dies within 5 minutes
- Fast collapse
- Sniper attack + panic sell

### DEATH_10MIN (20% probability)
- Dies within 10 minutes
- Some FOMO, then collapse
- Multiple negative events

### RUG_PULL (35% probability)
- Coordinated dump
- Initial hype, then crash
- Creator/whale dumps

### SURVIVAL (5% probability)
- Normal long-term survival
- Balanced events
- Steady growth

---

## 🔔 Event Types

1. **SNIPER_ATTACK** (80% probability)
   - Impact: -15%
   - Triggers: 5-30s after launch

2. **WHALE_BUY** (20% probability)
   - Impact: +25%
   - Triggers: 5-20 minutes

3. **RUG_PULL** (35% probability)
   - Impact: -80%
   - Triggers: 10-20 minutes
   - Causes death

4. **PANIC_SELL** (25% probability)
   - Impact: -40%
   - Triggers: 2-5 minutes

5. **FOMO_BUY** (15% probability)
   - Impact: +35%
   - Triggers: 2-10 minutes

6. **VIRAL_MOMENT** (5% probability)
   - Impact: +100%
   - Triggers: 30+ minutes

---

## ⚠️ Error Codes

### 400 - Bad Request
```json
{
  "error": "Invalid parameters"
}
```

### 401 - Unauthorized
```json
{
  "error": "未授權"
}
```

### 404 - Not Found
```json
{
  "error": "幣種未找到"
}
```

### 500 - Internal Server Error
```json
{
  "error": "服務器錯誤"
}
```

---

## 🧪 Testing Examples

### Create and Monitor a Coin
```bash
# 1. Register user
TOKEN=$(curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"Test123!"}' \
  | jq -r '.data.token')

# 2. Create coin
curl -X POST http://localhost:3000/api/coins \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Coin",
    "symbol": "TEST",
    "total_supply": 1000000,
    "initial_mlt_investment": 2000,
    "pre_purchase_amount": 50000
  }'

# 3. Start scheduler
curl -X POST http://localhost:3000/api/admin/scheduler/start

# 4. Monitor stats
watch -n 5 'curl -s http://localhost:3000/api/admin/stats | jq'

# 5. Buy tokens
curl -X POST http://localhost:3000/api/trades/buy \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"coinId": 1, "amount": 10000}'
```

---

## 📝 Rate Limits

- Authentication: 10 requests/minute
- Trading: 20 requests/minute
- Coin Creation: 3 per day per user
- General API: 100 requests/minute

---

## 🔄 WebSocket (Future)

### Connect to Real-time Updates
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle: price_update, trade_executed, event_triggered
};
```

---

## 📚 Additional Resources

- [GAMIFICATION_DESIGN.md](./GAMIFICATION_DESIGN.md) - Game design
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - Implementation details
- [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) - System overview

---

**Last Updated**: 2026-02-14
**Version**: 1.0.0 (Phase 2 Complete)
**Status**: Production Ready (Backend)
