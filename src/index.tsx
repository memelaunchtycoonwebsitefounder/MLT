import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { Env } from './types';
import { authMiddleware, optionalAuthMiddleware } from './middleware';

// Import routes
import auth from './routes/auth';
import coins from './routes/coins';
import trades from './routes/trades';
import portfolio from './routes/portfolio';
import leaderboard from './routes/leaderboard';
import email from './routes/email';

const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use('/api/*', cors());

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

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

// Portfolio routes (requires authentication)
const portfolioRoutes = new Hono<{ Bindings: Env }>();
portfolioRoutes.use('*', authMiddleware);
portfolioRoutes.route('/', portfolio);
app.route('/api/portfolio', portfolioRoutes);

app.route('/api/leaderboard', leaderboard);
app.route('/api/email', email);

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'MemeLaunch Tycoon API is running',
    timestamp: new Date().toISOString()
  });
});

// Landing page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MemeLaunch Tycoon - 模因幣發射大亨</title>
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
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .gradient-bg {
            background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%);
          }
          .glass-effect {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .glow {
            box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
          }
        </style>
    </head>
    <body class="gradient-bg text-white min-h-screen">
        <!-- Navigation -->
        <nav class="container mx-auto px-4 py-6">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-rocket text-3xl text-orange-500"></i>
                    <h1 class="text-2xl font-bold">MemeLaunch Tycoon</h1>
                </div>
                <div class="space-x-4">
                    <button id="loginBtn" class="px-6 py-2 rounded-lg glass-effect hover:bg-white hover:bg-opacity-10 transition">
                        登入
                    </button>
                    <button id="registerBtn" class="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition glow">
                        開始遊戲
                    </button>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="container mx-auto px-4 py-20 text-center">
            <div class="max-w-4xl mx-auto">
                <h2 class="text-6xl font-black mb-6 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                    在模因幣宇宙中<br/>成為億萬富翁！
                </h2>
                <p class="text-xl text-gray-300 mb-8">
                    無風險模擬遊戲 • 創建你的模因幣 • 交易模擬 • 競爭排行榜
                </p>
                <div class="flex justify-center space-x-4 mb-12">
                    <div class="glass-effect px-8 py-4 rounded-lg">
                        <i class="fas fa-coins text-yellow-500 text-3xl mb-2"></i>
                        <p class="text-sm text-gray-400">起始資金</p>
                        <p class="text-2xl font-bold">10,000 金幣</p>
                    </div>
                    <div class="glass-effect px-8 py-4 rounded-lg">
                        <i class="fas fa-users text-blue-500 text-3xl mb-2"></i>
                        <p class="text-sm text-gray-400">活躍玩家</p>
                        <p class="text-2xl font-bold">1,234+</p>
                    </div>
                    <div class="glass-effect px-8 py-4 rounded-lg">
                        <i class="fas fa-chart-line text-green-500 text-3xl mb-2"></i>
                        <p class="text-sm text-gray-400">創建的幣種</p>
                        <p class="text-2xl font-bold">5,678+</p>
                    </div>
                </div>
                
                <!-- Email Signup Form -->
                <form class="email-signup-form mb-6" data-source="hero_section">
                    <input 
                        type="email" 
                        name="email"
                        placeholder="輸入你的郵箱，立即開始"
                        required
                    />
                    <button type="submit" class="cta-button" data-cta="hero_signup">
                        <i class="fas fa-rocket mr-2"></i>
                        立即開始（完全免費）
                    </button>
                </form>
                <div class="form-message"></div>
                
                <p class="text-sm text-gray-400 mt-4">
                    <i class="fas fa-shield-alt mr-2"></i>
                    無需信用卡 • 100% 免費 • 隨時可以退出
                </p>
            </div>
        </section>

        <!-- Features Section -->
        <section class="container mx-auto px-4 py-20">
            <h3 class="text-4xl font-bold text-center mb-12">遊戲特色</h3>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="glass-effect p-8 rounded-xl hover:scale-105 transition">
                    <i class="fas fa-image text-5xl text-orange-500 mb-4"></i>
                    <h4 class="text-2xl font-bold mb-3">創建模因幣</h4>
                    <p class="text-gray-400">上傳你的模因圖片，設定幣種名稱和供應量，立即發射你的加密貨幣！</p>
                </div>
                <div class="glass-effect p-8 rounded-xl hover:scale-105 transition">
                    <i class="fas fa-chart-candlestick text-5xl text-green-500 mb-4"></i>
                    <h4 class="text-2xl font-bold mb-3">真實模擬交易</h4>
                    <p class="text-gray-400">使用 Bonding Curve 算法的價格模擬，體驗真實的市場波動和交易策略。</p>
                </div>
                <div class="glass-effect p-8 rounded-xl hover:scale-105 transition">
                    <i class="fas fa-trophy text-5xl text-yellow-500 mb-4"></i>
                    <h4 class="text-2xl font-bold mb-3">排行榜競爭</h4>
                    <p class="text-gray-400">與全球玩家競爭，成為最頂尖的模因幣交易員，贏取榮譽徽章！</p>
                </div>
            </div>
        </section>

        <!-- How It Works -->
        <section class="container mx-auto px-4 py-20">
            <h3 class="text-4xl font-bold text-center mb-12">如何開始</h3>
            <div class="max-w-3xl mx-auto space-y-6">
                <div class="flex items-center space-x-4 glass-effect p-6 rounded-xl">
                    <div class="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">1</div>
                    <div>
                        <h4 class="text-xl font-bold">註冊並獲得 10,000 金幣</h4>
                        <p class="text-gray-400">完全免費，無需信用卡</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4 glass-effect p-6 rounded-xl">
                    <div class="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">2</div>
                    <div>
                        <h4 class="text-xl font-bold">創建你的第一個模因幣</h4>
                        <p class="text-gray-400">僅需 100 金幣，3 步驟完成創建</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4 glass-effect p-6 rounded-xl">
                    <div class="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">3</div>
                    <div>
                        <h4 class="text-xl font-bold">交易並賺取虛擬利潤</h4>
                        <p class="text-gray-400">買入賣出，追蹤你的投資組合</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4 glass-effect p-6 rounded-xl">
                    <div class="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">4</div>
                    <div>
                        <h4 class="text-xl font-bold">登上排行榜</h4>
                        <p class="text-gray-400">成為頂尖的模因幣大亨</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="container mx-auto px-4 py-20 text-center">
            <div class="glass-effect p-12 rounded-2xl max-w-3xl mx-auto glow">
                <h3 class="text-4xl font-bold mb-4">準備好開始了嗎？</h3>
                <p class="text-xl text-gray-300 mb-8">加入數千名玩家，開始你的模因幣帝國！</p>
                
                <!-- Email Signup Form -->
                <form class="email-signup-form" data-source="final_cta">
                    <input 
                        type="email" 
                        name="email"
                        placeholder="輸入你的郵箱"
                        required
                    />
                    <button type="submit" class="cta-button" data-cta="final_cta_signup">
                        <i class="fas fa-rocket mr-2"></i>
                        立即免費註冊
                    </button>
                </form>
                <div class="form-message"></div>
                
                <p class="text-sm text-gray-400 mt-4">
                    <i class="fas fa-shield-alt mr-2"></i>
                    100% 模擬遊戲 • 無真實金錢交易 • 無需信用卡
                </p>
            </div>
        </section>

        <!-- Footer -->
        <footer class="container mx-auto px-4 py-8 border-t border-gray-800 mt-20">
            <div class="flex justify-between items-center">
                <p class="text-gray-400">© 2026 MemeLaunch Tycoon. All rights reserved.</p>
                <div class="space-x-6">
                    <a href="#" class="text-gray-400 hover:text-white transition">隱私政策</a>
                    <a href="#" class="text-gray-400 hover:text-white transition">服務條款</a>
                    <a href="/dashboard" class="text-gray-400 hover:text-white transition">儀表板</a>
                </div>
            </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/landing.js"></script>
        <script>
          // Redirect to dashboard/register for now
          document.getElementById('registerBtn').addEventListener('click', () => {
            window.location.href = '/dashboard';
          });
          document.getElementById('loginBtn').addEventListener('click', () => {
            window.location.href = '/dashboard';
          });
        </script>
    </body>
    </html>
  `);
});

// Signup page
app.get('/signup', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>註冊 - MemeLaunch Tycoon</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
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
                    <p class="text-gray-400 mt-2">開始你的模因幣帝國</p>
                </div>

                <!-- Signup Form -->
                <div class="glass-effect rounded-2xl p-8">
                    <h2 class="text-2xl font-bold mb-6 text-center">創建帳號</h2>
                    
                    <form id="signup-form" class="space-y-4">
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

                        <!-- Username -->
                        <div>
                            <label for="username" class="block text-sm font-medium mb-2">
                                <i class="fas fa-user mr-2"></i>用戶名稱
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                required
                                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white"
                                placeholder="選擇一個用戶名"
                            />
                            <p class="text-red-400 text-sm mt-1 hidden" id="username-error"></p>
                        </div>

                        <!-- Password -->
                        <div>
                            <label for="password" class="block text-sm font-medium mb-2">
                                <i class="fas fa-lock mr-2"></i>密碼
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
                                <i class="fas fa-lock mr-2"></i>確認密碼
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

                        <!-- Terms Agreement -->
                        <div class="flex items-start">
                            <input
                                type="checkbox"
                                id="terms"
                                name="terms"
                                required
                                class="mt-1 w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            />
                            <label for="terms" class="ml-2 text-sm text-gray-300">
                                我同意 <a href="/terms" class="text-orange-500 hover:underline">服務條款</a> 和 <a href="/privacy" class="text-orange-500 hover:underline">隱私政策</a>
                            </label>
                        </div>
                        <p class="text-red-400 text-sm hidden" id="terms-error"></p>

                        <!-- Submit Button -->
                        <button
                            type="submit"
                            id="submit-btn"
                            class="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <i class="fas fa-user-plus mr-2"></i>
                            <span id="submit-text">創建帳號</span>
                        </button>

                        <!-- Form Message -->
                        <div id="form-message" class="hidden mt-4 p-4 rounded-lg"></div>
                    </form>

                    <!-- Social Login (Optional) -->
                    <div class="mt-6">
                        <div class="relative">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t border-white/10"></div>
                            </div>
                            <div class="relative flex justify-center text-sm">
                                <span class="px-2 bg-transparent text-gray-400">或使用社交帳號註冊</span>
                            </div>
                        </div>
                        <div class="mt-4 grid grid-cols-2 gap-3">
                            <button class="flex items-center justify-center px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition">
                                <i class="fab fa-google mr-2"></i> Google
                            </button>
                            <button class="flex items-center justify-center px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition">
                                <i class="fab fa-twitter mr-2"></i> Twitter
                            </button>
                        </div>
                    </div>

                    <!-- Login Link -->
                    <p class="mt-6 text-center text-sm text-gray-400">
                        已有帳號？ <a href="/login" class="text-orange-500 hover:underline font-medium">立即登入</a>
                    </p>
                </div>

                <!-- Disclaimer -->
                <p class="mt-6 text-center text-xs text-gray-500">
                    🔒 100% 模擬遊戲 • 無實際金錢交易 • 您的數據安全受保護
                </p>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/auth.js"></script>
    </body>
    </html>
  `);
});

