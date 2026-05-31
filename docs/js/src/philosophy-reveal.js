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
let _philCurrentIdx = -1;
let _philTypeTimer  = null;
let _philActive     = false;

// ── Helpers ───────────────────────────────────────────────
function _philClearTyping() {
    clearTimeout(_philTypeTimer);
    _philTypeTimer = null;
}

function _philSetActive(idx) {
    _philButtons.forEach((b, i) => b.classList.toggle('active', i === idx));
}

// ── Show a thought ────────────────────────────────────────
function _philShowThought(idx) {
    if (!_philCard) return;
    if (idx < 0 || idx >= _PHIL_THOUGHTS.length) return;
    _philClearTyping();
    _philCurrentIdx = idx;
    const t = _PHIL_THOUGHTS[idx];

    _philSetActive(idx);
    _philCard.dataset.accent   = t.accent;
    _philCount.textContent     = `${idx + 1} / ${_PHIL_THOUGHTS.length}`;
    _philFill.style.width      = '0%';
    _philKicker.textContent    = t.symbol;

    /* Ghost cross-fade */
    _philGhost.style.opacity = '0';
    setTimeout(() => {
        _philGhost.textContent   = t.symbol;
        _philGhost.style.opacity = '';
    }, 220);

    /* Title fade-swap */
    _philTitle.style.opacity = '0';
    _philTitle.textContent   = t.title;
    setTimeout(() => { _philTitle.style.opacity = '1'; }, 20);

    /* Clear body then type */
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
    _philActive = true;
    /* Trigger entry animation — remove/reflow/re-add to replay */
    _philCard.classList.remove('phil-entering');
    void _philCard.offsetWidth;
    _philCard.classList.add('phil-entering');
    /* Start typing after the animation has begun */
    setTimeout(() => {
        if (_philActive) _philShowThought(0);
    }, 500);
}

function stopPhilosophyReveal() {
    _philActive     = false;
    _philCurrentIdx = -1;
    _philClearTyping();
    _philCard.classList.remove('phil-entering');
    _philSetActive(-1);
    if (_philText)   _philText.textContent   = '';
    if (_philTitle)  { _philTitle.textContent = ''; _philTitle.style.opacity = '1'; }
    if (_philKicker) _philKicker.textContent  = '';
    if (_philGhost)  { _philGhost.textContent = ''; _philGhost.style.opacity = ''; }
    if (_philFill)   _philFill.style.width    = '0%';
    if (_philCount)  _philCount.textContent   = `1 / ${_PHIL_THOUGHTS.length}`;
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
