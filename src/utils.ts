import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWTPayload } from './types';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: JWTPayload, secret: string): string => {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string, secret: string): JWTPayload | null => {
  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Only require at least 8 characters
  return password.length >= 8;
};

export const validateUsername = (username: string): boolean => {
  // 3-20 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const calculateBondingCurvePrice = (
  initialPrice: number,
  totalSupplySold: number,
  totalSupply: number
): number => {
  // Bonding curve formula: Price(t) = Initial_Price × (1 + 0.0001 × Total_Supply_Sold)^1.5
  const soldRatio = totalSupplySold / totalSupply;
  const price = initialPrice * Math.pow(1 + 0.0001 * totalSupplySold, 1.5);
  return Math.max(price, initialPrice);
};

export const calculateHypeMultiplier = (hypeScore: number): number => {
  // Hype_Multiplier = 1 + (Hype_Score / 10000)
  return 1 + hypeScore / 10000;
};

export const calculateFinalPrice = (
  basePrice: number,
  hypeMultiplier: number,
  isBuy: boolean = true
): number => {
  // Buy: price goes up (1% - 3% increase)
  // Sell: price goes down (2% - 5% decrease)
  let priceImpact: number;
  
  if (isBuy) {
    // Buy always increases price slightly (1% - 3%)
    priceImpact = 1.01 + Math.random() * 0.02; // 1.01 to 1.03
  } else {
    // Sell decreases price (2% - 5%)
    priceImpact = 0.95 + Math.random() * 0.03; // 0.95 to 0.98
  }
  
  return basePrice * hypeMultiplier * priceImpact;
};

export const calculateMarketCap = (
  currentPrice: number,
  circulatingSupply: number
): number => {
  return currentPrice * circulatingSupply;
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

export const formatCurrency = (amount: number): string => {
  return `$${formatNumber(amount, 2)}`;
};

export const generateCoinSymbol = (name: string): string => {
  // Generate symbol from coin name (e.g., "Doge Moon" -> "DOGE")
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 4).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
};

export const errorResponse = (message: string, status: number = 400) => {
  return Response.json({ error: message }, { status });
};

export const successResponse = (data: any, status: number = 200) => {
  return Response.json({ success: true, data }, { status });
};
