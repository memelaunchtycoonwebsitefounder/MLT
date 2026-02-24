import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { Env } from './types';
import { authMiddleware, optionalAuthMiddleware } from './middleware';
import { APP_VERSION } from './version';

// Import routes
import auth from './routes/auth';
import coins from './routes/coins';
import trades from './routes/trades';
import portfolio from './routes/portfolio';
import leaderboard from './routes/leaderboard';
import email from './routes/email';
import upload from './routes/upload';
import orders from './routes/orders';
import cron from './routes/cron';
import realtime from './routes/realtime';
import social from './routes/social';
import gamification from './routes/gamification';
import profile from './routes/profile';
import admin from './routes/admin';
import websocket from './routes/websocket';

// Import AI Scheduler
import { initializeGlobalScheduler, getSchedulerStatus } from './services/scheduler';

// Import Durable Object
import { RealtimeDurableObject } from './realtime-durable-object';

const app = new Hono<{ Bindings: Env }>();

// Flag to ensure scheduler is initialized only once
let schedulerInitialized = false;

// Enable CORS
app.use('/api/*', cors());

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

// Middleware to initialize AI scheduler on first request
app.use('*', async (c, next) => {
  if (!schedulerInitialized && c.env.DB) {
    try {
      console.log('🤖 Initializing AI Trading Scheduler...');
      initializeGlobalScheduler(c.env.DB);
      schedulerInitialized = true;
      console.log('✅ AI Trading Scheduler initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI Scheduler:', error);
    }
  }
  await next();
});

// API Routes
app.route('/api/auth', auth);

// Coins routes (optionally authenticated)
const coinsRoutes = new Hono<{ Bindings: Env }>();
coinsRoutes.use('*', optionalAuthMiddleware);
coinsRoutes.route('/', coins);
app.route('/api/coins', coinsRoutes);

// Trades routes (requires authentication)
const tradesRoutes = new Hono<{ Bindings: Env }>();
tradesRoutes.use('*', authMiddleware);
tradesRoutes.route('/', trades);
app.route('/api/trades', tradesRoutes);

// Orders routes (requires authentication)
const ordersRoutes = new Hono<{ Bindings: Env }>();
ordersRoutes.use('*', authMiddleware);
ordersRoutes.route('/', orders);
app.route('/api/orders', ordersRoutes);

// Portfolio routes (requires authentication)
const portfolioRoutes = new Hono<{ Bindings: Env }>();
portfolioRoutes.use('*', authMiddleware);
portfolioRoutes.route('/', portfolio);
app.route('/api/portfolio', portfolioRoutes);

app.route('/api/leaderboard', leaderboard);
app.route('/api/email', email);
app.route('/api/cron', cron);
app.route('/api/realtime', realtime);

// Social routes (requires authentication)
const socialRoutes = new Hono<{ Bindings: Env }>();
socialRoutes.use('*', authMiddleware);
socialRoutes.route('/', social);
app.route('/api/social', socialRoutes);

// Profile routes (with auth)
const profileRoutes = new Hono<{ Bindings: Env }>();
profileRoutes.use('*', authMiddleware);
profileRoutes.route('/', profile);
app.route('/api/profile', profileRoutes);

// Gamification routes (requires authentication)
const gamificationRoutes = new Hono<{ Bindings: Env }>();
gamificationRoutes.use('*', authMiddleware);
gamificationRoutes.route('/', gamification);
app.route('/api/gamification', gamificationRoutes);

// Upload routes (requires authentication)
const uploadRoutes = new Hono<{ Bindings: Env }>();
uploadRoutes.use('*', authMiddleware);
uploadRoutes.route('/', upload);
app.route('/api/upload', uploadRoutes);

// Admin routes (no auth for testing, add auth in production)
app.route('/api/admin', admin);

// WebSocket routes for real-time price updates
app.route('/api/ws', websocket);

// Image serving from R2
app.get('/images/*', async (c) => {
  try {
    // Get the path after /images/
    const path = c.req.path.replace('/images/', '');
    
    if (!c.env.IMAGES) {
      return c.notFound();
    }
    
    const object = await c.env.IMAGES.get(path);
    
    if (!object) {
      return c.notFound();
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000');
    
    return new Response(object.body, {
      headers
    });
  } catch (error) {
    console.error('Image serving error:', error);
    return c.notFound();
  }
});

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'MemeLaunch Tycoon API is running',
    timestamp: new Date().toISOString()
  });
});

// AI Scheduler status endpoint
app.get('/api/scheduler/status', (c) => {
  const status = getSchedulerStatus();
  return c.json({
    success: true,
    scheduler: {
      ...status,
      initialized: schedulerInitialized
    },
    timestamp: new Date().toISOString()
  });
});

// Landing page - Meta redirect to index.html (served as static file)
app.get('/', (c) => {
  // Set cache control headers to prevent HTML caching
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');
  
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="MemeLaunch Tycoon - Create, trade, and compete with meme coins in a risk-free simulation game">
    <title>MemeLaunch Tycoon - Launch Your Meme Coin Empire</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
    
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
    </style>
        <style>
            /* Critical CSS - Load immediately to prevent flash */
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-out;
            }
            #page-loader.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Hide body content until loader is ready */</style>
</head>
<body class="gradient-bg text-white min-h-screen">
    <!-- Loading overlay -->
    <div id="page-loader">
        <div class="loader-spinner"></div>
    </div>
    
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

    <!-- Live Market Preview -->
    <section class="container mx-auto px-4 py-16">
        <div class="mb-8 text-center">
            <h3 class="text-4xl font-bold mb-2" data-i18n="liveMarket.title">🔥 Trending Now</h3>
            <p class="text-gray-400">Live meme coins racing to the moon</p>
        </div>
        
        <div class="carousel-container pb-4" id="trending-coins-carousel">
            <!-- Trending coins will be loaded dynamically -->
            <div class="glass-effect rounded-xl p-4 min-w-[280px] animate-pulse">
                <div class="h-24 bg-gray-800 rounded"></div>
            </div>
            <div class="glass-effect rounded-xl p-4 min-w-[280px] animate-pulse">
                <div class="h-24 bg-gray-800 rounded"></div>
            </div>
            <div class="glass-effect rounded-xl p-4 min-w-[280px] animate-pulse">
                <div class="h-24 bg-gray-800 rounded"></div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="container mx-auto px-4 py-16">
        <div class="max-w-5xl mx-auto">
            <h3 class="text-4xl font-bold text-center mb-12" data-i18n="howItWorks.title">How It Works</h3>
            
            <div class="grid md:grid-cols-4 gap-6">
                <div class="step-card glass-effect p-6 rounded-xl text-center hover:scale-105 transition">
                    <div class="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                    <h4 class="text-xl font-bold mb-2" data-i18n="howItWorks.step1.title">Sign Up & Get 10,000 Coins</h4>
                    <p class="text-gray-400 text-sm" data-i18n="howItWorks.step1.desc">100% free, no credit card required</p>
                </div>
                
                <div class="step-card glass-effect p-6 rounded-xl text-center hover:scale-105 transition">
                    <div class="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                    <h4 class="text-xl font-bold mb-2" data-i18n="howItWorks.step2.title">Create Your First Meme Coin</h4>
                    <p class="text-gray-400 text-sm" data-i18n="howItWorks.step2.desc">Upload image, set name & supply, launch!</p>
                </div>
                
                <div class="step-card glass-effect p-6 rounded-xl text-center hover:scale-105 transition">
                    <div class="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                    <h4 class="text-xl font-bold mb-2" data-i18n="howItWorks.step3.title">Trade & Earn Virtual Profits</h4>
                    <p class="text-gray-400 text-sm" data-i18n="howItWorks.step3.desc">Buy low, sell high, track your portfolio</p>
                </div>
                
                <div class="step-card glass-effect p-6 rounded-xl text-center hover:scale-105 transition">
                    <div class="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
                    <h4 class="text-xl font-bold mb-2" data-i18n="howItWorks.step4.title">Climb the Leaderboard</h4>
                    <p class="text-gray-400 text-sm" data-i18n="howItWorks.step4.desc">Compete with players worldwide</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Grid -->
    <section id="features" class="container mx-auto px-4 py-16">
        <div class="max-w-6xl mx-auto">
            <h3 class="text-4xl font-bold text-center mb-12" data-i18n="features.title">Why Choose MemeLaunch Tycoon?</h3>
            
            <div class="grid md:grid-cols-3 gap-8">
                <div class="glass-effect p-8 rounded-xl hover:scale-105 transition">
                    <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-shield-alt text-3xl text-green-500"></i>
                    </div>
                    <h4 class="text-2xl font-bold mb-3" data-i18n="features.riskFree.title">100% Risk-Free</h4>
                    <p class="text-gray-400" data-i18n="features.riskFree.desc">No real money, pure simulation fun</p>
                </div>
                
                <div class="glass-effect p-8 rounded-xl hover:scale-105 transition">
                    <div class="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-chart-line text-3xl text-blue-500"></i>
                    </div>
                    <h4 class="text-2xl font-bold mb-3" data-i18n="features.realMarket.title">Real Market Mechanics</h4>
                    <p class="text-gray-400" data-i18n="features.realMarket.desc">Bonding curves, price discovery, liquidity</p>
                </div>
                
                <div class="glass-effect p-8 rounded-xl hover:scale-105 transition">
                    <div class="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-trophy text-3xl text-yellow-500"></i>
                    </div>
                    <h4 class="text-2xl font-bold mb-3" data-i18n="features.leaderboard.title">Competitive Leaderboards</h4>
                    <p class="text-gray-400" data-i18n="features.leaderboard.desc">Earn badges, climb ranks, get VIP status</p>
                </div>
                
                <div class="glass-effect p-8 rounded-xl hover:scale-105 transition">
                    <div class="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-crown text-3xl text-purple-500"></i>
                    </div>
                    <h4 class="text-2xl font-bold mb-3" data-i18n="features.vipPerks.title">VIP Perks</h4>
                    <p class="text-gray-400" data-i18n="features.vipPerks.desc">Exclusive features for top traders</p>
                </div>
                
                <div class="glass-effect p-8 rounded-xl hover:scale-105 transition">
                    <div class="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-robot text-3xl text-cyan-500"></i>
                    </div>
                    <h4 class="text-2xl font-bold mb-3" data-i18n="features.aiTraders.title">AI Trading Bots</h4>
                    <p class="text-gray-400" data-i18n="features.aiTraders.desc">Realistic market simulation with AI</p>
                </div>
                
                <div class="glass-effect p-8 rounded-xl hover:scale-105 transition">
                    <div class="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-chart-candlestick text-3xl text-orange-500"></i>
                    </div>
                    <h4 class="text-2xl font-bold mb-3" data-i18n="features.charts.title">Professional Charts</h4>
                    <p class="text-gray-400" data-i18n="features.charts.desc">TradingView-style K-line charts</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Live Statistics -->
    <section class="container mx-auto px-4 py-16 bg-gradient-to-r from-orange-500/10 to-purple-500/10">
        <div class="max-w-6xl mx-auto">
            <h3 class="text-4xl font-bold text-center mb-12" data-i18n="stats.title">Join Thousands of Players</h3>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div class="text-center">
                    <div class="text-5xl md:text-6xl font-black font-mono mb-2 text-orange-500" id="stat-total-users" data-count="2500">--</div>
                    <p class="text-gray-400" data-i18n="stats.users">Total Users</p>
                </div>
                <div class="text-center">
                    <div class="text-5xl md:text-6xl font-black font-mono mb-2 text-cyan-500" id="stat-total-coins" data-count="8900">--</div>
                    <p class="text-gray-400" data-i18n="stats.coins">Coins Created</p>
                </div>
                <div class="text-center">
                    <div class="text-5xl md:text-6xl font-black font-mono mb-2 text-purple-500" id="stat-total-volume" data-count="1250000">--</div>
                    <p class="text-gray-400" data-i18n="stats.volume">Total Volume</p>
                </div>
                <div class="text-center">
                    <div class="text-5xl md:text-6xl font-black font-mono mb-2 text-green-500" id="stat-total-trades" data-count="45000">--</div>
                    <p class="text-gray-400" data-i18n="stats.trades">Trades Today</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonials -->
    <section class="container mx-auto px-4 py-16">
        <div class="max-w-6xl mx-auto">
            <h3 class="text-4xl font-bold text-center mb-12" data-i18n="testimonials.title">What Players Say</h3>
            
            <div class="grid md:grid-cols-3 gap-8">
                <div class="glass-effect p-6 rounded-xl">
                    <div class="flex items-center space-x-3 mb-4">
                        <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center font-bold">CW</div>
                        <div>
                            <p class="font-bold" data-i18n="testimonials.user1.name">CryptoWhale99</p>
                            <p class="text-sm text-gray-400" data-i18n="testimonials.user1.role">Top Trader</p>
                        </div>
                    </div>
                    <p class="text-gray-300" data-i18n="testimonials.user1.text">"Best meme coin simulator! Made 100x on my first trade."</p>
                </div>
                
                <div class="glass-effect p-6 rounded-xl">
                    <div class="flex items-center space-x-3 mb-4">
                        <div class="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center font-bold">MS</div>
                        <div>
                            <p class="font-bold" data-i18n="testimonials.user2.name">MoonShot</p>
                            <p class="text-sm text-gray-400" data-i18n="testimonials.user2.role">Content Creator</p>
                        </div>
                    </div>
                    <p class="text-gray-300" data-i18n="testimonials.user2.text">"Love the real-time charts and competitive leaderboard!"</p>
                </div>
                
                <div class="glass-effect p-6 rounded-xl">
                    <div class="flex items-center space-x-3 mb-4">
                        <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold">DH</div>
                        <div>
                            <p class="font-bold" data-i18n="testimonials.user3.name">DiamondHands</p>
                            <p class="text-sm text-gray-400" data-i18n="testimonials.user3.role">VIP Member</p>
                        </div>
                    </div>
                    <p class="text-gray-300" data-i18n="testimonials.user3.text">"Addictive gameplay, amazing community!"</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing -->
    <section class="container mx-auto px-4 py-16">
        <div class="max-w-4xl mx-auto">
            <h3 class="text-4xl font-bold text-center mb-12" data-i18n="pricing.title">Choose Your Plan</h3>
            
            <div class="grid md:grid-cols-2 gap-8">
                <div class="glass-effect p-8 rounded-xl border-2 border-green-500/50">
                    <div class="text-center mb-6">
                        <h4 class="text-2xl font-bold mb-2" data-i18n="pricing.free.name">Free</h4>
                        <div class="text-5xl font-black mb-2">$<span data-i18n="pricing.free.price">0</span></div>
                        <p class="text-gray-400">Forever</p>
                    </div>
                    <ul class="space-y-3 mb-6">
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i><span data-i18n="pricing.free.features.0">10,000 starting coins</span></li>
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i><span data-i18n="pricing.free.features.1">Unlimited coin creation</span></li>
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i><span data-i18n="pricing.free.features.2">Basic charts</span></li>
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i><span data-i18n="pricing.free.features.3">Community access</span></li>
                    </ul>
                    <button class="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg font-bold transition" data-i18n="pricing.free.cta">
                        Start Free
                    </button>
                </div>
                
                <div class="glass-effect p-8 rounded-xl border-2 border-purple-500/50 relative">
                    <div class="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-bold">
                        Coming Soon
                    </div>
                    <div class="text-center mb-6 opacity-60">
                        <h4 class="text-2xl font-bold mb-2" data-i18n="pricing.vip.name">VIP</h4>
                        <div class="text-5xl font-black mb-2" data-i18n="pricing.vip.price">Coming Soon</div>
                        <p class="text-gray-400">Premium Features</p>
                    </div>
                    <ul class="space-y-3 mb-6 opacity-60">
                        <li class="flex items-center"><i class="fas fa-check text-purple-500 mr-2"></i><span data-i18n="pricing.vip.features.0">Everything in Free</span></li>
                        <li class="flex items-center"><i class="fas fa-check text-purple-500 mr-2"></i><span data-i18n="pricing.vip.features.1">Advanced analytics</span></li>
                        <li class="flex items-center"><i class="fas fa-check text-purple-500 mr-2"></i><span data-i18n="pricing.vip.features.2">Priority support</span></li>
                        <li class="flex items-center"><i class="fas fa-check text-purple-500 mr-2"></i><span data-i18n="pricing.vip.features.3">Exclusive badges</span></li>
                        <li class="flex items-center"><i class="fas fa-check text-purple-500 mr-2"></i><span data-i18n="pricing.vip.features.4">Early access to new features</span></li>
                    </ul>
                    <button class="w-full px-6 py-3 glass-effect rounded-lg font-bold cursor-not-allowed opacity-60" disabled data-i18n="pricing.vip.cta">
                        Coming Soon
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ -->
    <section class="container mx-auto px-4 py-16">
        <div class="max-w-3xl mx-auto">
            <h3 class="text-4xl font-bold text-center mb-12" data-i18n="faq.title">Frequently Asked Questions</h3>
            
            <div class="space-y-4">
                <details class="glass-effect p-6 rounded-xl group">
                    <summary class="font-bold text-lg cursor-pointer flex justify-between items-center">
                        <span data-i18n="faq.q1.question">Is this real crypto trading?</span>
                        <i class="fas fa-chevron-down group-open:rotate-180 transition"></i>
                    </summary>
                    <p class="mt-4 text-gray-400" data-i18n="faq.q1.answer">No, MemeLaunch Tycoon is 100% simulation. No real money involved.</p>
                </details>
                
                <details class="glass-effect p-6 rounded-xl group">
                    <summary class="font-bold text-lg cursor-pointer flex justify-between items-center">
                        <span data-i18n="faq.q2.question">How do I earn coins?</span>
                        <i class="fas fa-chevron-down group-open:rotate-180 transition"></i>
                    </summary>
                    <p class="mt-4 text-gray-400" data-i18n="faq.q2.answer">Trade meme coins, create popular coins, and complete achievements.</p>
                </details>
                
                <details class="glass-effect p-6 rounded-xl group">
                    <summary class="font-bold text-lg cursor-pointer flex justify-between items-center">
                        <span data-i18n="faq.q3.question">Can I withdraw my coins?</span>
                        <i class="fas fa-chevron-down group-open:rotate-180 transition"></i>
                    </summary>
                    <p class="mt-4 text-gray-400" data-i18n="faq.q3.answer">No, all coins are virtual and for game purposes only.</p>
                </details>
                
                <details class="glass-effect p-6 rounded-xl group">
                    <summary class="font-bold text-lg cursor-pointer flex justify-between items-center">
                        <span data-i18n="faq.q4.question">Is it free?</span>
                        <i class="fas fa-chevron-down group-open:rotate-180 transition"></i>
                    </summary>
                    <p class="mt-4 text-gray-400" data-i18n="faq.q4.answer">Yes! 100% free to play. No credit card required.</p>
                </details>
            </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="container mx-auto px-4 py-16">
        <div class="max-w-4xl mx-auto glass-effect rounded-2xl p-12 text-center glow-orange">
            <h3 class="text-4xl md:text-5xl font-bold mb-4" data-i18n="cta.title">Ready to Launch Your Empire?</h3>
            <p class="text-xl text-gray-300 mb-8" data-i18n="cta.subtitle">Join thousands of players and start your meme coin journey today!</p>
            
            <button class="px-12 py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-lg font-bold text-xl transition glow-orange" id="finalCtaBtn">
                <i class="fas fa-rocket mr-2"></i>
                <span data-i18n="cta.button">Get Started Free</span>
            </button>
            
            <p class="text-sm text-gray-400 mt-6" data-i18n="cta.disclaimer">
                No credit card • 100% free • Instant access
            </p>
        </div>
    </section>

    <!-- Footer -->
    <footer class="container mx-auto px-4 py-8 border-t border-gray-800">
        <div class="max-w-6xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-rocket text-2xl text-orange-500"></i>
                    <span class="font-bold">MemeLaunch Tycoon</span>
                </div>
                
                <div class="flex flex-wrap justify-center space-x-6">
                    <a href="/dashboard" class="hover:text-orange-500 transition" data-i18n="footer.about">About</a>
                    <a href="#" class="hover:text-orange-500 transition" data-i18n="footer.privacy">Privacy Policy</a>
                    <a href="#" class="hover:text-orange-500 transition" data-i18n="footer.terms">Terms of Service</a>
                    <a href="#" class="hover:text-orange-500 transition" data-i18n="footer.contact">Contact</a>
                </div>
            </div>
            
            <div class="text-center text-gray-500 text-sm mt-6" data-i18n="footer.copyright">
                © 2026 MemeLaunch Tycoon. All rights reserved.
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="/static/fetch-utils.js?v=20260221151619"></script>
    <script src="/static/i18n.js?v=20260221151619"></script>
    <script src="/static/language-switcher.js?v=20260221151619"></script>
    <script src="/static/landing-new.js?v=20260221151619"></script>
    <script>
      // Hide page loader when page is ready
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          if (window.fetchUtils) {
            window.fetchUtils.hidePageLoader();
          }
        }, 100);
      });
      
      // Navigation button handlers
      document.getElementById('loginBtn')?.addEventListener('click', () => {
        window.location.href = '/login';
      });
      document.getElementById('registerBtn')?.addEventListener('click', () => {
        window.location.href = '/signup';
      });
      document.getElementById('heroSignupBtn')?.addEventListener('click', () => {
        window.location.href = '/signup';
      });
      document.getElementById('finalCtaBtn')?.addEventListener('click', () => {
        window.location.href = '/signup';
      });
    </script>
