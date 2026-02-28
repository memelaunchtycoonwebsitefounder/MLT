/**
 * Create Coin JavaScript
 * Handles the 3-step coin creation wizard
 * Version: 2.0.0-fix-final (2026-02-15)
 */

// 🔥 IMMEDIATE VERSION CHECK - This proves the file is loaded
console.log('%c🚀 CREATE-COIN.JS VERSION 2.0.0-FIX-FINAL LOADED', 'background: #ff6600; color: white; font-size: 16px; padding: 5px;');
console.log('%c⚠️ If you see old version, hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)', 'color: #ff6600; font-size: 14px;');

let currentStep = 1;
let userData = null;
let selectedImage = null;
let imagePreview = null;

// State for coin data
const coinData = {
  image: null,
  imageUrl: null,
  name: '',
  symbol: '',
  description: '',
  supply: 1000000,
  mltInvestment: 2000,
  prePurchaseTokens: 50000,
  twitterUrl: '',
  telegramUrl: '',
  websiteUrl: ''
};

// MLT Calculator instance (will be initialized after loading)
let calculator = null;

// Check authentication with retry mechanism
const checkAuth = async (retryCount = 0) => {
  const token = localStorage.getItem('auth_token');
  
  console.log(`CreateCoin: Token check (attempt ${retryCount + 1}):`, token ? 'Found' : 'Not found');
  
  if (!token) {
    // Retry a few times in case token is being written
    if (retryCount < 3) {
      console.log('CreateCoin: No token yet, retrying in 200ms...');
      await new Promise(resolve => setTimeout(resolve, 200));
      return checkAuth(retryCount + 1);
    }
    
    console.log('CreateCoin: No token after retries, redirecting to login...');
    window.location.href = '/login?redirect=/create';
    return null;
  }

  try {
    console.log('CreateCoin: Verifying token with API...');
    const response = await fetchUtils.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      console.log('CreateCoin: Token valid, user:', response.data.data.username);
      return response.data.data;
    } else {
      console.log('CreateCoin: Invalid token response');
      localStorage.removeItem('auth_token');
      window.location.href = '/login?redirect=/create';
      return null;
    }
  } catch (error) {
    console.error('CreateCoin: Auth check failed:', error);
    console.error('CreateCoin: Error details:', error.response?.data);
    localStorage.removeItem('auth_token');
    window.location.href = '/login?redirect=/create';
    return null;
  }
};

// Update UI with user data
const updateUserUI = (user) => {
  // Update virtual balance
  const balanceEl = document.getElementById('user-balance');
  if (balanceEl) {
    balanceEl.textContent = Number(user.virtual_balance || 0).toLocaleString();
  }
  
  // Update MLT balance in navigation
  const navMltEl = document.getElementById('nav-mlt-balance');
  if (navMltEl) {
    navMltEl.textContent = Math.floor(user.mlt_balance || 0).toLocaleString();
  }
  
  // Update MLT balance in create form
  const createMltEl = document.getElementById('create-mlt-balance');
  if (createMltEl) {
    createMltEl.textContent = Math.floor(user.mlt_balance || 0).toLocaleString() + ' MLT';
  }
  
  // Calculate remaining balance
  const remainingBalance = (user.mlt_balance || 0) - 1800;
  const remainingEl = document.getElementById('create-remaining-balance');
  if (remainingEl) {
    remainingEl.textContent = `創幣後剩餘: ${Math.floor(remainingBalance).toLocaleString()} MLT`;
  }
  
  // Check if balance is sufficient
  const warningEl = document.getElementById('insufficient-mlt-warning');
  const step2NextBtn = document.getElementById('step-2-next');
  
  if (user.mlt_balance < 1800) {
    if (warningEl) warningEl.classList.remove('hidden');
    if (step2NextBtn) {
      step2NextBtn.disabled = true;
      step2NextBtn.classList.add('opacity-50', 'cursor-not-allowed');
      step2NextBtn.title = 'MLT 餘額不足';
    }
  } else {
    if (warningEl) warningEl.classList.add('hidden');
    if (step2NextBtn) {
      step2NextBtn.disabled = false;
      step2NextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      step2NextBtn.title = '';
    }
  }
};

