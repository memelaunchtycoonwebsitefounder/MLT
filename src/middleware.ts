import { Context, Next } from 'hono'
import { Env, JWTPayload } from './types'
import { verifyToken, errorResponse } from './utils'

export const authMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('未提供認證令牌', 401)
  }

  const token = authHeader.substring(7)
  const jwtSecret = c.env.JWT_SECRET
  
  const payload = await verifyToken(token, jwtSecret)
  
  if (!payload) {
    return errorResponse('無效或已過期的令牌', 401)
  }

  // Add user info to context
  c.set('user', payload)
  
  await next()
}

export const optionalAuthMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const authHeader = c.req.header('Authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const jwtSecret = c.env.JWT_SECRET
    const payload = await verifyToken(token, jwtSecret)
    
    if (payload) {
      c.set('user', payload)
    }
  }
  
  await next()
}
