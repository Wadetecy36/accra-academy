/* ============================================================= */
/*  js/script.js – SENIOR DEV MODE: DEBUGGING ENABLED            */
/* ============================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // SENIOR DEV: Initialization Log
    console.log('%c 🔧 DOMContentLoaded: Initializing Scripts... ', 'background: #002147; color: #FDBE11; font-weight: bold;');

    /* =========================================
       0. MOBILE MENU TOGGLE (CRITICAL FIX)
       ========================================= */
    const mobileBtn = document.querySelector('.mobile-btn');
    const navLinks = document.querySelector('.navlinks');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            // Toggle visibility
            navLinks.classList.toggle('hidden');
            navLinks.classList.toggle('flex');

            // Add mobile styling classes dynamically
            if (navLinks.classList.contains('flex')) {
                navLinks.classList.add('flex-col', 'absolute', 'top-16', 'left-0', 'w-full', 'bg-white', 'dark:bg-gray-900', 'p-6', 'shadow-xl', 'border-b', 'border-gold');
                mobileBtn.textContent = '✕'; // Change icon to Close
                console.log('📱 Mobile Menu: OPEN'); // DEBUG
            } else {
                navLinks.classList.remove('flex-col', 'absolute', 'top-16', 'left-0', 'w-full', 'bg-white', 'dark:bg-gray-900', 'p-6', 'shadow-xl', 'border-b', 'border-gold');
                mobileBtn.textContent = '☰'; // Change icon back to Menu
                console.log('📱 Mobile Menu: CLOSED'); // DEBUG
            }
        });
    } else {
        console.warn('⚠️ Mobile Menu elements not found in DOM.');
    }


    /* =========================================
       1. 3D TILT EFFECT FOR CARDS
       ========================================= */
    const cards = document.querySelectorAll('.feature-card, .info-card');

    if (cards.length === 0) console.warn('ℹ️ No tilt cards found on this page.');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            // Max tilt 10 degrees
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    /* =========================================
       2. DARK MODE TOGGLE
       ========================================= */
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Check saved theme
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
        console.log('🌙 Dark Mode: Active (System/Storage)'); // DEBUG
    } else {
        console.log('☀️ Light Mode: Active'); // DEBUG
    }

    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
<<<<<<< HEAD
            html.classList.toggle('dark');
            const isDark = html.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggle.setAttribute('aria-pressed', isDark);
            console.log(`🌗 Theme toggled to: ${isDark ? 'Dark' : 'Light'}`); // DEBUG
        });
