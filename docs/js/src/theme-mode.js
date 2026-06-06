// All themes available for all avatars — no grouping.
const THEMES = [
    { id: 'crimson', label: 'Crimson', icon: '🌹' },
    { id: 'dark',    label: 'Quantum', icon: '🌌' },
    { id: 'carbon',  label: 'Carbon',  icon: '🔥' },
    { id: 'dusk',    label: 'Dusk',    icon: '🌇' },
    { id: 'volt',    label: 'Volt',    icon: '⚡'  },
    { id: 'light-editorial', label: 'Light Editorial', icon: '1' },
    { id: 'mid-atmosphere', label: 'Mid Atmosphere', icon: '2' },
];

const avatarPool = ['assets/images/avatar_1.webp'];
const THEME_MODES = {
    dark: ['dark', 'crimson', 'carbon', 'dusk', 'volt'],
    light: ['light-editorial'],
    mid: ['mid-atmosphere'],
};
const MODE_STORAGE_KEY = 'selectedThemeMode';
const DARK_INDEX_STORAGE_KEY = 'darkThemeIndex';
const LOCAL_PREVIEW_STORAGE_KEY = 'localPreviewEnabled';
const MOBILE_VIEWPORT_BREAKPOINT = 900;
const MOBILE_THEME_ID = 'crimson';

const htmlEl = document.documentElement;
const bodyEl = document.body;
const modeButtons = Array.from(document.querySelectorAll('[data-theme-mode]'));
let mobileBlockedState = null;

function isMobileViewport() {
    return window.innerWidth <= MOBILE_VIEWPORT_BREAKPOINT;
}

function isMobileBlockedViewport() {
    return false;
}

function syncMobileDeviceBlock() {
    const mobile = isMobileViewport();
    bodyEl?.classList.toggle('mobile-scroll-mode', mobile);
    bodyEl?.classList.remove('mobile-device-blocked');
    bodyEl?.setAttribute('data-device-blocked', 'false');
    bodyEl?.setAttribute('data-mobile-mode', mobile ? 'true' : 'false');
    if (mobile) {
        htmlEl.setAttribute('data-theme', MOBILE_THEME_ID);
        localStorage.setItem('selectedTheme', MOBILE_THEME_ID);
        localStorage.setItem(MODE_STORAGE_KEY, 'dark');
        syncModeButtons('dark');
    }
    mobileBlockedState = mobile;
    return mobile;
}

syncMobileDeviceBlock();
window.addEventListener('resize', syncMobileDeviceBlock);
window.addEventListener('orientationchange', syncMobileDeviceBlock);

function applyTheme(themeId) {
    if (isMobileViewport()) {
        themeId = MOBILE_THEME_ID;
    }
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0]; // fallback → crimson
    htmlEl.setAttribute('data-theme', theme.id);
    localStorage.setItem('selectedTheme', theme.id);
}

function syncModeButtons(modeId) {
    modeButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.themeMode === modeId);
    });
}

function inferModeFromTheme(themeId) {
    if (THEME_MODES.light.includes(themeId)) return 'light';
    if (THEME_MODES.mid.includes(themeId)) return 'mid';
    return 'dark';
}

function applyThemeMode(modeId, { advanceDark = false } = {}) {
    const mode = THEME_MODES[modeId] ? modeId : 'dark';
    let themeId = THEME_MODES[mode][0];

    if (mode === 'dark') {
        const darkThemes = THEME_MODES.dark;
        const storedIndex = parseInt(localStorage.getItem(DARK_INDEX_STORAGE_KEY) || '-1', 10);
        const nextIndex = advanceDark
            ? ((Number.isNaN(storedIndex) ? -1 : storedIndex) + 1 + darkThemes.length) % darkThemes.length
            : Math.max(0, Number.isNaN(storedIndex) ? 0 : Math.min(storedIndex, darkThemes.length - 1));
        themeId = darkThemes[nextIndex];
        localStorage.setItem(DARK_INDEX_STORAGE_KEY, String(nextIndex));
    }

    applyTheme(themeId);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
    syncModeButtons(mode);
}

function initialThemeMode() {
    const storedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (storedMode && THEME_MODES[storedMode]) return storedMode;
    const storedTheme = localStorage.getItem('selectedTheme');
    return storedTheme ? inferModeFromTheme(storedTheme) : 'mid';
}

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

    button.addEventListener('click', async () => {
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
