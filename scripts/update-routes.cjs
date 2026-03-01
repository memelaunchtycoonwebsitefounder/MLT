#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const routesPath = path.join(process.cwd(), 'dist', '_routes.json');

console.log('📝 Updating _routes.json for SEO files...');
console.log('Routes file:', routesPath);

if (fs.existsSync(routesPath)) {
  const routes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
  
  console.log('Current exclude list:', routes.exclude);
  
  // Add SEO files to exclude list (serve as static)
  const seoFiles = ['/robots.txt', '/sitemap.xml'];
  
  seoFiles.forEach(file => {
    if (!routes.exclude.includes(file)) {
      routes.exclude.push(file);
      console.log('✅ Added to exclude:', file);
    } else {
      console.log('Already excluded:', file);
    }
  });
  
  // Write back with pretty formatting
  fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2));
  console.log('\n✅ Updated _routes.json');
  console.log('New exclude list:', routes.exclude);
} else {
  console.error('❌ _routes.json not found at:', routesPath);
}
