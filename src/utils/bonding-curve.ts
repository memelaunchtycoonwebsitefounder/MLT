/**
 * Bonding Curve Pricing System for MLT Meme Coins
 * 
 * Formula: Current Price = Initial Price × e^(k × progress)
 * 
 * Where:
 * - Initial Price: Calculated from initial_mlt_investment / total_supply
 * - k: Curve steepness (default 4.0)
 * - progress: circulating_supply / total_supply (0.0 - 1.0)
 * 
 * Price multipliers at different progress levels (k=4.0):
 * - 0%   → 1.00x (initial)
 * - 10%  → 1.49x (+49%)
 * - 25%  → 2.72x (+172%)
 * - 50%  → 7.39x (+639%)
 * - 75%  → 20.09x (+1909%)
 * - 100% → 54.60x (+5360%)
 */

/**
 * Calculate current price based on bonding curve
 * @param initialPrice - The starting price (initial_mlt_investment / total_supply)
 * @param progress - Current progress (0.0 to 1.0)
 * @param k - Curve steepness coefficient (default 4.0)
 * @returns Current price
 */
export function calculateBondingCurvePrice(
  initialPrice: number,
  progress: number,
  k: number = 4.0
): number {
  // Clamp progress to [0, 1]
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  // Formula: Price = InitialPrice × e^(k × progress)
  const priceMultiplier = Math.exp(k * clampedProgress);
  const currentPrice = initialPrice * priceMultiplier;
  
  return currentPrice;
}

/**
 * Calculate progress after buying tokens
 * @param currentProgress - Current bonding curve progress (0.0 to 1.0)
 * @param totalSupply - Total token supply
 * @param circulatingSupply - Current circulating supply
 * @param buyAmount - Amount of tokens being purchased
 * @returns New progress after purchase
 */
export function calculateProgressAfterBuy(
  currentProgress: number,
  totalSupply: number,
  circulatingSupply: number,
  buyAmount: number
): number {
  const newCirculatingSupply = circulatingSupply + buyAmount;
  const newProgress = newCirculatingSupply / totalSupply;
  
  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, newProgress));
}

/**
 * Calculate progress after selling tokens
 * @param currentProgress - Current bonding curve progress (0.0 to 1.0)
 * @param totalSupply - Total token supply
 * @param circulatingSupply - Current circulating supply
 * @param sellAmount - Amount of tokens being sold
 * @returns New progress after sale
 */
export function calculateProgressAfterSell(
  currentProgress: number,
  totalSupply: number,
  circulatingSupply: number,
  sellAmount: number
): number {
  const newCirculatingSupply = Math.max(0, circulatingSupply - sellAmount);
  const newProgress = newCirculatingSupply / totalSupply;
  
  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, newProgress));
}

/**
 * Calculate average price for a buy transaction
 * Integrates the bonding curve price over the purchase range
 * @param initialPrice - Starting price
 * @param totalSupply - Total token supply
 * @param circulatingSupply - Current circulating supply
 * @param buyAmount - Amount to purchase
 * @param k - Curve coefficient
 * @returns Average price per token for this purchase
 */
export function calculateAverageBuyPrice(
  initialPrice: number,
  totalSupply: number,
  circulatingSupply: number,
  buyAmount: number,
  k: number = 4.0
): number {
  const startProgress = circulatingSupply / totalSupply;
  const endProgress = (circulatingSupply + buyAmount) / totalSupply;
  
  // Sample the curve at multiple points for better accuracy
  const samples = 100;
  let totalPrice = 0;
  
  for (let i = 0; i < samples; i++) {
    const progress = startProgress + (endProgress - startProgress) * (i / samples);
    const price = calculateBondingCurvePrice(initialPrice, progress, k);
    totalPrice += price;
  }
  
  return totalPrice / samples;
}

/**
 * Calculate average price for a sell transaction
 * @param initialPrice - Starting price
 * @param totalSupply - Total token supply
 * @param circulatingSupply - Current circulating supply
 * @param sellAmount - Amount to sell
 * @param k - Curve coefficient
 * @returns Average price per token for this sale
 */
export function calculateAverageSellPrice(
  initialPrice: number,
  totalSupply: number,
  circulatingSupply: number,
  sellAmount: number,
  k: number = 4.0
): number {
  const startProgress = circulatingSupply / totalSupply;
  const endProgress = Math.max(0, (circulatingSupply - sellAmount) / totalSupply);
  
  // Sample the curve at multiple points
  const samples = 100;
  let totalPrice = 0;
  
  for (let i = 0; i < samples; i++) {
    const progress = startProgress - (startProgress - endProgress) * (i / samples);
    const price = calculateBondingCurvePrice(initialPrice, progress, k);
    totalPrice += price;
  }
  
  return totalPrice / samples;
}

/**
 * Calculate total cost for buying tokens (in MLT)
 * @param initialPrice - Starting price
 * @param totalSupply - Total token supply
 * @param circulatingSupply - Current circulating supply
 * @param buyAmount - Amount to purchase
 * @param k - Curve coefficient
 * @returns Total MLT cost
 */
export function calculateBuyCost(
  initialPrice: number,
  totalSupply: number,
  circulatingSupply: number,
  buyAmount: number,
  k: number = 4.0
): number {
  const averagePrice = calculateAverageBuyPrice(
    initialPrice,
    totalSupply,
    circulatingSupply,
    buyAmount,
    k
  );
  
  return averagePrice * buyAmount;
}