</body>
</html>`);
});
// Signup/Register page - Modern Design
app.get('/signup', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>註冊 - MemeLaunch Tycoon</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
    <style>
        body { 
            background: #000000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
        }
        .form-card {
            background: #1a1a1a;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
        .input-field {
            background: #2a2a2a;
            border: 1px solid #3a3a3a;
            border-radius: 8px;
            color: #ffffff;
            transition: all 0.2s;
        }
        .input-field:focus {
            outline: none;
            border-color: #FF6B35;
            box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.1);
        }
        .input-field::placeholder {
            color: #6b7280;
        }
        .gradient-button {
            background: linear-gradient(90deg, #FF6B35 0%, #E91E63 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            padding: 14px;
            transition: all 0.3s;
            cursor: pointer;
        }
        .gradient-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
        }
        .social-button {
            background: #2a2a2a;
            border: 1px solid #3a3a3a;
            border-radius: 8px;
            color: white;
            padding: 12px;
            transition: all 0.2s;
            cursor: pointer;
        }
        .social-button:hover {
            background: #3a3a3a;
        }
        .link-text {
            color: #FF7A59;
            text-decoration: none;
            transition: color 0.2s;
        }
        .link-text:hover {
            color: #FF8A69;
        }
        .password-strength {
            font-size: 0.75rem;
            color: #9ca3af;
            margin-top: 0.25rem;
        }
        .error-message {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            text-align: center;
        }
    </style>
        <style>
            /* Critical CSS - Load immediately to prevent flash */
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-out;
            }
            #page-loader.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Hide body content until loader is ready */</style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
                <!-- Language Switcher -->
        <div class="language-switcher-container mb-6 flex justify-end"></div>

<div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">
                <i class="fas fa-rocket"></i> MemeLaunch
            </h1>
            <p class="text-gray-400 text-sm">開始你的迷因啟蒙旅程</p>
        </div>

        <div class="form-card p-8">
            <h2 class="text-2xl font-bold text-white mb-6 text-center">創建帳號</h2>
            
            <form id="register-form" class="space-y-4">
                <div>
                    <label class="block text-sm text-gray-300 mb-2">
                        <i class="fas fa-envelope mr-2"></i><span data-i18n="auth.login.emailLabel">Email Address</span>
                    </label>
                    <input type="email" name="email" required class="input-field w-full px-4 py-3" data-i18n-placeholder="auth.login.emailPlaceholder" placeholder="your@email.com"/>
                </div>

                <div>
                    <label class="block text-sm text-gray-300 mb-2">
                        <i class="fas fa-user mr-2"></i>用戶名稱
                    </label>
                    <input type="text" name="username" required minlength="3" maxlength="20" pattern="[a-zA-Z0-9_]+" class="input-field w-full px-4 py-3" placeholder="選擇一個獨特的用戶名"/>
                </div>

                <div>
                    <label class="block text-sm text-gray-300 mb-2">
                        <i class="fas fa-lock mr-2"></i><span data-i18n="auth.login.passwordLabel">Password</span>
                    </label>
                    <div class="relative">
                        <input type="password" name="password" id="password" required minlength="8" class="input-field w-full px-4 py-3 pr-12" placeholder="至少 8 個字符"/>
                        <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition" onclick="togglePassword('password')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <p class="password-strength" id="password-strength">密碼強度：繼續輸入密碼</p>
                </div>

                <div>
                    <label class="block text-sm text-gray-300 mb-2">
                        <i class="fas fa-lock mr-2"></i>確認密碼
                    </label>
                    <div class="relative">
                        <input type="password" name="confirmPassword" id="confirmPassword" required class="input-field w-full px-4 py-3 pr-12" placeholder="再次輸入密碼"/>
                        <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition" onclick="togglePassword('confirmPassword')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-start gap-2 text-sm">
                    <input type="checkbox" name="terms" id="terms" required class="mt-1 rounded"/>
                    <label for="terms" class="text-gray-300">
                        我同意 <a href="/terms" class="link-text">服務條款</a> 和 <a href="/privacy" class="link-text">隱私政策</a>
                    </label>
                </div>

                <div id="error-message" class="error-message hidden"></div>

                <button type="submit" class="gradient-button w-full">
                    <i class="fas fa-user-plus mr-2"></i>創建帳號
                </button>
            </form>

            <div class="my-6 text-center text-sm text-gray-400">
                或使用社交帳號註冊
            </div>

            <div class="grid grid-cols-2 gap-3">
                <button class="social-button" onclick="socialLogin('google')">
                    <i class="fab fa-google mr-2"></i>Google
                </button>
                <button class="social-button" onclick="socialLogin('twitter')">
                    <i class="fab fa-twitter mr-2"></i>Twitter
                </button>
            </div>

            <p class="mt-6 text-center text-sm text-gray-400">
                已有帳號？
                <a href="/login" class="link-text">立即登入</a>
            </p>
        </div>

        <p class="mt-6 text-center text-xs text-gray-600">
            <i class="fas fa-lock mr-1"></i>100% 端對端加密 · 無需將金鑰交易 · 您的帳戶從安全保護
        </p>
    </div>

    <script>
        function togglePassword(fieldId) {
            const input = document.getElementById(fieldId);
            const button = input.parentElement.querySelector('button');
            const icon = button.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }

        function socialLogin(provider) {
            window.location.href = '/api/auth/oauth/' + provider;
        }

        document.getElementById('password').addEventListener('input', (e) => {
            const password = e.target.value;
            const strengthEl = document.getElementById('password-strength');
            
            if (password.length === 0) {
                strengthEl.textContent = '密碼強度：繼續輸入密碼';
                strengthEl.style.color = '#9ca3af';
                return;
            }
            
            let strength = 0;
            if (password.length >= 8) strength++;
            if (password.length >= 12) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/\\d/.test(password)) strength++;
            if (/[@$!%*?&]/.test(password)) strength++;
            
            if (strength <= 2) {
                strengthEl.textContent = '密碼強度：弱';
                strengthEl.style.color = '#ef4444';
            } else if (strength <= 4) {
                strengthEl.textContent = '密碼強度：中等';
                strengthEl.style.color = '#f59e0b';
            } else if (strength <= 5) {
                strengthEl.textContent = '密碼強度：強';
                strengthEl.style.color = '#10b981';
            } else {
                strengthEl.textContent = '密碼強度：非常強';
                strengthEl.style.color = '#06b6d4';
            }
        });

        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            const errorEl = document.getElementById('error-message');
            
            if (data.password !== data.confirmPassword) {
                errorEl.textContent = '密碼不一致，請重新輸入';
                errorEl.classList.remove('hidden');
                return;
            }
            
            if (!data.terms) {
                errorEl.textContent = '請同意服務條款和隱私政策';
                errorEl.classList.remove('hidden');
                return;
            }
            
            errorEl.classList.add('hidden');
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: data.email,
                        username: data.username,
                        password: data.password
                    })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    // Save token to localStorage
                    if (result.data && result.data.token) {
                        localStorage.setItem('auth_token', result.data.token);
                        localStorage.setItem('user', JSON.stringify(result.data.user));
                    }
                    alert('註冊成功！歡迎加入 MemeLaunch Tycoon！');
                    window.location.href = '/dashboard';
                } else {
                    errorEl.textContent = result.error || result.message || '註冊失敗，請稍後再試';
                    errorEl.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Registration error:', error);
                errorEl.textContent = '網路錯誤，請稍後再試';
                errorEl.classList.remove('hidden');
            }
        });
    </script>
</body>
</html>
  `);
});

// Login page - Modern Design
app.get('/login', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>登入 - MemeLaunch Tycoon</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
    <style>
        body { 
            background: #000000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
        }
        .form-card {
            background: #1a1a1a;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
        .input-field {
            background: #2a2a2a;
            border: 1px solid #3a3a3a;
            border-radius: 8px;
            color: #ffffff;
            transition: all 0.2s;
        }
        .input-field:focus {
            outline: none;
            border-color: #FF6B35;
            box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.1);
        }
        .input-field::placeholder {
            color: #6b7280;
        }
        .gradient-button {
            background: linear-gradient(90deg, #FF6B35 0%, #E91E63 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            padding: 14px;
            transition: all 0.3s;
            cursor: pointer;
        }
        .gradient-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
        }
        .social-button {
            background: #2a2a2a;
            border: 1px solid #3a3a3a;
            border-radius: 8px;
            color: white;
            padding: 12px;
            transition: all 0.2s;
            cursor: pointer;
        }
        .social-button:hover {
            background: #3a3a3a;
        }
        .link-text {
            color: #FF7A59;
            text-decoration: none;
            transition: color 0.2s;
        }
        .link-text:hover {
            color: #FF8A69;
        }
    </style>
        <style>
            /* Critical CSS - Load immediately to prevent flash */
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-out;
            }
            #page-loader.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Hide body content until loader is ready */</style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">
                <i class="fas fa-rocket"></i> MemeLaunch
            </h1>
            <p class="text-gray-400 text-sm" data-i18n="auth.login.subtitle">Welcome back!</p>
        </div>

        <div class="form-card p-8">
            <h2 class="text-2xl font-bold text-white mb-6 text-center" data-i18n="auth.login.title">Sign In</h2>
            
            <form id="login-form" class="space-y-4">
                <div>
                    <label class="block text-sm text-gray-300 mb-2">
                        <i class="fas fa-envelope mr-2"></i><span data-i18n="auth.login.emailLabel">Email Address</span>
                    </label>
                    <input type="email" name="email" required class="input-field w-full px-4 py-3" data-i18n-placeholder="auth.login.emailPlaceholder" placeholder="your@email.com"/>
                </div>

                <div>
                    <label class="block text-sm text-gray-300 mb-2">
                        <i class="fas fa-lock mr-2"></i><span data-i18n="auth.login.passwordLabel">Password</span>
                    </label>
                    <div class="relative">
                        <input type="password" name="password" required class="input-field w-full px-4 py-3 pr-12" data-i18n-placeholder="auth.login.passwordPlaceholder" placeholder="Enter your password"/>
                        <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition" onclick="togglePassword(this)">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between text-sm">
                    <label class="flex items-center gap-2 cursor-pointer text-gray-300">
                        <input type="checkbox" name="rememberMe" class="rounded">
                        <span data-i18n="auth.login.rememberMe">Remember me</span>
                    </label>
                    <a href="/forgot-password" class="link-text">忘記密碼？</a>
                </div>

                <button type="submit" class="gradient-button w-full">
                    <i class="fas fa-sign-in-alt mr-2"></i>登入
                </button>
            </form>

            <div class="my-6 text-center text-sm text-gray-400">
                或使用社交帳號登入
            </div>

            <div class="grid grid-cols-2 gap-3">
                <button class="social-button" onclick="socialLogin('google')">
                    <i class="fab fa-google mr-2"></i>Google
                </button>
                <button class="social-button" onclick="socialLogin('twitter')">
                    <i class="fab fa-twitter mr-2"></i>Twitter
                </button>
            </div>

            <p class="mt-6 text-center text-sm text-gray-400">
                還沒有帳號？
                <a href="/signup" class="link-text">立即註冊</a>
            </p>
        </div>

        <p class="mt-6 text-center text-xs text-gray-600">
            <i class="fas fa-lock mr-1"></i>100% 模擬遊戲 · 無需真實金錢 · 您的資料受保護
        </p>
    </div>

    <script>
        function togglePassword(button) {
            const input = button.parentElement.querySelector('input');
            const icon = button.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }

        function socialLogin(provider) {
            window.location.href = '/api/auth/oauth/' + provider;
        }

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    // Save token to localStorage
                    if (result.data && result.data.token) {
                        localStorage.setItem('auth_token', result.data.token);
                        localStorage.setItem('user', JSON.stringify(result.data.user));
                    }
                    // Redirect without alert popup
                    window.location.href = '/dashboard';
                } else {
                    alert(result.error || result.message || '登入失敗，請檢查您的憑證');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('網路錯誤，請稍後再試');
            }
        });
    </script>
