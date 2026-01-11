/**
 * MUSE - Luxury Waitlist Landing Page
 * Phase 1: Enhanced Animations & Interactions
 */

(function() {
    'use strict';

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        navScrollThreshold: 50,
        revealThreshold: 0.15,
        revealRootMargin: '0px 0px -50px 0px',
        formSubmitDelay: 1500,
        cursorLerp: 0.12,
        tiltMaxAngle: 8,
        tiltPerspective: 1000
    };

    // ========================================
    // CUSTOM CURSOR
    // ========================================
    function initCustomCursor() {
        // Only on desktop, respect reduced motion
        if (window.matchMedia('(max-width: 1024px)').matches ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        // Create cursor elements
        const cursor = document.createElement('div');
        cursor.className = 'cursor';
        cursor.innerHTML = `
            <div class="cursor-dot"></div>
            <div class="cursor-ring"></div>
        `;
        document.body.appendChild(cursor);

        const dot = cursor.querySelector('.cursor-dot');
        const ring = cursor.querySelector('.cursor-ring');

        let mouseX = 0, mouseY = 0;
        let dotX = 0, dotY = 0;
        let ringX = 0, ringY = 0;

        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth cursor follow with lerp
        function updateCursor() {
            // Dot follows faster
            dotX += (mouseX - dotX) * 0.2;
            dotY += (mouseY - dotY) * 0.2;
            dot.style.transform = `translate(${dotX}px, ${dotY}px)`;

            // Ring follows slower for trailing effect
            ringX += (mouseX - ringX) * CONFIG.cursorLerp;
            ringY += (mouseY - ringY) * CONFIG.cursorLerp;
            ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

            requestAnimationFrame(updateCursor);
        }
        updateCursor();

        // Hover states for interactive elements
        const interactiveElements = document.querySelectorAll('a, button, input, .product-card, .btn');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovering');
            });
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
        });

        // Click effect
        document.addEventListener('mousedown', () => {
            cursor.classList.add('clicking');
        });
        document.addEventListener('mouseup', () => {
            cursor.classList.remove('clicking');
        });
    }

    // ========================================
    // 3D TILT EFFECT FOR PRODUCT CARDS
    // ========================================
    function initProductTilt() {
        const cards = document.querySelectorAll('.product-card');

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        cards.forEach(card => {
            const image = card.querySelector('.product-image');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -CONFIG.tiltMaxAngle;
                const rotateY = ((x - centerX) / centerX) * CONFIG.tiltMaxAngle;

                card.style.transform = `
                    perspective(${CONFIG.tiltPerspective}px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    translateZ(10px)
                `;

                // Shine effect
                if (image) {
                    const shine = (x / rect.width) * 100;
                    image.style.setProperty('--shine-x', `${shine}%`);
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
                if (image) {
                    image.style.setProperty('--shine-x', '50%');
                }
            });
        });
    }

    // ========================================
    // WAITLIST COUNTER
    // ========================================
    function initWaitlistCounter() {
        const counterEl = document.getElementById('waitlist-counter');
        if (!counterEl) return;

        const countEl = counterEl.querySelector('.counter-number');
        if (!countEl) return;

        // Start with a base number (simulated)
        let currentCount = 2847;

        // Animate counting up from 0
        function animateCount(target, duration = 2000) {
            const start = 0;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function (ease-out)
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(start + (target - start) * easeOut);

                countEl.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }

            requestAnimationFrame(update);
        }

        // Observe when counter comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCount(currentCount);
                    observer.unobserve(entry.target);

                    // Occasionally increment (simulated activity)
                    setInterval(() => {
                        if (Math.random() > 0.7) {
                            currentCount += Math.floor(Math.random() * 3) + 1;
                            countEl.textContent = currentCount.toLocaleString();
                            countEl.classList.add('pulse');
                            setTimeout(() => countEl.classList.remove('pulse'), 300);
                        }
                    }, 5000);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(counterEl);
    }

    // ========================================
    // ENHANCED SCROLL REVEAL
    // ========================================
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal, [data-reveal]');

        if (!revealElements.length) return;

        const observerOptions = {
            threshold: CONFIG.revealThreshold,
            rootMargin: CONFIG.revealRootMargin
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add staggered delay based on data attribute or index
                    const delay = entry.target.dataset.revealDelay || 0;

                    setTimeout(() => {
                        entry.target.classList.add('active');
                    }, delay);

                    revealObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach((element, index) => {
            // Auto-assign stagger delays to child reveals
            if (element.classList.contains('stagger-children')) {
                const children = element.querySelectorAll('.reveal');
                children.forEach((child, i) => {
                    child.dataset.revealDelay = i * 100;
                });
            }
            revealObserver.observe(element);
        });
    }

    // ========================================
    // SPLIT TEXT ANIMATION
    // ========================================
    function initSplitText() {
        const splitElements = document.querySelectorAll('[data-split-text]');

        splitElements.forEach(element => {
            const text = element.textContent;
            const words = text.split(' ');

            element.innerHTML = words.map((word, i) =>
                `<span class="word" style="--word-index: ${i}">
                    <span class="word-inner">${word}</span>
                </span>`
            ).join(' ');
        });
    }

    // ========================================
    // NAVIGATION SCROLL EFFECT
    // ========================================
    function initNavScroll() {
        const nav = document.getElementById('nav');
        if (!nav) return;

        let ticking = false;

        function updateNav() {
            const scrollY = window.scrollY;

            if (scrollY > CONFIG.navScrollThreshold) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNav);
                ticking = true;
            }
        }, { passive: true });

        updateNav();
    }

    // ========================================
    // SMOOTH SCROLL
    // ========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();

                    const nav = document.getElementById('nav');
                    const navHeight = nav ? nav.offsetHeight : 0;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ========================================
    // WAITLIST FORM
    // ========================================
    function initWaitlistForm() {
        const form = document.getElementById('waitlist-form');
        const success = document.getElementById('waitlist-success');

        if (!form) return;

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (!isValidEmail(email)) {
                emailInput.classList.add('shake');
                setTimeout(() => emailInput.classList.remove('shake'), 500);
                return;
            }

            this.classList.add('loading');

            try {
                await new Promise(resolve => setTimeout(resolve, CONFIG.formSubmitDelay));

                this.classList.add('submitted');
                if (success) success.classList.add('active');

                // Store email
                try {
                    const waitlist = JSON.parse(localStorage.getItem('muse_waitlist') || '[]');
                    if (!waitlist.includes(email)) {
                        waitlist.push(email);
                        localStorage.setItem('muse_waitlist', JSON.stringify(waitlist));
                    }
                } catch (e) {}

            } catch (error) {
                this.classList.remove('loading');
            }
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ========================================
    // MAGNETIC BUTTONS
    // ========================================
    function initMagneticButtons() {
        const buttons = document.querySelectorAll('.btn, .nav-cta');

        if (window.matchMedia('(max-width: 1024px)').matches ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ========================================
    // PARALLAX ON SCROLL
    // ========================================
    function initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');

        if (!parallaxElements.length ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        let ticking = false;

        function updateParallax() {
            const scrollY = window.scrollY;

            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.parallax) || 0.1;
                const rect = el.getBoundingClientRect();
                const offsetTop = rect.top + scrollY;
                const yPos = (scrollY - offsetTop) * speed;

                el.style.transform = `translateY(${yPos}px)`;
            });

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    // ========================================
    // ADD DYNAMIC STYLES
    // ========================================
    function addDynamicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Custom Cursor */
            .cursor {
                position: fixed;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 10000;
                transition: opacity 0.3s ease;
            }
            .cursor-dot {
                position: absolute;
                width: 6px;
                height: 6px;
                background: #C4A87C;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: width 0.2s ease, height 0.2s ease, background 0.2s ease;
            }
            .cursor-ring {
                position: absolute;
                width: 36px;
                height: 36px;
                border: 1px solid rgba(196, 168, 124, 0.5);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease;
            }
            .cursor.hovering .cursor-dot {
                width: 10px;
                height: 10px;
                background: #C4A87C;
            }
            .cursor.hovering .cursor-ring {
                width: 50px;
                height: 50px;
                border-color: rgba(196, 168, 124, 0.8);
            }
            .cursor.clicking .cursor-ring {
                width: 30px;
                height: 30px;
            }
            body { cursor: none; }
            a, button, input, .product-card, .btn { cursor: none; }

            /* Counter pulse */
            .counter-number.pulse {
                animation: counterPulse 0.3s ease;
            }
            @keyframes counterPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); color: #C4A87C; }
            }

            /* Input shake */
            .shake {
                animation: shake 0.5s ease;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }

            /* Split text animation */
            .word {
                display: inline-block;
                overflow: hidden;
            }
            .word-inner {
                display: inline-block;
                transform: translateY(100%);
                animation: wordReveal 0.6s ease forwards;
                animation-delay: calc(var(--word-index) * 0.05s);
            }
            @keyframes wordReveal {
                to { transform: translateY(0); }
            }

            /* Product card 3D styles */
            .product-card {
                transform-style: preserve-3d;
                transition: transform 0.1s ease-out, box-shadow 0.3s ease;
            }
            .product-image {
                position: relative;
                overflow: hidden;
            }
            .product-image::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(
                    115deg,
                    transparent 0%,
                    transparent 25%,
                    rgba(255,255,255,0.1) 45%,
                    rgba(255,255,255,0.2) 50%,
                    rgba(255,255,255,0.1) 55%,
                    transparent 75%,
                    transparent 100%
                );
                background-size: 200% 200%;
                background-position: var(--shine-x, 50%) 50%;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .product-card:hover .product-image::after {
                opacity: 1;
            }

            /* Responsive: disable custom cursor on touch */
            @media (max-width: 1024px) {
                .cursor { display: none !important; }
                body, a, button, input, .product-card, .btn { cursor: auto !important; }
            }

            @media (prefers-reduced-motion: reduce) {
                .cursor { display: none !important; }
                body, a, button, input, .product-card, .btn { cursor: auto !important; }
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // INITIALIZE
    // ========================================
    function init() {
        addDynamicStyles();
        initCustomCursor();
        initProductTilt();
        initWaitlistCounter();
        initScrollReveal();
        initNavScroll();
        initSmoothScroll();
        initWaitlistForm();
        initMagneticButtons();
        initParallax();

        document.body.classList.add('loaded');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