=======
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.setAttribute('aria-pressed', isDark); // ADD THIS LINE
});
>>>>>>> 91311ebb1bf70f170312d814d9bdbb3214a401da
    }

    /* =========================================
       3. GALLERY SWIPER (RESPONSIVE)
       ========================================= */
    // Only init if the element exists to prevent errors on other pages
    if (document.querySelector('.mySwiper')) {
        // SENIOR DEV: Check if library is loaded
        if (typeof Swiper === 'undefined') {
            console.error('❌ Swiper JS not detected. Gallery will not work.');
        } else {
            var swiper = new Swiper(".mySwiper", {
                slidesPerView: 1,       // Mobile default
                spaceBetween: 30,
                loop: true,             // Infinite loop
                grabCursor: true,       // Hand cursor on drag

                autoplay: {
                    delay: 3500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                },

                // Navigation Arrows
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },

                // Dots
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                    dynamicBullets: true,
                },

                // Responsive Breakpoints
                breakpoints: {
                    640: { slidesPerView: 2, spaceBetween: 20 }, // Tablets
                    1024: { slidesPerView: 3, spaceBetween: 30 }, // Desktops
                },
            });
            console.log('✅ Swiper Initialized'); // DEBUG
        }
    }

    /* =========================================
       4. ABOUT PAGE CAROUSEL (MANUAL)
       ========================================= */
    // This is for the specific history slider in about.html
    const slides = document.querySelectorAll('.carousel-item');
    if (slides.length > 0) {
        let slideIndex = 0;
        showSlides(slideIndex);

        window.plusSlides = function(n) {
            showSlides(slideIndex += n);
        }

        function showSlides(n) {
            if (n >= slides.length) slideIndex = 0;
            if (n < 0) slideIndex = slides.length - 1;
            slides.forEach(slide => slide.classList.remove('active'));
            slides[slideIndex].classList.add('active');
        }

        // Slower auto-play for history
        setInterval(() => plusSlides(1), 6000);
        console.log(`🎞️ Custom Carousel started with ${slides.length} slides.`); // DEBUG
    }

    /* =========================================
       5. SCROLL TO TOP & COPYRIGHT
       ========================================= */
    const scrollBtn = document.getElementById('scrollTop');
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            scrollBtn.classList.toggle('show', window.scrollY > 500);
        });
        scrollBtn.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
    }

    const yearSpan = document.getElementById('yr');
    if (yearSpan) yearSpan.innerText = new Date().getFullYear();

    /* =========================================
       6. EASTER EGG (5 Clicks)
       ========================================= */
    let clicks = 0;
    const crest = document.querySelector('.footer-brand img');

    if (crest) {
      crest.addEventListener('click', () => {
        clicks++;
        console.log(`🥚 Easter Egg Progress: ${clicks}/5`); // DEBUG

        // Visual feedback on every click
        crest.style.transform = `scale(${1 + (clicks * 0.1)})`;

        if (clicks === 5) {
          console.log('🎉 BLEOO SPIRIT UNLOCKED!'); // DEBUG
          // Reset scale immediately for the spin
          crest.style.transition = 'all 1s ease';
          crest.style.transform = 'scale(1.8) rotate(360deg)';

          alert('BLEOO SPIRIT UNLOCKED! 🟡🔵');

          // Reset after animation
          setTimeout(() => {
              crest.style.transition = '';
              crest.style.transform = '';
              clicks = 0;
          }, 1000);

          // Confetti
          if(typeof confetti === 'function') {
            const end = Date.now() + 3000;
            (function frame() {
                confetti({
                    particleCount: 8,
                    spread: 70,
                    origin: { y: 0.8 }, // Confetti comes from bottom near footer
                    colors: ['#002147', '#FDBE11']
                });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
          } else {
             console.warn('⚠️ Confetti library not loaded.');
          }
        }
      });

      // Reset clicks if user stops clicking for 2 seconds
      crest.addEventListener('mouseleave', () => {
          setTimeout(() => { if(clicks < 5) clicks = 0; crest.style.transform = ''; }, 2000);
      });
    }

    /* =========================================
       7. INITIALIZE AOS ANIMATIONS
       ========================================= */
    if (window.AOS) {
        AOS.init({
            duration: 800,
            offset: 100,
            once: true
        });
        console.log('✅ AOS Initialized'); // DEBUG
    } else {
        console.warn('⚠️ AOS Library not found. Animations disabled.');
    }

    /* =========================================
       8. ACHIEVEMENTS COUNTER ANIMATION
       ========================================= */
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the slower

    if (counters.length > 0) {
        const startCounting = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = +counter.getAttribute('data-target');
                    console.log(`📈 Counter started for: ${target}`); // DEBUG

                    const updateCount = () => {
                        const count = +counter.innerText;
                        const inc = target / speed;

                        if (count < target) {
                            // Round up to avoid decimals
                            counter.innerText = Math.ceil(count + inc);
                            setTimeout(updateCount, 20);
                        } else {
                            counter.innerText = target; // Ensure it ends exactly on target
                        }
                    };

                    updateCount();
                    observer.unobserve(counter); // Stop watching once animation starts
                }
            });
        };

        // Create Intersection Observer
        const counterObserver = new IntersectionObserver(startCounting, {
            root: null,
            threshold: 0.5 // Trigger when 50% of the element is visible
        });

<<<<<<< HEAD
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    /* =========================================
       9. IMAGE FALLBACK (MISSING ASSETS)
       ========================================= */
    document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('onerror')) {
            img.onerror = function() {
                console.warn(`🖼️ Image Failed: ${this.src} -> Replaced with placeholder`); // DEBUG
                this.onerror = null; // Prevent infinite loop
                const alt = this.alt || 'Image';
                const width = this.width || 800;
                const height = this.height || 450;
                this.src = `https://placehold.co/${width}x${height}/002147/FDBE11?text=${encodeURIComponent(alt)}`;
            };
        }
    });

});
=======
        // Auto-fallback for missing images
document.querySelectorAll('img').forEach(img => {
  if (!img.hasAttribute('onerror')) {
    img.onerror = function() {
      this.onerror = null;
      const alt = this.alt || 'Image';
      this.src = `https://placehold.co/800x450/002147/FDBE11?text=${encodeURIComponent(alt)}`;
    };
  }
});
    
    // Create Intersection Observer
    const counterObserver = new IntersectionObserver(startCounting, {
        root: null,
        threshold: 0.5 // Trigger when 50% of the element is visible
    });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
});
>>>>>>> 91311ebb1bf70f170312d814d9bdbb3214a401da
