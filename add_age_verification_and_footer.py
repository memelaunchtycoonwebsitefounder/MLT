#!/usr/bin/env python3
import re

print("👶 Adding age verification to registration page...")
print("🦶 Adding Cookie Settings to footer...")

# Read index.tsx
with open('src/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the registration page form
# Look for the password confirmation field and add age checkbox after it
password_confirm_pattern = r'(<input[^>]*id="signup-password-confirm"[^>]*>.*?</div>)'

age_checkbox_html = r'''\1
            
            <!-- Age Verification (18+) -->
            <div class="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <label class="flex items-start cursor-pointer">
                <input type="checkbox" id="age-verification" required 
                       class="mt-1 mr-3 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500">
                <span class="text-sm text-gray-800">
                  <strong class="text-red-600">Age Requirement:</strong> 
                  I confirm that I am at least <strong>18 years old</strong> or the age of majority 
                  in my jurisdiction. Users under 18 are prohibited from using this service.
                  <a href="/terms-of-service" class="text-blue-600 hover:underline ml-1">Read Terms</a>
                </span>
              </label>
            </div>'''

content = re.sub(password_confirm_pattern, age_checkbox_html, content, flags=re.DOTALL)
print("✅ Added age verification checkbox to signup form")

# Update the signup form validation to check age checkbox
signup_form_handler = '''document.getElementById('signup-form').addEventListener('submit', async (e) => {
      e.preventDefault();'''

new_signup_handler = '''document.getElementById('signup-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Check age verification
      const ageCheckbox = document.getElementById('age-verification');
      if (!ageCheckbox.checked) {
        alert('You must confirm that you are 18 years or older to register.');
        return;
      }'''

content = content.replace(signup_form_handler, new_signup_handler)
print("✅ Added age verification to signup form handler")

# Now update the footer to add Cookie Settings and Do Not Sell links
# Find the footer section
footer_pattern = r'(<footer[^>]*>.*?<div class="grid[^"]*grid-cols-4[^"]*">)'

# Check if footer exists
if '<footer' in content:
    # Find Privacy Policy link and add cookie links near it
    privacy_link = r'(<a href="/privacy-policy"[^>]*>.*?</a>)'
    
    cookie_links = r'''\1
              <a href="#" onclick="cookieConsent.openSettings(); return false;" 
                 class="text-gray-400 hover:text-orange-400 transition">
                Cookie Settings
              </a>
              <a href="#" onclick="cookieConsent.showSettings(); return false;" 
                 class="text-gray-400 hover:text-orange-400 transition">
                Do Not Sell My Info
              </a>'''
    
    content = re.sub(privacy_link, cookie_links, content, count=1)
    print("✅ Added Cookie Settings and CCPA opt-out links to footer")

# Add cookie-consent.js script to all pages
# Find where scripts are loaded (before </body>)
body_close = '</body>'
cookie_script = '''    <!-- Cookie Consent & Compliance -->
    <link rel="stylesheet" href="/static/cookie-styles.css">
    <script src="/static/cookie-consent.js"></script>
  </body>'''

content = content.replace(body_close, cookie_script)
print("✅ Added cookie consent scripts to pages")

# Write updated content
with open('src/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ All compliance UI updates completed!")
print("\n📋 Summary:")
print("  • Age verification checkbox added to signup")
print("  • Cookie Settings link in footer")
print("  • Do Not Sell My Info (CCPA) link in footer")
print("  • Cookie consent modal will appear on first visit")