</body>
</html>
  `);
});

// Forgot Password page
app.get('/forgot-password', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>忘記密碼 - MemeLaunch Tycoon</title>
        <script defer src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
        <style>
            /* Critical CSS - Load immediately to prevent flash */
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-out;
            }
            #page-loader.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Hide body content until loader is ready */</style>
    </head>
    <body class="gradient-bg text-white min-h-screen">
        <div class="min-h-screen flex items-center justify-center px-4 py-12">
            <div class="max-w-md w-full">
                <!-- Logo -->
                <div class="text-center mb-8">
                    <a href="/" class="inline-block">
                        <h1 class="text-3xl font-bold gradient-text">
                            <i class="fas fa-rocket"></i> MemeLaunch
                        </h1>
                    </a>
                    <p class="text-gray-400 mt-2">重置您的密碼</p>
                </div>

                <!-- Reset Form -->
                <div class="glass-effect rounded-2xl p-8">
                    <div class="text-center mb-6">
                        <div class="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4">
                            <i class="fas fa-key text-3xl text-orange-500"></i>
                        </div>
                        <h2 class="text-2xl font-bold">忘記密碼？</h2>
                        <p class="text-gray-400 mt-2 text-sm">別擔心！輸入您的郵箱，我們會發送重置連結給您</p>
                    </div>
                    
                    <form id="forgot-password-form" class="space-y-4">
                        <!-- Email -->
                        <div>
                            <label for="email" class="block text-sm font-medium mb-2">
                                <i class="fas fa-envelope mr-2"></i>電子郵箱
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white"
                                placeholder="your@email.com"
                            />
                            <p class="text-red-400 text-sm mt-1 hidden" id="email-error"></p>
                        </div>

                        <!-- Submit Button -->
                        <button
                            type="submit"
                            id="submit-btn"
                            class="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <i class="fas fa-paper-plane mr-2"></i>
                            <span id="submit-text">發送重置連結</span>
                        </button>

                        <!-- Form Message -->
                        <div id="form-message" class="hidden mt-4 p-4 rounded-lg"></div>
                    </form>

                    <!-- Back to Login -->
                    <div class="mt-6 text-center">
                        <a href="/login" class="text-sm text-gray-400 hover:text-orange-500 transition">
                            <i class="fas fa-arrow-left mr-2"></i>返回登入
                        </a>
                    </div>
                </div>
            </div>
        </div>

        
        
        
        <script src="/static/auth.js?v=20260221151619"></script>
    </body>
    </html>
  `);
});

// Reset Password page (with token)
app.get('/reset-password', (c) => {
  const token = c.req.query('token');
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>重置密碼 - MemeLaunch Tycoon</title>
        <script defer src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
        <style>
            /* Critical CSS - Load immediately to prevent flash */
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-out;
            }
            #page-loader.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Hide body content until loader is ready */</style>
    </head>
    <body class="gradient-bg text-white min-h-screen">
        <div class="min-h-screen flex items-center justify-center px-4 py-12">
            <div class="max-w-md w-full">
                <!-- Logo -->
                <div class="text-center mb-8">
                    <a href="/" class="inline-block">
                        <h1 class="text-3xl font-bold gradient-text">
                            <i class="fas fa-rocket"></i> MemeLaunch
                        </h1>
                    </a>
                    <p class="text-gray-400 mt-2">設置新密碼</p>
                </div>

                <!-- Reset Form -->
                <div class="glass-effect rounded-2xl p-8">
                    <h2 class="text-2xl font-bold mb-6 text-center">重置密碼</h2>
                    
                    <form id="reset-password-form" class="space-y-4" data-token="${token || ''}">
                        <!-- New Password -->
                        <div>
                            <label for="password" class="block text-sm font-medium mb-2">
                                <i class="fas fa-lock mr-2"></i>新密碼
                            </label>
                            <div class="relative">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white"
                                    placeholder="至少 8 個字符"
                                />
                                <button
                                    type="button"
                                    id="toggle-password"
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <!-- Password Strength Indicator -->
                            <div class="mt-2">
                                <div class="flex gap-1 mb-1">
                                    <div class="h-1 flex-1 rounded bg-white/10" id="strength-1"></div>
                                    <div class="h-1 flex-1 rounded bg-white/10" id="strength-2"></div>
                                    <div class="h-1 flex-1 rounded bg-white/10" id="strength-3"></div>
                                    <div class="h-1 flex-1 rounded bg-white/10" id="strength-4"></div>
                                </div>
                                <p class="text-xs text-gray-400" id="strength-text">密碼強度：請輸入密碼</p>
                            </div>
                            <p class="text-red-400 text-sm mt-1 hidden" id="password-error"></p>
                        </div>

                        <!-- Confirm Password -->
                        <div>
                            <label for="confirm-password" class="block text-sm font-medium mb-2">
                                <i class="fas fa-lock mr-2"></i>確認新密碼
                            </label>
                            <input
                                type="password"
                                id="confirm-password"
                                name="confirm-password"
                                required
                                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white"
                                placeholder="再次輸入密碼"
                            />
                            <p class="text-red-400 text-sm mt-1 hidden" id="confirm-password-error"></p>
                        </div>

                        <!-- Submit Button -->
                        <button
                            type="submit"
                            id="submit-btn"
                            class="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <i class="fas fa-check mr-2"></i>
                            <span id="submit-text">重置密碼</span>
                        </button>

                        <!-- Form Message -->
                        <div id="form-message" class="hidden mt-4 p-4 rounded-lg"></div>
                    </form>
                </div>
            </div>
        </div>

        
        
        
        <script src="/static/auth.js?v=20260221151619"></script>
    </body>
    </html>
  `);
});

// Coin Detail page
app.get('/coin/:id', (c) => {
  const coinId = c.req.param('id');
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>幣種詳情 - MemeLaunch Tycoon</title>
        <script defer src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
        <style>
            /* Critical CSS - Load immediately to prevent flash */
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-out;
            }
            #page-loader.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Hide body content until loader is ready */</style>
    </head>
    <body class="gradient-bg text-white min-h-screen">
        <!-- Page Loader -->
        <div id="page-loader">
            <div class="loader-spinner"></div>
        </div>

        <!-- Navigation -->
        <nav class="glass-effect sticky top-0 z-50">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <a href="/" class="flex items-center space-x-2">
                        <i class="fas fa-rocket text-2xl text-orange-500"></i>
                        <span class="text-xl font-bold">MemeLaunch</span>
                    </a>
                    <div class="hidden md:flex items-center space-x-6">
                        <a href="/dashboard" class="hover:text-orange-500 transition">儀表板</a>
                        <a href="/market" class="hover:text-orange-500 transition">市場</a>
                        <a href="/portfolio" class="hover:text-orange-500 transition">投資組合</a>
                        <a href="/achievements" class="hover:text-orange-500 transition">成就</a>
                        <a href="/leaderboard" class="hover:text-orange-500 transition">排行榜</a>
                        <a href="/social" class="hover:text-orange-500 transition">社交</a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <!-- Virtual Balance (Gold Coins) -->
                        <div class="glass-effect px-4 py-2 rounded-lg">
                            <i class="fas fa-coins text-yellow-500 mr-2"></i>
                            <span id="user-balance">--</span> 金幣
                        </div>
                        <!-- MLT Balance -->
                        <div class="glass-effect px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20">
                            <img src="/static/mlt-token.png" class="inline-block w-5 h-5 mr-2" alt="MLT" loading="lazy" decoding="async" />
                            <span id="user-mlt-balance" class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">--</span>
                            <span class="text-xs text-gray-400 ml-1">MLT</span>
                        </div>
                        <button id="logout-btn" class="px-4 py-2 rounded-lg glass-effect hover:bg-white/10 transition">
                            登出
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            <!-- Back Button -->
            <div class="mb-6">
                <a href="/market" class="inline-flex items-center text-gray-400 hover:text-white transition">
                    <i class="fas fa-arrow-left mr-2"></i>返回市場
                </a>
            </div>

            <!-- Loading State -->
            <div id="loading-state" class="text-center py-20">
                <i class="fas fa-spinner fa-spin text-6xl text-orange-500 mb-4"></i>
                <p class="text-xl text-gray-400">載入中...</p>
            </div>

            <!-- Coin Content (Hidden initially) -->
            <div id="coin-content" class="hidden">
                <!-- Coin Header -->
                <div class="glass-effect rounded-2xl p-8 mb-8">
                    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div class="flex items-center space-x-6">
                            <img id="coin-image" class="w-24 h-24 rounded-full" loading="lazy" decoding="async" />
                            <div>
                                <h1 id="coin-name" class="text-4xl font-bold mb-2">--</h1>
                                <p id="coin-symbol" class="text-2xl text-orange-500">$--</p>
                                <p class="text-sm text-gray-400 mt-2">
                                    <i class="fas fa-user mr-1"></i>
                                    創建者: <span id="coin-creator">--</span>
                                </p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-400 mb-1">當前價格</p>
                            <p id="coin-price" class="text-5xl font-bold">--</p>
                            <p id="coin-price-change" class="text-lg mt-2">--</p>
                        </div>
                    </div>
                </div>

                <div class="grid lg:grid-cols-3 gap-8">
                    <!-- Left Column - Chart & Stats -->
                    <div class="lg:col-span-2 space-y-8">
                        <!-- Price Chart -->
                        <div class="glass-effect rounded-2xl p-6">
                            <h2 class="text-2xl font-bold mb-6">
                                <i class="fas fa-chart-line mr-2"></i>價格走勢
                            </h2>
                            <div class="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div class="flex flex-wrap gap-2">
                                    <button class="timeframe-btn active bg-orange-500 px-4 py-2 rounded-lg transition hover:bg-orange-600" data-timeframe="1m">1分鐘</button>
                                    <button class="timeframe-btn px-4 py-2 rounded-lg transition bg-white/10 hover:bg-white/20" data-timeframe="10m">10分鐘</button>
                                    <button class="timeframe-btn px-4 py-2 rounded-lg transition bg-white/10 hover:bg-white/20" data-timeframe="1h">1小時</button>
                                    <button class="timeframe-btn px-4 py-2 rounded-lg transition bg-white/10 hover:bg-white/20" data-timeframe="24h">24小時</button>
                                    <!-- Manual Refresh Button -->
                                    <button id="refresh-chart-btn" class="px-4 py-2 rounded-lg transition bg-blue-500 hover:bg-blue-600 ml-2" title="手動刷新圖表">
                                        <i class="fas fa-sync-alt"></i>
                                    </button>
                                </div>
                                <!-- OHLC Data Display -->
                                <div id="ohlc-data" class="hidden md:flex flex-wrap gap-x-4 gap-y-2 text-sm">
                                    <div class="flex items-center space-x-1">
                                        <span class="text-gray-400">O:</span>
                                        <span id="ohlc-open" class="font-mono text-white">--</span>
                                    </div>
                                    <div class="flex items-center space-x-1">
                                        <span class="text-gray-400">H:</span>
                                        <span id="ohlc-high" class="font-mono text-green-400">--</span>
                                    </div>
                                    <div class="flex items-center space-x-1">
                                        <span class="text-gray-400">L:</span>
                                        <span id="ohlc-low" class="font-mono text-red-400">--</span>
                                    </div>
                                    <div class="flex items-center space-x-1">
                                        <span class="text-gray-400">C:</span>
                                        <span id="ohlc-close" class="font-mono text-white">--</span>
                                    </div>
                                    <div class="flex items-center space-x-1">
                                        <span class="text-gray-400">V:</span>
                                        <span id="ohlc-volume" class="font-mono text-orange-400">--</span>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gray-900/50 rounded-lg p-2">
                                <div id="price-chart" class="w-full" style="height: 400px;"></div>
                            </div>
                            <div class="bg-gray-900/50 rounded-lg p-2 mt-2">
                                <div id="volume-chart" class="w-full" style="height: 100px;"></div>
                            </div>
                        </div>

                        <!-- Stats Grid -->
                        <div class="grid md:grid-cols-4 gap-4">
                            <div class="glass-effect rounded-xl p-4">
                                <p class="text-sm text-gray-400 mb-1">市值</p>
                                <p id="stat-market-cap" class="text-2xl font-bold">--</p>
                            </div>
                            <div class="glass-effect rounded-xl p-4">
                                <p class="text-sm text-gray-400 mb-1">供應量</p>
                                <p id="stat-supply" class="text-2xl font-bold">--</p>
                            </div>
                            <div class="glass-effect rounded-xl p-4">
                                <p class="text-sm text-gray-400 mb-1">持有人</p>
                                <p id="stat-holders" class="text-2xl font-bold">--</p>
                            </div>
                            <div class="glass-effect rounded-xl p-4">
                                <p class="text-sm text-gray-400 mb-1">交易數</p>
                                <p id="stat-transactions" class="text-2xl font-bold">--</p>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="glass-effect rounded-2xl p-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-info-circle mr-2"></i>關於
                            </h2>
                            <p id="coin-description" class="text-gray-300">--</p>
                        </div>

                        <!-- Recent Transactions -->
                        <div class="glass-effect rounded-2xl p-6">
                            <h2 class="text-2xl font-bold mb-6">
                                <i class="fas fa-history mr-2"></i>最近交易
                            </h2>
                            <div id="recent-transactions" class="space-y-3">
                                <!-- Transactions will be loaded here -->
                            </div>
                        </div>
                        
                        <!-- Comments Section -->
                        <div id="comments-section" class="mt-8">
                            <!-- Comments will be loaded by CommentsSystem -->
                        </div>
                    </div>

                    <!-- Right Column - Trading & Info -->
                    <div class="space-y-6">
                        <!-- Enhanced Bonding Curve Panel -->
                        <div class="glass-effect rounded-2xl p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-xl font-bold text-white">
                                    <i class="fas fa-chart-line mr-2 text-orange-500"></i>Bonding Curve 進度
                                </h3>
                                <span id="curve-progress-percent" class="text-2xl font-bold text-orange-400">0%</span>
                            </div>
                            
                            <!-- Progress Bar -->
                            <div class="relative h-8 bg-gray-800 rounded-full overflow-hidden mb-4">
                                <div id="curve-progress-bar" class="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500" style="width: 0%"></div>
                                <div class="absolute inset-0 flex items-center justify-between px-4 text-xs font-bold text-white">
                                    <span>0%</span>
                                    <span>25%</span>
                                    <span>50%</span>
                                    <span>75%</span>
                                    <span>100% 🎓</span>
                                </div>
                            </div>
                            
                            <!-- Price Milestones -->
                            <div class="grid grid-cols-5 gap-2 text-xs">
                                <div class="text-center">
                                    <div class="text-gray-400">初始</div>
                                    <div id="price-0" class="font-mono text-white">0.002</div>
                                    <div class="text-gray-500">1.00×</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-gray-400">25%</div>
                                    <div id="price-25" class="font-mono text-white">0.005</div>
                                    <div class="text-gray-500">2.72×</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-gray-400">50%</div>
                                    <div id="price-50" class="font-mono text-white">0.015</div>
                                    <div class="text-gray-500">7.39×</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-gray-400">75%</div>
                                    <div id="price-75" class="font-mono text-white">0.040</div>
                                    <div class="text-gray-500">20.09×</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-gray-400">畢業</div>
                                    <div id="price-100" class="font-mono text-white">0.109</div>
                                    <div class="text-green-400">54.60×</div>
                                </div>
                            </div>
                            
                            <!-- Destiny Status -->
                            <div id="destiny-status" class="mt-4 p-3 rounded-lg border bg-gray-500/20 border-gray-500/30">
                                <div class="flex items-center space-x-2">
                                    <i id="destiny-icon" class="fas fa-question-circle text-gray-400"></i>
                                    <span id="destiny-text" class="text-gray-300">命運未知...</span>
                                </div>
                            </div>
                        </div>

                        <!-- AI Activity Panel -->
                        <div class="glass-effect rounded-2xl p-6">
                            <h3 class="text-xl font-bold text-white mb-4">
                                <i class="fas fa-robot mr-2 text-purple-500"></i>AI 交易活動
                            </h3>
                            
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div class="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-sm text-gray-300">
                                            <i class="fas fa-robot mr-1"></i>AI 交易
                                        </span>
                                        <span id="ai-trade-count" class="text-xl font-bold text-purple-400">0</span>
                                    </div>
                                    <div class="text-xs text-gray-400">自動市場做市商</div>
                                </div>
                                
                                <div class="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-sm text-gray-300">
                                            <i class="fas fa-user mr-1"></i>真實交易
                                        </span>
                                        <span id="real-trade-count" class="text-xl font-bold text-green-400">0</span>
                                    </div>
                                    <div class="text-xs text-gray-400">
                                        <span id="unique-traders">0</span> 位獨立交易者
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                                <span class="text-sm text-gray-300">AI 系統狀態</span>
                                <div id="ai-status" class="flex items-center space-x-2">
                                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span class="text-sm text-green-400 font-bold">運行中</span>
                                </div>
                            </div>
                        </div>

                        <!-- Event Timeline -->
                        <div class="glass-effect rounded-2xl p-6">
                            <h3 class="text-xl font-bold text-white mb-4">
                                <i class="fas fa-history mr-2 text-blue-500"></i>事件時間線
                            </h3>
                            
                            <div id="event-timeline" class="space-y-3 max-h-96 overflow-y-auto">
                                <p class="text-gray-400 text-center py-4">載入中...</p>
                            </div>
                        </div>

                        <!-- Trading Panel -->
                        <div class="glass-effect rounded-2xl p-6">
                            <!-- Simple Bonding Curve Progress (Keep for compatibility) -->
                            <div class="mb-6 p-4 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-xl border border-orange-500/30">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-sm font-bold">
                                        <i class="fas fa-chart-line mr-1"></i>
                                        Bonding Curve 進度
                                    </span>
                                    <span id="bonding-progress-percent" class="text-sm font-bold text-orange-500">0%</span>
                                </div>
                                <div class="relative h-3 bg-black/30 rounded-full overflow-hidden">
                                    <div id="bonding-progress-bar" class="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full transition-all duration-300" style="width: 0%"></div>
                                </div>
                                <div class="flex justify-between mt-2 text-xs text-gray-400">
                                    <span><span id="bonding-circulating">0</span> / <span id="bonding-total">0</span></span>
                                    <span id="bonding-remaining">剩餘 0</span>
                                </div>
                            </div>
                            
                            <h2 class="text-2xl font-bold mb-6">
                                <i class="fas fa-exchange-alt mr-2"></i>交易
                            </h2>

                            <!-- Buy/Sell Tabs -->
                            <div class="flex mb-6 bg-black/30 rounded-lg p-1">
                                <button id="buy-tab" class="flex-1 py-2 rounded-lg bg-green-500 transition font-bold">
                                    買入
                                </button>
                                <button id="sell-tab" class="flex-1 py-2 rounded-lg hover:bg-white/10 transition font-bold">
                                    賣出
                                </button>
                            </div>

                            <!-- Buy Panel -->
                            <div id="buy-panel">
                                <!-- Amount Slider -->
                                <div class="mb-4">
                                    <div class="flex justify-between items-center mb-2">
                                        <label class="block text-sm font-medium">購買數量</label>
                                        <span class="text-sm text-orange-500 font-bold" id="buy-amount-display">100</span>
                                    </div>
                                    <input
                                        type="range"
                                        id="buy-amount-slider"
                                        min="1"
                                        max="1000"
                                        value="100"
                                        class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-orange mb-2"
                                    />
                                    <input
                                        type="number"
                                        id="buy-amount"
                                        min="1"
                                        value="100"
                                        class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-white"
                                        placeholder="輸入數量..."
                                    />
                                </div>
                                
                                <!-- Quick Presets -->
                                <div class="mb-4 grid grid-cols-5 gap-2">
                                    <button class="buy-preset px-3 py-2 bg-white/10 hover:bg-orange-500 rounded-lg text-sm font-bold transition" data-value="10">
                                        10
                                    </button>
                                    <button class="buy-preset px-3 py-2 bg-white/10 hover:bg-orange-500 rounded-lg text-sm font-bold transition" data-value="50">
                                        50
                                    </button>
                                    <button class="buy-preset px-3 py-2 bg-white/10 hover:bg-orange-500 rounded-lg text-sm font-bold transition" data-value="100">
                                        100
                                    </button>
                                    <button class="buy-preset px-3 py-2 bg-white/10 hover:bg-orange-500 rounded-lg text-sm font-bold transition" data-value="500">
                                        500
                                    </button>
                                    <button id="buy-max-btn" class="px-3 py-2 bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 rounded-lg text-sm font-bold transition">
                                        最大
                                    </button>
                                </div>
                                
                                <div class="mb-4 p-4 bg-white/5 rounded-lg space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">單價:</span>
                                        <span id="buy-price-per-coin" class="font-bold">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">小計:</span>
                                        <span id="buy-subtotal" class="font-bold">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">手續費 (1%):</span>
                                        <span id="buy-fee" class="font-bold">--</span>
                                    </div>
                                    <div class="flex justify-between border-t border-white/10 pt-2">
                                        <span class="text-gray-300 font-bold">總計:</span>
                                        <span id="buy-total" class="font-bold text-lg text-green-500">--</span>
                                    </div>
                                </div>
                                
                                <div id="buy-warning" class="hidden mb-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-300"></div>
                                
                                <button id="buy-button" class="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg font-bold transition transform hover:scale-105">
                                    <i class="fas fa-arrow-up mr-2"></i>
                                    立即買入
                                </button>
                            </div>

                            <!-- Sell Panel -->
                            <div id="sell-panel" class="hidden">
                                <!-- Amount Slider -->
                                <div class="mb-4">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-sm font-medium">賣出數量</span>
                                        <span class="text-sm text-gray-400">持有: <span id="holdings-amount">0</span> <span id="holdings-symbol">--</span></span>
                                    </div>
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-sm text-red-500 font-bold" id="sell-amount-display">10</span>
                                        <span class="text-xs text-gray-400" id="sell-percentage-display">0%</span>
                                    </div>
                                    <input
                                        type="range"
                                        id="sell-amount-slider"
                                        min="0"
                                        max="100"
                                        value="10"
                                        class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-red mb-2"
                                    />
                                    <input
                                        type="number"
                                        id="sell-amount"
                                        min="1"
                                        value="10"
                                        class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-white"
                                        placeholder="輸入數量..."
                                    />
                                </div>
                                
                                <!-- Quick Presets (Percentage) -->
                                <div class="mb-4 grid grid-cols-5 gap-2">
                                    <button class="sell-preset px-3 py-2 bg-white/10 hover:bg-red-500 rounded-lg text-sm font-bold transition" data-percent="25">
                                        25%
                                    </button>
                                    <button class="sell-preset px-3 py-2 bg-white/10 hover:bg-red-500 rounded-lg text-sm font-bold transition" data-percent="50">
                                        50%
                                    </button>
                                    <button class="sell-preset px-3 py-2 bg-white/10 hover:bg-red-500 rounded-lg text-sm font-bold transition" data-percent="75">
                                        75%
                                    </button>
                                    <button class="sell-preset px-3 py-2 bg-white/10 hover:bg-red-500 rounded-lg text-sm font-bold transition" data-percent="100">
                                        100%
                                    </button>
                                    <button id="sell-max-btn" class="px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg text-sm font-bold transition">
                                        全部
                                    </button>
                                </div>
                                
                                <div class="mb-4 p-4 bg-white/5 rounded-lg space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">單價:</span>
                                        <span id="sell-price-per-coin" class="font-bold">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">小計:</span>
                                        <span id="sell-subtotal" class="font-bold">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">手續費 (1%):</span>
                                        <span id="sell-fee" class="font-bold">--</span>
                                    </div>
                                    <div class="flex justify-between border-t border-white/10 pt-2">
                                        <span class="text-gray-300 font-bold">收益:</span>
                                        <span id="sell-total" class="font-bold text-lg text-red-500">--</span>
                                    </div>
                                </div>
                                
                                <!-- Holdings Info -->
                                <div id="holdings-info" class="hidden mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">持倉價值:</span>
                                        <span id="holdings-value" class="font-bold text-blue-300">--</span>
                                    </div>
                                </div>
                                
                                <div id="sell-warning" class="hidden mb-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-300"></div>
                                
                                <button id="sell-button" class="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg font-bold transition transform hover:scale-105">
                                    <i class="fas fa-arrow-down mr-2"></i>
                                    立即賣出
                                </button>
                            </div>

                            <!-- Message Area -->
                            <div id="trade-message" class="mt-4 hidden p-4 rounded-lg"></div>
                        </div>

                        <!-- Hype Score -->
                        <div class="glass-effect rounded-2xl p-6">
                            <h3 class="text-xl font-bold mb-4">
                                <i class="fas fa-fire text-orange-500 mr-2"></i>Hype 分數
                            </h3>
                            <div class="text-center mb-4">
                                <div id="hype-score" class="text-5xl font-bold gradient-text">--</div>
                                <p class="text-sm text-gray-400 mt-1">滿分 200</p>
                            </div>
                            <div class="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                <div id="hype-bar" class="h-full bg-gradient-to-r from-orange-500 to-pink-500" style="width: 0%"></div>
                            </div>
                        </div>

                        <!-- Share -->
                        <div class="glass-effect rounded-2xl p-6">
                            <h3 class="text-xl font-bold mb-4">
                                <i class="fas fa-share-alt mr-2"></i>分享
                            </h3>
                            <div class="flex space-x-3">
                                <button id="share-twitter" class="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-bold transition">
                                    <i class="fab fa-twitter mr-2"></i>Twitter
                                </button>
                                <button id="copy-link" class="flex-1 px-4 py-3 glass-effect hover:bg-white/10 rounded-lg font-bold transition">
                                    <i class="fas fa-link mr-2"></i>複製連結
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        
        
        
        <script src="https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js"></script>
        <script>
          const COIN_ID = '${coinId}';
        </script>
        <script src="/static/chart-lightweight.js?v=20260221151619"></script>
        <script src="/static/trading-panel.js?v=20260221151619"></script>
        <script src="/static/comments-simple.js?v=20260221151619"></script>
        <script src="/static/websocket-service.js?v=20260221151619"></script>
        <!-- Core utilities -->
        <script src="/static/fetch-utils.js?v=20260221151619"></script>
        
        <!-- Real-time updates -->
        <script src="/static/realtime-service.js?v=20260221151619"></script>
        <script src="/static/realtime.js?v=20260221151619"></script>
        
        <!-- Coin detail functionality -->
        <script src="/static/fetch-utils.js?v=20260221151619"></script>
        <script>
            document.addEventListener(\'DOMContentLoaded\', function() {
                // Hide page loader after assets loaded
                if (typeof fetchUtils !== \'undefined\' && fetchUtils.hidePageLoader) {
                    fetchUtils.hidePageLoader();
                }
            });
        </script>
        <script src="/static/coin-detail.js?v=20260221151619"></script>
    </body>
    </html>
  `);
});

