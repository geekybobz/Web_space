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

    function closeMobileNav() {
        navLinksEl?.classList.remove('active');
        const icon = mobileToggle?.querySelector('i');
        if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
        mobileToggle?.setAttribute('aria-expanded', 'false');
    }

    function mobileTargetTop(page) {
        const navHeight = navbarEl?.offsetHeight || 0;
        const top = page.getBoundingClientRect().top + window.scrollY - navHeight - 8;
        return Math.max(0, top);
    }

    function updateChrome(idx) {
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        document.querySelectorAll('[data-page-link]').forEach(a => {
            a.classList.toggle('active', parseInt(a.dataset.pageLink, 10) === idx);
        });
        document.body.classList.toggle('viewing-contact', idx === pages.length - 1);
        navbarEl?.classList.toggle('scrolled', idx > 0);
    }

    function setActive(idx, options = {}) {
        if (idx < 0 || idx >= pages.length) return;
        const notifyLifecycle = options.notifyLifecycle !== false;
        const resetScroll = options.resetScroll !== false && !isMobileViewport();
        const shouldFocus = options.focus !== false && !isMobileViewport();
        const shouldSyncHash = options.syncHash !== false;
        const shouldCloseMenu = options.closeMenu !== false;
        const old = current;
        current = idx;
        pages.forEach((p, i) => {
            p.classList.toggle('active', i === idx);
            if (resetScroll && i !== idx) p.scrollTop = 0;
        });
        updateChrome(idx);
        if (shouldSyncHash) syncHash(idx);
        if (shouldFocus) pages[idx].focus({ preventScroll: true });
        if (notifyLifecycle && old !== current && typeof _onPageChange === 'function') _onPageChange(current, old);
        if (shouldCloseMenu) closeMobileNav();
    }

    function goTo(idx) {
        if (!engine || idx < 0 || idx >= pages.length) return;
        isPaging = true;
        hideEdgeCues();
        clearDotBlink();
        inZone = null;
        if (isMobileViewport()) {
            window.scrollTo({ top: mobileTargetTop(pages[idx]), behavior: 'smooth' });
            setActive(idx, { focus: false, resetScroll: false });
        } else {
            engine.scrollTo({ top: pages[idx].offsetTop, behavior: 'smooth' });
            setActive(idx);
        }
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

    // --- Edge-of-page warning cues: transient glow + active-dot blink ---
    const EDGE_ZONE   = 48;  // px from a hard edge that counts as "at the edge"
    const HARD_EDGE   = 3;   // px tolerance for the absolute scroll limit
    const CUE_FADE_MS = 950;

    const glowTop    = document.createElement('div');
    const glowBottom = document.createElement('div');
    glowTop.className    = 'edge-glow edge-glow--top';
    glowBottom.className = 'edge-glow edge-glow--bottom';
    document.body.append(glowTop, glowBottom);

    let cueTimer = null;
    let inZone = null;
    let blinkDot = null;
    let blinkTimer = null;
    const lastScrollTop = pages.map(p => p.scrollTop);

    function pageIsScrollable(p) {
        return p.scrollHeight > p.clientHeight + 4;
    }

    function pageColor(idx) {
        const key = pages[idx]?.querySelector('.page-avatar')?.dataset.color || 'accent-1';
        const rootStyle = getComputedStyle(document.documentElement);
        return rootStyle.getPropertyValue(`--${key}`).trim()
            || rootStyle.getPropertyValue('--accent-1').trim();
    }

    function hideEdgeCues() {
        glowTop.classList.remove('visible');
        glowBottom.classList.remove('visible');
    }

    function clearDotBlink() {
        if (blinkTimer) { clearTimeout(blinkTimer); blinkTimer = null; }
        if (blinkDot) {
            blinkDot.classList.remove('dot-edge-blink', 'show-label');
            blinkDot.style.removeProperty('--edge-glow-color');
            blinkDot = null;
        }
    }

    // Blink the DESTINATION dot — "press or rail-scroll here" —
    // in that page's own identity color, with its label shown.
    function blinkDestinationDot(idx) {
        const dot = dots[idx];
        if (!dot) return;
        if (dot.classList.contains('dot-edge-blink')) return; // let a running blink finish
        clearDotBlink();
        blinkDot = dot;
        dot.style.setProperty('--edge-glow-color', pageColor(idx));
        dot.classList.add('dot-edge-blink', 'show-label');
        blinkTimer = setTimeout(clearDotBlink, 1200);
    }

    function showEdgeCue(which) {
        if (isMobileViewport()) return;
        document.body.style.setProperty('--edge-glow-color', pageColor(current));
        (which === 'top' ? glowTop : glowBottom).classList.add('visible');
        blinkDestinationDot(current + (which === 'bottom' ? 1 : -1));
        if (cueTimer) clearTimeout(cueTimer);
        cueTimer = setTimeout(hideEdgeCues, CUE_FADE_MS);
    }

    pages.forEach((page, i) => {
        let edgeRaf = null;

        page.addEventListener('scroll', () => {
            if (i !== current) { lastScrollTop[i] = page.scrollTop; return; }
            if (isPaging || edgeRaf) return;
            edgeRaf = requestAnimationFrame(() => {
                edgeRaf = null;
                if (i !== current || !pageIsScrollable(page) || isMobileViewport()) return;
                const dyDir = page.scrollTop - lastScrollTop[i];
                lastScrollTop[i] = page.scrollTop;
                const atBottom = page.scrollTop + page.clientHeight >= page.scrollHeight - EDGE_ZONE;
                const atTop    = page.scrollTop <= EDGE_ZONE;
                const zone = atBottom ? 'bottom' : (atTop ? 'top' : null);
                if (zone === 'bottom' && inZone !== 'bottom' && dyDir > 0) showEdgeCue('bottom');
                else if (zone === 'top' && inZone !== 'top' && dyDir < 0) showEdgeCue('top');
                else if (!zone && inZone) hideEdgeCues();
                inZone = zone;
            });
        }, { passive: true });

        // Attempted overscroll at a hard edge re-triggers the cue.
        // Passive on purpose — must never be able to block or lag scrolling.
        page.addEventListener('wheel', (e) => {
            if (i !== current || isPaging || isMobileViewport() || !pageIsScrollable(page)) return;
            const dy = normalizedWheelDeltaY(e);
            const atHardBottom = page.scrollTop + page.clientHeight >= page.scrollHeight - HARD_EDGE;
            const atHardTop    = page.scrollTop <= HARD_EDGE;
            if (dy > 0 && atHardBottom) showEdgeCue('bottom');
            else if (dy < 0 && atHardTop) showEdgeCue('top');
        }, { passive: true });
    });

    function mobileActiveIndex() {
        const navHeight = navbarEl?.offsetHeight || 0;
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        if (window.scrollY >= maxScroll - 4) return pages.length - 1;

        const marker = navHeight + Math.min(window.innerHeight * 0.35, 240);
        let fallback = 0;
        let fallbackDistance = Infinity;

        for (let i = 0; i < pages.length; i += 1) {
            const rect = pages[i].getBoundingClientRect();
            if (rect.top <= marker && rect.bottom > marker) return i;
            const distance = Math.abs(rect.top - marker);
            if (distance < fallbackDistance) {
                fallback = i;
                fallbackDistance = distance;
            }
        }

        return fallback;
    }

    let mobileActiveRaf = null;
    function scheduleMobileActiveSync() {
        if (!isMobileViewport() || mobileActiveRaf) return;
        mobileActiveRaf = requestAnimationFrame(() => {
            mobileActiveRaf = null;
            const idx = mobileActiveIndex();
            if (idx !== current) {
                setActive(idx, { focus: false, resetScroll: false, closeMenu: false });
            }
        });
    }

    window.addEventListener('scroll', scheduleMobileActiveSync, { passive: true });
    window.addEventListener('resize', scheduleMobileActiveSync, { passive: true });

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

    const initialIdx = window.location.hash
        ? pages.findIndex(p => `#${p.id}` === window.location.hash)
        : 0;
    setActive(initialIdx > -1 ? initialIdx : 0, { notifyLifecycle: false });

    if (current > 0) {
        requestAnimationFrame(() => {
            if (isMobileViewport()) {
                window.scrollTo({ top: mobileTargetTop(pages[current]), behavior: 'auto' });
            } else {
                engine?.scrollTo({ top: pages[current].offsetTop, behavior: 'auto' });
            }
        });
    }

    return { goTo, next: () => goTo(current + 1), prev: () => goTo(current - 1), current: () => current };
})();