// Step navigation
const showStep = (step) => {
  // Hide all steps
  for (let i = 1; i <= 3; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    const indicatorEl = document.getElementById(`step-indicator-${i}`);
    
    if (stepEl) stepEl.classList.add('hidden');
    if (indicatorEl) indicatorEl.classList.remove('active');
  }
  
  // Show current step
  const currentStepEl = document.getElementById(`step-${step}`);
  const currentIndicatorEl = document.getElementById(`step-indicator-${step}`);
  
  if (currentStepEl) currentStepEl.classList.remove('hidden');
  if (currentIndicatorEl) currentIndicatorEl.classList.add('active');
  
  currentStep = step;
  
  // Update preview if on step 3
  if (step === 3) {
    updatePreview();
  }
};

// Image upload handling
const setupImageUpload = () => {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('image-upload');
  const uploadPrompt = document.getElementById('upload-prompt');
  const uploadPreview = document.getElementById('upload-preview');
  const previewImage = document.getElementById('preview-image');
  const changeImageBtn = document.getElementById('change-image');
  const step1NextBtn = document.getElementById('step-1-next');

  // Click to upload
  uploadArea.addEventListener('click', (e) => {
    if (!e.target.closest('#change-image') && !fileInput.files.length) {
      fileInput.click();
    }
  });

  // File selection
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageFile(file);
    }
  });

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('border-orange-500');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('border-orange-500');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-orange-500');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    }
  });

  // Change image
  changeImageBtn.addEventListener('click', () => {
    fileInput.click();
  });

  // Handle image file
  const handleImageFile = (file) => {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('文件大小不能超過 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片文件 (JPG, PNG, GIF)');
      return;
    }

    // Read and preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview = e.target.result;
      previewImage.src = imagePreview;
      uploadPrompt.classList.add('hidden');
      uploadPreview.classList.remove('hidden');
      
      // Store image data
      coinData.image = file;
      coinData.imageUrl = imagePreview;
      selectedImage = 'upload';
      
      // Enable next button
      step1NextBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  };
};

// Load templates
const loadTemplates = async () => {
  const templateGrid = document.getElementById('template-grid');
  
  // Default templates (can be replaced with API call)
  const templates = [
    { id: 1, url: '/static/default-coin.svg', name: 'Default 1' },
    { id: 2, url: '/static/default-coin.svg', name: 'Default 2' },
    { id: 3, url: '/static/default-coin.svg', name: 'Default 3' },
    { id: 4, url: '/static/default-coin.svg', name: 'Default 4' }
  ];
  
  templateGrid.innerHTML = templates.map(template => `
    <div class="template-item cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-orange-500 transition" data-template-id="${template.id}" data-template-url="${template.url}">
      <img src="${template.url}" alt="${template.name}" class="w-full h-32 object-cover" />
      <p class="text-center text-sm py-2">${template.name}</p>
    </div>
  `).join('');
  
  // Template selection
  templateGrid.querySelectorAll('.template-item').forEach(item => {
    item.addEventListener('click', () => {
      const templateUrl = item.dataset.templateUrl;
      const previewImage = document.getElementById('preview-image');
      const uploadPrompt = document.getElementById('upload-prompt');
      const uploadPreview = document.getElementById('upload-preview');
      
      previewImage.src = templateUrl;
      uploadPrompt.classList.add('hidden');
      uploadPreview.classList.remove('hidden');
      
      coinData.imageUrl = templateUrl;
      selectedImage = 'template';
      
      document.getElementById('step-1-next').disabled = false;
    });
  });
};

// Step 1 Navigation
const setupStep1 = () => {
  const nextBtn = document.getElementById('step-1-next');
  
  nextBtn.addEventListener('click', () => {
    if (selectedImage) {
      showStep(2);
    }
  });
};

