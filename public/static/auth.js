/**
 * MemeLaunch Tycoon - Authentication & Email Collection
 * Handles all auth forms: signup, login, forgot password, and email collection
 */

const API_BASE = '/api';

// Utility: Show toast notification
const showToast = (message, type = 'success') => {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => toast.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Utility: Show form message
const showMessage = (message, type = 'success') => {
  const messageEl = document.getElementById('form-message');
  if (!messageEl) {
    showToast(message, type);
    return;
  }

  messageEl.textContent = message;
  messageEl.classList.remove('hidden', 'success', 'error');
  messageEl.classList.add(type);
};

// Utility: Set button loading state
const setButtonLoading = (buttonId, isLoading, originalText = '') => {
  const button = document.getElementById(buttonId);
  if (!button) return;
  
  button.disabled = isLoading;
  
  if (isLoading) {
    button.setAttribute('data-original-text', button.innerHTML);
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>處理中...';
  } else {
    const original = button.getAttribute('data-original-text');
    button.innerHTML = original || originalText;
  }
};

// Password strength checker
const checkPasswordStrength = (password) => {
  let strength = 0;
  const feedback = [];

  if (password.length >= 8) strength += 25;
  else feedback.push('至少 8 個字符');

  if (/[A-Z]/.test(password)) strength += 25;
  else feedback.push('至少 1 個大寫字母');

  if (/[0-9]/.test(password)) strength += 25;
  else feedback.push('至少 1 個數字');

  if (/[^A-Za-z0-9]/.test(password)) strength += 25;
  else feedback.push('至少 1 個特殊字符');

  let level = 'weak';
  if (strength >= 75) level = 'strong';
  else if (strength >= 50) level = 'medium';

  return { strength, level, feedback };
};

// Update password strength UI
const updatePasswordStrength = (password) => {
  const strengthBar = document.querySelector('.password-strength-fill');
  const strengthText = document.querySelector('.password-strength-text');
  
  if (!strengthBar || !strengthText) return;

  const { strength, level, feedback } = checkPasswordStrength(password);
  
  strengthBar.className = `password-strength-fill ${level}`;
  
  let text = '';
  if (level === 'weak') text = '弱 - ' + feedback.join(', ');
  else if (level === 'medium') text = '中等 - ' + feedback.join(', ');
  else text = '強 - 密碼安全';
  
  strengthText.textContent = text;
};

// ===========================================
// EMAIL COLLECTION (Landing Page)
// ===========================================
const setupEmailCollection = () => {
  const emailForms = document.querySelectorAll('.email-signup-form');
  
  emailForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = form.querySelector('input[type="email"]').value;
      const source = form.getAttribute('data-source') || 'unknown';
      const button = form.querySelector('button');
      const originalHTML = button.innerHTML;
      
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>處理中...';
      
      try {
        const response = await axios.post(`${API_BASE}/email`, {
          email,
          source
        });
        
        if (response.data.success) {
          showToast('太好了！我們會通知您最新消息 🎉', 'success');
          form.querySelector('input').value = '';
          
          // Redirect to signup after a delay
          setTimeout(() => {
            window.location.href = '/signup?email=' + encodeURIComponent(email);
          }, 1500);
        }
      } catch (error) {
        console.error('Email collection error:', error);
        const message = error.response?.data?.error || error.response?.data?.message || '提交失敗，請稍後再試';
        showToast(message, 'error');
      } finally {
        button.disabled = false;
        button.innerHTML = originalHTML;
      }
    });
  });
};