// Market page
app.get('/market', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>市場 - MemeLaunch Tycoon</title>
        <script defer src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
        <style>
          #page-loader{position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#0A0B0D 0%,#1A1B1F 50%,#0A0B0D 100%);display:flex;align-items:center;justify-content:center;z-index:9999;transition:opacity .3s}.loader-spinner{width:50px;height:50px;border:4px solid rgba(255,107,53,.2);border-top-color:#FF6B35;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}#page-loader.hidden{opacity:0;pointer-events:none}
        </style>
        <style>
            /* Critical CSS - Load immediately to prevent flash */
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-out;
            }
            #page-loader.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Hide body content until loader is ready */</style>
    </head>
    <body class="gradient-bg text-white min-h-screen">
        <div id="page-loader"><div class="loader-spinner"></div></div>
        <!-- Navigation -->
        <nav class="glass-effect sticky top-0 z-50">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <a href="/" class="flex items-center space-x-2">
                        <i class="fas fa-rocket text-2xl text-orange-500"></i>
                        <span class="text-xl font-bold">MemeLaunch</span>
                    </a>
                    <div class="hidden md:flex items-center space-x-6">
                        <a href="/dashboard" class="hover:text-orange-500 transition">儀表板</a>
                        <a href="/market" class="text-orange-500 font-bold">市場</a>
                        <a href="/portfolio" class="hover:text-orange-500 transition">投資組合</a>
                        <a href="/achievements" class="hover:text-orange-500 transition">成就</a>
                        <a href="/leaderboard" class="hover:text-orange-500 transition">排行榜</a>
                        <a href="/social" class="hover:text-orange-500 transition">社交</a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <!-- Virtual Balance (Gold Coins) -->
                        <div class="glass-effect px-4 py-2 rounded-lg">
                            <i class="fas fa-coins text-yellow-500 mr-2"></i>
                            <span id="user-balance">--</span> 金幣
                        </div>
                        <!-- MLT Balance -->
                        <div class="glass-effect px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20">
                            <img src="/static/mlt-token.png" class="inline-block w-5 h-5 mr-2" alt="MLT" loading="lazy" decoding="async" />
                            <span id="user-mlt-balance" class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">--</span>
                            <span class="text-xs text-gray-400 ml-1">MLT</span>
                        </div>
                        <button id="logout-btn" class="px-4 py-2 rounded-lg glass-effect hover:bg-white/10 transition">
                            登出
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            <!-- Back Button -->
            <div class="mb-6">
                <a href="/dashboard" class="inline-flex items-center px-4 py-2 rounded-lg glass-effect hover:bg-white/10 transition">
                    <i class="fas fa-arrow-left mr-2"></i>
                    返回儀表板
                </a>
            </div>
            
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-4xl font-bold mb-2">
                    <i class="fas fa-store mr-3"></i>Meme 幣市場
                </h1>
                <p class="text-gray-400">探索、交易數千種 Meme 幣</p>
            </div>

            <!-- Search and Filters -->
            <div class="glass-effect rounded-2xl p-6 mb-8">
                <div class="grid md:grid-cols-5 gap-4">
                    <!-- Search Bar -->
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium mb-2">
                            <i class="fas fa-search mr-2"></i>搜索
                        </label>
                        <input
                            type="text"
                            id="search-input"
                            placeholder="搜索幣種名稱或符號..."
                            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white"
                        />
                    </div>

                    <!-- Sort By -->
                    <div>
                        <label class="block text-sm font-medium mb-2">
                            <i class="fas fa-sort mr-2"></i>排序
                        </label>
                        <select
                            id="sort-select"
                            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white"
                        >
                            <option value="created_at_desc">最新創建</option>
                            <option value="created_at_asc">最早創建</option>
                            <option value="bonding_curve_progress_desc">🚀 進度最高</option>
                            <option value="bonding_curve_progress_asc">🐣 進度最低</option>
                            <option value="real_trade_count_desc">👤 真實交易最多</option>
                            <option value="current_price_desc">價格最高</option>
                            <option value="current_price_asc">價格最低</option>
                            <option value="market_cap_desc">市值最高</option>
                            <option value="market_cap_asc">市值最低</option>
                            <option value="hype_score_desc">最熱門</option>
                            <option value="transaction_count_desc">交易最多</option>
                        </select>
                    </div>

                    <!-- Destiny Filter -->
                    <div>
                        <label class="block text-sm font-medium mb-2">
                            <i class="fas fa-shield-alt mr-2"></i>命運
                        </label>
                        <select
                            id="destiny-filter"
                            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white"
                        >
                            <option value="">全部</option>
                            <option value="SURVIVAL">🛡️ 生存</option>
                            <option value="EARLY_DEATH">💀 高風險</option>
                            <option value="LATE_DEATH">⏳ 中風險</option>
                            <option value="GRADUATION">🎓 畢業</option>
                            <option value="RUG_PULL">⚠️ Rug</option>
                        </select>
                    </div>

                    <!-- Filter Button -->
                    <div class="flex items-end">
                        <button id="apply-filters-btn" class="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-lg font-bold transition">
                            <i class="fas fa-filter mr-2"></i>應用篩選
                        </button>
                    </div>
                </div>
            </div>

            <!-- Stats Bar -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div class="glass-effect rounded-xl p-4 text-center">
                    <i class="fas fa-coins text-3xl text-yellow-500 mb-2"></i>
                    <p class="text-2xl font-bold" id="total-coins">--</p>
                    <p class="text-sm text-gray-400">總幣種數</p>
                </div>
                <div class="glass-effect rounded-xl p-4 text-center">
                    <i class="fas fa-chart-line text-3xl text-green-500 mb-2"></i>
                    <p class="text-2xl font-bold" id="total-volume">--</p>
                    <p class="text-sm text-gray-400">24h 交易量</p>
                </div>
                <div class="glass-effect rounded-xl p-4 text-center">
                    <i class="fas fa-users text-3xl text-blue-500 mb-2"></i>
                    <p class="text-2xl font-bold" id="total-holders">--</p>
                    <p class="text-sm text-gray-400">持有人數</p>
                </div>
                <div class="glass-effect rounded-xl p-4 text-center">
                    <i class="fas fa-fire text-3xl text-orange-500 mb-2"></i>
                    <p class="text-2xl font-bold" id="trending-count">--</p>
                    <p class="text-sm text-gray-400">熱門幣種</p>
                </div>
            </div>

            <!-- Coins Grid -->
            <div id="coins-container">
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6" id="coins-grid">
                    <!-- Loading State -->
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-spinner fa-spin text-5xl text-orange-500 mb-4"></i>
                        <p class="text-xl text-gray-400">載入中...</p>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div class="mt-8 flex justify-center">
                <div class="glass-effect rounded-xl p-4 inline-flex items-center space-x-4">
                    <button id="prev-page-btn" class="px-4 py-2 rounded-lg hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <i class="fas fa-chevron-left mr-2"></i>上一頁
                    </button>
                    <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-400">第</span>
                        <span id="current-page" class="font-bold">1</span>
                        <span class="text-sm text-gray-400">/ </span>
                        <span id="total-pages" class="font-bold">1</span>
                        <span class="text-sm text-gray-400">頁</span>
                    </div>
                    <button id="next-page-btn" class="px-4 py-2 rounded-lg hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        下一頁<i class="fas fa-chevron-right ml-2"></i>
                    </button>
                </div>
            </div>

            <!-- Empty State -->
            <div id="empty-state" class="hidden text-center py-20">
                <i class="fas fa-search text-6xl text-gray-600 mb-4"></i>
                <p class="text-xl text-gray-400 mb-2">找不到符合條件的幣種</p>
                <p class="text-gray-500">試試調整搜索或篩選條件</p>
            </div>
        </div>

        
        
        
        <script src="/static/fetch-utils.js?v=20260221151619"></script>
        <script src="/static/websocket-service.js?v=20260221151619"></script>
        <script src="/static/realtime-service.js?v=20260221151619"></script>
        <script src="/static/market.js?v=20260221151619"></script>
    </body>
    </html>
  `);
});

// Create Coin page
app.get('/create', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>創建模因幣 - MemeLaunch Tycoon</title>
        <script defer src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
        <style>
            /* Critical CSS - Load immediately to prevent flash */
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-out;
            }
            #page-loader.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Hide body content until loader is ready */</style>
    </head>
    <body class="gradient-bg text-white min-h-screen">
        <!-- Loading overlay -->
        <div id="page-loader">
            <div class="loader-spinner"></div>
        </div>
        
        <!-- Navigation -->
        <nav class="glass-effect sticky top-0 z-50">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <a href="/" class="flex items-center space-x-2">
                        <i class="fas fa-rocket text-2xl text-orange-500"></i>
                        <span class="text-xl font-bold">MemeLaunch</span>
                    </a>
                    <div class="flex items-center space-x-6">
                        <a href="/dashboard" class="hover:text-orange-500 transition">儀表板</a>
                        <a href="/market" class="hover:text-orange-500 transition">市場</a>
                        <a href="/portfolio" class="hover:text-orange-500 transition">投資組合</a>
                        <a href="/achievements" class="hover:text-orange-500 transition">成就</a>
                        <a href="/leaderboard" class="hover:text-orange-500 transition">排行榜</a>
                        <a href="/social" class="hover:text-orange-500 transition">社交</a>
                        
                        <!-- MLT Balance -->
                        <div class="glass-effect px-4 py-2 rounded-lg border border-orange-500/30">
                            <img src="/static/mlt-token.png" alt="MLT" class="w-5 h-5 inline-block mr-2" loading="lazy" decoding="async">
                            <span id="nav-mlt-balance" class="font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">--</span>
                            <span class="text-xs text-gray-400">MLT</span>
                        </div>
                        
                        <!-- Virtual Balance -->
                        <div class="glass-effect px-4 py-2 rounded-lg">
                            <i class="fas fa-coins text-yellow-500 mr-2"></i>
                            <span id="user-balance">--</span> 金幣
                        </div>
                        <button id="logout-btn" class="px-4 py-2 rounded-lg glass-effect hover:bg-white/10 transition">
                            登出
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            <!-- Progress Steps -->
            <div class="max-w-4xl mx-auto mb-8">
                <div class="flex items-center justify-center space-x-4">
                    <div id="step-indicator-1" class="step-indicator active">
                        <div class="step-number">1</div>
                        <div class="step-label">選擇圖片</div>
                    </div>
                    <div class="step-line"></div>
                    <div id="step-indicator-2" class="step-indicator">
                        <div class="step-number">2</div>
                        <div class="step-label">設置詳情</div>
                    </div>
                    <div class="step-line"></div>
                    <div id="step-indicator-3" class="step-indicator">
                        <div class="step-number">3</div>
                        <div class="step-label">預覽發射</div>
                    </div>
                </div>
            </div>

            <!-- Step 1: Upload/Select Image -->
            <div id="step-1" class="step-content">
                <div class="max-w-3xl mx-auto glass-effect rounded-2xl p-8">
                    <h2 class="text-3xl font-bold mb-6 text-center">
                        <i class="fas fa-image mr-2"></i>選擇您的 Meme 圖片
                    </h2>
                    <p class="text-gray-400 text-center mb-8">上傳自定義圖片或選擇模板</p>

                    <!-- Upload Area -->
                    <div class="mb-8">
                        <div id="upload-area" class="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center hover:border-orange-500 transition cursor-pointer">
                            <div id="upload-prompt">
                                <i class="fas fa-cloud-upload-alt text-6xl text-gray-500 mb-4"></i>
                                <p class="text-xl mb-2">拖放圖片到這裡</p>
                                <p class="text-gray-400 mb-4">或</p>
                                <button class="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition font-bold">
                                    <i class="fas fa-folder-open mr-2"></i>選擇文件
                                </button>
                                <p class="text-sm text-gray-500 mt-4">支持 JPG, PNG, GIF (最大 5MB)</p>
                            </div>
                            <div id="upload-preview" class="hidden">
                                <img id="preview-image" class="max-w-full max-h-96 mx-auto rounded-lg" loading="lazy" decoding="async" />
                                <button id="change-image" class="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition">
                                    <i class="fas fa-sync-alt mr-2"></i>更換圖片
                                </button>
                            </div>
                        </div>
                        <input type="file" id="image-upload" accept="image/*" class="hidden" />
                    </div>

                    <!-- Templates -->
                    <div>
                        <h3 class="text-xl font-bold mb-4">
                            <i class="fas fa-images mr-2"></i>或選擇模板
                        </h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4" id="template-grid">
                            <!-- Templates will be loaded dynamically -->
                        </div>
                    </div>

                    <!-- Navigation -->
                    <div class="flex justify-end mt-8">
                        <button id="step-1-next" class="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                            下一步 <i class="fas fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Step 2: Coin Details -->
            <div id="step-2" class="step-content hidden">
                <div class="max-w-3xl mx-auto glass-effect rounded-2xl p-8">
                    <h2 class="text-3xl font-bold mb-6 text-center">
                        <i class="fas fa-edit mr-2"></i>設置幣種詳情
                    </h2>

                    <!-- MLT Cost Warning -->
                    <div class="mb-6 p-4 rounded-lg bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/30">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <img src="/static/mlt-token.png" alt="MLT" class="w-10 h-10" loading="lazy" decoding="async">
                                <div>
                                    <p class="text-sm text-gray-300">創幣成本</p>
                                    <p class="text-2xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                                        1,800 MLT
                                    </p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-gray-300">您的餘額</p>
                                <p id="create-mlt-balance" class="text-xl font-bold text-white">-- MLT</p>
                                <p id="create-remaining-balance" class="text-xs text-gray-400 mt-1">創幣後剩餘: -- MLT</p>
                            </div>
                        </div>
                        <div id="insufficient-mlt-warning" class="hidden mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                            <p class="text-sm text-red-300">
                                <i class="fas fa-exclamation-triangle mr-2"></i>
                                MLT 餘額不足！需要至少 1,800 MLT 才能創建幣種。
                            </p>
                        </div>
                    </div>

                    <form id="coin-details-form" class="space-y-6">
                        <!-- Coin Name -->
                        <div>
                            <label for="coin-name" class="block text-sm font-medium mb-2">
                                <i class="fas fa-tag mr-2"></i>幣種名稱 <span class="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                id="coin-name"
                                name="coin-name"
                                required
                                minlength="3"
                                maxlength="50"
                                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white"
                                placeholder="例如: Doge to the Moon"
                            />
                            <p class="text-sm text-gray-400 mt-1">3-50 個字符</p>
                            <p class="text-red-400 text-sm mt-1 hidden" id="coin-name-error"></p>
                        </div>

                        <!-- Coin Symbol -->
                        <div>
                            <label for="coin-symbol" class="block text-sm font-medium mb-2">
                                <i class="fas fa-dollar-sign mr-2"></i>幣種符號 <span class="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                id="coin-symbol"
                                name="coin-symbol"
                                required
                                minlength="2"
                                maxlength="10"
                                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white uppercase"
                                placeholder="例如: MOON"
                            />
                            <div class="flex items-center justify-between mt-1">
                                <p class="text-sm text-gray-400">2-10 個字符，大寫字母</p>
                                <div id="symbol-check" class="text-sm"></div>
                            </div>
                            <p class="text-red-400 text-sm mt-1 hidden" id="coin-symbol-error"></p>
                        </div>

                        <!-- Description -->
                        <div>
                            <label for="coin-description" class="block text-sm font-medium mb-2">
                                <i class="fas fa-align-left mr-2"></i>描述
                            </label>
                            <textarea
                                id="coin-description"
                                name="coin-description"
                                rows="4"
                                maxlength="500"
                                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white resize-none"
                                placeholder="為您的 meme 幣寫一個吸引人的描述..."
                            ></textarea>
                            <div class="flex justify-between text-sm text-gray-400 mt-1">
                                <span>可選</span>
                                <span><span id="desc-count">0</span>/500</span>
                            </div>
                        </div>

                        <!-- Social Links -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold flex items-center">
                                <i class="fas fa-share-alt mr-2 text-orange-500"></i>
                                社交連結
                                <span class="ml-2 text-sm text-gray-400 font-normal">(可選)</span>
                            </h3>
                            
                            <!-- Twitter -->
                            <div>
                                <label for="twitter-url" class="block text-sm font-medium mb-2">
                                    <i class="fab fa-twitter mr-2 text-blue-400"></i>Twitter
                                </label>
                                <input
                                    type="url"
                                    id="twitter-url"
                                    name="twitter-url"
                                    class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white"
                                    placeholder="https://twitter.com/your_handle"
                                />
                            </div>

                            <!-- Telegram -->
                            <div>
                                <label for="telegram-url" class="block text-sm font-medium mb-2">
                                    <i class="fab fa-telegram mr-2 text-blue-300"></i>Telegram
                                </label>
                                <input
                                    type="url"
                                    id="telegram-url"
                                    name="telegram-url"
                                    class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white"
                                    placeholder="https://t.me/your_group"
                                />
                            </div>

                            <!-- Website -->
                            <div>
                                <label for="website-url" class="block text-sm font-medium mb-2">
                                    <i class="fas fa-globe mr-2 text-green-400"></i>Website
                                </label>
                                <input
                                    type="url"
                                    id="website-url"
                                    name="website-url"
                                    class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white"
                                    placeholder="https://your-website.com"
                                />
                            </div>
                        </div>

                        <!-- Initial Supply -->
                        <div>
                            <label class="block text-sm font-medium mb-2">
                                <i class="fas fa-layer-group mr-2"></i>初始供應量 <span class="text-red-400">*</span>
                            </label>
                            <div class="grid grid-cols-2 gap-4">
                                <label class="supply-option">
                                    <input type="radio" name="supply" value="1000000" checked />
                                    <span class="option-label">
                                        <i class="fas fa-coins"></i>
                                        <span class="option-amount">1,000,000</span>
                                        <span class="option-desc">適合小型社群</span>
                                    </span>
                                </label>
                                <label class="supply-option">
                                    <input type="radio" name="supply" value="10000000" />
                                    <span class="option-label">
                                        <i class="fas fa-coins"></i>
                                        <span class="option-amount">10,000,000</span>
                                        <span class="option-desc">標準供應量</span>
                                    </span>
                                </label>
                                <label class="supply-option">
                                    <input type="radio" name="supply" value="100000000" />
                                    <span class="option-label">
                                        <i class="fas fa-coins"></i>
                                        <span class="option-amount">100,000,000</span>
                                        <span class="option-desc">大型項目</span>
                                    </span>
                                </label>
                                <label class="supply-option">
                                    <input type="radio" name="supply" value="1000000000" />
                                    <span class="option-label">
                                        <i class="fas fa-coins"></i>
                                        <span class="option-amount">1,000,000,000</span>
                                        <span class="option-desc">超大供應</span>
                                    </span>
                                </label>
                            </div>
                        </div>

                        <!-- MLT Investment Slider -->
                        <div class="mb-6">
                            <label class="block text-white mb-3">
                                <i class="fas fa-coins mr-2 text-orange-500"></i>初始 MLT 投資
                                <span class="text-gray-400 text-sm ml-2">(決定初始價格)</span>
                            </label>
                            <div class="flex items-center space-x-4">
                                <input 
                                    type="range" 
                                    id="mlt-investment-slider" 
                                    min="1800" 
                                    max="10000" 
                                    step="100" 
                                    value="2000" 
                                    class="flex-1 h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <div class="text-right min-w-[140px] p-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/30">
                                    <span id="mlt-investment-value" class="text-2xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">2,000</span>
                                    <span class="text-gray-400 ml-1 text-sm">MLT</span>
                                </div>
                            </div>
                            <div class="mt-2 flex justify-between text-xs text-gray-400">
                                <span>最低: 1,800 MLT</span>
                                <span>推薦: 2,000-5,000 MLT</span>
                                <span>最高: 10,000 MLT</span>
                            </div>
                            <div class="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <p class="text-xs text-blue-300">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    投資越高,初始價格越高,但代幣越稀有。適合高質量項目。
                                </p>
                            </div>
                        </div>

                        <!-- Pre-Purchase Amount -->
                        <div class="mb-6">
                            <label class="block text-white mb-3">
                                <i class="fas fa-shopping-cart mr-2 text-green-500"></i>預購數量
                                <span class="text-gray-400 text-sm ml-2">(強制購買,確保流動性)</span>
                            </label>
                            <div class="relative">
                                <input 
                                    type="number" 
                                    id="pre-purchase-amount" 
                                    min="0" 
                                    step="1000" 
                                    value="50000"
                                    class="w-full px-4 py-3 pr-24 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white text-lg font-mono"
                                    placeholder="50000"
                                />
                                <span class="absolute right-4 top-3 text-gray-400 font-bold">代幣</span>
                            </div>
                            <div class="mt-2 flex items-center justify-between text-sm">
                                <p class="text-gray-400">
                                    最小預購: <span id="min-pre-purchase" class="text-orange-400 font-bold">45,618</span> 代幣
                                    <span class="text-gray-500">(成本 100 MLT)</span>
                                </p>
                                <button 
                                    type="button" 
                                    id="set-min-prepurchase-btn" 
                                    class="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition"
                                >
                                    使用最小值
                                </button>
                            </div>
                            <div id="prepurchase-warning" class="hidden mt-3 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                                <p class="text-sm text-red-300">
                                    <i class="fas fa-exclamation-triangle mr-2"></i>
                                    預購數量不足!至少需要 <span id="prepurchase-warning-min">45,618</span> 代幣 (100 MLT 成本)。
                                </p>
                            </div>
                        </div>

                        <!-- Cost Calculation Summary -->
                        <div class="p-6 rounded-xl bg-gradient-to-br from-orange-500/10 via-purple-500/10 to-pink-500/10 border border-orange-500/30 backdrop-blur-sm">
                            <div class="flex items-center justify-between mb-4">
                                <h4 class="text-lg font-bold text-white">
                                    <i class="fas fa-calculator mr-2 text-orange-500"></i>創幣成本摘要
                                </h4>
                                <div class="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                                    <span class="text-xs text-green-400 font-bold">
                                        <i class="fas fa-check-circle mr-1"></i>實時計算
                                    </span>
                                </div>
                            </div>
                            
                            <div class="space-y-3">
                                <div class="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                    <div class="flex items-center space-x-2">
                                        <i class="fas fa-piggy-bank text-orange-400"></i>
                                        <span class="text-gray-300">初始投資</span>
                                    </div>
                                    <span id="cost-initial-investment" class="font-mono text-white font-bold">2,000 MLT</span>
                                </div>
                                
                                <div class="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                    <div class="flex items-center space-x-2">
                                        <i class="fas fa-shopping-bag text-green-400"></i>
                                        <span class="text-gray-300">預購成本</span>
                                    </div>
                                    <span id="cost-pre-purchase" class="font-mono text-white font-bold">110.59 MLT</span>
                                </div>
                                
                                <div class="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                    <div class="flex items-center space-x-2">
                                        <i class="fas fa-tag text-blue-400"></i>
                                        <span class="text-gray-300">初始價格</span>
                                    </div>
                                    <span id="cost-initial-price" class="font-mono text-xs text-gray-400">0.002000 MLT/token</span>
                                </div>
                                
                                <div class="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                    <div class="flex items-center space-x-2">
                                        <i class="fas fa-chart-line text-purple-400"></i>
                                        <span class="text-gray-300">當前價格</span>
                                        <span class="text-xs text-gray-500">(預購後)</span>
                                    </div>
                                    <span id="cost-current-price" class="font-mono text-xs text-purple-300">0.002222 MLT/token</span>
                                </div>
                                
                                <div class="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                    <div class="flex items-center space-x-2">
                                        <i class="fas fa-percentage text-pink-400"></i>
                                        <span class="text-gray-300">Bonding Curve 進度</span>
                                    </div>
                                    <span id="cost-progress" class="font-mono text-pink-300 font-bold">5.00%</span>
                                </div>
                                
                                <div class="border-t border-gray-700/50 my-2"></div>
                                
                                <div class="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/40">
                                    <span class="text-white font-bold text-lg">
                                        <i class="fas fa-coins mr-2"></i>總成本
                                    </span>
                                    <span id="cost-total" class="text-2xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">2,110.59 MLT</span>
                                </div>
                                
                                <div class="flex items-center justify-between text-sm p-3 rounded-lg bg-gray-800/30">
                                    <span class="text-gray-400">
                                        <i class="fas fa-wallet mr-1"></i>創幣後餘額
                                    </span>
                                    <span id="cost-remaining" class="font-mono text-gray-300">7,889.41 MLT</span>
                                </div>
                            </div>
                            
                            <div class="mt-4 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
                                <p class="text-xs text-gray-300 mb-2">
                                    <i class="fas fa-rocket mr-1 text-green-400"></i>
                                    <strong>價格增長潛力:</strong>
                                </p>
                                <div class="grid grid-cols-4 gap-2 text-xs text-center">
                                    <div>
                                        <div class="text-gray-400">25%</div>
                                        <div class="text-green-400 font-bold">2.72×</div>
                                    </div>
                                    <div>
                                        <div class="text-gray-400">50%</div>
                                        <div class="text-green-400 font-bold">7.39×</div>
                                    </div>
                                    <div>
                                        <div class="text-gray-400">75%</div>
                                        <div class="text-yellow-400 font-bold">20.09×</div>
                                    </div>
                                    <div>
                                        <div class="text-gray-400">100%</div>
                                        <div class="text-purple-400 font-bold">54.60×</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    <!-- Navigation -->
                    <div class="flex justify-between mt-8">
                        <button id="step-2-back" class="px-8 py-3 glass-effect hover:bg-white/10 rounded-lg font-bold transition">
                            <i class="fas fa-arrow-left mr-2"></i>上一步
                        </button>
                        <button id="step-2-next" class="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-lg font-bold transition">
                            下一步 <i class="fas fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Step 3: Preview & Launch -->
            <div id="step-3" class="step-content hidden">
                <div class="max-w-4xl mx-auto">
                    <h2 class="text-3xl font-bold mb-8 text-center">
                        <i class="fas fa-rocket mr-2"></i>預覽與發射
                    </h2>

                    <div class="grid md:grid-cols-2 gap-8">
                        <!-- Coin Preview Card -->
                        <div class="glass-effect rounded-2xl p-6">
                            <h3 class="text-xl font-bold mb-4">幣種預覽</h3>
                            <div class="text-center mb-6">
                                <img id="preview-coin-image" class="w-32 h-32 mx-auto rounded-full mb-4" loading="lazy" decoding="async" />
                                <h4 id="preview-coin-name" class="text-2xl font-bold">--</h4>
                                <p id="preview-coin-symbol" class="text-xl text-orange-500">$--</p>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">初始價格:</span>
                                    <span class="font-bold">0.01 虛擬幣</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">總供應量:</span>
                                    <span class="font-bold" id="preview-supply">--</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">創建者:</span>
                                    <span class="font-bold" id="preview-creator">--</span>
                                </div>
                            </div>
                            <div class="mt-4 p-4 bg-white/5 rounded-lg">
                                <p id="preview-description" class="text-sm text-gray-300">--</p>
                            </div>
                        </div>

                        <!-- Metrics & Stats -->
                        <div class="space-y-6">
                            <!-- AI Quality Score -->
                            <div class="glass-effect rounded-2xl p-6">
                                <h3 class="text-xl font-bold mb-4">
                                    <i class="fas fa-brain mr-2 text-purple-500"></i>AI 質量評分
                                </h3>
                                <div class="flex items-center justify-center mb-4">
                                    <div class="text-6xl font-bold gradient-text" id="quality-score">--</div>
                                    <div class="text-2xl text-gray-400 ml-2">/100</div>
                                </div>
                                <div class="space-y-2 text-sm">
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-400">圖片質量</span>
                                        <div class="flex items-center">
                                            <div class="w-24 h-2 bg-white/10 rounded-full overflow-hidden mr-2">
                                                <div id="image-quality-bar" class="h-full bg-gradient-to-r from-orange-500 to-pink-500" style="width: 0%"></div>
                                            </div>
                                            <span id="image-quality-score">--</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-400">名稱吸引力</span>
                                        <div class="flex items-center">
                                            <div class="w-24 h-2 bg-white/10 rounded-full overflow-hidden mr-2">
                                                <div id="name-quality-bar" class="h-full bg-gradient-to-r from-orange-500 to-pink-500" style="width: 0%"></div>
                                            </div>
                                            <span id="name-quality-score">--</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-400">描述完整度</span>
                                        <div class="flex items-center">
                                            <div class="w-24 h-2 bg-white/10 rounded-full overflow-hidden mr-2">
                                                <div id="desc-quality-bar" class="h-full bg-gradient-to-r from-orange-500 to-pink-500" style="width: 0%"></div>
                                            </div>
                                            <span id="desc-quality-score">--</span>
                                        </div>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-400 mt-4 text-center">
                                    高質量分數可能提升初始 Hype 值
                                </p>
                            </div>

                            <!-- Creation Cost -->
                            <div class="glass-effect rounded-2xl p-6">
                                <h3 class="text-xl font-bold mb-4">
                                    <i class="fas fa-coins mr-2 text-yellow-500"></i>創建成本
                                </h3>
                                <div class="flex items-center justify-between text-2xl mb-4">
                                    <span>總計:</span>
                                    <span class="font-bold text-orange-500" id="cost-total-preview">~2,100 MLT</span>
                                </div>
                                <div class="flex items-center justify-between text-sm text-gray-400">
                                    <span>當前餘額:</span>
                                    <span id="preview-balance">-- MLT</span>
                                </div>
                                <div class="flex items-center justify-between text-sm text-gray-400 mt-2">
                                    <span>發射後餘額:</span>
                                    <span id="preview-after-balance">-- MLT</span>
                                </div>
                            </div>

                            <!-- Market Estimate -->
                            <div class="glass-effect rounded-2xl p-6">
                                <h3 class="text-xl font-bold mb-4">
                                    <i class="fas fa-chart-line mr-2 text-green-500"></i>市場估值
                                </h3>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">初始市值:</span>
                                        <span class="font-bold" id="preview-market-cap">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">預估排名:</span>
                                        <span class="font-bold" id="preview-ranking">新幣種</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">初始 Hype:</span>
                                        <span class="font-bold" id="preview-hype">--</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Launch Button -->
                    <div class="mt-8 text-center">
                        <div id="launch-error" class="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-sm hidden"></div>
                        <div class="flex justify-center space-x-4">
                            <button id="step-3-back" class="px-8 py-4 glass-effect hover:bg-white/10 rounded-lg font-bold transition text-lg">
                                <i class="fas fa-arrow-left mr-2"></i>上一步
                            </button>
                            <button id="launch-btn" class="px-12 py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-lg font-bold transition text-lg transform hover:scale-105">
                                <i class="fas fa-rocket mr-2"></i>
                                <span id="launch-text">發射我的 Meme 幣！</span>
                            </button>
                        </div>
                        <p class="text-sm text-gray-400 mt-4">
                            發射後，您的幣將出現在市場上供其他玩家交易
                        </p>
                    </div>
                </div>
            </div>

            <!-- Success Modal -->
            <div id="success-modal" class="hidden fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div class="glass-effect rounded-2xl p-8 max-w-lg w-full">
                    <div class="text-center">
                        <div class="text-6xl mb-4">🎉</div>
                        <h2 class="text-3xl font-bold mb-4">發射成功！</h2>
                        <p class="text-gray-300 mb-6">恭喜！您的 Meme 幣已成功發射到市場</p>
                        
                        <div class="glass-effect rounded-lg p-6 mb-6">
                            <img id="success-coin-image" class="w-24 h-24 mx-auto rounded-full mb-4" loading="lazy" decoding="async" />
                            <h3 id="success-coin-name" class="text-2xl font-bold mb-2">--</h3>
                            <p id="success-coin-symbol" class="text-xl text-orange-500 mb-4">$--</p>
                            <div class="flex justify-around text-sm">
                                <div>
                                    <p class="text-gray-400">初始價格</p>
                                    <p class="font-bold">0.01</p>
                                </div>
                                <div>
                                    <p class="text-gray-400">市值</p>
                                    <p class="font-bold" id="success-market-cap">--</p>
                                </div>
                                <div>
                                    <p class="text-gray-400">排名</p>
                                    <p class="font-bold">#<span id="success-rank">--</span></p>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col space-y-3">
                            <button id="view-coin-btn" class="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-lg font-bold transition">
                                <i class="fas fa-eye mr-2"></i>查看我的幣
                            </button>
                            <button id="share-twitter-btn" class="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-bold transition">
                                <i class="fab fa-twitter mr-2"></i>分享到 Twitter
                            </button>
                            <button id="create-another-btn" class="w-full px-6 py-3 glass-effect hover:bg-white/10 rounded-lg font-bold transition">
                                <i class="fas fa-plus mr-2"></i>創建另一枚幣
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        
        <!-- Core utilities -->
        <script src="/static/fetch-utils.js?v=20260221151619"></script>
        
        <!-- Page scripts -->
        <script src="/static/mlt-calculator.js?v=20260221151619"></script>
        <script src="/static/create-coin.js?v=20260221151619"></script>
    </body>
    </html>
  `);
});