// Step 2: Form validation
const setupStep2 = () => {
  const form = document.getElementById('coin-details-form');
  const nameInput = document.getElementById('coin-name');
  const symbolInput = document.getElementById('coin-symbol');
  const descInput = document.getElementById('coin-description');
  const supplyInputs = document.querySelectorAll('input[name="supply"]');
  const descCount = document.getElementById('desc-count');
  const symbolCheck = document.getElementById('symbol-check');
  
  // Character count for description
  descInput.addEventListener('input', () => {
    descCount.textContent = descInput.value.length;
  });
  
  // Symbol validation and availability check
  let symbolCheckTimeout;
  symbolInput.addEventListener('input', async (e) => {
    const symbol = e.target.value.toUpperCase();
    symbolInput.value = symbol;
    
    if (symbol.length >= 2) {
      clearTimeout(symbolCheckTimeout);
      symbolCheckTimeout = setTimeout(async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetchUtils.get(`/api/coins?symbol=${symbol}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.data.success && response.data.data.length > 0) {
            symbolCheck.innerHTML = '<span class="text-red-400"><i class="fas fa-times-circle mr-1"></i>已被使用</span>';
          } else {
            symbolCheck.innerHTML = '<span class="text-green-400"><i class="fas fa-check-circle mr-1"></i>可用</span>';
          }
        } catch (error) {
          console.error('Symbol check error:', error);
        }
      }, 500);
    } else {
      symbolCheck.innerHTML = '';
    }
  });
  
  // Back button
  document.getElementById('step-2-back').addEventListener('click', () => {
    showStep(1);
  });
  
  // Next button
  document.getElementById('step-2-next').addEventListener('click', () => {
    // Validate form
    let valid = true;
    
    // Clear previous errors
    ['coin-name-error', 'coin-symbol-error'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    
    // Validate name
    if (nameInput.value.length < 3 || nameInput.value.length > 50) {
      document.getElementById('coin-name-error').textContent = '名稱必須是 3-50 個字符';
      document.getElementById('coin-name-error').classList.remove('hidden');
      valid = false;
    }
    
    // Validate symbol
    if (symbolInput.value.length < 2 || symbolInput.value.length > 10) {
      document.getElementById('coin-symbol-error').textContent = '符號必須是 2-10 個字符';
      document.getElementById('coin-symbol-error').classList.remove('hidden');
      valid = false;
    }
    
    if (valid) {
      // Store data
      coinData.name = nameInput.value;
      coinData.symbol = symbolInput.value.toUpperCase();
      coinData.description = descInput.value;
      
      // **CRITICAL FIX: Save MLT and pre-purchase values BEFORE moving to Step 3**
      const mltInputEl = document.getElementById('mlt-investment');
      const prePurchaseInputEl = document.getElementById('pre-purchase-amount');
      
      // DEBUG: Log DOM element state
      console.log('[STEP2→3] DOM Elements:', {
        mltExists: !!mltInputEl,
        mltValue: mltInputEl ? mltInputEl.value : 'N/A',
        prePurchaseExists: !!prePurchaseInputEl,
        prePurchaseValue: prePurchaseInputEl ? prePurchaseInputEl.value : 'N/A',
        prePurchaseValueType: prePurchaseInputEl ? typeof prePurchaseInputEl.value : 'N/A'
      });
      
      if (mltInputEl) {
        const rawMlt = mltInputEl.value;
        const parsedMlt = parseInt(rawMlt);
        // Use isNaN check instead of || operator
        coinData.mltInvestment = isNaN(parsedMlt) ? 2000 : parsedMlt;
        console.log('[STEP2→3] MLT conversion:', { rawMlt, parsedMlt, isNaN: isNaN(parsedMlt), final: coinData.mltInvestment });
      } else {
        console.log('[STEP2→3] MLT input element NOT FOUND, keeping existing value:', coinData.mltInvestment);
      }
      
      if (prePurchaseInputEl) {
        const rawPrePurchase = prePurchaseInputEl.value;
        const parsedPrePurchase = parseInt(rawPrePurchase);
        // CRITICAL FIX: Only fallback to 0 if parsing actually fails
        // Don't use || operator as it treats valid 0 as falsy
        coinData.prePurchaseTokens = isNaN(parsedPrePurchase) ? 0 : parsedPrePurchase;
        console.log('[STEP2→3] PrePurchase conversion:', { 
          rawPrePurchase, 
          parsedPrePurchase, 
          isNaN: isNaN(parsedPrePurchase),
          final: coinData.prePurchaseTokens,
          isZero: coinData.prePurchaseTokens === 0
        });
      } else {
        // If DOM element doesn't exist, keep existing coinData value
        console.log('[STEP2→3] PrePurchase input element NOT FOUND, keeping existing value:', coinData.prePurchaseTokens);
      }
      
      console.log('💾 Data saved before Step 3:', {
        mlt: coinData.mltInvestment,
        prePurchase: coinData.prePurchaseTokens
      });
      
      // PERSIST debug data to localStorage
      localStorage.setItem('debug_step2_data', JSON.stringify({
        timestamp: new Date().toISOString(),
        mlt: coinData.mltInvestment,
        prePurchase: coinData.prePurchaseTokens,
        rawPrePurchase: prePurchaseInputEl ? prePurchaseInputEl.value : 'N/A'
      }));
      
      // Get social links
      const twitterInput = document.getElementById('twitter-url');
      const telegramInput = document.getElementById('telegram-url');
      const websiteInput = document.getElementById('website-url');
      
      coinData.twitterUrl = twitterInput ? twitterInput.value.trim() : '';
      coinData.telegramUrl = telegramInput ? telegramInput.value.trim() : '';
      coinData.websiteUrl = websiteInput ? websiteInput.value.trim() : '';
      
      // Get selected supply
      supplyInputs.forEach(input => {
        if (input.checked) {
          coinData.supply = parseInt(input.value);
        }
      });
      
      showStep(3);
    }
  });
};

// MLT Cost Calculator
const updateCostSummary = () => {
  if (!calculator) return;
  
  const investment = coinData.mltInvestment;
  const supply = coinData.supply;
  const prePurchase = coinData.prePurchaseTokens;
  
  try {
    const result = calculator.calculateCreationCost(investment, supply, prePurchase);
    
    // Update UI elements if they exist
    const minPrePurchaseEl = document.getElementById('min-pre-purchase');
    if (minPrePurchaseEl) {
      minPrePurchaseEl.textContent = result.minimumPrePurchase.tokens.toLocaleString();
    }
    
    const costInitialEl = document.getElementById('cost-initial-investment');
    if (costInitialEl) {
      costInitialEl.textContent = investment.toLocaleString() + ' MLT';
    }
    
    const costPrePurchaseEl = document.getElementById('cost-pre-purchase');
    if (costPrePurchaseEl) {
      costPrePurchaseEl.textContent = result.prePurchaseCost.toFixed(2) + ' MLT';
    }
    
    const costInitialPriceEl = document.getElementById('cost-initial-price');
    if (costInitialPriceEl) {
      costInitialPriceEl.textContent = result.initialPrice.toFixed(6) + ' MLT/token';
    }
    
    const costCurrentPriceEl = document.getElementById('cost-current-price');
    if (costCurrentPriceEl) {
      costCurrentPriceEl.textContent = result.currentPrice.toFixed(6) + ' MLT/token';
    }
    
    const costProgressEl = document.getElementById('cost-progress');
    if (costProgressEl) {
      costProgressEl.textContent = (result.progress * 100).toFixed(2) + '%';
    }
    
    const costTotalEl = document.getElementById('cost-total');
    if (costTotalEl) {
      costTotalEl.textContent = result.totalCost.toFixed(2) + ' MLT';
    }
    
    const remaining = (userData?.mlt_balance || 0) - result.totalCost;
    const costRemainingEl = document.getElementById('cost-remaining');
    if (costRemainingEl) {
      costRemainingEl.textContent = Math.max(0, remaining).toFixed(2) + ' MLT';
    }
    
    // Check if pre-purchase meets minimum
    const warningEl = document.getElementById('prepurchase-warning');
    const warningMinEl = document.getElementById('prepurchase-warning-min');
    if (prePurchase < result.minimumPrePurchase.tokens) {
      if (warningEl) warningEl.classList.remove('hidden');
      if (warningMinEl) warningMinEl.textContent = result.minimumPrePurchase.tokens.toLocaleString();
    } else {
      if (warningEl) warningEl.classList.add('hidden');
    }
    
    // Check if balance is sufficient
    const step2NextBtn = document.getElementById('step-2-next');
    if (step2NextBtn) {
      if (remaining < 0) {
        step2NextBtn.disabled = true;
        step2NextBtn.classList.add('opacity-50', 'cursor-not-allowed');
        step2NextBtn.title = 'MLT 餘額不足';
      } else {
        step2NextBtn.disabled = false;
        step2NextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        step2NextBtn.title = '';
      }
    }
  } catch (error) {
    console.error('Cost calculation error:', error);
  }
};

// Setup MLT Investment Controls
const setupMLTControls = () => {
  // MLT Investment Slider
  const mltSlider = document.getElementById('mlt-investment-slider');
  const mltValue = document.getElementById('mlt-investment-value');
  
  if (mltSlider && mltValue) {
    mltSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      coinData.mltInvestment = value;
      mltValue.textContent = value.toLocaleString();
      updateCostSummary();
    });
  }
  
  // Pre-Purchase Amount
  const prePurchaseInput = document.getElementById('pre-purchase-amount');
  if (prePurchaseInput) {
    prePurchaseInput.addEventListener('input', (e) => {
      const value = parseInt(e.target.value) || 0;
      coinData.prePurchaseTokens = value;
      updateCostSummary();
    });
  }
  
  // Set Minimum Pre-Purchase Button
  const setMinBtn = document.getElementById('set-min-prepurchase-btn');
  if (setMinBtn) {
    setMinBtn.addEventListener('click', () => {
      if (!calculator) return;
      const initialPrice = calculator.calculateInitialPrice(coinData.mltInvestment, coinData.supply);
      const minPrePurchase = calculator.calculateMinimumPrePurchase(initialPrice, coinData.supply, 100);
      
      coinData.prePurchaseTokens = minPrePurchase.tokens;
      if (prePurchaseInput) {
        prePurchaseInput.value = minPrePurchase.tokens;
      }
      updateCostSummary();
    });
  }
  
  // Supply change listener
  const supplyInputs = document.querySelectorAll('input[name="supply"]');
  supplyInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      if (e.target.checked) {
        coinData.supply = parseInt(e.target.value);
        updateCostSummary();
      }
    });
  });
  
  // Initial calculation
  updateCostSummary();
};

// Step 3: Preview and launch
const updatePreview = () => {
  // Update coin preview
  document.getElementById('preview-coin-image').src = coinData.imageUrl;
  document.getElementById('preview-coin-name').textContent = coinData.name;
  document.getElementById('preview-coin-symbol').textContent = `$${coinData.symbol}`;
  document.getElementById('preview-supply').textContent = coinData.supply.toLocaleString();
  document.getElementById('preview-creator').textContent = userData?.username || '--';
  document.getElementById('preview-description').textContent = coinData.description || '沒有描述';
  
  // Calculate AI quality score
  const qualityScore = calculateQualityScore();
  document.getElementById('quality-score').textContent = qualityScore.total;
  document.getElementById('image-quality-score').textContent = qualityScore.image;
  document.getElementById('image-quality-bar').style.width = `${qualityScore.image}%`;
  document.getElementById('name-quality-score').textContent = qualityScore.name;
  document.getElementById('name-quality-bar').style.width = `${qualityScore.name}%`;
  document.getElementById('desc-quality-score').textContent = qualityScore.desc;
  document.getElementById('desc-quality-bar').style.width = `${qualityScore.desc}%`;
  
  // Update balances - use MLT instead of virtual_balance
  const currentMltBalance = userData?.mlt_balance || 0;
  
  // Calculate actual creation cost using calculator
  let totalCost = 2100; // Default estimate
  if (calculator) {
    try {
      const result = calculator.calculateCreationCost(
        coinData.mltInvestment,
        coinData.supply,
        coinData.prePurchaseTokens
      );
      totalCost = result.totalCost;
    } catch (e) {
      console.error('Cost calculation error:', e);
    }
  }
  
  document.getElementById('preview-balance').textContent = currentMltBalance.toLocaleString() + ' MLT';
  document.getElementById('preview-after-balance').textContent = Math.max(0, currentMltBalance - totalCost).toFixed(2) + ' MLT';
  
  // Update total cost display
  const totalCostEl = document.querySelector('.text-orange-500');
  if (totalCostEl && totalCostEl.textContent.includes('金幣')) {
    totalCostEl.textContent = totalCost.toFixed(2) + ' MLT';
  }
  
  // Calculate market cap
  const initialPrice = 0.01;
  const marketCap = (coinData.supply * initialPrice).toLocaleString();
  document.getElementById('preview-market-cap').textContent = marketCap;
  
  // Calculate initial hype
  const baseHype = 100;
  const qualityBonus = Math.floor((qualityScore.total - 50) / 2);
  const initialHype = Math.max(50, baseHype + qualityBonus);
  document.getElementById('preview-hype').textContent = initialHype;
};

// AI Quality Score calculation
const calculateQualityScore = () => {
  let imageScore = 50; // Base score
  let nameScore = 50;
  let descScore = 50;
  
  // Image quality (simple heuristics)
  if (selectedImage === 'upload') {
    imageScore += 20; // Bonus for custom upload
  }
  imageScore += Math.floor(Math.random() * 30); // Random factor
  
  // Name attractiveness
  const name = coinData.name.toLowerCase();
  if (name.includes('moon')) nameScore += 10;
  if (name.includes('doge') || name.includes('狗')) nameScore += 10;
  if (name.includes('rocket') || name.includes('火箭')) nameScore += 10;
  if (name.includes('diamond') || name.includes('鑽石')) nameScore += 10;
  if (coinData.name.length >= 10) nameScore += 10;
  nameScore += Math.floor(Math.random() * 20);
  
  // Description completeness
  if (coinData.description.length > 0) {
    descScore += 10;
    if (coinData.description.length > 50) descScore += 10;
    if (coinData.description.length > 100) descScore += 10;
    if (coinData.description.length > 200) descScore += 10;
  }
  descScore += Math.floor(Math.random() * 20);
  
  // Cap scores at 100
  imageScore = Math.min(100, imageScore);
  nameScore = Math.min(100, nameScore);
  descScore = Math.min(100, descScore);
  
  const total = Math.floor((imageScore + nameScore + descScore) / 3);
  
  return {
    image: imageScore,
    name: nameScore,
    desc: descScore,
    total: total
  };
};

// Setup Step 3
const setupStep3 = () => {
  document.getElementById('step-3-back').addEventListener('click', () => {
    showStep(2);
  });
  
  document.getElementById('launch-btn').addEventListener('click', launchCoin);
};

// Launch coin
const launchCoin = async () => {
  const launchBtn = document.getElementById('launch-btn');
  const launchText = document.getElementById('launch-text');
  const launchError = document.getElementById('launch-error');
  
  // Helper: Safe number conversion
  const toNumber = (v) => {
    const cleaned = String(v || '0').replace(/,/g, '').trim();
    const num = Number(cleaned);
    return isNaN(num) ? 0 : num;
  };
  
  // [GUARD] Validate pre-purchase amount before API call
  const safePrePurchaseTokens = toNumber(coinData.prePurchaseTokens);
  const safeMltInvestment = toNumber(coinData.mltInvestment);
  const safeTotalSupply = toNumber(coinData.supply);
  
  // Calculate minimum required tokens
  if (calculator) {
    const initialPrice = calculator.calculateInitialPrice(safeMltInvestment, safeTotalSupply);
    const minPurchase = calculator.calculateMinimumPrePurchase(initialPrice, safeTotalSupply, 100);
    const minTokens = minPurchase.tokens || 0;
    
    console.log('[GUARD] Pre-launch validation:', {
      prePurchaseTokens: safePrePurchaseTokens,
      minTokens: minTokens,
      isPassing: safePrePurchaseTokens >= minTokens
    });
    
    if (safePrePurchaseTokens < minTokens) {
      launchError.textContent = `預購數量不足！您輸入 ${safePrePurchaseTokens.toLocaleString()} 個幣，但最低需要 ${minTokens.toLocaleString()} 個幣（價值 100 MLT）`;
      launchError.classList.remove('hidden');
      return;
    }
  }
  
  // Check balance
  if (userData.virtual_balance < 100) {
    launchError.textContent = '餘額不足！您需要至少 2,100 MLT 才能創建幣種';
    launchError.classList.remove('hidden');
    return;
  }
  
  launchError.classList.add('hidden');
  launchBtn.disabled = true;
  launchText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>發射中...';
  
  try {
    const token = localStorage.getItem('auth_token');
    const qualityScore = calculateQualityScore();
    
    // Upload image to R2 if user uploaded a file
    let imageUrl = coinData.imageUrl;
    if (coinData.image && selectedImage === 'upload') {
      try {
        launchText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>上傳圖片...';
        
        // Convert image file to base64 (already done in imagePreview)
        const uploadResponse = await fetchUtils.post('/api/upload/image', {
          image: imagePreview,  // base64 data
          filename: coinData.image.name
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (uploadResponse.data.success && uploadResponse.data.url) {
          imageUrl = uploadResponse.data.url;
        } else {
          // Fallback to default image if upload fails
          console.warn('Image upload failed, using default:', uploadResponse.data.message);
          imageUrl = '/static/default-coin.svg';
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        // Continue with default image
        imageUrl = '/static/default-coin.svg';
      }
    }
    
    // Prepare coin creation data
    launchText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>創建幣種...';
    
    // Helper: Safe number conversion (remove commas, trim, convert)
    const toNumber = (v) => {
      const cleaned = String(v || '0').replace(/,/g, '').trim();
      const num = Number(cleaned);
      return isNaN(num) ? 0 : num;
    };
    
    // [DEBUG] Step 1: Log current state
    // READ persisted debug data
    const step2Data = localStorage.getItem('debug_step2_data');
    console.log('[DEBUG] Persisted Step2 data:', step2Data ? JSON.parse(step2Data) : 'NONE');
    
    console.log('[DEBUG] coinData state:', {
      prePurchaseTokens: coinData.prePurchaseTokens,
      mltInvestment: coinData.mltInvestment,
      supply: coinData.supply,
      name: coinData.name,
      symbol: coinData.symbol
    });
    
    // Convert to safe numbers
    const safePrePurchaseTokens = toNumber(coinData.prePurchaseTokens);
    const safeMltInvestment = toNumber(coinData.mltInvestment);
    const safeTotalSupply = toNumber(coinData.supply);
    
    console.log('[DEBUG] Converted to numbers:', {
      safePrePurchaseTokens,
      safeMltInvestment,
      safeTotalSupply
    });
    
    // Calculate minimum tokens if calculator is available
    let minTokens = 0;
    if (calculator) {
      const initialPrice = calculator.calculateInitialPrice(safeMltInvestment, safeTotalSupply);
      const minPurchase = calculator.calculateMinimumPrePurchase(initialPrice, safeTotalSupply, 100);
      minTokens = minPurchase.tokens || 0;
      console.log('[DEBUG] Calculated minimums:', {
        initialPrice,
        minTokens,
        isPassing: safePrePurchaseTokens >= minTokens
      });
    }
    
    // Build payload with correct field names
    const formData = {
      name: coinData.name,
      symbol: coinData.symbol,
      description: coinData.description,
      total_supply: safeTotalSupply,
      initial_mlt_investment: safeMltInvestment,
      pre_purchase_amount: safePrePurchaseTokens,  // Backend expects this field
      twitter_url: coinData.twitterUrl || undefined,
      telegram_url: coinData.telegramUrl || undefined,
      website_url: coinData.websiteUrl || undefined,
      quality_score: qualityScore.total,
      image_url: imageUrl
    };
    
    // 🚨 CRITICAL SAFEGUARD: Ensure pre_purchase_amount is valid
    if (!formData.pre_purchase_amount || formData.pre_purchase_amount === 0) {
      console.error('[CRITICAL ERROR] pre_purchase_amount is invalid:', {
        original: coinData.prePurchaseTokens,
        converted: safePrePurchaseTokens,
        final: formData.pre_purchase_amount,
        step2Data: localStorage.getItem('debug_step2_data')
      });
      
      // Try to recover from Step 2 persisted data
      const step2Data = localStorage.getItem('debug_step2_data');
      if (step2Data) {
        const parsed = JSON.parse(step2Data);
        if (parsed.prePurchase && parsed.prePurchase > 0) {
          console.warn('[RECOVERY] Using persisted Step2 prePurchase value:', parsed.prePurchase);
          formData.pre_purchase_amount = parsed.prePurchase;
        }
      }
      
      // If still invalid, use minimum calculated value
      if (!formData.pre_purchase_amount || formData.pre_purchase_amount === 0) {
        if (minTokens > 0) {
          console.warn('[RECOVERY] Using calculated minTokens:', minTokens);
          formData.pre_purchase_amount = Math.ceil(minTokens);
        } else {
          // Last resort: use initial coinData value
          console.warn('[RECOVERY] Using default 50000 tokens');
          formData.pre_purchase_amount = 50000;
        }
      }
    }
    
    console.log('[DEBUG] create-coin payload (FINAL):', formData);
    console.log('[DEBUG] JSON payload:', JSON.stringify(formData, null, 2));
    
    const requestData = formData;
    
    const response = await fetchUtils.post('/api/coins', requestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      const coin = response.data.data;
      
      // Track event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'coin_created', {
          coin_id: coin.id,
          coin_symbol: coin.symbol,
          quality_score: qualityScore.total
        });
      }
      
      // Show success modal
      showSuccessModal(coin);
      
      // Refresh user data
      userData = await checkAuth();
      updateUserUI(userData);
    }
  } catch (error) {
    console.error('Launch error:', error);
    console.error('Error response:', error.response?.data);
    
    let errorMsg = '發射失敗，請稍後再試';
    if (error.response?.data?.error) {
      errorMsg = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    launchError.textContent = errorMsg;
    launchError.classList.remove('hidden');
  } finally {
    launchBtn.disabled = false;
    launchText.innerHTML = '<i class="fas fa-rocket mr-2"></i>發射我的 Meme 幣！';
  }
};

// Show success modal
const showSuccessModal = (coin) => {
  const modal = document.getElementById('success-modal');
  
  document.getElementById('success-coin-image').src = coin.image_url || coinData.imageUrl;
  document.getElementById('success-coin-name').textContent = coin.name;
  document.getElementById('success-coin-symbol').textContent = `$${coin.symbol}`;
  document.getElementById('success-market-cap').textContent = Number(coin.market_cap || 0).toFixed(2);
  
  // Get coin rank (simplified)
  document.getElementById('success-rank').textContent = 'NEW';
  
  modal.classList.remove('hidden');
  
  // View coin button
  document.getElementById('view-coin-btn').onclick = () => {
    window.location.href = `/coin/${coin.id}`;
  };
  
  // Share to Twitter
  document.getElementById('share-twitter-btn').onclick = () => {
    const text = encodeURIComponent(`🚀 我剛在 MemeLaunch Tycoon 上發射了 ${coin.name} ($${coin.symbol})！加入我們的 meme 幣革命！`);
    const url = encodeURIComponent(`${window.location.origin}/coin/${coin.id}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };
  
  // Create another
  document.getElementById('create-another-btn').onclick = () => {
    window.location.reload();
  };
};

// Logout
const handleLogout = () => {
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
};

// Initialize
const init = async () => {
  // Initialize MLT Calculator
  if (typeof MLTCalculator !== 'undefined') {
    calculator = new MLTCalculator();
  }
  
  userData = await checkAuth();
  
  if (userData) {
    updateUserUI(userData);
    
    setupImageUpload();
    loadTemplates();
    setupStep1();
    setupStep2();
    setupMLTControls();  // Setup MLT investment controls
    setupStep3();
    
    // 🔄 SYNC DOM input values to coinData on page load
    setTimeout(() => {
      const mltInput = document.getElementById('mlt-investment');
      const prePurchaseInput = document.getElementById('pre-purchase-amount');
      
      if (mltInput && mltInput.value) {
        const parsed = parseInt(mltInput.value);
        if (!isNaN(parsed)) {
          coinData.mltInvestment = parsed;
          console.log('🔄 [INIT] Synced MLT investment from DOM:', parsed);
        }
      }
      
      if (prePurchaseInput && prePurchaseInput.value) {
        const parsed = parseInt(prePurchaseInput.value);
        if (!isNaN(parsed)) {
          coinData.prePurchaseTokens = parsed;
          console.log('🔄 [INIT] Synced pre-purchase tokens from DOM:', parsed);
        }
      }
      
      console.log('🔄 [INIT] Final coinData after sync:', {
        mltInvestment: coinData.mltInvestment,
        prePurchaseTokens: coinData.prePurchaseTokens
      });
    }, 500);  // Small delay to ensure DOM is fully rendered
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Hide page loader
    fetchUtils.hidePageLoader();
  }
};

document.addEventListener('DOMContentLoaded', init);

// 🌐 Language switcher support
if (typeof i18n !== 'undefined') {
  i18n.onLocaleChange(() => {
    console.log('🌐 Language changed in Create Coin page, reloading translations...');
    // Reload page to apply new language
    window.location.reload();
  });
}
