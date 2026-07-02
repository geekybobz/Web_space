/* Generated file. Edit docs/js/src/**, not docs/js/main.js. */

/* Source: js/src/loader.js */
// =====================================================
// INTRO LOADER — waves + drift
// =====================================================
(function initLoader() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.innerWidth <= 900 || prefersReducedMotion) {
        const l = document.getElementById('q-loader');
        if (l) {
            l.style.transition = 'opacity 0.22s ease, visibility 0.22s ease';
            l.classList.add('q-loader--hidden');
        }
        document.documentElement.setAttribute('data-theme', 'crimson');
        setTimeout(triggerHeroFadeIn, 0);
        sessionStorage.setItem('q-intro-seen', '1');
        return;
    }

    if (sessionStorage.getItem('q-intro-seen')) {
        const l = document.getElementById('q-loader');
        if (l) { l.style.transition = 'none'; l.classList.add('q-loader--hidden'); }
        document.documentElement.setAttribute('data-theme', localStorage.getItem('selectedTheme') || 'dark');
        setTimeout(triggerHeroFadeIn, 0);
        return;
    }

    const loader   = document.getElementById('q-loader');
    const nameEl   = document.getElementById('q-name-display');
    const statusEl = document.getElementById('q-loader-status');
    const barEl    = document.getElementById('q-loader-bar');
    const sinePath = document.getElementById('q-wave-sine');
    const stepPath = document.getElementById('q-wave-step');
    const driftEl  = document.getElementById('q-drift-field');
    const html     = document.documentElement;

    if (!loader) { triggerHeroFadeIn(); return; }

    // ── drift field (built once, runs forever) ──────────────────────────────────────
    const PHYS = ['ψ','α','β','∂','ℏ','∑','∇','ω','λ','σ','ε','ρ'];
    const CODE = ['0','1','{','}','f','x','→','n','i','[',']','*'];
    for (let i = 0; i < 28; i++) {
        const phys = Math.random() > 0.5;
        const pool = phys ? PHYS : CODE;
        const s    = document.createElement('span');
        s.textContent = pool[Math.floor(Math.random() * pool.length)];
        const op  = (0.03 + Math.random() * 0.045).toFixed(3);
        const dur = (11  + Math.random() * 16).toFixed(1);
        const del = (-Math.random() * 27).toFixed(1);
        const sz  = (0.46 + Math.random() * 0.52).toFixed(2);
        s.style.cssText =
            'position:absolute;' +
            `left:${(Math.random() * 100).toFixed(1)}%;` +
            'bottom:-6%;' +
            'font-family:monospace;' +
            `font-size:${sz}rem;` +
            `color:${phys ? 'var(--accent-2)' : 'var(--accent-1)'};` +
            `opacity:${op};` +
            `animation:sym-drift ${dur}s linear ${del}s infinite;` +
            'pointer-events:none;will-change:transform;';
        driftEl.appendChild(s);
    }

    // ── waveforms ────────────────────────────────────────────────────
    function buildSinePath(W, H, cy, amp, freq, phase) {
        let d = '';
        for (let x = 0; x <= W; x += 10) {
            const y = cy + amp * Math.sin(freq * (x / W) * 2 * Math.PI + phase);
            d += (d ? 'L' : 'M') + x.toFixed(0) + ',' + y.toFixed(1) + ' ';
        }
        return d;
    }
    function buildStepPath(W, H, cy, amp, freq, steps) {
        let d = '', py = 0;
        for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * W;
            const y = cy + amp * Math.sin(freq * (i / steps) * 2 * Math.PI);
            if (!d) { d = `M${x.toFixed(0)},${y.toFixed(1)} `; py = y; continue; }
            d += `L${x.toFixed(0)},${py.toFixed(1)} L${x.toFixed(0)},${y.toFixed(1)} `;
            py = y;
        }
        return d;
    }
    let wPhase = 0, waveActive = true;
    (function tickWaves() {
        if (!waveActive) return;
        const W = window.innerWidth, H = window.innerHeight;
        const amp = 18 + 7 * Math.sin(Date.now() / 2300);
        sinePath.setAttribute('d', buildSinePath(W, H, H * 0.2, amp, 2.5, wPhase));
        stepPath.setAttribute('d', buildStepPath(W, H, H * 0.8, amp * 0.85, 2.5, 20));
        wPhase += 0.004;
        requestAnimationFrame(tickWaves);
    })();

    // ── Zone 1: word cycle → scramble → name lock ──────────────────────────────
    const WORDS  = ['PHYSICIST','PROGRAMMER','OPTIMIZER','THEORIST','CODER','RESEARCHER','BUILDER'];
    const TARGET = 'MOHAMMED BILAL P S';
    const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZαβψ∇∂∑∫0123456789';

    let wordIdx = 0;
    nameEl.textContent = WORDS[0];
    const wordTimer = setInterval(() => {
        wordIdx++;
        nameEl.textContent = WORDS[wordIdx % WORDS.length];
    }, 160);

    setTimeout(() => {
        clearInterval(wordTimer);
        const locked = new Array(TARGET.length).fill(null);
        const scrambleInterval = setInterval(() => {
            nameEl.textContent = TARGET.split('').map((ch, i) => {
                if (locked[i] !== null) return locked[i];
                if (ch === ' ') return ' ';
                return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }).join('');
        }, 55);
        let lockPos = 0;
        const lockTimer = setInterval(() => {
            if (lockPos >= TARGET.length) { clearInterval(lockTimer); clearInterval(scrambleInterval); return; }
            while (lockPos < TARGET.length && TARGET[lockPos] === ' ') { locked[lockPos] = ' '; lockPos++; }
            if (lockPos < TARGET.length) { locked[lockPos] = TARGET[lockPos]; lockPos++; }
        }, 72);
    }, 620);

    // ── status cycling ───────────────────────────────────────────────────
    const statuses = ['reading the system...','iterating...','propagating...','refining...','stable.','converged.'];
    let sIdx = 0;
    statusEl.textContent = statuses[0];
    const statusTimer = setInterval(() => {
        sIdx = (sIdx + 1) % statuses.length;
        statusEl.style.opacity = '0';
        setTimeout(() => { statusEl.textContent = statuses[sIdx]; statusEl.style.opacity = '1'; }, 200);
    }, 700);

    // ── progress bar ───────────────────────────────────────────────────────────
    let p = 0;
    const progTimer = setInterval(() => {
        let inc;
        if      (p < 70) inc = Math.random() * 14 + 8;
        else             inc = Math.random() * 9 + 5;
        p = Math.min(p + inc, 100);
        barEl.style.width = Math.floor(p) + '%';

        if (p >= 100) {
            clearInterval(progTimer);
            clearInterval(statusTimer);
            statusEl.style.opacity = '0';
            const barWrap = barEl.parentElement;
            if (barWrap) barWrap.style.opacity = '0';
            setTimeout(() => {
                waveActive = false;
                if (driftEl) driftEl.innerHTML = '';
                html.setAttribute('data-theme', localStorage.getItem('selectedTheme') || 'dark');
                loader.classList.add('q-loader--hidden');
                triggerHeroFadeIn();
                sessionStorage.setItem('q-intro-seen', '1');
            }, 180);
        }
    }, 70);
})();

