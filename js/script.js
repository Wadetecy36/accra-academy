/* ============================================================= */
/*  FINAL WORKING script.js – DARK MODE + EASTER EGG + SCROLL   */
/* ============================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // ——— 1. DARK MODE TOGGLE (WITH SUN/MOON SVG) ———
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  const sunIcon = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  const moonIcon = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;

  // Apply saved theme or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

  function setTheme(dark) {
    html.classList.toggle('dark', dark);
    themeToggle.innerHTML = dark ? sunIcon : moonIcon;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  setTheme(isDark);

  themeToggle?.addEventListener('click', () => {
    const currentlyDark = html.classList.contains('dark');
    setTheme(!currentlyDark);
  });

  // ——— 2. SCROLL TO TOP BUTTON ———
  const scrollBtn = document.getElementById('scrollTop');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      scrollBtn.classList.toggle('show', window.scrollY > 500);
    });
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ——— 3. EASTER EGG: 5 clicks on footer crest ———
  let clicks = 0;
  const crest = document.querySelector('.footer-brand img');
  if (crest) {
    crest.style.cursor = 'pointer';
    crest.title = 'Click 5 times for Bleoo magic…';
    crest.addEventListener('click', () => {
      if (++clicks === 5) {
        alert('BLEOO SPIRIT UNLOCKED! Legendary!');
        crest.style.transform = 'scale(2) rotate(360deg)';
        setTimeout(() => crest.style.transform = '', 800);

        // CONFETTI
        const duration = 3 * 1000;
        const end = Date.now() + duration;
        (function frame() {
          confetti({ particleCount: 8, spread: 70, origin: { y: 0.6 } });
          if (Date.now() < end) requestAnimationFrame(frame);
        }());
        clicks = 0;
      }
    });
  }



  /* --------------------------------------------------------------
   * 3. Feature Cards – Tilt Effect (pointermove)
   * -------------------------------------------------------------- */
  const cards = document.querySelectorAll('.feature-card');
  let lastUpdate = 0;

  cards.forEach(card => {
      card.addEventListener('pointermove', handleTilt);
      card.addEventListener('pointerleave', resetTilt);
  });

  function handleTilt(e) {
      const now = performance.now();
      if (now - lastUpdate < 16) return;               // ~60 fps throttle
      lastUpdate = now;

      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      const tiltX = (dy / rect.height) * -8;   // rotateX
      const tiltY = (dx / rect.width)  * 10;   // rotateY

      card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
      card.classList.add('hover-active');
  }

  function resetTilt(e) {
      const card = e.currentTarget;
      card.style.transform = '';
      card.classList.remove('hover-active');
  }
  
  // ——— 4. AOS Init ———
  if (window.AOS) AOS.init({ duration: 800, once: true });
});