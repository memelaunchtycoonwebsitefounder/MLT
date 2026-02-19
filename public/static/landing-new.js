/**
 * MemeLaunch Tycoon - New Landing Page Script
 * Modern pump.fun inspired design with live market data
 */

// API Base URL
const API_BASE = window.location.origin;

// Initialize landing page
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initializing new landing page...');
  
  // Load live stats
  await loadLiveStats();
  
  // Load trending coins carousel
  await loadTrendingCoins();
  
  // Initialize CountUp animations
  initCountUpAnimations();
  
  // Setup email forms
  setupEmailForms();
  
  // Setup navigation buttons
  setupNavigation();
  
  // Setup smooth scroll
  setupSmoothScroll();
  
  // Refresh stats every 30 seconds
  setInterval(loadLiveStats, 30000);
  
  // Rotate trending coins every 10 seconds
  setInterval(rotateTrendingCoins, 10000);
});

/**
 * Load live statistics from API
 */
async function loadLiveStats() {
  try {
    const response = await fetch(`${API_BASE}/api/coins/list?limit=100`);
    const data = await response.json();
    
    if (data.success && data.coins) {
      const stats = calculateStats(data.coins);
      updateStatsDisplay(stats);
    }
  } catch (error) {
    console.error('Failed to load live stats:', error);
  }
}

/**
 * Calculate statistics from coins data
 */
function calculateStats(coins) {
  return {
    totalCoins: coins.length,
    totalVolume: coins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0),
    activePlayers: Math.floor(coins.length * 1.5), // Estimate
    totalTrades: coins.reduce((sum, coin) => sum + (coin.transaction_count || 0), 0)
  };
}

/**
 * Update stats display with animation
 */
function updateStatsDisplay(stats) {
  // Update hero stats
  const heroStats = [
    { id: 'hero-starting-balance', value: 10000, prefix: '', suffix: '' },
    { id: 'hero-active-players', value: stats.activePlayers, prefix: '', suffix: '+' },
    { id: 'hero-coins-created', value: stats.totalCoins, prefix: '', suffix: '+' },
    { id: 'hero-total-volume', value: stats.totalVolume, prefix: '$', suffix: '' }
  ];
  
  heroStats.forEach(stat => {
    const element = document.getElementById(stat.id);
    if (element) {
      element.textContent = `${stat.prefix}${formatNumber(stat.value)}${stat.suffix}`;
    }
  });
  
  // Update live stats section
  const liveStats = [
    { id: 'stat-total-users', value: stats.activePlayers },
    { id: 'stat-total-coins', value: stats.totalCoins },
    { id: 'stat-total-volume', value: stats.totalVolume },
    { id: 'stat-total-trades', value: stats.totalTrades }
  ];
  
  liveStats.forEach(stat => {
    const element = document.getElementById(stat.id);
    if (element) {
      animateNumber(element, stat.value);
    }
  });
}

/**
 * Load trending coins for carousel
 */
async function loadTrendingCoins() {
  try {
    const response = await fetch(`${API_BASE}/api/coins/list?sort=hype_score_desc&limit=12`);
    const data = await response.json();
    
    if (data.success && data.coins) {
      displayTrendingCoins(data.coins);
    }
  } catch (error) {
    console.error('Failed to load trending coins:', error);
  }
}

/**
 * Display trending coins in carousel
 */
function displayTrendingCoins(coins) {
  const container = document.getElementById('trending-coins-carousel');
  if (!container) return;
  
  container.innerHTML = coins.map((coin, index) => `
    <div class="trending-coin-card glass-effect rounded-xl p-4 min-w-[280px] hover:scale-105 transition cursor-pointer" data-coin-id="${coin.id}" style="animation-delay: ${index * 0.1}s">
      <div class="flex items-center space-x-3 mb-3">
        <img src="${coin.image_url || '/static/mlt-token.png'}" alt="${coin.name}" class="w-12 h-12 rounded-full" loading="lazy" />
        <div>
          <h4 class="font-bold text-lg">${coin.name}</h4>
          <p class="text-sm text-gray-400">${coin.symbol}</p>
        </div>
        <div class="ml-auto text-right">
          <p class="font-bold text-lg">${formatPrice(coin.current_price)}</p>
          <p class="text-xs ${getPriceChangeClass(coin.price_change_24h)}">
            ${coin.price_change_24h >= 0 ? '↑' : '↓'} ${Math.abs(coin.price_change_24h || 0).toFixed(2)}%
          </p>
        </div>
      </div>
      
      <!-- Mini chart placeholder -->
      <div class="h-12 bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
        <i class="fas fa-chart-line text-2xl text-orange-500"></i>
      </div>
      
      <!-- Progress bar -->
      <div class="mt-3">
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>${(coin.bonding_curve_progress || 0).toFixed(1)}%</span>
        </div>
        <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all" style="width: ${coin.bonding_curve_progress || 0}%"></div>
        </div>
      </div>
    </div>
  `).join('');
  
  // Add click handlers
  container.querySelectorAll('.trending-coin-card').forEach(card => {
    card.addEventListener('click', () => {
      const coinId = card.getAttribute('data-coin-id');
      window.location.href = `/coin/${coinId}`;
    });
  });
  
  // Start carousel animation
  startCarouselAnimation(container);
}

