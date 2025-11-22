/* ============================================================= */
/*  js/script.js – Accra Academy prototype                       */
/* ============================================================= */

/* --------------------------------------------------------------
 * 1. AOS – Animate On Scroll
 * -------------------------------------------------------------- */
if (window.AOS) {
    AOS.init({
        duration: 800,
        once: true,
        easing: 'ease-out-cubic'
    });
}

/* --------------------------------------------------------------
 * 2. Mobile Menu Toggle
 * -------------------------------------------------------------- */
const mobileToggle = document.getElementById('mobile-toggle');
const mobileNav    = document.getElementById('mobile-nav');

if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('open');
        mobileToggle.setAttribute('aria-expanded', isOpen);
        mobileToggle.textContent = isOpen ? 'X' : 'Menu';
    });
}

/* --------------------------------------------------------------
 * 3. Dynamic Year (footer)
 * -------------------------------------------------------------- */
document.getElementById('yr').textContent = new Date().getFullYear();

/* --------------------------------------------------------------
 * 4. Feature Cards – Tilt Effect (pointermove)
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

/* --------------------------------------------------------------
 * 5. Swiper Carousel (Gallery)
 * -------------------------------------------------------------- */
const swiper = new Swiper('.mySwiper', {
    loop: true,
    autoplay: { delay: 3000, disableOnInteraction: false },
    effect: 'fade',
    fadeEffect: { crossFade: true },
    autoHeight: true,                     // adapts to aspect-ratio container
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
    },
    breakpoints: {
        640:  { slidesPerView: 1 },
        768:  { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
    }
});


/* --------------------------------------------------------------
 *  6. Theme Toggle (Dark / Light) – Fixed Icons
 *  -------------------------------------------------------------- */
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const storedTheme = localStorage.getItem('theme');

    // Icons (you can use any Unicode or SVG)
    const SUN_ICON  = 'Light';
    const MOON_ICON = 'Dark';

    // Apply correct class + icon
    const applyTheme = () => {
        const isDark = storedTheme === 'dark' || (!storedTheme && prefersDark.matches);
        document.body.classList.toggle('dark-mode', isDark);
        themeToggle.textContent = isDark ? MOON_ICON : SUN_ICON;
    };
    applyTheme();

    // Click → toggle
    themeToggle.addEventListener('click', () => {
        const willBeDark = !document.body.classList.contains('dark-mode');
        document.body.classList.toggle('dark-mode', willBeDark);
        themeToggle.textContent = willBeDark ? MOON_ICON : SUN_ICON;
        localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
    });

    // OS change
    prefersDark.addEventListener('change', () => {
        if (!storedTheme) applyTheme();
    });
}



/* --------------------------------------------------------------
   7. Easter-Egg – Click the FOOTER crest 5 times → CONFETTI!
   -------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  let crestClicks = 0;
  const crest = document.querySelector('.footer-brand img');

  if (!crest) {
    console.warn('Easter egg crest not found! Check .footer-brand img');
    return;
  }

  // Visual feedback
  crest.style.cursor = 'pointer';
  crest.title = 'Click 5 times for Bleoo Spirit…';

  crest.addEventListener('click', () => {
    crestClicks++;
    console.log(`Bleoo clicks: ${crestClicks}/5`);

    if (crestClicks === 5) {
      // 1. Alert
     // alert('Bleoo Spirit Unlocked! You’re now a certified Accra Academy legend!');

      // 2. Pop animation
      crest.style.transition = 'transform 0.2s ease-out';
      crest.style.transform = 'scale(1.6) rotate(15deg)';
      setTimeout(() => {
        crest.style.transform = 'scale(1) rotate(0deg)';
      }, 300);

     
      // 3. CONFETTI EXPLOSION
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      crestClicks = 0; // Reset
    }
  });
});