function triggerHeroFadeIn() {
    const fastIntro = window.innerWidth <= 900 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.intro-fade').forEach(el => {
        const delay = fastIntro ? 0 : (el.dataset.delay ? parseFloat(el.dataset.delay) : 0);
        el.style.animationDelay = delay + 's';
        el.classList.add('intro-visible');
    });
    setTimeout(startTypewriter, fastIntro ? 80 : 420);
}

/* Source: js/src/hero-typewriter.js */
let _twTimeoutId = null;
let _twRunning = false;

function startTypewriter() {
    if (_twRunning) return;
    const el = document.getElementById('hero-typewriter');
    if (!el) return;
    _twRunning = true;
    const phrases = [
        'Physicist by obsession',
        'Control engineer by necessity',
        'ML researcher by curiosity',
        'Quantum babysitter by reputation',
    ];
    let pIdx = 0, cIdx = 0, deleting = false;
    function tick() {
        if (!_twRunning) return;
        const phrase = phrases[pIdx];
        let delay;
        if (!deleting) {
            cIdx++;
            el.textContent = phrase.slice(0, cIdx);
            if (cIdx === phrase.length) { deleting = true; delay = 1800; }
            else delay = 48;
        } else {
            cIdx--;
            el.textContent = phrase.slice(0, cIdx);
            if (cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; delay = 240; }
            else delay = 26;
        }
        _twTimeoutId = setTimeout(tick, delay);
    }
    tick();
}

