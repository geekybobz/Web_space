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
