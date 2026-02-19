#!/bin/bash

# Script to replace Axios with Fetch API in all JavaScript files
# This saves ~13KB in bundle size

echo "🔄 Replacing Axios with Fetch API..."

# Directory containing JavaScript files
JS_DIR="/home/user/webapp/public/static"

# Backup directory
BACKUP_DIR="/home/user/webapp/backup_js_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backups in $BACKUP_DIR"
cp -r "$JS_DIR"/*.js "$BACKUP_DIR/"

# Counter
count=0

# Find all JS files and replace axios calls
for file in "$JS_DIR"/*.js; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    
    # Skip utility files
    if [[ "$filename" == "fetch-utils.js" ]] || \
       [[ "$filename" == "performance-monitor.js" ]] || \
       [[ "$filename" == "pwa-manager.js" ]]; then
      continue
    fi
    
    echo "  Processing: $filename"
    
    # Create temporary file
    temp_file="${file}.tmp"
    
    # Replace axios.get with fetchUtils.get
    sed -E 's/axios\.get\(/fetchUtils.get(/g' "$file" > "$temp_file"
    mv "$temp_file" "$file"
    
    # Replace axios.post with fetchUtils.post
    sed -E 's/axios\.post\(/fetchUtils.post(/g' "$file" > "$temp_file"
    mv "$temp_file" "$file"
    
    # Replace axios.put with fetchUtils.put
    sed -E 's/axios\.put\(/fetchUtils.put(/g' "$file" > "$temp_file"
    mv "$temp_file" "$file"
    
    # Replace axios.delete with fetchUtils.delete
    sed -E 's/axios\.delete\(/fetchUtils.delete(/g' "$file" > "$temp_file"
    mv "$temp_file" "$file"
    
    ((count++))
  fi
done

echo "✅ Replaced Axios in $count files"
echo "📝 Backups saved in: $BACKUP_DIR"
echo ""
echo "⚠️  Important: Remember to:"
echo "   1. Include fetch-utils.js before other scripts"
echo "   2. Remove Axios CDN from HTML templates"
echo "   3. Test all API calls"
echo ""
echo "💾 Backup location: $BACKUP_DIR"