function stopTypewriter() {
    _twRunning = false;
    if (_twTimeoutId) { clearTimeout(_twTimeoutId); _twTimeoutId = null; }
    const el = document.getElementById('hero-typewriter');
    if (el) el.textContent = '';
}

// ========== THEME SWITCHER ==========

/* Source: js/src/theme-mode.js */
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
    mid: ['mid-atmosphere'],
};
const MODE_STORAGE_KEY = 'selectedThemeMode';
const DARK_INDEX_STORAGE_KEY = 'darkThemeIndex';
const LOCAL_PREVIEW_STORAGE_KEY = 'localPreviewEnabled';
const MOBILE_VIEWPORT_BREAKPOINT = 900;
const MOBILE_THEME_ID = 'mid-atmosphere';
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
        localStorage.setItem(MODE_STORAGE_KEY, 'mid');
        syncModeButtons('mid');
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

/* Source: js/src/avatar-theme-init.js */
// ========== AVATAR + THEME SELECTION ==========
const avatarImg = document.querySelector('.profile-pic');
const FIXED_AVATAR = 'assets/images/optimized/avatar_1-320.webp';

(function initAvatarAndTheme() {
    if (avatarImg) avatarImg.src = FIXED_AVATAR;
    localStorage.setItem('selectedAvatar', FIXED_AVATAR);

    localStorage.setItem('selectedTheme', DESKTOP_DEFAULT_THEME_ID);
    localStorage.setItem('selectedThemeMode', 'dark');
    localStorage.setItem('darkThemeIndex', '0');
    applyTheme(isMobileViewport() ? MOBILE_THEME_ID : DESKTOP_DEFAULT_THEME_ID);
    syncModeButtons('dark');
})();

modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        applyThemeMode(button.dataset.themeMode, { advanceDark: false });
    });
});

initLocalPreviewControls();

/* Source: js/src/project-toggles.js */
// ========== PROJECT CARD TOGGLES ==========
const projectToggleButtons = Array.from(document.querySelectorAll('.project-toggle'));

if (projectToggleButtons.length) {
    const closeProjectCard = (button) => {
        const detailId = button.getAttribute('aria-controls');
        const detail = detailId ? document.getElementById(detailId) : null;
        if (!detail) return;
        detail.hidden = true;
        button.setAttribute('aria-expanded', 'false');
        button.textContent = 'View Abstract';
        button.closest('.research-card')?.classList.remove('is-open');
    };

    const openProjectCard = (button) => {
        const detailId = button.getAttribute('aria-controls');
        const detail = detailId ? document.getElementById(detailId) : null;
        if (!detail) return;
        projectToggleButtons.forEach((otherButton) => {
            if (otherButton !== button) closeProjectCard(otherButton);
        });
        detail.hidden = false;
        button.setAttribute('aria-expanded', 'true');
        button.textContent = 'Hide Abstract';
        button.closest('.research-card')?.classList.add('is-open');
    };

    projectToggleButtons.forEach((button) => {
        closeProjectCard(button);
        button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') === 'true';
            if (expanded) {
                closeProjectCard(button);
                return;
            }
            openProjectCard(button);
        });
    });
}

