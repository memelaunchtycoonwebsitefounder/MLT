// Performance-optimized HTML head template
// Use this in src/index.tsx to replace existing head sections

const optimizedHead = (title: string, includeChart: boolean = false) => `
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#0A0B0D">
    <meta name="description" content="MemeLaunch Tycoon - 模因幣發射大亨。創建、交易和管理你的模因幣投資組合">
    <title>${title}</title>
    
    <!-- Preconnect to CDNs for faster loading -->
    <link rel="preconnect" href="https://cdn.tailwindcss.com">
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">
    
    <!-- Critical CSS (inline for faster FCP) -->
    <style>
      /* Critical above-the-fold styles */
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #0A0B0D;
        color: #FFFFFF;
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        -webkit-tap-highlight-color: transparent;
      }
      .gradient-bg {
        background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%);
      }
      .glass-effect {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      /* Loading spinner */
      .loading { 
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255,255,255,.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      
      /* Mobile optimizations */
      @media (max-width: 768px) {
        body { font-size: 14px; }
        .container { padding: 0.5rem !important; }
        button { min-height: 44px; min-width: 44px; }
      }
    </style>
    
    <!-- Non-critical CSS (deferred) -->
    <link href="/static/styles.css" rel="stylesheet" media="print" onload="this.media='all'">
    <noscript><link href="/static/styles.css" rel="stylesheet"></noscript>
    
    <!-- Deferred JavaScript (non-blocking) -->
    <script defer src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" media="print" onload="this.media='all'">
    
    ${includeChart ? `
    <!-- Chart library (lazy loaded) -->
    <script defer src="https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js"></script>
    ` : ''}
    
    <!-- Google Analytics (deferred) -->
    <script defer src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX', { 'send_page_view': false });
    </script>
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/icon-192.png">
</head>
`;

// Mobile-optimized navigation
const mobileNav = `
<!-- Mobile Bottom Navigation (hidden on desktop) -->
<nav class="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
  <div class="flex justify-around py-2">
    <a href="/market" class="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white transition">
      <i class="fas fa-chart-line text-xl mb-1"></i>
      <span class="text-xs">市場</span>
    </a>
    <a href="/portfolio" class="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white transition">
      <i class="fas fa-wallet text-xl mb-1"></i>
      <span class="text-xs">投資組合</span>
    </a>
    <a href="/create-coin" class="flex flex-col items-center py-2 px-3 text-orange-500 hover:text-orange-400 transition">
      <i class="fas fa-plus-circle text-2xl mb-1"></i>
      <span class="text-xs">創建</span>
    </a>
    <a href="/leaderboard" class="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white transition">
      <i class="fas fa-trophy text-xl mb-1"></i>
      <span class="text-xs">排行榜</span>
    </a>
    <a href="/dashboard/profile" class="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white transition">
      <i class="fas fa-user text-xl mb-1"></i>
      <span class="text-xs">我的</span>
    </a>
  </div>
</nav>
`;

// Responsive image template
const responsiveImage = (src: string, alt: string, className: string = '') => `
<picture>
  <source srcset="${src}.avif" type="image/avif">
  <source srcset="${src}.webp" type="image/webp">
  <img 
    src="${src}.jpg" 
    alt="${alt}" 
    loading="lazy"
    decoding="async"
    class="${className}"
    style="content-visibility: auto;"
  >
</picture>
`;

// Lazy load script template
const lazyLoadScript = (src: string) => `
<script>
  // Lazy load non-critical scripts
  window.addEventListener('load', function() {
    var script = document.createElement('script');
    script.src = '${src}';
    script.async = true;
    document.body.appendChild(script);
  });
</script>
`;

// Mobile-friendly touch styles
const touchStyles = `
<style>
  /* Touch-friendly interactive elements */
  button, a, .clickable {
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
  }
  
  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Prevent text selection on interactive elements */
  button, .btn {
    -webkit-user-select: none;
    user-select: none;
  }
  
  /* Improved focus styles for accessibility */
  *:focus-visible {
    outline: 2px solid #0052FF;
    outline-offset: 2px;
  }
  
  /* Mobile navigation spacing */
  @media (max-width: 768px) {
    body {
      padding-bottom: 64px; /* Space for bottom nav */
    }
    
    /* Larger text for readability on mobile */
    p, li, span {
      font-size: 16px; /* Prevents iOS auto-zoom */
    }
    
    /* Full-width buttons on mobile */
    .btn-mobile-full {
      width: 100%;
      margin: 0.5rem 0;
    }
    
    /* Stack columns on mobile */
    .grid-cols-2, .grid-cols-3, .grid-cols-4 {
      grid-template-columns: 1fr !important;
    }
  }
  
  /* Tablet optimization */
  @media (min-width: 769px) and (max-width: 1024px) {
    .grid-cols-4 {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
</style>
`;

export { optimizedHead, mobileNav, responsiveImage, lazyLoadScript, touchStyles };