/**
 * Start infinite carousel animation
 */
function startCarouselAnimation(container) {
  let scrollPos = 0;
  const scrollSpeed = 0.5; // pixels per frame
  
  function animate() {
    scrollPos += scrollSpeed;
    if (scrollPos >= container.scrollWidth / 2) {
      scrollPos = 0;
    }
    container.scrollLeft = scrollPos;
    requestAnimationFrame(animate);
  }
  
  // Pause on hover
  container.addEventListener('mouseenter', () => {
    scrollSpeed = 0;
  });
  
  container.addEventListener('mouseleave', () => {
    scrollSpeed = 0.5;
  });
  
  // Start animation
  animate();
}

/**
 * Rotate trending coins
 */
function rotateTrendingCoins() {
  loadTrendingCoins();
}

/**
 * Initialize CountUp animations
 */
function initCountUpAnimations() {
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const endValue = parseInt(element.getAttribute('data-count') || '0');
        animateNumber(element, endValue);
        observer.unobserve(element);
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('[data-count]').forEach(el => {
    observer.observe(el);
  });
}

/**
 * Animate number with easing
 */
function animateNumber(element, endValue, duration = 2000) {
  const startValue = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (easeOutQuart)
    const easeProgress = 1 - Math.pow(1 - progress, 4);
    
    const currentValue = Math.floor(startValue + (endValue - startValue) * easeProgress);
    element.textContent = formatNumber(currentValue);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = formatNumber(endValue);
    }
  }
  
  requestAnimationFrame(update);
}

/**
 * Setup email signup forms
 */
function setupEmailForms() {
  document.querySelectorAll('.email-signup-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = form.querySelector('input[type="email"]').value;
      const source = form.getAttribute('data-source') || 'unknown';
      const button = form.querySelector('button[type="submit"]');
      const messageDiv = form.closest('section').querySelector('.form-message') || form.querySelector('.form-message');
      
      // Validate email
      if (!isValidEmail(email)) {
        showFormMessage(messageDiv, 'Please enter a valid email address', 'error');
        return;
      }
      
      // Disable button
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
      
      try {
        // Save email to API
        const response = await fetch(`${API_BASE}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source })
        });
        
        const data = await response.json();
        
        if (data.success) {
          showFormMessage(messageDiv, 'Email saved! Redirecting to signup...', 'success');
          // Redirect to signup page with email
          setTimeout(() => {
            window.location.href = `/signup?email=${encodeURIComponent(email)}`;
          }, 1500);
        } else {
          throw new Error(data.message || 'Failed to save email');
        }
      } catch (error) {
        console.error('Email signup error:', error);
        showFormMessage(messageDiv, error.message || 'Something went wrong. Please try again.', 'error');
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-rocket mr-2"></i>Try Again';
      }
    });
  });
}

/**
 * Setup navigation buttons
 */
function setupNavigation() {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      window.location.href = '/login';
    });
  }
  
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      window.location.href = '/signup';
    });
  }
}

/**
 * Setup smooth scroll for anchor links
 */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Show form message
 */
function showFormMessage(element, message, type) {
  if (!element) return;
  
  element.textContent = message;
  element.className = `form-message ${type}`;
  element.classList.remove('hidden');
  
  // Auto-hide after 5 seconds for errors
  if (type === 'error') {
    setTimeout(() => {
      element.classList.add('hidden');
    }, 5000);
  }
}

/**
 * Validate email
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

/**
 * Format price
 */
function formatPrice(price) {
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  } else if (price < 1) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(2)}`;
  }
}

/**
 * Get price change class
 */
function getPriceChangeClass(change) {
  return change >= 0 ? 'text-green-400' : 'text-red-400';
}

console.log('✅ New landing page script loaded');