/* Source: js/src/poster-toggles.js */
// ========== POSTER TOGGLES ==========
const posterToggleButtons = Array.from(document.querySelectorAll('.poster-toggle'));
if (posterToggleButtons.length) {
    posterToggleButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('aria-controls');
            const embed = targetId ? document.getElementById(targetId) : null;
            if (!embed) return;
            const expanded = button.getAttribute('aria-expanded') === 'true';
            embed.hidden = expanded;
            button.setAttribute('aria-expanded', String(!expanded));
            const icon = button.querySelector('i');
            if (expanded) {
                button.childNodes[0].textContent = 'View Poster ';
                if (icon) { icon.className = 'fa-solid fa-arrow-right'; }
            } else {
                button.childNodes[0].textContent = 'Hide Poster ';
                if (icon) { icon.className = 'fa-solid fa-arrow-up'; }
                const iframe = embed.querySelector('iframe[data-src]');
                if (iframe && !iframe.hasAttribute('src')) {
                    iframe.setAttribute('src', iframe.dataset.src);
                }
            }
        });
    });
}

/* Source: js/src/avatar-tilt.js */
// ========== AVATAR TILT ==========
const avatarContainer = document.querySelector('.hero-avatar');
if (avatarContainer && avatarImg) {
    avatarContainer.addEventListener('mousemove', (e) => {
        const rect = avatarContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xRot =  12 * ((y - rect.height / 2) / rect.height);
        const yRot = -12 * ((x - rect.width  / 2) / rect.width);
        avatarImg.style.transform = `perspective(500px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale(1.22)`;
    });
    avatarContainer.addEventListener('mouseleave', () => {
        avatarImg.style.transform  = `perspective(500px) rotateX(0deg) rotateY(0deg) scale(1.15)`;
        avatarImg.style.transition = `transform 0.35s ease-out`;
    });
    avatarContainer.addEventListener('mouseenter', () => {
        avatarImg.style.transition = `transform 0.12s ease-out`;
    });
}

/* Source: js/src/custom-cursor.js */
// ========== CUSTOM CURSOR ==========
const cursorDot     = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const cursorAllowed = window.matchMedia('(min-width: 901px) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;

if (cursorDot && cursorOutline && cursorAllowed) {
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    let _cursorRafId = null;
    function _startCursorRaf() {
        if (_cursorRafId) return;
        function step() {
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;
            cursorOutline.style.left = outlineX + 'px';
            cursorOutline.style.top  = outlineY + 'px';
            if (Math.abs(mouseX - outlineX) + Math.abs(mouseY - outlineY) < 0.3) {
                _cursorRafId = null;
                return;
            }
            _cursorRafId = requestAnimationFrame(step);
        }
        _cursorRafId = requestAnimationFrame(step);
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top  = mouseY + 'px';
        _startCursorRaf();
    }, { passive: true });

    const interactables = document.querySelectorAll('a, button, .skill-tag, .project-card, .philosophy-card, .page-dot');
    interactables.forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(2)';
            cursorDot.style.backgroundColor = 'var(--accent-1)';
            cursorOutline.style.transform   = 'translate(-50%, -50%) scale(1.5)';
            cursorOutline.style.borderColor = 'var(--accent-1)';
        });
        item.addEventListener('mouseleave', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorDot.style.backgroundColor = 'var(--accent-2)';
            cursorOutline.style.transform   = 'translate(-50%, -50%) scale(1)';
            cursorOutline.style.borderColor = 'rgba(139, 92, 246, 0.5)';
        });
    });
} else {
    cursorDot?.remove();
    cursorOutline?.remove();
}

/* Source: js/src/navbar-mobile.js */
// ========== NAVBAR SCROLL CLASS ==========
const navbar = document.querySelector('.navbar');
// In page-engine mode the navbar stays fixed; mark .scrolled immediately for style
navbar?.classList.add('scrolled');

// ========== MOBILE NAV TOGGLE ==========
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinksEl   = document.querySelector('.nav-links');

if (mobileToggle && navLinksEl) {
    mobileToggle.addEventListener('click', () => {
        if (isMobileBlockedViewport()) return;
        navLinksEl.classList.toggle('active');
        const expanded = navLinksEl.classList.contains('active');
        const icon = mobileToggle.querySelector('i');
        mobileToggle.setAttribute('aria-expanded', String(expanded));
        mobileToggle.setAttribute('aria-label', expanded ? 'Close navigation menu' : 'Open navigation menu');
        if (expanded) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });
}

