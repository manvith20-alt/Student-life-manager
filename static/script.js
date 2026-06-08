/* ============================================================
   STUDENT LIFE MANAGER — script.js
   Global JS | Compatible with all templates
   ============================================================ */

/* ── 1. MOBILE NAV TOGGLE ───────────────────────────────── */
(function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    links.classList.toggle('open');
    const icon = toggle.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    }
  });

  // Close menu when a link is clicked
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
      }
    });
  });

  // Close menu on outside click
  document.addEventListener('click', function (e) {
    if (!links.contains(e.target) && e.target !== toggle) {
      links.classList.remove('open');
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
      }
    }
  });
})();


/* ── 2. ACTIVE NAV LINK HIGHLIGHT ───────────────────────── */
(function highlightActiveNav() {
  const path  = window.location.pathname;
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(function (a) {
    a.classList.remove('active');
    const href = a.getAttribute('href');
    if (!href) return;
    if (path === href ||
        (href !== '/' && path.startsWith(href))) {
      a.classList.add('active');
    }
  });
})();


/* ── 3. PROGRESS BAR ANIMATION ON LOAD ──────────────────── */
(function animateBars() {
  const bars = document.querySelectorAll(
    '.budget-bar-fill, .cat-bar-fill'
  );
  bars.forEach(function (bar) {
    const target = bar.style.width || '0%';
    bar.style.width = '0%';
    // Trigger reflow so transition fires
    void bar.offsetWidth;
    requestAnimationFrame(function () {
      bar.style.width = target;
    });
  });
})();


/* ── 4. FLASH / TOAST NOTIFICATION ──────────────────────── */
function showToast(message, type) {
  type = type || 'success';
  const existing = document.getElementById('slm-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'slm-toast';

  const colours = {
    success : { bg: '#22c55e', icon: 'fa-check-circle' },
    error   : { bg: '#ef4444', icon: 'fa-times-circle' },
    warning : { bg: '#f97316', icon: 'fa-exclamation-triangle' },
    info    : { bg: '#3b82f6', icon: 'fa-info-circle' }
  };
  const c = colours[type] || colours.success;

  Object.assign(toast.style, {
    position        : 'fixed',
    bottom          : '1.5rem',
    right           : '1.5rem',
    background      : c.bg,
    color           : '#fff',
    padding         : '.75rem 1.25rem',
    borderRadius    : '10px',
    boxShadow       : '0 4px 16px rgba(0,0,0,.18)',
    display         : 'flex',
    alignItems      : 'center',
    gap             : '.6rem',
    fontSize        : '.9rem',
    fontWeight      : '600',
    fontFamily      : "'Space Grotesk', sans-serif",
    zIndex          : '9999',
    maxWidth        : '320px',
    opacity         : '0',
    transform       : 'translateY(12px)',
    transition      : 'opacity .3s ease, transform .3s ease'
  });

  toast.innerHTML =
    '<i class="fas ' + c.icon + '"></i><span>' + message + '</span>';
  document.body.appendChild(toast);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateY(0)';
    });
  });

  setTimeout(function () {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(function () { toast.remove(); }, 320);
  }, 3000);
}


/* ── 5. CONFIRM DELETE ENHANCEMENT ──────────────────────── */
(function enhanceDeleteButtons() {
  document.querySelectorAll('.btn-delete').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      // Remove inline onclick to prevent double-confirm
      btn.removeAttribute('onclick');
      if (!confirm('Are you sure you want to delete this record?')) {
        e.preventDefault();
      }
    });
  });
})();


