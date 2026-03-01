#!/usr/bin/env python3

print("🔧 Adding compliance API routes to index.tsx...")

# Read index.tsx
with open('src/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports for new routes
import_section = '''// Import routes
import auth from './routes/auth';
import coins from './routes/coins';
import trades from './routes/trades';
import portfolio from './routes/portfolio';
import leaderboard from './routes/leaderboard';
import email from './routes/email';
import upload from './routes/upload';
import orders from './routes/orders';
import cron from './routes/cron';
import realtime from './routes/realtime';
import social from './routes/social';
import gamification from './routes/gamification';
import profile from './routes/profile';
import admin from './routes/admin';
import websocket from './routes/websocket';'''

new_imports = '''// Import routes
import auth from './routes/auth';
import coins from './routes/coins';
import trades from './routes/trades';
import portfolio from './routes/portfolio';
import leaderboard from './routes/leaderboard';
import email from './routes/email';
import upload from './routes/upload';
import orders from './routes/orders';
import cron from './routes/cron';
import realtime from './routes/realtime';
import social from './routes/social';
import gamification from './routes/gamification';
import profile from './routes/profile';
import admin from './routes/admin';
import websocket from './routes/websocket';
import contact from './routes/contact';
import privacy from './routes/privacy';'''

content = content.replace(import_section, new_imports)

# Find where to add the route registrations (after existing routes)
# Look for the line with app.route('/api/admin', admin)
admin_route = "app.route('/api/admin', admin);"

if admin_route in content:
    new_routes = '''app.route('/api/admin', admin);
app.route('/api/contact', contact);
app.route('/api/privacy-request', privacy);'''
    
    content = content.replace(admin_route, new_routes)
    print("✅ Added contact and privacy routes")
else:
    print("⚠️  Could not find admin route, adding routes differently")
    # Alternative: Add before websocket route
    ws_route = "app.route('/api/websocket', websocket);"
    if ws_route in content:
        new_routes = '''app.route('/api/contact', contact);
app.route('/api/privacy-request', privacy);
app.route('/api/websocket', websocket);'''
        content = content.replace(ws_route, new_routes)
        print("✅ Added routes before websocket")

# Write updated content
with open('src/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Updated src/index.tsx with compliance routes")