// =====================================================
// PAGE ENGINE

/* Source: js/src/mobile-scroll.js */
// MobileScrollMode — superseded by CSS scroll-snap in page-engine.js
const MobileScrollMode = { init() {}, goTo() {} };

/* Source: js/src/page-engine.js */
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
        hideEdgeCues();
        clearDotBlink();
        inZone = null;
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

/* Source: js/src/crt-terminal.js */
// ========== CRT TERMINAL LOG CYCLING ==========
let _crtPause = null;
let _crtResume = null;

(function initCRTTerminal() {
    if (typeof isMobileViewport === 'function' && isMobileViewport()) return;
    const log = document.getElementById('crt-log');
    if (!log) return;

    const messages = [
        { text: '> buildH(): drift + controls assembled', cls: '' },
        { text: '> forwardprop(): state cache updated', cls: 'log-dim' },
        { text: '> backwardprop(): adjoint trajectory ready', cls: 'log-ok' },
        { text: '> corrections(): dux, duy, duz computed', cls: '' },
        { text: '> optimizer: Adam(step0=0.05)', cls: 'log-dim' },
        { text: '> target_metric: fidelity', cls: 'log-dim' },
        { text: '> terminal_overlap: 0.9984', cls: 'log-ok' },
        { text: '> bound_function: fixed_norm_bound', cls: '' },
        { text: '> alpha-perturbation sweep: active', cls: 'log-warn' },
        { text: '> robustness check: PASS', cls: 'log-ok' },
        { text: '> U_T stored', cls: 'log-ok' },
        { text: '> awaiting next optimization run...', cls: 'log-warn' },
    ];

    const MAX_LINES = 8;
    let msgIdx = 0;
    let lines = [];
    let _crtIntervalId = null;

    _crtPause = function() {
        if (_crtIntervalId) { clearInterval(_crtIntervalId); _crtIntervalId = null; }
    };
    _crtResume = function() {
        if (_crtIntervalId) return;
        _crtIntervalId = setInterval(addLine, 1800);
    };

    function addLine() {
        const msg = messages[msgIdx % messages.length];
        msgIdx++;

        const span = document.createElement('span');
        span.className = 'log-line' + (msg.cls ? ' ' + msg.cls : '');
        span.textContent = msg.text;
        log.appendChild(span);
        lines.push(span);

        // Keep only MAX_LINES visible
        if (lines.length > MAX_LINES) {
            const old = lines.shift();
            old.style.transition = 'opacity 0.3s';
            old.style.opacity = '0';
            setTimeout(() => old.remove(), 320);
        }
    }

    // Boot: add first 4 lines quickly
    let bootCount = 0;
    const bootInterval = setInterval(() => {
        addLine();
        bootCount++;
        if (bootCount >= 4) {
            clearInterval(bootInterval);
            _crtResume();
        }
    }, 260);
})();

/* Source: js/src/analytics-toast.js */
// =========================================================
// ANALYTICS TOAST — shows once per browser, then remembers
// =========================================================
(function () {
    const STORAGE_KEY = 'gc_noticed';
    const toast  = document.getElementById('gc-toast');
    const closeBtn = document.getElementById('gc-toast-close');
    if (!toast || localStorage.getItem(STORAGE_KEY)) return;

    function dismiss() {
        toast.classList.add('gc-hiding');
        toast.classList.remove('gc-visible');
        localStorage.setItem(STORAGE_KEY, '1');
    }

    // Slide in after 2.5 s so it doesn't interrupt page load
    setTimeout(function () {
        toast.classList.add('gc-visible');
    }, 5500);

// Auto-dismiss after 10 s (non-intrusive)
setTimeout(function () {
    if (toast.classList.contains('gc-visible')) dismiss();
}, 12500);

if (closeBtn) {
    closeBtn.addEventListener('click', dismiss);
}
})();

