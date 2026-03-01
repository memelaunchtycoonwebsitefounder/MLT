#!/usr/bin/env python3

# Check profile-page.js for potential issues
print("🔍 Debugging Profile Page Issue...")

with open('public/static/profile-page.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Check if render is called
if 'this.render();' in content:
    print("✅ render() is called in loadProfile()")
else:
    print("❌ render() is NOT called!")

# Check if innerHTML replacement happens
if "document.getElementById('profile-content').innerHTML = `" in content:
    print("✅ profile-content innerHTML replacement exists")
else:
    print("❌ innerHTML replacement missing!")

# Find the render method
import re
render_match = re.search(r'render\(\) \{(.*?)(?=\n  \w+\(|$)', content, re.DOTALL)
if render_match:
    render_body = render_match.group(1)
    # Check first few lines
    lines = render_body.strip().split('\n')[:10]
    print(f"\n📝 First 10 lines of render() method:")
    for i, line in enumerate(lines, 1):
        print(f"  {i}: {line[:80]}")

# Check if the loading element is being cleared
if "profile-content" in content and "innerHTML" in content:
    matches = re.findall(r"document\.getElementById\('profile-content'\)\.innerHTML\s*=", content)
    print(f"\n✅ Found {len(matches)} innerHTML assignments to profile-content")

print("\n🔧 Issue Analysis:")
print("The loading spinner is INSIDE #profile-content")
print("When render() runs, it should replace the entire innerHTML")
print("This means the loading spinner will be replaced by profile data")
print("\nIf the page is still loading, it means:")
print("1. render() is not being called")
print("2. loadProfile() is failing")
print("3. API is not responding")
