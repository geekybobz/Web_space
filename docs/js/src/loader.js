// =====================================================
// INTRO LOADER — waves + drift
// =====================================================
(function initLoader() {
    const INTRO_SEEN_KEY = 'q-intro-seen';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileViewport = window.innerWidth <= 900;
    const getStoredValue = key => {
        try { return sessionStorage.getItem(key); }
        catch (_) { return null; }
    };
    const setStoredValue = (key, value) => {
        try { sessionStorage.setItem(key, value); }
        catch (_) {}
    };

    if (getStoredValue(INTRO_SEEN_KEY) === '1') {
        const l = document.getElementById('q-loader');
        if (l) {
            l.style.transition = 'none';
            l.classList.add('q-loader--hidden');
        }
        document.documentElement.setAttribute('data-theme', localStorage.getItem('selectedTheme') || 'dark');
        setTimeout(() => triggerHeroFadeIn({ skipLoader: true }), 0);
        return;
    }

    if (isMobileViewport) {
        const l = document.getElementById('q-loader');
        if (l) {
            l.style.transition = 'opacity 0.22s ease, visibility 0.22s ease';
            l.classList.add('q-loader--hidden');
        }
        document.documentElement.setAttribute('data-theme', 'dark');
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
    if (!prefersReducedMotion) {
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
    function drawWaves() {
        const W = window.innerWidth, H = window.innerHeight;
        const amp = 18 + 7 * Math.sin(Date.now() / 2300);
        sinePath.setAttribute('d', buildSinePath(W, H, H * 0.2, amp, 2.5, wPhase));
        stepPath.setAttribute('d', buildStepPath(W, H, H * 0.8, amp * 0.85, 2.5, 20));
    }
    (function tickWaves() {
        if (!waveActive) return;
        drawWaves();
        if (prefersReducedMotion) return;
        wPhase += 0.004;
        requestAnimationFrame(tickWaves);
    })();

    // ── Zone 1: progress-locked fixed-width name resolver ──────────────
    const TARGET = 'MOHAMMED BILAL P S';
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const WORD_LOCKS = [
        { start: 0,  end: 8,  from: 6,  to: 42 },
        { start: 9,  end: 14, from: 42, to: 70 },
        { start: 15, end: 16, from: 70, to: 82 },
        { start: 17, end: 18, from: 82, to: 92 },
    ];
    let alphabetTick = 0;

    function renderNameSlots(chars, activeIndex = -1) {
        nameEl.replaceChildren(...chars.map((ch, index) => {
            const span = document.createElement('span');
            span.className = 'q-loader-char';
            if (TARGET[index] === ' ') {
                span.classList.add('q-loader-char-space');
                span.textContent = '\u00a0';
                return span;
            }
            span.textContent = ch || ALPHABET[(index + alphabetTick) % ALPHABET.length];
            if (ch === TARGET[index]) span.classList.add('q-loader-char-locked');
            if (index === activeIndex) span.classList.add('q-loader-char-active');
            return span;
        }));
    }

    function renderNameForProgress(progress) {
        const slots = TARGET.split('').map(ch => ch === ' ' ? ' ' : null);
        let activeIndex = -1;

        WORD_LOCKS.forEach(word => {
            const wordLength = word.end - word.start;
            const span = word.to - word.from;
            const wordProgress = Math.min(Math.max((progress - word.from) / span, 0), 1);
            const lockedCount = progress >= word.to
                ? wordLength
                : Math.floor(wordProgress * (wordLength + 0.01));

            for (let i = 0; i < lockedCount; i++) {
                slots[word.start + i] = TARGET[word.start + i];
            }

            if (activeIndex === -1 && lockedCount < wordLength && progress >= word.from && progress < word.to) {
                activeIndex = word.start + lockedCount;
            }
        });

        if (progress >= 92) {
            renderNameSlots(TARGET.split(''));
            return;
        }

        renderNameSlots(slots, activeIndex);
    }

    renderNameForProgress(prefersReducedMotion ? 100 : 0);

    // ── progress-aware status ───────────────────────────────────────────
    const statuses = [
        { at: 0,  text: 'reading the system...' },
        { at: 18, text: 'checking alphabet...' },
        { at: 42, text: 'locking mohammed...' },
        { at: 70, text: 'locking bilal...' },
        { at: 82, text: 'locking initials...' },
        { at: 92, text: 'identity converged.' },
        { at: 100, text: 'ready.' },
    ];
    let sIdx = 0;
    statusEl.textContent = statuses[0].text;

    function updateStatusForProgress(progress) {
        let nextIdx = 0;
        statuses.forEach((status, index) => {
            if (progress >= status.at) nextIdx = index;
        });
        if (nextIdx === sIdx) return;
        sIdx = nextIdx;
        statusEl.style.opacity = '0';
        setTimeout(() => {
            statusEl.textContent = statuses[sIdx].text;
            statusEl.style.opacity = '1';
        }, 180);
    }

    // ── progress bar ───────────────────────────────────────────────────────────
    const loaderStartedAt = Date.now();
    const loaderDurationMs = prefersReducedMotion ? 2800 : 4800;
    let loaderDone = false;
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    const progTimer = setInterval(() => {
        const elapsed = Date.now() - loaderStartedAt;
        const progress = Math.min(easeOutCubic(elapsed / loaderDurationMs) * 100, 100);
        alphabetTick = (alphabetTick + 1) % ALPHABET.length;
        renderNameForProgress(progress);
        updateStatusForProgress(progress);
        barEl.style.width = Math.floor(progress) + '%';

        if (progress >= 100 && !loaderDone) {
            loaderDone = true;
            clearInterval(progTimer);
            statusEl.textContent = 'ready.';
            statusEl.style.opacity = '1';
            const barWrap = barEl.parentElement;
            if (barWrap) barWrap.style.opacity = '0';
            loader.classList.add('q-loader--converged');
            setStoredValue(INTRO_SEEN_KEY, '1');
            setTimeout(() => {
                waveActive = false;
                if (driftEl) driftEl.innerHTML = '';
                html.setAttribute('data-theme', localStorage.getItem('selectedTheme') || 'dark');
                html.classList.add('q-loader-handoff');
                loader.classList.add('q-loader--exiting');
                triggerHeroFadeIn({ handoff: true });
                setTimeout(() => {
                    loader.classList.add('q-loader--hidden');
                    html.classList.remove('q-loader-handoff');
                }, prefersReducedMotion ? 260 : 760);
            }, prefersReducedMotion ? 120 : 360);
        }
    }, 90);
})();

function triggerHeroFadeIn(options = {}) {
    const fastIntro = window.innerWidth <= 900 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delayScale = options.handoff ? 0.46 : 1;
    document.querySelectorAll('.intro-fade').forEach(el => {
        const baseDelay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
        const delay = fastIntro || options.skipLoader ? 0 : baseDelay * delayScale;
        el.style.animationDelay = delay + 's';
        el.classList.add('intro-visible');
    });
    if (typeof stopTypewriter === 'function') stopTypewriter();
    setTimeout(startTypewriter, fastIntro || options.skipLoader ? 80 : (options.handoff ? 520 : 420));
}
