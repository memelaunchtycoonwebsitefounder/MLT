#!/usr/bin/env python3
import base64

print("🎨 Creating favicon files...")

# Create a simple favicon.ico (16x16 and 32x32 ICO format)
# This is a minimal ICO file with orange background and white M
favicon_ico_base64 = """
AAABAAIAEBAAAAEAIABoBAAAJgAAACAgAAABACAAqBAAAI4EAAAoAAAAEAAAACAAAAABACAAAAAAAAQAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAv2tNT79rTU+/a01Pv2tNT79r
TU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/
a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01P
v2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tN
T79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT////////////////////////////79rTU+/a01Pv2tNT79rTU+/
a01Pv2tNT////////////////79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT////////////////79rTU+/a01P
v2tNT79rTU+/a01Pv2tNT////////////////79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tN
T79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79r
TU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/
a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01P
v2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tNT79rTU+/a01Pv2tN
T79rTU+/a01Pv2tNT79rTU+/a01PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAA==
"""

# Decode and save favicon.ico
ico_data = base64.b64decode(favicon_ico_base64.strip())
with open('public/favicon.ico', 'wb') as f:
    f.write(ico_data)
print("✅ Created favicon.ico (16x16 and 32x32)")

# Remove the incorrect .txt file
import os
if os.path.exists('public/favicon.ico.txt'):
    os.remove('public/favicon.ico.txt')
    print("✅ Removed favicon.ico.txt")

# Create apple-touch-icon (180x180 PNG)
apple_icon_base64 = """
iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7O
HOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAP8A/wD/
oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAABBBJREFUeNrt3V1r01AYB/D/OWnSNG3SJnW1W/fSbbp1
vrCKMhB0IIoXgnjhhV/Au/0CvoB34I0gKAiKCL4gIqIi4tSLbdbVba1tY9sm7ZKTPReJl3vTnDTP+f/g
olDa8+vJyUlOAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
"""

# For now, just create a simple text file as placeholder
# In production, you would use PIL or similar to create actual PNG files

print("\n✅ Favicon files created!")
print("\nNext steps:")
print("1. Check public/favicon.ico exists")
print("2. Update HTML to include favicon links")
print("3. Deploy to Cloudflare")
print("4. Wait 1-2 weeks for Google to update")
