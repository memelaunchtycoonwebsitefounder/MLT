/**
 * Trading Panel JavaScript
 * Handles buy/sell trading interface with real-time updates
 */

class TradingPanel {
  constructor(coinId, coinData, userData) {
    this.coinId = coinId;
    this.coinData = coinData;
    this.userData = userData;
    this.currentTab = 'buy';
    this.amount = 0;
    this.holdings = 0;
    this.init();
  }

  init() {
    this.setupTabs();
    this.setupPresets();
    this.setupAmountInput();
    this.setupMaxButton();
    this.setupTradeButton();
    this.updateCalculations();
    this.loadHoldings();
  }

  setupTabs() {
    const buyTab = document.getElementById('buy-tab');
    const sellTab = document.getElementById('sell-tab');

    buyTab?.addEventListener('click', () => this.switchTab('buy'));
    sellTab?.addEventListener('click', () => this.switchTab('sell'));
  }

  switchTab(tab) {
    this.currentTab = tab;
    
    // Update tab styles
    const buyTab = document.getElementById('buy-tab');
    const sellTab = document.getElementById('sell-tab');
    const buyPanel = document.getElementById('buy-panel');
    const sellPanel = document.getElementById('sell-panel');

    if (tab === 'buy') {
      buyTab?.classList.add('active', 'bg-green-500', 'text-white');
      buyTab?.classList.remove('bg-gray-200', 'text-gray-700');
      sellTab?.classList.remove('active', 'bg-red-500', 'text-white');
      sellTab?.classList.add('bg-gray-200', 'text-gray-700');
      buyPanel?.classList.remove('hidden');
      sellPanel?.classList.add('hidden');
    } else {
      sellTab?.classList.add('active', 'bg-red-500', 'text-white');
      sellTab?.classList.remove('bg-gray-200', 'text-gray-700');
      buyTab?.classList.remove('active', 'bg-green-500', 'text-white');
      buyTab?.classList.add('bg-gray-200', 'text-gray-700');
      sellPanel?.classList.remove('hidden');
      buyPanel?.classList.add('hidden');
    }

    this.amount = 0;
    this.updateAmountInput();
    this.updateCalculations();
  }

  setupPresets() {
    // Buy presets
    ['buy-preset-10', 'buy-preset-50', 'buy-preset-100', 'buy-preset-500'].forEach((id, index) => {
      const amounts = [10, 50, 100, 500];
      document.getElementById(id)?.addEventListener('click', () => {
        this.amount = amounts[index];
        this.updateAmountInput();
        this.updateCalculations();
      });
    });

    // Sell presets (percentage)
    ['sell-preset-25', 'sell-preset-50', 'sell-preset-75', 'sell-preset-100'].forEach((id, index) => {
      const percentages = [0.25, 0.5, 0.75, 1.0];
      document.getElementById(id)?.addEventListener('click', () => {
        this.amount = Math.floor(this.holdings * percentages[index]);
        this.updateAmountInput();
        this.updateCalculations();
      });
    });
  }

  setupAmountInput() {
    const buyInput = document.getElementById('buy-amount');
    const sellInput = document.getElementById('sell-amount');

    buyInput?.addEventListener('input', (e) => {
      this.amount = parseFloat(e.target.value) || 0;
      this.updateCalculations();
    });

    sellInput?.addEventListener('input', (e) => {
      this.amount = parseFloat(e.target.value) || 0;
      this.updateCalculations();
    });
  }

  setupMaxButton() {
    document.getElementById('buy-max-btn')?.addEventListener('click', () => {
      const maxBuyable = Math.floor(this.userData.virtual_balance / (this.coinData.current_price * 1.01));
      this.amount = Math.min(maxBuyable, this.coinData.total_supply - this.coinData.circulating_supply);
      this.updateAmountInput();
      this.updateCalculations();
    });

    document.getElementById('sell-max-btn')?.addEventListener('click', () => {
      this.amount = this.holdings;
      this.updateAmountInput();
      this.updateCalculations();
    });
  }

  setupTradeButton() {
    document.getElementById('buy-button')?.addEventListener('click', () => this.executeTrade('buy'));
    document.getElementById('sell-button')?.addEventListener('click', () => this.executeTrade('sell'));
  }

  updateAmountInput() {
    const buyInput = document.getElementById('buy-amount');
    const sellInput = document.getElementById('sell-amount');
    
    if (this.currentTab === 'buy' && buyInput) {
      buyInput.value = this.amount;
    } else if (sellInput) {
      sellInput.value = this.amount;
    }
  }

