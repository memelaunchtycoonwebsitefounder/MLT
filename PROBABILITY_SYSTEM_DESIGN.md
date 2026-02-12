# 🎲 事件機率動態調整系統

## 核心概念

初始投資和保護功能應該影響Meme幣的"命運"，讓遊戲更有策略性和深度。

---

## 💰 初始投資影響機率

### 基礎機制

投資越多的幣，獲得更好"命運"的機會越大。

### 投資等級劃分

| 投資額 | 等級 | 說明 |
|--------|------|------|
| 1,800 - 2,999 MLT | D級 | 最低投資，高風險 |
| 3,000 - 4,999 MLT | C級 | 普通投資，中等風險 |
| 5,000 - 7,999 MLT | B級 | 較高投資，較低風險 |
| 8,000 - 9,999 MLT | A級 | 高投資，低風險 |
| 10,000+ MLT | S級 | 最高投資，最低風險 |

### 機率調整公式

```javascript
// 基礎機率
const baseProbability = {
  死亡率_5分鐘: 0.35,
  死亡率_10分鐘: 0.55,
  rugPull機率: 0.35,
  登月機率: 0.05,
  巨鯨機率: 0.20
};

// 投資影響係數
const investmentMultiplier = {
  'D': 1.0,    // 無加成
  'C': 0.85,   // 減少15%負面機率
  'B': 0.70,   // 減少30%負面機率
  'A': 0.55,   // 減少45%負面機率
  'S': 0.40    // 減少60%負面機率
};

// 計算實際機率
function calculateProbability(baseProb, investmentLevel) {
  const multiplier = investmentMultiplier[investmentLevel];
  
  // 負面事件：機率降低
  if (isNegativeEvent) {
    return baseProb * multiplier;
  }
  // 正面事件：機率提高
  else {
    return baseProb + (1 - baseProb) * (1 - multiplier);
  }
}
```

### 投資影響表

#### D級（1,800-2,999 MLT）- 無加成
- 5分鐘死亡率：35%
- Rug Pull：35%
- 登月機率：5%
- 巨鯨買入：20%

#### C級（3,000-4,999 MLT）- 減少15%
- 5分鐘死亡率：29.75%（35% × 0.85）
- Rug Pull：29.75%
- 登月機率：9.25%（5% + 95% × 0.15）
- 巨鯨買入：32%

#### B級（5,000-7,999 MLT）- 減少30%
- 5分鐘死亡率：24.5%（35% × 0.70）
- Rug Pull：24.5%
- 登月機率：13.5%（5% + 95% × 0.30）
- 巨鯨買入：44%

#### A級（8,000-9,999 MLT）- 減少45%
- 5分鐘死亡率：19.25%
- Rug Pull：19.25%
- 登月機率：17.75%
- 巨鯨買入：56%

#### S級（10,000+ MLT）- 減少60%
- 5分鐘死亡率：14%
- Rug Pull：14%
- 登月機率：62%（超高登月率！）
- 巨鯨買入：68%

---

## 🛡️ 保護功能影響機率

### 三種保護功能

1. **Revoke Freeze（300 MLT）**
   - 防止創建者凍結交易
   - 增加社群信任度
   - 影響：減少Rug Pull機率

2. **Revoke Mint（500 MLT）**
   - 防止增發代幣
   - 保護稀缺性
   - 影響：增加登月機率

3. **Revoke Update（1,000 MLT）**
   - 防止任意修改合約
   - 最高安全等級
   - 影響：大幅減少死亡率

### 保護功能加成表

| 保護組合 | 額外成本 | Rug Pull減少 | 登月增加 | 死亡率減少 |
|---------|---------|-------------|---------|-----------|
| 無保護 | 0 MLT | 0% | 0% | 0% |
| Freeze | 300 MLT | -15% | +5% | -5% |
| Freeze + Mint | 800 MLT | -25% | +15% | -10% |
| 全部保護 | 1,800 MLT | -40% | +30% | -20% |

### 綜合計算公式

