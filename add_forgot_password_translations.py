#!/usr/bin/env python3
import json

# Add forgot password translations
en_file = 'public/locales/en.json'
zh_file = 'public/locales/zh.json'

# Load EN
with open(en_file, 'r', encoding='utf-8') as f:
    en = json.load(f)

# Load ZH
with open(zh_file, 'r', encoding='utf-8') as f:
    zh = json.load(f)

# Add forgot password section to EN
if 'forgotPassword' not in en['auth']:
    en['auth']['forgotPassword'] = {
        "pageTitle": "Forgot Password - MemeLaunch Tycoon",
        "title": "Forgot Password?",
        "subtitle": "Reset Your Password",
        "description": "Don't worry! Enter your email and we'll send you a reset link.",
        "submitButton": "Send Reset Link",
        "backToLogin": "Back to Sign In",
        "emailSent": "Reset link sent! Check your email.",
        "emailNotFound": "Email not found",
        "networkError": "Network error. Please try again."
    }

# Add forgot password section to ZH
if 'forgotPassword' not in zh['auth']:
    zh['auth']['forgotPassword'] = {
        "pageTitle": "忘記密碼 - MemeLaunch Tycoon",
        "title": "忘記密碼？",
        "subtitle": "重置您的密碼",
        "description": "別擔心！輸入您的郵箱，我們會發送重置連結給您",
        "submitButton": "發送重置連結",
        "backToLogin": "返回登入",
        "emailSent": "重置連結已發送！請檢查您的郵箱",
        "emailNotFound": "找不到此郵箱",
        "networkError": "網路錯誤，請稍後再試"
    }

# Save EN
with open(en_file, 'w', encoding='utf-8') as f:
    json.dump(en, f, indent=2, ensure_ascii=False)

# Save ZH
with open(zh_file, 'w', encoding='utf-8') as f:
    json.dump(zh, f, indent=2, ensure_ascii=False)

print("✅ Forgot password translations added!")
print(f"  EN auth.forgotPassword: {len(en['auth']['forgotPassword'])} keys")
print(f"  ZH auth.forgotPassword: {len(zh['auth']['forgotPassword'])} keys")