  updateCalculations() {
    const price = this.coinData.current_price;
    const fee = 0.01; // 1% fee

    if (this.currentTab === 'buy') {
      const subtotal = this.amount * price;
      const feeAmount = subtotal * fee;
      const total = subtotal + feeAmount;

      document.getElementById('buy-price-per-coin').textContent = `$${price.toFixed(8)}`;
      document.getElementById('buy-subtotal').textContent = `$${subtotal.toFixed(4)}`;
      document.getElementById('buy-fee').textContent = `$${feeAmount.toFixed(4)}`;
      document.getElementById('buy-total').textContent = `$${total.toFixed(4)}`;

      // Validation
      const buyButton = document.getElementById('buy-button');
      const warningEl = document.getElementById('buy-warning');
      
      if (this.amount <= 0) {
        buyButton.disabled = true;
        buyButton.classList.add('opacity-50', 'cursor-not-allowed');
        warningEl.textContent = '請輸入購買數量';
        warningEl.classList.remove('hidden');
      } else if (total > this.userData.virtual_balance) {
        buyButton.disabled = true;
        buyButton.classList.add('opacity-50', 'cursor-not-allowed');
        warningEl.textContent = `餘額不足！需要 ${total.toFixed(2)} 金幣`;
        warningEl.classList.remove('hidden');
      } else if (this.amount > (this.coinData.total_supply - this.coinData.circulating_supply)) {
        buyButton.disabled = true;
        buyButton.classList.add('opacity-50', 'cursor-not-allowed');
        warningEl.textContent = '可用供應量不足';
        warningEl.classList.remove('hidden');
      } else {
        buyButton.disabled = false;
        buyButton.classList.remove('opacity-50', 'cursor-not-allowed');
        warningEl.classList.add('hidden');
      }
    } else {
      const subtotal = this.amount * price;
      const feeAmount = subtotal * fee;
      const total = subtotal - feeAmount;

      document.getElementById('sell-price-per-coin').textContent = `$${price.toFixed(8)}`;
      document.getElementById('sell-subtotal').textContent = `$${subtotal.toFixed(4)}`;
      document.getElementById('sell-fee').textContent = `$${feeAmount.toFixed(4)}`;
      document.getElementById('sell-total').textContent = `$${total.toFixed(4)}`;

      // Validation
      const sellButton = document.getElementById('sell-button');
      const warningEl = document.getElementById('sell-warning');
      
      if (this.amount <= 0) {
        sellButton.disabled = true;
        sellButton.classList.add('opacity-50', 'cursor-not-allowed');
        warningEl.textContent = '請輸入出售數量';
        warningEl.classList.remove('hidden');
      } else if (this.amount > this.holdings) {
        sellButton.disabled = true;
        sellButton.classList.add('opacity-50', 'cursor-not-allowed');
        warningEl.textContent = `持有量不足！您只有 ${this.holdings} ${this.coinData.symbol}`;
        warningEl.classList.remove('hidden');
      } else {
        sellButton.disabled = false;
        sellButton.classList.remove('opacity-50', 'cursor-not-allowed');
        warningEl.classList.add('hidden');
      }
    }
  }

  async loadHoldings() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('/api/portfolio', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const holding = response.data.data.holdings.find(h => h.coin_id === this.coinId);
        this.holdings = holding ? holding.amount : 0;
        
        // Update holdings display
        document.getElementById('holdings-amount').textContent = this.holdings.toLocaleString();
        document.getElementById('holdings-symbol').textContent = this.coinData.symbol;
        
        if (this.holdings > 0) {
          document.getElementById('holdings-value').textContent = 
            `$${(this.holdings * this.coinData.current_price).toFixed(4)}`;
          document.getElementById('holdings-info').classList.remove('hidden');
        }
      }
    } catch (error) {
      console.error('Failed to load holdings:', error);
    }
  }

  async executeTrade(type) {
    const button = document.getElementById(`${type}-button`);
    const originalText = button.textContent;
    
    // Disable button and show loading
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>處理中...';

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`/api/trades/${type}`, {
        coinId: this.coinId,
        amount: this.amount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Show success message
        this.showNotification(
          type === 'buy' 
            ? `✅ 成功買入 ${this.amount} ${this.coinData.symbol}！` 
            : `✅ 成功賣出 ${this.amount} ${this.coinData.symbol}！`,
          'success'
        );

        // Update user balance
        this.userData.virtual_balance = response.data.data.newBalance;
        document.getElementById('user-balance').textContent = 
          this.userData.virtual_balance.toLocaleString();

        // Reload holdings and transactions
        await this.loadHoldings();
        if (window.loadRecentTransactions) {
          window.loadRecentTransactions();
        }
        
        // Reload coin data AND chart for updated price
        console.log('🔄 Reloading chart after trade...');
        if (window.loadCoinData) {
          console.log('✅ Found window.loadCoinData, calling it...');
          await window.loadCoinData(); // Don't skip chart - we want it to refresh
          console.log('✅ Chart reloaded');
        } else if (window.initPriceChart) {
          console.log('⚠️ window.loadCoinData not found, using initPriceChart...');
          // Fallback: directly reload chart if loadCoinData not available
          await window.initPriceChart();
        } else {
          console.error('❌ Neither window.loadCoinData nor window.initPriceChart found!');
        }

        // Reset form
        this.amount = 0;
        this.updateAmountInput();
        this.updateCalculations();

        // Fire analytics event
        if (typeof gtag !== 'undefined') {
          gtag('event', type === 'buy' ? 'buy_coin' : 'sell_coin', {
            'coin_id': this.coinId,
            'amount': this.amount
          });
        }
      }
    } catch (error) {
      console.error(`${type} failed:`, error);
      this.showNotification(
        error.response?.data?.message || `${type === 'buy' ? '買入' : '賣出'}失敗，請稍後再試`,
        'error'
      );
    } finally {
      // Re-enable button
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white font-medium`;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  updateCoinData(newCoinData) {
    this.coinData = newCoinData;
    this.updateCalculations();
  }
}

// Export for use in coin-detail.js
window.TradingPanel = TradingPanel;