// Dashboard page - Protected route (requires authentication)
app.get('/dashboard', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>儀表板 - MemeLaunch Tycoon</title>
        <script defer src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/professional-theme.css?v=20260221151619" rel="stylesheet">
        <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
          body { font-family: 'Inter', sans-serif; }
          
          /* Loading overlay to prevent flash of content */
          #page-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0A0B0D 0%, #1A1B1F 50%, #0A0B0D 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.3s ease;
          }
          
          #page-loader.hidden {
            opacity: 0;
            pointer-events: none;
          }
          
          .loader-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 107, 53, 0.2);
            border-top-color: #FF6B35;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
        <style>
            /* Critical CSS - Load immediately to prevent flash */
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-out;
            }
            #page-loader.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Hide body content until loader is ready */</style>
    </head>
    <body class="min-h-screen" style="background: linear-gradient(135deg, #0A0B0D 0%, #1A1B1F 50%, #0A0B0D 100%);">
        <!-- Loading overlay -->
        <div id="page-loader">
            <div class="loader-spinner"></div>
        </div>
        
        <!-- Navigation -->
        <nav class="glass-card sticky top-0 z-50 border-b border-white/10">
            <div class="container mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-6">
                        <a href="/" class="flex items-center space-x-2">
                            <i class="fas fa-rocket text-2xl coinbase-blue"></i>
                            <span class="text-xl font-bold text-white">MemeLaunch</span>
                        </a>
                        <a href="/dashboard" class="text-white hover:text-coinbase-blue transition font-semibold">儀表板</a>
                        <a href="/market" class="text-gray-300 hover:text-coinbase-blue transition">市場</a>
                        <a href="/create" class="text-gray-300 hover:text-coinbase-blue transition">創建幣</a>
                        <a href="/portfolio" class="text-gray-300 hover:text-coinbase-blue transition">我的組合</a>
                        <a href="/achievements" class="text-gray-300 hover:text-coinbase-blue transition">成就</a>
                        <a href="/leaderboard" class="text-gray-300 hover:text-coinbase-blue transition">排行榜</a>
                        <a href="/social" class="text-gray-300 hover:text-coinbase-blue transition">社交</a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="glass-card px-4 py-2 rounded-lg flex items-center">
                            <i class="fas fa-coins text-yellow-400 mr-2"></i>
                            <span id="balance-display" class="text-white font-semibold">--</span>
                            <span class="text-white ml-1">金幣</span>
                        </div>
                        
                        <!-- User Dropdown Menu -->
                        <div class="relative">
                            <button id="user-menu-btn" class="glass-card px-3 py-2 rounded-lg hover:bg-white/10 transition cursor-pointer flex items-center space-x-2 whitespace-nowrap">
                                <i class="fas fa-user text-coinbase-blue"></i>
                                <span id="username-display" class="text-white text-sm">載入中...</span>
                                <i class="fas fa-chevron-down text-gray-400 text-xs ml-1"></i>
                            </button>
                            
                            <!-- Dropdown Menu -->
                            <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-xl border border-white/10 overflow-hidden z-50">
                                <a id="view-profile-link" href="#" class="block px-4 py-3 text-white hover:bg-white/10 transition">
                                    <i class="fas fa-user mr-2 text-coinbase-blue"></i>我的資料
                                </a>
                                <a href="/portfolio" class="block px-4 py-3 text-white hover:bg-white/10 transition">
                                    <i class="fas fa-wallet mr-2 text-green-400"></i>我的組合
                                </a>
                                <a href="/achievements" class="block px-4 py-3 text-white hover:bg-white/10 transition">
                                    <i class="fas fa-trophy mr-2 text-yellow-400"></i>成就
                                </a>
                                <div class="border-t border-white/10"></div>
                                <button id="logout-btn" class="w-full text-left px-4 py-3 text-red-400 hover:bg-white/10 transition">
                                    <i class="fas fa-sign-out-alt mr-2"></i>登出
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            <!-- Welcome Section -->
            <div class="mb-8">
                <h1 class="text-4xl font-bold text-white mb-2">歡迎回來！</h1>
                <p class="text-gray-400">查看您的投資表現和市場動態</p>
            </div>

            <!-- Stats Grid -->
            <div class="grid md:grid-cols-4 gap-6 mb-8">
                <div class="glass-card p-6 rounded-xl hover-lift">
                    <div class="flex items-center justify-between mb-3">
                        <i class="fas fa-wallet text-3xl text-yellow-400"></i>
                        <span class="text-xs text-gray-400">總餘額</span>
                    </div>
                    <p class="text-3xl font-bold text-white" id="total-balance">--</p>
                    <p class="text-sm text-gray-400 mt-1">金幣</p>
                </div>
                
                <div class="glass-card p-6 rounded-xl hover-lift">
                    <div class="flex items-center justify-between mb-3">
                        <i class="fas fa-chart-line text-3xl text-green-400"></i>
                        <span class="text-xs text-gray-400">投資組合價值</span>
                    </div>
                    <p class="text-3xl font-bold text-white" id="portfolio-value">--</p>
                    <p class="text-sm text-gray-400 mt-1">金幣</p>
                </div>
                
                <div class="glass-card p-6 rounded-xl hover-lift">
                    <div class="flex items-center justify-between mb-3">
                        <i class="fas fa-percentage text-3xl text-blue-400"></i>
                        <span class="text-xs text-gray-400">總盈虧</span>
                    </div>
                    <p class="text-2xl font-bold" id="total-pnl">--</p>
                </div>
                
                <div class="glass-card p-6 rounded-xl hover-lift">
                    <div class="flex items-center justify-between mb-3">
                        <i class="fas fa-briefcase text-3xl text-purple-400"></i>
                        <span class="text-xs text-gray-400">持倉數量</span>
                    </div>
                    <p class="text-3xl font-bold text-white" id="holdings-count">--</p>
                    <p class="text-sm text-gray-400 mt-1">種幣</p>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="glass-card p-8 rounded-xl mb-8">
                <h3 class="text-2xl font-bold text-white mb-6">快速操作</h3>
                <div class="grid md:grid-cols-4 gap-4">
                    <button onclick="window.location.href='/create'" class="btn-primary p-6 rounded-xl text-center group">
                        <i class="fas fa-plus-circle text-4xl mb-3 group-hover:scale-110 transition-transform"></i>
                        <p class="font-bold text-lg">創建模因幣</p>
                        <p class="text-sm opacity-80 mt-1">發行您的第一個幣種</p>
                    </button>
                    <button onclick="window.location.href='/market'" class="glass-card p-6 rounded-xl text-center group hover:bg-white/10">
                        <i class="fas fa-store text-4xl mb-3 text-coinbase-blue group-hover:scale-110 transition-transform"></i>
                        <p class="font-bold text-lg text-white">瀏覽市場</p>
                        <p class="text-sm text-gray-400 mt-1">發現熱門幣種</p>
                    </button>
                    <button onclick="window.location.href='/portfolio'" class="glass-card p-6 rounded-xl text-center group hover:bg-white/10">
                        <i class="fas fa-briefcase text-4xl mb-3 text-green-400 group-hover:scale-110 transition-transform"></i>
                        <p class="font-bold text-lg text-white">我的投資組合</p>
                        <p class="text-sm text-gray-400 mt-1">管理您的資產</p>
                    </button>
                    <button id="quick-profile-btn" class="glass-card p-6 rounded-xl text-center group hover:bg-white/10">
                        <i class="fas fa-user-circle text-4xl mb-3 text-purple-400 group-hover:scale-110 transition-transform"></i>
                        <p class="font-bold text-lg text-white">查看資料</p>
                        <p class="text-sm text-gray-400 mt-1">個人檔案與成就</p>
                    </button>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
                <!-- Recent Transactions -->
                <div class="glass-card p-8 rounded-xl">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-white">最近交易</h3>
                        <a href="/portfolio" class="text-sm coinbase-blue hover:text-blue-400 transition">查看全部 →</a>
                    </div>
                    <div id="recent-transactions" class="space-y-3">
                        <p class="text-gray-400 text-center py-8">載入中...</p>
                    </div>
                </div>

                <!-- Your Holdings -->
                <div class="glass-card p-8 rounded-xl">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-white">我的持倉</h3>
                        <a href="/portfolio" class="text-sm coinbase-blue hover:text-blue-400 transition">查看全部 →</a>
                    </div>
                    <div id="user-holdings" class="space-y-3">
                        <p class="text-gray-400 text-center py-8">載入中...</p>
                    </div>
                </div>
            </div>

            <!-- Trending Coins -->
            <div class="glass-card p-8 rounded-xl mt-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-white">熱門幣種</h3>
                    <a href="/market" class="text-sm coinbase-blue hover:text-blue-400 transition">查看市場 →</a>
                </div>
                <div id="trending-coins" class="space-y-3">
                    <p class="text-gray-400 text-center py-8">載入中...</p>
                </div>
            </div>
        </div>

        <!-- Core utilities -->
        <script src="/static/fetch-utils.js?v=20260221151619"></script>
        
        <!-- Dashboard functionality -->
        <script src="/static/dashboard-simple.js?v=20260221151619"></script>
    </body>
    </html>
  `)
})

// Portfolio page
app.get('/portfolio', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>投資組合 - MemeLaunch Tycoon</title>
        <script defer src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
        <style>
          #page-loader{position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#0A0B0D 0%,#1A1B1F 50%,#0A0B0D 100%);display:flex;align-items:center;justify-content:center;z-index:9999;transition:opacity .3s}.loader-spinner{width:50px;height:50px;border:4px solid rgba(255,107,53,.2);border-top-color:#FF6B35;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}#page-loader.hidden{opacity:0;pointer-events:none}
        </style>
        <style>
            /* Critical CSS - Load immediately to prevent flash */
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-out;
            }
            #page-loader.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Hide body content until loader is ready */</style>
    </head>
    <body class="bg-gradient-to-br from-gray-900 via-purple-900 to-black min-h-screen text-white">
        <div id="page-loader"><div class="loader-spinner"></div></div>
        <!-- Navigation -->
        <nav class="bg-black/30 backdrop-blur-md border-b border-white/10">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center space-x-8">
                        <a href="/" class="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                            MemeLaunch 🚀
                        </a>
                        <div class="hidden md:flex space-x-4">
                            <a href="/dashboard" class="text-gray-300 hover:text-white transition">儀表板</a>
                            <a href="/market" class="text-gray-300 hover:text-white transition">市場</a>
                            <a href="/portfolio" class="text-white border-b-2 border-orange-500">我的組合</a>
                            <a href="/leaderboard" class="text-gray-300 hover:text-white transition">排行榜</a>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="glass-effect px-4 py-2 rounded-lg">
                            <i class="fas fa-coins text-yellow-400 mr-2"></i>
                            <span id="user-balance">--</span> 金幣
                        </div>
                        <button id="logout-btn" class="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition">
                            登出
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Page Header -->
            <div class="mb-8 flex items-center justify-between">
                <div>
                    <h1 class="text-4xl font-bold mb-2">我的投資組合</h1>
                    <p class="text-gray-400">追蹤您的持倉和投資表現</p>
                </div>
                <button id="refresh-btn" class="px-4 py-2 rounded-lg glass-effect hover:bg-white/10 transition">
                    <i class="fas fa-sync-alt mr-2"></i>刷新
                </button>
            </div>

            <!-- Error Container -->
            <div id="error-container" class="mb-4"></div>

            <!-- Stats Grid -->
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="glass-effect rounded-xl p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-gray-400">現金餘額</p>
                        <i class="fas fa-wallet text-green-400"></i>
                    </div>
                    <p class="text-3xl font-bold" id="cash-balance">--</p>
                    <p class="text-sm text-gray-400 mt-1">金幣</p>
                </div>

                <div class="glass-effect rounded-xl p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-gray-400">持倉總值</p>
                        <i class="fas fa-chart-pie text-blue-400"></i>
                    </div>
                    <p class="text-3xl font-bold" id="total-value">--</p>
                    <p class="text-sm text-gray-400 mt-1">金幣</p>
                </div>

                <div class="glass-effect rounded-xl p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-gray-400">總資產</p>
                        <i class="fas fa-coins text-yellow-400"></i>
                    </div>
                    <p class="text-3xl font-bold" id="total-networth">--</p>
                    <p class="text-sm text-gray-400 mt-1">金幣</p>
                </div>

                <div class="glass-effect rounded-xl p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-gray-400">總盈虧</p>
                        <i class="fas fa-chart-line text-orange-400"></i>
                    </div>
                    <p id="total-pl" class="text-3xl font-bold">--</p>
                    <p class="text-sm text-gray-400 mt-1">%</p>
                </div>
            </div>

            <!-- Holdings Table -->
            <div class="glass-effect rounded-xl p-6">
                <h2 class="text-2xl font-bold mb-6">持倉明細</h2>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-white/10">
                                <th class="px-6 py-3 text-left text-gray-400">#</th>
                                <th class="px-6 py-3 text-left text-gray-400">幣種</th>
                                <th class="px-6 py-3 text-left text-gray-400">持有量</th>
                                <th class="px-6 py-3 text-left text-gray-400">平均買入價</th>
                                <th class="px-6 py-3 text-left text-gray-400">當前價格</th>
                                <th class="px-6 py-3 text-left text-gray-400">總價值</th>
                                <th class="px-6 py-3 text-left text-gray-400">盈虧</th>
                            </tr>
                        </thead>
                        <tbody id="holdings-tbody">
                            <tr>
                                <td colspan="7" class="text-center py-8 text-gray-400">
                                    <i class="fas fa-spinner fa-spin text-4xl mb-2"></i>
                                    <p>載入中...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="mt-8 grid md:grid-cols-3 gap-6">
                <a href="/market" class="glass-effect rounded-xl p-6 hover:bg-white/10 transition text-center">
                    <i class="fas fa-shopping-cart text-4xl text-blue-400 mb-3"></i>
                    <h3 class="text-xl font-semibold mb-2">前往市場</h3>
                    <p class="text-gray-400 text-sm">探索並購買更多模因幣</p>
                </a>

                <a href="/create" class="glass-effect rounded-xl p-6 hover:bg-white/10 transition text-center">
                    <i class="fas fa-rocket text-4xl text-orange-400 mb-3"></i>
                    <h3 class="text-xl font-semibold mb-2">創建幣種</h3>
                    <p class="text-gray-400 text-sm">發射您自己的模因幣</p>
                </a>

                <a href="/dashboard" class="glass-effect rounded-xl p-6 hover:bg-white/10 transition text-center">
                    <i class="fas fa-chart-bar text-4xl text-green-400 mb-3"></i>
                    <h3 class="text-xl font-semibold mb-2">查看儀表板</h3>
                    <p class="text-gray-400 text-sm">查看統計數據和分析</p>
                </a>
            </div>
        </div>

        
        <!-- Core utilities -->
        <script src="/static/fetch-utils.js?v=20260221151619"></script>
        
        <!-- Portfolio functionality -->
        <script src="/static/portfolio.js?v=20260221151619"></script>
    </body>
    </html>
  `)
})

