// Cookie Consent Management (GDPR/CCPA Compliance)

class CookieConsentManager {
  constructor() {
    this.consentKey = 'mlt_cookie_consent'
    this.consentData = this.loadConsent()
    this.init()
  }

  init() {
    // Check if consent already given
    if (!this.consentData) {
      this.showBanner()
    }
  }

  loadConsent() {
    const data = localStorage.getItem(this.consentKey)
    return data ? JSON.parse(data) : null
  }

  saveConsent(consent) {
    localStorage.setItem(this.consentKey, JSON.stringify(consent))
    this.consentData = consent
  }

  showBanner() {
    const banner = document.createElement('div')
    banner.id = 'cookie-consent-banner'
    banner.className = 'fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-6 shadow-2xl z-50 animate-slide-up'
    banner.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex-1">
            <h3 class="text-lg font-bold mb-2">
              <i class="fas fa-cookie-bite mr-2"></i>We Value Your Privacy
            </h3>
            <p class="text-sm text-gray-300">
              We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. 
              By clicking "Accept All", you consent to our use of cookies. 
              <a href="/privacy-policy" class="text-orange-400 hover:underline">Learn more</a>
            </p>
          </div>
          <div class="flex gap-3 flex-shrink-0">
            <button onclick="cookieConsent.rejectAll()" 
                    class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
              Reject All
            </button>
            <button onclick="cookieConsent.showSettings()" 
                    class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
              Customize
            </button>
            <button onclick="cookieConsent.acceptAll()" 
                    class="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold transition">
              Accept All
            </button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(banner)
  }

  hideBanner() {
    const banner = document.getElementById('cookie-consent-banner')
    if (banner) banner.remove()
  }

  showSettings() {
    this.hideBanner()
    const modal = document.createElement('div')
    modal.id = 'cookie-settings-modal'
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
    modal.innerHTML = `
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-900">
              <i class="fas fa-sliders-h mr-2 text-orange-500"></i>Cookie Settings
            </h2>
            <button onclick="cookieConsent.closeSettings()" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times text-2xl"></i>
            </button>
          </div>

          <div class="space-y-4">
            <!-- Essential Cookies -->
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex justify-between items-center mb-2">
                <div>
                  <h3 class="font-bold text-gray-900">Essential Cookies</h3>
                  <p class="text-sm text-gray-600">Required for basic site functionality</p>
                </div>
                <div class="bg-gray-300 text-gray-600 px-3 py-1 rounded text-sm font-bold">
                  Always Active
                </div>
              </div>
              <p class="text-sm text-gray-600 mt-2">
                These cookies are necessary for the website to function and cannot be switched off. 
                They include authentication, security, and accessibility features.
              </p>
            </div>

            <!-- Analytics Cookies -->
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex justify-between items-center mb-2">
                <div class="flex-1">
                  <h3 class="font-bold text-gray-900">Analytics Cookies</h3>
                  <p class="text-sm text-gray-600">Help us improve our website</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="analytics-toggle" class="sr-only peer" checked>
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
              <p class="text-sm text-gray-600 mt-2">
                These cookies collect anonymous statistics about how visitors use our site, 
                helping us improve performance and user experience.
              </p>
            </div>

            <!-- Marketing Cookies -->
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex justify-between items-center mb-2">
                <div class="flex-1">
                  <h3 class="font-bold text-gray-900">Marketing Cookies</h3>
                  <p class="text-sm text-gray-600">Personalized advertising</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="marketing-toggle" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
              <p class="text-sm text-gray-600 mt-2">
                These cookies track your browsing habits to deliver targeted advertisements 
                that match your interests.
              </p>
            </div>

            <!-- CCPA Opt-Out -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 class="font-bold text-blue-900 mb-2">
                <i class="fas fa-shield-alt mr-2"></i>California Privacy Rights (CCPA)
              </h3>
              <p class="text-sm text-blue-800 mb-3">
                If you are a California resident, you have the right to opt out of the 
                "sale" of your personal information.
              </p>
              <label class="flex items-center cursor-pointer">
                <input type="checkbox" id="ccpa-optout" class="mr-2">
                <span class="text-sm font-semibold text-blue-900">
                  Do Not Sell My Personal Information
                </span>
              </label>
            </div>
          </div>

          <div class="mt-6 flex gap-3 justify-end">
            <button onclick="cookieConsent.savePreferences()" 
                    class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition">
              Save Preferences
            </button>
            <button onclick="cookieConsent.acceptAll()" 
                    class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition">
              Accept All
            </button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(modal)
  }

  closeSettings() {
    const modal = document.getElementById('cookie-settings-modal')
    if (modal) modal.remove()
  }

  acceptAll() {
    const consent = {
      essential: true,
      analytics: true,
      marketing: true,
      ccpa_optout: false,
      timestamp: new Date().toISOString()
    }
    this.saveConsent(consent)
    this.hideBanner()
    this.closeSettings()
    this.applyConsent(consent)
  }

  rejectAll() {
    const consent = {
      essential: true,  // Always required
      analytics: false,
      marketing: false,
      ccpa_optout: true,
      timestamp: new Date().toISOString()
    }
    this.saveConsent(consent)
    this.hideBanner()
    this.applyConsent(consent)
  }

  savePreferences() {
    const consent = {
      essential: true,
      analytics: document.getElementById('analytics-toggle')?.checked || false,
      marketing: document.getElementById('marketing-toggle')?.checked || false,
      ccpa_optout: document.getElementById('ccpa-optout')?.checked || false,
      timestamp: new Date().toISOString()
    }
    this.saveConsent(consent)
    this.closeSettings()
    this.applyConsent(consent)
  }

  applyConsent(consent) {
    // Load analytics if consented
    if (consent.analytics) {
      this.loadGoogleAnalytics()
    }

    // Load marketing scripts if consented
    if (consent.marketing) {
      // Future: Load Google Ads, Facebook Pixel, etc.
      console.log('Marketing cookies enabled')
    }

    console.log('✅ Cookie consent applied:', consent)
  }

  loadGoogleAnalytics() {
    // Only load if consent given and GA ID is configured
    const GA_ID = 'G-12345ABCDE'  // Replace with real ID
    if (GA_ID !== 'G-12345ABCDE') {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      function gtag(){dataLayer.push(arguments)}
      gtag('js', new Date())
      gtag('config', GA_ID)
    }
  }

  // Show settings from footer link
  openSettings() {
    this.showSettings()
  }
}

// Initialize cookie consent manager
let cookieConsent
if (typeof window !== 'undefined') {
  cookieConsent = new CookieConsentManager()
}
