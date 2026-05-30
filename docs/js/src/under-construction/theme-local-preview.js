// ── Theme mode toggle ─────────────────────────────────
const themesByMode = {
    dark: ['dark', 'crimson', 'carbon', 'dusk', 'volt'],
    light: ['light-editorial'],
    mid: ['mid-atmosphere'],
};
const modeButtons = Array.from(document.querySelectorAll('[data-theme-mode]'));
const modeStorageKey = 'selectedThemeMode';
const darkIndexStorageKey = 'darkThemeIndex';

function syncModeButtons(modeId) {
    modeButtons.forEach(button => button.classList.toggle('active', button.dataset.themeMode === modeId));
}

function inferMode(themeId) {
    if (themesByMode.light.includes(themeId)) return 'light';
    if (themesByMode.mid.includes(themeId)) return 'mid';
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
modeButtons.forEach(button => button.addEventListener('click', () => applyMode(button.dataset.themeMode, false)));
