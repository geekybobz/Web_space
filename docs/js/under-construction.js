/* Generated file. Edit docs/js/src/under-construction/**, not docs/js/under-construction.js. */

/* Source: js/src/under-construction/cursor.js */

        // ── Custom cursor ──────────────────────────────────────
        const dot     = document.getElementById('cursor-dot');
        const outline = document.getElementById('cursor-outline');
        let mx = -100, my = -100, ox = -100, oy = -100;
        window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        (function animCursor() {
            ox += (mx - ox) * 0.15;
            oy += (my - oy) * 0.15;
            dot.style.left     = mx + 'px';
            dot.style.top      = my + 'px';
            outline.style.left = ox + 'px';
            outline.style.top  = oy + 'px';
            requestAnimationFrame(animCursor);
        })();

/* Source: js/src/under-construction/progress.js */
        // ── Animated progress bar (random drift) ──────────────
        const fill   = document.getElementById('progress-fill');
        const pctTxt = document.getElementById('pct-display');
        let current  = 0;
        const MIN = 12, MAX = 78;

        (function rampUp() {
            if (current < 40) {
                current = Math.min(current + 1.2, 40);
                fill.style.width   = current + '%';
                pctTxt.textContent = Math.round(current) + '%';
                requestAnimationFrame(rampUp);
            } else {
                setInterval(() => {
                    // -6 to +8: slight optimism bias 😄
                    const step = (Math.random() * 14) - 6;
                    current = Math.min(MAX, Math.max(MIN, current + step));
                    fill.style.width   = current.toFixed(1) + '%';
                    pctTxt.textContent = Math.round(current) + '%';
                }, 900);
            }
        })();

/* Source: js/src/under-construction/entrance.js */
// ── Subtle card entrance ───────────────────────────────
const card = document.querySelector('.uc-card');
card.style.opacity   = '0';
card.style.transform = 'translateY(28px)';
card.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
requestAnimationFrame(() => requestAnimationFrame(() => {
    card.style.opacity   = '1';
    card.style.transform = 'translateY(0)';
}));

/* Source: js/src/under-construction/theme-local-preview.js */
// ── Theme mode toggle ─────────────────────────────────
const themesByMode = {
    dark: ['dark', 'crimson', 'carbon', 'dusk', 'volt'],
    light: ['light-editorial'],
    // Temporarily disabled while the bright theme is being redesigned.
    // mid: ['mid-atmosphere'],
};
const modeButtons = Array.from(document.querySelectorAll('[data-theme-mode]'));
const modeStorageKey = 'selectedThemeMode';
const darkIndexStorageKey = 'darkThemeIndex';

function syncModeButtons(modeId) {
    modeButtons.forEach(button => button.classList.toggle('active', button.dataset.themeMode === modeId));
}

function inferMode(themeId) {
    if (themesByMode.light.includes(themeId)) return 'light';
    if (themesByMode.mid?.includes(themeId)) return 'mid';
    return 'dark';
}

function initialMode() {
    const storedMode = localStorage.getItem(modeStorageKey);
    if (storedMode && themesByMode[storedMode]) return storedMode;
    return inferMode(document.documentElement.getAttribute('data-theme') || 'dark');
}

const LOCAL_PREVIEW_STORAGE_KEY = 'localPreviewEnabled';

function isLocalPreview() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('localPreview') === '1') {
        sessionStorage.setItem(LOCAL_PREVIEW_STORAGE_KEY, '1');
    }
    return sessionStorage.getItem(LOCAL_PREVIEW_STORAGE_KEY) === '1';
}

function attemptWindowClose() {
    window.open('', '_self');
    window.close();
}

function initLocalPreviewControls() {
    if (!isLocalPreview()) return;
    document.body.classList.add('local-preview');

    // Inject button dynamically — never ships in production HTML
    const button = document.createElement('button');
    button.className = 'local-preview-exit';
    button.id = 'local-preview-exit';
    button.type = 'button';
    button.textContent = 'Exit Preview';
    document.body.appendChild(button);

    button.addEventListener('click', () => {
        if (button.disabled) return;
        if (!window.confirm('Exit local preview and stop the local server?')) return;

        button.disabled = true;
        button.textContent = 'Exiting...';

        fetch('/__exit_preview__', {
            method: 'POST',
            keepalive: true,
        }).catch(() => {});

        window.setTimeout(() => {
            attemptWindowClose();
        }, 120);

        window.setTimeout(() => {
            if (!window.closed) {
                window.location.replace('about:blank');
                window.setTimeout(() => {
                    attemptWindowClose();
                }, 60);
            }
        }, 320);
    });
}

initLocalPreviewControls();

function applyMode(modeId, advanceDark = false) {
    const mode = themesByMode[modeId] ? modeId : 'dark';
    let themeId = themesByMode[mode][0];
    if (mode === 'dark') {
        const storedIndex = parseInt(localStorage.getItem(darkIndexStorageKey) || '-1', 10);
        const nextIndex = advanceDark
            ? ((Number.isNaN(storedIndex) ? -1 : storedIndex) + 1 + themesByMode.dark.length) % themesByMode.dark.length
            : Math.max(0, Number.isNaN(storedIndex) ? 0 : Math.min(storedIndex, themesByMode.dark.length - 1));
        themeId = themesByMode.dark[nextIndex];
        localStorage.setItem(darkIndexStorageKey, String(nextIndex));
    }
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem(modeStorageKey, mode);
    syncModeButtons(mode);
}

const mode = initialMode();
applyMode(mode, mode === 'dark');
// Theme toggle temporarily disabled while bright mode is being redesigned.
// modeButtons.forEach(button => button.addEventListener('click', () => applyMode(button.dataset.themeMode, false)));
