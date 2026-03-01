#!/usr/bin/env python3

print("🔧 Adding legal page routes to src/index.tsx...")

# Read the index file
with open('src/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find where to add routes (before export default app)
insert_pos = content.rfind('export default app')

if insert_pos == -1:
    print("❌ Could not find 'export default app'")
    exit(1)

# Create the legal routes
legal_routes = '''
// ============================================
// LEGAL PAGES
// ============================================

// About Us page
app.get('/about', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us - MemeLaunch Tycoon</title>
    <meta name="description" content="Learn about MemeLaunch Tycoon - the free meme coin trading simulator">
    <script defer src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
</head>
<body class="gradient-bg text-white min-h-screen">
    <div id="language-switcher-container"></div>
    
    <!-- Navigation -->
    <nav class="bg-gray-900/50 backdrop-blur-md border-b border-white/10">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <a href="/" class="text-2xl font-bold gradient-text">
                    <i class="fas fa-rocket mr-2"></i>MemeLaunch Tycoon
                </a>
                <a href="/" class="text-gray-300 hover:text-white">
                    <i class="fas fa-home mr-2"></i>Back to Home
                </a>
            </div>
        </div>
    </nav>

    <!-- Content -->
    <div class="container mx-auto px-4 py-12 max-w-4xl">
        <div class="glass-effect rounded-2xl p-8">
            <h1 class="text-4xl font-bold mb-6 gradient-text">About MemeLaunch Tycoon</h1>
            
            <div class="disclaimer-box bg-yellow-500/20 border-l-4 border-yellow-500 p-6 rounded-lg mb-8">
                <p class="text-lg"><i class="fas fa-exclamation-triangle mr-2"></i><strong>100% Simulation Game</strong> - No real money, no real cryptocurrency. Just fun!</p>
            </div>

            <div class="space-y-6 text-gray-300">
                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">What is MemeLaunch Tycoon?</h2>
                    <p>MemeLaunch Tycoon is a free-to-play simulation game that lets you experience the excitement of cryptocurrency trading without any financial risk. Create your own meme coins, trade with other players, and compete for the top spot on the leaderboard!</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">Our Mission</h2>
                    <p>We believe that learning about cryptocurrency and trading should be accessible, fun, and risk-free. Our mission is to provide an entertaining and educational platform where players can experiment with trading strategies, understand market dynamics, and have fun in the process.</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">Key Features</h2>
                    <ul class="list-disc list-inside space-y-2">
                        <li>🪙 <strong>Create Meme Coins</strong> - Design and launch your own virtual coins</li>
                        <li>📈 <strong>Real-time Trading</strong> - Trade coins with other players in a live market</li>
                        <li>🏆 <strong>Leaderboards</strong> - Compete for the highest portfolio value</li>
                        <li>🎮 <strong>Achievements</strong> - Unlock rewards as you progress</li>
                        <li>💬 <strong>Social Features</strong> - Connect with other traders</li>
                        <li>🎓 <strong>Learning Tools</strong> - Understand market mechanics risk-free</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">100% Safe & Free</h2>
                    <p>MemeLaunch Tycoon is completely free to play. No credit card required, no hidden fees, no real money involved. Everything in the game uses virtual currency (MLT coins) that has zero real-world value.</p>
                    <p class="mt-4"><strong>Age Requirement:</strong> You must be 18 or older to create an account.</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">Contact Us</h2>
                    <p>Have questions or feedback? Visit our <a href="/contact" class="text-orange-400 hover:text-orange-300 underline">Contact page</a>.</p>
                </section>
            </div>
        </div>
    </div>

    <script src="/static/i18n.js?v=20260221151619"></script>
    <script src="/static/language-switcher.js?v=20260221151619"></script>
</body>
</html>
  `);
});

// Contact page
app.get('/contact', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us - MemeLaunch Tycoon</title>
    <meta name="description" content="Get in touch with the MemeLaunch Tycoon team">
    <script defer src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
</head>
<body class="gradient-bg text-white min-h-screen">
    <div id="language-switcher-container"></div>
    
    <!-- Navigation -->
    <nav class="bg-gray-900/50 backdrop-blur-md border-b border-white/10">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <a href="/" class="text-2xl font-bold gradient-text">
                    <i class="fas fa-rocket mr-2"></i>MemeLaunch Tycoon
                </a>
                <a href="/" class="text-gray-300 hover:text-white">
                    <i class="fas fa-home mr-2"></i>Back to Home
                </a>
            </div>
        </div>
    </nav>

    <!-- Content -->
    <div class="container mx-auto px-4 py-12 max-w-4xl">
        <div class="glass-effect rounded-2xl p-8">
            <h1 class="text-4xl font-bold mb-6 gradient-text">Contact Us</h1>

            <div class="space-y-6 text-gray-300">
                <p class="text-lg">Have questions, feedback, or need support? We'd love to hear from you!</p>

                <div class="grid md:grid-cols-2 gap-6 my-8">
                    <div class="bg-gradient-to-br from-orange-500/20 to-pink-500/20 p-6 rounded-lg border border-orange-500/30">
                        <i class="fas fa-envelope text-3xl text-orange-400 mb-4"></i>
                        <h3 class="text-xl font-bold text-white mb-2">Email Support</h3>
                        <p class="text-gray-300">support@memelaunchtycoon.com</p>
                        <p class="text-sm text-gray-400 mt-2">Response within 24-48 hours</p>
                    </div>

                    <div class="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-6 rounded-lg border border-purple-500/30">
                        <i class="fas fa-comments text-3xl text-purple-400 mb-4"></i>
                        <h3 class="text-xl font-bold text-white mb-2">Community</h3>
                        <p class="text-gray-300">Join our Discord server</p>
                        <p class="text-sm text-gray-400 mt-2">Get instant help from the community</p>
                    </div>
                </div>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                    <div class="space-y-4">
                        <div class="bg-gray-800/50 p-4 rounded-lg">
                            <h4 class="font-bold text-white mb-2">Is this real cryptocurrency?</h4>
                            <p>No! MemeLaunch Tycoon is 100% simulation. All coins and trading are virtual with zero real-world value.</p>
                        </div>
                        <div class="bg-gray-800/50 p-4 rounded-lg">
                            <h4 class="font-bold text-white mb-2">How do I reset my password?</h4>
                            <p>Click "Forgot Password" on the login page and follow the instructions sent to your email.</p>
                        </div>
                        <div class="bg-gray-800/50 p-4 rounded-lg">
                            <h4 class="font-bold text-white mb-2">Can I delete my account?</h4>
                            <p>Yes. Email us at support@memelaunchtycoon.com with your account details and we'll process your request.</p>
                        </div>
                    </div>
                </section>

                <section class="mt-8">
                    <h2 class="text-2xl font-bold text-white mb-4">Business Inquiries</h2>
                    <p>For partnership or advertising opportunities: business@memelaunchtycoon.com</p>
                </section>
            </div>
        </div>
    </div>

    <script src="/static/i18n.js?v=20260221151619"></script>
    <script src="/static/language-switcher.js?v=20260221151619"></script>
</body>
</html>
  `);
});

// Privacy Policy page
app.get('/privacy-policy', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - MemeLaunch Tycoon</title>
    <meta name="description" content="Privacy Policy for MemeLaunch Tycoon">
    <script defer src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
</head>
<body class="gradient-bg text-white min-h-screen">
    <div id="language-switcher-container"></div>
    
    <!-- Navigation -->
    <nav class="bg-gray-900/50 backdrop-blur-md border-b border-white/10">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <a href="/" class="text-2xl font-bold gradient-text">
                    <i class="fas fa-rocket mr-2"></i>MemeLaunch Tycoon
                </a>
                <a href="/" class="text-gray-300 hover:text-white">
                    <i class="fas fa-home mr-2"></i>Back to Home
                </a>
            </div>
        </div>
    </nav>

    <!-- Content -->
    <div class="container mx-auto px-4 py-12 max-w-4xl">
        <div class="glass-effect rounded-2xl p-8">
            <h1 class="text-4xl font-bold mb-6 gradient-text">Privacy Policy</h1>
            
            <p class="text-sm text-gray-400 mb-6">Last Updated: March 1, 2026</p>

            <div class="space-y-6 text-gray-300">
                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">Introduction</h2>
                    <p>MemeLaunch Tycoon ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our website and services.</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">Information We Collect</h2>
                    <h3 class="text-xl font-bold text-white mb-2">Account Information</h3>
                    <ul class="list-disc list-inside space-y-2 mb-4">
                        <li>Email address</li>
                        <li>Username</li>
                        <li>Password (encrypted)</li>
                        <li>Profile information (optional)</li>
                    </ul>

                    <h3 class="text-xl font-bold text-white mb-2">Usage Data</h3>
                    <ul class="list-disc list-inside space-y-2">
                        <li>Game activity and statistics</li>
                        <li>Trading history</li>
                        <li>Coin creations</li>
                        <li>Social interactions</li>
                        <li>Device information</li>
                        <li>Browser type and version</li>
                        <li>IP address</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
                    <ul class="list-disc list-inside space-y-2">
                        <li>To provide and maintain our service</li>
                        <li>To manage your account</li>
                        <li>To calculate leaderboards and achievements</li>
                        <li>To send service-related notifications</li>
                        <li>To improve our game and user experience</li>
                        <li>To prevent fraud and abuse</li>
                        <li>To comply with legal obligations</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">Data Sharing</h2>
                    <p class="mb-4">We do NOT sell your personal data. We may share data with:</p>
                    <ul class="list-disc list-inside space-y-2">
                        <li><strong>Service Providers:</strong> Cloud hosting (Cloudflare), email services</li>
                        <li><strong>Analytics:</strong> Google Analytics (anonymized)</li>
                        <li><strong>Legal Requirements:</strong> When required by law</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">Your Rights (GDPR & CCPA)</h2>
                    <p class="mb-4">You have the right to:</p>
                    <ul class="list-disc list-inside space-y-2">
                        <li>Access your personal data</li>
                        <li>Correct inaccurate data</li>
                        <li>Delete your account and data</li>
                        <li>Export your data</li>
                        <li>Opt-out of marketing emails</li>
                        <li>Object to data processing</li>
                    </ul>
                    <p class="mt-4">To exercise these rights, contact: privacy@memelaunchtycoon.com</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">Cookies</h2>
                    <p>We use essential cookies for authentication and session management. You can manage cookie preferences in your browser settings.</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">Data Security</h2>
                    <p>We implement industry-standard security measures including:</p>
                    <ul class="list-disc list-inside space-y-2 mt-2">
                        <li>HTTPS encryption</li>
                        <li>Password hashing (bcrypt)</li>
                        <li>Regular security audits</li>
                        <li>Secure database access</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
                    <p>Our service is not directed to children under 18. If you are under 18, do not use this service or provide any personal information.</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
                    <p>We may update this privacy policy periodically. We will notify users of significant changes via email or website notification.</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">Contact Us</h2>
                    <p>For privacy-related questions: privacy@memelaunchtycoon.com</p>
                </section>
            </div>
        </div>
    </div>

    <script src="/static/i18n.js?v=20260221151619"></script>
    <script src="/static/language-switcher.js?v=20260221151619"></script>
</body>
</html>
  `);
});

// Terms of Service page
app.get('/terms-of-service', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terms of Service - MemeLaunch Tycoon</title>
    <meta name="description" content="Terms of Service for MemeLaunch Tycoon">
    <script defer src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
</head>
<body class="gradient-bg text-white min-h-screen">
    <div id="language-switcher-container"></div>
    
    <!-- Navigation -->
    <nav class="bg-gray-900/50 backdrop-blur-md border-b border-white/10">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <a href="/" class="text-2xl font-bold gradient-text">
                    <i class="fas fa-rocket mr-2"></i>MemeLaunch Tycoon
                </a>
                <a href="/" class="text-gray-300 hover:text-white">
                    <i class="fas fa-home mr-2"></i>Back to Home
                </a>
            </div>
        </div>
    </nav>

    <!-- Content -->
    <div class="container mx-auto px-4 py-12 max-w-4xl">
        <div class="glass-effect rounded-2xl p-8">
            <h1 class="text-4xl font-bold mb-6 gradient-text">Terms of Service</h1>
            
            <p class="text-sm text-gray-400 mb-6">Last Updated: March 1, 2026</p>

            <div class="disclaimer-box bg-red-500/20 border-l-4 border-red-500 p-6 rounded-lg mb-8">
                <p class="text-lg"><i class="fas fa-exclamation-circle mr-2"></i><strong>IMPORTANT:</strong> This is a SIMULATION GAME. No real money or cryptocurrency is involved. All assets are virtual and have ZERO real-world value.</p>
            </div>

            <div class="space-y-6 text-gray-300">
                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                    <p>By accessing or using MemeLaunch Tycoon, you agree to be bound by these Terms of Service. If you do not agree, do not use our service.</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">2. Age Requirement</h2>
                    <p>You must be at least 18 years old to create an account and use this service.</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">3. Nature of Service</h2>
                    <p><strong>MemeLaunch Tycoon is a simulation game for entertainment purposes only.</strong></p>
                    <ul class="list-disc list-inside space-y-2 mt-2">
                        <li>No real cryptocurrency is created, traded, or exchanged</li>
                        <li>All coins, tokens, and assets are virtual with ZERO real-world value</li>
                        <li>This is NOT financial advice or investment guidance</li>
                        <li>This is NOT a cryptocurrency exchange or wallet</li>
                        <li>No real money is required or accepted</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">4. User Accounts</h2>
                    <p>You are responsible for:</p>
                    <ul class="list-disc list-inside space-y-2 mt-2">
                        <li>Maintaining the security of your account</li>
                        <li>All activities under your account</li>
                        <li>Keeping your password confidential</li>
                        <li>Notifying us immediately of unauthorized access</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">5. Prohibited Conduct</h2>
                    <p>You agree NOT to:</p>
                    <ul class="list-disc list-inside space-y-2 mt-2">
                        <li>Use the service for illegal purposes</li>
                        <li>Harass, abuse, or harm other users</li>
                        <li>Create multiple accounts to manipulate the game</li>
                        <li>Use bots, scripts, or automation tools</li>
                        <li>Attempt to hack or exploit vulnerabilities</li>
                        <li>Impersonate others</li>
                        <li>Upload malicious content</li>
                        <li>Violate intellectual property rights</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">6. Virtual Currency</h2>
                    <p>MLT coins and all in-game assets:</p>
                    <ul class="list-disc list-inside space-y-2 mt-2">
                        <li>Have NO real-world monetary value</li>
                        <li>Cannot be exchanged for real money</li>
                        <li>Cannot be transferred outside the game</li>
                        <li>Are owned by MemeLaunch Tycoon</li>
                        <li>Can be modified or removed at our discretion</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
                    <p>All content, features, and functionality are owned by MemeLaunch Tycoon and protected by copyright, trademark, and other intellectual property laws.</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">8. Disclaimer of Warranties</h2>
                    <p>The service is provided "AS IS" without warranties of any kind. We do not guarantee:</p>
                    <ul class="list-disc list-inside space-y-2 mt-2">
                        <li>Uninterrupted or error-free operation</li>
                        <li>Accuracy of information</li>
                        <li>That the service will meet your requirements</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
                    <p>MemeLaunch Tycoon shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">10. Account Termination</h2>
                    <p>We reserve the right to suspend or terminate accounts that violate these terms or for any reason at our discretion.</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
                    <p>We may update these terms at any time. Continued use of the service constitutes acceptance of the updated terms.</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">12. Governing Law</h2>
                    <p>These terms are governed by and construed in accordance with applicable law.</p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold text-white mb-4">13. Contact</h2>
                    <p>For questions about these terms: legal@memelaunchtycoon.com</p>
                </section>
            </div>
        </div>
    </div>

    <script src="/static/i18n.js?v=20260221151619"></script>
    <script src="/static/language-switcher.js?v=20260221151619"></script>
</body>
</html>
  `);
});

'''

# Insert the routes
new_content = content[:insert_pos] + legal_routes + '\n' + content[insert_pos:]

with open('src/index.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Added 4 legal page routes to src/index.tsx")
print("\nRoutes added:")
print("  - /about")
print("  - /contact")
print("  - /privacy-policy")
print("  - /terms-of-service")