```javascript
function calculateFinalProbability(baseProb, investmentLevel, protections) {
  // 第一步：投資影響
  let prob = calculateProbability(baseProb, investmentLevel);
  
  // 第二步：保護功能影響
  const protectionBonus = {
    rugPullReduction: 0,
    moonBoost: 0,
    deathReduction: 0
  };
  
  if (protections.includes('revoke_freeze')) {
    protectionBonus.rugPullReduction += 0.15;
    protectionBonus.moonBoost += 0.05;
    protectionBonus.deathReduction += 0.05;
  }
  
  if (protections.includes('revoke_mint')) {
    protectionBonus.rugPullReduction += 0.10;
    protectionBonus.moonBoost += 0.10;
    protectionBonus.deathReduction += 0.05;
  }
  
  if (protections.includes('revoke_update')) {
    protectionBonus.rugPullReduction += 0.15;
    protectionBonus.moonBoost += 0.15;
    protectionBonus.deathReduction += 0.10;
  }
  
  // 應用保護加成
  if (eventType === 'rugPull' || eventType === 'death') {
    prob = prob * (1 - protectionBonus.rugPullReduction);
    prob = prob * (1 - protectionBonus.deathReduction);
  } else if (eventType === 'moon') {
    prob = prob + (1 - prob) * protectionBonus.moonBoost;
  }
  
  return Math.max(0, Math.min(1, prob));
}
```

---

## 💎 最佳策略示例

### 策略1：最小投資（1,800 MLT + 無保護）
**總成本**：1,800 MLT
**機率**：
- 5分鐘死亡：35%
- Rug Pull：35%
- 登月：5%
**適合**：賭徒型玩家，追求極致ROI

### 策略2：穩健投資（5,000 MLT + Freeze保護）
**總成本**：5,300 MLT
**機率**：
- 5分鐘死亡：23.275%（24.5% × 0.95）
- Rug Pull：20.825%（24.5% × 0.85）
- 登月：18.375%
**適合**：穩健型玩家，平衡風險

### 策略3：安全投資（8,000 MLT + 全部保護）
**總成本**：9,800 MLT
**機率**：
- 5分鐘死亡：12.32%（19.25% × 0.80 × 0.80）
- Rug Pull：6.93%（19.25% × 0.60）
- 登月：**80.6%**（巨大成功率！）
**適合**：追求成功率的玩家

### 策略4：終極投資（10,000 MLT + 全部保護）
**總成本**：11,800 MLT
**機率**：
- 5分鐘死亡：8.96%
- Rug Pull：5.04%
- 登月：**84.8%**（幾乎必定成功！）
**適合**：富豪玩家，追求確定性

---

## 🎯 其他影響因素（可擴展）

### 1. 初始價格策略影響 ⭐ NEW!

**核心邏輯**：初始價格設定會影響市場心理和交易行為

```javascript
// 根據初始投資和供應量計算初始價格
const initialPrice = initialInvestment / totalSupply;

// 價格心理學影響
function calculatePriceImpact(initialPrice) {
  // 低價幣（< 0.001 MLT）：吸引散戶，但容易被pump & dump
  if (initialPrice < 0.001) {
    return {
      sniperBonus: +0.15,      // 狙擊者更愛低價幣
      panicSellMalus: +0.10,   // 散戶更容易恐慌
      whalePenalty: -0.05,     // 巨鯨不太關注低價幣
      moonBonus: +0.02         // 低價幣pump潛力稍高
    };
  }
  
  // 中價幣（0.001 - 0.01 MLT）：平衡，最穩定
  else if (initialPrice < 0.01) {
    return {
      sniperBonus: 0,
      panicSellMalus: 0,
      whalePenalty: 0,
      moonBonus: 0             // 無特殊加成
    };
  }
  
  // 高價幣（> 0.01 MLT）：吸引巨鯨，但流動性差
  else {
    return {
      sniperBonus: -0.10,      // 狙擊者對高價幣興趣低
      panicSellMalus: -0.05,   // 高價幣持有者更理性
      whalePenalty: +0.10,     // 巨鯨更關注高價幣
      moonBonus: +0.05         // 高價幣如果成功，回報更大
    };
  }
}

// 應用價格影響到事件機率
function applyPriceModifiers(baseProbabilities, initialPrice) {
  const impact = calculatePriceImpact(initialPrice);
  
  return {
    sniperProb: Math.min(1, baseProbabilities.sniper * (1 + impact.sniperBonus)),
    panicSellProb: Math.min(1, baseProbabilities.panicSell * (1 + impact.panicSellMalus)),
    whaleProb: Math.max(0, baseProbabilities.whale * (1 + impact.whalePenalty)),
    moonProb: Math.min(1, baseProbabilities.moon * (1 + impact.moonBonus))
  };
}
```

**實例分析**：

