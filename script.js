/* ============================================
   FROGECOIN — script.js
   The swamp awakens.
   ============================================ */

(function () {
  'use strict';

  /* ------------------------------------------
     CONFIG DEFAULTS
     ------------------------------------------ */
  const DEFAULTS = {
    ca: 'COMING_SOON',
    twitter: '#',
    community: '#',
    buy: '#'
  };

  let config = { ...DEFAULTS };

  /* ------------------------------------------
     BUBBLE GENERATION
     ------------------------------------------ */
  function createBubbles() {
    const container = document.getElementById('bubbles');
    if (!container) return;

    const count = window.innerWidth < 768 ? 10 : window.innerWidth < 1024 ? 15 : 20;

    for (let i = 0; i < count; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';

      const size = 8 + Math.random() * 52; // 8–60px
      const left = Math.random() * 100;
      const riseDur = 12 + Math.random() * 13; // 12–25s
      const wobbleDur = 4 + Math.random() * 4;  // 4–8s
      const delay = Math.random() * 15;

      bubble.style.width = size + 'px';
      bubble.style.height = size + 'px';
      bubble.style.left = left + '%';
      bubble.style.setProperty('--rise-dur', riseDur + 's');
      bubble.style.setProperty('--wobble-dur', wobbleDur + 's');
      bubble.style.setProperty('--bubble-delay', delay + 's');

      container.appendChild(bubble);
    }
  }

  /* ------------------------------------------
     SCROLL REVEAL — IntersectionObserver
     ------------------------------------------ */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------
     TIMELINE — scroll-driven line growth
     ------------------------------------------ */
  function initTimeline() {
    const line = document.getElementById('timeline-line');
    if (!line) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          line.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(line.parentElement);
  }

  /* ------------------------------------------
     CONFIG LOADING
     ------------------------------------------ */
  function loadConfig() {
    fetch('/api/config')
      .then(function (res) {
        if (!res.ok) throw new Error('Config fetch failed');
        return res.json();
      })
      .then(function (data) {
        config = { ...DEFAULTS, ...data };
        applyConfig();
      })
      .catch(function () {
        config = { ...DEFAULTS };
        applyConfig();
      });
  }

  function applyConfig() {
    // CA elements — text content
    document.querySelectorAll('[data-config="ca"]').forEach(function (el) {
      if (el.tagName === 'BUTTON') {
        el.textContent = config.ca === 'COMING_SOON' ? 'CA: Coming Soon' : 'CA: ' + config.ca;
        el.dataset.fullCa = config.ca;
      }
    });

    // Link elements — href
    document.querySelectorAll('[data-config="twitter"]').forEach(function (el) {
      if (el.href !== undefined) el.href = config.twitter;
    });
    document.querySelectorAll('[data-config="community"]').forEach(function (el) {
      if (el.href !== undefined) el.href = config.community;
    });
    document.querySelectorAll('[data-config="buy"]').forEach(function (el) {
      if (el.href !== undefined) el.href = config.buy;
    });
  }

  function truncateCA(ca) {
    if (!ca || ca.length < 12) return ca;
    return ca.slice(0, 6) + '...' + ca.slice(-4);
  }

  /* ------------------------------------------
     CA COPY + TOAST
     ------------------------------------------ */
  function initCACopy() {
    let toastTimeout;

    document.querySelectorAll('.ca-copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const ca = config.ca;
        if (!ca || ca === 'COMING_SOON') return;

        navigator.clipboard.writeText(ca).then(function () {
          showToast();
        }).catch(function () {
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = ca;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showToast();
        });
      });
    });

    function showToast() {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.classList.add('show');
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(function () {
        toast.classList.remove('show');
      }, 2000);
    }
  }

  /* ------------------------------------------
     CHAT EXPAND/COLLAPSE
     ------------------------------------------ */
  function initChatExpand() {
    var btn = document.getElementById('chat-expand');
    var full = document.getElementById('chat-full');
    if (!btn || !full) return;

    btn.addEventListener('click', function () {
      var isOpen = full.classList.toggle('open');
      btn.textContent = isOpen ? 'Collapse' : 'Read the full prophecy';
    });
  }

  /* ------------------------------------------
     IMAGE ERROR HANDLING — graceful placeholders
     ------------------------------------------ */
  function initImageFallbacks() {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        this.style.minHeight = '180px';
        this.style.background = 'linear-gradient(135deg, rgba(57,255,20,0.06), rgba(57,255,20,0.02))';
        this.style.borderRadius = '8px';
        this.alt = '';
      });
    });
  }

  /* ------------------------------------------
     INIT
     ------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    createBubbles();
    initScrollReveal();
    initTimeline();
    initCACopy();
    initChatExpand();
    initImageFallbacks();
    loadConfig();
  });

})();
