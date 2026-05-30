// ===== LIGHT / DARK THEME TOGGLE =====
(function () {
  const STORAGE_KEY = 'copal-theme';
  const root = document.documentElement;

  function applyTheme(theme, btn) {
    root.setAttribute('data-theme', theme);
    if (btn) {
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }

  function getInitialTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch (_) {}
    // Fall back to OS preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Apply data-theme immediately (before DOM is ready) to avoid flash-of-wrong-theme.
  // The inline <head> script already did this, but this ensures correctness if that
  // script is ever removed.
  const initialTheme = getInitialTheme();
  root.setAttribute('data-theme', initialTheme);
  try { localStorage.setItem(STORAGE_KEY, initialTheme); } catch (_) {}

  // Wire up the button after DOM is available
  function initToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    // Sync aria-label with whatever theme is active right now
    const currentTheme = root.getAttribute('data-theme') || 'light';
    btn.setAttribute(
      'aria-label',
      currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );

    btn.addEventListener('click', function () {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next, btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggle);
  } else {
    initToggle();
  }

  // Keep in sync if user changes OS preference while tab is open
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    // Only follow OS change if the user has not made an explicit choice
    try { if (localStorage.getItem(STORAGE_KEY)) return; } catch (_) {}
    const btn = document.getElementById('theme-toggle');
    applyTheme(e.matches ? 'dark' : 'light', btn);
  });
})();

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHamburger();
  initScrollReveal();
  initTestimonialCarousel();
  initReservationForm();
  setDateMin();
});

/* ===== NAV: transparent → dark on scroll ===== */
function initNav() {
  const navbar = document.getElementById('navbar');

  const update = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };

  window.addEventListener('scroll', update, { passive: true });
  update(); // run once on load
}

/* ===== HAMBURGER MENU ===== */
function initHamburger() {
  const toggle   = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close when any nav link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close when clicking outside the nav
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ===== SCROLL REVEAL (IntersectionObserver) ===== */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || prefersReduced) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => observer.observe(el));
}

/* ===== TESTIMONIAL CAROUSEL ===== */
function initTestimonialCarousel() {
  const cards   = Array.from(document.querySelectorAll('.testimonial-card'));
  const dots    = Array.from(document.querySelectorAll('.dot'));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current   = 0;
  let timer     = null;

  function goTo(index) {
    cards[current].classList.remove('active');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');

    current = (index + cards.length) % cards.length;

    cards[current].classList.add('active');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  function startTimer() {
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  function resetTimer() {
    clearInterval(timer);
    startTimer();
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      resetTimer();
    });
  });

  // Pause on hover / focus
  const wrapper = document.querySelector('.testimonials-wrapper');
  wrapper.addEventListener('mouseenter', () => clearInterval(timer));
  wrapper.addEventListener('mouseleave', startTimer);
  wrapper.addEventListener('focusin',    () => clearInterval(timer));
  wrapper.addEventListener('focusout',   startTimer);

  if (!prefersReduced) startTimer();
}

/* ===== RESERVATION FORM ===== */
function initReservationForm() {
  const form       = document.getElementById('reservation-form');
  const confirm    = document.getElementById('confirmation');
  const confirmMsg = document.getElementById('confirmation-msg');
  const resetBtn   = document.getElementById('new-reservation-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Move focus to first invalid field for accessibility
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const name   = document.getElementById('full-name').value.trim();
    const guests = parseInt(document.getElementById('guests').value, 10);
    const date   = formatDate(document.getElementById('date').value);
    const time   = document.getElementById('time').value;

    confirmMsg.textContent =
      `Thank you, ${name}! Your reservation request for ${guests} guest${guests !== 1 ? 's' : ''} `
      + `on ${date} at ${time} has been received.`;

    form.hidden    = true;
    confirm.hidden = false;
    confirm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    confirm.querySelector('h3').focus();
  });

  resetBtn.addEventListener('click', () => {
    form.reset();
    clearAllErrors();
    confirm.hidden = false;
    form.hidden    = false;
    confirm.hidden = true;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* Validate all fields; return true if form is valid */
function validateForm() {
  let valid = true;

  const rules = [
    {
      id:    'full-name',
      errId: 'error-full-name',
      check: v => v.trim().length >= 2,
      msg:   'Please enter your full name.',
    },
    {
      id:    'email',
      errId: 'error-email',
      check: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      msg:   'Please enter a valid email address.',
    },
    {
      id:    'phone',
      errId: 'error-phone',
      check: v => v.trim().replace(/[\s\-+()]/g, '').length >= 6,
      msg:   'Please enter a valid phone number.',
    },
    {
      id:    'date',
      errId: 'error-date',
      check: v => v !== '',
      msg:   'Please select a date.',
    },
    {
      id:    'time',
      errId: 'error-time',
      check: v => v !== '',
      msg:   'Please select a preferred time.',
    },
    {
      id:    'guests',
      errId: 'error-guests',
      check: v => { const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 20; },
      msg:   'Please enter a number of guests between 1 and 20.',
    },
  ];

  clearAllErrors();

  rules.forEach(({ id, errId, check, msg }) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(errId);

    if (!check(el.value)) {
      el.classList.add('invalid');
      err.textContent = msg;
      valid = false;
    }
  });

  return valid;
}

function clearAllErrors() {
  document.querySelectorAll('.error-msg').forEach(el => { el.textContent = ''; });
  document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
}

/* Format "2026-06-15" → "15 June 2026" */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}

/* Set the date input's min to today so past dates are blocked */
function setDateMin() {
  const dateInput = document.getElementById('date');
  const now   = new Date();
  const yyyy  = now.getFullYear();
  const mm    = String(now.getMonth() + 1).padStart(2, '0');
  const dd    = String(now.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}
