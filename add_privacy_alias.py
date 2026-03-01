#!/usr/bin/env python3

print("🔧 Adding /privacy alias route...")

with open('src/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the /terms route
terms_route_start = content.find("app.get('/terms', (c) => {")

if terms_route_start == -1:
    print("❌ Could not find /terms route")
    exit(1)

# Read the legal HTML content between privacy-policy and terms routes
# We'll use the same HTML as privacy-policy route
privacy_route_start = content.find("app.get('/privacy-policy', (c) => {")
privacy_route_end = content.find("});\n\napp.get('/terms-of-service',", privacy_route_start)

if privacy_route_start == -1 or privacy_route_end == -1:
    print("❌ Could not find privacy-policy route")
    exit(1)

# Extract the privacy-policy route code
privacy_code = content[privacy_route_start:privacy_route_end + 3]  # Include });\n

# Create /privacy alias
privacy_alias = privacy_code.replace("app.get('/privacy-policy'", "app.get('/privacy'")

# Insert before /terms route
insertion_point = content.find("\napp.get('/terms', (c) => {")
content = content[:insertion_point] + "\n\n" + privacy_alias + content[insertion_point:]

with open('src/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Added /privacy alias route")
print("   /privacy → serves same content as /privacy-policy")

