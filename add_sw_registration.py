#!/usr/bin/env python3
"""Add Service Worker registration to index.tsx"""

import re

file_path = 'src/index.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Service Worker registration script
sw_registration = '''    <script>
      // Register Service Worker for PWA
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
              console.log('[PWA] Service Worker registered successfully:', registration.scope);
              
              // Check for updates
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('[PWA] New Service Worker installing...');
                
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] New version available! Refresh to update.');
                    // Optionally show update notification to user
                  }
                });
              });
            })
            .catch((error) => {
              console.error('[PWA] Service Worker registration failed:', error);
            });
        });
      } else {
        console.warn('[PWA] Service Workers not supported in this browser');
      }
    </script>'''

# Find the closing </head> tag and insert before it
# Look for the first occurrence after the favicon links
pattern = r'(</head>)'
matches = list(re.finditer(pattern, content))

if matches:
    # Insert before the first </head> tag
    insert_pos = matches[0].start()
    
    # Check if SW registration already exists
    if 'serviceWorker.register' not in content:
        content = content[:insert_pos] + sw_registration + '\n' + content[insert_pos:]
        print("✅ Service Worker registration added")
    else:
        print("ℹ️  Service Worker registration already exists")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Updated {file_path}")
else:
    print("❌ Could not find </head> tag")
