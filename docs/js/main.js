/* Generated file. Edit docs/js/src/**, not docs/js/main.js. */

/* Source: js/src/loader.js */
// =====================================================
// INTRO LOADER — waves + drift
// =====================================================
(function initLoader() {
    if (window.innerWidth <= 900) {
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
    for (let i = 0; i < 58; i++) {
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
        for (let x = 0; x <= W; x += 5) {
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
    }, 130);

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
    }, 2000);

    // ── status cycling ───────────────────────────────────────────────────
    const statuses = ['reading the system...','iterating...','propagating...','refining...','stable.','converged.'];
    let sIdx = 0;
    statusEl.textContent = statuses[0];
    const statusTimer = setInterval(() => {
        sIdx = (sIdx + 1) % statuses.length;
        statusEl.style.opacity = '0';
        setTimeout(() => { statusEl.textContent = statuses[sIdx]; statusEl.style.opacity = '1'; }, 200);
    }, 950);

    // ── progress bar ───────────────────────────────────────────────────────────
    let p = 0;
    const progTimer = setInterval(() => {
        let inc;
        if      (p < 45) inc = Math.random() * 7 + 3;
        else if (p < 85) inc = Math.random() * 1.4 + 0.3;
        else             inc = Math.random() * 3 + 1.5;
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
            }, 920);
        }
    }, 90);
})();

function triggerHeroFadeIn() {
    document.querySelectorAll('.intro-fade').forEach(el => {
        const delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
        el.style.animationDelay = delay + 's';
        el.classList.add('intro-visible');
    });
    setTimeout(startTypewriter, 720);
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

/* Source: js/src/avatar-theme-init.js */
// ========== AVATAR + THEME SELECTION ==========
const avatarImg = document.querySelector('.profile-pic');
const FIXED_AVATAR = 'assets/images/avatar_1.webp';

(function initAvatarAndTheme() {
    if (avatarImg) avatarImg.src = FIXED_AVATAR;
    localStorage.setItem('selectedAvatar', FIXED_AVATAR);

    const mode = isMobileViewport() ? 'dark' : initialThemeMode();
    applyThemeMode(mode, { advanceDark: mode === 'dark' && !sessionStorage.getItem('q-intro-seen') });
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

if (cursorDot && cursorOutline) {
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
    });

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
        const icon = mobileToggle.querySelector('i');
        if (navLinksEl.classList.contains('active')) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });
}

// =====================================================
// PAGE ENGINE

/* Source: js/src/mobile-scroll.js */
// ========== MOBILE SINGLE-SCROLL MODE ==========
const MobileScrollMode = (() => {
    let initialized = false;

    function pages() {
        return Array.from(document.querySelectorAll('.page'));
    }

    function closeMenu() {
        navLinksEl?.classList.remove('active');
        const icon = mobileToggle?.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    function sectionForLink(link) {
        const href = link.getAttribute('href') || '';
        if (href === '#' || link.dataset.pageLink === '0') {
            return document.getElementById('page-hero');
        }
        if (href.startsWith('#')) {
            return document.querySelector(href);
        }
        const idx = parseInt(link.dataset.pageLink || '', 10);
        return Number.isNaN(idx) ? null : pages()[idx] || null;
    }

    function setActive(section) {
        const allPages = pages();
        const idx = allPages.indexOf(section);
        document.querySelectorAll('[data-page-link]').forEach((link) => {
            const target = sectionForLink(link);
            link.classList.toggle('active', target === section || parseInt(link.dataset.pageLink || '-1', 10) === idx);
        });
        allPages.forEach((page) => page.classList.toggle('active', page === section));
    }

    function scrollToSection(section, { updateHash = true } = {}) {
        if (!section) return;
        setActive(section);
        section.scrollIntoView({ behavior: 'auto', block: 'start' });
        if (updateHash && window.history?.replaceState) {
            const url = section.id === 'page-hero'
                ? window.location.pathname + window.location.search
                : `#${section.id}`;
            window.history.replaceState(null, '', url);
        }
        closeMenu();
    }

    function goTo(idx) {
        scrollToSection(pages()[idx] || pages()[0]);
    }

    function init() {
        if (initialized) return;
        initialized = true;

        document.querySelectorAll('[data-page-link]').forEach((link) => {
            link.addEventListener('click', (event) => {
                if (!isMobileViewport()) return;
                const section = sectionForLink(link);
                if (!section) return;
                event.preventDefault();
                scrollToSection(section);
            });
        });

        const observer = new IntersectionObserver((entries) => {
            if (!isMobileViewport()) return;
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible?.target) setActive(visible.target);
        }, {
            root: null,
            threshold: [0.25, 0.45, 0.65],
        });

        pages().forEach((page) => observer.observe(page));
        const initial = window.location.hash ? document.querySelector(window.location.hash) : document.getElementById('page-hero');
        setActive(initial || pages()[0]);
    }

    return { init, goTo };
})();

