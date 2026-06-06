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
