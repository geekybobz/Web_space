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