| 投資額 | 供應量 | 初始價格 | 狙擊者機率 | 恐慌拋售 | 巨鯨機率 | 登月機率 |
|--------|--------|----------|------------|----------|----------|----------|
| 2,000 MLT | 1,000,000 | 0.002 | 80% → 92% (+15%) | 25% → 27.5% | 20% → 19% | 5% → 5.1% |
| 5,000 MLT | 1,000,000 | 0.005 | 80% → 80% | 25% → 25% | 20% → 20% | 5% → 5% |
| 10,000 MLT | 1,000,000 | 0.010 | 80% → 72% (-10%) | 25% → 23.75% | 20% → 22% | 5% → 5.25% |

**設計意圖**：
- 低價幣：高風險高回報，適合賭徒
- 中價幣：平衡穩定，適合大眾
- 高價幣：吸引大戶，但需要更高初始投資

### 2. 圖片質量影響
```javascript
// AI分析圖片質量
const imageQuality = analyzeImage(coinImage);
// 高質量圖片增加吸引力
const attractionBonus = imageQuality / 100 * 0.1; // 最多+10%
```

### 3. 描述長度影響
```javascript
// 有描述的幣更專業
const descriptionBonus = description.length > 50 ? 0.05 : 0;
```

### 4. 社交連結影響
```javascript
// 有社交連結增加可信度
const socialBonus = 
  (hasTwitter ? 0.03 : 0) +
  (hasTelegram ? 0.03 : 0) +
  (hasWebsite ? 0.04 : 0); // 最多+10%
```

### 5. 總供應量影響
```javascript
// 稀缺性影響
const supplyMultiplier = {
  1000000: 1.0,      // 標準
  10000000: 0.9,     // 供應多，稀缺性低
  100000000: 0.8,
  1000000000: 0.7
};
```

### 6. 創建時間影響
```javascript
// 黃金時段創建（UTC 12:00-20:00）增加曝光
const timeBonus = isGoldenHour() ? 0.1 : 0;
```

### 7. 用戶等級影響
```javascript
// 高等級用戶更有經驗
const levelBonus = userLevel / 100 * 0.15; // 最多+15%
```

---

## 📊 綜合影響計算

```javascript
function calculateCoinDestiny(coinData, userData) {
  // 1. 投資等級
  const investmentLevel = getInvestmentLevel(coinData.initialInvestment);
  
  // 2. 保護功能
  const protections = coinData.protections || [];
  
  // 3. 其他因素
  const bonuses = {
    image: analyzeImageQuality(coinData.image),
    description: coinData.description.length > 50 ? 5 : 0,
    social: calculateSocialBonus(coinData),
    supply: getSupplyMultiplier(coinData.totalSupply),
    time: isGoldenHour() ? 10 : 0,
    userLevel: userData.level / 100 * 15
  };
  
  const totalBonus = Object.values(bonuses).reduce((a, b) => a + b, 0);
  
  // 4. 計算各事件機率
  const destiny = {
    death5m: calculateFinalProbability(0.35, investmentLevel, protections) * (1 - totalBonus/100),
    death10m: calculateFinalProbability(0.55, investmentLevel, protections) * (1 - totalBonus/100),
    rugPull: calculateFinalProbability(0.35, investmentLevel, protections),
    moon: calculateFinalProbability(0.05, investmentLevel, protections) * (1 + totalBonus/50),
    whale: calculateFinalProbability(0.20, investmentLevel, protections) * (1 + totalBonus/100)
  };
  
  return destiny;
}
```

---

## 🎮 遊戲平衡建議

### 成本與回報

| 策略 | 成本 | 登月率 | 期望ROI |
|------|------|--------|---------|
| 最小投資 | 1,800 | 5% | 278% |
| 穩健投資 | 5,300 | 18% | 940% |
| 安全投資 | 9,800 | 81% | 4,243% |
| 終極投資 | 11,800 | 85% | 4,454% |

### 建議調整

1. **鼓勵中高投資**：S級投資應該有明顯優勢
2. **保護功能價值**：全保護幣更容易成功
3. **風險回報平衡**：高風險策略也有極高回報可能

---

## 🚀 實施優先級

1. **高優先級**：投資等級系統
2. **高優先級**：保護功能影響
3. **中優先級**：圖片/描述/社交加成
4. **低優先級**：時間/供應量/用戶等級

---

請確認這個設計是否符合您的期望！我可以立即開始實現投資等級和保護功能的影響系統。
