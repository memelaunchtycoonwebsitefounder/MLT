const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing _routes.json to serve legal.html as static file...');

const routesPath = path.join(__dirname, '..', 'dist', '_routes.json');
const routes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));

// Add legal.html to exclude list if not already there
if (!routes.exclude.includes('/legal.html')) {
  routes.exclude.push('/legal.html');
  console.log('✅ Added /legal.html to exclude list');
}

fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2));
console.log('✅ Updated _routes.json');
console.log('Exclude list:', routes.exclude);

