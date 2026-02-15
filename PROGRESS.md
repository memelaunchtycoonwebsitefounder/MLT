# MLT Economy & AI Market System - Implementation Progress

## 📅 Current Status: Phase 1 Complete ✅ - 2026-02-13

### ✅ Phase 1: Database Migration (COMPLETE)

#### Database Schema Updates
**coins table** - MLT Economy Fields:
- `initial_mlt_investment` REAL (2000.0) - 創幣時的 MLT 投資
- `bonding_curve_progress` REAL (0.0-1.0) - Bonding curve 進度 (0% - 100%)
- `bonding_curve_k` REAL (4.0) - Bonding curve 曲線係數
- `destiny_type` TEXT - Coin 命運類型 (unknown/sniper/whale/death/graduate)
- `is_ai_active` BOOLEAN (1) - AI 交易系統是否啟用
- `death_time` DATETIME - 死亡時間
- `graduation_time` DATETIME - 畢業時間 (100% bonding curve)
- `last_ai_trade_time` DATETIME - 最後 AI 交易時間

**coins table** - Event Tracking:
- `has_sniper_attack` BOOLEAN - 是否遭遇 Sniper 攻擊
- `has_whale_buy` BOOLEAN - 是否有巨鯨買入
- `has_rug_pull` BOOLEAN - 是否發生 Rug Pull
- `has_panic_sell` BOOLEAN - 是否發生恐慌性拋售
- `has_fomo_buy` BOOLEAN - 是否發生 FOMO 買入
- `has_viral_moment` BOOLEAN - 是否發生病毒式傳播

**coins table** - Statistics:
- `real_trade_count` INTEGER - 真實玩家交易次數
- `ai_trade_count` INTEGER - AI 交易次數
- `unique_real_traders` INTEGER - 獨特真實玩家數量

**New Tables Created:**
1. **coin_events** - 市場事件記錄
   - `id`, `coin_id`, `event_type`, `event_data`, `impact_percent`, `created_at`
   - Tracks: SNIPER_ATTACK, WHALE_BUY, RUG_PULL, PANIC_SELL, FOMO_BUY, VIRAL_MOMENT

2. **ai_traders** - AI 交易者管理
   - `id`, `coin_id`, `trader_type`, `holdings`, `total_bought`, `total_sold`
   - `entry_price`, `target_profit_percent`, `is_active`, `created_at`, `last_trade_at`
   - Trader Types: SNIPER, WHALE, RETAIL, BOT, MARKET_MAKER

**Updated Tables:**
- `price_history` - Added `trader_type` and `circulating_supply` columns
- `transactions` - Added `ai_trader_type` column
- `users` - Already has `mlt_balance` (10,000 starting balance)

#### Test Data Inserted
✅ 3 test coins with MLT parameters
✅ Initial price history
✅ Test user with 10,000 MLT balance

---

## 🚧 Phase 2: AI Market System (NEXT)

### 2.1 Bonding Curve Implementation
**File**: `src/utils/bonding-curve.ts` (TO CREATE)

**Formula**: `Current Price = Initial Price × e^(k × progress)`

**Functions to implement**:
```typescript
// Calculate current price based on bonding curve progress
export function calculateBondingCurvePrice(
  initialPrice: number,
  progress: number,  // 0.0 - 1.0
  k: number = 4.0
): number

// Calculate progress after buying tokens
export function calculateProgressAfterBuy(
  currentProgress: number,
  totalSupply: number,
  circulatingSupply: number,
  buyAmount: number
): number

// Calculate final price after a trade
export function calculateFinalPrice(
  initialMLTInvestment: number,
  totalSupply: number,
  circulatingSupply: number,
  tradeAmount: number,
  isBuy: boolean
): { newPrice: number, newProgress: number }
```

**Price Examples (k=4.0)**:
- 0% progress → Initial price (1.00x)
- 10% progress → 1.49x
- 25% progress → 2.72x  
- 50% progress → 7.39x
- 75% progress → 20.09x
- 100% progress → 54.60x

### 2.2 AI Trader Engine
**File**: `src/services/ai-trader-engine.ts` (TO CREATE)

**Trader Types & Behaviors**:

1. **SNIPER** (80% probability)
   - Entry: 5-30 seconds after coin launch
   - Buy: 5-15% of total supply
   - Target profit: 30-100%
   - Sell: Quick dump within 1-3 minutes

2. **WHALE** (20% probability)
   - Entry: 5-20 minutes after launch  
   - Buy: 10-30% of total supply in 2-3 batches
   - Target profit: 50-200%
   - Sell: Gradual exit over 10-30 minutes

3. **RETAIL** (Continuous, random)
   - Buy/Sell: 0.1-2% of supply
   - Random timing (every 30s - 5min)
   - Target: 10-50% profit
   - Behavior: FOMO/Panic based on price movement

4. **BOT** (High frequency)
   - Small trades (0.01-0.5% of supply)
   - Very frequent (every 5-30 seconds)
   - Target: 5-15% profit
   - Creates volume and liquidity

5. **MARKET_MAKER** (Passive)
   - Buys on dips, sells on pumps
   - Maintains 2-10% of supply
   - Helps stabilize price
   - Target: 20-50% profit

