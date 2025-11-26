    document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       1. 3D TILT EFFECT FOR CARDS
       ========================================= */
    const cards = document.querySelectorAll('.feature-card, .info-card');

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
    }

    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            html.classList.toggle('dark');
            localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    /* =========================================
       3. GALLERY SWIPER (RESPONSIVE)
       ========================================= */
    // Only init if the element exists to prevent errors on other pages
    if (document.querySelector('.mySwiper')) {
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

        // Visual feedback on every click
        crest.style.transform = `scale(${1 + (clicks * 0.1)})`;

        if (clicks === 5) {
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
    }

    /* =========================================
       8. ACHIEVEMENTS COUNTER ANIMATION
       ========================================= */
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the slower

    const startCounting = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');

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
