/**
 * Authentication JavaScript
 * Handles signup, login, password reset forms
 */

// Utility Functions
const showError = (elementId, message) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.classList.remove('hidden');
  }
};

const hideError = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add('hidden');
  }
};

const showMessage = (message, type = 'success') => {
  const messageEl = document.getElementById('form-message');
  if (!messageEl) return;

  messageEl.textContent = message;
  messageEl.classList.remove('hidden', 'bg-red-500/20', 'border-red-500', 'text-red-400', 'bg-green-500/20', 'border-green-500', 'text-green-400');
  
  if (type === 'error') {
    messageEl.classList.add('bg-red-500/20', 'border', 'border-red-500', 'text-red-400');
  } else {
    messageEl.classList.add('bg-green-500/20', 'border', 'border-green-500', 'text-green-400');
  }
};

const setButtonLoading = (isLoading) => {
  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');
  
  if (submitBtn) {
    submitBtn.disabled = isLoading;
  }
  
  if (submitText) {
    if (isLoading) {
      submitText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>處理中...';
    } else {
      // Restore original text based on page
      const form = submitBtn.closest('form');
      if (form?.id === 'signup-form') {
        submitText.innerHTML = '創建帳號';
      } else if (form?.id === 'login-form') {
        submitText.innerHTML = '登入';
      } else if (form?.id === 'forgot-password-form') {
        submitText.innerHTML = '發送重置連結';
      } else if (form?.id === 'reset-password-form') {
        submitText.innerHTML = '重置密碼';
      }
    }
  }
};

// Email validation
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Password strength checker
const checkPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  return {
    score: Math.min(strength, 4),
    text: ['極弱', '弱', '中等', '強', '非常強'][Math.min(strength, 4)]
  };
};

const updatePasswordStrength = (password) => {
  const strength = checkPasswordStrength(password);
  const colors = ['#FF4444', '#FF8844', '#FFAA44', '#88DD88', '#00FF88'];
  
  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById(`strength-${i}`);
    if (bar) {
      if (i <= strength.score) {
        bar.style.backgroundColor = colors[strength.score];
      } else {
        bar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      }
    }
  }
  
  const textEl = document.getElementById('strength-text');
  if (textEl) {
    textEl.textContent = `密碼強度：${strength.text}`;
    textEl.style.color = colors[strength.score];
  }
};

// Password visibility toggle
const setupPasswordToggle = () => {
  const toggleBtns = document.querySelectorAll('#toggle-password');
  
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const input = btn.previousElementSibling || btn.parentElement.querySelector('input[type="password"], input[type="text"]');
      if (!input) return;
      
      const icon = btn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        if (icon) {
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        }
      } else {
        input.type = 'password';
        if (icon) {
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      }
    });
  });
};

// Signup Form Handler
const setupSignupForm = () => {
  const form = document.getElementById('signup-form');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const termsCheckbox = document.getElementById('terms');

  // Real-time password strength
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      updatePasswordStrength(e.target.value);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    ['email-error', 'username-error', 'password-error', 'confirm-password-error', 'terms-error'].forEach(hideError);

    // Validate
    let hasError = false;

    if (!isValidEmail(emailInput.value)) {
      showError('email-error', '請輸入有效的電子郵箱地址');
      hasError = true;
    }

    if (usernameInput.value.length < 3) {
      showError('username-error', '用戶名至少需要 3 個字符');
      hasError = true;
    }

    const passwordStrength = checkPasswordStrength(passwordInput.value);
    if (passwordInput.value.length < 8) {
      showError('password-error', '密碼必須至少 8 個字符');
      hasError = true;
    } else if (!/[A-Z]/.test(passwordInput.value)) {
      showError('password-error', '密碼必須包含至少一個大寫字母');
      hasError = true;
    } else if (!/\d/.test(passwordInput.value)) {
      showError('password-error', '密碼必須包含至少一個數字');
      hasError = true;
    } else if (!/[^a-zA-Z0-9]/.test(passwordInput.value)) {
      showError('password-error', '密碼必須包含至少一個特殊字符');
      hasError = true;
    }

    if (passwordInput.value !== confirmPasswordInput.value) {
      showError('confirm-password-error', '兩次密碼輸入不一致');
      hasError = true;
    }

    if (!termsCheckbox.checked) {
      showError('terms-error', '請同意服務條款和隱私政策');
      hasError = true;
    }

    if (hasError) return;

    // Submit
    setButtonLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        email: emailInput.value,
        username: usernameInput.value,
        password: passwordInput.value
      });

      if (response.data.success) {
        // Save token
        localStorage.setItem('auth_token', response.data.data.token);
        
        showMessage('🎉 註冊成功！正在跳轉...', 'success');
        
        // Track event
        if (typeof gtag !== 'undefined') {
          gtag('event', 'sign_up', {
            method: 'email'
          });
        }
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.response) {
        const message = error.response.data.error || error.response.data.message;
        
        if (message.includes('already exists') || message.includes('已註冊')) {
          showError('email-error', '此郵箱已被註冊，請使用其他郵箱或直接登入');
        } else if (message.includes('username') || message.includes('用戶名')) {
          showError('username-error', message);
        } else {
          showMessage(message || '註冊失敗，請稍後重試', 'error');
        }
      } else {
        showMessage('網絡錯誤，請檢查您的網絡連接', 'error');
      }
    } finally {
      setButtonLoading(false);
    }
  });
};

