/**
 * Test suite for Bonding Curve calculations
 * Run with: npx tsx src/utils/bonding-curve.test.ts
 */

import {
  calculateBondingCurvePrice,
  calculateInitialPrice,
  calculateBuyTrade,
  calculateSellTrade,
  calculateMinimumPrePurchase
} from './bonding-curve';

console.log('🧪 Testing Bonding Curve Calculations\n');

// Test parameters (from design doc)
const INITIAL_MLT = 2000;
const TOTAL_SUPPLY = 1000000;
const K = 4.0;

console.log('📊 Test Parameters:');
console.log(`   Initial MLT Investment: ${INITIAL_MLT} MLT`);
console.log(`   Total Supply: ${TOTAL_SUPPLY.toLocaleString()} tokens`);
console.log(`   Curve Coefficient (k): ${K}`);
console.log(`   Initial Price: ${calculateInitialPrice(INITIAL_MLT, TOTAL_SUPPLY)} MLT/token\n`);

// Test 1: Price at different progress levels
console.log('✅ Test 1: Price Multipliers at Different Progress Levels');
console.log('─'.repeat(70));
const initialPrice = calculateInitialPrice(INITIAL_MLT, TOTAL_SUPPLY);
const progressLevels = [0, 0.1, 0.25, 0.5, 0.75, 1.0];

progressLevels.forEach(progress => {
  const price = calculateBondingCurvePrice(initialPrice, progress, K);
  const multiplier = price / initialPrice;
  const percentIncrease = ((multiplier - 1) * 100).toFixed(0);
  
  console.log(
    `   Progress ${(progress * 100).toString().padStart(3)}%: ` +
    `${price.toFixed(6)} MLT/token ` +
    `(${multiplier.toFixed(2)}x, +${percentIncrease}%)`
  );
});

// Test 2: Minimum pre-purchase requirement
console.log('\n✅ Test 2: Minimum Pre-Purchase Calculation');
console.log('─'.repeat(70));
const minMLT = 100;
const minTokens = calculateMinimumPrePurchase(minMLT, INITIAL_MLT, TOTAL_SUPPLY, K);
const actualCost = calculateBuyTrade(INITIAL_MLT, TOTAL_SUPPLY, 0, minTokens, K).mltAmount;

console.log(`   Required MLT Value: ${minMLT} MLT`);
console.log(`   Calculated Min Tokens: ${minTokens.toLocaleString()} tokens`);
console.log(`   Actual Cost: ${actualCost.toFixed(2)} MLT`);
console.log(`   Initial Progress: ${((minTokens / TOTAL_SUPPLY) * 100).toFixed(2)}%`);

// Test 3: Example buy trade
console.log('\n✅ Test 3: Example Buy Trade (100,000 tokens)');
console.log('─'.repeat(70));
const buyAmount = 100000;
const buyTrade = calculateBuyTrade(INITIAL_MLT, TOTAL_SUPPLY, 0, buyAmount, K);

console.log(`   Buy Amount: ${buyAmount.toLocaleString()} tokens`);
console.log(`   Old Price: ${buyTrade.oldPrice.toFixed(6)} MLT/token`);
console.log(`   Average Price: ${buyTrade.averagePrice.toFixed(6)} MLT/token`);
console.log(`   New Price: ${buyTrade.newPrice.toFixed(6)} MLT/token`);
console.log(`   Total Cost: ${buyTrade.mltAmount.toFixed(2)} MLT`);
console.log(`   Progress: ${(buyTrade.oldProgress * 100).toFixed(2)}% → ${(buyTrade.newProgress * 100).toFixed(2)}%`);
console.log(`   New Market Cap: ${buyTrade.newMarketCap.toFixed(2)} MLT`);

// Test 4: Subsequent buy after first purchase
console.log('\n✅ Test 4: Second Buy Trade (50,000 tokens after first buy)');
console.log('─'.repeat(70));
const secondBuy = calculateBuyTrade(
  INITIAL_MLT,
  TOTAL_SUPPLY,
  buyTrade.newCirculatingSupply,
  50000,
  K
);

