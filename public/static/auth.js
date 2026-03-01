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
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
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
  else feedback.push('At least 8 characters');

  if (/[A-Z]/.test(password)) strength += 25;
  else feedback.push('At least 1 uppercase letter');

  if (/[0-9]/.test(password)) strength += 25;
  else feedback.push('At least 1 number');

  if (/[^A-Za-z0-9]/.test(password)) strength += 25;
  else feedback.push('At least 1 special character');

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
  if (level === 'weak') text = 'Weak - ' + feedback.join(', ');
  else if (level === 'medium') text = 'Medium - ' + feedback.join(', ');
  else text = 'Strong - Password secure';
  
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
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
      
      try {
        const response = await fetchUtils.post(`${API_BASE}/email`, {
          email,
          source
        });
        
        if (response.data.success) {
          showToast('Great! We will notify you of updates 🎉', 'success');
          form.querySelector('input').value = '';
          
          // Redirect to signup after a delay
          setTimeout(() => {
            window.location.href = '/signup?email=' + encodeURIComponent(email);
          }, 1500);
        }
      } catch (error) {
        console.error('Email collection error:', error);
        const message = error.response?.data?.error || error.response?.data?.message || 'Submission failed, please try again later';
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
      showMessage('Please fill in all fields', 'error');
      return;
    }
    
    if (password.length < 8) {
      showMessage('Password must be at least 8 characters', 'error');
      return;
    }
    
    setButtonLoading('submit-btn', true);
    
    try {
      const response = await fetchUtils.post(`${API_BASE}/auth/register`, {
        email,
        username,
        password
      });
      
      if (response.data.success) {
        console.log('✅ Signup API success, storing token...');
        
        // Store token
        const token = response.data.data.token;
        localStorage.setItem('auth_token', token);
        
        // Also store user data
        if (response.data.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        
        // Verify token is stored
        const storedToken = localStorage.getItem('auth_token');
        console.log('Token storage verification:', {
          originalLength: token.length,
          storedLength: storedToken ? storedToken.length : 0,
          matches: token === storedToken
        });
        
        if (!storedToken || storedToken !== token) {
          console.error('❌ Token storage failed!');
          showMessage('Save failed, please try again', 'error');
          return;
        }
        
        console.log('✅ Token stored successfully');
        
        // Track event
        if (typeof gtag !== 'undefined') {
          gtag('event', 'sign_up', {
            method: 'email',
            user_id: response.data.data.user.id
          });
        }
        
        showMessage('Registration successful! Redirecting...', 'success');
        
        console.log('✅ Redirecting to /dashboard immediately');
        // localStorage is synchronous, no need to wait
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Signup error:', error);
      const message = error.response?.data?.error || error.response?.data?.message || 'Registration failed, please try again later';
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
      showMessage('Please fill in all fields', 'error');
      return;
    }
    
    setButtonLoading('submit-btn', true);
    
    try {
      const response = await fetchUtils.post(`${API_BASE}/auth/login`, {
        email,
        password
      });
      
      if (response.data.success) {
        console.log('✅ Login API success, storing token...');
        
        // Store token
        const token = response.data.data.token;
        localStorage.setItem('auth_token', token);
        
        // Also store user data
        if (response.data.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        
        // Verify token is stored
        const storedToken = localStorage.getItem('auth_token');
        console.log('Token storage verification:', {
          originalLength: token.length,
          storedLength: storedToken ? storedToken.length : 0,
          matches: token === storedToken
        });
        
        if (!storedToken || storedToken !== token) {
          console.error('❌ Token storage failed!');
          showMessage('Save failed, please try again', 'error');
          return;
        }
        
        console.log('✅ Token stored successfully');
        
        // Track event
        if (typeof gtag !== 'undefined') {
          gtag('event', 'login', {
            method: 'email'
          });
        }
        
        showMessage('Login successful! Redirecting...', 'success');
        
        // Get redirect URL or default to dashboard
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/dashboard';
        
        console.log('✅ Redirecting to:', redirect, 'immediately');
        // localStorage is synchronous, no need to wait
        window.location.href = redirect;
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || error.response?.data?.message || 'Login failed, please check your email and password';
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
      showMessage('Please enter your email', 'error');
      return;
    }
    
    setButtonLoading('submit-btn', true);
    
    try {
      const response = await fetchUtils.post(`${API_BASE}/auth/forgot-password`, {
        email
      });
      
      if (response.data.success) {
        showMessage('If the email is registered, you will receive a password reset link', 'success');
        form.reset();
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const message = error.response?.data?.error || error.response?.data?.message || 'Request failed, please try again later';
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
    showMessage('Invalid reset link', 'error');
    return;
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      showMessage('Please fill in all fields', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }
    
    if (password.length < 8) {
      showMessage('Password must be at least 8 characters', 'error');
      return;
    }
    
    setButtonLoading('submit-btn', true);
    
    try {
      const response = await fetchUtils.post(`${API_BASE}/auth/reset-password`, {
        token,
        password
      });
      
      if (response.data.success) {
        showMessage('Password reset successfully! Redirecting to login page...', 'success');
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const message = error.response?.data?.error || error.response?.data?.message || 'Reset failed, please try again later';
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
      showToast('Logged out', 'success');
      
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
