/**
 * Live Simulation Timer & Progress System
 * 实时模拟计时器和进度系统
 */

(function() {
  'use strict';
  
  const COIN_ID = window.COIN_ID || (window.location.pathname.match(/\/coin\/(\d+)/) || [])[1];
  if (!COIN_ID) return;

  console.log(`[LiveTimer] Initialized for coin ${COIN_ID}`);

  let simulationState = null;
  let simulationStartTime = null;
  let elapsedSeconds = 0;
  
  // 1 real second = 1 simulated minute (60x speed)
  const TIME_MULTIPLIER = 60;
  const SECONDS_PER_DAY = 24 * 60 * 60; // 24 hours in seconds
  const REAL_SECONDS_PER_DAY = SECONDS_PER_DAY / TIME_MULTIPLIER; // 1440 seconds = 24 minutes

  /**
   * 获取模拟状态
   */
  async function loadSimulationState() {
    try {
      const response = await fetch(`/api/simulation/${COIN_ID}/state`);
      const data = await response.json();
      
      if (data.success && data.data) {
        simulationState = data.data;
        
        if (!simulationStartTime) {
          simulationStartTime = new Date(simulationState.created_at);
        }
        
        updateTimeDisplay();
        updateProgressBar();
      }
    } catch (error) {
      console.error('[LiveTimer] Error loading state:', error);
    }
  }

  /**
   * 更新时间显示
   */
  function updateTimeDisplay() {
    if (!simulationState) return;

    // 计算经过的实际时间
    const now = new Date();
    const realElapsedMs = now - simulationStartTime;
    const realElapsedSeconds = Math.floor(realElapsedMs / 1000);
    
    // 转换为模拟时间 (1 real second = 1 simulated minute)
    const simulatedMinutes = realElapsedSeconds;
    const simulatedHours = Math.floor(simulatedMinutes / 60);
    const simulatedDays = Math.floor(simulatedHours / 24);
    
    const currentDay = simulatedDays + 1; // Day 1, Day 2, etc.
    const hoursInDay = simulatedHours % 24;
    const minutesInHour = simulatedMinutes % 60;

    // 更新显示
    updateElement('sim-current-day', currentDay);
    updateElement('sim-total-days', simulationState.total_days);
    updateElement('sim-current-time', `${hoursInDay}:${minutesInHour.toString().padStart(2, '0')}`);
    
    // 计算当天剩余时间
    const minutesRemainingInDay = (24 * 60) - (simulatedHours % 24) * 60 - (simulatedMinutes % 60);
    const realSecondsRemainingInDay = minutesRemainingInDay; // Since 1 real sec = 1 sim minute
    
    updateElement('sim-time-remaining', formatTimeRemaining(realSecondsRemainingInDay));
    
    // 更新进度百分比
    const progress = (currentDay / simulationState.total_days) * 100;
    updateElement('sim-progress-percent', progress.toFixed(1) + '%');
  }

  /**
   * 更新进度条
   */
  function updateProgressBar() {
    if (!simulationState) return;

    const progressBar = document.getElementById('sim-progress-bar');
    if (!progressBar) return;

    const now = new Date();
    const realElapsedMs = now - simulationStartTime;
    const realElapsedSeconds = Math.floor(realElapsedMs / 1000);
    const simulatedDays = Math.floor((realElapsedSeconds * TIME_MULTIPLIER) / SECONDS_PER_DAY);
    
    const currentDay = simulatedDays + 1;
    const progress = Math.min((currentDay / simulationState.total_days) * 100, 100);
    
    progressBar.style.width = progress + '%';
    progressBar.style.transition = 'width 0.3s ease-out';
  }

  /**
   * 格式化剩余时间
   */
  function formatTimeRemaining(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }

  /**
   * 更新元素内容
   */
  function updateElement(id, content) {
    const el = document.getElementById(id);
    if (el) el.textContent = content;
  }

  /**
   * 创建实时时间显示 UI
   */
  function createLiveTimeUI() {
    if (!simulationState) return;

    // 查找插入位置（在模拟横幅之后）
    const simBanner = document.querySelector('.bg-gradient-to-r.from-purple-500\\/20');
    if (!simBanner) return;

    const existingUI = document.getElementById('live-time-ui');
    if (existingUI) existingUI.remove();

    const liveUI = document.createElement('div');
    liveUI.id = 'live-time-ui';
    liveUI.className = 'glass-effect rounded-2xl p-6 mb-8 border-2 border-blue-500/30';
    liveUI.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h3 class="text-xl font-bold text-white">🕐 Live Simulation Time</h3>
        </div>
        <div class="text-green-400 font-mono text-lg">
          <span id="sim-current-time">0:00</span>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div class="bg-blue-500/20 rounded-lg p-3 text-center">
          <p class="text-gray-400 text-sm">Current Day</p>
          <p class="text-2xl font-bold text-blue-400">
            <span id="sim-current-day">1</span> / <span id="sim-total-days">${simulationState.total_days}</span>
          </p>
        </div>
        
        <div class="bg-green-500/20 rounded-lg p-3 text-center">
          <p class="text-gray-400 text-sm">Day Progress</p>
          <p class="text-2xl font-bold text-green-400" id="sim-progress-percent">0%</p>
        </div>
        
        <div class="bg-yellow-500/20 rounded-lg p-3 text-center">
          <p class="text-gray-400 text-sm">Time Until Next Day</p>
          <p class="text-2xl font-bold text-yellow-400" id="sim-time-remaining">--</p>
        </div>
        
        <div class="bg-purple-500/20 rounded-lg p-3 text-center">
          <p class="text-gray-400 text-sm">Fate Outcome</p>
          <p class="text-2xl font-bold text-purple-400">${simulationState.fate_outcome.toUpperCase()}</p>
        </div>
      </div>

      <div class="bg-gray-800/50 rounded-full h-4 overflow-hidden">
        <div id="sim-progress-bar" 
             class="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300"
             style="width: 0%">
        </div>
      </div>
      <p class="text-center text-gray-400 text-sm mt-2">
        💡 1 real second = 1 simulated minute (60x speed)
      </p>
    `;

    simBanner.parentElement.insertBefore(liveUI, simBanner.nextSibling);
  }

  /**
   * 主循环 - 每秒更新
   */
  function startLiveTimer() {
    loadSimulationState().then(() => {
      createLiveTimeUI();
      
      // 每秒更新时间显示
      setInterval(() => {
        updateTimeDisplay();
        updateProgressBar();
      }, 1000);

      // 每30秒重新加载状态（以防数据变化）
      setInterval(() => {
        loadSimulationState();
      }, 30000);
    });
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLiveTimer);
  } else {
    startLiveTimer();
  }

  console.log('[LiveTimer] Live timer system active! ⏰');
})();