**Functions to implement**:
```typescript
// Initialize AI traders for a new coin
export async function initializeAITraders(
  coinId: number,
  initialMLTInvestment: number,
  totalSupply: number
): Promise<void>

// Execute one AI trading cycle
export async function executeAITradingCycle(
  coinId: number
): Promise<void>

// Determine destiny for a coin
export function determineDestiny(): 
  'GRADUATED' | 'DEATH_5MIN' | 'SURVIVAL_10MIN' | 'RUG_PULL'

// Schedule market events based on probabilities
export async function scheduleMarketEvents(
  coinId: number,
  destinyType: string
): Promise<void>
```

### 2.3 Market Event System  
**File**: `src/services/market-events.ts` (TO CREATE)

**Event Probabilities**:
- Sniper Attack: 80%
- Rug Pull: 35%
- Whale Buy: 20%
- Panic Sell: 25%
- FOMO Buy: 15%
- Viral Moment: 5%

**Survival Rates**:
- Death after 5min: 35%
- Death after 10min: 55%  
- Reach 100% bonding curve: 5%
- Normal survival: 5%

**Functions to implement**:
```typescript
// Trigger a specific market event
export async function triggerEvent(
  coinId: number,
  eventType: 'SNIPER_ATTACK' | 'WHALE_BUY' | 'RUG_PULL' | 'PANIC_SELL' | 'FOMO_BUY' | 'VIRAL_MOMENT',
  impactPercent: number
): Promise<void>

// Check if coin should die based on conditions
export async function checkCoinDeath(coinId: number): Promise<boolean>

// Handle coin death
export async function handleCoinDeath(
  coinId: number,
  reason: string
): Promise<void>

// Handle coin graduation (100% bonding curve)
export async function handleCoinGraduation(coinId: number): Promise<void>
```

### 2.4 Background Job Scheduler
**File**: `src/services/scheduler.ts` (TO CREATE)

**Jobs to schedule**:
1. AI Trading Cycle (every 5-15 seconds per active coin)
2. Market Event Checks (every 30 seconds)
3. Death Condition Checks (every 60 seconds)
4. Cleanup inactive coins (every 5 minutes)

**Functions**:
```typescript
// Start scheduler for a coin
export async function startCoinScheduler(coinId: number): Promise<void>

// Stop scheduler when coin dies or graduates
export async function stopCoinScheduler(coinId: number): Promise<void>

// Global scheduler initialization
export async function initializeGlobalScheduler(): Promise<void>
```

---

## 🎯 Phase 3: Frontend Updates (LATER)

### UI Changes Needed:
1. **Coin List Page** (`src/index.tsx`)
   - Show bonding curve progress bar
   - Show AI activity indicator
   - Show destiny badges (🎯 Graduated, 💀 Dead, ⚡ Sniper Attack, etc.)
   - Color-code real vs AI trades on charts

2. **Coin Detail Page** (`public/static/coin-detail.js`)
   - Real-time bonding curve progress indicator
   - AI vs Real trader activity split
   - Event timeline (Sniper Attack, Whale Buy, etc.)
   - Color-coded price history (green=real buy, red=real sell, gray=AI trade)

3. **Create Coin Flow**
   - MLT investment slider (1,800 - 10,000 MLT)
   - Forced pre-purchase (minimum 100 MLT worth)
   - Total cost calculator
   - Warning about destiny probabilities

---

## 📊 Current Database Status

**Tables Ready**:
✅ users (with mlt_balance)
✅ coins (with all MLT economy fields)
✅ transactions (with ai_trader_type)
✅ price_history (with trader_type)
✅ coin_events (new)
✅ ai_traders (new)

**Test Data**:
✅ 1 test user (test@example.com, 10,000 MLT)
✅ 3 test coins (with bonding curve parameters)

**Service Status**:
✅ Backend running on http://localhost:3000
✅ Database migrations applied
✅ Seed data loaded

---

## 🚀 Next Steps

### Immediate (Phase 2.1)
1. Create `src/utils/bonding-curve.ts` with price calculation logic
2. Test bonding curve formula with various scenarios
3. Update buy/sell API endpoints to use bonding curve pricing

### Soon (Phase 2.2)
1. Create AI trader engine with 5 trader types
2. Implement destiny determination logic
3. Schedule initial AI traders for each new coin

### Later (Phase 2.3)
1. Implement market event system
2. Add death and graduation handlers
3. Create background scheduler

---

## 📝 Notes

- **Current branch**: `stable-with-test-data`
- **Last commit**: Phase 1 database migration complete
- **Service URL**: http://localhost:3000
- **Test credentials**: test@example.com / Test123!

**MLT Balance System**:
- New users start with 10,000 MLT
- Creating a coin costs 1,800-10,000 MLT
- Must pre-purchase minimum 100 MLT worth of created coin
- All trading uses MLT (no virtual_balance anymore)

**Bonding Curve Design**:
- Formula: Price = InitialPrice × e^(4 × progress)
- Progress increases as circulating supply increases
- At 100% progress, coin "graduates" and price is 54.6x initial
- Only 5% of coins are expected to reach graduation
