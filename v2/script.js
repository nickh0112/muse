/* =========================================
   MUSE v2 - JavaScript (structured.money clone)
   ========================================= */

(function() {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* =========================================
       Expandable Cards
       ========================================= */
    function initCards() {
        const cards = document.querySelectorAll('[data-card]');

        cards.forEach(card => {
            const toggle = card.querySelector('.c-item-card__toggle');

            // Click on entire card or toggle
            card.addEventListener('click', () => {
                const isOpen = card.classList.contains('is-open');

                // Close all cards
                cards.forEach(c => {
                    c.classList.remove('is-open');
                    const t = c.querySelector('.c-item-card__toggle');
                    if (t) t.setAttribute('aria-expanded', 'false');
                });

                // Open clicked card if it wasn't already open
                if (!isOpen) {
                    card.classList.add('is-open');
                    if (toggle) toggle.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    /* =========================================
       Hero Background Carousel
       ========================================= */
    function initHeroCarousel() {
        const carousel = document.querySelector('.c-hero__bg-carousel');
        if (!carousel) return;

        const slides = carousel.querySelectorAll('.c-hero__bg-slide');
        if (slides.length <= 1) return;

        let currentIndex = 0;
        const interval = 5000;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            showSlide(currentIndex);
        }

        if (!prefersReducedMotion) {
            setInterval(nextSlide, interval);
        }
    }

    /* =========================================
       CTA Background Carousel
       ========================================= */
    function initCtaCarousel() {
        const carousel = document.querySelector('.c-cta__bg-carousel');
        if (!carousel) return;

        const slides = carousel.querySelectorAll('.c-cta__bg-slide');
        if (slides.length <= 1) return;

        let currentIndex = 0;
        const interval = 6000;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            showSlide(currentIndex);
        }

        if (!prefersReducedMotion) {
            setInterval(nextSlide, interval);
        }
    }

    /* =========================================
       Counter Animation
       ========================================= */
    function initCounterAnimation() {
        const counter = document.querySelector('[data-count]');
        if (!counter) return;

        const target = parseInt(counter.dataset.count, 10);
        let hasAnimated = false;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    animateCounter(counter, target);
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(counter);
    }

    function animateCounter(element, target) {
        if (prefersReducedMotion) {
            element.textContent = target.toLocaleString();
            return;
        }

        const duration = 2000;
        const startTime = performance.now();

        function easeOutQuart(t) {
            return 1 - Math.pow(1 - t, 4);
        }

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);
            const current = Math.round(target * easedProgress);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    /* =========================================
       Waitlist Form
       ========================================= */
    function initWaitlistForm() {
        const form = document.getElementById('waitlist-form');
        if (!form) return;

        const input = form.querySelector('.c-cta__input');
        const button = form.querySelector('.c-button');
        const success = document.querySelector('.c-cta__success');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = input.value.trim();
            if (!email || !isValidEmail(email)) {
                input.focus();
                return;
            }

            // Loading state
            button.classList.add('is-loading');
            button.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Store in localStorage
            const waitlist = JSON.parse(localStorage.getItem('muse_waitlist') || '[]');
            if (!waitlist.includes(email)) {
                waitlist.push(email);
                localStorage.setItem('muse_waitlist', JSON.stringify(waitlist));
            }

            // Show success
            form.hidden = true;
            if (success) success.hidden = false;

            // Reset button state
            button.classList.remove('is-loading');
            button.disabled = false;
        });

        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
    }

    /* =========================================
       Footer Parallax
       ========================================= */
    function initFooterParallax() {
        if (prefersReducedMotion) return;

        const wordmark = document.querySelector('.c-footer__wordmark');
        const footer = document.querySelector('.c-footer');
        if (!wordmark || !footer) return;

        let ticking = false;

        function updateParallax() {
            const rect = footer.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top < windowHeight && rect.bottom > 0) {
                const progress = 1 - (rect.top / windowHeight);
                const translateY = Math.min(progress * 80, 60);
                wordmark.style.transform = `translate(-50%, calc(-50% + ${translateY}px))`;
            }

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    /* =========================================
       Smooth Scroll
       ========================================= */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();

                const offset = 100; // Account for fixed nav
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            });
        });
    }

    /* =========================================
       Initialize
       ========================================= */
    function init() {
        initCards();
        initHeroCarousel();
        initCtaCarousel();
        initCounterAnimation();
        initWaitlistForm();
        initFooterParallax();
        initSmoothScroll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