/* Source: js/src/page-avatars.js */
// =====================================================
// PAGE ICON BADGE — inject icon + color, ripple, tooltip, click-to-home
// =====================================================
(function initPageAvatars() {
    const pageAvatars = document.querySelectorAll('.page-avatar');

    // Map data-color attribute to the resolved CSS variable value
    function resolveColor(colorKey) {
        // Read computed CSS variable from the root
        return getComputedStyle(document.documentElement)
            .getPropertyValue(`--${colorKey}`).trim();
    }

    pageAvatars.forEach(container => {
        const section = container.closest('.page');

        // --- Tooltip from page label ---
        if (section) {
            container.setAttribute('data-tooltip', section.dataset.label || '');
        }

        // --- Inject icon element ---
        const iconClass = container.dataset.icon || 'fa-circle';
        const icon = document.createElement('i');
        icon.className = `fa-solid ${iconClass} page-avatar-icon`;
        container.appendChild(icon);

        // --- Set per-page badge color via CSS custom property ---
        const colorKey = container.dataset.color || 'accent-1';
        const colorVal = resolveColor(colorKey);
        if (colorVal) container.style.setProperty('--page-badge-color', colorVal);

        // --- Click: go back to Home ---
        container.addEventListener('click', () => {
            if (typeof PageEngine !== 'undefined') PageEngine.goTo(0);
        });
    });

    // --- Re-resolve colors whenever theme changes (font-size or theme attr changes) ---
    const htmlEl = document.documentElement;
    const themeObserver = new MutationObserver(() => {
        pageAvatars.forEach(container => {
            const colorKey = container.dataset.color || 'accent-1';
            const colorVal = getComputedStyle(htmlEl).getPropertyValue(`--${colorKey}`).trim();
            if (colorVal) container.style.setProperty('--page-badge-color', colorVal);
        });
    });
    themeObserver.observe(htmlEl, { attributes: true, attributeFilter: ['data-theme'] });

    // --- Ripple when page becomes active ---
    document.querySelectorAll('.page.section').forEach(pageEl => {
        const avatar = pageEl.querySelector('.page-avatar');
        if (!avatar) return;

        new MutationObserver(mutations => {
            mutations.forEach(m => {
                if (m.type === 'attributes' && m.attributeName === 'class') {
                    if (pageEl.classList.contains('active')) {
                        avatar.classList.remove('pa-ripple');
                        void avatar.offsetWidth;
                        avatar.classList.add('pa-ripple');
                        setTimeout(() => avatar.classList.remove('pa-ripple'), 750);
                    }
                }
            });
        }).observe(pageEl, { attributes: true });
    });
})();

/* Source: js/src/philosophy-reveal.js */
// =====================================================
// PHILOSOPHY REVEAL — word-by-word typing for About page
// Exports: startPhilosophyReveal(), stopPhilosophyReveal()
// Called by page-lifecycle.js when page index 1 enters/leaves.
// =====================================================

const _PHIL_THOUGHTS = [
    {
        symbol : '◈',
        accent : '2',
        title  : 'Where My Curiosity Begins',
        body   : 'What has stayed with me across different problems is a certain kind of curiosity: the wish to understand why something works before deciding how to work with it. That is part of what draws me to quantum control. I like problems where physical intuition, mathematical structure, and constructive method have to stay in conversation with each other: not only to find a solution, but to understand what kind of solution is even meaningful.'
    },
    {
        symbol : '{H, ·}',
        accent : '1',
        title  : 'Starting from Structure',
        body   : 'Before reaching for a technique, I want to understand the structure of the problem: what is constrained, what is preserved, and what solutions are actually possible. A method chosen too early can work in a limited setting and still miss the deeper logic.'
    },
    {
        symbol : '∇L',
        accent : '1',
        title  : 'Why Learning Interests Me',
        body   : 'Machine learning interests me beyond the toolkit it provides. The deeper question is how a system exposed to examples begins to extract structure it was never shown. What gets represented, what gets compressed, what generalizes. That feels genuinely open.'
    },
    {
        symbol : '≅',
        accent : '3',
        title  : 'Following Ideas Across Fields',
        body   : 'The same pattern tends to reappear across fields: a variational argument, a notion of robustness, a constrained optimization picture. When an idea resurfaces in a different language, I take it seriously. It usually points to something deeper underneath.'
    },
    {
        symbol : '⌨',
        accent : '2',
        title  : 'Programming and Clarity',
        body   : 'I tend to trust an idea more after I have built it. Programming exposes vague understanding quickly. It forces assumptions into the open and makes it hard to hide behind elegant language. Moving across ideas, for me, is not a way of leaving a field behind, but a way of seeing it more clearly.'
    }
];