if (typeof isMobileViewport === 'function' && isMobileViewport()) {
    MobileScrollMode.init();
}

window.addEventListener('resize', () => {
    if (typeof isMobileViewport === 'function' && isMobileViewport()) {
        MobileScrollMode.init();
    }
});

/* Source: js/src/poster-popup.js */
// ========== UPCOMING POSTER POPUP ==========
(function initPosterPopup() {
    const popup = document.getElementById('poster-popup');
    if (!popup) return;

    const closeBtn = document.getElementById('poster-popup-close');
    const noBtn = document.getElementById('poster-popup-no');
    const yesBtn = document.getElementById('poster-popup-yes');
    const SESSION_KEY = 'poster-popup-seen';

    function closePopup() {
        popup.classList.remove('is-visible');
        document.body.classList.remove('poster-popup-open');
        sessionStorage.setItem(SESSION_KEY, '1');
        window.setTimeout(() => {
            popup.hidden = true;
        }, 180);
    }

    function openPopup() {
        if (sessionStorage.getItem(SESSION_KEY)) return;
        popup.hidden = false;
        document.body.classList.add('poster-popup-open');
        requestAnimationFrame(() => {
            popup.classList.add('is-visible');
            noBtn?.focus({ preventScroll: true });
        });
    }

    closeBtn?.addEventListener('click', closePopup);
    noBtn?.addEventListener('click', closePopup);
    yesBtn?.addEventListener('click', () => {
        sessionStorage.setItem(SESSION_KEY, '1');
        window.setTimeout(closePopup, 80);
    });

    popup.addEventListener('click', (event) => {
        if (event.target === popup) closePopup();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !popup.hidden) closePopup();
    });

    window.setTimeout(openPopup, isMobileViewport() ? 900 : 1300);
})();

