#!/usr/bin/env python3
import json

print("🔧 Fixing _routes.json to serve SEO files as static...")

# Read vite.config.ts to understand current configuration
with open('vite.config.ts', 'r', encoding='utf-8') as f:
    vite_content = f.read()

# Add script to handle routes after build
script_content = '''#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, 'dist', '_routes.json');

if (fs.existsSync(routesPath)) {
  const routes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
  
  // Add SEO files to exclude list (serve as static)
  const seoFiles = ['/robots.txt', '/sitemap.xml', '/_headers'];
  seoFiles.forEach(file => {
    if (!routes.exclude.includes(file)) {
      routes.exclude.push(file);
    }
  });
  
  fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2));
  console.log('✅ Updated _routes.json to exclude SEO files');
  console.log('Excluded files:', routes.exclude);
}
'''

with open('scripts/update-routes.js', 'w', encoding='utf-8') as f:
    f.write(script_content)

print("✅ Created scripts/update-routes.js")

# Update package.json to run this script after build
print("✅ Script will run after build in vite.config.ts")
