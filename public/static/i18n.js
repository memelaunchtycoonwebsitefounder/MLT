/**
 * MemeLaunch Tycoon - i18n Internationalization System
 * Simple client-side translation manager (no external dependencies)
 */

class I18nManager {
  constructor() {
    this.currentLocale = 'en';
    this.defaultLocale = 'en';
    this.translations = {};
    this.listeners = [];
  }

  /**
   * Initialize i18n system
   */
  async init() {
    // Get saved locale from localStorage
    const savedLocale = localStorage.getItem('mlt_locale');
    
    // Priority: saved locale > default (English)
    // Note: Browser language detection is disabled - English is default for first-time visitors
    this.currentLocale = savedLocale || this.defaultLocale;
    
    // Load translation files
    await this.loadTranslations(this.currentLocale);
    
    // Apply translations to page (don't notify listeners during initial load)
    this.applyTranslations(false);
    
    // Update HTML lang attribute
    document.documentElement.lang = this.currentLocale;
    
    console.log(`🌐 i18n initialized: ${this.currentLocale}`);
  }

  /**
   * Detect browser language
   */
  detectBrowserLocale() {
    const browserLang = navigator.language || navigator.userLanguage;
    
    // Map browser language codes to our supported locales
    const langMap = {
      'zh': 'zh',
      'zh-CN': 'zh',
      'zh-TW': 'zh',
      'zh-HK': 'zh',
      'en': 'en',
      'en-US': 'en',
      'en-GB': 'en'
    };
    
    // Try exact match first
    if (langMap[browserLang]) {
      return langMap[browserLang];
    }
    
    // Try language prefix (e.g., 'zh' from 'zh-SG')
    const langPrefix = browserLang.split('-')[0];
    return langMap[langPrefix] || this.defaultLocale;
  }

  /**
   * Load translation file
   */
  async loadTranslations(locale) {
    try {
      const response = await fetch(`/locales/${locale}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${locale}.json`);
      }
      this.translations[locale] = await response.json();
      console.log(`✅ Loaded translations for: ${locale}`);
    } catch (error) {
      console.error(`❌ Failed to load translations for ${locale}:`, error);
      
      // Fallback to default locale if not already trying it
      if (locale !== this.defaultLocale) {
        console.log(`⚠️ Falling back to ${this.defaultLocale}`);
        await this.loadTranslations(this.defaultLocale);
        this.currentLocale = this.defaultLocale;
      }
    }
  }

  /**
   * Get translation by key path (e.g., 'hero.title')
   */
  t(keyPath, fallback = '') {
    const keys = keyPath.split('.');
    let value = this.translations[this.currentLocale];
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Key not found, try fallback to default locale
        if (this.currentLocale !== this.defaultLocale) {
          let fallbackValue = this.translations[this.defaultLocale];
          for (const k of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && k in fallbackValue) {
              fallbackValue = fallbackValue[k];
            } else {
              return fallback || keyPath;
            }
          }
          return fallbackValue;
        }
        return fallback || keyPath;
      }
    }
    
    return value;
  }

  /**
   * Apply translations to all elements with data-i18n attribute
   * @param {boolean} notifyListeners - Whether to notify change listeners (default: true)
   */
  applyTranslations(notifyListeners = true) {
    // Translate elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // Check if element has data-i18n-attr (translate attribute instead of text)
      const attr = element.getAttribute('data-i18n-attr');
      if (attr) {
        element.setAttribute(attr, translation);
      } else {
        element.textContent = translation;
      }
    });
    
    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      element.setAttribute('placeholder', translation);
    });
    
    // Only notify listeners if requested (don't notify during initial load)
    if (notifyListeners) {
      this.listeners.forEach(callback => callback(this.currentLocale));
    }
  }

  /**
   * Change language
   */
  async setLocale(locale) {
    if (locale === this.currentLocale) {
      return;
    }
    
    // Load translations if not already loaded
    if (!this.translations[locale]) {
      await this.loadTranslations(locale);
    }
    
    this.currentLocale = locale;
    
    // Save to localStorage
    localStorage.setItem('mlt_locale', locale);
    
    // Update HTML lang attribute
    document.documentElement.lang = locale;
    
    // Re-apply translations
    this.applyTranslations();
    
    console.log(`🌐 Locale changed to: ${locale}`);
  }

  /**
   * Get current locale
   */
  getLocale() {
    return this.currentLocale;
  }

  /**
   * Register listener for locale changes
   */
  onLocaleChange(callback) {
    this.listeners.push(callback);
  }
}

// Create global instance
window.i18n = new I18nManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.i18n.init());
} else {
  window.i18n.init();
}
