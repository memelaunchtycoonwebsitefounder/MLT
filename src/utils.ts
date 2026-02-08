// Utility functions compatible with Cloudflare Workers
import { JWTPayload } from './types'

// Password hashing using Web Crypto API (SHA-256)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// JWT functions using Web Crypto API
export const generateToken = async (payload: JWTPayload, secret: string): Promise<string> => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }
  
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 7 * 24 * 60 * 60 // 7 days
  
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: exp
  }
  
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(jwtPayload))
  const message = `${encodedHeader}.${encodedPayload}`
  
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  )
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
  return `${message}.${encodedSignature}`
}

export const verifyToken = async (token: string, secret: string): Promise<JWTPayload | null> => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const message = `${encodedHeader}.${encodedPayload}`
    
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    
    const signature = Uint8Array.from(atob(encodedSignature), c => c.charCodeAt(0))
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      encoder.encode(message)
    )
    
    if (!isValid) return null
    
    const payload = JSON.parse(atob(encodedPayload))
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) return null
    
    return payload as JWTPayload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  // At least 6 characters
  return password.length >= 6
}

export const validateUsername = (username: string): boolean => {
  // 3-20 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

export const calculateBondingCurvePrice = (
  initialPrice: number,
  totalSupplySold: number,
  totalSupply: number
): number => {
  // Bonding curve formula: Price(t) = Initial_Price × (1 + 0.0001 × Total_Supply_Sold)^1.5
  const soldRatio = totalSupplySold / totalSupply
  const price = initialPrice * Math.pow(1 + 0.0001 * totalSupplySold, 1.5)
  return Math.max(price, initialPrice)
}

export const calculateHypeMultiplier = (hypeScore: number): number => {
  // Hype_Multiplier = 1 + (Hype_Score / 10000)
  return 1 + hypeScore / 10000
}

export const calculateFinalPrice = (
  basePrice: number,
  hypeMultiplier: number
): number => {
  // Add some randomness for price fluctuation (95% - 105%)
  const randomFactor = 0.95 + Math.random() * 0.1
  return basePrice * hypeMultiplier * randomFactor
}

export const calculateMarketCap = (
  currentPrice: number,
  circulatingSupply: number
): number => {
  return currentPrice * circulatingSupply
}

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals)
}

export const formatCurrency = (amount: number): string => {
  return `$${formatNumber(amount, 2)}`
}

export const generateCoinSymbol = (name: string): string => {
  // Generate symbol from coin name (e.g., "Doge Moon" -> "DOGE")
  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0].substring(0, 4).toUpperCase()
  }
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export const errorResponse = (message: string, status: number = 400) => {
  return Response.json({ error: message }, { status })
}

export const successResponse = (data: any, status: number = 200) => {
  return Response.json({ success: true, data }, { status })
}

// Generate random verification token
export const generateVerificationToken = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}
