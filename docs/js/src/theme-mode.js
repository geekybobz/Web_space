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

const avatarPool = ['assets/images/optimized/avatar_1-320.webp'];
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
const DESKTOP_DEFAULT_THEME_ID = 'crimson';

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
    return storedTheme ? inferModeFromTheme(storedTheme) : 'dark';
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

async function stopLocalPreviewServer() {
    try {
        const response = await fetch('/__exit_preview__', {
            method: 'POST',
            keepalive: true,
            cache: 'no-store',
        });
        return response.ok;
    } catch {
        return false;
    }
}

async function loadLocalPreviewStatus() {
    try {
        const response = await fetch('/__preview_status__', { cache: 'no-store' });
        if (!response.ok) throw new Error('Preview status unavailable');
        return await response.json();
    } catch {
        return {
            status: 'unknown',
            port: window.location.port || '80',
            localUrl: window.location.href,
            lanUrl: null,
            lanEnabled: false,
        };
    }
}

async function setWifiPreview(action) {
    const response = await fetch('/__wifi_preview__', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
    });
    if (!response.ok) throw new Error('WiFi preview update failed');
    return response.json();
}

async function copyPreviewText(text, button) {
    if (!text) return;
    const originalText = button.textContent;
    try {
        await navigator.clipboard.writeText(text);
        button.textContent = 'Copied';
    } catch {
        button.textContent = 'Copy failed';
    }
    window.setTimeout(() => {
        button.textContent = originalText;
    }, 1100);
}

function createPreviewRow(label, value, copyLabel = 'Copy') {
    const row = document.createElement('div');
    row.className = 'local-preview-row';

    const text = document.createElement('div');
    text.className = 'local-preview-row-text';

    const labelEl = document.createElement('span');
    labelEl.className = 'local-preview-row-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.className = 'local-preview-row-value';
    valueEl.textContent = value;

    text.append(labelEl, valueEl);
    row.appendChild(text);

    if (copyLabel) {
        const copyButton = document.createElement('button');
        copyButton.className = 'local-preview-action';
        copyButton.type = 'button';
        copyButton.textContent = copyLabel;
        copyButton.addEventListener('click', () => copyPreviewText(value, copyButton));
        row.appendChild(copyButton);
    }

    return row;
}

function initLocalPreviewControls() {
    if (!isLocalPreview()) return;
    document.body.classList.add('local-preview');

    const control = document.createElement('div');
    control.className = 'local-preview-control';
    control.id = 'local-preview-control';

    const toggle = document.createElement('button');
    toggle.className = 'local-preview-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = `Port ${window.location.port || '80'}`;

    const panel = document.createElement('div');
    panel.className = 'local-preview-panel';
    panel.hidden = true;

    const title = document.createElement('div');
    title.className = 'local-preview-title';
    title.textContent = 'Local server';

    const meta = document.createElement('div');
    meta.className = 'local-preview-meta';
    meta.textContent = 'Checking preview status...';

    const rows = document.createElement('div');
    rows.className = 'local-preview-rows';

    const wifiButton = document.createElement('button');
    wifiButton.className = 'local-preview-action local-preview-wifi';
    wifiButton.type = 'button';
    wifiButton.textContent = 'Start WiFi :2032';

    const stopButton = document.createElement('button');
    stopButton.className = 'local-preview-action local-preview-stop';
    stopButton.id = 'local-preview-exit';
    stopButton.type = 'button';
    stopButton.textContent = 'Stop server';

    panel.append(title, meta, rows, wifiButton, stopButton);
    control.append(toggle, panel);
    document.body.appendChild(control);

    toggle.addEventListener('click', () => {
        const expanded = panel.hidden;
        panel.hidden = !expanded;
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    const renderStatus = (status) => {
        const wifi = status.wifiPreview || {};
        const port = status.port || window.location.port || '80';
        toggle.textContent = `Port ${port}`;
        meta.textContent = wifi.running
            ? `Desktop :${port} and WiFi :${wifi.port || 2032} are both running.`
            : `Desktop preview is running on :${port}. WiFi preview can run in parallel.`;
        wifiButton.textContent = wifi.running ? `Stop WiFi :${wifi.port || 2032}` : `Start WiFi :${wifi.port || 2032}`;
        wifiButton.dataset.action = wifi.running ? 'stop' : 'start';
        rows.replaceChildren(
            createPreviewRow('Desktop', status.localUrl || window.location.href),
            wifi.url
                ? createPreviewRow('Phone/LAN', wifi.url)
                : createPreviewRow('Phone/LAN', wifi.error || 'WiFi preview is stopped.', null),
        );
    };

    loadLocalPreviewStatus().then(renderStatus);

    wifiButton.addEventListener('click', async () => {
        if (wifiButton.disabled) return;
        const action = wifiButton.dataset.action || 'start';
        wifiButton.disabled = true;
        wifiButton.textContent = action === 'stop' ? 'Stopping WiFi...' : 'Starting WiFi...';
        try {
            renderStatus(await setWifiPreview(action));
        } catch {
            meta.textContent = 'Could not update WiFi preview. Check whether port 2032 is already in use.';
        } finally {
            wifiButton.disabled = false;
        }
    });

    stopButton.addEventListener('click', async () => {
        if (stopButton.disabled) return;
        if (!window.confirm('Exit local preview and stop the local server?')) return;

        stopButton.disabled = true;
        stopButton.textContent = 'Stopping...';

        const stopped = await Promise.race([
            stopLocalPreviewServer(),
            new Promise((resolve) => window.setTimeout(() => resolve(false), 1500)),
        ]);

        sessionStorage.removeItem(LOCAL_PREVIEW_STORAGE_KEY);

        if (stopped) {
            stopButton.textContent = 'Server stopped';
        } else {
            stopButton.textContent = 'Close tab';
        }

        window.setTimeout(() => {
            attemptWindowClose();
        }, 180);

        window.setTimeout(() => {
            if (!window.closed) {
                window.location.replace('about:blank');
            }
        }, 420);
    });
}