/* ── 6. FORM VALIDATION FEEDBACK ────────────────────────── */
(function formValidation() {
  const forms = document.querySelectorAll('form');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      let valid = true;

      // Clear previous errors
      form.querySelectorAll('.field-error').forEach(function (el) {
        el.remove();
      });
      form.querySelectorAll('.input-error').forEach(function (el) {
        el.classList.remove('input-error');
      });

      // Check required fields
      form.querySelectorAll('[required]').forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('input-error');
          const msg = document.createElement('span');
          msg.className   = 'field-error';
          msg.textContent = 'This field is required.';
          Object.assign(msg.style, {
            display   : 'block',
            color     : '#ef4444',
            fontSize  : '.75rem',
            marginTop : '.25rem'
          });
          field.parentNode.insertBefore(msg, field.nextSibling);
        }
      });

      // Validate positive amount fields
      const amountField = form.querySelector('input[name="amount"]');
      if (amountField && parseFloat(amountField.value) <= 0) {
        valid = false;
        amountField.classList.add('input-error');
        const msg = document.createElement('span');
        msg.className   = 'field-error';
        msg.textContent = 'Amount must be greater than zero.';
        Object.assign(msg.style, {
          display   : 'block',
          color     : '#ef4444',
          fontSize  : '.75rem',
          marginTop : '.25rem'
        });
        amountField.parentNode.insertBefore(msg, amountField.nextSibling);
      }

      if (!valid) {
        e.preventDefault();
        showToast('Please fix the errors in the form.', 'error');
      }
    });
  });

  // Add input-error style dynamically
  const style = document.createElement('style');
  style.textContent =
    '.input-error { border-color: #ef4444 !important; ' +
    'box-shadow: 0 0 0 3px rgba(239,68,68,.15) !important; }';
  document.head.appendChild(style);
})();


/* ── 7. AUTO-DISMISS ALERTS ─────────────────────────────── */
(function autoDismissAlerts() {
  document.querySelectorAll('.alert').forEach(function (alert) {
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    Object.assign(closeBtn.style, {
      marginLeft  : 'auto',
      background  : 'transparent',
      border      : 'none',
      cursor      : 'pointer',
      color       : 'inherit',
      fontSize    : '.9rem',
      flexShrink  : '0',
      opacity     : '.7',
      padding     : '0 .25rem'
    });
    closeBtn.addEventListener('click', function () {
      dismissAlert(alert);
    });
    alert.appendChild(closeBtn);

    // Auto-dismiss after 8 seconds
    setTimeout(function () { dismissAlert(alert); }, 8000);
  });

  function dismissAlert(alert) {
    Object.assign(alert.style, {
      transition : 'opacity .4s ease, max-height .4s ease, margin .4s ease, padding .4s ease',
      overflow   : 'hidden',
      opacity    : '0',
      maxHeight  : '0',
      marginBottom : '0',
      paddingTop    : '0',
      paddingBottom : '0'
    });
    setTimeout(function () { alert.remove(); }, 420);
  }
})();


/* ── 8. SMOOTH SCROLL TO FORM ON ADD BUTTON ─────────────── */
(function smoothScrollForms() {
  // If URL has #add-form hash, scroll to form smoothly
  if (window.location.hash === '#add-form') {
    const formCard = document.querySelector('.form-card');
    if (formCard) {
      setTimeout(function () {
        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }
})();


/* ── 9. TABLE ROW COUNT DISPLAY ─────────────────────────── */
(function tableRowCount() {
  document.querySelectorAll('.data-table').forEach(function (table) {
    const tbody   = table.querySelector('tbody');
    if (!tbody) return;
    const rows    = tbody.querySelectorAll('tr');
    const section = table.closest('.table-card');
    if (!section) return;
    const title   = section.querySelector('.section-title');
    if (!title) return;

    const count = document.createElement('span');
    count.className = 'row-count';
    count.textContent = rows.length + ' record' + (rows.length !== 1 ? 's' : '');
    Object.assign(count.style, {
      fontSize   : '.78rem',
      fontWeight : '500',
      color      : 'var(--gray-400)',
      marginLeft : '.5rem'
    });
    title.appendChild(count);
  });
})();


/* ── 10. SUMMARY CARD NUMBER COUNTER ANIMATION ──────────── */
(function countUp() {
  const cards = document.querySelectorAll('.summary-value, .card-stat');
  cards.forEach(function (el) {
    const rawText = el.textContent.trim();

    // Detect ₹ prefix and/or % suffix
    const hasRupee  = rawText.startsWith('₹');
    const hasPct    = rawText.endsWith('%');
    const numStr    = rawText.replace('₹', '').replace('%', '').trim();
    const target    = parseFloat(numStr);

    if (isNaN(target) || target === 0) return;

    const isDecimal = numStr.includes('.');
    const duration  = 800;
    const start     = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = target * eased;
      const display  = isDecimal ? current.toFixed(2) : Math.floor(current);
      el.textContent =
        (hasRupee ? '₹' : '') + display + (hasPct ? '%' : '');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent =
        (hasRupee ? '₹' : '') +
        (isDecimal ? target.toFixed(2) : target) +
        (hasPct ? '%' : '');
    }

    requestAnimationFrame(step);
  });
})();


/* ── 11. CURRENT YEAR IN FOOTER ─────────────────────────── */
(function footerYear() {
  document.querySelectorAll('.footer').forEach(function (f) {
    f.innerHTML = f.innerHTML.replace(
      /©\s*\d{4}/,
      '© ' + new Date().getFullYear()
    );
  });
})();


/* ── 12. KEYBOARD SHORTCUT: "/" FOCUSES SEARCH INPUT ────── */
(function searchShortcut() {
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA' &&
        document.activeElement.tagName !== 'SELECT') {
      e.preventDefault();
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
    // Escape closes mobile nav
    if (e.key === 'Escape') {
      const links  = document.querySelector('.nav-links');
      const toggle = document.getElementById('navToggle');
      if (links && links.classList.contains('open')) {
        links.classList.remove('open');
        const icon = toggle && toggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-times');
        }
      }
    }
  });
})();


