import { Hono } from 'hono'
import type { Env } from '../types'
import { authMiddleware } from '../middleware'

const privacy = new Hono<{ Bindings: Env }>()

// POST /api/privacy-request - Submit GDPR/CCPA data request
privacy.post('/', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const { request_type, description } = body
    
    // Valid request types: 'access', 'delete', 'export', 'opt_out'
    const validTypes = ['access', 'delete', 'export', 'opt_out']
    if (!validTypes.includes(request_type)) {
      return c.json({ 
        success: false, 
        message: 'Invalid request type. Must be: access, delete, export, or opt_out' 
      }, 400)
    }
    
    // Create privacy request record
    const result = await c.env.DB.prepare(`
      INSERT INTO privacy_requests (
        user_id, request_type, description, status, created_at
      ) VALUES (?, ?, ?, 'pending', datetime('now'))
    `).bind(userId, request_type, description || '').run()
    
    // Send confirmation email
    const user = await c.env.DB.prepare(
      'SELECT email, username FROM users WHERE id = ?'
    ).bind(userId).first()
    
    return c.json({ 
      success: true, 
      message: 'Your privacy request has been submitted. We will process it within 30 days as required by law.',
      request_id: result.meta.last_row_id,
      estimated_completion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  } catch (error: any) {
    console.error('Privacy request error:', error)
    return c.json({ 
      success: false, 
      message: 'Failed to submit privacy request' 
    }, 500)
  }
})

// GET /api/privacy-request/status - Check status of privacy requests
privacy.get('/status', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    
    const requests = await c.env.DB.prepare(`
      SELECT id, request_type, status, created_at, processed_at
      FROM privacy_requests
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(userId).all()
    
    return c.json({ success: true, requests: requests.results })
  } catch (error: any) {
    console.error('Privacy status error:', error)
    return c.json({ success: false, message: 'Failed to fetch request status' }, 500)
  }
})

export default privacy
