#!/usr/bin/env python3
from bs4 import BeautifulSoup

print("🔧 Creating legal pages from template...")

# Read the legal pages HTML file
with open('legal-pages.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, 'html.parser')

# Extract the main sections
sections = {
    'about': None,
    'contact': None,
    'privacy': None,
    'terms': None
}

# Find all sections with IDs
main_sections = soup.find_all('section', id=True)
print(f"Found {len(main_sections)} sections")

for section in main_sections:
    section_id = section.get('id', '')
    if 'about' in section_id.lower():
        sections['about'] = section
        print(f"✅ Found About section: {section_id}")
    elif 'contact' in section_id.lower():
        sections['contact'] = section
        print(f"✅ Found Contact section: {section_id}")
    elif 'privacy' in section_id.lower():
        sections['privacy'] = section
        print(f"✅ Found Privacy section: {section_id}")
    elif 'terms' in section_id.lower() or 'tos' in section_id.lower():
        sections['terms'] = section
        print(f"✅ Found Terms section: {section_id}")

# Extract common styles
style_tag = soup.find('style')
style_content = style_tag.string if style_tag else ''

print(f"\n📊 Sections found: {sum(1 for v in sections.values() if v is not None)}/4")

# Save extracted info for later use
result = {
    'sections': {k: (str(v) if v else None) for k, v in sections.items()},
    'styles': style_content
}

import json
with open('legal_pages_extracted.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print("✅ Extracted legal pages content to legal_pages_extracted.json")
