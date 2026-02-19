import { defineConfig } from 'vite'
import pages from '@hono/vite-cloudflare-pages'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    pages(),
    {
      name: 'fix-routes-json',
      closeBundle() {
        // Fix _routes.json to exclude Service Worker and PWA files
        const routesPath = path.resolve(__dirname, 'dist/_routes.json')
        if (fs.existsSync(routesPath)) {
          const routes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'))
          routes.exclude = routes.exclude || []
          
          // Add PWA files to exclusions
          const pwaFiles = ['/sw.js', '/manifest.json']
          pwaFiles.forEach(file => {
            if (!routes.exclude.includes(file)) {
              routes.exclude.push(file)
            }
          })
          
          fs.writeFileSync(routesPath, JSON.stringify(routes))
          console.log('✅ Updated _routes.json to exclude PWA files')
        }
      }
    }
  ],
  build: {
    outDir: 'dist'
  }
})
