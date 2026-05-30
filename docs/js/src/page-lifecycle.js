// =====================================================
// HERO LIFECYCLE — gate effects to active hero page
// =====================================================
let _lifecyclePage = 0;

function _onPageChange(newIdx, oldIdx) {
    _lifecyclePage = newIdx;
    if (newIdx === 0 && oldIdx !== 0) {
        startTypewriter();
        if (typeof _crtResume === 'function') _crtResume();
    } else if (newIdx !== 0 && oldIdx === 0) {
        stopTypewriter();
        if (typeof _crtPause === 'function') _crtPause();
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopTypewriter();
        if (typeof _crtPause === 'function') _crtPause();
    } else if (_lifecyclePage === 0) {
        startTypewriter();
        if (typeof _crtResume === 'function') _crtResume();
    }
});
