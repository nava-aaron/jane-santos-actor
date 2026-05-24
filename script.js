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
            document.documentElement.setAttribute('lang', lang);
            langOpts.forEach(function (opt) {
                opt.classList.toggle('active', opt.getAttribute('data-target') === lang);
            });
            document.querySelectorAll('[data-en][data-es]').forEach(function (el) {
                var text = el.getAttribute(lang === 'es' ? 'data-es' : 'data-en');
                if (el.tagName === 'OPTION') el.textContent = text;
                if (el.hasAttribute('placeholder')) el.setAttribute('placeholder', text);
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
        var topNav = document.querySelector('.top-nav');
        function updateNavState() {
            if (!topNav) return;
            topNav.classList.toggle('is-scrolled', window.scrollY > 12);
        }

        updateNavState();
        window.addEventListener('scroll', updateNavState, { passive: true });

        document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                    if (history.pushState) {
                        history.pushState(null, '', this.getAttribute('href'));
                    }
                }
            });
        });
    } catch (e) { console.warn('[Jane] Smooth scroll error:', e); }

    // ─── 03 · BOOKING MODAL ─────────────────────────────────────────────────
    try {
        var bookingModal = document.getElementById('booking-modal');
        var bookingDialog = bookingModal ? bookingModal.querySelector('.booking-dialog') : null;
        var bookingForm = bookingModal ? bookingModal.querySelector('[data-booking-form]') : null;
        var lastBookingTrigger = null;

        function openBookingModal(trigger) {
            if (!bookingModal || !bookingDialog) return;
            lastBookingTrigger = trigger || document.activeElement;
            bookingModal.hidden = false;
            document.body.classList.add('modal-open');
            setTimeout(function () { bookingDialog.focus(); }, 0);
        }

        function closeBookingModal() {
            if (!bookingModal) return;
            bookingModal.hidden = true;
            document.body.classList.remove('modal-open');
            if (lastBookingTrigger && typeof lastBookingTrigger.focus === 'function') {
                lastBookingTrigger.focus();
            }
        }

        document.querySelectorAll('[data-book-trigger]').forEach(function (trigger) {
            trigger.addEventListener('click', function (e) {
                e.preventDefault();
                openBookingModal(trigger);
            });
        });

        document.querySelectorAll('[data-book-close]').forEach(function (closer) {
            closer.addEventListener('click', closeBookingModal);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && bookingModal && !bookingModal.hidden) {
                closeBookingModal();
            }
        });

        if (bookingForm) {
            bookingForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var data = new FormData(bookingForm);
                var status = bookingForm.querySelector('[data-booking-status]');
                var submit = bookingForm.querySelector('button[type="submit"]');
                var payload = new FormData();

                payload.append('name', data.get('name') || '');
                payload.append('email', data.get('email') || '');
                payload.append('message', data.get('message') || '');
                payload.append('_subject', 'Booking inquiry for Jane Santos');
                payload.append('_template', 'table');
                payload.append('_captcha', 'false');

                if (status) {
                    status.textContent = 'Sending...';
                    status.classList.remove('is-error', 'is-success');
                }
                if (submit) submit.disabled = true;

                fetch('https://formsubmit.co/ajax/santosmediagroup@yahoo.com', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: payload
                }).then(function (response) {
                    if (!response.ok) throw new Error('Form service unavailable');
                    return response.json();
                }).then(function () {
                    bookingForm.reset();
                    if (status) {
                        status.textContent = 'Thank you. Your inquiry has been sent.';
                        status.classList.add('is-success');
                    }
                }).catch(function (err) {
                    console.warn('[Jane] Booking submit error:', err);
                    if (status) {
                        status.textContent = 'The form could not send yet. Please email santosmediagroup@yahoo.com.';
                        status.classList.add('is-error');
                    }
                }).finally(function () {
                    if (submit) submit.disabled = false;
                });
            });
        }
    } catch (e) { console.warn('[Jane] Booking modal error:', e); }

    // ─── 04 · VOICE REEL PLAYER ──────────────────────────────────────────────
    try {
        var voicePlayer = document.querySelector('[data-audio-player]');
        if (voicePlayer) {
            var voiceAudio = voicePlayer.querySelector('audio');
            var voicePlay = voicePlayer.querySelector('.voice-play');
            var voiceProgress = voicePlayer.querySelector('.voice-progress');
            var voiceProgressFill = voicePlayer.querySelector('.voice-progress-fill');
            var voiceTime = voicePlayer.querySelector('.voice-time');

            function formatTime(seconds) {
                if (!isFinite(seconds) || seconds < 0) seconds = 0;
                var mins = Math.floor(seconds / 60);
                var secs = Math.floor(seconds % 60);
                return mins + ':' + (secs < 10 ? '0' : '') + secs;
            }

            function updateVoiceProgress() {
                var duration = voiceAudio.duration || 60;
                var progress = duration ? (voiceAudio.currentTime / duration) * 100 : 0;
                voiceProgressFill.style.width = Math.min(100, progress) + '%';
                voiceTime.textContent = formatTime(voiceAudio.currentTime) + ' / ' + formatTime(duration);
            }

            function pausePanelMedia() {
                document.querySelectorAll('.panel-audio').forEach(function (audio) {
                    if (!audio.paused) {
                        audio.pause();
                        audio.currentTime = 0;
                    }
                    var panel = audio.closest('.panel');
                    if (panel) {
                        panel.classList.remove('is-playing');
                        var btn = panel.querySelector('.play-toggle');
                        if (btn) {
                            btn.textContent = btn.getAttribute('data-play-label') || 'Listen to Sample';
                            btn.classList.remove('is-playing');
                            btn.setAttribute('data-playing', 'false');
                        }
                    }
                });
                document.querySelectorAll('.video-toggle.is-playing').forEach(function (btn) {
                    var panel = btn.closest('.panel');
                    var container = panel ? panel.querySelector('.panel-video-container') : null;
                    if (container) {
                        container.innerHTML = '';
                        container.style.opacity = '0';
                        container.style.pointerEvents = 'none';
                    }
                    btn.textContent = btn.getAttribute('data-open-label') || 'Watch Trailer';
                    btn.classList.remove('is-playing');
                    if (panel) panel.classList.remove('is-playing');
                });
            }

            voicePlay.addEventListener('click', function () {
                if (voiceAudio.paused) {
                    pausePanelMedia();
                    voiceAudio.play().catch(function (err) {
                        console.warn('[Jane] Voice reel playback failed:', err);
                    });
                } else {
                    voiceAudio.pause();
                }
            });

            voiceProgress.addEventListener('click', function (e) {
                var rect = voiceProgress.getBoundingClientRect();
                var ratio = (e.clientX - rect.left) / rect.width;
                if (voiceAudio.duration) {
                    voiceAudio.currentTime = Math.max(0, Math.min(1, ratio)) * voiceAudio.duration;
                }
            });

            voiceAudio.addEventListener('play', function () {
                voicePlayer.classList.add('is-playing');
                voicePlay.setAttribute('aria-label', 'Pause voice-over reel');
            });
            voiceAudio.addEventListener('pause', function () {
                voicePlayer.classList.remove('is-playing');
                voicePlay.setAttribute('aria-label', 'Play voice-over reel');
            });
            voiceAudio.addEventListener('ended', function () {
                voicePlayer.classList.remove('is-playing');
                voiceAudio.currentTime = 0;
                updateVoiceProgress();
            });
            voiceAudio.addEventListener('loadedmetadata', updateVoiceProgress);
            voiceAudio.addEventListener('timeupdate', updateVoiceProgress);
            updateVoiceProgress();
        }
    } catch (e) { console.warn('[Jane] Voice reel error:', e); }

    // ─── 05 · STAT COUNTERS ──────────────────────────────────────────────────
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

    // ─── 06 · SCROLL REVEALS ─────────────────────────────────────────────────
    try {
        if ('IntersectionObserver' in window) {

            // About story + credentials
            var revealObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        revealObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            document.querySelectorAll('.about-story, .credentials-list').forEach(function (el) {
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
            document.querySelectorAll('.about-story, .credentials-list, .mask-sweep')
                .forEach(function (el) { el.classList.add('is-visible'); });
        }
    } catch (e) { console.warn('[Jane] Scroll reveal error:', e); }

    // ─── 07 · GOLD THREAD CURSOR ─────────────────────────────────────────────
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

    // ─── 07 · MEDIA SCAFFOLDING ──────────────────────────────────────────────
    // Wired and ready — no-ops until src is set on .panel-audio elements
    try {
        document.querySelectorAll('.panel').forEach(function (panel) {
            var audio = panel.querySelector('.panel-audio');
            var fadeTimer = null;

            if (audio) {
                function playLabel(btn) {
                    return btn ? (btn.getAttribute('data-play-label') || 'Listen to Sample') : 'Listen to Sample';
                }

                function pauseLabel(btn) {
                    return btn ? (btn.getAttribute('data-pause-label') || 'Stop Sample') : 'Stop Sample';
                }

                function setAudioButton(btn, isPlaying) {
                    if (!btn) return;
                    btn.textContent = isPlaying ? pauseLabel(btn) : playLabel(btn);
                    btn.classList.toggle('is-playing', isPlaying);
                    btn.setAttribute('data-playing', isPlaying ? 'true' : 'false');
                }

                function stopAudioNow(a) {
                    clearInterval(fadeTimer);
                    a.pause();
                    a.currentTime = 0;
                    a.volume = 1;
                    panel.classList.remove('is-playing');
                    setAudioButton(playBtn, false);
                }

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
                    if (!durationMs) {
                        stopAudioNow(a);
                        return;
                    }
                    var steps = durationMs / 50;
                    var step = 1 / steps;
                    clearInterval(fadeTimer);
                    fadeTimer = setInterval(function () {
                        a.volume = Math.max(0, a.volume - step);
                        if (a.volume <= 0) {
                            stopAudioNow(a);
                            clearInterval(fadeTimer);
                        }
                    }, 50);
                }

                var playBtn = panel.querySelector('.play-toggle');

                panel.addEventListener('mouseenter', function () {
                    if (playBtn) return; // Disable hover play if there's a manual button
                    var src = audio.getAttribute('src');
                    if (src && src.length > 0) fadeAudioIn(audio, 400);
                });

                panel.addEventListener('mouseleave', function () {
                    if (playBtn) return; // Disable hover pause if there's a manual button
                    if (!audio.paused) fadeAudioOut(audio, 600);
                });

                // Manual play/pause via button
                if (playBtn) {
                    playBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!audio) return;

                        if (!audio.paused || playBtn.classList.contains('is-playing')) {
                            stopAudioNow(audio);
                            return;
                        }

                        if (audio.paused) {
                            var voiceAudio = document.querySelector('[data-audio-player] audio');
                            if (voiceAudio && !voiceAudio.paused) voiceAudio.pause();

                            document.querySelectorAll('.video-toggle.is-playing').forEach(function (btn) {
                                var otherPanelVideo = btn.closest('.panel');
                                var container = otherPanelVideo ? otherPanelVideo.querySelector('.panel-video-container') : null;
                                if (container) {
                                    container.innerHTML = '';
                                    container.style.opacity = '0';
                                    container.style.pointerEvents = 'none';
                                }
                                btn.textContent = btn.getAttribute('data-open-label') || 'Watch Trailer';
                                btn.classList.remove('is-playing');
                                if (otherPanelVideo) otherPanelVideo.classList.remove('is-playing');
                            });

                            document.querySelectorAll('.panel-audio').forEach(function(otherAudio) {
                                if (otherAudio !== audio) {
                                    otherAudio.pause();
                                    otherAudio.currentTime = 0;
                                    otherAudio.volume = 1;
                                    var otherPanel = otherAudio.closest('.panel');
                                    if (otherPanel) {
                                        otherPanel.classList.remove('is-playing');
                                        var otherBtn = otherPanel.querySelector('.play-toggle');
                                        setAudioButton(otherBtn, false);
                                    }
                                }
                            });
                            
                            audio.volume = 1;
                            setAudioButton(playBtn, true);
                            panel.classList.add('is-playing');
                            audio.play().then(function () {
                                setAudioButton(playBtn, true);
                                panel.classList.add('is-playing');
                            }).catch(function(err) {
                                console.warn('[Jane] Audio playback failed:', err);
                                setAudioButton(playBtn, false);
                                panel.classList.remove('is-playing');
                            });
                        }
                    });

                    audio.addEventListener('ended', function () {
                        stopAudioNow(audio);
                    });
                }
            }

            // Film reels open on hover for desktop, with the button retained as a touch/click fallback.
            var videoBtn = panel.querySelector('.video-toggle');
            var videoContainer = panel.querySelector('.panel-video-container');
            if (videoBtn && videoContainer) {
                var videoHoverEnabled = !window.matchMedia('(hover: none) and (pointer: coarse)').matches;

                function openVideo() {
                    var isPlaying = videoBtn.classList.contains('is-playing');
                    if (!isPlaying) {
                        // Pause any playing audio
                        document.querySelectorAll('.panel-audio').forEach(function(otherAudio) {
                            if (!otherAudio.paused) {
                                var stepsOther = 400 / 50;
                                var stepOther = 1 / stepsOther;
                                var otherFadeTimer = setInterval(function () {
                                    otherAudio.volume = Math.max(0, otherAudio.volume - stepOther);
                                    if (otherAudio.volume <= 0) {
                                        otherAudio.pause();
                                        otherAudio.currentTime = 0;
                                        clearInterval(otherFadeTimer);
                                    }
                                }, 50);

                                var otherPanel = otherAudio.closest('.panel');
                                if (otherPanel) {
                                    otherPanel.classList.remove('is-playing');
                                    var otherBtn = otherPanel.querySelector('.play-toggle');
                                    if (otherBtn) {
                                        otherBtn.textContent = otherBtn.getAttribute('data-play-label') || 'Listen to Sample';
                                        otherBtn.classList.remove('is-playing');
                                        otherBtn.setAttribute('data-playing', 'false');
                                    }
                                }
                            }
                        });

                        // Create video surface and play
                        var ytId = videoBtn.getAttribute('data-youtube-id');
                        var localVideoSrc = videoBtn.getAttribute('data-video-src');
                        if (localVideoSrc) {
                            videoContainer.innerHTML = '<video src="' + localVideoSrc + '" autoplay muted loop playsinline controls style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; border:0;"></video>';
                        } else if (ytId) {
                            videoContainer.innerHTML = '<iframe src="https://www.youtube.com/embed/' + ytId + '?autoplay=1&mute=1&controls=1&playsinline=1&rel=0" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allow="autoplay; fullscreen"></iframe>';
                        }
                        videoContainer.style.opacity = '1';
                        videoContainer.style.pointerEvents = 'auto';

                        videoBtn.textContent = videoBtn.getAttribute('data-close-label') || 'Close Trailer';
                        videoBtn.classList.add('is-playing');
                        panel.classList.add('is-playing');
                    }
                }

                function closeVideo() {
                    if (!videoBtn.classList.contains('is-playing')) return;
                    videoContainer.innerHTML = '';
                    videoContainer.style.opacity = '0';
                    videoContainer.style.pointerEvents = 'none';
                    videoBtn.textContent = videoBtn.getAttribute('data-open-label') || 'Watch Trailer';
                    videoBtn.classList.remove('is-playing');
                    panel.classList.remove('is-playing');
                }

                if (videoHoverEnabled) {
                    panel.addEventListener('mouseenter', openVideo);
                    panel.addEventListener('mouseleave', closeVideo);
                }

                videoBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (videoBtn.classList.contains('is-playing')) {
                        closeVideo();
                    } else {
                        openVideo();
                    }
                });
            }
        });
    } catch (e) { console.warn('[Jane] Audio error:', e); }

})();
