/**
 * MLT Investment Calculator
 * Bonding Curve calculations for coin creation and trading
 */

class MLTCalculator {
  constructor() {
    // Default bonding curve parameters
    this.k = 4.0; // Exponential growth coefficient
  }

  /**
   * Calculate initial price from MLT investment
   * @param {number} initialMLT - Initial MLT investment (1800-10000)
   * @param {number} totalSupply - Total token supply
   * @returns {number} - Initial price per token in MLT
   */
  calculateInitialPrice(initialMLT, totalSupply) {
    return initialMLT / totalSupply;
  }

  /**
   * Calculate price at a specific progress point
   * Price = InitialPrice × e^(k × progress)
   * @param {number} initialPrice - Initial price per token
   * @param {number} progress - Progress (0-1 range)
   * @returns {number} - Current price per token
   */
  calculatePriceAtProgress(initialPrice, progress) {
    return initialPrice * Math.exp(this.k * progress);
  }

  /**
   * Calculate minimum pre-purchase tokens to reach 100 MLT cost
   * Uses binary search to find the token amount
   * @param {number} initialPrice - Initial price per token
   * @param {number} totalSupply - Total token supply
   * @param {number} targetCost - Target cost in MLT (default 100)
   * @returns {object} - {tokens, cost, progress}
   */
  calculateMinimumPrePurchase(initialPrice, totalSupply, targetCost = 100) {
    let low = 1;
    let high = totalSupply;
    let bestTokens = 0;
    let bestCost = 0;
    let bestProgress = 0;

    // Binary search for minimum tokens
    while (high - low > 1) {
      const mid = Math.floor((low + high) / 2);
      const result = this.calculateBuyCost(initialPrice, totalSupply, 0, mid);
      
      if (result.totalCost >= targetCost) {
        high = mid;
        bestTokens = mid;
        bestCost = result.totalCost;
        bestProgress = result.newProgress;
      } else {
        low = mid;
      }
    }

    // Fine-tune to get as close to targetCost as possible
    const resultHigh = this.calculateBuyCost(initialPrice, totalSupply, 0, high);
    if (Math.abs(resultHigh.totalCost - targetCost) < Math.abs(bestCost - targetCost)) {
      bestTokens = high;
      bestCost = resultHigh.totalCost;
      bestProgress = resultHigh.newProgress;
    }

    return {
      tokens: bestTokens,
      cost: bestCost,
      progress: bestProgress
    };
  }

  /**
   * Calculate cost to buy tokens using bonding curve pricing
   * Samples 100 points along the curve for accurate integration
   * @param {number} initialPrice - Initial price per token
   * @param {number} totalSupply - Total token supply
   * @param {number} currentSupply - Current circulating supply
   * @param {number} tokensToBuy - Number of tokens to buy
   * @returns {object} - {totalCost, averagePrice, newProgress, priceChange}
   */
  calculateBuyCost(initialPrice, totalSupply, currentSupply, tokensToBuy) {
    const samples = 100; // More samples = more accuracy
    const tokenPerSample = tokensToBuy / samples;
    
    let totalCost = 0;
    let newSupply = currentSupply;

    for (let i = 0; i < samples; i++) {
      const progress = newSupply / totalSupply;
      const price = this.calculatePriceAtProgress(initialPrice, progress);
      totalCost += price * tokenPerSample;
      newSupply += tokenPerSample;
    }

    const oldProgress = currentSupply / totalSupply;
    const newProgress = newSupply / totalSupply;
    const averagePrice = totalCost / tokensToBuy;

    const oldPrice = this.calculatePriceAtProgress(initialPrice, oldProgress);
    const currentPrice = this.calculatePriceAtProgress(initialPrice, newProgress);
    const priceChange = ((currentPrice - oldPrice) / oldPrice) * 100;

    return {
      totalCost,
      averagePrice,
      newProgress,
      newSupply,
      currentPrice,
      priceChange
    };
  }

  /**
   * Calculate revenue from selling tokens
   * @param {number} initialPrice - Initial price per token
   * @param {number} totalSupply - Total token supply
   * @param {number} currentSupply - Current circulating supply
   * @param {number} tokensToSell - Number of tokens to sell
   * @returns {object} - {totalRevenue, averagePrice, newProgress, priceChange}
   */
  calculateSellRevenue(initialPrice, totalSupply, currentSupply, tokensToSell) {
    const samples = 100;
    const tokenPerSample = tokensToSell / samples;
    
    let totalRevenue = 0;
    let newSupply = currentSupply;

    for (let i = 0; i < samples; i++) {
      const progress = newSupply / totalSupply;
      const price = this.calculatePriceAtProgress(initialPrice, progress);
      totalRevenue += price * tokenPerSample;
      newSupply -= tokenPerSample;
    }

    const oldProgress = currentSupply / totalSupply;
    const newProgress = Math.max(0, newSupply / totalSupply);
    const averagePrice = totalRevenue / tokensToSell;

    const oldPrice = this.calculatePriceAtProgress(initialPrice, oldProgress);
    const currentPrice = this.calculatePriceAtProgress(initialPrice, newProgress);
    const priceChange = ((currentPrice - oldPrice) / oldPrice) * 100;

    return {
      totalRevenue,
      averagePrice,
      newProgress,
      newSupply: Math.max(0, newSupply),
      currentPrice,
      priceChange
    };
  }

  /**
   * Calculate total creation cost
   * @param {number} initialMLT - Initial MLT investment
   * @param {number} totalSupply - Total token supply
   * @param {number} prePurchaseTokens - Number of tokens to pre-purchase
   * @returns {object} - {initialPrice, prePurchaseCost, totalCost, progress}
   */
  calculateCreationCost(initialMLT, totalSupply, prePurchaseTokens) {
    const initialPrice = this.calculateInitialPrice(initialMLT, totalSupply);
    const minPrePurchase = this.calculateMinimumPrePurchase(initialPrice, totalSupply, 100);

    // Ensure pre-purchase meets minimum requirement
    const actualPrePurchase = Math.max(prePurchaseTokens, minPrePurchase.tokens);
    
    const buyCost = this.calculateBuyCost(initialPrice, totalSupply, 0, actualPrePurchase);

    return {
      initialPrice,
      minimumPrePurchase: minPrePurchase,
      prePurchaseTokens: actualPrePurchase,
      prePurchaseCost: buyCost.totalCost,
      totalCost: initialMLT + buyCost.totalCost,
      progress: buyCost.newProgress,
      currentPrice: buyCost.currentPrice
    };
  }

  /**
   * Calculate price multiplier at different progress points
   * @param {number} progress - Progress (0-1 range)
   * @returns {number} - Price multiplier (e.g., 1.5x, 7.39x)
   */
  calculatePriceMultiplier(progress) {
    return Math.exp(this.k * progress);
  }

  /**
   * Get price milestones for display
   * @param {number} initialPrice - Initial price per token
   * @returns {array} - Array of {progress, multiplier, price}
   */
  getPriceMilestones(initialPrice) {
    const milestones = [0, 0.1, 0.25, 0.5, 0.75, 1.0];
    return milestones.map(progress => ({
      progress: progress * 100,
      multiplier: this.calculatePriceMultiplier(progress),
      price: this.calculatePriceAtProgress(initialPrice, progress)
    }));
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MLTCalculator;
}