// Achievements page
app.get('/achievements', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>成就系統 - MemeLaunch Tycoon</title>
        <script defer src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
        <style>
          #page-loader{position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#0A0B0D 0%,#1A1B1F 50%,#0A0B0D 100%);display:flex;align-items:center;justify-content:center;z-index:9999;transition:opacity .3s}.loader-spinner{width:50px;height:50px;border:4px solid rgba(255,107,53,.2);border-top-color:#FF6B35;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}#page-loader.hidden{opacity:0;pointer-events:none}
        </style>
        <style>
            /* Critical CSS - Load immediately to prevent flash */
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-out;
            }
            #page-loader.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Hide body content until loader is ready */</style>
    </head>
    <body class="gradient-bg text-white min-h-screen">
        <div id="page-loader"><div class="loader-spinner"></div></div>
        <!-- Navigation -->
        <nav class="glass-effect sticky top-0 z-50">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <a href="/" class="flex items-center space-x-2">
                        <i class="fas fa-rocket text-2xl text-orange-500"></i>
                        <span class="text-xl font-bold">MemeLaunch</span>
                    </a>
                    <div class="hidden md:flex items-center space-x-6">
                        <a href="/dashboard" class="hover:text-orange-500 transition">儀表板</a>
                        <a href="/market" class="hover:text-orange-500 transition">市場</a>
                        <a href="/portfolio" class="hover:text-orange-500 transition">投資組合</a>
                        <a href="/achievements" class="text-orange-500 border-b-2 border-orange-500">成就</a>
                        <a href="/leaderboard" class="hover:text-orange-500 transition">排行榜</a>
                        <a href="/social" class="hover:text-orange-500 transition">社交</a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <!-- Virtual Balance (Gold Coins) -->
                        <div class="glass-effect px-4 py-2 rounded-lg">
                            <i class="fas fa-coins text-yellow-500 mr-2"></i>
                            <span id="user-balance">--</span> 金幣
                        </div>
                        <!-- MLT Balance -->
                        <div class="glass-effect px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20">
                            <img src="/static/mlt-token.png" class="inline-block w-5 h-5 mr-2" alt="MLT" loading="lazy" decoding="async" />
                            <span id="user-mlt-balance" class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">--</span>
                            <span class="text-xs text-gray-400 ml-1">MLT</span>
                        </div>
                        <button id="logout-btn" class="px-4 py-2 rounded-lg glass-effect hover:bg-white/10 transition">
                            登出
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            <!-- Back Button -->
            <div class="mb-6">
                <a href="/dashboard" class="inline-flex items-center px-4 py-2 rounded-lg glass-effect hover:bg-white/10 transition">
                    <i class="fas fa-arrow-left mr-2"></i>
                    返回儀表板
                </a>
            </div>
            
            <!-- Page Header -->
            <div class="mb-8">
                <h1 class="text-5xl font-bold mb-4">
                    <i class="fas fa-trophy text-yellow-500 mr-4"></i>
                    成就系統
                </h1>
                <p class="text-xl text-gray-300">解鎖成就，獲得經驗值，提升等級！</p>
            </div>

            <!-- Level Progress Card -->
            <div id="level-progress-card" class="glass-effect rounded-2xl p-8 mb-8">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-3xl font-bold">
                            <span class="text-orange-500">等級 </span>
                            <span id="user-level">1</span>
                        </h2>
                        <p class="text-gray-400 mt-2">
                            <span id="current-xp">0</span> / <span id="next-level-xp">400</span> XP
                        </p>
                    </div>
                    <div class="text-7xl" id="level-icon">🌟</div>
                </div>
                <div class="w-full h-6 bg-white/10 rounded-full overflow-hidden">
                    <div id="xp-progress-bar" class="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 transition-all duration-500" style="width: 0%"></div>
                </div>
                <p class="text-sm text-gray-400 mt-3">
                    還需 <span id="xp-remaining">400</span> XP 升到下一級
                </p>
            </div>

            <!-- Achievements Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div class="glass-effect rounded-xl p-6 text-center">
                    <div class="text-4xl mb-2">🏆</div>
                    <div class="text-3xl font-bold" id="total-achievements">0</div>
                    <div class="text-sm text-gray-400">總成就</div>
                </div>
                <div class="glass-effect rounded-xl p-6 text-center">
                    <div class="text-4xl mb-2">✅</div>
                    <div class="text-3xl font-bold text-green-500" id="unlocked-achievements">0</div>
                    <div class="text-sm text-gray-400">已解鎖</div>
                </div>
                <div class="glass-effect rounded-xl p-6 text-center">
                    <div class="text-4xl mb-2">⭐</div>
                    <div class="text-3xl font-bold text-orange-500" id="total-points">0</div>
                    <div class="text-sm text-gray-400">總積分</div>
                </div>
                <div class="glass-effect rounded-xl p-6 text-center">
                    <div class="text-4xl mb-2">📈</div>
                    <div class="text-3xl font-bold text-blue-500" id="completion-rate">0%</div>
                    <div class="text-sm text-gray-400">完成度</div>
                </div>
            </div>

            <!-- Filter Buttons -->
            <div class="flex flex-wrap gap-3 mb-8">
                <button data-filter="all" class="filter-btn active px-6 py-3 rounded-lg bg-orange-500 text-white font-bold transition hover:bg-orange-600">
                    全部
                </button>
                <button data-filter="unlocked" class="filter-btn px-6 py-3 rounded-lg glass-effect hover:bg-white/10 transition font-bold">
                    已解鎖
                </button>
                <button data-filter="locked" class="filter-btn px-6 py-3 rounded-lg glass-effect hover:bg-white/10 transition font-bold">
                    未解鎖
                </button>
                <button data-filter="trading" class="filter-btn px-6 py-3 rounded-lg glass-effect hover:bg-white/10 transition font-bold">
                    <i class="fas fa-chart-line mr-2"></i>交易
                </button>
                <button data-filter="creation" class="filter-btn px-6 py-3 rounded-lg glass-effect hover:bg-white/10 transition font-bold">
                    <i class="fas fa-rocket mr-2"></i>創作
                </button>
                <button data-filter="social" class="filter-btn px-6 py-3 rounded-lg glass-effect hover:bg-white/10 transition font-bold">
                    <i class="fas fa-users mr-2"></i>社交
                </button>
                <button data-filter="milestone" class="filter-btn px-6 py-3 rounded-lg glass-effect hover:bg-white/10 transition font-bold">
                    <i class="fas fa-flag mr-2"></i>里程碑
                </button>
            </div>

            <!-- Loading State -->
            <div id="loading-state" class="text-center py-20">
                <i class="fas fa-spinner fa-spin text-6xl text-orange-500 mb-4"></i>
                <p class="text-xl text-gray-400">載入成就中...</p>
            </div>

            <!-- Achievements Grid -->
            <div id="achievements-content" class="hidden">
                <div id="achievements-grid" class="space-y-8">
                    <!-- Achievements will be loaded here -->
                </div>
            </div>
        </div>

        <!-- Achievement Detail Modal -->
        <div id="achievement-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div class="glass-effect rounded-2xl p-8 max-w-md w-full animate-bounce-in">
                <div class="text-center">
                    <div class="text-8xl mb-6" id="modal-icon">🏆</div>
                    <h2 class="text-3xl font-bold mb-4" id="modal-name">成就名稱</h2>
                    <p class="text-gray-300 mb-6" id="modal-description">成就描述</p>
                    <div class="flex items-center justify-center space-x-4 mb-6">
                        <span class="px-4 py-2 rounded-full" id="modal-rarity">普通</span>
                        <span class="text-xl font-bold text-orange-500" id="modal-points">
                            <i class="fas fa-star mr-2"></i>+100 XP
                        </span>
                    </div>
                    <div id="modal-completed-time" class="text-sm text-gray-400 mb-4 hidden">
                        解鎖時間: <span id="completed-at"></span>
                    </div>
                    <button onclick="closeModal()" class="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-lg font-bold transition">
                        太棒了！
                    </button>
                </div>
            </div>
        </div>

        
        <!-- Core utilities -->
        <script src="/static/fetch-utils.js?v=20260221151619"></script>
        
        <!-- Achievements functionality -->
        <script src="/static/achievements-page.js?v=20260221151619"></script>
    </body>
    </html>
  `);
})

// Leaderboard page
app.get('/leaderboard', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>排行榜 - MemeLaunch Tycoon</title>
        <script defer src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
        <style>
          #page-loader{position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#0A0B0D 0%,#1A1B1F 50%,#0A0B0D 100%);display:flex;align-items:center;justify-content:center;z-index:9999;transition:opacity .3s}.loader-spinner{width:50px;height:50px;border:4px solid rgba(255,107,53,.2);border-top-color:#FF6B35;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}#page-loader.hidden{opacity:0;pointer-events:none}
        </style>
        <style>
            /* Critical CSS - Load immediately to prevent flash */
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-out;
            }
            #page-loader.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Hide body content until loader is ready */</style>
    </head>
    <body class="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 min-h-screen">
        <div id="page-loader"><div class="loader-spinner"></div></div>
        <!-- Navigation -->
        <nav class="glass-effect border-b border-gray-700/50 sticky top-0 z-40">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <a href="/" class="flex items-center space-x-2">
                        <i class="fas fa-rocket text-2xl text-orange-500"></i>
                        <span class="text-xl font-bold text-white">MemeLaunch Tycoon</span>
                    </a>
                    <div class="flex items-center space-x-6">
                        <a href="/dashboard" class="text-gray-300 hover:text-orange-500 transition"><i class="fas fa-home mr-2"></i>儀表板</a>
                        <a href="/market" class="text-gray-300 hover:text-orange-500 transition"><i class="fas fa-store mr-2"></i>市場</a>
                        <a href="/portfolio" class="text-gray-300 hover:text-orange-500 transition"><i class="fas fa-briefcase mr-2"></i>投資組合</a>
                        <a href="/achievements" class="text-gray-300 hover:text-orange-500 transition"><i class="fas fa-trophy mr-2"></i>成就</a>
                        <a href="/leaderboard" class="text-orange-500 font-bold transition"><i class="fas fa-ranking-star mr-2"></i>排行榜</a>
                        <div class="text-gray-300">
                            <i class="fas fa-coins text-yellow-500 mr-2"></i>
                            <span id="user-balance">$0</span>
                        </div>
                        <button id="logout-btn" class="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition">
                            <i class="fas fa-sign-out-alt mr-2"></i>登出
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Header -->
            <div class="mb-8">
                <a href="/dashboard" class="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-lg hover:bg-white/10 transition mb-4">
                    <i class="fas fa-arrow-left"></i>
                    <span>返回儀表板</span>
                </a>
                
                <h1 class="text-4xl font-bold text-white mb-2">
                    <i class="fas fa-ranking-star text-orange-500 mr-3"></i>
                    排行榜
                </h1>
                <p class="text-gray-400">查看頂尖玩家，爭奪冠軍寶座！</p>
            </div>

            <!-- Category Tabs -->
            <div class="flex flex-wrap gap-3 mb-8">
                <button data-category="net_worth" class="category-btn active px-6 py-3 rounded-lg bg-orange-500 text-white font-bold transition hover:bg-orange-600">
                    <i class="fas fa-wallet mr-2"></i>💰 淨資產
                </button>
                <button data-category="trades" class="category-btn px-6 py-3 rounded-lg glass-effect hover:bg-white/10 transition font-bold text-white">
                    <i class="fas fa-chart-line mr-2"></i>📊 交易量
                </button>
                <button data-category="level" class="category-btn px-6 py-3 rounded-lg glass-effect hover:bg-white/10 transition font-bold text-white">
                    <i class="fas fa-star mr-2"></i>⭐ 等級
                </button>
                <button data-category="profit" class="category-btn px-6 py-3 rounded-lg glass-effect hover:bg-white/10 transition font-bold text-white">
                    <i class="fas fa-money-bill-trend-up mr-2"></i>💸 利潤
                </button>
                <button data-category="coins_created" class="category-btn px-6 py-3 rounded-lg glass-effect hover:bg-white/10 transition font-bold text-white">
                    <i class="fas fa-rocket mr-2"></i>🚀 創建幣種
                </button>
            </div>

            <!-- Top Three Podium -->
            <div class="mb-12">
                <h2 class="text-2xl font-bold text-white mb-6 text-center">
                    🏆 前三名獎台 🏆
                </h2>
                <div id="top-three-container" class="min-h-[300px] flex items-center justify-center">
                    <div class="text-gray-400">載入中...</div>
                </div>
            </div>

            <!-- Rankings Table -->
            <div class="glass-effect rounded-2xl overflow-hidden mb-8">
                <div class="p-6 border-b border-gray-700/50">
                    <h2 class="text-2xl font-bold text-white">
                        <i class="fas fa-list-ol mr-2 text-orange-500"></i>
                        完整排行榜
                    </h2>
                    <p class="text-gray-400 text-sm mt-1">前100名玩家 · 每30秒自動更新</p>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-800/50">
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-bold text-gray-300">排名</th>
                                <th class="px-6 py-4 text-left text-sm font-bold text-gray-300">用戶名</th>
                                <th class="px-6 py-4 text-left text-sm font-bold text-gray-300">數值</th>
                                <th class="px-6 py-4 text-left text-sm font-bold text-gray-300">等級</th>
                                <th class="px-6 py-4 text-left text-sm font-bold text-gray-300">創建幣種</th>
                            </tr>
                        </thead>
                        <tbody id="rankings-tbody">
                            <tr>
                                <td colspan="5" class="text-center py-12 text-gray-400">
                                    <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                                    <p>載入排行榜中...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- User Stats Card -->
            <div class="glass-effect rounded-2xl p-6">
                <h2 class="text-2xl font-bold text-white mb-6">
                    <i class="fas fa-user mr-2 text-orange-500"></i>
                    你的統計
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="glass-effect rounded-xl p-6 text-center">
                        <div class="text-4xl mb-2">🏅</div>
                        <div class="text-3xl font-bold text-orange-500" id="user-rank">#-</div>
                        <div class="text-sm text-gray-400 mt-1">排名</div>
                    </div>
                    <div class="glass-effect rounded-xl p-6 text-center">
                        <div class="text-4xl mb-2">💰</div>
                        <div class="text-2xl font-bold text-white" id="user-stat-value">$0</div>
                        <div class="text-sm text-gray-400 mt-1">當前數值</div>
                    </div>
                    <div class="glass-effect rounded-xl p-6 text-center">
                        <div class="text-4xl mb-2">📊</div>
                        <div class="text-2xl font-bold text-white" id="user-stat-trades">0</div>
                        <div class="text-sm text-gray-400 mt-1">交易/幣種</div>
                    </div>
                    <div class="glass-effect rounded-xl p-6 text-center">
                        <div class="text-4xl mb-2">⭐</div>
                        <div class="text-2xl font-bold text-white" id="user-stat-level">Lv.1</div>
                        <div class="text-sm text-gray-400 mt-1">等級</div>
                    </div>
                </div>
            </div>
        </div>

        
        <!-- Core utilities -->
        <script src="/static/fetch-utils.js?v=20260221151619"></script>
        
        <!-- Leaderboard functionality -->
        <script src="/static/leaderboard-page.js?v=20260221151619"></script>
    </body>
    </html>
  `);
})