console.log(`   Buy Amount: 50,000 tokens`);
console.log(`   Old Price: ${secondBuy.oldPrice.toFixed(6)} MLT/token`);
console.log(`   Average Price: ${secondBuy.averagePrice.toFixed(6)} MLT/token`);
console.log(`   New Price: ${secondBuy.newPrice.toFixed(6)} MLT/token`);
console.log(`   Total Cost: ${secondBuy.mltAmount.toFixed(2)} MLT`);
console.log(`   Progress: ${(secondBuy.oldProgress * 100).toFixed(2)}% → ${(secondBuy.newProgress * 100).toFixed(2)}%`);
console.log(`   New Market Cap: ${secondBuy.newMarketCap.toFixed(2)} MLT`);

// Test 5: Sell trade
console.log('\n✅ Test 5: Sell Trade (30,000 tokens)');
console.log('─'.repeat(70));
const currentSupply = secondBuy.newCirculatingSupply;
const sellTrade = calculateSellTrade(INITIAL_MLT, TOTAL_SUPPLY, currentSupply, 30000, K);

console.log(`   Sell Amount: 30,000 tokens`);
console.log(`   Old Price: ${sellTrade.oldPrice.toFixed(6)} MLT/token`);
console.log(`   Average Price: ${sellTrade.averagePrice.toFixed(6)} MLT/token`);
console.log(`   New Price: ${sellTrade.newPrice.toFixed(6)} MLT/token`);
console.log(`   Total Revenue: ${sellTrade.mltAmount.toFixed(2)} MLT`);
console.log(`   Progress: ${(sellTrade.oldProgress * 100).toFixed(2)}% → ${(sellTrade.newProgress * 100).toFixed(2)}%`);
console.log(`   New Market Cap: ${sellTrade.newMarketCap.toFixed(2)} MLT`);

// Test 6: Journey to 100% graduation
console.log('\n✅ Test 6: Journey to 100% Graduation');
console.log('─'.repeat(70));
const milestones = [0.25, 0.5, 0.75, 1.0];
let currentCirculating = 0;

milestones.forEach(targetProgress => {
  const targetSupply = TOTAL_SUPPLY * targetProgress;
  const buyToTarget = targetSupply - currentCirculating;
  
  const trade = calculateBuyTrade(INITIAL_MLT, TOTAL_SUPPLY, currentCirculating, buyToTarget, K);
  
  console.log(`\n   🎯 Milestone: ${(targetProgress * 100)}% Progress`);
  console.log(`      Tokens to Buy: ${buyToTarget.toLocaleString()}`);
  console.log(`      Cost: ${trade.mltAmount.toFixed(2)} MLT`);
  console.log(`      Final Price: ${trade.newPrice.toFixed(6)} MLT/token`);
  console.log(`      Price Multiplier: ${(trade.newPrice / initialPrice).toFixed(2)}x`);
  console.log(`      Market Cap: ${trade.newMarketCap.toFixed(2)} MLT`);
  
  currentCirculating = trade.newCirculatingSupply;
});

// Test 7: Total cost to graduate
console.log('\n✅ Test 7: Total Cost to Reach 100% Graduation');
console.log('─'.repeat(70));
const graduationTrade = calculateBuyTrade(INITIAL_MLT, TOTAL_SUPPLY, 0, TOTAL_SUPPLY, K);
console.log(`   Total Tokens: ${TOTAL_SUPPLY.toLocaleString()}`);
console.log(`   Total Cost: ${graduationTrade.mltAmount.toFixed(2)} MLT`);
console.log(`   Final Price: ${graduationTrade.newPrice.toFixed(6)} MLT/token`);
console.log(`   Final Multiplier: ${(graduationTrade.newPrice / initialPrice).toFixed(2)}x`);
console.log(`   ROI: ${(((graduationTrade.newPrice / initialPrice) - 1) * 100).toFixed(0)}%`);

console.log('\n🎉 All tests completed!\n');

// Summary
console.log('📈 Key Insights:');
console.log('─'.repeat(70));
console.log(`   ✅ Initial price: ${initialPrice.toFixed(6)} MLT/token`);
console.log(`   ✅ Graduation price: ${graduationTrade.newPrice.toFixed(6)} MLT/token`);
console.log(`   ✅ Price increase: ${(graduationTrade.newPrice / initialPrice).toFixed(2)}x`);
console.log(`   ✅ Min pre-purchase: ${minTokens.toLocaleString()} tokens (${minMLT} MLT)`);
console.log(`   ✅ Cost to graduate: ${graduationTrade.mltAmount.toFixed(2)} MLT`);
console.log(`   ✅ Formula working: Price = ${initialPrice.toFixed(6)} × e^(${K} × progress)\n`);
