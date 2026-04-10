document.addEventListener('DOMContentLoaded', () => {

    // ─────────────────────────────────────────────
    // 01 · LANGUAGE TOGGLE (with localStorage)
    // ─────────────────────────────────────────────
    const langBtn = document.getElementById('lang-toggle');
    const langOpts = langBtn.querySelectorAll('.lang-opt');

    function setLang(lang) {
        // Update the body data attribute (CSS uses this for display toggling)
        document.body.setAttribute('data-lang', lang);

        // Update active state on buttons
        langOpts.forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-target') === lang);
        });

        // Persist preference
        localStorage.setItem('janeLang', lang);
    }

    // Apply saved preference on load (default to 'en')
    const savedLang = localStorage.getItem('janeLang') || 'en';
    setLang(savedLang);

    langBtn.addEventListener('click', (e) => {
        if (e.target.classList.contains('lang-opt')) {
            const targetLang = e.target.getAttribute('data-target');
            // Cross-fade: short opacity dip then back
            document.body.style.transition = 'opacity 200ms ease';
            document.body.style.opacity = '0';
            setTimeout(() => {
                setLang(targetLang);
                document.body.style.opacity = '1';
            }, 200);
        }
    });

    // ─────────────────────────────────────────────
    // 02 · SMOOTH SCROLL FOR NAV LINKS
    // ─────────────────────────────────────────────
    document.querySelectorAll('.nav-links a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ─────────────────────────────────────────────
    // 03 · STAT COUNTER ANIMATION
    // Ease-out easing: counts fast at start, slows to final value
    // ─────────────────────────────────────────────
    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    function animateCounter(el, target, duration) {
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuart(progress);
            const current = Math.round(eased * target);
            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                // Counter complete — show the + suffix and reveal label
                el.textContent = target + '+';
                const label = el.closest('.stat-item')?.querySelector('.stat-label');
                if (label) label.classList.add('is-visible');
            }
        }

        requestAnimationFrame(tick);
    }

    // Observe the stats section — fire counters once when it enters view
    const statsSection = document.querySelector('.hero-stats');
    let statsDone = false;

    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !statsDone) {
                    statsDone = true;
                    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
                        const target = parseInt(el.getAttribute('data-target'), 10);
                        animateCounter(el, target, 1800);
                    });
                    statsObserver.disconnect();
                }
            });
        }, { threshold: 0.4 });

        statsObserver.observe(statsSection);
    }

    // ─────────────────────────────────────────────
    // 04 · INTERSECTION OBSERVER — SHARED SETUP
    // ─────────────────────────────────────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

    // 04-A · NOTEBOOK PAPER SCROLL REVEAL
    document.querySelectorAll('.notebook-paper').forEach(el => revealObserver.observe(el));

    // 04-B · CREDENTIALS LIST STAGGER
    document.querySelectorAll('.credentials-list').forEach(el => revealObserver.observe(el));

    // 04-C · MASK SWEEP CURTAIN REVEALS (section headlines)
    // Slightly tighter threshold — trigger when 20% from bottom viewport
    const headlineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                headlineObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0, rootMargin: '0px 0px -20% 0px' });

    document.querySelectorAll('.mask-sweep').forEach(el => headlineObserver.observe(el));

    // ─────────────────────────────────────────────
    // 05 · GOLD THREAD CURSOR
    // Only visible when hovering dark sections
    // Disabled on touch/mobile devices
    // ─────────────────────────────────────────────
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isTouchDevice && !prefersReducedMotion) {
        const cursor = document.querySelector('.gold-thread-cursor');
        const darkSections = ['#hero', '#coaching', '.awards-section'];

        // Target position (follows mouse immediately)
        let targetX = 0, targetY = 0;
        // Lerped position (60ms delay effect)
        let currentX = 0, currentY = 0;
        let cursorVisible = false;
        let rafId = null;

        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        });

        // Check if cursor is over a dark section
        function isOverDarkSection(x, y) {
            const el = document.elementFromPoint(x, y);
            if (!el) return false;
            return el.closest('#hero') !== null ||
                   el.closest('#coaching') !== null ||
                   el.closest('.alt-bg') !== null;
        }

        function animateCursor() {
            // Lerp factor — lower = more delay (smoother trail)
            const lerpFactor = 0.08;
            currentX += (targetX - currentX) * lerpFactor;
            currentY += (targetY - currentY) * lerpFactor;

            const overDark = isOverDarkSection(Math.round(currentX), Math.round(currentY));

            if (overDark && !cursorVisible) {
                cursor.style.opacity = '0.85';
                cursorVisible = true;
            } else if (!overDark && cursorVisible) {
                cursor.style.opacity = '0';
                cursorVisible = false;
            }

            cursor.style.transform = `translate(${currentX - 3}px, ${currentY - 3}px)`;
            rafId = requestAnimationFrame(animateCursor);
        }

        animateCursor();
    }

    // ─────────────────────────────────────────────
    // 06 · AUDIO PANEL SCAFFOLDING (ready for assets)
    // When a panel has a valid src on its <audio>, play it on hover
    // ─────────────────────────────────────────────
    document.querySelectorAll('.panel').forEach(panel => {
        const audio = panel.querySelector('.panel-audio');
        if (!audio) return;

        let fadeInterval = null;

        function fadeIn(audio, duration) {
            audio.volume = 0;
            audio.play().catch(() => {
                // Autoplay blocked — show fallback play button
                panel.classList.add('show-play-fallback');
            });
            const step = 1 / (duration / 50);
            clearInterval(fadeInterval);
            fadeInterval = setInterval(() => {
                audio.volume = Math.min(1, audio.volume + step);
                if (audio.volume >= 1) clearInterval(fadeInterval);
            }, 50);
        }

        function fadeOut(audio, duration) {
            const step = 1 / (duration / 50);
            clearInterval(fadeInterval);
            fadeInterval = setInterval(() => {
                audio.volume = Math.max(0, audio.volume - step);
                if (audio.volume <= 0) {
                    audio.pause();
                    audio.currentTime = 0;
                    clearInterval(fadeInterval);
                }
            }, 50);
        }

        panel.addEventListener('mouseenter', () => {
            if (audio.src && audio.src !== window.location.href) {
                fadeIn(audio, 400);
            }
        });

        panel.addEventListener('mouseleave', () => {
            if (!audio.paused) {
                fadeOut(audio, 600);
            }
        });
    });

});
