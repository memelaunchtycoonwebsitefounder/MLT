import { Hono } from 'hono'
import type { Env } from '../types'

const contact = new Hono<{ Bindings: Env }>()

// Rate limiting map (in-memory, will reset on worker restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

// Rate limit: 5 requests per 15 minutes per IP
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetAt) {
    // Reset or create new record
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false
  }
  
  record.count++
  return true
}

// POST /api/contact - Submit contact form
contact.post('/', async (c) => {
  try {
    const clientIP = c.req.header('CF-Connecting-IP') || 'unknown'
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return c.json({ 
        success: false, 
        message: 'Rate limit exceeded. Please try again later.' 
      }, 429)
    }
    
    const body = await c.req.json()
    const { name, email, subject, message, turnstile_token } = body
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return c.json({ 
        success: false, 
        message: 'All fields are required' 
      }, 400)
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return c.json({ 
        success: false, 
        message: 'Invalid email format' 
      }, 400)
    }
    
    // TODO: Verify Cloudflare Turnstile token
    // if (turnstile_token && c.env.TURNSTILE_SECRET_KEY) {
    //   const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       secret: c.env.TURNSTILE_SECRET_KEY,
    //       response: turnstile_token
    //     })
    //   })
    //   const verifyData = await verifyResponse.json()
    //   if (!verifyData.success) {
    //     return c.json({ success: false, message: 'Turnstile verification failed' }, 400)
    //   }
    // }
    
    // Store in database
    const result = await c.env.DB.prepare(`
      INSERT INTO contact_submissions (name, email, subject, message, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(name, email, subject, message, clientIP).run()
    
    // TODO: Send email notification (SendGrid/Resend integration)
    // await sendEmailNotification({
    //   to: 'support@memelaunchtycoon.com',
    //   from: email,
    //   subject: `Contact Form: ${subject}`,
    //   text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    // })
    
    return c.json({ 
      success: true, 
      message: 'Thank you! Your message has been sent. We will respond within 24-48 hours.',
      id: result.meta.last_row_id
    })
  } catch (error: any) {
    console.error('Contact form error:', error)
    return c.json({ 
      success: false, 
      message: 'Failed to submit contact form. Please try again later.' 
    }, 500)
  }
})

export default contact
