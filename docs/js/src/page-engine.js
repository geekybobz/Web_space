// =====================================================
const PageEngine = (() => {
    if (isMobileBlockedViewport()) {
        return {
            goTo() {},
            next() {},
            prev() {},
        };
    }

    const pages       = Array.from(document.querySelectorAll('.page'));
    const pageEngine  = document.getElementById('page-engine');
    const dotsNav     = document.querySelector('.page-dots');
    const prevBtn     = document.getElementById('page-prev');
    const nextBtn     = document.getElementById('page-next');
    const DURATION_MS = 280; // matches CSS transition
    const EDGE_INTENT_THRESHOLD = 18;
    const EDGE_INTENT_WINDOW_MS = 850;

    let current        = 0;
    let isAnimating    = false;
    let edgePulseTimer = null;
    let edgeCueTimer   = null;
    let edgeReleaseTimer = null;
    let edgePrimedDirection = 0;

    function hashPageIndex() {
        const hash = window.location.hash;
        if (!hash) return 0;
        const match = pages.findIndex((page) => `#${page.id}` === hash);
        return match >= 0 ? match : 0;
    }

    function syncHash(idx) {
        const target = pages[idx];
        if (!target) return;
        const url = idx === 0 ? window.location.pathname + window.location.search : `#${target.id}`;
        if (window.history?.replaceState) {
            window.history.replaceState(null, '', url);
        } else {
            window.location.hash = idx === 0 ? '' : target.id;
        }
    }

    // --- Build side dots ---
    pages.forEach((page, i) => {
        const label = page.dataset.label || `Page ${i + 1}`;
        const dot   = document.createElement('button');
        dot.className   = 'page-dot';
        dot.dataset.label = label;
        dot.setAttribute('aria-label', `Go to ${label}`);
        dot.addEventListener('click', () => {
            goTo(i);
        });
        dotsNav?.appendChild(dot);
    });

    const dots = Array.from(dotsNav?.querySelectorAll('.page-dot') || []);
    let pageTagTimer = null;

    function pulsePageTag(idx) {
        const dot = dots[idx];
        if (!dot) return;
        if (pageTagTimer) clearTimeout(pageTagTimer);
        dots.forEach((d) => d.classList.remove('show-label'));
        dot.classList.add('show-label');
        pageTagTimer = setTimeout(() => {
            dot.classList.remove('show-label');
            pageTagTimer = null;
        }, 1100);
    }

    let scrollCueTimer = null;

    function clearScrollCueTimer() {
        if (scrollCueTimer) {
            clearTimeout(scrollCueTimer);
            scrollCueTimer = null;
        }
    }

    function setDirectionalCue(direction = 0, strength = 0) {
        if (!pageEngine) return;
        if (direction === 0 || strength <= 0) {
            pageEngine.style.setProperty('--scroll-cue-progress', '0');
            pageEngine.style.setProperty('--scroll-cue-opacity', '0');
            return;
        }

        pageEngine.style.setProperty('--scroll-cue-origin', direction > 0 ? '0%' : '100%');
        pageEngine.style.setProperty('--scroll-cue-progress', String(Math.min(Math.max(strength, 0), 1)));
        pageEngine.style.setProperty('--scroll-cue-opacity', '0.96');
    }

    function flashDirectionalCue(direction, strength = 0.54, duration = 180) {
        if (!pageEngine || direction === 0) return;
        clearScrollCueTimer();
        setDirectionalCue(direction, strength);
        scrollCueTimer = setTimeout(() => {
            setDirectionalCue(0, 0);
            scrollCueTimer = null;
        }, duration);
    }

    function updateScrollFeedback(page = pages[current]) {
        if (!pageEngine || !page) return;
        const maxScroll = Math.max(page.scrollHeight - page.clientHeight, 0);
        const hasOverflow = maxScroll > 0;
        pageEngine.style.setProperty('--scroll-cue-opacity', hasOverflow ? '0.18' : '0');
        pageEngine.style.setProperty('--scroll-cue-progress', hasOverflow ? '0.22' : '0');
        pageEngine.style.setProperty('--scroll-cue-origin', '0%');
    }

    function pulsePageBadge() {
        const avatar = pages[current]?.querySelector('.page-avatar');
        if (!avatar) return;
        if (edgePulseTimer) clearTimeout(edgePulseTimer);
        avatar.classList.remove('edge-pulse');
        void avatar.offsetWidth;
        avatar.classList.add('edge-pulse');
        edgePulseTimer = setTimeout(() => {
            avatar.classList.remove('edge-pulse');
            edgePulseTimer = null;
        }, 260);
    }

    function getArrowForDirection(direction) {
        return direction > 0 ? nextBtn : prevBtn;
    }

    function clearEdgeReleaseTimer() {
        if (edgeReleaseTimer) {
            clearTimeout(edgeReleaseTimer);
            edgeReleaseTimer = null;
        }
    }

    function clearArrowAttract() {
        [prevBtn, nextBtn].forEach((button) => {
            if (!button) return;
            button.classList.remove('edge-attract');
            button.removeAttribute('data-edge-label');
        });
    }

    function clearEdgeState({ keepCue = false } = {}) {
        clearEdgeReleaseTimer();
        edgePrimedDirection = 0;
        clearArrowAttract();
        if (!keepCue) clearEdgeCue();
    }

    function applyArrowAttract(direction) {
        clearArrowAttract();
        const button = getArrowForDirection(direction);
        if (!button || button.disabled) return;
        button.classList.add('edge-attract');
        button.setAttribute('data-edge-label', direction > 0 ? 'Scroll again for next' : 'Scroll again for previous');
    }

    function scheduleEdgeRelease() {
        clearEdgeReleaseTimer();
        edgeReleaseTimer = setTimeout(() => {
            clearEdgeState();
        }, EDGE_INTENT_WINDOW_MS);
    }

    // --- Update UI chrome ---
    function updateChrome(idx) {
        // Dots
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));

        // Prev/Next arrows
        if (prevBtn) prevBtn.disabled = idx === 0;
        if (nextBtn) nextBtn.disabled = idx === pages.length - 1;

        // Navbar active link
        document.querySelectorAll('[data-page-link]').forEach(a => {
            a.classList.toggle('active', parseInt(a.dataset.pageLink) === idx);
        });

        document.body.classList.toggle('viewing-contact', idx === 5);
        clearArrowAttract();

        // Close mobile menu
        navLinksEl?.classList.remove('active');
        const icon = mobileToggle?.querySelector('i');
        if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
    }

    // --- Core transition ---
    function goTo(idx, direction = null) {
        if (isAnimating || idx === current || idx < 0 || idx >= pages.length) return;
        clearEdgeState();
        isAnimating = true;

        const prevPageIdx = current;
        const outPage = pages[current];
        const inPage  = pages[idx];
        const dir     = direction ?? (idx > current ? 'forward' : 'backward');

        // Exit outgoing page
        outPage.classList.remove('active');
        outPage.classList.add(dir === 'forward' ? 'exit-up' : 'exit-down');

        // Update state immediately so chrome/dots/hash are responsive
        current = idx;
        updateChrome(current);
        pulsePageTag(current);
        inPage.scrollTop = 0;
        updateScrollFeedback(inPage);
        syncHash(current);
        _onPageChange(current, prevPageIdx);

        if (dir === 'backward') {
            // Snap incoming page above viewport (single reflow, no double)
            inPage.classList.add('from-above');
            void inPage.offsetHeight; // commit snap — one reflow
            requestAnimationFrame(() => {
                inPage.classList.remove('from-above');
                inPage.classList.add('active');
            });
        } else {
            inPage.classList.remove('exit-up', 'exit-down');
            inPage.classList.add('active');
        }

        setTimeout(() => {
            outPage.classList.remove('exit-up', 'exit-down');
            isAnimating = false;
        }, DURATION_MS + 80);
    }

    function next() { goTo(current + 1, 'forward');  }
    function prev() { goTo(current - 1, 'backward'); }

    // --- Init: show page 0 immediately (no animation) ---
    function init() {
        pages.forEach((p, i) => {
            p.classList.remove('active', 'exit-up', 'exit-down', 'from-above');
            // Ensure all pages start hidden via their base .page class styles
        });
        const initial = hashPageIndex();
        pages[initial].style.transition = 'none';
        pages[initial].classList.add('active');
        void pages[initial].offsetHeight;
        pages[initial].style.transition = '';

        current = initial;
        updateChrome(initial);
        updateScrollFeedback(pages[initial]);
    }

    // --- Listeners ---

    // Arrow buttons
    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);

    // Navbar & brand links
    document.querySelectorAll('[data-page-link]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            goTo(parseInt(a.dataset.pageLink));
        });
    });

    // Hero CTA "View Research" button
    document.querySelectorAll('[data-page-link]').forEach(a => {
        if (a.classList.contains('btn-primary')) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                goTo(parseInt(a.dataset.pageLink));
            });
        }
    });

    pages.forEach((page) => {
        page.addEventListener('scroll', () => {
            if (page === pages[current]) updateScrollFeedback(page);
        }, { passive: true });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); next(); }
        if (e.key === 'ArrowUp'   || e.key === 'PageUp'  ) { e.preventDefault(); prev(); }
    });

    function clearEdgeCue() {
        pageEngine?.classList.remove('show-edge-cue-top', 'show-edge-cue-bottom');
        if (edgeCueTimer) {
            clearTimeout(edgeCueTimer);
            edgeCueTimer = null;
        }
        clearScrollCueTimer();
        updateScrollFeedback(pages[current]);
    }

    function showEdgeCue(direction) {
        if (!pageEngine) return;
        clearEdgeCue();
        pageEngine.classList.add(direction > 0 ? 'show-edge-cue-bottom' : 'show-edge-cue-top');
        setDirectionalCue(direction, 1);
        pulsePageBadge();
        edgeCueTimer = setTimeout(() => {
            clearEdgeCue();
        }, 760);
    }

    document.addEventListener('wheel', (e) => {
        const activePage = pages[current];
        const atTop    = activePage.scrollTop <= 0;
        const atBottom = activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 2;
        const dir      = Math.sign(e.deltaY);
        const deltaAbs = Math.abs(e.deltaY);

        // Still scrolling inside the page — let it scroll naturally
        if ((!atTop && dir < 0) || (!atBottom && dir > 0)) {
            clearEdgeState();
            return;
        }

        if (dir === 0) return;

        if ((dir > 0 && atBottom) || (dir < 0 && atTop)) {
            e.preventDefault();
            if (deltaAbs < EDGE_INTENT_THRESHOLD) {
                scheduleEdgeRelease();
                return;
            }

            if (edgePrimedDirection !== 0 && edgePrimedDirection !== dir) {
                clearEdgeState({ keepCue: true });
            }

            if (edgePrimedDirection === dir) {
                clearEdgeState({ keepCue: true });
                if (dir > 0) next(); else prev();
                return;
            }

            edgePrimedDirection = dir;
            showEdgeCue(dir);
            setDirectionalCue(dir, 1);
            applyArrowAttract(dir);
            pulsePageBadge();
            scheduleEdgeRelease();
            return;
        }

        clearEdgeState();
    }, { passive: false });

    // Touch / swipe navigation
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        if (isMobileBlockedViewport()) return;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (isMobileBlockedViewport()) return;
        const dy = touchStartY - e.changedTouches[0].clientY;
        const activePage = pages[current];
        const atTop     = activePage.scrollTop <= 0;
        const atBottom  = activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 2;

        if (dy > 60  && atBottom) next();
        if (dy < -60 && atTop)   prev();
    }, { passive: true });

    window.addEventListener('hashchange', () => {
        const idx = hashPageIndex();
        if (idx !== current) goTo(idx);
    });

    init();
    return { goTo, next, prev };
})();
