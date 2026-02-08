import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { FC } from 'hono/jsx'

// Type definitions for Cloudflare bindings
type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './' }))

// Landing Page Component
const LandingPage: FC = () => {
  return (
    <html lang="zh-TW">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MemeLaunch - 到月球之前，先在这里练手 | Meme 币模拟器</title>
        <meta name="description" content="无风险创建和交易 Meme 币。在安全的环境中学习加密货币、代币经济学和市场策略。100% 免费开始。" />
        <meta name="keywords" content="meme coin, 加密货币模拟器, web3 游戏, 代币经济学, pump.fun 替代品" />
        
        {/* Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Font Awesome Icons */}
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Custom Styles */}
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #1A1A2E;
            overflow-x: hidden;
          }
          
          .font-mono {
            font-family: 'JetBrains Mono', monospace;
          }
          
          /* Smooth scroll */
          html {
            scroll-behavior: smooth;
          }
          
          /* Gradient backgrounds */
          .bg-gradient-hero {
            background: linear-gradient(135deg, #1A1A2E 0%, #2D2D44 100%);
          }
          
          .bg-gradient-cta {
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          }
          
          /* Floating animation for coins */
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animate-float-delayed {
            animation: float 4s ease-in-out infinite;
            animation-delay: 1s;
          }
          
          /* Card hover effects */
          .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
          }
          
          /* Button effects */
          .btn-primary {
            background: #FF6B35;
            color: white;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            font-size: 16px;
          }
          
          .btn-primary:hover {
            background: #E55A2A;
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(255, 107, 53, 0.4);
          }
          
          .btn-secondary {
            background: transparent;
            color: white;
            padding: 16px 32px;
            border: 2px solid white;
            border-radius: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
            cursor: pointer;
            font-size: 16px;
          }
          
          .btn-secondary:hover {
            background: white;
            color: #1A1A2E;
          }
          
          /* Navbar sticky */
          .navbar-sticky {
            position: sticky;
            top: 0;
            z-index: 1000;
            backdrop-filter: blur(10px);
            background: rgba(26, 26, 46, 0.9);
          }
          
          /* Timeline line */
          .timeline-line {
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, #00D9FF 0%, #00D9FF 100%);
            position: relative;
          }
          
          /* Stats counter animation */
          @keyframes countUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .stat-number {
            animation: countUp 0.6s ease-out;
          }
          
          /* Mobile menu */
          .mobile-menu {
            display: none;
          }
          
          .mobile-menu.active {
            display: block;
          }
          
          /* Pricing card highlight */
          .pricing-vip {
            border: 2px solid #FF6B35;
            position: relative;
            transform: scale(1.05);
          }
          
          .pricing-badge {
            position: absolute;
            top: -12px;
            right: 20px;
            background: #00D9FF;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          
          /* Testimonial cards */
          .testimonial-card {
            background: #F9FAFB;
            border-radius: 16px;
            padding: 24px;
            transition: all 0.3s ease;
          }
          
          .testimonial-card:hover {
            background: #F0F2F5;
          }
          
          /* Responsive styles */
          @media (max-width: 768px) {
            .btn-primary, .btn-secondary {
              padding: 12px 24px;
              font-size: 14px;
            }
            
            h1 {
              font-size: 32px !important;
            }
            
            h2 {
              font-size: 28px !important;
            }
            
            h3 {
              font-size: 20px !important;
            }
            
            .pricing-vip {
              transform: scale(1);
            }
          }
        `}</style>
      </head>
      <body>
        {/* Navigation */}
        <nav class="navbar-sticky">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
              {/* Logo */}
              <div class="flex items-center">
                <span class="text-2xl font-bold text-white">🚀 MemeLaunch</span>
              </div>
              
              {/* Desktop Menu */}
              <div class="hidden md:flex items-center space-x-8">
                <a href="#features" class="text-gray-300 hover:text-white transition">Features</a>
                <a href="#how-it-works" class="text-gray-300 hover:text-white transition">How It Works</a>
                <a href="#pricing" class="text-gray-300 hover:text-white transition">Pricing</a>
                <a href="#testimonials" class="text-gray-300 hover:text-white transition">Testimonials</a>
                <button class="btn-primary" onclick="scrollToSignup()">立即开始</button>
              </div>
              
              {/* Mobile Menu Button */}
              <div class="md:hidden">
                <button id="mobile-menu-button" class="text-white">
                  <i class="fas fa-bars text-2xl"></i>
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <div id="mobile-menu" class="mobile-menu md:hidden bg-gray-900 px-4 py-4">
            <a href="#features" class="block text-gray-300 hover:text-white py-2">Features</a>
            <a href="#how-it-works" class="block text-gray-300 hover:text-white py-2">How It Works</a>
            <a href="#pricing" class="block text-gray-300 hover:text-white py-2">Pricing</a>
            <a href="#testimonials" class="block text-gray-300 hover:text-white py-2">Testimonials</a>
            <button class="btn-primary w-full mt-4" onclick="scrollToSignup()">立即开始</button>
          </div>
        </nav>

        {/* Section 1: Hero */}
        <section class="bg-gradient-hero text-white min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Floating coins decoration */}
          <div class="absolute top-20 left-10 text-6xl animate-float">💰</div>
          <div class="absolute top-40 right-20 text-5xl animate-float-delayed">🚀</div>
          <div class="absolute bottom-20 left-20 text-7xl animate-float">🌙</div>
          <div class="absolute bottom-40 right-10 text-6xl animate-float-delayed">💎</div>
          
          <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 class="text-5xl md:text-6xl font-bold mb-6">
              到月球之前，先在这里练手 🚀
            </h1>
            <p class="text-xl md:text-2xl mb-8 text-gray-300">
              创建你的第一枚 Meme 币 | 零风险 · 超好玩 · 真学到
            </p>
            
            <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button class="btn-primary text-lg" onclick="scrollToSignup()">
                立即开始（完全免费）
              </button>
              <a href="#demo-video" class="btn-secondary text-lg">
                观看 3 分钟演示
              </a>
            </div>
            
            <p class="text-gray-400 text-sm">
              ✨ 已有 10,256 名 Meme 大师在这里练习
            </p>
          </div>
        </section>

        {/* Section 2: Problem Statement */}
        <section id="problems" class="py-20 bg-white">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-4xl font-bold text-center mb-16">新手在 Meme 币市场的困境</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pain Point 1 */}
              <div class="card-hover bg-white p-8 rounded-2xl shadow-md text-center">
                <div class="text-6xl mb-4">💸</div>
                <h3 class="text-2xl font-bold mb-4">真金白银的代价</h3>
                <p class="text-gray-600 text-lg">
                  95% 的新手在第一次交易中亏损。学习成本太高。
                </p>
              </div>
              
              {/* Pain Point 2 */}
              <div class="card-hover bg-white p-8 rounded-2xl shadow-md text-center">
                <div class="text-6xl mb-4">😰</div>
                <h3 class="text-2xl font-bold mb-4">复杂且令人困惑</h3>
                <p class="text-gray-600 text-lg">
                  联合曲线？流动性池？这些术语吓跑了多少人？
                </p>
              </div>
              
              {/* Pain Point 3 */}
              <div class="card-hover bg-white p-8 rounded-2xl shadow-md text-center">
                <div class="text-6xl mb-4">🎲</div>
                <h3 class="text-2xl font-bold mb-4">缺乏练习环境</h3>
                <p class="text-gray-600 text-lg">
                  没有安全的地方可以测试策略和创意。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Solution */}
        <section id="solution" class="py-20" style="background: linear-gradient(180deg, #F5F7FA 0%, white 100%);">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-4xl font-bold text-center mb-4">MemeLaunch：你的加密训练场</h2>
            <p class="text-xl text-gray-600 text-center mb-16">
              在安全的环境中体验 Meme 币的完整生命周期
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* VP 1 */}
              <div class="text-center">
                <div class="text-7xl mb-6" style="color: #FF6B35;">🔒</div>
                <h3 class="text-2xl font-bold mb-4">零风险学习</h3>
                <p class="text-gray-600 text-lg">
                  用虚拟货币体验真实的 Meme 币创建和交易。永远不会损失一分真钱。
                </p>
              </div>
              
              {/* VP 2 */}
              <div class="text-center">
                <div class="text-7xl mb-6" style="color: #FF6B35;">🎮</div>
                <h3 class="text-2xl font-bold mb-4">超级有趣</h3>
                <p class="text-gray-600 text-lg">
                  游戏化设计，Meme 文化原生。排行榜、成就、公会战——比真实交易更刺激！
                </p>
              </div>
              
              {/* VP 3 */}
              <div class="text-center">
                <div class="text-7xl mb-6" style="color: #FF6B35;">🎓</div>
                <h3 class="text-2xl font-bold mb-4">真学到东西</h3>
                <p class="text-gray-600 text-lg">
                  理解联合曲线、代币经济学、市场心理。从新手到专家，只需 7 天。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: How It Works */}
        <section id="how-it-works" class="py-20 bg-white">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-4xl font-bold text-center mb-16">3 步开始你的 Meme 币帝国</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Timeline line (desktop only) */}
              <div class="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400" style="background: linear-gradient(90deg, #00D9FF 0%, #00D9FF 50%, #00D9FF 100%); top: 70px; left: 15%; right: 15%;"></div>
              
              {/* Step 1 */}
              <div class="text-center relative">
                <div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6 relative z-10" style="background: #00D9FF;">
                  1
                </div>
                <div class="bg-gray-100 rounded-2xl p-6 mb-4 mx-auto" style="height: 200px; display: flex; align-items: center; justify-content: center;">
                  <span class="text-6xl">🎨</span>
                </div>
                <h3 class="text-xl font-bold mb-3">选择或生成 Meme</h3>
                <p class="text-gray-600">
                  从我们的素材库选择，或使用 AI 生成器创建独一无二的 Meme 图片
                </p>
              </div>
              
              {/* Step 2 */}
              <div class="text-center relative">
                <div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6 relative z-10" style="background: #00D9FF;">
                  2
                </div>
                <div class="bg-gray-100 rounded-2xl p-6 mb-4 mx-auto" style="height: 200px; display: flex; align-items: center; justify-content: center;">
                  <span class="text-6xl">✍️</span>
                </div>
                <h3 class="text-xl font-bold mb-3">命名你的代币</h3>
                <p class="text-gray-600">
                  设置名称、代号、供应量。我们的 AI 会评估你的创意潜力
                </p>
              </div>
              
              {/* Step 3 */}
              <div class="text-center relative">
                <div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6 relative z-10" style="background: #00D9FF;">
                  3
                </div>
                <div class="bg-gray-100 rounded-2xl p-6 mb-4 mx-auto" style="height: 200px; display: flex; align-items: center; justify-content: center;">
                  <span class="text-6xl">🚀</span>
                </div>
                <h3 class="text-xl font-bold mb-3">发布并看着它登月</h3>
                <p class="text-gray-600">
                  营销、交易、竞争。在安全的环境中体验暴涨（或暴跌）
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Features Grid */}
        <section id="features" class="py-20 bg-gray-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-4xl font-bold text-center mb-16">为什么选择 MemeLaunch？</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div class="card-hover bg-white p-8 rounded-2xl border border-gray-200">
                <div class="text-5xl mb-4">🤖</div>
                <h3 class="text-xl font-bold mb-3">AI Meme 生成器</h3>
                <p class="text-gray-600">
                  输入关键词，AI 瞬间生成爆笑 Meme。无限创意，零设计技能。
                </p>
              </div>
              
              {/* Feature 2 */}
              <div class="card-hover bg-white p-8 rounded-2xl border border-gray-200">
                <div class="text-5xl mb-4">📈</div>
                <h3 class="text-xl font-bold mb-3">真实市场模拟</h3>
                <p class="text-gray-600">
                  联合曲线定价、订单簿、K 线图。体验真实的交易环境。
                </p>
              </div>
              
              {/* Feature 3 */}
              <div class="card-hover bg-white p-8 rounded-2xl border border-gray-200">
                <div class="text-5xl mb-4">🏆</div>
                <h3 class="text-xl font-bold mb-3">全球排行榜</h3>
                <p class="text-gray-600">
                  与世界各地的 Meme 大师竞争。谁的币能登上市值榜首？
                </p>
              </div>
              
              {/* Feature 4 */}
              <div class="card-hover bg-white p-8 rounded-2xl border border-gray-200">
                <div class="text-5xl mb-4">🎯</div>
                <h3 class="text-xl font-bold mb-3">成就系统</h3>
                <p class="text-gray-600">
                  50+ 成就等你解锁。从'初代发币人'到'Meme 传奇'。
                </p>
              </div>
              
              {/* Feature 5 */}
              <div class="card-hover bg-white p-8 rounded-2xl border border-gray-200">
                <div class="text-5xl mb-4">👥</div>
                <h3 class="text-xl font-bold mb-3">社交互动</h3>
                <p class="text-gray-600">
                  加入公会、组队竞争、分享战绩。Meme 文化就是社交文化。
                </p>
              </div>
              
              {/* Feature 6 */}
              <div class="card-hover bg-white p-8 rounded-2xl border border-gray-200">
                <div class="text-5xl mb-4">📚</div>
                <h3 class="text-xl font-bold mb-3">边玩边学</h3>
                <p class="text-gray-600">
                  内置教程教你代币经济学、市场心理学、风险管理。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Testimonials */}
        <section id="testimonials" class="py-20 bg-white">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-4xl font-bold text-center mb-16">用户怎么说</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div class="testimonial-card">
                <div class="flex items-center mb-4">
                  <div class="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-3xl mr-4">
                    👨‍💻
                  </div>
                  <div>
                    <div class="font-bold">@cryptoAlex</div>
                    <div class="text-sm text-gray-500">加密爱好者</div>
                  </div>
                </div>
                <p class="text-gray-700 italic mb-4">
                  "玩了一周，现在我终于懂 Pump.fun 了！比看 100 篇教程管用。"
                </p>
                <div class="text-yellow-500">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div class="testimonial-card">
                <div class="flex items-center mb-4">
                  <div class="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-3xl mr-4">
                    👩‍🚀
                  </div>
                  <div>
                    <div class="font-bold">@web3Sarah</div>
                    <div class="text-sm text-gray-500">Web3 创业者</div>
                  </div>
                </div>
                <p class="text-gray-700 italic mb-4">
                  "我在这里测试了 20 个 Meme 币创意，最后才在真实平台发布。结果？成功登月！"
                </p>
                <div class="text-yellow-500">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              
              {/* Testimonial 3 */}
              <div class="testimonial-card">
                <div class="flex items-center mb-4">
                  <div class="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-3xl mr-4">
                    🎮
                  </div>
                  <div>
                    <div class="font-bold">@gamingMarcus</div>
                    <div class="text-sm text-gray-500">游戏开发者</div>
                  </div>
                </div>
                <p class="text-gray-700 italic mb-4">
                  "从来没想过学加密可以这么好玩。我甚至把这个推荐给我妈了。"
                </p>
                <div class="text-yellow-500">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Pricing */}
        <section id="pricing" class="py-20 bg-gray-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-4xl font-bold text-center mb-16">选择适合你的计划</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div class="card-hover bg-white p-8 rounded-2xl border-2 border-gray-200">
                <h3 class="text-2xl font-bold mb-4">FREE</h3>
                <div class="text-4xl font-bold mb-6">$0 <span class="text-lg text-gray-500 font-normal">/ 永久免费</span></div>
                
                <ul class="space-y-3 mb-8">
                  <li class="flex items-center"><span class="text-green-500 mr-2">✅</span> 每日创建 1 枚币</li>
                  <li class="flex items-center"><span class="text-green-500 mr-2">✅</span> 基础营销工具</li>
                  <li class="flex items-center"><span class="text-green-500 mr-2">✅</span> 参与交易市场</li>
                  <li class="flex items-center"><span class="text-green-500 mr-2">✅</span> 查看排行榜</li>
                  <li class="flex items-center"><span class="text-red-500 mr-2">❌</span> AI Meme 生成器</li>
                  <li class="flex items-center"><span class="text-red-500 mr-2">❌</span> 高级图表工具</li>
                </ul>
                
                <button class="w-full btn-primary" onclick="scrollToSignup()">立即开始</button>
              </div>
              
              {/* VIP Plan */}
              <div class="pricing-vip card-hover bg-white p-8 rounded-2xl relative">
                <div class="pricing-badge">最受欢迎</div>
                
                <h3 class="text-2xl font-bold mb-4">VIP</h3>
                <div class="text-4xl font-bold mb-6" style="color: #FF6B35;">$4.99 <span class="text-lg text-gray-500 font-normal">/ 月</span></div>
                
                <ul class="space-y-3 mb-8">
                  <li class="flex items-center"><span class="text-green-500 mr-2">✅</span> 无限创建币</li>
                  <li class="flex items-center"><span class="text-green-500 mr-2">✅</span> AI Meme 生成器</li>
                  <li class="flex items-center"><span class="text-green-500 mr-2">✅</span> 高级营销工具</li>
                  <li class="flex items-center"><span class="text-green-500 mr-2">✅</span> 专属 VIP 徽章</li>
                  <li class="flex items-center"><span class="text-green-500 mr-2">✅</span> 无广告体验</li>
                  <li class="flex items-center"><span class="text-green-500 mr-2">✅</span> 优先客服</li>
                </ul>
                
                <button class="w-full btn-primary" onclick="scrollToSignup()">开始 7 天免费试用</button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Statistics */}
        <section id="stats" class="py-20 bg-white">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-4xl font-bold text-center mb-16">加入全球最大的 Meme 币训练营</h2>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div class="text-center">
                <div class="text-5xl font-bold stat-number mb-2" style="color: #FF6B35;">10,256+</div>
                <div class="text-gray-600">活跃用户</div>
              </div>
              
              <div class="text-center">
                <div class="text-5xl font-bold stat-number mb-2" style="color: #FF6B35;">125,384+</div>
                <div class="text-gray-600">创建的币</div>
              </div>
              
              <div class="text-center">
                <div class="text-5xl font-bold stat-number mb-2" style="color: #FF6B35;">4.8/5</div>
                <div class="text-gray-600">用户评分</div>
              </div>
              
              <div class="text-center">
                <div class="text-5xl font-bold stat-number mb-2" style="color: #FF6B35;">45%</div>
                <div class="text-gray-600">7日留存</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 9: Final CTA */}
        <section id="signup" class="py-20 bg-gradient-cta text-white">
          <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-4xl md:text-5xl font-bold mb-6">准备好造你的第一枚 Meme 币了吗？</h2>
            <p class="text-xl mb-8">加入 10,000+ 用户，开始你的加密之旅</p>
            
            <div class="max-w-xl mx-auto">
              <form class="flex flex-col sm:flex-row gap-4 bg-white rounded-full p-2" onsubmit="handleSignup(event)">
                <input 
                  type="email" 
                  id="email-input"
                  placeholder="输入你的邮箱" 
                  required
                  class="flex-1 px-6 py-3 rounded-full text-gray-800 focus:outline-none"
                />
                <button type="submit" class="btn-primary rounded-full whitespace-nowrap" style="background: #1A1A2E;">
                  立即开始（完全免费）
                </button>
              </form>
              
              <p class="text-sm mt-4 text-white/90">
                ✅ 无需信用卡 · ✅ 无需钱包 · ✅ 3 分钟上手
              </p>
            </div>
          </div>
        </section>

        {/* Section 10: Footer */}
        <footer class="bg-gray-900 text-gray-300 py-16">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Logo & Tagline */}
              <div class="col-span-1">
                <div class="text-2xl font-bold text-white mb-4">🚀 MemeLaunch</div>
                <p class="text-gray-400">到月球之前，先在这里练手</p>
              </div>
              
              {/* Column 1: Product */}
              <div>
                <h4 class="font-bold text-white mb-4">Product</h4>
                <ul class="space-y-2">
                  <li><a href="#features" class="hover:text-white transition">Features</a></li>
                  <li><a href="#how-it-works" class="hover:text-white transition">How It Works</a></li>
                  <li><a href="#pricing" class="hover:text-white transition">Pricing</a></li>
                  <li><a href="#" class="hover:text-white transition">Roadmap</a></li>
                </ul>
              </div>
              
              {/* Column 2: Resources */}
              <div>
                <h4 class="font-bold text-white mb-4">Resources</h4>
                <ul class="space-y-2">
                  <li><a href="#" class="hover:text-white transition">Blog</a></li>
                  <li><a href="#" class="hover:text-white transition">Help Center</a></li>
                  <li><a href="#" class="hover:text-white transition">Community Guidelines</a></li>
                  <li><a href="#" class="hover:text-white transition">API Docs</a></li>
                </ul>
              </div>
              
              {/* Column 3: Company */}
              <div>
                <h4 class="font-bold text-white mb-4">Company</h4>
                <ul class="space-y-2">
                  <li><a href="#" class="hover:text-white transition">About Us</a></li>
                  <li><a href="#" class="hover:text-white transition">Contact</a></li>
                  <li><a href="#" class="hover:text-white transition">Privacy Policy</a></li>
                  <li><a href="#" class="hover:text-white transition">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            
            {/* Social Media & Copyright */}
            <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div class="flex space-x-6 mb-4 md:mb-0">
                <a href="#" class="text-2xl hover:text-white transition"><i class="fab fa-twitter"></i></a>
                <a href="#" class="text-2xl hover:text-white transition"><i class="fab fa-discord"></i></a>
                <a href="#" class="text-2xl hover:text-white transition"><i class="fab fa-telegram"></i></a>
                <a href="#" class="text-2xl hover:text-white transition"><i class="fab fa-reddit"></i></a>
              </div>
              
              <div class="text-sm text-gray-500">
                © 2026 MemeLaunch. All rights reserved.
              </div>
            </div>
          </div>
        </footer>

        {/* JavaScript */}
        <script>{`
          // Mobile menu toggle
          document.getElementById('mobile-menu-button').addEventListener('click', function() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('active');
          });
          
          // Scroll to signup
          function scrollToSignup() {
            document.getElementById('signup').scrollIntoView({ behavior: 'smooth' });
          }
          
          // Handle signup form submission
          async function handleSignup(event) {
            event.preventDefault();
            const email = document.getElementById('email-input').value;
            
            try {
              const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
              });
              
              const data = await response.json();
              
              if (response.ok) {
                alert('感谢注册！我们会尽快联系你 🎉');
                document.getElementById('email-input').value = '';
              } else {
                alert(data.error || '注册失败，请重试');
              }
            } catch (error) {
              console.error('Signup error:', error);
              alert('网络错误，请重试');
            }
          }
          
          // Close mobile menu when clicking on a link
          document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', function() {
              document.getElementById('mobile-menu').classList.remove('active');
            });
          });
          
          // Add scroll animation to stats
          const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
          };
          
          const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.style.animation = 'countUp 0.6s ease-out';
              }
            });
          }, observerOptions);
          
          document.querySelectorAll('.stat-number').forEach(el => observer.observe(el));
        `}</script>
      </body>
    </html>
  )
}

// Landing page route
app.get('/', (c) => {
  return c.html(<LandingPage />)
})

// API route for waitlist signup
app.post('/api/waitlist', async (c) => {
  try {
    const { email } = await c.req.json()
    
    if (!email || !email.includes('@')) {
      return c.json({ error: 'Invalid email address' }, 400)
    }
    
    // TODO: Store email in database or send to email service
    // For now, just return success
    console.log('Waitlist signup:', email)
    
    return c.json({ 
      success: true, 
      message: 'Successfully added to waitlist' 
    })
  } catch (error) {
    console.error('Waitlist error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
