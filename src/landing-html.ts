// New landing page HTML template
export const NEW_LANDING_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="MemeLaunch Tycoon - Create, trade, and compete with meme coins in a risk-free simulation game">
    <title>MemeLaunch Tycoon - Launch Your Meme Coin Empire</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles.css" rel="stylesheet">
    
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    </script>
    
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
      
      :root {
        --color-orange: #FF6B35;
        --color-yellow: #F7931E;
        --color-cyan: #00D9FF;
        --color-purple: #9D4EDD;
      }
      
      body {
        font-family: 'Inter', sans-serif;
        background: linear-gradient(135deg, #0A0B0D 0%, #16213E 50%, #0F3460 100%);
      }
      
      .font-mono {
        font-family: 'JetBrains Mono', monospace;
      }
      
      .gradient-bg {
        background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%);
      }
      
      .glass-effect {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .glow-orange {
        box-shadow: 0 0 30px rgba(255, 107, 53, 0.6);
      }
      
      .glow-cyan {
        box-shadow: 0 0 30px rgba(0, 217, 255, 0.6);
      }
      
      .animated-gradient-text {
        background: linear-gradient(90deg, var(--color-orange), var(--color-yellow), var(--color-cyan), var(--color-purple));
        background-size: 300% 100%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradientShift 3s ease infinite;
      }
      
      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      .carousel-container {
        display: flex;
        overflow-x: auto;
        scroll-behavior: smooth;
        scrollbar-width: none;
        -ms-overflow-style: none;
        gap: 1rem;
      }
      
      .carousel-container::-webkit-scrollbar {
        display: none;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      
      .float-animation {
        animation: float 3s ease-in-out infinite;
      }
      
      .step-card {
        position: relative;
      }
      
      .step-card::before {
        content: '';
        position: absolute;
        top: 50%;
        right: -2rem;
        width: 2rem;
        height: 2px;
        background: linear-gradient(90deg, var(--color-orange), transparent);
      }
      
      .step-card:last-child::before {
        display: none;
      }
      
      @media (max-width: 768px) {
        .step-card::before {
          display: none;
        }
      }
    </style>
</head>
<body class="gradient-bg text-white min-h-screen">
    <!-- Navigation -->
    <nav class="glass-effect sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-rocket text-3xl text-orange-500 float-animation"></i>
                    <h1 class="text-2xl font-bold">MemeLaunch Tycoon</h1>
                </div>
                
                <div class="hidden md:flex items-center space-x-8">
                    <a href="#features" class="hover:text-orange-500 transition" data-i18n="nav.features">Features</a>
                    <a href="#how-it-works" class="hover:text-orange-500 transition" data-i18n="nav.howItWorks">How It Works</a>
                    <a href="/market" class="hover:text-orange-500 transition" data-i18n="nav.market">Market</a>
                </div>
                
                <div class="flex items-center space-x-4">
                    <div class="language-switcher-container"></div>
                    
                    <button id="loginBtn" class="px-6 py-2 rounded-lg glass-effect hover:bg-white/10 transition" data-i18n="nav.login">
                        Login
                    </button>
                    <button id="registerBtn" class="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition glow-orange" data-i18n="nav.signUp">
                        Start Playing
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="container mx-auto px-4 py-16 md:py-24">
        <div class="max-w-6xl mx-auto text-center">
            <div class="mb-8">
                <h2 class="text-5xl md:text-7xl font-black mb-4">
                    <span data-i18n="hero.title">Launch Your Own</span><br/>
                    <span class="animated-gradient-text" data-i18n="hero.titleHighlight">Meme Coin Empire</span>
                </h2>
                <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto" data-i18n="hero.subtitle">
                    Risk-free simulation trading game. Create meme coins, trade, and compete on the leaderboard!
                </p>
            </div>
            
            <div class="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4 mb-12">
                <button class="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-lg font-bold text-lg transition glow-orange" id="heroSignupBtn">
                    <i class="fas fa-rocket mr-2"></i>
                    <span data-i18n="hero.ctaPrimary">Get 10,000 Free Coins</span>
                </button>
                <button class="w-full md:w-auto px-8 py-4 glass-effect hover:bg-white/10 rounded-lg font-bold text-lg transition">
                    <i class="fas fa-play-circle mr-2"></i>
                    <span data-i18n="hero.ctaSecondary">Watch Demo</span>
                </button>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="glass-effect px-6 py-4 rounded-xl hover:scale-105 transition">
                    <i class="fas fa-coins text-yellow-500 text-3xl mb-2"></i>
                    <p class="text-sm text-gray-400" data-i18n="hero.stats.startingBalance">Starting Balance</p>
                    <p class="text-2xl font-bold font-mono" id="hero-starting-balance">10,000</p>
                </div>
                <div class="glass-effect px-6 py-4 rounded-xl hover:scale-105 transition">
                    <i class="fas fa-users text-blue-500 text-3xl mb-2"></i>
                    <p class="text-sm text-gray-400" data-i18n="hero.stats.activePlayers">Active Players</p>
                    <p class="text-2xl font-bold font-mono" id="hero-active-players" data-count="1234">--</p>
                </div>
                <div class="glass-effect px-6 py-4 rounded-xl hover:scale-105 transition">
                    <i class="fas fa-chart-line text-green-500 text-3xl mb-2"></i>
                    <p class="text-sm text-gray-400" data-i18n="hero.stats.coinsCreated">Coins Created</p>
                    <p class="text-2xl font-bold font-mono" id="hero-coins-created" data-count="5678">--</p>
                </div>
                <div class="glass-effect px-6 py-4 rounded-xl hover:scale-105 transition">
                    <i class="fas fa-fire text-orange-500 text-3xl mb-2"></i>
                    <p class="text-sm text-gray-400" data-i18n="hero.stats.totalVolume">24h Volume</p>
                    <p class="text-2xl font-bold font-mono" id="hero-total-volume" data-count="125000">--</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Scripts -->
    <script src="/static/i18n.js"></script>
    <script src="/static/language-switcher.js"></script>
    <script src="/static/landing-new.js"></script>
    <script>
      document.getElementById('loginBtn')?.addEventListener('click', () => window.location.href = '/login');
      document.getElementById('registerBtn')?.addEventListener('click', () => window.location.href = '/signup');
      document.getElementById('heroSignupBtn')?.addEventListener('click', () => window.location.href = '/signup');
    </script>
</body>
</html>`;
