/**
 * Auth Pages JavaScript - Modern Login & Register
 * Handles form validation, password strength, social login, and animations
 */

class AuthPageManager {
  constructor() {
    this.currentPage = window.location.pathname;
    this.i18n = window.i18n || { currentLocale: 'en', translations: {} };
    this.init();
  }

  init() {
    this.setupPasswordToggle();
    this.setupFormValidation();
    this.setupPasswordStrength();
    this.setupSocialButtons();
    this.setupParticles();
    this.setupAnimations();
    
    // Initialize i18n if available
    if (window.i18n) {
      window.i18n.onChange(() => this.updateTexts());
    }
  }

  // Password Toggle Visibility
  setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const input = button.previousElementSibling || button.closest('.relative').querySelector('input');
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    });
  }

  // Form Validation
  setupFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (this.validateForm(form)) {
          this.submitForm(form);
        }
      });

      // Real-time validation
      const inputs = form.querySelectorAll('input[required]');
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => {
          if (input.classList.contains('invalid')) {
            this.validateField(input);
          }
        });
      });
    });
  }

  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  validateField(input) {
    const type = input.type;
    const value = input.value.trim();
    const name = input.name;
    let errorMessage = '';
    let isValid = true;

    // Get error element
    const errorEl = input.parentElement.querySelector('.error-message') || 
                   this.createErrorElement(input);

    // Required check
    if (input.required && !value) {
      errorMessage = this.t(`auth.validation.${name}Required`);
      isValid = false;
    }
    // Email validation
    else if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errorMessage = this.t('auth.validation.emailInvalid');
        isValid = false;
      }
    }
    // Password validation
    else if (name === 'password' && value) {
      if (value.length < 8) {
        errorMessage = this.t('auth.validation.passwordMinLength');
        isValid = false;
      } else {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(value)) {
          errorMessage = this.t('auth.validation.passwordPattern');
          isValid = false;
        }
      }
    }
    // Confirm password validation
    else if (name === 'confirmPassword' && value) {
      const password = document.querySelector('input[name="password"]').value;
      if (value !== password) {
        errorMessage = this.t('auth.validation.confirmPasswordMismatch');
        isValid = false;
      }
    }
    // Username validation
    else if (name === 'username' && value) {
      if (value.length < 3) {
        errorMessage = this.t('auth.validation.usernameMinLength');
        isValid = false;
      } else {
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(value)) {
          errorMessage = this.t('auth.validation.usernamePattern');
          isValid = false;
        }
      }
    }

    // Update UI
    if (isValid) {
      input.classList.remove('invalid', 'border-red-500');
      input.classList.add('valid', 'border-green-500');
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    } else {
      input.classList.remove('valid', 'border-green-500');
      input.classList.add('invalid', 'border-red-500');
      errorEl.textContent = errorMessage;
      errorEl.classList.remove('hidden');
    }

    return isValid;
  }

  createErrorElement(input) {
    const errorEl = document.createElement('p');
    errorEl.className = 'error-message text-red-400 text-sm mt-1 hidden';
    input.parentElement.appendChild(errorEl);
    return errorEl;
  }

  // Password Strength Indicator
  setupPasswordStrength() {
    const passwordInput = document.querySelector('input[name="password"]');
    const strengthIndicator = document.getElementById('password-strength');
    
    if (!passwordInput || !strengthIndicator) return;

    passwordInput.addEventListener('input', () => {
      const password = passwordInput.value;
      const strength = this.calculatePasswordStrength(password);
      
      const bar = strengthIndicator.querySelector('.password-strength-bar');
      const label = strengthIndicator.querySelector('.strength-label');
      
      if (password.length === 0) {
        strengthIndicator.classList.add('hidden');
        return;
      }
      
      strengthIndicator.classList.remove('hidden');
      bar.className = `password-strength-bar ${strength.class}`;
      label.textContent = this.t(`auth.register.passwordStrength.${strength.label}`);
    });
  }

  calculatePasswordStrength(password) {
    let score = 0;
    
    if (!password) return { score: 0, class: 'weak', label: 'weak' };
    
    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Complexity
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    
    // Map score to strength
    if (score <= 2) return { score, class: 'weak', label: 'weak' };
    if (score <= 4) return { score, class: 'medium', label: 'medium' };
    if (score <= 5) return { score, class: 'strong', label: 'strong' };
    return { score, class: 'very-strong', label: 'veryStrong' };
  }

  // Form Submission
  async submitForm(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    const loadingText = submitButton.dataset.loading || 'Loading...';
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <span class="spinner"></span>
      <span class="ml-2">${loadingText}</span>
    `;
    
    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      const endpoint = form.dataset.endpoint || form.action;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        this.showSuccess(
          this.currentPage.includes('login') 
            ? this.t('auth.success.loginSuccess')
            : this.t('auth.success.registerSuccess')
        );
        
        // Redirect after success
        setTimeout(() => {
          if (result.redirect) {
            window.location.href = result.redirect;
          } else if (this.currentPage.includes('register')) {
            window.location.href = '/dashboard';
          } else {
            window.location.href = result.token ? '/dashboard' : '/login';
          }
        }, 1500);
      } else {
        this.showError(result.message || this.t('auth.errors.serverError'));
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showError(this.t('auth.errors.networkError'));
    } finally {
      // Restore button state
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }
  }

  // Social Login Handlers
  setupSocialButtons() {
    const googleBtn = document.querySelector('[data-social="google"]');
    const twitterBtn = document.querySelector('[data-social="twitter"]');
    const metamaskBtn = document.querySelector('[data-social="metamask"]');
    
    if (googleBtn) {
      googleBtn.addEventListener('click', () => this.socialLogin('google'));
    }
    
    if (twitterBtn) {
      twitterBtn.addEventListener('click', () => this.socialLogin('twitter'));
    }
    
    if (metamaskBtn) {
      metamaskBtn.addEventListener('click', () => this.connectMetaMask());
    }
  }

  async socialLogin(provider) {
    try {
      if (provider === 'google' || provider === 'twitter') {
        // Redirect to OAuth endpoint
        window.location.href = `/api/auth/oauth/${provider}`;
      }
    } catch (error) {
      console.error('Social login error:', error);
      this.showError('Social login failed. Please try again.');
    }
  }

  async connectMetaMask() {
    if (typeof window.ethereum === 'undefined') {
      this.showError('Please install MetaMask to use this feature.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    
    try {
      // Show loading
      const metamaskBtn = document.querySelector('[data-social="metamask"]');
      const originalHTML = metamaskBtn ? metamaskBtn.innerHTML : '';
      if (metamaskBtn) {
        metamaskBtn.innerHTML = '<span class="spinner"></span>';
        metamaskBtn.disabled = true;
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const address = accounts[0];
      
      // Create message for signing
      const message = `Sign this message to authenticate with MemeLaunch Tycoon.\n\nAddress: ${address}\nTimestamp: ${Date.now()}`;
      
      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });

      // Send to backend for verification
      const response = await fetch('/api/auth/web3/metamask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          signature,
          message
        }),
      });

      const result = await response.json();

      // Restore button
      if (metamaskBtn) {
        metamaskBtn.innerHTML = originalHTML;
        metamaskBtn.disabled = false;
      }

      if (response.ok && result.success) {
        this.showSuccess('Connected successfully!');
        
        // Store token
        if (result.data.token) {
          localStorage.setItem('auth_token', result.data.token);
        }

        // Redirect after success
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        this.showError(result.message || 'MetaMask authentication failed.');
      }
    } catch (error) {
      console.error('MetaMask connection error:', error);
      
      // Restore button
      const metamaskBtn = document.querySelector('[data-social="metamask"]');
      if (metamaskBtn) {
        metamaskBtn.innerHTML = '<i class="fab fa-ethereum text-xl"></i>';
        metamaskBtn.disabled = false;
      }
      
      if (error.code === 4001) {
        this.showError('You rejected the connection request.');
      } else {
        this.showError('Failed to connect MetaMask. Please try again.');
      }
    }
  }

  // Particle Background (Simple CSS-based)
  setupParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    // Create simple floating particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: rgba(255, 107, 53, ${Math.random() * 0.3 + 0.1});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 10 + 5}s ease-in-out infinite;
        animation-delay: ${Math.random() * 5}s;
      `;
      container.appendChild(particle);
    }
  }

  // Scroll Animations
  setupAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });
  }

  // Toast Notifications
  showSuccess(message) {
    this.showToast(message, 'success');
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  showInfo(message) {
    this.showToast(message, 'info');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ'
    };
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    };
    
    toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-in-right`;
    toast.innerHTML = `
      <span class="text-xl font-bold">${icons[type]}</span>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // i18n Translation Helper
  t(key) {
    if (!this.i18n || !this.i18n.get) return key;
    return this.i18n.get(key) || key;
  }

  updateTexts() {
    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = this.t(key);
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.authPageManager = new AuthPageManager();
  });
} else {
  window.authPageManager = new AuthPageManager();
}