// ── DOM refs ──────────────────────────────────────────────
const _philCard    = document.getElementById('phil-card');
const _philGhost   = document.getElementById('philGhost');
const _philKicker  = document.getElementById('philKicker');
const _philTitle   = document.getElementById('philTitle');
const _philText    = document.getElementById('philText');
const _philFill    = document.getElementById('philFill');
const _philCount   = document.getElementById('philCount');
const _philButtons = Array.from(document.querySelectorAll('.phil-btn'));

// ── State ─────────────────────────────────────────────────
let _philCurrentIdx  = -1;
let _philTypeTimer   = null;
let _philStartTimer  = null;  /* BUG-FIX: track start-delay timer so stop() can cancel it */
let _philActive      = false;

// ── Clear ALL pending timers ───────────────────────────────
// Must cancel both the word-step timer AND the start-delay timer.
// Using separate _philClearTyping() that only cleared _philTypeTimer was
// the root cause of the duplicate-showThought glitch.
function _philClearAll() {
    clearTimeout(_philTypeTimer);
    clearTimeout(_philStartTimer);
    _philTypeTimer  = null;
    _philStartTimer = null;
}

function _philSetActive(idx) {
    _philButtons.forEach((b, i) => b.classList.toggle('active', i === idx));
}

// ── Show a thought ────────────────────────────────────────
function _philShowThought(idx) {
    if (!_philCard) return;
    if (idx < 0 || idx >= _PHIL_THOUGHTS.length) return;
    _philClearAll();
    _philCurrentIdx = idx;
    const t = _PHIL_THOUGHTS[idx];

    _philSetActive(idx);
    _philCard.dataset.accent = t.accent;
    _philCount.textContent   = `${idx + 1} / ${_PHIL_THOUGHTS.length}`;
    _philFill.style.width    = '0%';
    _philKicker.textContent  = t.symbol;

    /* Ghost cross-fade — guard so a stale callback can't clobber a newer thought */
    const ghostForIdx = idx;
    _philGhost.style.opacity = '0';
    setTimeout(() => {
        if (_philCurrentIdx !== ghostForIdx) return;
        _philGhost.textContent   = t.symbol;
        _philGhost.style.opacity = '';
    }, 220);

    /* Title fade-swap */
    _philTitle.style.opacity = '0';
    _philTitle.textContent   = t.title;
    setTimeout(() => { _philTitle.style.opacity = '1'; }, 20);

    /* Clear body then start typing */
    _philText.style.opacity = '0';
    _philText.textContent   = '';
    setTimeout(() => {
        if (_philCurrentIdx !== idx) return;
        _philText.style.opacity = '1';
        _philTypeWords(t.body, idx);
    }, 300);
}

// ── Word-by-word typing with micro-fade ───────────────────
function _philTypeWords(text, forIdx) {
    const words = text.split(' ');
    const total = words.length;
    let i = 0;

    function step() {
        if (_philCurrentIdx !== forIdx) return;
        if (i >= total) { _philFill.style.width = '100%'; return; }
        const word = document.createElement('span');
        word.className   = 'phil-word';
        word.textContent = (i === 0 ? '' : ' ') + words[i];
        _philText.appendChild(word);
        _philFill.style.width = `${((i + 1) / total) * 100}%`;
        i++;
        _philTypeTimer = setTimeout(step, 64 + Math.random() * 52);
    }
    step();
}

// ── Public API ────────────────────────────────────────────