// Login Form Handler
const setupLoginForm = () => {
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberMeCheckbox = document.getElementById('remember-me');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    ['email-error', 'password-error'].forEach(hideError);

    // Validate
    let hasError = false;

    if (!isValidEmail(emailInput.value)) {
      showError('email-error', '請輸入有效的電子郵箱地址');
      hasError = true;
    }

    if (passwordInput.value.length < 1) {
      showError('password-error', '請輸入密碼');
      hasError = true;
    }

    if (hasError) return;

    // Submit
    setButtonLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email: emailInput.value,
        password: passwordInput.value,
        rememberMe: rememberMeCheckbox?.checked || false
      });

      if (response.data.success) {
        // Save token
        localStorage.setItem('auth_token', response.data.data.token);
        
        showMessage('✅ 登入成功！正在跳轉...', 'success');
        
        // Track event
        if (typeof gtag !== 'undefined') {
          gtag('event', 'login', {
            method: 'email'
          });
        }
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        const message = error.response.data.error || error.response.data.message;
        
        if (message.includes('not found') || message.includes('找不到')) {
          showMessage('帳號不存在，請先註冊', 'error');
        } else if (message.includes('password') || message.includes('密碼')) {
          showMessage('郵箱或密碼錯誤，請重試', 'error');
        } else {
          showMessage(message || '登入失敗，請稍後重試', 'error');
        }
      } else {
        showMessage('網絡錯誤，請檢查您的網絡連接', 'error');
      }
    } finally {
      setButtonLoading(false);
    }
  });
};

// Forgot Password Form Handler
const setupForgotPasswordForm = () => {
  const form = document.getElementById('forgot-password-form');
  if (!form) return;

  const emailInput = document.getElementById('email');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    hideError('email-error');

    // Validate
    if (!isValidEmail(emailInput.value)) {
      showError('email-error', '請輸入有效的電子郵箱地址');
      return;
    }

    // Submit
    setButtonLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', {
        email: emailInput.value
      });

      if (response.data.success) {
        showMessage('✉️ 重置連結已發送到您的郵箱，請查收（包括垃圾郵件夾）', 'success');
        emailInput.value = '';
        
        // Track event
        if (typeof gtag !== 'undefined') {
          gtag('event', 'password_reset_request');
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response) {
        const message = error.response.data.error || error.response.data.message;
        showMessage(message || '發送失敗，請稍後重試', 'error');
      } else {
        showMessage('網絡錯誤，請檢查您的網絡連接', 'error');
      }
    } finally {
      setButtonLoading(false);
    }
  });
};

// Reset Password Form Handler
const setupResetPasswordForm = () => {
  const form = document.getElementById('reset-password-form');
  if (!form) return;

  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const token = form.dataset.token;

  // Check if token exists
  if (!token) {
    showMessage('無效的重置連結，請重新申請', 'error');
    setTimeout(() => {
      window.location.href = '/forgot-password';
    }, 3000);
    return;
  }

  // Real-time password strength
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      updatePasswordStrength(e.target.value);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    ['password-error', 'confirm-password-error'].forEach(hideError);

    // Validate
    let hasError = false;

    if (passwordInput.value.length < 8) {
      showError('password-error', '密碼必須至少 8 個字符');
      hasError = true;
    } else if (!/[A-Z]/.test(passwordInput.value)) {
      showError('password-error', '密碼必須包含至少一個大寫字母');
      hasError = true;
    } else if (!/\d/.test(passwordInput.value)) {
      showError('password-error', '密碼必須包含至少一個數字');
      hasError = true;
    } else if (!/[^a-zA-Z0-9]/.test(passwordInput.value)) {
      showError('password-error', '密碼必須包含至少一個特殊字符');
      hasError = true;
    }

    if (passwordInput.value !== confirmPasswordInput.value) {
      showError('confirm-password-error', '兩次密碼輸入不一致');
      hasError = true;
    }

    if (hasError) return;

    // Submit
    setButtonLoading(true);

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token: token,
        newPassword: passwordInput.value
      });

      if (response.data.success) {
        showMessage('✅ 密碼重置成功！正在跳轉到登入頁...', 'success');
        
        // Track event
        if (typeof gtag !== 'undefined') {
          gtag('event', 'password_reset_success');
        }
        
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.response) {
        const message = error.response.data.error || error.response.data.message;
        
        if (message.includes('expired') || message.includes('過期')) {
          showMessage('重置連結已過期，請重新申請', 'error');
          setTimeout(() => {
            window.location.href = '/forgot-password';
          }, 3000);
        } else if (message.includes('invalid') || message.includes('無效')) {
          showMessage('無效的重置連結，請重新申請', 'error');
        } else {
          showMessage(message || '重置失敗，請稍後重試', 'error');
        }
      } else {
        showMessage('網絡錯誤，請檢查您的網絡連接', 'error');
      }
    } finally {
      setButtonLoading(false);
    }
  });
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggle();
  setupSignupForm();
  setupLoginForm();
  setupForgotPasswordForm();
  setupResetPasswordForm();
});
