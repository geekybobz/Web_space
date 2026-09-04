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

requestAnimationFrame(() => {
    const activeIdx = typeof PageEngine !== 'undefined' && typeof PageEngine.current === 'function'
        ? PageEngine.current()
        : Array.from(document.querySelectorAll('.page')).findIndex(page => page.classList.contains('active'));
    _lifecyclePage = activeIdx > -1 ? activeIdx : 0;
    if (_lifecyclePage === 0) {
        startTypewriter();
        if (typeof _crtResume === 'function') _crtResume();
    } else {
        stopTypewriter();
        if (typeof _crtPause === 'function') _crtPause();
    }
    if (_lifecyclePage === 1 && typeof startPhilosophyReveal === 'function') {
        startPhilosophyReveal();
    }
});
