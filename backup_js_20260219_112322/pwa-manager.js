/**
 * PWA Initialization Script
 * Registers Service Worker and handles PWA installation
 */

const PWAManager = {
  /**
   * Initialize PWA functionality
   */
  init() {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service Workers not supported');
      return;
    }

    console.log('[PWA] Initializing...');
    
    // Register Service Worker
    this.registerServiceWorker();
    
    // Handle PWA installation
    this.handleInstallPrompt();
    
    // Handle updates
    this.handleUpdates();
  },

  /**
   * Register Service Worker
   */
  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[PWA] Service Worker registered:', registration.scope);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour

      return registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  },

  /**
   * Handle PWA installation prompt
   */
  handleInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('[PWA] Install prompt available');
      
      // Prevent the default install prompt
      event.preventDefault();
      
      // Store the event for later use
      deferredPrompt = event;
      
      // Show custom install button
      this.showInstallButton(deferredPrompt);
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      deferredPrompt = null;
      
      // Hide install button
      this.hideInstallButton();
      
      // Track installation
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'pwa_installed', {
          event_category: 'PWA',
          event_label: 'Installation',
        });
      }
    });
  },

  /**
   * Show install button
   */
  showInstallButton(deferredPrompt) {
    // Create install button if it doesn't exist
    let installBtn = document.getElementById('pwa-install-btn');
    
    if (!installBtn) {
      installBtn = document.createElement('button');
      installBtn.id = 'pwa-install-btn';
      installBtn.className = 'fixed bottom-20 right-4 z-50 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2';
      installBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        <span>安裝應用</span>
      `;
      
      document.body.appendChild(installBtn);
    }

    installBtn.style.display = 'flex';

    installBtn.addEventListener('click', async () => {
      console.log('[PWA] Install button clicked');
      
      if (!deferredPrompt) return;

      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] User choice:', outcome);

      // Clear the deferredPrompt
      deferredPrompt = null;
      
      // Hide the button
      installBtn.style.display = 'none';

      // Track user choice
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'pwa_install_prompt', {
          event_category: 'PWA',
          event_label: outcome,
        });
      }
    });
  },

  /**
   * Hide install button
   */
  hideInstallButton() {
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  },

  /**
   * Handle Service Worker updates
   */
  handleUpdates() {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] New Service Worker activated');
      
      // Show update notification
      this.showUpdateNotification();
    });
  },

  /**
   * Show update notification
   */
  showUpdateNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3';
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
      <span>新版本可用！</span>
      <button class="ml-2 bg-white text-blue-500 px-3 py-1 rounded hover:bg-blue-50 transition-colors" onclick="window.location.reload()">
        重新載入
      </button>
      <button class="ml-2 text-white hover:text-blue-100" onclick="this.parentElement.remove()">
        ✕
      </button>
    `;
    
    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  },

  /**
   * Check if app is running as PWA
   */
  isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  },

  /**
   * Clear all caches
   */
  async clearCaches() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[PWA] All caches cleared');
      return true;
    } catch (error) {
      console.error('[PWA] Failed to clear caches:', error);
      return false;
    }
  },
};

// Auto-initialize on load
if (typeof window !== 'undefined') {
  window.PWAManager = PWAManager;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      PWAManager.init();
    });
  } else {
    PWAManager.init();
  }
}
