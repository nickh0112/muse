/**
 * MUSE - Luxury Waitlist Landing Page
 * Animations & Interactions
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
        formSubmitDelay: 1500 // Simulated delay for demo
    };

    // ========================================
    // DOM ELEMENTS
    // ========================================
    const elements = {
        nav: document.getElementById('nav'),
        waitlistForm: document.getElementById('waitlist-form'),
        waitlistSuccess: document.getElementById('waitlist-success'),
        revealElements: document.querySelectorAll('.reveal')
    };

    // ========================================
    // NAVIGATION SCROLL EFFECT
    // ========================================
    function initNavScroll() {
        if (!elements.nav) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        function updateNav() {
            const scrollY = window.scrollY;

            if (scrollY > CONFIG.navScrollThreshold) {
                elements.nav.classList.add('scrolled');
            } else {
                elements.nav.classList.remove('scrolled');
            }

            lastScrollY = scrollY;
            ticking = false;
        }

        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(updateNav);
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });

        // Initial check
        updateNav();
    }

    // ========================================
    // SCROLL REVEAL ANIMATIONS
    // ========================================
    function initScrollReveal() {
        if (!elements.revealElements.length) return;

        const observerOptions = {
            threshold: CONFIG.revealThreshold,
            rootMargin: CONFIG.revealRootMargin
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Optionally unobserve after revealing
                    revealObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        elements.revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }

    // ========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');

                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    e.preventDefault();

                    const navHeight = elements.nav ? elements.nav.offsetHeight : 0;
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
    // WAITLIST FORM HANDLING
    // ========================================
    function initWaitlistForm() {
        if (!elements.waitlistForm) return;

        elements.waitlistForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (!isValidEmail(email)) {
                shakeElement(emailInput);
                return;
            }

            // Add loading state
            this.classList.add('loading');

            try {
                // Simulate API call (replace with actual endpoint)
                await simulateSubmit(email);

                // Show success state
                this.classList.add('submitted');
                elements.waitlistSuccess.classList.add('active');

                // Store in localStorage as backup
                saveToLocalStorage(email);

            } catch (error) {
                console.error('Form submission error:', error);
                this.classList.remove('loading');
                // Show error message if needed
            }
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function simulateSubmit(email) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Waitlist signup:', email);
                resolve({ success: true });
            }, CONFIG.formSubmitDelay);
        });
    }

    function saveToLocalStorage(email) {
        try {
            const waitlist = JSON.parse(localStorage.getItem('muse_waitlist') || '[]');
            if (!waitlist.includes(email)) {
                waitlist.push(email);
                localStorage.setItem('muse_waitlist', JSON.stringify(waitlist));
            }
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }

    function shakeElement(element) {
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'shake 0.5s ease';

        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    // Add shake keyframes dynamically
    function addShakeAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // PARALLAX EFFECT (Optional - Subtle)
    // ========================================
    function initParallax() {
        const parallaxElements = document.querySelectorAll('.hero-image img');

        if (!parallaxElements.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        let ticking = false;

        function updateParallax() {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;

            parallaxElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const elementCenter = rect.top + rect.height / 2;
                const viewportCenter = windowHeight / 2;
                const distance = elementCenter - viewportCenter;
                const parallaxAmount = distance * 0.05; // Subtle effect

                element.style.transform = `translateY(${parallaxAmount}px)`;
            });

            ticking = false;
        }

        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // ========================================
    // IMAGE LAZY LOADING
    // ========================================
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        if (!images.length) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // ========================================
    // CURSOR EFFECT (Optional Enhancement)
    // ========================================
    function initCustomCursor() {
        // Only on desktop, skip if user prefers reduced motion
        if (window.matchMedia('(max-width: 1024px)').matches ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.innerHTML = '<div class="cursor-dot"></div>';
        document.body.appendChild(cursor);

        const style = document.createElement('style');
        style.textContent = `
            .custom-cursor {
                position: fixed;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 10000;
                mix-blend-mode: difference;
            }
            .cursor-dot {
                width: 8px;
                height: 8px;
                background: #C4A87C;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: transform 0.15s ease;
            }
            .custom-cursor.hovering .cursor-dot {
                transform: translate(-50%, -50%) scale(2.5);
            }
            body { cursor: none; }
            a, button, input, .product-card { cursor: none; }
        `;
        document.head.appendChild(style);

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function updateCursor() {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            requestAnimationFrame(updateCursor);
        }
        updateCursor();

        // Add hover effect for interactive elements
        const interactiveElements = document.querySelectorAll('a, button, input, .product-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    }

    // ========================================
    // PAGE LOAD ANIMATION TRIGGER
    // ========================================
    function initPageLoad() {
        // Add loaded class to body after a brief delay
        // This triggers CSS animations
        document.body.classList.add('loaded');
    }

    // ========================================
    // INITIALIZE
    // ========================================
    function init() {
        // Add shake animation for form validation
        addShakeAnimation();

        // Initialize all modules
        initNavScroll();
        initScrollReveal();
        initSmoothScroll();
        initWaitlistForm();
        initLazyLoading();
        initParallax();

        // Optional: Custom cursor (comment out if not desired)
        // initCustomCursor();

        // Trigger page load animations
        initPageLoad();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
