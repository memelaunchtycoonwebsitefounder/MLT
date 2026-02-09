/**
 * Create Coin JavaScript
 * Handles the 3-step coin creation wizard
 */

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
  supply: 1000000
};

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
    const response = await axios.get('/api/auth/me', {
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
  const balanceEl = document.getElementById('user-balance');
  if (balanceEl) {
    balanceEl.textContent = Number(user.virtual_balance || 0).toLocaleString();
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
          const response = await axios.get(`/api/coins?symbol=${symbol}`, {
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
  
  // Update balances
  const currentBalance = userData?.virtual_balance || 0;
  document.getElementById('preview-balance').textContent = currentBalance.toLocaleString() + ' 金幣';
  document.getElementById('preview-after-balance').textContent = (currentBalance - 100).toLocaleString() + ' 金幣';
  
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
  
  // Check balance
  if (userData.virtual_balance < 100) {
    launchError.textContent = '餘額不足！您需要至少 100 金幣才能創建幣種';
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
        const uploadResponse = await axios.post('/api/upload/image', {
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
    
    const requestData = {
      name: coinData.name,
      symbol: coinData.symbol,
      description: coinData.description,
      total_supply: coinData.supply,
      quality_score: qualityScore.total,
      image_url: imageUrl  // Use uploaded URL or template/default URL
    };
    
    const response = await axios.post('/api/coins', requestData, {
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
    
    let errorMsg = '發射失敗，請稍後再試';
    if (error.response?.data?.error) {
      errorMsg = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
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
  userData = await checkAuth();
  
  if (userData) {
    updateUserUI(userData);
    
    setupImageUpload();
    loadTemplates();
    setupStep1();
    setupStep2();
    setupStep3();
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  }
};

document.addEventListener('DOMContentLoaded', init);
