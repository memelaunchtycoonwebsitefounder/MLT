/**
 * Fate Dashboard - 命運預測系統前端組件
 * 集成隨機事件、用戶決策、可視化圖表
 */

class FateDashboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentPrediction = null;
    this.coinInput = null;
    this.charts = {};
    
    if (!this.container) {
      console.error(`Container #${containerId} not found`);
      return;
    }
    
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="fate-dashboard bg-white rounded-lg shadow-lg p-6">
        <!-- 頭部 -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-crystal-ball mr-2"></i>
            命運預測系統
          </h2>
          <button id="fatePredictBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
            <i class="fas fa-magic mr-2"></i>
            開始預測
          </button>
        </div>

        <!-- 輸入表單 -->
        <div id="fateInputSection" class="mb-6 hidden">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">幣名稱</label>
              <input type="text" id="coinName" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="例如: MoonCoin">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">幣符號</label>
              <input type="text" id="coinSymbol" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="例如: MOON">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">類別</label>
              <select id="coinCategory" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="celebrity">Celebrity (名人)</option>
                <option value="meme">Meme (梗圖)</option>
                <option value="animal">Animal (動物)</option>
                <option value="tech">Tech (技術)</option>
                <option value="random">Random (隨機)</option>
                <option value="food">Food (食物)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">創作者聲譽 (0-100)</label>
              <input type="number" id="creatorReputation" class="w-full px-3 py-2 border border-gray-300 rounded-lg" value="50" min="0" max="100">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">營銷預算 (USD)</label>
              <input type="number" id="marketingBudget" class="w-full px-3 py-2 border border-gray-300 rounded-lg" value="1000" min="0">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">市場趨勢</label>
              <select id="marketTrend" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="bull">牛市 (Bull)</option>
                <option value="sideways" selected>橫盤 (Sideways)</option>
                <option value="bear">熊市 (Bear)</option>
              </select>
            </div>
          </div>
          <div class="flex gap-4">
            <label class="flex items-center">
              <input type="checkbox" id="hasWebsite" class="mr-2">
              <span class="text-sm">有網站</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" id="hasTwitter" class="mr-2">
              <span class="text-sm">有Twitter</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" id="hasTelegram" class="mr-2">
              <span class="text-sm">有Telegram</span>
            </label>
          </div>
          <button id="submitPrediction" class="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
            <i class="fas fa-rocket mr-2"></i>
            提交預測
          </button>
        </div>

        <!-- 預測結果區域 -->
        <div id="predictionResult" class="hidden">
          <!-- 概覽卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-4 rounded-lg">
              <div class="text-sm opacity-90 mb-1">預測結果</div>
              <div id="predictedOutcome" class="text-2xl font-bold">--</div>
            </div>
            <div class="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-4 rounded-lg">
              <div class="text-sm opacity-90 mb-1">信心度</div>
              <div id="confidence" class="text-2xl font-bold">--</div>
            </div>
            <div class="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-lg">
              <div class="text-sm opacity-90 mb-1">質量分數</div>
              <div id="qualityScore" class="text-2xl font-bold">--</div>
            </div>
            <div class="bg-gradient-to-br from-orange-500 to-red-600 text-white p-4 rounded-lg">
              <div class="text-sm opacity-90 mb-1">風險等級</div>
              <div id="riskLevel" class="text-2xl font-bold">--</div>
            </div>
          </div>

          <!-- 圖表區域 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-semibold mb-3">命運概率分布</h3>
              <canvas id="outcomeChart"></canvas>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-semibold mb-3">影響因子分析</h3>
              <canvas id="factorsChart"></canvas>
            </div>
          </div>

          <!-- 隨機事件 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">
              <i class="fas fa-dice mr-2"></i>
              預測生命週期事件
            </h3>
            <div id="randomEvents" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"></div>
          </div>

          <!-- 用戶決策區域 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">
              <i class="fas fa-chess-knight mr-2"></i>
              採取行動改變命運
            </h3>
            <div id="userDecisions" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3"></div>
          </div>

          <!-- 建議和警告 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-semibold mb-3 text-green-700">
                <i class="fas fa-lightbulb mr-2"></i>
                投資建議
              </h3>
              <ul id="recommendations" class="space-y-2"></ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-3 text-red-700">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                風險警告
              </h3>
              <ul id="warnings" class="space-y-2"></ul>
            </div>
          </div>
        </div>

        <!-- Loading 狀態 -->
        <div id="loadingState" class="hidden text-center py-12">
          <i class="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
          <p class="text-gray-600">正在預測命運...</p>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const predictBtn = document.getElementById('fatePredictBtn');
    const submitBtn = document.getElementById('submitPrediction');

    if (predictBtn) {
      predictBtn.addEventListener('click', () => this.showInputForm());
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitPrediction());
    }
  }

  showInputForm() {
    document.getElementById('fateInputSection').classList.remove('hidden');
    document.getElementById('predictionResult').classList.add('hidden');
    document.getElementById('fatePredictBtn').textContent = '重新預測';
  }

  async submitPrediction() {
    const coinInput = {
      coin_name: document.getElementById('coinName').value,
      coin_symbol: document.getElementById('coinSymbol').value,
      category: document.getElementById('coinCategory').value,
      creator_reputation: parseInt(document.getElementById('creatorReputation').value),
      marketing_budget: parseFloat(document.getElementById('marketingBudget').value),
      market_trend: document.getElementById('marketTrend').value,
      has_website: document.getElementById('hasWebsite').checked,
      has_twitter: document.getElementById('hasTwitter').checked,
      has_telegram: document.getElementById('hasTelegram').checked,
      initial_supply: 1000000000,
      initial_price: 0.0001,
      creator_previous_coins: 0,
      competition_level: 5,
      initial_holders: 100,
      initial_volume: 10000,
    };

    if (!coinInput.coin_name || !coinInput.coin_symbol) {
      alert('請填寫幣名稱和符號！');
      return;
    }

    // 顯示 loading
    document.getElementById('fateInputSection').classList.add('hidden');
    document.getElementById('loadingState').classList.remove('hidden');

    try {
      const response = await fetch('/api/fate/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coinInput),
      });

      const result = await response.json();

      if (result.success) {
        this.coinInput = coinInput;
        this.currentPrediction = result.data;
        this.displayPrediction(result.data);
      } else {
        alert('預測失敗: ' + result.error);
        this.showInputForm();
      }
    } catch (error) {
      console.error('Prediction error:', error);
      alert('預測失敗: ' + error.message);
      this.showInputForm();
    } finally {
      document.getElementById('loadingState').classList.add('hidden');
    }
  }

  displayPrediction(prediction) {
    document.getElementById('predictionResult').classList.remove('hidden');

    // 概覽數據
    const outcomeEmoji = {
      moon: '🚀',
      stable: '📊',
      rug: '💩',
      slow_death: '📉',
    };

    document.getElementById('predictedOutcome').innerHTML = 
      `${outcomeEmoji[prediction.trajectory.predicted_outcome]} ${prediction.trajectory.predicted_outcome.toUpperCase()}`;
    
    document.getElementById('confidence').textContent = 
      (prediction.trajectory.confidence * 100).toFixed(1) + '%';
    
    document.getElementById('qualityScore').textContent = 
      (prediction.quality_score * 100).toFixed(0) + '/100';
    
    document.getElementById('riskLevel').textContent = 
      prediction.trajectory.risk_level.toUpperCase();

    // 顯示隨機事件
    this.displayRandomEvents(prediction.random_events);

    // 顯示決策按鈕
    this.displayDecisionButtons();

    // 顯示建議和警告
    this.displayRecommendations(prediction.recommendations);
    this.displayWarnings(prediction.warnings);

    // 繪製圖表
    this.renderCharts(prediction);
  }

  displayRandomEvents(events) {
    const container = document.getElementById('randomEvents');
    
    if (!events || events.length === 0) {
      container.innerHTML = '<p class="text-gray-500 col-span-full">本次預測未生成隨機事件</p>';
      return;
    }

    container.innerHTML = events.map(event => {
      const impactClass = event.impact_on_outcome > 0 ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
      const impactIcon = event.impact_on_outcome > 0 ? '📈' : '📉';
      
      return `
        <div class="border-l-4 ${impactClass} p-3 rounded">
          <div class="font-semibold text-sm">${impactIcon} ${event.event_name}</div>
          <div class="text-xs text-gray-600 mt-1">${event.description}</div>
          <div class="text-xs mt-1 font-medium ${event.impact_on_outcome > 0 ? 'text-green-700' : 'text-red-700'}">
            影響: ${(event.impact_on_outcome * 100).toFixed(0)}%
          </div>
        </div>
      `;
    }).join('');
  }

  displayDecisionButtons() {
    const decisions = [
      { type: 'increase_marketing', label: '增加營銷', icon: 'fa-bullhorn', color: 'blue' },
      { type: 'build_community', label: '建設社群', icon: 'fa-users', color: 'green' },
      { type: 'add_features', label: '添加功能', icon: 'fa-cogs', color: 'purple' },
      { type: 'celebrity_endorsement', label: '名人背書', icon: 'fa-star', color: 'yellow' },
      { type: 'partner_collaboration', label: '合作夥伴', icon: 'fa-handshake', color: 'indigo' },
      { type: 'hold', label: '持有', icon: 'fa-hand-paper', color: 'gray' },
      { type: 'sell', label: '賣出', icon: 'fa-times-circle', color: 'red' },
    ];

    const container = document.getElementById('userDecisions');
    container.innerHTML = decisions.map(d => `
      <button 
        class="decision-btn bg-${d.color}-500 hover:bg-${d.color}-600 text-white px-4 py-3 rounded-lg transition text-sm"
        data-decision="${d.type}"
      >
        <i class="fas ${d.icon} block text-2xl mb-2"></i>
        ${d.label}
      </button>
    `).join('');

    // 綁定決策按鈕事件
    container.querySelectorAll('.decision-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleDecision(e.currentTarget.dataset.decision));
    });
  }

  async handleDecision(decisionType) {
    if (!this.currentPrediction || !this.coinInput) {
      alert('請先進行命運預測！');
      return;
    }

    let investmentAmount = 0;
    if (['increase_marketing', 'celebrity_endorsement'].includes(decisionType)) {
      investmentAmount = parseFloat(prompt('請輸入投資金額 (USD):', '10000') || '0');
    }

    const decision = {
      coin_id: 1,
      decision_type: decisionType,
      investment_amount: investmentAmount,
      decided_at: new Date().toISOString(),
    };

    document.getElementById('loadingState').classList.remove('hidden');

    try {
      const response = await fetch('/api/fate/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coin_input: this.coinInput,
          current_prediction: this.currentPrediction,
          decision: decision,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const impact = result.data;
        
        // 顯示決策影響
        this.showDecisionImpact(impact);
        
        // 更新當前預測
        this.currentPrediction = {
          ...this.currentPrediction,
          trajectory: impact.trajectory_update,
          influence_factors: {
            ...this.currentPrediction.influence_factors,
            creator_score: Math.min(1, this.currentPrediction.influence_factors.creator_score + (impact.influence_change.creator_score || 0)),
            marketing_score: Math.min(1, this.currentPrediction.influence_factors.marketing_score + (impact.influence_change.marketing_score || 0)),
            community_score: Math.min(1, this.currentPrediction.influence_factors.community_score + (impact.influence_change.community_score || 0)),
            timing_score: Math.min(1, this.currentPrediction.influence_factors.timing_score + (impact.influence_change.timing_score || 0)),
            luck_score: Math.min(1, this.currentPrediction.influence_factors.luck_score + (impact.influence_change.luck_score || 0)),
          },
        };
        
        // 重新渲染圖表
        this.renderCharts(this.currentPrediction);
      } else {
        alert('決策應用失敗: ' + result.error);
      }
    } catch (error) {
      console.error('Decision error:', error);
      alert('決策應用失敗: ' + error.message);
    } finally {
      document.getElementById('loadingState').classList.add('hidden');
    }
  }

  showDecisionImpact(impact) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold mb-4">決策影響分析</h3>
        
        <div class="mb-4">
          <h4 class="font-semibold mb-2">影響因子變化:</h4>
          <ul class="space-y-1 text-sm">
            ${Object.entries(impact.influence_change).map(([key, value]) => `
              <li class="${value > 0 ? 'text-green-600' : 'text-red-600'}">
                ${key}: ${value > 0 ? '+' : ''}${(value * 100).toFixed(1)}%
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="mb-4">
          <h4 class="font-semibold mb-2">新預測結果:</h4>
          <p class="text-lg font-bold">${impact.trajectory_update.predicted_outcome.toUpperCase()}</p>
          <p class="text-sm text-gray-600">信心度: ${(impact.trajectory_update.confidence * 100).toFixed(1)}%</p>
        </div>

        ${impact.new_events.length > 0 ? `
          <div class="mb-4">
            <h4 class="font-semibold mb-2">觸發事件:</h4>
            <ul class="space-y-1 text-sm">
              ${impact.new_events.map(e => `<li>🎲 ${e.event_name}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <button class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700" onclick="this.closest('.fixed').remove()">
          確定
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations');
    container.innerHTML = recommendations.map(r => 
      `<li class="flex items-start"><i class="fas fa-check-circle text-green-600 mr-2 mt-1"></i><span>${r}</span></li>`
    ).join('');
  }

  displayWarnings(warnings) {
    const container = document.getElementById('warnings');
    container.innerHTML = warnings.map(w => 
      `<li class="flex items-start"><i class="fas fa-exclamation-circle text-red-600 mr-2 mt-1"></i><span>${w}</span></li>`
    ).join('');
  }

  renderCharts(prediction) {
    // 命運概率分布圖 (Pie Chart)
    this.renderOutcomeChart(prediction.trajectory.outcome_probabilities);
    
    // 影響因子雷達圖 (Radar Chart)
    this.renderFactorsChart(prediction.influence_factors);
  }

  renderOutcomeChart(probabilities) {
    const ctx = document.getElementById('outcomeChart');
    if (!ctx) return;

    if (this.charts.outcome) {
      this.charts.outcome.destroy();
    }

    this.charts.outcome = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Moon 🚀', 'Stable 📊', 'Rug 💩', 'Slow Death 📉'],
        datasets: [{
          data: [
            probabilities.moon * 100,
            probabilities.stable * 100,
            probabilities.rug * 100,
            probabilities.slow_death * 100,
          ],
          backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'],
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed.toFixed(1)}%`
            }
          }
        },
      },
    });
  }

  renderFactorsChart(factors) {
    const ctx = document.getElementById('factorsChart');
    if (!ctx) return;

    if (this.charts.factors) {
      this.charts.factors.destroy();
    }

    this.charts.factors = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['創作者', '營銷', '社群', '時機', '運氣'],
        datasets: [{
          label: '影響因子分數',
          data: [
            factors.creator_score * 100,
            factors.marketing_score * 100,
            factors.community_score * 100,
            factors.timing_score * 100,
            factors.luck_score * 100,
          ],
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgb(99, 102, 241)',
          pointBackgroundColor: 'rgb(99, 102, 241)',
        }],
      },
      options: {
        responsive: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    });
  }
}

// 自動初始化
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('fateDashboardContainer')) {
    window.fateDashboard = new FateDashboard('fateDashboardContainer');
  }
});