function startPhilosophyReveal() {
    if (!_philCard) return;
    _philClearAll();   /* cancel any stale start or type timers from a previous visit */
    _philActive = true;

    /* BUG-FIX: Pre-populate thought-0 chrome BEFORE animation starts.
       Previously the card faded in with empty content for ~500 ms, looking broken.
       Now the title, kicker, and ghost are visible as the card fades in;
       only the body text types in after the 500 ms delay. */
    const t = _PHIL_THOUGHTS[0];
    _philCurrentIdx          = 0;
    _philSetActive(0);
    _philCard.dataset.accent = t.accent;
    _philCount.textContent   = `1 / ${_PHIL_THOUGHTS.length}`;
    _philKicker.textContent  = t.symbol;
    _philGhost.textContent   = t.symbol;
    _philGhost.style.opacity = '';          /* restore CSS value (0.03) */
    _philTitle.textContent   = t.title;
    _philTitle.style.opacity = '1';
    _philText.textContent    = '';
    _philText.style.opacity  = '1';
    _philFill.style.width    = '0%';

    /* Restart entry animation */
    _philCard.classList.remove('phil-entering');
    void _philCard.offsetWidth;             /* force reflow so animation replays */
    _philCard.classList.add('phil-entering');

    /* BUG-FIX: Store the start timer so stop() can cancel it.
       Previously this was an anonymous setTimeout — if stop() fired before
       500 ms and start() fired again, the stale timer would also trigger
       showThought(0), causing two concurrent typing loops. */
    _philStartTimer = setTimeout(() => {
        _philStartTimer = null;
        if (_philActive && _philCurrentIdx === 0) _philTypeWords(t.body, 0);
    }, 500);
}

function stopPhilosophyReveal() {
    _philActive = false;
    _philClearAll();   /* cancels both _philTypeTimer and _philStartTimer */

    /* BUG-FIX: Do NOT remove 'phil-entering' and do NOT wipe content here.
       - Removing the class mid-animation snapped the card's opacity from its
         current animated value back to 1 while the page was mid-exit-transition,
         causing a visible brightness flash.
       - Wiping content caused the card to fade in blank on re-entry.
       Both are handled cleanly at the start of the next startPhilosophyReveal(). */
}

// ── Button clicks ─────────────────────────────────────────
_philButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
        if (_philActive) _philShowThought(idx);
    });
});

// ── Keyboard navigation (only when about page is active) ──
// ArrowLeft/Right: navigate thoughts (no conflict with page engine ArrowUp/Down)
// 1–5: jump directly to thought
document.addEventListener('keydown', e => {
    if (!_philActive) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); _philShowThought(_philCurrentIdx + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); _philShowThought(_philCurrentIdx - 1); }
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 5) _philShowThought(n - 1);
});

/* Source: js/src/page-lifecycle.js */
// =====================================================
// HERO LIFECYCLE — gate effects to active hero page
// =====================================================
let _lifecyclePage = 0;

function _onPageChange(newIdx, oldIdx) {
    _lifecyclePage = newIdx;
    // Hero (page 0)
    if (newIdx === 0 && oldIdx !== 0) {
        startTypewriter();
        if (typeof _crtResume === 'function') _crtResume();
    } else if (newIdx !== 0 && oldIdx === 0) {
        stopTypewriter();
        if (typeof _crtPause === 'function') _crtPause();
    }
    // About — philosophy reveal (page 1)
    if (newIdx === 1 && oldIdx !== 1) {
        if (typeof startPhilosophyReveal === 'function') startPhilosophyReveal();
    } else if (newIdx !== 1 && oldIdx === 1) {
        if (typeof stopPhilosophyReveal === 'function') stopPhilosophyReveal();
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopTypewriter();
        if (typeof _crtPause === 'function') _crtPause();
        if (typeof stopPhilosophyReveal === 'function') stopPhilosophyReveal();
    } else if (_lifecyclePage === 0) {
        startTypewriter();
        if (typeof _crtResume === 'function') _crtResume();
    } else if (_lifecyclePage === 1) {
        if (typeof startPhilosophyReveal === 'function') startPhilosophyReveal();
    }
});
