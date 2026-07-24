// ==========================================================================
// Task Force — shared site script (runs on every page)
// Written defensively: each block checks its elements exist before wiring up,
// since not every page has a mobile menu / contact form / product modal etc.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Dark / light theme toggle ----------
  const themeToggle = document.getElementById('themeToggle');
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  const themeSwitchLabel = document.getElementById('themeSwitchLabel');

  function applyThemeButtons(theme) {
    const isLight = theme === 'light';
    [themeToggle, themeToggleMobile].forEach(btn => {
      if (btn) btn.setAttribute('aria-checked', isLight ? 'true' : 'false');
    });
    if (themeSwitchLabel) themeSwitchLabel.textContent = isLight ? 'Light mode' : 'Dark mode';
  }

  applyThemeButtons(document.documentElement.getAttribute('data-theme') || 'dark');

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('tf-theme', next);
    applyThemeButtons(next);
  }

  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

  // ---------- Mobile menu toggle (present on every page's header) ----------
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Highlight the current page in the nav ----------
  const currentPage = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-page') === currentPage) {
      link.classList.add('nav-link-active');
    }
  });

  // ---------- Contact form (contact.html only) ----------
  // Our own native form sends its data straight to a Google Apps Script web app
  // (deployed from the order-tracking Sheet), which appends a new row directly.
  // No tokens to expire, no third-party form UI — just a plain POST to our own script.
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw8wul61CYI2VWAH5ljW503Yfwu3GYCfsywwervZjqCBOqgct0O-kZkymflbNFX_BXeaw/exec';

  const orderForm = document.getElementById('orderForm');
  const thankYouOverlay = document.getElementById('thankYouOverlay');
  const orderSubmitBtn = document.getElementById('orderSubmitBtn');
  const formNote = document.getElementById('formNote');

  if (orderForm) {
    // Pre-fill from a product example's "Order yours now" button
    // (contact.html?service=...&details=...)
    const params = new URLSearchParams(location.search);
    const service = params.get('service');
    const details = params.get('details');
    const serviceField = document.getElementById('service');
    const detailsField = document.getElementById('details');
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const idealField = document.getElementById('ideal');

    if (service && serviceField) serviceField.value = service;
    if (details && detailsField) detailsField.value = details;
    if (service || details) {
      setTimeout(() => nameField && nameField.focus(), 300);
    }

    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = nameField.value.trim();
      const email = emailField.value.trim();
      if (!name || !email) {
        if (formNote) formNote.textContent = 'Please fill in your name and email first.';
        return;
      }

      if (orderSubmitBtn) {
        orderSubmitBtn.disabled = true;
        orderSubmitBtn.textContent = 'Sending…';
      }

      const payload = {
        name: name,
        email: email,
        service: serviceField.value,
        details: detailsField.value.trim(),
        ideal: idealField.value.trim()
      };

      // mode: 'no-cors' means we can't read the response back — Apps Script's
      // CORS behavior is inconsistent, so we send it and trust it, same as any
      // fire-and-forget webhook call.
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).catch(() => { /* opaque response expected — ignore */ });

      setTimeout(() => {
        if (thankYouOverlay) {
          thankYouOverlay.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      }, 500);
    });
  }

  if (thankYouOverlay) {
    thankYouOverlay.addEventListener('click', (e) => {
      if (e.target === thankYouOverlay) {
        thankYouOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ---------- Product example modal (capabilities.html only) ----------
  const PRODUCTS = {
    starter: {
      eyebrow: 'Website — Starter',
      title: 'Riverside Dog Walking',
      price: '~$50',
      service: 'Website development',
      desc: 'A one-page site so a client can point people somewhere real instead of just a phone number in a text thread.',
      features: ['1 page', 'Services, area & phone number', 'Mobile-friendly'],
      svg: `<svg viewBox="0 0 480 260" xmlns="http://www.w3.org/2000/svg">
        <rect width="480" height="260" fill="#0A0D12"/>
        <rect x="24" y="24" width="432" height="212" rx="8" fill="#11151C" stroke="#232A36"/>
        <rect x="24" y="24" width="432" height="30" rx="8" fill="#161B24"/>
        <circle cx="42" cy="39" r="4" fill="#FF5F57"/><circle cx="56" cy="39" r="4" fill="#FEBC2E"/><circle cx="70" cy="39" r="4" fill="#28C840"/>
        <circle cx="240" cy="100" r="16" fill="#4FE3C1"/>
        <rect x="180" y="128" width="120" height="10" rx="3" fill="#E9EDF3"/>
        <rect x="150" y="146" width="180" height="7" rx="3" fill="#8B94A5"/>
        <rect x="195" y="168" width="90" height="26" rx="6" fill="#4FE3C1"/>
        <text x="240" y="185" font-family="Arial" font-size="10" font-weight="700" fill="#06110D" text-anchor="middle">Book a walk</text>
        <text x="240" y="215" font-family="Arial" font-size="9" fill="#5B6478" text-anchor="middle">riversidedogwalking.com</text>
      </svg>`
    },
    standard: {
      eyebrow: 'Website — Standard',
      title: 'Sunrise Bakery',
      price: '~$100',
      service: 'Website development',
      desc: 'A multi-page site with a real menu and gallery — enough for people to decide to visit before they arrive.',
      features: ['Up to 4 pages', 'Photo gallery / menu layout', 'Contact form'],
      svg: `<svg viewBox="0 0 480 260" xmlns="http://www.w3.org/2000/svg">
        <rect width="480" height="260" fill="#0A0D12"/>
        <rect x="24" y="24" width="432" height="212" rx="8" fill="#11151C" stroke="#232A36"/>
        <rect x="24" y="24" width="432" height="30" rx="8" fill="#161B24"/>
        <circle cx="42" cy="39" r="4" fill="#FF5F57"/><circle cx="56" cy="39" r="4" fill="#FEBC2E"/><circle cx="70" cy="39" r="4" fill="#28C840"/>
        <circle cx="105" cy="39" r="5" fill="#FFC145"/>
        <rect x="330" y="35" width="36" height="8" rx="2" fill="#8B94A5"/>
        <rect x="372" y="35" width="36" height="8" rx="2" fill="#8B94A5"/>
        <rect x="414" y="35" width="30" height="8" rx="2" fill="#8B94A5"/>
        <rect x="46" y="76" width="140" height="9" rx="3" fill="#E9EDF3"/>
        <rect x="46" y="92" width="200" height="6" rx="2" fill="#5B6478"/>
        <rect x="46" y="112" width="126" height="70" rx="6" fill="#1B222E"/>
        <rect x="177" y="112" width="126" height="70" rx="6" fill="#1B222E"/>
        <rect x="308" y="112" width="126" height="70" rx="6" fill="#1B222E"/>
        <circle cx="109" cy="147" r="14" fill="#FFC145" opacity="0.5"/>
        <circle cx="240" cy="147" r="14" fill="#4FE3C1" opacity="0.5"/>
        <circle cx="371" cy="147" r="14" fill="#7C93FF" opacity="0.5"/>
        <rect x="46" y="198" width="388" height="24" rx="5" fill="#161B24" stroke="#232A36"/>
        <text x="60" y="214" font-family="Arial" font-size="9" fill="#5B6478">Get in touch →</text>
      </svg>`
    },
    pro: {
      eyebrow: 'Website — Pro',
      title: 'Elena Cruz Photography',
      price: '~$250',
      service: 'Website development',
      desc: 'A full portfolio site with a booking flow — built for a business where the site has to do real selling.',
      features: ['5+ pages', 'Custom sections & booking form', 'Priority build time'],
      svg: `<svg viewBox="0 0 480 260" xmlns="http://www.w3.org/2000/svg">
        <rect width="480" height="260" fill="#0A0D12"/>
        <rect x="24" y="24" width="432" height="212" rx="8" fill="#11151C" stroke="#232A36"/>
        <rect x="24" y="24" width="432" height="30" rx="8" fill="#161B24"/>
        <circle cx="42" cy="39" r="4" fill="#FF5F57"/><circle cx="56" cy="39" r="4" fill="#FEBC2E"/><circle cx="70" cy="39" r="4" fill="#28C840"/>
        <circle cx="105" cy="39" r="5" fill="#7C93FF"/>
        <rect x="290" y="35" width="30" height="8" rx="2" fill="#8B94A5"/>
        <rect x="326" y="35" width="30" height="8" rx="2" fill="#8B94A5"/>
        <rect x="362" y="35" width="30" height="8" rx="2" fill="#8B94A5"/>
        <rect x="398" y="35" width="46" height="8" rx="2" fill="#8B94A5"/>
        <rect x="46" y="66" width="388" height="60" rx="6" fill="#1B222E"/>
        <rect x="66" y="82" width="150" height="9" rx="3" fill="#E9EDF3"/>
        <rect x="66" y="98" width="100" height="18" rx="4" fill="#7C93FF"/>
        <rect x="46" y="136" width="122" height="42" rx="5" fill="#1B222E"/>
        <rect x="176" y="136" width="122" height="42" rx="5" fill="#1B222E"/>
        <rect x="306" y="136" width="128" height="42" rx="5" fill="#1B222E"/>
        <rect x="46" y="184" width="122" height="42" rx="5" fill="#1B222E"/>
        <rect x="176" y="184" width="122" height="42" rx="5" fill="#1B222E"/>
        <rect x="306" y="184" width="128" height="42" rx="5" fill="#1B222E"/>
      </svg>`
    },
    logo: {
      eyebrow: 'Logo & brand identity',
      title: 'Brew & Go Coffee Cart',
      price: '~$30',
      service: 'Logo & brand identity',
      desc: 'One mark, built to actually work everywhere a small business needs it — not just as a single flat image.',
      features: ['3 concepts, refined to one', 'Print and web-ready files'],
      svg: `<svg viewBox="0 0 480 260" xmlns="http://www.w3.org/2000/svg">
        <rect width="480" height="260" fill="#0A0D12"/>
        <path d="M100 100 L150 100 L145 165 Q125 178 105 165 Z" fill="#161B24" stroke="#232A36"/>
        <circle cx="125" cy="132" r="14" fill="#FFC145"/>
        <rect x="215" y="95" width="90" height="70" rx="6" fill="#161B24" stroke="#232A36"/>
        <rect x="255" y="150" width="4" height="30" fill="#232A36"/>
        <rect x="205" y="178" width="110" height="4" fill="#232A36"/>
        <circle cx="260" cy="128" r="16" fill="#FFC145"/>
        <rect x="360" y="90" width="70" height="70" rx="12" fill="#161B24" stroke="#232A36"/>
        <circle cx="395" cy="125" r="14" fill="#FFC145"/>
        <text x="240" y="220" font-family="Arial" font-size="10" fill="#5B6478" text-anchor="middle">cup · sandwich board · social</text>
      </svg>`
    },
    event: {
      eyebrow: 'Event & campaign materials',
      title: "Maya's Sweet 16",
      price: '~$20',
      service: 'Event & campaign materials',
      desc: 'A digital invite matched to the exact theme and colors of the event, ready to send or print.',
      features: ['Digital and print-ready formats', 'Matched to your colors and tone'],
      svg: `<svg viewBox="0 0 480 260" xmlns="http://www.w3.org/2000/svg">
        <rect width="480" height="260" fill="#0A0D12"/>
        <rect x="150" y="30" width="180" height="200" rx="10" fill="#161B24" stroke="#7C93FF" stroke-width="1.5"/>
        <rect x="164" y="44" width="152" height="172" rx="6" fill="none" stroke="#7C93FF" stroke-width="0.75" stroke-dasharray="3 4"/>
        <text x="240" y="90" font-family="Georgia" font-size="14" fill="#E9EDF3" text-anchor="middle">You're Invited</text>
        <rect x="200" y="108" width="80" height="6" rx="2" fill="#7C93FF"/>
        <text x="240" y="140" font-family="Arial" font-size="9" fill="#8B94A5" text-anchor="middle">Maya turns 16</text>
        <text x="240" y="158" font-family="Arial" font-size="8" fill="#5B6478" text-anchor="middle">Saturday · 6:00 PM</text>
        <text x="240" y="172" font-family="Arial" font-size="8" fill="#5B6478" text-anchor="middle">The Garden Room</text>
        <path d="M210 190 l3 6 6 1 -4.5 4.5 1 6.5 -5.5 -3 -5.5 3 1 -6.5 -4.5 -4.5 6 -1 z" fill="#FFC145"/>
        <path d="M270 190 l3 6 6 1 -4.5 4.5 1 6.5 -5.5 -3 -5.5 3 1 -6.5 -4.5 -4.5 6 -1 z" fill="#FFC145"/>
      </svg>`
    },
    merch: {
      eyebrow: 'Custom merchandise',
      title: 'Ironwood FC Youth Soccer',
      price: '~$15 design',
      service: 'Custom merchandise',
      desc: 'A sticker sheet designed for real production — printing and shipping quoted separately based on quantity.',
      features: ['Print-ready, any size or finish', 'Unlimited design revisions'],
      svg: `<svg viewBox="0 0 480 260" xmlns="http://www.w3.org/2000/svg">
        <rect width="480" height="260" fill="#0A0D12"/>
        <rect x="60" y="30" width="360" height="200" rx="10" fill="#11151C" stroke="#232A36"/>
        <circle cx="150" cy="90" r="34" fill="#161B24" stroke="#4FE3C1" stroke-width="1.5" stroke-dasharray="3 3"/>
        <circle cx="150" cy="90" r="14" fill="#4FE3C1"/>
        <circle cx="260" cy="110" r="30" fill="#161B24" stroke="#7C93FF" stroke-width="1.5" stroke-dasharray="3 3"/>
        <circle cx="260" cy="110" r="12" fill="#7C93FF"/>
        <circle cx="355" cy="80" r="26" fill="#161B24" stroke="#FFC145" stroke-width="1.5" stroke-dasharray="3 3"/>
        <circle cx="355" cy="80" r="10" fill="#FFC145"/>
        <circle cx="180" cy="180" r="28" fill="#161B24" stroke="#4FE3C1" stroke-width="1.5" stroke-dasharray="3 3"/>
        <circle cx="180" cy="180" r="11" fill="#4FE3C1"/>
        <circle cx="310" cy="185" r="32" fill="#161B24" stroke="#7C93FF" stroke-width="1.5" stroke-dasharray="3 3"/>
        <circle cx="310" cy="185" r="13" fill="#7C93FF"/>
      </svg>`
    }
  };

  const modalOverlay = document.getElementById('modalOverlay');
  const modalImageWrap = document.getElementById('modalImageWrap');
  const modalEyebrow = document.getElementById('modalEyebrow');
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const modalDesc = document.getElementById('modalDesc');
  const modalFeatures = document.getElementById('modalFeatures');
  const modalOrderBtn = document.getElementById('modalOrderBtn');
  const modalClose = document.getElementById('modalClose');
  let currentProduct = null;

  if (modalOverlay && modalImageWrap && modalOrderBtn) {

    function openModal(key) {
      const p = PRODUCTS[key];
      if (!p) return;
      currentProduct = p;
      modalImageWrap.innerHTML = p.svg + '<button class="modal-close" id="modalCloseInner" aria-label="Close">✕</button>';
      document.getElementById('modalCloseInner').addEventListener('click', closeModal);
      modalEyebrow.textContent = p.eyebrow;
      modalTitle.textContent = p.title;
      modalPrice.innerHTML = `<b>${p.price}</b> · example project`;
      modalDesc.textContent = p.desc;
      modalFeatures.innerHTML = p.features.map(f => `<li>${f}</li>`).join('');
      modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-product]').forEach(el => {
      el.addEventListener('click', () => openModal(el.getAttribute('data-product')));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(el.getAttribute('data-product')); }
      });
    });

    if (modalClose) modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // "Order yours now" takes you to a real page (contact.html), pre-filled via URL params —
    // no in-page scrolling, since every page here is independent.
    modalOrderBtn.addEventListener('click', () => {
      if (currentProduct) {
        const params = new URLSearchParams({
          service: currentProduct.service,
          details: `I'm interested in the ${currentProduct.title} package (${currentProduct.price}).`
        });
        window.location.href = `contact.html?${params.toString()}`;
      } else {
        window.location.href = 'contact.html';
      }
    });
  }

  // ---------- FAQ accordion (faq.html only) ----------
  document.querySelectorAll('.accordion-item').forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      if (isOpen) {
        item.classList.remove('open');
        panel.style.maxHeight = '0px';
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---------- Scroll-reveal animations (every page) ----------
  // Cards, tiers, steps, and stat blocks fade/slide into view as they enter the
  // viewport, instead of all being visible immediately on load.
  const revealEls = document.querySelectorAll(
    '.card, .tier, .step, .value-item, .wwd-item, .founding-box, .promo-card'
  );

  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      revealEls.forEach(el => revealObserver.observe(el));
    } else {
      // No IntersectionObserver support — just show everything immediately.
      revealEls.forEach(el => el.classList.add('in-view'));
    }
  }

});