// Social page - Activity feed and comments
app.get('/social', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>社交動態 - MemeLaunch Tycoon</title>
        <script defer src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
        <style>
          #page-loader{position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#0A0B0D 0%,#1A1B1F 50%,#0A0B0D 100%);display:flex;align-items:center;justify-content:center;z-index:9999;transition:opacity .3s}.loader-spinner{width:50px;height:50px;border:4px solid rgba(255,107,53,.2);border-top-color:#FF6B35;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}#page-loader.hidden{opacity:0;pointer-events:none}
        </style>
        <style>
            /* Critical CSS - Load immediately to prevent flash */
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-out;
            }
            #page-loader.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Hide body content until loader is ready */</style>
    </head>
    <body class="gradient-bg text-white min-h-screen">
        <div id="page-loader"><div class="loader-spinner"></div></div>
        <!-- Navigation -->
        <nav class="glass-effect sticky top-0 z-50">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <a href="/" class="flex items-center space-x-2">
                        <i class="fas fa-rocket text-2xl text-orange-500"></i>
                        <span class="text-xl font-bold">MemeLaunch</span>
                    </a>
                    <div class="hidden md:flex items-center space-x-6">
                        <a href="/dashboard" class="hover:text-orange-500 transition">儀表板</a>
                        <a href="/market" class="hover:text-orange-500 transition">市場</a>
                        <a href="/portfolio" class="hover:text-orange-500 transition">投資組合</a>
                        <a href="/achievements" class="hover:text-orange-500 transition">成就</a>
                        <a href="/leaderboard" class="hover:text-orange-500 transition">排行榜</a>
                        <a href="/social" class="hover:text-orange-500 transition">社交</a>
                        <a href="/social" class="text-orange-500 border-b-2 border-orange-500">社交</a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <!-- Virtual Balance (Gold Coins) -->
                        <div class="glass-effect px-4 py-2 rounded-lg">
                            <i class="fas fa-coins text-yellow-500 mr-2"></i>
                            <span id="user-balance">--</span> 金幣
                        </div>
                        <!-- MLT Balance -->
                        <div class="glass-effect px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20">
                            <img src="/static/mlt-token.png" class="inline-block w-5 h-5 mr-2" alt="MLT" loading="lazy" decoding="async" />
                            <span id="user-mlt-balance" class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">--</span>
                            <span class="text-xs text-gray-400 ml-1">MLT</span>
                        </div>
                        <button id="logout-btn" class="px-4 py-2 rounded-lg glass-effect hover:bg-white/10 transition">
                            登出
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-4xl font-bold mb-2">
                        <i class="fas fa-comments mr-3"></i>
                        社交動態
                    </h1>
                    <p class="text-gray-400">查看所有幣種的最新討論與活動</p>
                </div>
                <a href="/dashboard" class="inline-flex items-center px-4 py-2 rounded-lg glass-effect hover:bg-white/10 transition">
                    <i class="fas fa-arrow-left mr-2"></i>
                    返回儀表板
                </a>
            </div>

            <!-- Filter Tabs -->
            <div class="glass-effect rounded-2xl p-6 mb-8">
                <div class="flex flex-wrap gap-4 items-center justify-between">
                    <div class="flex flex-wrap gap-2">
                        <button class="filter-btn active px-4 py-2 rounded-lg font-bold transition" data-filter="all">
                            <i class="fas fa-globe mr-2"></i>全部動態
                        </button>
                        <button class="filter-btn px-4 py-2 rounded-lg font-bold transition" data-filter="following">
                            <i class="fas fa-user-friends mr-2"></i>我的關注
                        </button>
                        <button class="filter-btn px-4 py-2 rounded-lg font-bold transition" data-filter="popular">
                            <i class="fas fa-fire mr-2"></i>熱門討論
                        </button>
                        <button class="filter-btn px-4 py-2 rounded-lg font-bold transition" data-filter="recent">
                            <i class="fas fa-clock mr-2"></i>最新評論
                        </button>
                    </div>
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-sync-alt text-gray-400"></i>
                        <span class="text-sm text-gray-400">自動更新中...</span>
                    </div>
                </div>
            </div>

            <!-- Activity Feed -->
            <div class="grid lg:grid-cols-3 gap-8">
                <!-- Main Feed -->
                <div class="lg:col-span-2 space-y-6">
                    <div id="activity-feed" class="space-y-4">
                        <!-- Loading State -->
                        <div id="loading-state" class="glass-effect rounded-2xl p-12 text-center">
                            <i class="fas fa-spinner fa-spin text-6xl text-orange-500 mb-4"></i>
                            <p class="text-xl text-gray-400">載入中...</p>
                        </div>
                        
                        <!-- Feed items will be loaded here -->
                    </div>
                    
                    <!-- Load More Button -->
                    <button id="load-more-btn" class="hidden w-full py-4 rounded-lg glass-effect hover:bg-white/10 transition">
                        <i class="fas fa-arrow-down mr-2"></i>
                        載入更多
                    </button>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Trending Coins -->
                    <div class="glass-effect rounded-2xl p-6">
                        <h2 class="text-2xl font-bold mb-4">
                            <i class="fas fa-chart-line mr-2 text-orange-500"></i>
                            熱門幣種
                        </h2>
                        <div id="trending-coins" class="space-y-3">
                            <!-- Trending coins will be loaded here -->
                        </div>
                    </div>

                    <!-- Active Users -->
                    <div class="glass-effect rounded-2xl p-6">
                        <h2 class="text-2xl font-bold mb-4">
                            <i class="fas fa-users mr-2 text-orange-500"></i>
                            活躍用戶
                        </h2>
                        <div id="active-users" class="space-y-3">
                            <!-- Active users will be loaded here -->
                        </div>
                    </div>

                    <!-- Stats -->
                    <div class="glass-effect rounded-2xl p-6">
                        <h2 class="text-2xl font-bold mb-4">
                            <i class="fas fa-chart-bar mr-2 text-orange-500"></i>
                            社交統計
                        </h2>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-400">總評論數</span>
                                <span id="stat-total-comments" class="text-2xl font-bold">--</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-gray-400">今日新增</span>
                                <span id="stat-today-comments" class="text-2xl font-bold text-green-500">--</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-gray-400">活躍用戶</span>
                                <span id="stat-active-users" class="text-2xl font-bold text-blue-500">--</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        
        <!-- Core utilities -->
        <script src="/static/fetch-utils.js?v=20260221151619"></script>
        
        <!-- Social page functionality -->
        <script src="/static/auth.js?v=20260221151619"></script>
        <script src="/static/social-page-simple.js?v=20260221151619"></script>
    </body>
    </html>
  `);
})

// User Profile page
app.get('/profile/:userId', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>用戶資料 - MemeLaunch</title>
        <script defer src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
        <style>
          .tab-btn { opacity: 0.6; }
          .tab-btn.active { opacity: 1; border-bottom: 2px solid #f97316; }
          #page-loader{position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#0A0B0D 0%,#1A1B1F 50%,#0A0B0D 100%);display:flex;align-items:center;justify-content:center;z-index:9999;transition:opacity .3s}.loader-spinner{width:50px;height:50px;border:4px solid rgba(255,107,53,.2);border-top-color:#FF6B35;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}#page-loader.hidden{opacity:0;pointer-events:none}
        </style>
        <style>
            /* Critical CSS - Load immediately to prevent flash */
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-out;
            }
            #page-loader.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Hide body content until loader is ready */</style>
    </head>
    <body class="bg-gray-900 text-white min-h-screen">
        <div id="page-loader"><div class="loader-spinner"></div></div>
        <!-- Navigation -->
        <nav class="glass-effect sticky top-0 z-40 border-b border-white/10">
            <div class="container mx-auto px-4">
                <div class="flex items-center justify-between h-16">
                    <a href="/" class="flex items-center space-x-2">
                        <i class="fas fa-rocket text-2xl text-orange-500"></i>
                        <span class="text-xl font-bold">MemeLaunch</span>
                    </a>
                    <div class="hidden md:flex items-center space-x-6">
                        <a href="/dashboard" class="hover:text-orange-500 transition">儀表板</a>
                        <a href="/market" class="hover:text-orange-500 transition">市場</a>
                        <a href="/portfolio" class="hover:text-orange-500 transition">投資組合</a>
                        <a href="/achievements" class="hover:text-orange-500 transition">成就</a>
                        <a href="/leaderboard" class="hover:text-orange-500 transition">排行榜</a>
                        <a href="/social" class="hover:text-orange-500 transition">社交</a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <!-- Virtual Balance -->
                        <div class="glass-effect px-4 py-2 rounded-lg flex items-center">
                            <i class="fas fa-coins text-yellow-500 mr-2"></i>
                            <span id="user-balance">--</span>
                            <span class="ml-1">金幣</span>
                        </div>
                        <!-- MLT Balance -->
                        <div class="glass-effect px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20">
                            <img src="/static/mlt-token.png" class="inline-block w-5 h-5 mr-2" alt="MLT" loading="lazy" decoding="async" />
                            <span id="user-mlt-balance" class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">--</span>
                            <span class="text-xs text-gray-400 ml-1">MLT</span>
                        </div>
                        
                        <!-- User Dropdown Menu -->
                        <div class="relative">
                            <button id="user-menu-btn" class="glass-effect px-3 py-2 rounded-lg hover:bg-white/10 transition cursor-pointer flex items-center space-x-2 whitespace-nowrap">
                                <i class="fas fa-user text-orange-500"></i>
                                <span id="username-display" class="text-white text-sm">載入中...</span>
                                <i class="fas fa-chevron-down text-gray-400 text-xs ml-1"></i>
                            </button>
                            
                            <!-- Dropdown Menu -->
                            <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-48 glass-effect rounded-lg shadow-xl border border-white/10 overflow-hidden z-50">
                                <a href="/dashboard" class="block px-4 py-3 text-white hover:bg-white/10 transition">
                                    <i class="fas fa-tachometer-alt mr-2 text-orange-500"></i>儀表板
                                </a>
                                <a href="/portfolio" class="block px-4 py-3 text-white hover:bg-white/10 transition">
                                    <i class="fas fa-wallet mr-2 text-green-400"></i>我的組合
                                </a>
                                <a href="/achievements" class="block px-4 py-3 text-white hover:bg-white/10 transition">
                                    <i class="fas fa-trophy mr-2 text-yellow-400"></i>成就
                                </a>
                                <div class="border-t border-white/10"></div>
                                <button id="logout-btn-dropdown" class="w-full text-left px-4 py-3 text-red-400 hover:bg-white/10 transition">
                                    <i class="fas fa-sign-out-alt mr-2"></i>登出
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            <div id="profile-content">
                <!-- Loading -->
                <div class="text-center py-20">
                    <i class="fas fa-spinner fa-spin text-6xl text-orange-500 mb-4"></i>
                    <p class="text-xl text-gray-400">載入中...</p>
                </div>
            </div>
        </div>

        
        <!-- Core utilities -->
        <script src="/static/fetch-utils.js?v=20260221151619"></script>
        
        <!-- Profile functionality -->
        <script src="/static/profile-page.js?v=20260221151619"></script>
    </body>
    </html>
  `);
})

// Redirect old dashboard auth flow to new pages
app.get('/dashboard/login', (c) => {
  return c.redirect('/login?redirect=/dashboard')
})

app.get('/dashboard/register', (c) => {
  return c.redirect('/signup?redirect=/dashboard', 308)
})

// WebSocket endpoint
app.get('/ws', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return c.text('Expected Upgrade: websocket', 426);
  }

  // Get Durable Object ID
  const id = c.env.REALTIME.idFromName('global');
  const stub = c.env.REALTIME.get(id);
  
  // Forward the request to the Durable Object
  return stub.fetch(c.req.raw);
});

export default app;

// Export Durable Object
export { RealtimeDurableObject };