/**
 * Calculate total revenue for selling tokens (in MLT)
 * @param initialPrice - Starting price
 * @param totalSupply - Total token supply
 * @param circulatingSupply - Current circulating supply
 * @param sellAmount - Amount to sell
 * @param k - Curve coefficient
 * @returns Total MLT revenue
 */
export function calculateSellRevenue(
  initialPrice: number,
  totalSupply: number,
  circulatingSupply: number,
  sellAmount: number,
  k: number = 4.0
): number {
  const averagePrice = calculateAverageSellPrice(
    initialPrice,
    totalSupply,
    circulatingSupply,
    sellAmount,
    k
  );
  
  return averagePrice * sellAmount;
}

/**
 * Calculate initial price from MLT investment
 * @param initialMLTInvestment - Amount of MLT invested to create coin
 * @param totalSupply - Total token supply
 * @returns Initial price per token
 */
export function calculateInitialPrice(
  initialMLTInvestment: number,
  totalSupply: number
): number {
  return initialMLTInvestment / totalSupply;
}

/**
 * Calculate complete trade result (buy or sell)
 * Returns all relevant information about the trade
 */
export interface TradeResult {
  // Price information
  oldPrice: number;           // Price before trade
  newPrice: number;           // Price after trade
  averagePrice: number;       // Average price for this trade
  
  // Progress information
  oldProgress: number;        // Progress before trade (0-1)
  newProgress: number;        // Progress after trade (0-1)
  progressChange: number;     // Change in progress
  
  // Supply information
  oldCirculatingSupply: number;
  newCirculatingSupply: number;
  
  // Cost/Revenue
  mltAmount: number;          // Total MLT cost (buy) or revenue (sell)
  
  // Market cap
  newMarketCap: number;
}

/**
 * Calculate full buy trade result
 */
export function calculateBuyTrade(
  initialMLTInvestment: number,
  totalSupply: number,
  circulatingSupply: number,
  buyAmount: number,
  k: number = 4.0
): TradeResult {
  const initialPrice = calculateInitialPrice(initialMLTInvestment, totalSupply);
  
  const oldProgress = circulatingSupply / totalSupply;
  const newCirculatingSupply = circulatingSupply + buyAmount;
  const newProgress = newCirculatingSupply / totalSupply;
  
  const oldPrice = calculateBondingCurvePrice(initialPrice, oldProgress, k);
  const newPrice = calculateBondingCurvePrice(initialPrice, newProgress, k);
  const averagePrice = calculateAverageBuyPrice(initialPrice, totalSupply, circulatingSupply, buyAmount, k);
  
  const mltCost = averagePrice * buyAmount;
  const newMarketCap = newPrice * newCirculatingSupply;
  
  return {
    oldPrice,
    newPrice,
    averagePrice,
    oldProgress,
    newProgress,
    progressChange: newProgress - oldProgress,
    oldCirculatingSupply: circulatingSupply,
    newCirculatingSupply,
    mltAmount: mltCost,
    newMarketCap
  };
}

/**
 * Calculate full sell trade result
 */
export function calculateSellTrade(
  initialMLTInvestment: number,
  totalSupply: number,
  circulatingSupply: number,
  sellAmount: number,
  k: number = 4.0
): TradeResult {
  const initialPrice = calculateInitialPrice(initialMLTInvestment, totalSupply);
  
  const oldProgress = circulatingSupply / totalSupply;
  const newCirculatingSupply = Math.max(0, circulatingSupply - sellAmount);
  const newProgress = newCirculatingSupply / totalSupply;
  
  const oldPrice = calculateBondingCurvePrice(initialPrice, oldProgress, k);
  const newPrice = calculateBondingCurvePrice(initialPrice, newProgress, k);
  const averagePrice = calculateAverageSellPrice(initialPrice, totalSupply, circulatingSupply, sellAmount, k);
  
  const mltRevenue = averagePrice * sellAmount;
  const newMarketCap = newPrice * newCirculatingSupply;
  
  return {
    oldPrice,
    newPrice,
    averagePrice,
    oldProgress,
    newProgress,
    progressChange: newProgress - oldProgress,
    oldCirculatingSupply: circulatingSupply,
    newCirculatingSupply,
    mltAmount: mltRevenue,
    newMarketCap
  };
}

/**
 * Calculate minimum pre-purchase amount required
 * @param minimumMLT - Minimum MLT value required (e.g., 100)
 * @param initialMLTInvestment - Amount invested to create coin
 * @param totalSupply - Total token supply
 * @param k - Curve coefficient
 * @returns Minimum number of tokens to purchase
 */
export function calculateMinimumPrePurchase(
  minimumMLT: number,
  initialMLTInvestment: number,
  totalSupply: number,
  k: number = 4.0
): number {
  const initialPrice = calculateInitialPrice(initialMLTInvestment, totalSupply);
  
  // Start with initial price estimate
  let estimatedAmount = minimumMLT / initialPrice;
  
  // Refine with binary search
  let low = estimatedAmount * 0.5;
  let high = estimatedAmount * 2;
  
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    const cost = calculateBuyCost(initialPrice, totalSupply, 0, mid, k);
    
    if (Math.abs(cost - minimumMLT) < 0.01) {
      return Math.ceil(mid);
    }
    
    if (cost < minimumMLT) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return Math.ceil(high);
}