// ===========================================
// SIGNUP
// ===========================================
const setupSignup = () => {
  const form = document.getElementById('signup-form');
  if (!form) return;
  
  // Pre-fill email from URL parameter
  const params = new URLSearchParams(window.location.search);
  const emailParam = params.get('email');
  if (emailParam) {
    const emailInput = form.querySelector('input[name="email"]');
    if (emailInput) emailInput.value = emailParam;
  }
  
  // Password strength indicator
  const passwordInput = form.querySelector('input[name="password"]');
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      updatePasswordStrength(e.target.value);
    });
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const email = formData.get('email');
    const username = formData.get('username');
    const password = formData.get('password');
    
    // Validation
    if (!email || !username || !password) {
      showMessage('請填寫所有欄位', 'error');
      return;
    }
    
    if (password.length < 8) {
      showMessage('密碼至少需要 8 個字符', 'error');
      return;
    }
    
    setButtonLoading('submit-btn', true);
    
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, {
        email,
        username,
        password
      });
      
      if (response.data.success) {
        // Store token
        localStorage.setItem('auth_token', response.data.data.token);
        
        // Track event
        if (typeof gtag !== 'undefined') {
          gtag('event', 'sign_up', {
            method: 'email',
            user_id: response.data.data.user.id
          });
        }
        
        showMessage('註冊成功！正在跳轉...', 'success');
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      const message = error.response?.data?.error || error.response?.data?.message || '註冊失敗，請稍後再試';
      showMessage(message, 'error');
    } finally {
      setButtonLoading('submit-btn', false);
    }
  });
};

// ===========================================
// LOGIN
// ===========================================
const setupLogin = () => {
  const form = document.getElementById('login-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (!email || !password) {
      showMessage('請填寫所有欄位', 'error');
      return;
    }
    
    setButtonLoading('submit-btn', true);
    
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password
      });
      
      if (response.data.success) {
        // Store token
        localStorage.setItem('auth_token', response.data.data.token);
        
        // Track event
        if (typeof gtag !== 'undefined') {
          gtag('event', 'login', {
            method: 'email'
          });
        }
        
        showMessage('登入成功！正在跳轉...', 'success');
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || error.response?.data?.message || '登入失敗，請檢查您的郵箱和密碼';
      showMessage(message, 'error');
    } finally {
      setButtonLoading('submit-btn', false);
    }
  });
};

// ===========================================
// FORGOT PASSWORD
// ===========================================
const setupForgotPassword = () => {
  const form = document.getElementById('forgot-password-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const email = formData.get('email');
    
    if (!email) {
      showMessage('請輸入您的郵箱', 'error');
      return;
    }
    
    setButtonLoading('submit-btn', true);
    
    try {
      const response = await axios.post(`${API_BASE}/auth/forgot-password`, {
        email
      });
      
      if (response.data.success) {
        showMessage('如果該郵箱已註冊，您將收到密碼重置連結', 'success');
        form.reset();
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const message = error.response?.data?.error || error.response?.data?.message || '請求失敗，請稍後再試';
      showMessage(message, 'error');
    } finally {
      setButtonLoading('submit-btn', false);
    }
  });
};

// ===========================================
// RESET PASSWORD
// ===========================================
const setupResetPassword = () => {
  const form = document.getElementById('reset-password-form');
  if (!form) return;
  
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  
  if (!token) {
    showMessage('無效的重置連結', 'error');
    return;
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      showMessage('請填寫所有欄位', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      showMessage('密碼不匹配', 'error');
      return;
    }
    
    if (password.length < 8) {
      showMessage('密碼至少需要 8 個字符', 'error');
      return;
    }
    
    setButtonLoading('submit-btn', true);
    
    try {
      const response = await axios.post(`${API_BASE}/auth/reset-password`, {
        token,
        password
      });
      
      if (response.data.success) {
        showMessage('密碼已成功重置！正在跳轉到登入頁面...', 'success');
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const message = error.response?.data?.error || error.response?.data?.message || '重置失敗，請稍後再試';
      showMessage(message, 'error');
    } finally {
      setButtonLoading('submit-btn', false);
    }
  });
};

// ===========================================
// LOGOUT
// ===========================================
const setupLogout = () => {
  const logoutButtons = document.querySelectorAll('[data-logout]');
  
  logoutButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      localStorage.removeItem('auth_token');
      showToast('已登出', 'success');
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    });
  });
};

// ===========================================
// INITIALIZE
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
  // Setup email collection (landing page)
  setupEmailCollection();
  
  // Setup auth forms
  setupSignup();
  setupLogin();
  setupForgotPassword();
  setupResetPassword();
  setupLogout();
  
  console.log('✅ Auth & Email Collection initialized');
});
