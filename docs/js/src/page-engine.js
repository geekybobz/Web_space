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

    const pages      = Array.from(document.querySelectorAll('.page'));
    const pageEngine = document.getElementById('page-engine');
    const dotsNav    = document.querySelector('.page-dots');
    const DURATION_MS = 280;

    let current        = 0;
    let isAnimating    = false;
    let edgePulseTimer = null;
    let glowTimer      = null;

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

    // --- Boundary glow (visual only — never navigates) ---
    // CSS overscroll-behavior: none on .page stops scroll dead at the boundary.
    // The glow is purely a compositor-side box-shadow change — zero layout cost.
    function showBoundaryGlow(direction) {
        if (!pageEngine) return;
        pageEngine.classList.remove('show-edge-cue-top', 'show-edge-cue-bottom');
        pageEngine.classList.add(direction > 0 ? 'show-edge-cue-bottom' : 'show-edge-cue-top');
        pulsePageBadge();
        if (glowTimer) clearTimeout(glowTimer);
        glowTimer = setTimeout(() => {
            pageEngine.classList.remove('show-edge-cue-top', 'show-edge-cue-bottom');
            glowTimer = null;
        }, 480);
    }

    // --- Update UI chrome ---
    function updateChrome(idx) {
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        document.querySelectorAll('[data-page-link]').forEach(a => {
            a.classList.toggle('active', parseInt(a.dataset.pageLink) === idx);
        });
        document.body.classList.toggle('viewing-contact', idx === 4);
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
        pageEngine?.classList.remove('show-edge-cue-top', 'show-edge-cue-bottom');
        if (glowTimer) { clearTimeout(glowTimer); glowTimer = null; }
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

    // --- Init ---
    function init() {
        pages.forEach((p) => {
            p.classList.remove('active', 'exit-up', 'exit-down', 'from-above');
        });
        const initial = hashPageIndex();
        pages[initial].style.transition = 'none';
        pages[initial].classList.add('active');
        void pages[initial].offsetHeight;
        pages[initial].style.transition = '';

        current = initial;
        updateChrome(initial);
    }

    // --- Listeners ---

    document.querySelectorAll('[data-page-link]').forEach(a => {
        a.addEventListener('click', (e) => {
            if (isMobileViewport()) return;
            e.preventDefault();
            goTo(parseInt(a.dataset.pageLink));
        });
    });

    document.querySelectorAll('[data-page-link]').forEach(a => {
        if (a.classList.contains('btn-primary')) {
            a.addEventListener('click', (e) => {
                if (isMobileViewport()) return;
                e.preventDefault();
                goTo(parseInt(a.dataset.pageLink));
            });
        }
    });

    document.addEventListener('keydown', (e) => {
        if (isMobileViewport()) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); next(); }
        if (e.key === 'ArrowUp'   || e.key === 'PageUp'  ) { e.preventDefault(); prev(); }
    });

    // Wheel: passive — compositor handles native scroll with zero blocking.
    // overscroll-behavior: none on .page stops scroll at boundary (no OS rubber-band).
    // Boundary glow fires via class toggle — compositor-only box-shadow, no layout.
    document.addEventListener('wheel', (e) => {
        if (isMobileViewport()) return;
        const activePage = pages[current];
        const atTop    = activePage.scrollTop <= 0;
        const atBottom = activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 2;
        const dir      = Math.sign(e.deltaY);

        if (dir === 0) return;
        if ((dir > 0 && atBottom) || (dir < 0 && atTop)) {
            showBoundaryGlow(dir);
        }
    }, { passive: true });

    window.addEventListener('hashchange', () => {
        const idx = hashPageIndex();
        if (idx !== current) goTo(idx);
    });

    init();
    return { goTo, next, prev };
})();
