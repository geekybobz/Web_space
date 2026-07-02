// =====================================================
// PAGE ENGINE — explicit-only paging, native inner scroll
// =====================================================
const PageEngine = (() => {
    const pages    = Array.from(document.querySelectorAll('.page'));
    const engine   = document.getElementById('page-engine');
    const dotsNav  = document.querySelector('.page-dots');
    const navbarEl = document.querySelector('.navbar');
    let current = 0;
    let isPaging = false;

    const PAGE_LOCK_MS = 620;

    pages.forEach((page, i) => {
        page.tabIndex = -1; // focusable so arrow keys / Space scroll the active page
        const label = page.dataset.label || `Page ${i + 1}`;
        const dot   = document.createElement('button');
        dot.className     = 'page-dot';
        dot.dataset.label = label;
        dot.setAttribute('aria-label', `Go to ${label}`);
        dot.addEventListener('click', () => goTo(i));
        dotsNav?.appendChild(dot);
    });
    const dots = Array.from(dotsNav?.querySelectorAll('.page-dot') || []);

    function isMobileViewport() {
        return window.matchMedia('(max-width: 900px)').matches;
    }

    function normalizedWheelDeltaY(e) {
        if (e.deltaMode === 1) return e.deltaY * 16;
        if (e.deltaMode === 2) return e.deltaY * window.innerHeight;
        return e.deltaY;
    }

    function syncHash(idx) {
        const target = pages[idx];
        if (!target) return;
        const url = idx === 0
            ? window.location.pathname + window.location.search
            : `#${target.id}`;
        history.replaceState?.(null, '', url);
    }

    function updateChrome(idx) {
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        document.querySelectorAll('[data-page-link]').forEach(a => {
            a.classList.toggle('active', parseInt(a.dataset.pageLink, 10) === idx);
        });
        document.body.classList.toggle('viewing-contact', idx === pages.length - 1);
        navbarEl?.classList.toggle('scrolled', idx > 0);
    }

    function setActive(idx) {
        if (idx < 0 || idx >= pages.length) return;
        const old = current;
        current = idx;
        pages.forEach((p, i) => {
            p.classList.toggle('active', i === idx);
            if (i !== idx) p.scrollTop = 0;
        });
        updateChrome(idx);
        syncHash(idx);
        pages[idx].focus({ preventScroll: true });
        if (old !== current) _onPageChange(current, old);
        navLinksEl?.classList.remove('active');
        const icon = mobileToggle?.querySelector('i');
        if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
        mobileToggle?.setAttribute('aria-expanded', 'false');
    }

    function goTo(idx) {
        if (!engine || idx < 0 || idx >= pages.length) return;
        isPaging = true;
        engine.scrollTo({ top: pages[idx].offsetTop, behavior: 'smooth' });
        setActive(idx);
        window.setTimeout(() => { isPaging = false; }, PAGE_LOCK_MS);
    }

    // --- Wheel over the dot rail = one page step per gesture ---
    // (wheel anywhere else is pure native inner scroll — never paginates)
    const RAIL_WHEEL_THRESHOLD = 40;
    let railDelta = 0;
    let railResetTimer = null;

    dotsNav?.addEventListener('wheel', (e) => {
        e.preventDefault(); // the rail itself has nothing to scroll
        if (isMobileViewport() || isPaging) return;
        const dy = normalizedWheelDeltaY(e);
        if (railDelta !== 0 && Math.sign(dy) !== Math.sign(railDelta)) railDelta = 0;
        railDelta += dy;
        if (railResetTimer) clearTimeout(railResetTimer);
        railResetTimer = setTimeout(() => { railDelta = 0; }, 150);
        if (Math.abs(railDelta) < RAIL_WHEEL_THRESHOLD) return;
        railDelta = 0;
        goTo(current + Math.sign(dy));
    }, { passive: false });

    // --- Dock-style magnifier: dots swell near the cursor ---
    const DOCK_RANGE   = 56;  // px falloff radius around the cursor
    const DOCK_BOOST   = 1.1; // nearest dot reaches ~2.1x
    const ACTIVE_SCALE = 2;   // active dot never drops below its CSS scale
    let dockRaf = null;

    dotsNav?.addEventListener('mousemove', (e) => {
        if (isMobileViewport() || dockRaf) return;
        const y = e.clientY;
        dockRaf = requestAnimationFrame(() => {
            dockRaf = null;
            dots.forEach((dot, i) => {
                const r = dot.getBoundingClientRect();
                const d = Math.abs(y - (r.top + r.height / 2));
                let s = 1 + DOCK_BOOST * Math.max(0, 1 - d / DOCK_RANGE);
                if (i === current) s = Math.max(s, ACTIVE_SCALE);
                dot.style.setProperty('--s', s.toFixed(3));
            });
        });
    });

    dotsNav?.addEventListener('mouseleave', () => {
        if (dockRaf) { cancelAnimationFrame(dockRaf); dockRaf = null; }
        dots.forEach(dot => dot.style.removeProperty('--s'));
    });

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'PageDown') { e.preventDefault(); goTo(current + 1); }
        if (e.key === 'PageUp')   { e.preventDefault(); goTo(current - 1); }
    });

    document.querySelectorAll('[data-page-link]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            goTo(parseInt(a.dataset.pageLink, 10));
        });
    });

    pages.forEach((p, i) => p.classList.toggle('active', i === 0));
    updateChrome(0);

    if (window.location.hash) {
        const idx = pages.findIndex(p => `#${p.id}` === window.location.hash);
        if (idx > 0) requestAnimationFrame(() => goTo(idx));
    }

    return { goTo, next: () => goTo(current + 1), prev: () => goTo(current - 1) };
})();
