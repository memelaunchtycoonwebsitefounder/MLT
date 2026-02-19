/**
 * Performance Monitoring with Web Vitals
 * Tracks Core Web Vitals and custom metrics
 */

const PerformanceMonitor = {
  /**
   * Initialize performance monitoring
   */
  init() {
    if (typeof window === 'undefined' || !('performance' in window)) {
      console.warn('[Performance] Performance API not available');
      return;
    }

    console.log('[Performance] Initializing monitoring...');
    
    // Track Core Web Vitals
    this.trackLCP();
    this.trackFID();
    this.trackCLS();
    this.trackFCP();
    this.trackTTFB();
    
    // Track custom metrics
    this.trackPageLoad();
    this.trackResourceTiming();
    
    // Track navigation timing
    window.addEventListener('load', () => {
      this.reportNavigationTiming();
    });
  },

  /**
   * Largest Contentful Paint (LCP)
   * Measures loading performance (should be < 2.5s)
   */
  trackLCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        const lcp = lastEntry.renderTime || lastEntry.loadTime;
        console.log('[Performance] LCP:', lcp.toFixed(0), 'ms');
        
        this.sendMetric('LCP', lcp, this.getLCPRating(lcp));
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      console.error('[Performance] LCP tracking error:', error);
    }
  },

  /**
   * First Input Delay (FID)
   * Measures interactivity (should be < 100ms)
   */
  trackFID() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fid = entry.processingStart - entry.startTime;
          console.log('[Performance] FID:', fid.toFixed(0), 'ms');
          
          this.sendMetric('FID', fid, this.getFIDRating(fid));
        });
      });
      
      observer.observe({ type: 'first-input', buffered: true });
    } catch (error) {
      console.error('[Performance] FID tracking error:', error);
    }
  },

  /**
   * Cumulative Layout Shift (CLS)
   * Measures visual stability (should be < 0.1)
   */
  trackCLS() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let clsEntries = [];

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        });
        
        console.log('[Performance] CLS:', clsValue.toFixed(3));
        this.sendMetric('CLS', clsValue, this.getCLSRating(clsValue));
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
      
      // Report final CLS on page unload
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          console.log('[Performance] Final CLS:', clsValue.toFixed(3));
          this.sendMetric('CLS', clsValue, this.getCLSRating(clsValue), true);
        }
      });
    } catch (error) {
      console.error('[Performance] CLS tracking error:', error);
    }
  },

  /**
   * First Contentful Paint (FCP)
   * Measures when first content is rendered (should be < 1.8s)
   */
  trackFCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            const fcp = entry.startTime;
            console.log('[Performance] FCP:', fcp.toFixed(0), 'ms');
            
            this.sendMetric('FCP', fcp, this.getFCPRating(fcp));
          }
        });
      });
      
      observer.observe({ type: 'paint', buffered: true });
    } catch (error) {
      console.error('[Performance] FCP tracking error:', error);
    }
  },

  /**
   * Time to First Byte (TTFB)
   * Measures server response time (should be < 600ms)
   */
  trackTTFB() {
    window.addEventListener('load', () => {
      try {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
          const ttfb = navTiming.responseStart - navTiming.requestStart;
          console.log('[Performance] TTFB:', ttfb.toFixed(0), 'ms');
          
          this.sendMetric('TTFB', ttfb, this.getTTFBRating(ttfb));
        }
      } catch (error) {
        console.error('[Performance] TTFB tracking error:', error);
      }
    });
  },

  /**
   * Track page load metrics
   */
  trackPageLoad() {
    window.addEventListener('load', () => {
      try {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
          const loadTime = navTiming.loadEventEnd - navTiming.fetchStart;
          const domContentLoaded = navTiming.domContentLoadedEventEnd - navTiming.fetchStart;
          
          console.log('[Performance] Page Load Time:', loadTime.toFixed(0), 'ms');
          console.log('[Performance] DOM Content Loaded:', domContentLoaded.toFixed(0), 'ms');
          
          this.sendMetric('PageLoad', loadTime);
          this.sendMetric('DOMContentLoaded', domContentLoaded);
        }
      } catch (error) {
        console.error('[Performance] Page load tracking error:', error);
      }
    });
  },

  /**
   * Track resource timing
   */
  trackResourceTiming() {
    window.addEventListener('load', () => {
      try {
        const resources = performance.getEntriesByType('resource');
        
        let scriptCount = 0, styleCount = 0, imageCount = 0, totalSize = 0;
        let slowestResource = { name: '', duration: 0 };
        
        resources.forEach((resource) => {
          if (resource.initiatorType === 'script') scriptCount++;
          if (resource.initiatorType === 'css') styleCount++;
          if (resource.initiatorType === 'img') imageCount++;
          
          if (resource.transferSize) {
            totalSize += resource.transferSize;
          }
          
          if (resource.duration > slowestResource.duration) {
            slowestResource = {
              name: resource.name,
              duration: resource.duration
            };
          }
        });
        
        console.log('[Performance] Resources:', {
          scripts: scriptCount,
          styles: styleCount,
          images: imageCount,
          totalSize: (totalSize / 1024).toFixed(2) + ' KB',
          slowest: slowestResource.name.substring(0, 50) + '...',
          slowestDuration: slowestResource.duration.toFixed(0) + ' ms'
        });
        
        this.sendMetric('ResourceCount', resources.length);
        this.sendMetric('TransferSize', totalSize);
      } catch (error) {
        console.error('[Performance] Resource timing error:', error);
      }
    });
  },

  /**
   * Report navigation timing
   */
  reportNavigationTiming() {
    try {
      const navTiming = performance.getEntriesByType('navigation')[0];
      if (!navTiming) return;
      
      console.log('[Performance] Navigation Timing:', {
        'DNS Lookup': (navTiming.domainLookupEnd - navTiming.domainLookupStart).toFixed(0) + ' ms',
        'TCP Connection': (navTiming.connectEnd - navTiming.connectStart).toFixed(0) + ' ms',
        'Request Time': (navTiming.responseStart - navTiming.requestStart).toFixed(0) + ' ms',
        'Response Time': (navTiming.responseEnd - navTiming.responseStart).toFixed(0) + ' ms',
        'DOM Processing': (navTiming.domComplete - navTiming.domLoading).toFixed(0) + ' ms',
        'Load Event': (navTiming.loadEventEnd - navTiming.loadEventStart).toFixed(0) + ' ms'
      });
    } catch (error) {
      console.error('[Performance] Navigation timing error:', error);
    }
  },

  /**
   * Send metric to analytics (can be customized)
   */
  sendMetric(name, value, rating = 'unknown', isFinal = false) {
    // Log to console
    const ratingEmoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : rating === 'poor' ? '❌' : '📊';
    console.log(`[Performance] ${ratingEmoji} ${name}: ${value.toFixed ? value.toFixed(2) : value} ${isFinal ? '(final)' : ''}`);
    
    // Send to analytics endpoint (optional)
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(value),
        event_label: rating,
        non_interaction: true,
      });
    }
  },

  /**
   * Rating helpers
   */
  getLCPRating(value) {
    return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
  },
  
  getFIDRating(value) {
    return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
  },
  
  getCLSRating(value) {
    return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
  },
  
  getFCPRating(value) {
    return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
  },
  
  getTTFBRating(value) {
    return value <= 600 ? 'good' : value <= 1500 ? 'needs-improvement' : 'poor';
  },
};

// Auto-initialize on load
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = PerformanceMonitor;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      PerformanceMonitor.init();
    });
  } else {
    PerformanceMonitor.init();
  }
}