/* ── 13. CARD RIPPLE EFFECT ─────────────────────────────── */
(function rippleEffect() {
  document.querySelectorAll('.dash-card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect   = card.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      Object.assign(ripple.style, {
        position     : 'absolute',
        width        : size + 'px',
        height       : size + 'px',
        left         : x + 'px',
        top          : y + 'px',
        background   : 'rgba(59,130,246,.12)',
        borderRadius : '50%',
        transform    : 'scale(0)',
        animation    : 'slm-ripple .55s ease-out forwards',
        pointerEvents: 'none'
      });

      // Ensure card has position relative (already set in CSS but guard here)
      if (getComputedStyle(card).position === 'static') {
        card.style.position = 'relative';
      }
      card.style.overflow = 'hidden';
      card.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    });
  });

  // Inject ripple keyframe once
  if (!document.getElementById('slm-ripple-style')) {
    const s = document.createElement('style');
    s.id = 'slm-ripple-style';
    s.textContent =
      '@keyframes slm-ripple {' +
      'to { transform: scale(2.5); opacity: 0; }' +
      '}';
    document.head.appendChild(s);
  }
})();


/* ── 14. RESPONSIVE TABLE: CARD VIEW ON VERY SMALL SCREENS ─ */
(function responsiveTableCards() {
  function applyCardView() {
    document.querySelectorAll('.data-table').forEach(function (table) {
      const headers = Array.from(table.querySelectorAll('thead th'))
                           .map(function (th) { return th.textContent.trim(); });

      if (window.innerWidth <= 480) {
        table.querySelectorAll('tbody tr').forEach(function (row) {
          row.querySelectorAll('td').forEach(function (td, i) {
            if (headers[i] && !td.dataset.labeled) {
              td.setAttribute('data-label', headers[i]);
              td.dataset.labeled = '1';
            }
          });
        });
        table.classList.add('table-card-view');
      } else {
        table.classList.remove('table-card-view');
      }
    });
  }

  // Inject card-view styles once
  if (!document.getElementById('slm-cardview-style')) {
    const s = document.createElement('style');
    s.id = 'slm-cardview-style';
    s.textContent = `
      @media (max-width: 480px) {
        .table-card-view thead { display: none; }
        .table-card-view tbody tr {
          display: block;
          border: 1px solid var(--gray-200);
          border-radius: 10px;
          margin-bottom: .75rem;
          padding: .5rem .75rem;
          background: var(--white);
          box-shadow: 0 1px 4px rgba(0,0,0,.06);
        }
        .table-card-view tbody td {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: .4rem 0;
          border-bottom: 1px solid var(--gray-100);
          font-size: .83rem;
        }
        .table-card-view tbody td:last-child { border-bottom: none; }
        .table-card-view tbody td::before {
          content: attr(data-label);
          font-weight: 700;
          font-size: .75rem;
          color: var(--gray-500);
          text-transform: uppercase;
          letter-spacing: .04em;
          margin-right: .75rem;
          flex-shrink: 0;
        }
        .table-card-view .action-cell { justify-content: flex-end; }
        .table-card-view .action-cell::before { display: none; }
      }
    `;
    document.head.appendChild(s);
  }

  applyCardView();
  window.addEventListener('resize', applyCardView);
})();