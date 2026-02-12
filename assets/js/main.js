document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');
  function toggleNav(open) {
    if (!siteNav || !navToggle) return;
    const willOpen = typeof open === 'boolean' ? open : !siteNav.classList.contains('open');
    siteNav.classList.toggle('open', willOpen);
    navToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    navToggle.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
  }
  if (navToggle) navToggle.addEventListener('click', () => toggleNav());
  // Close menu with Escape on small screens
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && siteNav && siteNav.classList.contains('open')) {
      toggleNav(false);
      navToggle.focus();
    }
  });

  // Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (siteNav) { siteNav.classList.remove('open'); if (navToggle) navToggle.setAttribute('aria-expanded', 'false'); }
      }
    });
  });

  // Helpers: Gmail compose URL and mailto fallback.
  function buildMailto(to, subject, body) {
    to = to || '';
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function buildGmailUrl(to, subject, body) {
    to = to || '';
    // Gmail web compose URL with prefilled fields.
    const base = 'https://mail.google.com/mail/?view=cm&fs=1&tf=1';
    const parts = [];
    if (to) parts.push('to=' + encodeURIComponent(to));
    if (subject) parts.push('su=' + encodeURIComponent(subject));
    if (body) parts.push('body=' + encodeURIComponent(body));
    return base + (parts.length ? '&' + parts.join('&') : '');
  }

  const contactForm = document.getElementById('contact-form');
  const contactStatus = document.getElementById('contact-status');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // simple validation
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();
      const message = document.getElementById('contact-message').value.trim();
      if (!name || !email || !message) {
        contactStatus.classList.add('show');
        contactStatus.textContent = 'Please complete name, email and message.';
        return;
      }

      const submitBtn = document.getElementById('contact-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Opening Gmail…';

      const subject = `Website message — ${name}`;
      const body = `Dear Campaign Team,\n\n${message}\n\nRegards,\n${name}\nEmail: ${email}\nPhone: ${phone}\n\n--\nSent from the Dr. Patrick Mutai website: ${location.origin}${location.pathname}`;
      const to = contactForm.dataset.mailto || '';

      // Try to open Gmail compose in a new tab. Provide a mailto fallback link in the UI.
      const gmailUrl = buildGmailUrl(to, subject, body);
      try {
        window.open(gmailUrl, '_blank', 'noopener');
      } catch (err) {
        // ignore — we'll show fallback below
      }

      contactStatus.classList.add('show');
      const fallback = buildMailto(to, subject, body);
      contactStatus.innerHTML = `Opening Gmail in a new tab. Please complete and send the message there. If Gmail does not open, <a href="${fallback}">click here to use your email client</a>.`;
      contactStatus.focus();

      // restore button state and reset form after a short delay
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        contactForm.reset();
      }, 1200);
    });
  }

  // Volunteer form uses the same mailto fallback
  const volForm = document.getElementById('volunteer-form');
  if (volForm) {
    const volStatus = document.getElementById('vol-status');
    volForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const fd = new FormData(volForm);
      const name = (fd.get('name') || '').trim();
      const email = (fd.get('email') || '').trim();
      const phone = (fd.get('phone') || '').trim();
      const message = (fd.get('message') || '').trim();
      const volBtn = document.getElementById('vol-submit');
      if (!name || !email) {
        volStatus.classList.add('show');
        volStatus.textContent = 'Please provide your name and email to sign up.';
        volStatus.focus();
        return;
      }
      volBtn.disabled = true;
      volBtn.textContent = 'Opening Gmail…';

      const subject = `Volunteer sign-up — ${name}`;
      const body = `Dear Campaign Team,\n\nI would like to volunteer and support the campaign.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage: ${message}\n\n--\nSent from the Dr. Patrick Mutai website: ${location.origin}${location.pathname}`;
      const to = volForm.dataset.mailto || (contactForm && contactForm.dataset.mailto) || '';

      const gmailUrl = buildGmailUrl(to, subject, body);
      try { window.open(gmailUrl, '_blank', 'noopener'); } catch (err) {}

      const fallback = buildMailto(to, subject, body);
      volStatus.classList.add('show');
      volStatus.innerHTML = `Opening Gmail in a new tab. If Gmail does not open, <a href="${fallback}">click here to use your email client</a> to send your volunteer sign-up.`;
      volStatus.focus();

      setTimeout(() => {
        volBtn.disabled = false;
        volBtn.textContent = 'Sign Up';
        volForm.reset();
      }, 1200);
    });
  }
});