/* Source: js/src/page-engine.js */
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
    const prevBtn     = document.getElementById('page-prev');
    const nextBtn     = document.getElementById('page-next');
    const DURATION_MS = 280; // matches CSS transition
    const EDGE_INTENT_THRESHOLD = 18;
    const EDGE_INTENT_WINDOW_MS = 850;

    let current        = 0;
    let isAnimating    = false;
    let edgePulseTimer = null;
    let edgeCueTimer   = null;
    let edgeReleaseTimer = null;
    let edgePrimedDirection = 0;

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

    // --- Build side dots ---
    pages.forEach((page, i) => {
        const label = page.dataset.label || `Page ${i + 1}`;
        const dot   = document.createElement('button');
        dot.className   = 'page-dot';
        dot.dataset.label = label;
        dot.setAttribute('aria-label', `Go to ${label}`);
        dot.addEventListener('click', () => {
            goTo(i);
        });
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

    function updateScrollFeedback(page = pages[current]) {
        if (!pageEngine || !page) return;
        const maxScroll = Math.max(page.scrollHeight - page.clientHeight, 0);
        const hasOverflow = maxScroll > 0;
        pageEngine.style.setProperty('--scroll-cue-opacity', hasOverflow ? '0.18' : '0');
        pageEngine.style.setProperty('--scroll-cue-progress', hasOverflow ? '0.22' : '0');
        pageEngine.style.setProperty('--scroll-cue-origin', '0%');
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

    function getArrowForDirection(direction) {
        return direction > 0 ? nextBtn : prevBtn;
    }

    function clearEdgeReleaseTimer() {
        if (edgeReleaseTimer) {
            clearTimeout(edgeReleaseTimer);
            edgeReleaseTimer = null;
        }
    }

    function clearArrowAttract() {
        [prevBtn, nextBtn].forEach((button) => {
            if (!button) return;
            button.classList.remove('edge-attract');
            button.removeAttribute('data-edge-label');
        });
    }

    function clearEdgeState({ keepCue = false } = {}) {
        clearEdgeReleaseTimer();
        edgePrimedDirection = 0;
        clearArrowAttract();
        if (!keepCue) clearEdgeCue();
    }

    function applyArrowAttract(direction) {
        clearArrowAttract();
        const button = getArrowForDirection(direction);
        if (!button || button.disabled) return;
        button.classList.add('edge-attract');
        button.setAttribute('data-edge-label', direction > 0 ? 'Scroll again for next' : 'Scroll again for previous');
    }

    function scheduleEdgeRelease() {
        clearEdgeReleaseTimer();
        edgeReleaseTimer = setTimeout(() => {
            clearEdgeState();
        }, EDGE_INTENT_WINDOW_MS);
    }

    // --- Update UI chrome ---
    function updateChrome(idx) {
        // Dots
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));

        // Prev/Next arrows
        if (prevBtn) prevBtn.disabled = idx === 0;
        if (nextBtn) nextBtn.disabled = idx === pages.length - 1;

        // Navbar active link
        document.querySelectorAll('[data-page-link]').forEach(a => {
            a.classList.toggle('active', parseInt(a.dataset.pageLink) === idx);
        });

        document.body.classList.toggle('viewing-contact', idx === 4);
        clearArrowAttract();

        // Close mobile menu
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
        clearEdgeState();
        isAnimating = true;

        const prevPageIdx = current;
        const outPage = pages[current];
        const inPage  = pages[idx];
        const dir     = direction ?? (idx > current ? 'forward' : 'backward');

        // Exit outgoing page
        outPage.classList.remove('active');
        outPage.classList.add(dir === 'forward' ? 'exit-up' : 'exit-down');

        // Update state immediately so chrome/dots/hash are responsive
        current = idx;
        updateChrome(current);
        pulsePageTag(current);
        inPage.scrollTop = 0;
        updateScrollFeedback(inPage);
        syncHash(current);
        _onPageChange(current, prevPageIdx);

        if (dir === 'backward') {
            // Snap incoming page above viewport (single reflow, no double)
            inPage.classList.add('from-above');
            void inPage.offsetHeight; // commit snap — one reflow
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
        pages.forEach((p, i) => {
            p.classList.remove('active', 'exit-up', 'exit-down', 'from-above');
            // Ensure all pages start hidden via their base .page class styles
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

    // Arrow buttons
    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);

    // Navbar & brand links
    document.querySelectorAll('[data-page-link]').forEach(a => {
        a.addEventListener('click', (e) => {
            if (isMobileViewport()) return;
            e.preventDefault();
            goTo(parseInt(a.dataset.pageLink));
        });
    });

    // Hero CTA "View Research" button
    document.querySelectorAll('[data-page-link]').forEach(a => {
        if (a.classList.contains('btn-primary')) {
            a.addEventListener('click', (e) => {
                if (isMobileViewport()) return;
                e.preventDefault();
                goTo(parseInt(a.dataset.pageLink));
            });
        }
    });

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

    document.addEventListener('wheel', (e) => {
        if (isMobileViewport()) return;
        const activePage = pages[current];
        const atTop    = activePage.scrollTop <= 0;
        const atBottom = activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 2;
        const dir      = Math.sign(e.deltaY);
        const deltaAbs = Math.abs(e.deltaY);

        // Still scrolling inside the page — let it scroll naturally
        if ((!atTop && dir < 0) || (!atBottom && dir > 0)) {
            clearEdgeState();
            return;
        }

        if (dir === 0) return;

        if ((dir > 0 && atBottom) || (dir < 0 && atTop)) {
            e.preventDefault();
            if (deltaAbs < EDGE_INTENT_THRESHOLD) {
                scheduleEdgeRelease();
                return;
            }

            if (edgePrimedDirection !== 0 && edgePrimedDirection !== dir) {
                clearEdgeState({ keepCue: true });
            }

            if (edgePrimedDirection === dir) {
                clearEdgeState({ keepCue: true });
                if (dir > 0) next(); else prev();
                return;
            }

            edgePrimedDirection = dir;
            showEdgeCue(dir);
            setDirectionalCue(dir, 1);
            applyArrowAttract(dir);
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
        const dy = touchStartY - e.changedTouches[0].clientY;
        const activePage = pages[current];
        const atTop     = activePage.scrollTop <= 0;
        const atBottom  = activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 2;

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
