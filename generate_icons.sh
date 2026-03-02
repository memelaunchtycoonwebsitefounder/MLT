#!/bin/bash

echo "🎨 Converting SVG to PNG icons using ImageMagick..."

# Check if ImageMagick is available
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found, trying rsvg-convert..."
    
    if ! command -v rsvg-convert &> /dev/null; then
        echo "❌ No SVG converter found"
        echo "Favicon.ico already created, but PNG icons need manual creation"
        exit 0
    fi
    
    # Use rsvg-convert
    echo "✅ Using rsvg-convert"
    rsvg-convert -w 192 -h 192 public/favicon.svg > public/static/icon-192.png 2>/dev/null || echo "⚠️  Could not create 192x192 icon"
    rsvg-convert -w 512 -h 512 public/favicon.svg > public/static/icon-512.png 2>/dev/null || echo "⚠️  Could not create 512x512 icon"
    rsvg-convert -w 180 -h 180 public/favicon.svg > public/static/apple-touch-icon.png 2>/dev/null || echo "⚠️  Could not create Apple icon"
else
    # Use ImageMagick
    echo "✅ Using ImageMagick convert"
    convert -background none public/favicon.svg -resize 192x192 public/static/icon-192.png 2>/dev/null || echo "⚠️  Could not create 192x192 icon"
    convert -background none public/favicon.svg -resize 512x512 public/static/icon-512.png 2>/dev/null || echo "⚠️  Could not create 512x512 icon"
    convert -background none public/favicon.svg -resize 180x180 public/static/apple-touch-icon.png 2>/dev/null || echo "⚠️  Could not create Apple icon"
fi

echo ""
echo "✅ Icon generation complete!"
ls -lh public/static/*.png 2>/dev/null || echo "No PNG icons created (tools not available)"
