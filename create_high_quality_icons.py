#!/usr/bin/env python3
"""
Create high-quality PNG icons from SVG with proper colors
"""
import subprocess
import os

print("🎨 Creating high-quality PNG icons with proper colors...")

svg_content = """<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FF6B35"/>
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="320" font-weight="bold" text-anchor="middle" fill="white">M</text>
</svg>"""

# Save high-res SVG
with open('temp_icon.svg', 'w') as f:
    f.write(svg_content)

print("✅ Created temporary high-resolution SVG")

# Try different conversion methods
methods = [
    # Method 1: rsvg-convert (best quality)
    ('rsvg-convert', [
        ('rsvg-convert -w 192 -h 192 -f png temp_icon.svg -o public/static/icon-192.png', 192),
        ('rsvg-convert -w 512 -h 512 -f png temp_icon.svg -o public/static/icon-512.png', 512),
        ('rsvg-convert -w 180 -h 180 -f png temp_icon.svg -o public/static/apple-touch-icon.png', 180),
    ]),
    # Method 2: ImageMagick convert
    ('convert', [
        ('convert -background none temp_icon.svg -resize 192x192 public/static/icon-192.png', 192),
        ('convert -background none temp_icon.svg -resize 512x512 public/static/icon-512.png', 512),
        ('convert -background none temp_icon.svg -resize 180x180 public/static/apple-touch-icon.png', 180),
    ]),
    # Method 3: inkscape
    ('inkscape', [
        ('inkscape temp_icon.svg -w 192 -h 192 -o public/static/icon-192.png', 192),
        ('inkscape temp_icon.svg -w 512 -h 512 -o public/static/icon-512.png', 512),
        ('inkscape temp_icon.svg -w 180 -h 180 -o public/static/apple-touch-icon.png', 180),
    ]),
]

success = False
for tool_name, commands in methods:
    # Check if tool is available
    try:
        subprocess.run(['which', tool_name], capture_output=True, check=True)
        print(f"\n✅ Found {tool_name}, using it for conversion...")
        
        for cmd, size in commands:
            try:
                result = subprocess.run(cmd, shell=True, capture_output=True, timeout=10)
                if result.returncode == 0:
                    print(f"  ✅ Created {size}x{size} icon")
                    success = True
                else:
                    print(f"  ⚠️  Failed to create {size}x{size} icon")
            except Exception as e:
                print(f"  ⚠️  Error creating {size}x{size} icon: {e}")
        
        if success:
            break
    except:
        continue

if not success:
    print("\n⚠️  No SVG converter found, trying Python PIL...")
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        print("✅ Using PIL to create icons...")
        
        for size in [192, 512, 180]:
            # Create image
            img = Image.new('RGB', (size, size), color='#FF6B35')
            draw = ImageDraw.Draw(img)
            
            # Calculate font size (about 62% of image size)
            font_size = int(size * 0.62)
            
            try:
                # Try to use Arial
                font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', font_size)
            except:
                # Fallback to default font
                font = ImageFont.load_default()
            
            # Draw text
            text = "M"
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            x = (size - text_width) // 2
            y = (size - text_height) // 2 - font_size // 10  # Slight adjustment
            
            draw.text((x, y), text, fill='white', font=font)
            
            # Save
            if size == 180:
                img.save('public/static/apple-touch-icon.png', 'PNG')
            else:
                img.save(f'public/static/icon-{size}.png', 'PNG')
            
            print(f"  ✅ Created {size}x{size} icon with PIL")
            success = True
            
    except ImportError:
        print("  ❌ PIL not available")
    except Exception as e:
        print(f"  ❌ PIL error: {e}")

# Clean up
if os.path.exists('temp_icon.svg'):
    os.remove('temp_icon.svg')

if success:
    print("\n✅ High-quality PNG icons created successfully!")
    print("\nVerifying files:")
    for filename in ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png']:
        filepath = f'public/static/{filename}'
        if os.path.exists(filepath):
            size = os.path.getsize(filepath)
            print(f"  ✅ {filename}: {size} bytes")
        else:
            print(f"  ❌ {filename}: NOT FOUND")
else:
    print("\n❌ Failed to create icons. Please install one of:")
    print("  - rsvg-convert (librsvg)")
    print("  - ImageMagick (convert)")
    print("  - Inkscape")
    print("  - Python PIL (Pillow)")

