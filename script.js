// ─────────────────────────────────────────────
// Jane Santos Brand Page — Interaction Engine
// ─────────────────────────────────────────────

(function () {
    'use strict';

    // ─── 01 · LANGUAGE TOGGLE ────────────────────────────────────────────────
    try {
        var langBtn = document.getElementById('lang-toggle');
        var langOpts = langBtn ? langBtn.querySelectorAll('.lang-opt') : [];

        function setLang(lang) {
            document.body.setAttribute('data-lang', lang);
            langOpts.forEach(function (opt) {
                opt.classList.toggle('active', opt.getAttribute('data-target') === lang);
            });
            try { localStorage.setItem('janeLang', lang); } catch (e) { /* private browsing */ }
        }

        // Apply saved preference (default: 'en')
        var savedLang = 'en';
        try { savedLang = localStorage.getItem('janeLang') || 'en'; } catch (e) {}
        setLang(savedLang);

        if (langBtn) {
            langBtn.addEventListener('click', function (e) {
                var opt = e.target.closest('.lang-opt');
                if (!opt) return;
                var targetLang = opt.getAttribute('data-target');
                // Cross-fade
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 200ms ease';
                setTimeout(function () {
                    setLang(targetLang);
                    document.body.style.opacity = '1';
                }, 200);
            });
        }
    } catch (e) {
        console.warn('[Jane] Language toggle error:', e);
        // Ensure we at least set default lang so content is visible
        try { document.body.setAttribute('data-lang', 'en'); } catch (_) {}
    }

    // ─── 02 · SMOOTH SCROLL ──────────────────────────────────────────────────
    try {
        document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    } catch (e) { console.warn('[Jane] Smooth scroll error:', e); }

    // ─── 03 · STAT COUNTERS ──────────────────────────────────────────────────
    var statsDone = false;

    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    function animateCounter(el, target, duration) {
        var start = null;
        function tick(timestamp) {
            if (!start) start = timestamp;
            var elapsed = timestamp - start;
            var progress = Math.min(elapsed / duration, 1);
            var value = Math.round(easeOutQuart(progress) * target);
            el.textContent = value;
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = target + '+';
                var label = el.closest('.stat-item');
                if (label) {
                    var statLabel = label.querySelector('.stat-label');
                    if (statLabel) statLabel.classList.add('is-visible');
                }
            }
        }
        requestAnimationFrame(tick);
    }

    function runCounters() {
        if (statsDone) return;
        statsDone = true;
        // Run counters on ALL stat numbers (both lang versions, harmless)
        document.querySelectorAll('.stat-number[data-target]').forEach(function (el) {
            var target = parseInt(el.getAttribute('data-target'), 10);
            if (!isNaN(target)) animateCounter(el, target, 1800);
        });
    }

    try {
        var statsEl = document.querySelector('.hero-stats');
        if (statsEl) {
            // Try IntersectionObserver first
            if ('IntersectionObserver' in window) {
                var statsObs = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            runCounters();
                            statsObs.disconnect();
                        }
                    });
                }, { threshold: 0.1 }); // Low threshold — fires as soon as 10% visible
                statsObs.observe(statsEl);
            }
            // Fallback: also fire after 800ms regardless (catches already-visible case)
            setTimeout(runCounters, 800);
        }
    } catch (e) {
        console.warn('[Jane] Counter error:', e);
        setTimeout(runCounters, 800); // Last resort fallback
    }

    // ─── 04 · SCROLL REVEALS ─────────────────────────────────────────────────
    try {
        if ('IntersectionObserver' in window) {

            // Notebook paper + credentials
            var revealObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        revealObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            document.querySelectorAll('.notebook-paper, .credentials-list').forEach(function (el) {
                revealObs.observe(el);
            });

            // Headline curtain sweeps (slightly earlier trigger)
            var headlineObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        headlineObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });

            document.querySelectorAll('.mask-sweep').forEach(function (el) {
                headlineObs.observe(el);
            });
        } else {
            // No IntersectionObserver — just show everything
            document.querySelectorAll('.notebook-paper, .credentials-list, .mask-sweep')
                .forEach(function (el) { el.classList.add('is-visible'); });
        }
    } catch (e) { console.warn('[Jane] Scroll reveal error:', e); }

    // ─── 05 · GOLD THREAD CURSOR ─────────────────────────────────────────────
    try {
        var cursor = document.querySelector('.gold-thread-cursor');
        var isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (cursor && !isTouch && !reducedMotion) {
            var tx = 0, ty = 0;   // target (mouse position)
            var cx = 0, cy = 0;   // current (lerped)
            var cursorOn = false;

            document.addEventListener('mousemove', function (e) {
                tx = e.clientX;
                ty = e.clientY;
            });

            function isOverDark(x, y) {
                var el = document.elementFromPoint(x, y);
                if (!el) return false;
                return !!(el.closest('#hero') || el.closest('#coaching'));
            }

            function tickCursor() {
                cx += (tx - cx) * 0.08;
                cy += (ty - cy) * 0.08;

                var dark = isOverDark(Math.round(cx), Math.round(cy));
                if (dark !== cursorOn) {
                    cursor.style.opacity = dark ? '0.85' : '0';
                    cursorOn = dark;
                }
                cursor.style.transform = 'translate(' + (cx - 3) + 'px, ' + (cy - 3) + 'px)';
                requestAnimationFrame(tickCursor);
            }
            tickCursor();
        }
    } catch (e) { console.warn('[Jane] Cursor error:', e); }

    // ─── 06 · AUDIO SCAFFOLDING ──────────────────────────────────────────────
    // Wired and ready — no-ops until src is set on .panel-audio elements
    try {
        document.querySelectorAll('.panel').forEach(function (panel) {
            var audio = panel.querySelector('.panel-audio');
            if (!audio) return;

            var fadeTimer = null;

            function fadeAudioIn(a, durationMs) {
                a.volume = 0;
                a.play().catch(function () {
                    panel.classList.add('show-play-fallback');
                });
                var steps = durationMs / 50;
                var step = 1 / steps;
                clearInterval(fadeTimer);
                fadeTimer = setInterval(function () {
                    a.volume = Math.min(1, a.volume + step);
                    if (a.volume >= 1) clearInterval(fadeTimer);
                }, 50);
            }

            function fadeAudioOut(a, durationMs) {
                var steps = durationMs / 50;
                var step = 1 / steps;
                clearInterval(fadeTimer);
                fadeTimer = setInterval(function () {
                    a.volume = Math.max(0, a.volume - step);
                    if (a.volume <= 0) {
                        a.pause();
                        a.currentTime = 0;
                        clearInterval(fadeTimer);
                    }
                }, 50);
            }

            panel.addEventListener('mouseenter', function () {
                // Only play if a real src has been assigned
                var src = audio.getAttribute('src');
                if (src && src.length > 0) fadeAudioIn(audio, 400);
            });

            panel.addEventListener('mouseleave', function () {
                if (!audio.paused) fadeAudioOut(audio, 600);
            });
        });
    } catch (e) { console.warn('[Jane] Audio error:', e); }

})();
