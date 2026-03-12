// ========== THEME SWITCHER ==========
const THEMES = [
    { id: 'dark',    label: 'Quantum', icon: '🌌', dark: true, avatar: 'avatar_1.png' },
    { id: 'carbon',  label: 'Carbon',  icon: '🔥', dark: true, avatar: 'avatar_2.png' },
    { id: 'crimson', label: 'Crimson', icon: '🌹', dark: true, avatar: 'avatar_1.png' },
    { id: 'obsidian',label: 'Obsidian',icon: '🌿', dark: true, avatar: 'avatar_2.png' },
    { id: 'dusk',    label: 'Dusk',    icon: '🌇', dark: true, avatar: 'avatar_1.png' },
    { id: 'volt',    label: 'Volt',    icon: '⚡', dark: true, avatar: 'avatar_2.png' },
];

const AVATAR_GROUP_MAP = {
    'avatar_1.png': ['dark', 'crimson', 'dusk'],
    'avatar_2.png': ['carbon', 'obsidian', 'volt'],
};

const avatarPool = ['avatar_1.png', 'avatar_2.png'];

const htmlEl   = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');
const themeIconEl  = themeBtn?.querySelector('.theme-icon');
const themeLabelEl = themeBtn?.querySelector('.theme-label');

let activeThemes = THEMES;

function applyTheme(themeId, animate = false) {
    const theme = activeThemes.find(t => t.id === themeId)
                || THEMES.find(t => t.id === themeId)
                || activeThemes[0];
    if (animate) {
        htmlEl.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => { htmlEl.style.transition = ''; }, 400);
    }
    htmlEl.setAttribute('data-theme', theme.id);
    if (themeIconEl)  themeIconEl.textContent  = theme.icon;
    if (themeLabelEl) themeLabelEl.textContent = theme.label;
    localStorage.setItem('selectedTheme', theme.id);

    const avatarEl = document.querySelector('.profile-pic');
    if (avatarEl && theme.avatar) avatarEl.src = theme.avatar;
}

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const current = htmlEl.getAttribute('data-theme') || activeThemes[0].id;
        const idx  = activeThemes.findIndex(t => t.id === current);
        const next = activeThemes[(idx + 1) % activeThemes.length];
        applyTheme(next.id, true);
    });
}

// ========== AVATAR SELECTION ==========
const avatarContainer = document.querySelector('.hero-avatar');
const avatarImg       = document.querySelector('.profile-pic');

if (avatarImg) {
    const lastAvatar = localStorage.getItem('selectedAvatar');
    let nextAvatar   = avatarPool[Math.floor(Math.random() * avatarPool.length)];
    if (nextAvatar === lastAvatar) {
        const others = avatarPool.filter(a => a !== lastAvatar);
        nextAvatar   = others[Math.floor(Math.random() * others.length)] || nextAvatar;
    }
    localStorage.setItem('selectedAvatar', nextAvatar);

    const allowedIds = AVATAR_GROUP_MAP[nextAvatar] || ['dark'];
    activeThemes = THEMES.filter(t => allowedIds.includes(t.id));

    const savedTheme = localStorage.getItem('selectedTheme') || activeThemes[0].id;
    const isAllowed  = activeThemes.some(t => t.id === savedTheme);
    applyTheme(isAllowed ? savedTheme : activeThemes[0].id, false);
}

// ========== AVATAR TILT ==========
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

// ========== CUSTOM CURSOR ==========
const cursorDot     = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline) {
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top  = mouseY + 'px';
    });

    (function animateOutline() {
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        cursorOutline.style.left = outlineX + 'px';
        cursorOutline.style.top  = outlineY + 'px';
        requestAnimationFrame(animateOutline);
    })();

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

// ========== NAVBAR SCROLL CLASS ==========
const navbar = document.querySelector('.navbar');
// In page-engine mode the navbar stays fixed; mark .scrolled immediately for style
navbar?.classList.add('scrolled');

// ========== MOBILE NAV TOGGLE ==========
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinksEl   = document.querySelector('.nav-links');

