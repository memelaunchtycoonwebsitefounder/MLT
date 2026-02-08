import { Hono } from 'hono'
import type { Env } from '../types'

const upload = new Hono<{ Bindings: Env }>()

// Upload image endpoint
// Accepts base64 encoded image data
upload.post('/image', async (c) => {
  try {
    const { image, filename } = await c.req.json()
    
    if (!image) {
      return c.json({ 
        success: false, 
        message: '請提供圖片數據' 
      }, 400)
    }

    // Check if R2 is available
    if (!c.env.IMAGES) {
      // Fallback: return a default image URL if R2 is not configured
      return c.json({
        success: true,
        url: '/static/default-coin.svg',
        message: 'R2 未配置，使用默認圖片'
      })
    }

    // Remove data URL prefix if present (data:image/png;base64,...)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    
    // Convert base64 to buffer
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const ext = filename ? filename.split('.').pop() : 'png'
    const key = `coins/${timestamp}-${randomStr}.${ext}`
    
    // Upload to R2
    await c.env.IMAGES.put(key, buffer, {
      httpMetadata: {
        contentType: `image/${ext}`
      }
    })
    
    // Return public URL
    // Note: In production, you would use your custom domain or R2 public URL
    const url = `/images/${key}`
    
    return c.json({
      success: true,
      url,
      key,
      size: buffer.length
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return c.json({ 
      success: false, 
      message: '圖片上傳失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, 500)
  }
})

// Get image from R2
upload.get('/image/:key', async (c) => {
  try {
    const key = c.req.param('key')
    
    if (!c.env.IMAGES) {
      return c.notFound()
    }
    
    const object = await c.env.IMAGES.get(key)
    
    if (!object) {
      return c.notFound()
    }
    
    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('cache-control', 'public, max-age=31536000')
    
    return new Response(object.body, {
      headers
    })
  } catch (error) {
    console.error('Image get error:', error)
    return c.notFound()
  }
})

// Delete image from R2 (admin only)
upload.delete('/image/:key', async (c) => {
  try {
    // TODO: Add authentication check here
    // const user = c.get('user')
    // if (!user || user.role !== 'admin') {
    //   return c.json({ success: false, message: '未授權' }, 401)
    // }
    
    const key = c.req.param('key')
    
    if (!c.env.IMAGES) {
      return c.json({ 
        success: false, 
        message: 'R2 未配置' 
      }, 500)
    }
    
    await c.env.IMAGES.delete(key)
    
    return c.json({
      success: true,
      message: '圖片已刪除'
    })
  } catch (error) {
    console.error('Image delete error:', error)
    return c.json({ 
      success: false, 
      message: '刪除圖片失敗' 
    }, 500)
  }
})

export default upload
