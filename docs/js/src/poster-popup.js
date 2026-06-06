// ========== UPCOMING POSTER POPUP ==========
(function initPosterPopup() {
    const popup = document.getElementById('poster-popup');
    if (!popup) return;

    const closeBtn = document.getElementById('poster-popup-close');
    const noBtn = document.getElementById('poster-popup-no');
    const yesBtn = document.getElementById('poster-popup-yes');
    const SESSION_KEY = 'poster-popup-seen';
    const MOBILE_DELAY_MS = 30000;
    const DESKTOP_DELAY_MS = 50000;

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

    window.setTimeout(openPopup, isMobileViewport() ? MOBILE_DELAY_MS : DESKTOP_DELAY_MS);
})();
