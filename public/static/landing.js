// MemeLaunch Tycoon - Landing Page Interactions
// API Base URL
const API_BASE = '/api';

// ===================================
// 1. EMAIL SUBSCRIPTION HANDLING
// ===================================

function initEmailForms() {
  const emailForms = document.querySelectorAll('.email-signup-form');
  
  emailForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = form.querySelector('input[type="email"]');
      const submitBtn = form.querySelector('button[type="submit"]');
      const messageDiv = form.querySelector('.form-message');
      
      const email = emailInput.value.trim();
      const source = form.dataset.source || 'landing_page';
      
      // Validation
      if (!email) {
        showMessage(messageDiv, '請輸入郵箱地址', 'error');
        return;
      }
      
      if (!validateEmail(email)) {
        showMessage(messageDiv, '請輸入有效的郵箱地址', 'error');
        return;
      }
      
      // Disable button during submission
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>提交中...';
      
      try {
        const response = await fetch(`${API_BASE}/email/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, source })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          showMessage(messageDiv, data.data.message, 'success');
          emailInput.value = '';
          
          // Track event in Google Analytics
          if (typeof gtag !== 'undefined') {
            gtag('event', 'email_signup', {
              'event_category': 'engagement',
              'event_label': source
            });
          }
          
          // Optional: Redirect to thank you page after 3 seconds
          // setTimeout(() => {
          //   window.location.href = '/thank-you';
          // }, 3000);
          
        } else {
          showMessage(messageDiv, data.error || '提交失敗，請稍後重試', 'error');
        }
        
      } catch (error) {
        console.error('Email subscription error:', error);
        showMessage(messageDiv, '網絡錯誤，請稍後重試', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-rocket mr-2"></i>立即開始（完全免費）';
      }
    });
  });
}

// Email validation helper
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Show message helper
function showMessage(messageDiv, text, type) {
  if (!messageDiv) return;
  
  messageDiv.textContent = text;
  messageDiv.className = `form-message ${type}`;
  messageDiv.style.display = 'block';
  
  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
}

// ===================================
// 2. SMOOTH SCROLLING NAVIGATION
// ===================================

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Close mobile menu if open
        const navMenu = document.querySelector('nav ul');
        const menuToggle = document.querySelector('.menu-toggle');
        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          menuToggle.classList.remove('active');
        }
      }
    });
  });
}

// ===================================
// 3. ACTIVE NAVIGATION HIGHLIGHTING
// ===================================

function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  
  if (sections.length === 0 || navLinks.length === 0) return;
  
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (window.scrollY >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// ===================================
// 4. MOBILE MENU TOGGLE
// ===================================

function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('nav ul');
  
  if (!menuToggle || !navMenu) return;
  
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
    }
  });
}

// ===================================
// 5. CTA BUTTON TRACKING
// ===================================

function initCTATracking() {
  document.querySelectorAll('.cta-button, [data-cta]').forEach(button => {
    button.addEventListener('click', () => {
      const label = button.dataset.cta || button.innerText;
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'cta_click', {
          'event_category': 'engagement',
          'event_label': label
        });
      }
    });
  });
}

// ===================================
// 6. SCROLL DEPTH TRACKING
// ===================================

function initScrollTracking() {
  const scrollDepths = [25, 50, 75, 100];
  const reached = new Set();
  
  window.addEventListener('scroll', () => {
    const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
    
    scrollDepths.forEach(depth => {
      if (scrollPercent >= depth && !reached.has(depth)) {
        reached.add(depth);
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'scroll_depth', {
            'event_category': 'engagement',
            'event_label': `${depth}%`
          });
        }
      }
    });
  });
}

// ===================================
// 7. INITIALIZE ALL ON PAGE LOAD
// ===================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 MemeLaunch Tycoon - Initializing...');
  
  initEmailForms();
  initSmoothScroll();
  initActiveNav();
  initMobileMenu();
  initCTATracking();
  initScrollTracking();
  
  console.log('✅ All features initialized');
});

// ===================================
// 8. UTILITY: AUTO-HIDE ALERTS
// ===================================

// Auto-hide any alert messages after 5 seconds
setTimeout(() => {
  document.querySelectorAll('.alert, .notification').forEach(alert => {
    if (alert.classList.contains('success')) {
      alert.style.transition = 'opacity 0.5s';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 500);
    }
  });
}, 5000);
