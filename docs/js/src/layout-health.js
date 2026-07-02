// Adaptive layout health: smooth desktop proportions and flag extreme zoom/window states.
(() => {
    if (window.__layoutHealthInit) return;
    window.__layoutHealthInit = true;

    const root = document.documentElement;
    const STORAGE_FIT = 'webspace-layout-fit-site';
    const STORAGE_DISMISS = 'webspace-layout-health-dismissed-session';
    const BASE_ROOT_PX = 13;
    const REF_AREA = 1440 * 900;
    let toast;
    let raf = null;

    function clamp(min, value, max) {
        return Math.max(min, Math.min(max, value));
    }

    function viewport() {
        const vv = window.visualViewport;
        return {
            width: vv?.width || window.innerWidth,
            height: vv?.height || window.innerHeight,
            scale: vv?.scale || 1,
        };
    }

    function classify(vp) {
        const finePointer = window.matchMedia('(pointer: fine)').matches;
        const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
        const stackedWidth = vp.width <= 900;
        const wide = finePointer && vp.width >= 1900 && vp.height >= 1000;
        const compact = finePointer && !stackedWidth && (vp.width < 1180 || vp.height < 740);
        const attention = finePointer && (vp.width < 980 || vp.height < 560 || vp.scale > 1.15);

        let density = 'normal';
        if (stackedWidth) density = 'mobile';
        else if (compact) density = 'compact';
        else if (wide) density = 'wide';

        return {
            attention,
            density,
            finePointer,
            input: finePointer ? 'fine' : (coarsePointer ? 'coarse' : 'unknown'),
        };
    }

    function rootScale(vp, state) {
        if (!state.finePointer) return null;
        let scale = clamp(0.94, Math.sqrt((vp.width * vp.height) / REF_AREA), 1.08);

        if (state.density === 'compact') scale = Math.min(scale, vp.height < 620 ? 0.92 : 0.96);
        if (state.density === 'wide') scale = Math.max(scale, 1.05);
        if (sessionStorage.getItem(STORAGE_FIT) === '1') scale = Math.min(scale, 0.91);

        return clamp(0.9, scale, 1.1);
    }

    function ensureToast() {
        if (toast) return toast;
        toast = document.createElement('div');
        toast.className = 'layout-health-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.innerHTML = `
            <div class="layout-health-toast__text">
                <strong>Display scale is tight.</strong>
                <span>Reset browser zoom with Cmd/Ctrl+0, or fit this site.</span>
            </div>
            <div class="layout-health-toast__actions">
                <button type="button" data-layout-fit>Fit site</button>
                <button type="button" data-layout-dismiss>Dismiss</button>
            </div>
        `;
        document.body.appendChild(toast);

        toast.querySelector('[data-layout-fit]')?.addEventListener('click', () => {
            sessionStorage.setItem(STORAGE_FIT, '1');
            sessionStorage.setItem(STORAGE_DISMISS, '1');
            applyLayout();
        });

        toast.querySelector('[data-layout-dismiss]')?.addEventListener('click', () => {
            sessionStorage.setItem(STORAGE_DISMISS, '1');
            toast.classList.remove('is-visible');
        });

        return toast;
    }

    function syncToast(state) {
        const node = ensureToast();
        const dismissed = sessionStorage.getItem(STORAGE_DISMISS) === '1';
        node.classList.toggle('is-visible', state.attention && !dismissed);
    }

    function applyLayout() {
        const vp = viewport();
        const state = classify(vp);
        const scale = rootScale(vp, state);
        const fitSite = sessionStorage.getItem(STORAGE_FIT) === '1';

        root.dataset.layoutDensity = state.density;
        root.dataset.layoutHealth = state.attention ? 'attention' : 'good';
        root.dataset.layoutInput = state.input;
        root.dataset.layoutFit = fitSite ? 'site' : 'auto';
        root.style.setProperty('--layout-scale', scale ? scale.toFixed(3) : '1');
        root.style.setProperty('--layout-vw', `${Math.round(vp.width)}px`);
        root.style.setProperty('--layout-vh', `${Math.round(vp.height)}px`);

        if (scale) {
            root.style.setProperty('--adaptive-root-font-size', `${(BASE_ROOT_PX * scale).toFixed(2)}px`);
        } else {
            root.style.removeProperty('--adaptive-root-font-size');
        }

        syncToast(state);
    }

    function scheduleApply() {
        if (raf) return;
        raf = requestAnimationFrame(() => {
            raf = null;
            applyLayout();
        });
    }

    applyLayout();
    window.addEventListener('resize', scheduleApply, { passive: true });
    window.addEventListener('orientationchange', scheduleApply, { passive: true });
    window.visualViewport?.addEventListener('resize', scheduleApply, { passive: true });
    window.visualViewport?.addEventListener('scroll', scheduleApply, { passive: true });
})();