// Login page
app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>登入 - MemeLaunch Tycoon</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
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
                    <p class="text-gray-400 mt-2">歡迎回來！</p>
                </div>

                <!-- Login Form -->
                <div class="glass-effect rounded-2xl p-8">
                    <h2 class="text-2xl font-bold mb-6 text-center">登入帳號</h2>
                    
                    <form id="login-form" class="space-y-4">
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

                        <!-- Password -->
                        <div>
                            <label for="password" class="block text-sm font-medium mb-2">
                                <i class="fas fa-lock mr-2"></i>密碼
                            </label>
                            <div class="relative">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white"
                                    placeholder="輸入您的密碼"
                                />
                                <button
                                    type="button"
                                    id="toggle-password"
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <p class="text-red-400 text-sm mt-1 hidden" id="password-error"></p>
                        </div>

                        <!-- Remember Me & Forgot Password -->
                        <div class="flex items-center justify-between">
                            <label class="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember-me"
                                    name="remember-me"
                                    class="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                />
                                <span class="ml-2 text-sm text-gray-300">記住我</span>
                            </label>
                            <a href="/forgot-password" class="text-sm text-orange-500 hover:underline">
                                忘記密碼？
                            </a>
                        </div>

                        <!-- Submit Button -->
                        <button
                            type="submit"
                            id="submit-btn"
                            class="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <i class="fas fa-sign-in-alt mr-2"></i>
                            <span id="submit-text">登入</span>
                        </button>

                        <!-- Form Message -->
                        <div id="form-message" class="hidden mt-4 p-4 rounded-lg"></div>
                    </form>

                    <!-- Social Login (Optional) -->
                    <div class="mt-6">
                        <div class="relative">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t border-white/10"></div>
                            </div>
                            <div class="relative flex justify-center text-sm">
                                <span class="px-2 bg-transparent text-gray-400">或使用社交帳號登入</span>
                            </div>
                        </div>
                        <div class="mt-4 grid grid-cols-2 gap-3">
                            <button class="flex items-center justify-center px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition">
                                <i class="fab fa-google mr-2"></i> Google
                            </button>
                            <button class="flex items-center justify-center px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition">
                                <i class="fab fa-twitter mr-2"></i> Twitter
                            </button>
                        </div>
                    </div>

                    <!-- Signup Link -->
                    <p class="mt-6 text-center text-sm text-gray-400">
                        還沒有帳號？ <a href="/signup" class="text-orange-500 hover:underline font-medium">立即註冊</a>
                    </p>
                </div>

                <!-- Disclaimer -->
                <p class="mt-6 text-center text-xs text-gray-500">
                    🔒 100% 模擬遊戲 • 無實際金錢交易
                </p>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/auth.js"></script>
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
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
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

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/auth.js"></script>
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
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
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

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/auth.js"></script>
    </body>
    </html>
  `);
});

// Dashboard page
app.get('/dashboard', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>儀表板 - MemeLaunch Tycoon</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .gradient-bg { background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%); }
          .glass-effect {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        </style>
    </head>
    <body class="gradient-bg text-white min-h-screen">
        <!-- Navigation -->
        <nav class="glass-effect sticky top-0 z-50">
            <div class="container mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-6">
                        <a href="/" class="flex items-center space-x-2">
                            <i class="fas fa-rocket text-2xl text-orange-500"></i>
                            <span class="text-xl font-bold">MemeLaunch</span>
                        </a>
                        <a href="/dashboard" class="hover:text-orange-500 transition">儀表板</a>
                        <a href="/market" class="hover:text-orange-500 transition">市場</a>
                        <a href="/portfolio" class="hover:text-orange-500 transition">我的組合</a>
                        <a href="/leaderboard" class="hover:text-orange-500 transition">排行榜</a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="glass-effect px-4 py-2 rounded-lg">
                            <i class="fas fa-coins text-yellow-500 mr-2"></i>
                            <span id="userBalance">--</span> 金幣
                        </div>
                        <button id="authBtn" class="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition">
                            登入/註冊
                        </button>
                        <button id="logoutBtn" class="px-4 py-2 rounded-lg glass-effect hover:bg-white hover:bg-opacity-10 transition hidden">
                            登出
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            <!-- Auth Section (shown when not logged in) -->
            <div id="authSection" class="max-w-md mx-auto">
                <div class="glass-effect p-8 rounded-xl">
                    <h2 class="text-3xl font-bold mb-6 text-center">歡迎來到 MemeLaunch Tycoon</h2>
                    
                    <!-- Login/Register Tabs -->
                    <div class="flex mb-6 bg-black bg-opacity-30 rounded-lg p-1">
                        <button id="loginTab" class="flex-1 py-2 rounded-lg bg-orange-500 transition">登入</button>
                        <button id="registerTab" class="flex-1 py-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition">註冊</button>
                    </div>

                    <!-- Login Form -->
                    <form id="loginForm" class="space-y-4">
                        <div>
                            <label class="block text-sm mb-2">電子郵件</label>
                            <input type="email" id="loginEmail" class="w-full px-4 py-2 rounded-lg bg-black bg-opacity-30 border border-gray-700 focus:border-orange-500 focus:outline-none" required>
                        </div>
                        <div>
                            <label class="block text-sm mb-2">密碼</label>
                            <input type="password" id="loginPassword" class="w-full px-4 py-2 rounded-lg bg-black bg-opacity-30 border border-gray-700 focus:border-orange-500 focus:outline-none" required>
                        </div>
                        <button type="submit" class="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition font-bold">
                            登入
                        </button>
                    </form>

                    <!-- Register Form -->
                    <form id="registerForm" class="space-y-4 hidden">
                        <div>
                            <label class="block text-sm mb-2">電子郵件</label>
                            <input type="email" id="registerEmail" class="w-full px-4 py-2 rounded-lg bg-black bg-opacity-30 border border-gray-700 focus:border-orange-500 focus:outline-none" required>
                        </div>
                        <div>
                            <label class="block text-sm mb-2">用戶名</label>
                            <input type="text" id="registerUsername" class="w-full px-4 py-2 rounded-lg bg-black bg-opacity-30 border border-gray-700 focus:border-orange-500 focus:outline-none" required>
                        </div>
                        <div>
                            <label class="block text-sm mb-2">密碼 (至少 6 個字符)</label>
                            <input type="password" id="registerPassword" class="w-full px-4 py-2 rounded-lg bg-black bg-opacity-30 border border-gray-700 focus:border-orange-500 focus:outline-none" required>
                        </div>
                        <button type="submit" class="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition font-bold">
                            註冊並獲得 10,000 金幣
                        </button>
                    </form>

                    <div id="authError" class="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-sm hidden"></div>
                    <div id="authSuccess" class="mt-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg text-sm hidden"></div>
                </div>
            </div>

            <!-- Dashboard Content (shown when logged in) -->
            <div id="dashboardContent" class="hidden">
                <div class="grid md:grid-cols-3 gap-6 mb-8">
                    <div class="glass-effect p-6 rounded-xl">
                        <i class="fas fa-wallet text-3xl text-yellow-500 mb-3"></i>
                        <p class="text-gray-400 text-sm">總餘額</p>
                        <p class="text-3xl font-bold" id="dashBalance">--</p>
                    </div>
                    <div class="glass-effect p-6 rounded-xl">
                        <i class="fas fa-chart-line text-3xl text-green-500 mb-3"></i>
                        <p class="text-gray-400 text-sm">投資組合價值</p>
                        <p class="text-3xl font-bold" id="portfolioValue">--</p>
                    </div>
                    <div class="glass-effect p-6 rounded-xl">
                        <i class="fas fa-percentage text-3xl text-blue-500 mb-3"></i>
                        <p class="text-gray-400 text-sm">總盈虧</p>
                        <p class="text-3xl font-bold" id="totalPnL">--</p>
                    </div>
                </div>

                <div class="glass-effect p-8 rounded-xl mb-8">
                    <h3 class="text-2xl font-bold mb-6">快速操作</h3>
                    <div class="grid md:grid-cols-3 gap-4">
                        <button onclick="window.location.href='/create'" class="p-6 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition text-center">
                            <i class="fas fa-plus-circle text-4xl mb-3"></i>
                            <p class="font-bold">創建模因幣</p>
                        </button>
                        <button onclick="window.location.href='/market'" class="p-6 rounded-lg glass-effect hover:bg-white hover:bg-opacity-10 transition text-center">
                            <i class="fas fa-store text-4xl mb-3"></i>
                            <p class="font-bold">瀏覽市場</p>
                        </button>
                        <button onclick="window.location.href='/portfolio'" class="p-6 rounded-lg glass-effect hover:bg-white hover:bg-opacity-10 transition text-center">
                            <i class="fas fa-briefcase text-4xl mb-3"></i>
                            <p class="font-bold">我的投資組合</p>
                        </button>
                    </div>
                </div>

                <div class="glass-effect p-8 rounded-xl">
                    <h3 class="text-2xl font-bold mb-6">熱門幣種</h3>
                    <div id="trendingCoins" class="space-y-4">
                        <p class="text-gray-400 text-center py-8">載入中...</p>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          const API_BASE = '/api';
          let token = localStorage.getItem('token');
          let currentUser = null;

          // Tab switching
          document.getElementById('loginTab').addEventListener('click', () => {
            document.getElementById('loginTab').classList.add('bg-orange-500');
            document.getElementById('registerTab').classList.remove('bg-orange-500');
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('registerForm').classList.add('hidden');
          });

          document.getElementById('registerTab').addEventListener('click', () => {
            document.getElementById('registerTab').classList.add('bg-orange-500');
            document.getElementById('loginTab').classList.remove('bg-orange-500');
            document.getElementById('registerForm').classList.remove('hidden');
            document.getElementById('loginForm').classList.add('hidden');
          });

          // Login
          document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
              const response = await axios.post(API_BASE + '/auth/login', { email, password });
              token = response.data.data.token;
              localStorage.setItem('token', token);
              showSuccess('登入成功！');
              setTimeout(() => location.reload(), 1000);
            } catch (error) {
              showError(error.response?.data?.error || '登入失敗');
            }
          });

          // Register
          document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;

            try {
              const response = await axios.post(API_BASE + '/auth/register', { email, username, password });
              token = response.data.data.token;
              localStorage.setItem('token', token);
              showSuccess('註冊成功！獲得 10,000 金幣');
              setTimeout(() => location.reload(), 1000);
            } catch (error) {
              showError(error.response?.data?.error || '註冊失敗');
            }
          });

          // Logout
          document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('token');
            location.reload();
          });

          function showError(message) {
            const errorEl = document.getElementById('authError');
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
            setTimeout(() => errorEl.classList.add('hidden'), 5000);
          }

          function showSuccess(message) {
            const successEl = document.getElementById('authSuccess');
            successEl.textContent = message;
            successEl.classList.remove('hidden');
            setTimeout(() => successEl.classList.add('hidden'), 5000);
          }

          async function loadUserData() {
            if (!token) return;

            try {
              const response = await axios.get(API_BASE + '/auth/me', {
                headers: { Authorization: 'Bearer ' + token }
              });
              currentUser = response.data.data;
              
              // Update UI
              document.getElementById('authSection').classList.add('hidden');
              document.getElementById('dashboardContent').classList.remove('hidden');
              document.getElementById('authBtn').classList.add('hidden');
              document.getElementById('logoutBtn').classList.remove('hidden');
              document.getElementById('userBalance').textContent = currentUser.virtual_balance.toFixed(2);
              document.getElementById('dashBalance').textContent = currentUser.virtual_balance.toFixed(2) + ' 金幣';

              // Load portfolio
              await loadPortfolio();
              // Load trending coins
              await loadTrendingCoins();
            } catch (error) {
              console.error('Failed to load user data:', error);
              localStorage.removeItem('token');
              token = null;
            }
          }

          async function loadPortfolio() {
            try {
              const response = await axios.get(API_BASE + '/portfolio', {
                headers: { Authorization: 'Bearer ' + token }
              });
              const stats = response.data.data.stats;
              document.getElementById('portfolioValue').textContent = stats.totalValue.toFixed(2) + ' 金幣';
              const pnlClass = stats.totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500';
              document.getElementById('totalPnL').innerHTML = 
                '<span class="' + pnlClass + '">' + 
                (stats.totalProfitLoss >= 0 ? '+' : '') + stats.totalProfitLoss.toFixed(2) + 
                ' (' + stats.totalProfitLossPercent.toFixed(2) + '%)</span>';
            } catch (error) {
              console.error('Failed to load portfolio:', error);
            }
          }

          async function loadTrendingCoins() {
            try {
              const response = await axios.get(API_BASE + '/coins/trending/list?limit=5');
              const coins = response.data.data;
              const html = coins.map(coin => 
                '<div class="flex items-center justify-between p-4 glass-effect rounded-lg hover:bg-white hover:bg-opacity-5 transition cursor-pointer" onclick="window.location.href=\\'/coin/' + coin.id + '\\'">' +
                  '<div class="flex items-center space-x-4">' +
                    '<img src="' + (coin.image_url || '/static/default-coin.png') + '" class="w-12 h-12 rounded-full" alt="' + coin.name + '">' +
                    '<div>' +
                      '<p class="font-bold">' + coin.name + '</p>' +
                      '<p class="text-sm text-gray-400">' + coin.symbol + '</p>' +
                    '</div>' +
                  '</div>' +
                  '<div class="text-right">' +
                    '<p class="font-bold">$' + coin.current_price.toFixed(4) + '</p>' +
                    '<p class="text-sm text-gray-400">市值: $' + coin.market_cap.toFixed(2) + '</p>' +
                  '</div>' +
                '</div>'
              ).join('');
              document.getElementById('trendingCoins').innerHTML = html || '<p class="text-gray-400 text-center py-8">暫無數據</p>';
            } catch (error) {
              console.error('Failed to load trending coins:', error);
            }
          }

          // Initialize
          if (token) {
            loadUserData();
          }
        </script>
    </body>
    </html>
  `);
});

export default app;
