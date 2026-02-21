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
        // Fix _routes.json to exclude Service Worker, PWA files, and static HTML
        const routesPath = path.resolve(__dirname, 'dist/_routes.json')
        if (fs.existsSync(routesPath)) {
          const routes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'))
          routes.exclude = routes.exclude || []
          
          // Add static files to exclusions
          const staticFiles = ['/index.html', '/sw.js', '/manifest.json', '/locales/*', '/favicon.ico', '/favicon.svg']
          staticFiles.forEach(file => {
            if (!routes.exclude.includes(file)) {
              routes.exclude.push(file)
            }
          })
          
          fs.writeFileSync(routesPath, JSON.stringify(routes))
          console.log('✅ Updated _routes.json to exclude static files')
        }
        
        // Copy index.html from public to dist
        const publicIndexPath = path.resolve(__dirname, 'public/index.html')
        const distIndexPath = path.resolve(__dirname, 'dist/index.html')
        if (fs.existsSync(publicIndexPath)) {
          fs.copyFileSync(publicIndexPath, distIndexPath)
          console.log('✅ Copied index.html to dist/')
        }
        
        // Copy favicon files from public/static to dist root
        const faviconSvgPath = path.resolve(__dirname, 'public/static/favicon.svg')
        const distFaviconSvgPath = path.resolve(__dirname, 'dist/favicon.svg')
        const distFaviconIcoPath = path.resolve(__dirname, 'dist/favicon.ico')
        if (fs.existsSync(faviconSvgPath)) {
          fs.copyFileSync(faviconSvgPath, distFaviconSvgPath)
          fs.copyFileSync(faviconSvgPath, distFaviconIcoPath)
          console.log('✅ Copied favicon files to dist/')
        }
      }
    }
  ],
  build: {
    outDir: 'dist'
  }
})
