/* ============================================================= */
/*  js/script.js – SENIOR DEV MODE: CLEAN & CONFLICT-FREE        */
/* ============================================================= */

/* ============================================ */
/*    LEADERSHIP DATA (S.O.T)                    */
/* ============================================ */
const leaderData = [
    {
        name: "Mr. Eric Ebo Sey",
        role: "Headmaster",
        img: "./assets/headmaster.jpg",
        msg: "Accra Academy, established in 1931, is a distinguished educational institution in Accra, Ghana, boasting 226 staff and a student body of 4,381. Evolving from a private institution to a Government-Assisted School in 1950, we prioritize academic excellence, personal growth, and character development. Join us in nurturing future leaders who excel academically and impact the world positively."
    },
    {
        name: "Mr. Paul Kofi Yesu Dadzie",
        role: "Assistant Headmaster (Administration)",
        img: "./assets/administration.jpg",
        msg: "Greetings from Accra Academy! As the Assistant Headmaster Administration, I extend a warm welcome to our esteemed community. At the heart of our institution is a commitment to efficient and supportive administration, ensuring a seamless experience for students and staff alike. From admissions to facilities management, our dedicated team strives for excellence."
    },
    {
        name: "Mr. Isaac Tweneboah",
        role: "Assistant Headmaster (Academic)",
        img: "./assets/academics.jpg",
        msg: "Welcome to Accra Academy! As the Assistant Headmaster Academic, I am thrilled to embark on this educational journey with you. Our commitment to academic excellence is unwavering, and we strive to create an environment that nurtures not only knowledge but also critical thinking and personal growth. Explore our diverse academic programs where innovation meets tradition."
    },
    {
        name: "Mr. William Kwame Asun",
        role: "Assistant Headmaster (Domestic/Welfare)",
        img: "./assets/domestic.jpg",
        msg: "I am honored to welcome you as the Assistant Headmaster Domestic/Welfare. Our focus extends beyond the classroom, ensuring a supportive and nurturing environment for every student. From dormitory life to overall well-being, we prioritize the domestic and welfare aspects of your experience. Thank you for being part of the Accra Academy family."
    }
];

