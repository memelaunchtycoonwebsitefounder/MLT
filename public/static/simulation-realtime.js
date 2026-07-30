/**
 * Simulation Real-Time Updater
 * 模拟实时更新器 - 独立于 coin-detail.js
 * 
 * 这个脚本：
 * 1. 轮询模拟数据
 * 2. 显示用户决策点模态框
 * 3. 实时更新交易列表
 * 4. 实时更新事件时间线
 */

(function() {
  'use strict';
  
  const COIN_ID = window.COIN_ID || (window.location.pathname.match(/\/coin\/(\d+)/) || [])[1];
  if (!COIN_ID) {
    console.warn('[SimRT] No coin ID found');
    return;
  }

  console.log(`[SimRT] Initialized for coin ${COIN_ID}`);

  let lastTradeId = 0;
  let lastEventId = 0;
  let currentDecisionId = null;

  /**
   * 检查并显示决策点
   */
  async function checkForDecisions() {
    try {
      const response = await fetch(`/api/decisions/${COIN_ID}/pending`);
      const data = await response.json();

      if (data.success && data.data && !currentDecisionId) {
        currentDecisionId = data.data.id;
        showDecisionModal(data.data);
      } else if (!data.data && currentDecisionId) {
        // Decision was resolved
        currentDecisionId = null;
        hideDecisionModal();
      }
    } catch (error) {
      console.error('[SimRT] Error checking decisions:', error);
    }
  }

  /**
   * 显示决策模态框
   */
  function showDecisionModal(decision) {
    const existing = document.getElementById('decision-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'decision-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn';
    modal.innerHTML = `
      <div class="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-8 max-w-2xl w-full shadow-2xl border-2 border-purple-500 animate-scaleIn">
        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold text-white mb-2">${decision.title}</h2>
          <p class="text-gray-300 text-lg">${decision.description}</p>
          <p class="text-yellow-400 text-sm mt-2">⏰ Expires in ${getTimeRemaining(decision.expires_at)}</p>
        </div>

        <div class="grid md:grid-cols-2 gap-4 mb-6">
          <button onclick="window.makeDecision('A', ${decision.id})" 
                  class="decision-btn bg-green-500 hover:bg-green-600 p-6 rounded-xl transition transform hover:scale-105">
            <div class="text-2xl mb-2">✅</div>
            <div class="font-bold text-lg mb-2">${decision.option_a_text}</div>
            <div class="text-sm text-gray-200">${decision.option_a_effect}</div>
            <div class="text-green-300 font-bold mt-2">${decision.option_a_impact > 0 ? '+' : ''}${(decision.option_a_impact * 100).toFixed(0)}% Impact</div>
          </button>

          <button onclick="window.makeDecision('B', ${decision.id})" 
                  class="decision-btn bg-blue-500 hover:bg-blue-600 p-6 rounded-xl transition transform hover:scale-105">
            <div class="text-2xl mb-2">🤔</div>
            <div class="font-bold text-lg mb-2">${decision.option_b_text}</div>
            <div class="text-sm text-gray-200">${decision.option_b_effect}</div>
            <div class="text-blue-300 font-bold mt-2">${decision.option_b_impact > 0 ? '+' : ''}${(decision.option_b_impact * 100).toFixed(0)}% Impact</div>
          </button>
        </div>

        <p class="text-center text-gray-400 text-sm">
          💡 Your choice will affect the coin's price and future!
        </p>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * 隐藏决策模态框
   */
  function hideDecisionModal() {
    const modal = document.getElementById('decision-modal');
    if (modal) modal.remove();
  }

  /**
   * 用户做出选择
   */
  window.makeDecision = async function(option, decisionId) {
    const buttons = document.querySelectorAll('.decision-btn');
    buttons.forEach(btn => btn.disabled = true);

    try {
      const token = localStorage.getItem('auth_token');
      const userResponse = token ? await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      }) : null;

      const userId = userResponse && (await userResponse.json()).data?.id;

      const response = await fetch(`/api/decisions/${decisionId}/choose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option, userId, coinId: COIN_ID })
      });

      const data = await response.json();

      if (data.success) {
        showNotification(`✅ Decision made! ${data.data.effect}`, 'success');
        currentDecisionId = null;
        hideDecisionModal();
        
        // Reload coin data
        if (window.loadCoinData) {
          setTimeout(() => window.loadCoinData(), 1000);
        }
      } else {
        showNotification(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('[SimRT] Error making decision:', error);
      showNotification('❌ Failed to submit decision', 'error');
    }
  };

  /**
   * 更新实时交易列表
   */
  async function updateTrades() {
    try {
      const response = await fetch(`/api/simulation/${COIN_ID}/trades?limit=5`);
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        const newestTrade = data.data[0];
        
        // 检查是否有新交易
        if (newestTrade.id > lastTradeId) {
          lastTradeId = newestTrade.id;
          
          // 显示新交易动画
          showTradeNotification(newestTrade);
          
          // 更新交易列表（如果函数存在）
          if (window.loadRecentTransactions) {
            window.loadRecentTransactions();
          }
        }
      }
    } catch (error) {
      console.error('[SimRT] Error updating trades:', error);
    }
  }

  /**
   * 显示新交易通知
   */
  function showTradeNotification(trade) {
    const botIcon = trade.bot_name.includes('Whale') ? '🐋' :
                    trade.bot_name.includes('Trader') ? '📈' :
                    trade.bot_name.includes('Holder') ? '💎' : '⚡';

    const message = `${botIcon} ${trade.bot_name} ${trade.type === 'buy' ? 'bought' : 'sold'} ${trade.amount} tokens!`;
    showNotification(message, trade.type === 'buy' ? 'success' : 'warning');
  }

  /**
   * 触发自动生成器
   */
  async function triggerAutoGenerator() {
    try {
      const response = await fetch('/api/auto-generate', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        console.log('[SimRT] Auto-generator triggered:', data.data);
      }
    } catch (error) {
      console.error('[SimRT] Error triggering auto-generator:', error);
    }
  }

  /**
   * 通知工具
   */
  function showNotification(message, type = 'info') {
    if (!window.showNotification && window.showNotification) {
      return window.showNotification(message, type);
    }

    const colors = { success: 'bg-green-500', error: 'bg-red-500', warning: 'bg-yellow-500', info: 'bg-blue-500' };
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl ${colors[type]} text-white font-medium animate-slideIn`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  }

  /**
   * 计算剩余时间
   */
  function getTimeRemaining(expiresAt) {
    const diff = new Date(expiresAt) - new Date();
    if (diff < 0) return 'Expired';
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  // ========================================
  // 主循环
  // ========================================

  console.log('[SimRT] Starting real-time updater...');

  // 初始检查
  checkForDecisions();
  updateTrades();

  // 每5秒检查决策点
  setInterval(checkForDecisions, 5000);

  // 每10秒更新交易
  setInterval(updateTrades, 10000);

  // 每30秒触发自动生成器
  setInterval(triggerAutoGenerator, 30000);

  // 样式
  if (!document.getElementById('sim-rt-styles')) {
    const style = document.createElement('style');
    style.id = 'sim-rt-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      .animate-slideIn { animation: slideIn 0.3s ease-out; }
    `;
    document.head.appendChild(style);
  }

  console.log('[SimRT] Real-time updater active! ✅');
})();
