// =====================================================
const PageEngine = (() => {
    if (isMobileViewport()) {
        MobileScrollMode?.init();
        return {
            goTo(idx) { MobileScrollMode?.goTo(idx); },
            next() {},
            prev() {},
        };
    }

    const pages       = Array.from(document.querySelectorAll('.page'));
    const pageEngine  = document.getElementById('page-engine');
    const dotsNav     = document.querySelector('.page-dots');
    const DURATION_MS = 280;
    const EDGE_INTENT_THRESHOLD = 18;
    const EDGE_INTENT_WINDOW_MS = 850;

    let current             = 0;
    let isAnimating         = false;
    let edgePulseTimer      = null;
    let edgeCueTimer        = null;
    let edgeReleaseTimer    = null;
    let edgePrimedDirection = 0;
    let overScrollY         = 0;
    let overScrollTimer     = null;

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

    // --- Build bottom nav dots ---
    pages.forEach((page, i) => {
        const label = page.dataset.label || `Page ${i + 1}`;
        const dot   = document.createElement('button');
        dot.className     = 'page-dot';
        dot.dataset.label = label;
        dot.setAttribute('aria-label', `Go to ${label}`);
        dot.addEventListener('click', () => { goTo(i); });
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

    // Drives the left scroll-depth bar — fills as user scrolls down the page
    function updateScrollFeedback(page = pages[current]) {
        if (!pageEngine || !page) return;
        const maxScroll   = Math.max(page.scrollHeight - page.clientHeight, 0);
        const hasOverflow = maxScroll > 0;
        const depth       = maxScroll > 0 ? page.scrollTop / maxScroll : 0;
        pageEngine.style.setProperty('--scroll-cue-opacity',  hasOverflow ? '0.42' : '0');
        pageEngine.style.setProperty('--scroll-cue-progress', String(depth));
        pageEngine.style.setProperty('--scroll-cue-origin',   '0%');
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

    function clearEdgeReleaseTimer() {
        if (edgeReleaseTimer) {
            clearTimeout(edgeReleaseTimer);
            edgeReleaseTimer = null;
        }
    }

    // --- Adjacent dot priming (signals "scroll again to go here") ---
    function clearDotPrimed() {
        dots.forEach(d => d.classList.remove('dot-primed'));
    }

    function primeAdjacentDot(direction) {
        clearDotPrimed();
        const targetIdx = current + direction;
        if (targetIdx >= 0 && targetIdx < dots.length) {
            dots[targetIdx].classList.add('dot-primed');
        }
    }

    // --- Elastic boundary push ---
    function resetElastic() {
        if (overScrollTimer) clearTimeout(overScrollTimer);
        overScrollTimer = null;
        overScrollY     = 0;
        pages.forEach(p => p.style.setProperty('--page-push-y', '0px'));
    }

    function applyElasticPush(deltaAbs, direction) {
        overScrollY = Math.min(overScrollY + deltaAbs * 0.22, 46);
        const push  = direction > 0 ? -overScrollY : overScrollY;
        if (pages[current]) pages[current].style.setProperty('--page-push-y', push + 'px');
        if (overScrollTimer) clearTimeout(overScrollTimer);
        overScrollTimer = setTimeout(() => {
            overScrollY = 0;
            if (pages[current]) pages[current].style.setProperty('--page-push-y', '0px');
            overScrollTimer = null;
        }, 140);
    }

    function clearEdgeState({ keepCue = false } = {}) {
        clearEdgeReleaseTimer();
        edgePrimedDirection = 0;
        clearDotPrimed();
        if (!keepCue) clearEdgeCue();
    }

    function scheduleEdgeRelease() {
        clearEdgeReleaseTimer();
        edgeReleaseTimer = setTimeout(() => {
            clearEdgeState();
        }, EDGE_INTENT_WINDOW_MS);
    }

    // --- Update UI chrome ---
    function updateChrome(idx) {
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));

        document.querySelectorAll('[data-page-link]').forEach(a => {
            a.classList.toggle('active', parseInt(a.dataset.pageLink) === idx);
        });

        document.body.classList.toggle('viewing-contact', idx === 4);
        clearDotPrimed();

        navLinksEl?.classList.remove('active');
        const icon = mobileToggle?.querySelector('i');
        if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
    }

    // --- Core transition ---
    function goTo(idx, direction = null) {
        if (isMobileViewport()) {
            MobileScrollMode?.goTo(idx);
            return;
        }
        if (isAnimating || idx === current || idx < 0 || idx >= pages.length) return;
        resetElastic();
        clearEdgeState();
        isAnimating = true;

        const prevPageIdx = current;
        const outPage     = pages[current];
        const inPage      = pages[idx];
        const dir         = direction ?? (idx > current ? 'forward' : 'backward');

        outPage.classList.remove('active');
        outPage.classList.add(dir === 'forward' ? 'exit-up' : 'exit-down');

        current = idx;
        updateChrome(current);
        pulsePageTag(current);
        inPage.scrollTop = 0;
        updateScrollFeedback(inPage);
        syncHash(current);
        _onPageChange(current, prevPageIdx);

        if (dir === 'backward') {
            inPage.classList.add('from-above');
            void inPage.offsetHeight;
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
        pages.forEach((p) => {
            p.classList.remove('active', 'exit-up', 'exit-down', 'from-above');
            p.style.setProperty('--page-push-y', '0px');
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

    // Navbar & brand links
    document.querySelectorAll('[data-page-link]').forEach(a => {
        a.addEventListener('click', (e) => {
            if (isMobileViewport()) return;
            e.preventDefault();
            goTo(parseInt(a.dataset.pageLink));
        });
    });

    // Hero CTA buttons
    document.querySelectorAll('[data-page-link]').forEach(a => {
        if (a.classList.contains('btn-primary')) {
            a.addEventListener('click', (e) => {
                if (isMobileViewport()) return;
                e.preventDefault();
                goTo(parseInt(a.dataset.pageLink));
            });
        }
    });

    // Track scroll depth in each page for the left cue bar
    pages.forEach((page) => {
        page.addEventListener('scroll', () => {
            if (page === pages[current]) updateScrollFeedback(page);
        }, { passive: true });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (isMobileViewport()) return;
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

    // Wheel: elastic push at every boundary contact, double-scroll to navigate
    document.addEventListener('wheel', (e) => {
        if (isMobileViewport()) return;
        const activePage = pages[current];
        const atTop      = activePage.scrollTop <= 0;
        const atBottom   = activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 2;
        const dir        = Math.sign(e.deltaY);
        const deltaAbs   = Math.abs(e.deltaY);

        // Still scrolling inside the page — let it scroll naturally
        if ((!atTop && dir < 0) || (!atBottom && dir > 0)) {
            clearEdgeState();
            return;
        }

        if (dir === 0) return;

        if ((dir > 0 && atBottom) || (dir < 0 && atTop)) {
            e.preventDefault();

            // Elastic push fires on every boundary contact
            applyElasticPush(deltaAbs, dir);

            if (deltaAbs < EDGE_INTENT_THRESHOLD) {
                scheduleEdgeRelease();
                return;
            }

            if (edgePrimedDirection !== 0 && edgePrimedDirection !== dir) {
                clearEdgeState({ keepCue: true });
            }

            // Second intentional scroll in same direction → navigate
            if (edgePrimedDirection === dir) {
                clearEdgeState({ keepCue: true });
                if (dir > 0) next(); else prev();
                return;
            }

            // First intentional boundary scroll → prime + signal
            edgePrimedDirection = dir;
            showEdgeCue(dir);
            setDirectionalCue(dir, 1);
            primeAdjacentDot(dir);
            pulsePageBadge();
            scheduleEdgeRelease();
            return;
        }

        clearEdgeState();
    }, { passive: false });

    // Touch / swipe navigation
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        if (isMobileViewport()) return;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (isMobileViewport()) return;
        const dy         = touchStartY - e.changedTouches[0].clientY;
        const activePage = pages[current];
        const atTop      = activePage.scrollTop <= 0;
        const atBottom   = activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 2;

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