if (mobileToggle && navLinksEl) {
    mobileToggle.addEventListener('click', () => {
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
// =====================================================
const PageEngine = (() => {
    const pages       = Array.from(document.querySelectorAll('.page'));
    const dotsNav     = document.querySelector('.page-dots');
    const prevBtn     = document.getElementById('page-prev');
    const nextBtn     = document.getElementById('page-next');
    const DURATION_MS = 600; // matches CSS transition

    let current        = 0;
    let isAnimating    = false;

    // --- Build side dots ---
    pages.forEach((page, i) => {
        const label = page.dataset.label || `Page ${i + 1}`;
        const dot   = document.createElement('button');
        dot.className   = 'page-dot';
        dot.dataset.label = label;
        dot.setAttribute('aria-label', `Go to ${label}`);
        dot.addEventListener('click', () => goTo(i));
        dotsNav?.appendChild(dot);
    });

    const dots = Array.from(dotsNav?.querySelectorAll('.page-dot') || []);

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

        // Close mobile menu
        navLinksEl?.classList.remove('active');
        const icon = mobileToggle?.querySelector('i');
        if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
    }

    // --- Core transition ---
    function goTo(idx, direction = null) {
        if (isAnimating || idx === current || idx < 0 || idx >= pages.length) return;
        isAnimating = true;

        const outPage = pages[current];
        const inPage  = pages[idx];
        const dir     = direction ?? (idx > current ? 'forward' : 'backward');

        // For backward nav: snap incoming page to above-viewport position
        // (no transition — the class carries transition:none !important)
        if (dir === 'backward') {
            inPage.classList.add('from-above');
            // Force reflow so browser registers the snap before we remove the class
            void inPage.offsetHeight;
            inPage.classList.remove('from-above');
            // Another reflow ensures transition kicks in on the NEXT paint
            void inPage.offsetHeight;
        }

        // Exit outgoing page (CSS handles the animated drift + fade)
        outPage.classList.remove('active');
        outPage.classList.add(dir === 'forward' ? 'exit-up' : 'exit-down');

        // Enter incoming page
        inPage.classList.remove('exit-up', 'exit-down');
        inPage.classList.add('active');

        current = idx;
        updateChrome(current);
        inPage.scrollTop = 0;

        setTimeout(() => {
            outPage.classList.remove('exit-up', 'exit-down');
            isAnimating = false;
        }, DURATION_MS + 50);
    }

    function next() { goTo(current + 1, 'forward');  }
    function prev() { goTo(current - 1, 'backward'); }

    // --- Init: show page 0 immediately (no animation) ---
    function init() {
        pages.forEach((p, i) => {
            p.classList.remove('active', 'exit-up', 'exit-down', 'from-above');
            // Ensure all pages start hidden via their base .page class styles
        });
        // Activate first page instantly (suppress transition)
        pages[0].style.transition = 'none';
        pages[0].classList.add('active');
        void pages[0].offsetHeight;
        pages[0].style.transition = '';

        updateChrome(0);
    }

    // --- Listeners ---

    // Arrow buttons
    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);

    // Navbar & brand links
    document.querySelectorAll('[data-page-link]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            goTo(parseInt(a.dataset.pageLink));
        });
    });

    // Hero CTA "View Research" button
    document.querySelectorAll('[data-page-link]').forEach(a => {
        if (a.classList.contains('btn-primary')) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                goTo(parseInt(a.dataset.pageLink));
            });
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); next(); }
        if (e.key === 'ArrowUp'   || e.key === 'PageUp'  ) { e.preventDefault(); prev(); }
    });

    // Wheel navigation (debounced, only when page is not scrollable)
    let wheelTimer = null;
    document.addEventListener('wheel', (e) => {
        const activePage = pages[current];
        const atTop     = activePage.scrollTop <= 0;
        const atBottom  = activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 2;

        // Only hijack wheel when page is at edge of its own scroll
        if ((e.deltaY > 30  && atBottom) || (e.deltaY < -30 && atTop)) {
            e.preventDefault();
            if (wheelTimer) return;
            wheelTimer = setTimeout(() => { wheelTimer = null; }, 700);
            if (e.deltaY > 0) next(); else prev();
        }
    }, { passive: false });

    // Touch / swipe navigation
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const dy = touchStartY - e.changedTouches[0].clientY;
        const activePage = pages[current];
        const atTop     = activePage.scrollTop <= 0;
        const atBottom  = activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 2;

        if (dy > 60  && atBottom) next();
        if (dy < -60 && atTop)   prev();
    }, { passive: true });

    init();
    return { goTo, next, prev };
})();

// ========== CRT TERMINAL LOG CYCLING ==========
(function initCRTTerminal() {
    const log = document.getElementById('crt-log');
    if (!log) return;

    const messages = [
        { text: '> BOOT sequence init...', cls: '' },
        { text: '> Kernel: QCtrl-v2.7', cls: 'log-dim' },
        { text: '> Pontryagin module: OK', cls: 'log-ok' },
        { text: '> Loading Bloch solver...', cls: '' },
        { text: '> GRAPE optimizer: READY', cls: 'log-ok' },
        { text: '> Qubit registers: 4', cls: 'log-dim' },
        { text: '> Noise floor: 0.03 ±ε', cls: 'log-warn' },
        { text: '> Calibrating pulses...', cls: '' },
        { text: '> Fidelity target: 0.999', cls: 'log-dim' },
        { text: '> Hamiltonian loaded', cls: 'log-ok' },
        { text: '> Solving ODE [RK4]...', cls: '' },
        { text: '> Convergence: 1.4e-8', cls: 'log-ok' },
        { text: '> ML model: standby', cls: 'log-dim' },
        { text: '> Control pulse: stored', cls: 'log-ok' },
        { text: '> Robustness check: PASS', cls: 'log-ok' },
        { text: '> ψ(t) evolution: done', cls: '' },
        { text: '> Awaiting next run...', cls: 'log-warn' },
    ];

    const MAX_LINES = 8;
    let msgIdx = 0;
    let lines = [];

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
            // Then cycle normally
            setInterval(addLine, 1800);
        }
    }, 350);
})();
