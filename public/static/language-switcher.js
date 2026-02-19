/**
 * MemeLaunch Tycoon - Language Switcher Component
 * Dropdown menu for switching between supported languages
 */

class LanguageSwitcher {
  constructor() {
    this.languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'zh', name: '中文', flag: '🇨🇳' }
    ];
    this.currentLang = 'en';
    this.dropdownOpen = false;
  }

  /**
   * Initialize language switcher
   */
  init() {
    // Wait for i18n to be ready
    if (window.i18n) {
      this.currentLang = window.i18n.getLocale();
      this.render();
      
      // Listen for locale changes
      window.i18n.onLocaleChange((locale) => {
        this.currentLang = locale;
        this.updateDisplay();
      });
    } else {
      // Retry after a short delay
      setTimeout(() => this.init(), 100);
    }
  }

  /**
   * Render language switcher HTML
   */
  render() {
    const containers = document.querySelectorAll('.language-switcher-container');
    if (containers.length === 0) {
      console.warn('No .language-switcher-container found');
      return;
    }
    
    containers.forEach(container => {
      container.innerHTML = this.getHTML();
      this.attachEventListeners(container);
    });
  }

  /**
   * Get HTML for language switcher
   */
  getHTML() {
    const currentLanguage = this.languages.find(lang => lang.code === this.currentLang);
    
    return `
      <div class="language-switcher relative">
        <button 
          id="lang-switcher-btn"
          class="flex items-center space-x-2 px-4 py-2 rounded-lg glass-effect hover:bg-white/10 transition"
          aria-label="Change language"
        >
          <span class="text-xl">${currentLanguage.flag}</span>
          <span class="hidden md:inline text-sm font-medium">${currentLanguage.name}</span>
          <i class="fas fa-chevron-down text-xs"></i>
        </button>
        
        <div 
          id="lang-dropdown"
          class="language-dropdown hidden absolute top-full right-0 mt-2 w-48 glass-effect rounded-lg shadow-xl border border-white/10 overflow-hidden z-50"
        >
          ${this.languages.map(lang => `
            <button
              class="lang-option w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 transition ${lang.code === this.currentLang ? 'bg-white/5' : ''}"
              data-lang="${lang.code}"
            >
              <span class="text-xl">${lang.flag}</span>
              <span class="text-sm font-medium">${lang.name}</span>
              ${lang.code === this.currentLang ? '<i class="fas fa-check ml-auto text-green-500"></i>' : ''}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners(container) {
    // Toggle dropdown
    const btn = container.querySelector('#lang-switcher-btn');
    const dropdown = container.querySelector('#lang-dropdown');
    
    if (btn && dropdown) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown(dropdown);
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        if (this.dropdownOpen) {
          this.closeDropdown(dropdown);
        }
      });
      
      // Language selection
      container.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', (e) => {
          const lang = e.currentTarget.getAttribute('data-lang');
          this.changeLanguage(lang);
          this.closeDropdown(dropdown);
        });
      });
    }
  }

  /**
   * Toggle dropdown open/close
   */
  toggleDropdown(dropdown) {
    if (this.dropdownOpen) {
      this.closeDropdown(dropdown);
    } else {
      this.openDropdown(dropdown);
    }
  }

  /**
   * Open dropdown
   */
  openDropdown(dropdown) {
    dropdown.classList.remove('hidden');
    dropdown.style.animation = 'slideDown 0.2s ease-out';
    this.dropdownOpen = true;
  }

  /**
   * Close dropdown
   */
  closeDropdown(dropdown) {
    dropdown.classList.add('hidden');
    this.dropdownOpen = false;
  }

  /**
   * Change language
   */
  async changeLanguage(langCode) {
    if (langCode === this.currentLang) {
      return;
    }
    
    try {
      // Show loading state
      this.showLoading();
      
      // Change locale using i18n manager
      await window.i18n.setLocale(langCode);
      
      // Update current language
      this.currentLang = langCode;
      
      // Update display
      this.updateDisplay();
      
      // Show success toast
      this.showToast('Language changed successfully!', 'success');
      
    } catch (error) {
      console.error('Failed to change language:', error);
      this.showToast('Failed to change language', 'error');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Update display after language change
   */
  updateDisplay() {
    const containers = document.querySelectorAll('.language-switcher-container');
    containers.forEach(container => {
      const currentLanguage = this.languages.find(lang => lang.code === this.currentLang);
      
      // Update button display
      const btn = container.querySelector('#lang-switcher-btn');
      if (btn) {
        const flagSpan = btn.querySelector('span:first-child');
        const nameSpan = btn.querySelector('span:nth-child(2)');
        if (flagSpan) flagSpan.textContent = currentLanguage.flag;
        if (nameSpan) nameSpan.textContent = currentLanguage.name;
      }
      
      // Update dropdown options
      container.querySelectorAll('.lang-option').forEach(option => {
        const langCode = option.getAttribute('data-lang');
        const isActive = langCode === this.currentLang;
        
        if (isActive) {
          option.classList.add('bg-white/5');
          if (!option.querySelector('.fa-check')) {
            option.innerHTML += '<i class="fas fa-check ml-auto text-green-500"></i>';
          }
        } else {
          option.classList.remove('bg-white/5');
          const check = option.querySelector('.fa-check');
          if (check) check.remove();
        }
      });
    });
  }

  /**
   * Show loading state
   */
  showLoading() {
    const btns = document.querySelectorAll('#lang-switcher-btn');
    btns.forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.6';
    });
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const btns = document.querySelectorAll('#lang-switcher-btn');
    btns.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
    });
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="flex items-center space-x-3">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideOut {
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);

// Initialize language switcher when DOM is ready
const languageSwitcher = new LanguageSwitcher();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => languageSwitcher.init());
} else {
  languageSwitcher.init();
}

// Export for global access
window.languageSwitcher = languageSwitcher;
