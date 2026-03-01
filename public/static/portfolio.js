/**
 * Portfolio Page JavaScript
 * Displays user's holdings, stats, and performance
 */

console.log('Portfolio: Script loaded');

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function init() {
  console.log('Portfolio: Initializing');
  
  // Check authentication
  const token = localStorage.getItem('auth_token');
  if (!token) {
    window.location.href = '/login?redirect=/portfolio';
    return;
  }
  
  // Load portfolio data
  await loadPortfolio();
  
  // Setup event handlers
  setupEventHandlers();
  
  // Hide page loader
  fetchUtils.hidePageLoader();
}

function setupEventHandlers() {
  // Logout button
  document.addEventListener('click', (e) => {
    if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  });
  
  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadPortfolio);
  }
}

async function loadPortfolio() {
  try {
    console.log('Portfolio: Loading data');
    
    const token = localStorage.getItem('auth_token');
    
    // Load user data first for balance
    const userResponse = await fetchUtils.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (userResponse.data.success) {
      const balanceEl = document.getElementById('user-balance');
      if (balanceEl) {
        balanceEl.textContent = userResponse.data.data.virtual_balance.toLocaleString();
      }
    }
    
    // Load portfolio data
    const response = await fetchUtils.get('/api/portfolio', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.data.success) {
      throw new Error('Failed to load portfolio');
    }
    
    const { holdings, stats } = response.data.data;
    
    console.log('Portfolio: Data loaded', { holdingsCount: holdings.length, stats });
    
    // Update stats
    updateStats(stats);
    
    // Update holdings table
    updateHoldings(holdings);
    
  } catch (error) {
    console.error('Portfolio: Failed to load data:', error);
    showError('Failed to load portfolio data');
  }
}

function updateStats(stats) {
  // Cash balance
  const cashBalanceEl = document.getElementById('cash-balance');
  if (cashBalanceEl) {
    cashBalanceEl.textContent = stats.cashBalance.toLocaleString();
  }
  
  // Total value
  const totalValueEl = document.getElementById('total-value');
  if (totalValueEl) {
    totalValueEl.textContent = stats.totalValue.toLocaleString();
  }
  
  // Total net worth
  const totalNetWorthEl = document.getElementById('total-networth');
  if (totalNetWorthEl) {
    totalNetWorthEl.textContent = stats.totalNetWorth.toLocaleString();
  }
  
  // Total P/L
  const totalPlEl = document.getElementById('total-pl');
  if (totalPlEl) {
    const pl = stats.totalProfitLoss;
    const plPercent = stats.totalProfitLossPercent;
    
    totalPlEl.textContent = `${pl >= 0 ? '+' : ''}${pl.toFixed(2)} (${plPercent >= 0 ? '+' : ''}${plPercent.toFixed(2)}%)`;
    totalPlEl.className = pl >= 0 ? 'text-2xl font-bold text-green-400' : 'text-2xl font-bold text-red-400';
  }
}

function updateHoldings(holdings) {
  const tbody = document.getElementById('holdings-tbody');
  if (!tbody) return;
  
  if (holdings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-8 text-gray-400">
          <i class="fas fa-inbox text-4xl mb-2"></i>
          <p>You don't have any holdings yet</p>
          <a href="/market" class="text-orange-500 hover:text-orange-400 transition mt-2 inline-block">
            Go to Market <i class="fas fa-arrow-right ml-1"></i>
          </a>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = holdings.map((holding, index) => {
    const pl = holding.profit_loss;
    const plPercent = holding.profit_loss_percent;
    const plClass = pl >= 0 ? 'text-green-400' : 'text-red-400';
    
    return `
      <tr class="hover:bg-white/5 transition">
        <td class="px-6 py-4">${index + 1}</td>
        <td class="px-6 py-4">
          <a href="/coin/${holding.coin_id}" class="flex items-center space-x-3 hover:text-orange-400 transition">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              ${holding.symbol.substring(0, 2)}
            </div>
            <div>
              <p class="font-semibold">${holding.name}</p>
              <p class="text-sm text-gray-400">${holding.symbol}</p>
            </div>
          </a>
        </td>
        <td class="px-6 py-4">${holding.amount.toLocaleString()}</td>
        <td class="px-6 py-4">${holding.avg_buy_price.toFixed(4)}</td>
        <td class="px-6 py-4">${holding.current_price.toFixed(4)}</td>
        <td class="px-6 py-4">${holding.current_value.toFixed(2)}</td>
        <td class="px-6 py-4 ${plClass}">
          ${pl >= 0 ? '+' : ''}${pl.toFixed(2)}<br>
          <span class="text-sm">(${plPercent >= 0 ? '+' : ''}${plPercent.toFixed(2)}%)</span>
        </td>
      </tr>
    `;
  }).join('');
}

function showError(message) {
  const container = document.getElementById('error-container');
  if (container) {
    container.innerHTML = `
      <div class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
        <i class="fas fa-exclamation-circle mr-2"></i>
        ${message}
      </div>
    `;
    
    setTimeout(() => {
      container.innerHTML = '';
    }, 5000);
  }
}

console.log('Portfolio: Script ready');