/* ----------------------------------------------------------
   LEADERSHIP ENGINE (COMPLETELY FIXED)
---------------------------------------------------------- */
(function () {
    let currentIdx = 0;
    const getEl = (id) => document.getElementById(id);

    // Main section update
    function switchLeader(idx) {
        if (idx < 0 || idx >= leaderData.length) return;
        currentIdx = idx;
        const data = leaderData[idx];

        const nameEl = getEl('main-leader-name');
        const roleEl = getEl('main-leader-role');
        const msgEl = getEl('main-leader-msg');
        const img = getEl('main-leader-img');
        const area = getEl('leader-content-area');

        if (nameEl) nameEl.textContent = data.name;
        if (roleEl) roleEl.textContent = data.role;
        if (msgEl) msgEl.textContent = data.msg;

        if (img) {
            img.style.opacity = '0';
            setTimeout(() => {
                img.src = data.img;
                img.style.opacity = '1';
            }, 200);
        }

        if (area) {
            area.style.opacity = '0';
            setTimeout(() => area.style.opacity = '1', 100);
        }

        renderMainThumbnails();
    }

    // Modal update - SEPARATE function to avoid confusion
    function switchModalLeader(idx) {
        if (idx < 0 || idx >= leaderData.length) return;
        currentIdx = idx; // Keep sync with main

        const data = leaderData[idx];
        const img = getEl('modal-img');
        const name = getEl('modal-name');
        const role = getEl('modal-role');
        const msg = getEl('modal-msg');

        // Animate out
        if (img) img.style.opacity = '0';
        if (name) name.style.opacity = '0';
        if (msg) msg.style.opacity = '0';

        setTimeout(() => {
            if (img) {
                img.src = data.img;
                img.style.opacity = '1';
            }
            if (name) {
                name.textContent = data.name;
                name.style.opacity = '1';
            }
            if (role) role.textContent = data.role;
            if (msg) {
                msg.textContent = data.msg;
                msg.style.opacity = '1';
            }
            renderModalThumbnails(); // Re-render with new active state
        }, 200);
    }

    function renderMainThumbnails() {
        const container = getEl('main-leader-thumbnails');
        if (!container) return;

        container.innerHTML = '';
        leaderData.forEach((leader, i) => {
            const btn = document.createElement('button');
            btn.className = `w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${i === currentIdx
                ? 'border-gold opacity-100 scale-110 shadow-[0_0_10px_rgba(253,190,17,0.5)]'
                : 'border-white/20 opacity-50 hover:opacity-80'
                }`;
            btn.innerHTML = `<img src="${leader.img}" alt="${leader.name}" class="w-full h-full object-cover pointer-events-none">`;
            btn.onclick = (e) => {
                e.stopPropagation();
                switchLeader(i);
            };
            container.appendChild(btn);
        });
    }

    function renderModalThumbnails() {
        const container = getEl('modal-thumbnails');
        if (!container) return;

        container.innerHTML = '';
        leaderData.forEach((leader, i) => {
            const btn = document.createElement('button');
            btn.className = `w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${i === currentIdx
                ? 'border-gold opacity-100 scale-110 shadow-[0_0_10px_rgba(253,190,17,0.5)]'
                : 'border-white/20 opacity-50 hover:opacity-80'
                }`;
            btn.innerHTML = `<img src="${leader.img}" alt="${leader.name}" class="w-full h-full object-cover pointer-events-none">`;

            // CRITICAL: Explicit onclick with stopPropagation
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Switching to leader ${i}: ${leader.name}`);
                switchModalLeader(i);
                return false;
            };

            container.appendChild(btn);
        });
    }

    function openModal(idx) {
        const modal = getEl('leader-modal');
        if (!modal) return;

        currentIdx = idx;
        switchModalLeader(idx); // Initial render

        modal.classList.add('active');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        const modal = getEl('leader-modal');
        if (modal) modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';

        // Sync main view with modal selection
        switchLeader(currentIdx);
    }

    // Expose globals
    window.openLeaderModal = openModal;
    window.closeLeaderModal = closeModal;

    // Init
    document.addEventListener('DOMContentLoaded', () => {
        switchLeader(0);

        // Main view button
        const mainBtn = getEl('main-leader-btn');
        if (mainBtn) {
            mainBtn.onclick = () => openModal(currentIdx);
        }

        // Modal backdrop click to close
        const modal = getEl('leader-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
    });
}());

document.addEventListener('DOMContentLoaded', () => {
    // SENIOR DEV: Initialization Log
    console.log('%c 🔧 DOMContentLoaded: Initializing Scripts... ', 'background: #002147; color: #FDBE11; font-weight: bold;');

    /* =========================================
       0. MOBILE MENU TOGGLE (REFINED)
       ========================================= */
    const mobileBtn = document.getElementById('mobile-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                // OPEN MENU
                mobileMenu.classList.remove('hidden');
                mobileBtn.innerHTML = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
            } else {
                // CLOSE MENU
                mobileMenu.classList.add('hidden');
                mobileBtn.innerHTML = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>';
            }
        });

        // Close menu when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileBtn.innerHTML = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>';
            });
        });
    }

    /* =========================================
       2. 3D TILT EFFECT FOR CARDS
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
       3. GALLERY SWIPER (PANORAMIC CONFIG)
       ========================================= */
    if (document.querySelector('.mySwiper')) {
        if (typeof Swiper === 'undefined') {
            console.error('❌ Swiper JS not detected. Gallery will not work.');
        } else {
            var swiper = new Swiper(".mySwiper", {
                // 'auto' allows CSS to determine width (critical for the stretched look)
                slidesPerView: "auto",
                centeredSlides: true,
                spaceBetween: 24, // More breathing room between slides
                loop: true,
                grabCursor: true,
                speed: 800, // Smoother, slower transition
                autoplay: {
                    delay: 4000,
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
                // Breakpoints are handled by CSS width, but we add safety here
                breakpoints: {
                    640: {
                        spaceBetween: 20
                    },
                    1024: {
                        spaceBetween: 40
                    },
                },
            });
            console.log('✅ Swiper Initialized (Panoramic Mode)');
        }
    }

    /* =========================================
       4. ABOUT PAGE CAROUSEL (MANUAL)
       ========================================= */
    const slides = document.querySelectorAll('.carousel-item');
    if (slides.length > 0) {
        let slideIndex = 0;
        showSlides(slideIndex);

        window.plusSlides = function (n) {
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
        scrollBtn.addEventListener('click', () => window.scrollTo({
            top: 0,
            behavior: 'smooth'
        }));
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

                if (typeof confetti === 'function') {
                    const end = Date.now() + 3000;
                    (function frame() {
                        confetti({
                            particleCount: 8,
                            spread: 70,
                            origin: {
                                y: 0.8
                            },
                            colors: ['#002147', '#FDBE11']
                        });
                        if (Date.now() < end) requestAnimationFrame(frame);
                    }());
                }
            }
        });

        crest.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (clicks < 5) clicks = 0;
                crest.style.transform = '';
            }, 2000);
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
            img.onerror = function () {
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

    /* =================================================================
       10. AI CHATBOT LOGIC (VOICE, CHIPS, & MEMORY ENABLED)
       ================================================================= */

    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const voiceBtn = document.getElementById('voice-btn');

    // Config
    const API_URL = '/api/chat';
    let chatHistory = JSON.parse(localStorage.getItem('bleoo_chat_history')) || [];

    // Voice Setup (Web Speech)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-GB'; // Ghanaian/British English
        recognition.onstart = () => {
            if (voiceBtn) voiceBtn.classList.add('text-red-500', 'animate-pulse');
            chatInput.placeholder = "Listening...";
        };
        recognition.onend = () => {
            if (voiceBtn) voiceBtn.classList.remove('text-red-500', 'animate-pulse');
            chatInput.placeholder = "Type message...";
        };
        recognition.onresult = e => {
            chatInput.value = e.results[0][0].transcript;
            chatForm.dispatchEvent(new Event('submit'));
        };
        if (voiceBtn) voiceBtn.onclick = () => recognition.start();
    } else if (voiceBtn) {
        voiceBtn.style.display = 'none';
    }

    // TTS Setup (StreamElements - High Quality)
    function speak(text) {
        if (window.currAudio) window.currAudio.pause();
        const clean = text.replace(/[*#]/g, '').trim();
        if (!clean) return;
        window.currAudio = new Audio(`https://api.streamelements.com/kappa/v2/speech?voice=Amy&text=${encodeURIComponent(clean)}`);
        window.currAudio.play().catch(() => { });
    }

    if (chatToggle && chatWindow) {
        // Load History
        chatHistory.forEach(m => addMsg(m.text, m.sender));

        chatToggle.onclick = () => {
            chatWindow.classList.remove('hidden');
            setTimeout(() => chatWindow.classList.toggle('opacity-0'), 10);
            setTimeout(() => chatWindow.classList.toggle('translate-y-10'), 10);
        };
        document.getElementById('close-chat').onclick = () => {
            chatWindow.classList.add('opacity-0', 'translate-y-10');
            setTimeout(() => chatWindow.classList.add('hidden'), 300);
        };

        // Chips
        document.querySelectorAll('.chip-btn').forEach(btn => {
            btn.onclick = () => {
                chatInput.value = btn.innerText;
                chatForm.dispatchEvent(new Event('submit'));
            };
        });

        chatForm.onsubmit = async e => {
            e.preventDefault();
            const msg = chatInput.value.trim();
            if (!msg) return;

            addMsg(msg, 'user');
            chatHistory.push({
                text: msg,
                sender: 'user'
            });
            localStorage.setItem('bleoo_chat_history', JSON.stringify(chatHistory));
            chatInput.value = '';

            const loadId = addLoader();

            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: msg,
                        history: chatHistory.slice(-5)
                    })
                });
                const data = await res.json();
                document.getElementById(loadId).remove();

                const reply = data.reply || "I'm sorry, I'm experiencing some technical difficulties. Please try again later.";
                addMsg(reply, 'bot');
                chatHistory.push({
                    text: reply,
                    sender: 'bot'
                });
                localStorage.setItem('bleoo_chat_history', JSON.stringify(chatHistory));

                // Speak if voice was used or anthem requested
                if (msg.toLowerCase().includes('anthem') || recognition) speak(reply);

            } catch (err) {
                document.getElementById(loadId).remove();
                addMsg("Connection Failed", 'bot');
            }
        };
    }

    function addMsg(text, sender) {
        const d = document.createElement('div');
        d.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`;
        d.innerHTML = `<div class="${sender === 'user' ? 'bg-royal text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'} p-3 rounded-2xl max-w-[85%] text-sm shadow-sm">${text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</div>`;
        chatMessages.appendChild(d);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addLoader() {
        const id = 'l-' + Date.now();
        const d = document.createElement('div');
        d.id = id;
        d.innerHTML = `<div class="flex gap-1 p-4 bg-white dark:bg-gray-800 rounded-2xl w-fit"><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0.2s"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0.4s"></div></div>`;
        chatMessages.appendChild(d);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }

    /* --- LIVE ANNOUNCEMENTS --- */
    const bar = document.getElementById('announcement-bar');
    const text = document.getElementById('announcement-text');

    if (bar && text) {
        fetch('/api/announcement')
            .then(res => res.json())
            .then(data => {
                if (data.text) {
                    text.innerText = data.text;
                    bar.classList.remove('hidden');
                }
            })
            .catch(e => console.log("Announcement Error:", e));

        window.closeAnnouncement = () => bar.style.display = 'none';
    }

    /* =========================================
       12. SMART AUDIO AUTOPLAY & TOGGLE
       ========================================= */
    const audio = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle');
    const barsIcon = document.getElementById('music-bars');
    const offIcon = document.getElementById('music-off');

    if (audio && musicBtn) {
        audio.volume = 0.3;
        let isPlaying = false;

        function setMusicUI(playing) {
            isPlaying = playing;
            if (barsIcon) barsIcon.style.display = playing ? 'flex' : 'none';
            if (offIcon) offIcon.style.display = playing ? 'none' : 'block';
            musicBtn.style.borderColor = playing ? '#FDBE11' : 'rgba(253,190,17,0.3)';
        }

        // Start paused by default
        setMusicUI(false);

        // Button click: toggle play/pause
        musicBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isPlaying) {
                audio.pause();
                setMusicUI(false);
            } else {
                audio.play().then(() => setMusicUI(true)).catch(err => console.warn('Audio play failed:', err));
            }
        });

        // Auto-start on first user scroll/click (browser policy)
        function tryAutoPlay(e) {
            if (isPlaying) return;
            if (e && (e.target === musicBtn || musicBtn.contains(e.target))) return;
            audio.play().then(() => { setMusicUI(true); }).catch(() => { });
        }
        document.addEventListener('scroll', tryAutoPlay, { once: true });
        document.addEventListener('click', tryAutoPlay);
    }

}); // END OF DOMContentLoaded
