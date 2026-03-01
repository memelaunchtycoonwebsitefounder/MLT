#!/usr/bin/env python3
import re

print("🔧 Fixing Profile page and Forgot Password page...")

# Fix 1: Profile page - ensure loader is hidden after load
print("\n1️⃣ Fixing Profile page loader...")
with open('public/static/profile-page.js', 'r', encoding='utf-8') as f:
    profile_content = f.read()

# Add loader hiding in render method
if 'render() {' in profile_content:
    # Find render method and add loader hide at the beginning
    profile_content = re.sub(
        r'(render\(\) \{)',
        r'\1\n    // Hide loading screen\n    const loader = document.getElementById(\'profile-loading\');\n    if (loader) loader.classList.add(\'hidden\');',
        profile_content,
        count=1
    )
    
    # Also hide loader on error
    profile_content = re.sub(
        r'(document\.getElementById\(\'profile-content\'\)\.innerHTML = `\s*<div class="text-center py-12">)',
        r'const loader = document.getElementById(\'profile-loading\');\n      if (loader) loader.classList.add(\'hidden\');\n      \1',
        profile_content,
        count=1
    )

with open('public/static/profile-page.js', 'w', encoding='utf-8') as f:
    f.write(profile_content)

print("✅ Profile page loader fix applied!")

# Fix 2: Remove flash of old design from forgot password page
print("\n2️⃣ Fixing Forgot Password page...")
with open('src/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace forgot password page
forgot_start = content.find("// Forgot Password page\napp.get('/forgot-password'")
if forgot_start > 0:
    forgot_end = content.find("});\n\n// Reset Password page", forgot_start)
    if forgot_end > 0:
        new_forgot_page = '''// Forgot Password page
app.get('/forgot-password', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-i18n="auth.forgotPassword.pageTitle">Forgot Password - MemeLaunch Tycoon</title>
    <script defer src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
    <style>
        /* Prevent flash of unstyled content */
        body { opacity: 0; animation: fadeIn 0.3s ease-in forwards; }
        @keyframes fadeIn { to { opacity: 1; } }
    </style>
</head>
<body class="gradient-bg text-white min-h-screen">
    <div id="language-switcher-container"></div>
    
    <div class="min-h-screen flex items-center justify-center px-4 py-12">
        <div class="max-w-md w-full">
            <!-- Logo -->
            <div class="text-center mb-8">
                <a href="/" class="inline-block">
                    <h1 class="text-3xl font-bold gradient-text">
                        <i class="fas fa-rocket"></i> MemeLaunch
                    </h1>
                </a>
                <p class="text-gray-400 mt-2" data-i18n="auth.forgotPassword.subtitle">Reset Your Password</p>
            </div>

            <!-- Reset Form -->
            <div class="glass-effect rounded-2xl p-8">
                <div class="text-center mb-6">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full mb-4 animate-pulse">
                        <i class="fas fa-key text-3xl text-white"></i>
                    </div>
                    <h2 class="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent" data-i18n="auth.forgotPassword.title">Forgot Password?</h2>
                    <p class="text-gray-400 mt-2 text-sm" data-i18n="auth.forgotPassword.description">Don't worry! Enter your email and we'll send you a reset link.</p>
                </div>
                
                <form id="forgot-password-form" class="space-y-4">
                    <!-- Email -->
                    <div>
                        <label for="email" class="block text-sm font-medium mb-2">
                            <i class="fas fa-envelope mr-2 text-orange-400"></i><span data-i18n="auth.emailLabel">Email</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            class="input-field w-full"
                            data-i18n-placeholder="auth.emailPlaceholder"
                            placeholder="your@email.com"
                        />
                        <p class="text-red-400 text-sm mt-1 hidden" id="email-error"></p>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" id="submit-btn" class="gradient-button w-full">
                        <i class="fas fa-paper-plane mr-2"></i><span data-i18n="auth.forgotPassword.submitButton">Send Reset Link</span>
                    </button>

                    <!-- Form Message -->
                    <div id="form-message" class="hidden mt-4 p-4 rounded-lg"></div>
                </form>

                <!-- Back to Login -->
                <div class="mt-6 text-center">
                    <a href="/login" class="link-text group">
                        <i class="fas fa-arrow-left mr-2 group-hover:translate-x-[-4px] transition-transform"></i>
                        <span data-i18n="auth.forgotPassword.backToLogin">Back to Sign In</span>
                    </a>
                </div>
            </div>

            <!-- Security Note -->
            <p class="mt-6 text-center text-xs text-gray-500">
                <i class="fas fa-shield-alt mr-1 text-green-400"></i>
                <span data-i18n="auth.forgotPassword.securityNote">Your password reset link is secure and expires in 1 hour</span>
            </p>
        </div>
    </div>

    <script>
        document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-btn');
            const emailError = document.getElementById('email-error');
            const formMessage = document.getElementById('form-message');
            const email = document.getElementById('email').value;

            emailError.classList.add('hidden');
            formMessage.classList.add('hidden');
            
            // Disable button with loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i><span>Sending...</span>';

            try {
                const response = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    formMessage.textContent = result.message || 'Reset link sent! Check your email.';
                    formMessage.className = 'mt-4 p-4 rounded-lg bg-green-500/20 border border-green-500 text-green-400';
                    formMessage.classList.remove('hidden');
                    
                    // Disable form after success
                    document.getElementById('email').disabled = true;
                } else {
                    emailError.textContent = result.error || result.message || 'Failed to send reset email';
                    emailError.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Forgot password error:', error);
                emailError.textContent = 'Network error. Please try again.';
                emailError.classList.remove('hidden');
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i><span data-i18n="auth.forgotPassword.submitButton">Send Reset Link</span>';
                if (typeof i18n !== 'undefined') i18n.translatePage();
            }
        });
    </script>
    <script src="/static/i18n.js?v=20260221151619"></script>
    <script src="/static/language-switcher.js?v=20260221151619"></script>
</body>
</html>
  `);
});'''
        
        content = content[:forgot_start] + new_forgot_page + content[forgot_end:]

with open('src/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Forgot Password page redesigned with colors!")

print("\n✅ All fixes applied!")
