/* ============================================================= */
/*  js/script.js – SENIOR DEV MODE: CLEAN & CONFLICT-FREE        */
/* ============================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // SENIOR DEV: Initialization Log
    console.log('%c 🔧 DOMContentLoaded: Initializing Scripts... ', 'background: #002147; color: #FDBE11; font-weight: bold;');

    /* =========================================
       0. MOBILE MENU TOGGLE
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
                console.log('📱 Mobile Menu: OPEN');
            } else {
                navLinks.classList.remove('flex-col', 'absolute', 'top-16', 'left-0', 'w-full', 'bg-white', 'dark:bg-gray-900', 'p-6', 'shadow-xl', 'border-b', 'border-gold');
                mobileBtn.textContent = '☰'; // Change icon back to Menu
                console.log('📱 Mobile Menu: CLOSED');
            }
        });
    } else {
        console.warn('⚠️ Mobile Menu elements not found in DOM.');
    }


    /* =========================================
       1. 3D TILT EFFECT FOR CARDS
       ========================================= */
    const cards = document.querySelectorAll('.feature-card, .info-card');

    if (cards.length > 0) {
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
    }

    /* =========================================
       2. DARK MODE TOGGLE
       ========================================= */
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Check saved theme
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
        console.log('🌙 Dark Mode: Active (System/Storage)');
    } else {
        console.log('☀️ Light Mode: Active');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            html.classList.toggle('dark');
            const isDark = html.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggle.setAttribute('aria-pressed', isDark);
            console.log(`🌗 Theme toggled to: ${isDark ? 'Dark' : 'Light'}`);
        });
    }

    /* =========================================
       3. GALLERY SWIPER (RESPONSIVE)
       ========================================= */
    if (document.querySelector('.mySwiper')) {
        if (typeof Swiper === 'undefined') {
            console.error('❌ Swiper JS not detected. Gallery will not work.');
        } else {
            var swiper = new Swiper(".mySwiper", {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                grabCursor: true,
                autoplay: {
                    delay: 3500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                },
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                    dynamicBullets: true,
                },
                breakpoints: {
                    640: { slidesPerView: 2, spaceBetween: 20 },
                    1024: { slidesPerView: 3, spaceBetween: 30 },
                },
            });
            console.log('✅ Swiper Initialized');
        }
    }

    /* =========================================
       4. ABOUT PAGE CAROUSEL (MANUAL)
       ========================================= */
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
        setInterval(() => plusSlides(1), 6000);
        console.log(`🎞️ Custom Carousel started with ${slides.length} slides.`);
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
       6. EASTER EGG
       ========================================= */
    let clicks = 0;
    const crest = document.querySelector('.footer-brand img');

    if (crest) {
      crest.addEventListener('click', () => {
        clicks++;
        crest.style.transform = `scale(${1 + (clicks * 0.1)})`;

        if (clicks === 5) {
          console.log('🎉 BLEOO SPIRIT UNLOCKED!');
          crest.style.transition = 'all 1s ease';
          crest.style.transform = 'scale(1.8) rotate(360deg)';
          alert('BLEOO SPIRIT UNLOCKED! 🟡🔵');

          setTimeout(() => {
              crest.style.transition = '';
              crest.style.transform = '';
              clicks = 0;
          }, 1000);

          if(typeof confetti === 'function') {
            const end = Date.now() + 3000;
            (function frame() {
                confetti({
                    particleCount: 999999999999999999999999,
                    spread: 700,
                    origin: { y: 0.8 },
                    colors: ['#002147', '#FDBE11']
                });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
          }
        }
      });

      crest.addEventListener('mouseleave', () => {
          setTimeout(() => { if(clicks < 5) clicks = 0; crest.style.transform = ''; }, 2000);
      });
    }

    /* =========================================
       7. INITIALIZE AOS
       ========================================= */
    if (window.AOS) {
        AOS.init({
            duration: 800,
            offset: 100,
            once: true
        });
        console.log('✅ AOS Initialized');
    }

    /* =========================================
       8. ACHIEVEMENTS COUNTER
       ========================================= */
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    if (counters.length > 0) {
        const startCounting = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = +counter.getAttribute('data-target');
                    console.log(`📈 Counter started for: ${target}`);

                    const updateCount = () => {
                        const count = +counter.innerText;
                        const inc = target / speed;
                        if (count < target) {
                            counter.innerText = Math.ceil(count + inc);
                            setTimeout(updateCount, 20);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCount();
                    observer.unobserve(counter);
                }
            });
        };

        const counterObserver = new IntersectionObserver(startCounting, {
            root: null,
            threshold: 0.5
        });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    /* =========================================
       9. IMAGE FALLBACK (Robust)
       ========================================= */
    document.querySelectorAll('img').forEach(img => {
        // Prevent infinite loop if fallback also fails
        if (!img.hasAttribute('data-fallback-applied')) {
            img.onerror = function() {
                console.warn(`🖼️ Image Failed: ${this.src} -> Replaced with placeholder`);
                this.setAttribute('data-fallback-applied', 'true');
                this.onerror = null;

                const alt = this.alt || 'Image';
                const width = this.width || 800;
                const height = this.height || 450;

                // Use a clean placeholder service
                this.src = `https://placehold.co/${width}x${height}/002147/FDBE11?text=${encodeURIComponent(alt)}`;
            };
        }
    });
    /* =========================================
       10. AI CHATBOT LOGIC (FULL STACK CONNECTED)
       ========================================= */
    const chatToggle = document.getElementById('chat-toggle');
    const closeChat = document.getElementById('close-chat');
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // POINT TO YOUR LOCAL SERVER
    const API_URL = 'http://localhost:3000/api/chat';

    // Load History
    let chatHistory = JSON.parse(localStorage.getItem('bleoo_chat_history')) || [];

    if (chatToggle && chatWindow) {
        // Load old messages
        chatHistory.forEach(msg => addMessageToUI(msg.text, msg.sender));

        const toggleChat = () => {
            if (chatWindow.classList.contains('hidden')) {
                chatWindow.classList.remove('hidden');
                setTimeout(() => chatWindow.classList.remove('translate-y-10', 'opacity-0', 'scale-95'), 10);
            } else {
                chatWindow.classList.add('translate-y-10', 'opacity-0', 'scale-95');
                setTimeout(() => chatWindow.classList.add('hidden'), 300);
            }
        };

        chatToggle.addEventListener('click', toggleChat);
        closeChat.addEventListener('click', toggleChat);

        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;

            // 1. Show User Message
            saveMessage(message, 'user');
            addMessageToUI(message, 'user');
            chatInput.value = '';

            const loadingId = addLoadingIndicator();

            try {
                // 2. SEND TO YOUR BACKEND (Not Google)
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: message,
                        history: chatHistory.slice(-5) // Context
                    })
                });

                const data = await response.json();
                removeMessage(loadingId);

                if (data.error) {
                    addMessageToUI("Server Error: " + data.error, 'bot');
                } else {
                    const botText = data.reply;
                    saveMessage(botText, 'bot');
                    addMessageToUI(botText, 'bot');
                }

            } catch (error) {
                removeMessage(loadingId);
                addMessageToUI("Is the server running? Check terminal.", 'bot');
                console.error('Fetch Error:', error);
            }
        });
    }

    // --- HELPERS ---
    function saveMessage(text, sender) {
        chatHistory.push({ text, sender });
        localStorage.setItem('bleoo_chat_history', JSON.stringify(chatHistory));
    }

    function addMessageToUI(text, sender) {
        const div = document.createElement('div');
        div.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
        const bubble = document.createElement('div');
        bubble.className = sender === 'user'
            ? 'bg-royal text-white rounded-2xl rounded-tr-none p-3 max-w-[85%] text-sm shadow-md'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none p-3 max-w-[85%] text-sm text-gray-700 dark:text-gray-300 shadow-sm';
        bubble.innerText = text;
        div.appendChild(bubble);
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addLoadingIndicator() {
        const id = 'loading-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'flex justify-start';
        div.innerHTML = `<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none p-4 shadow-sm flex gap-1"><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div></div>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
});
