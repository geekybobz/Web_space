// ========== AVATAR + THEME SELECTION ==========
const avatarImg = document.querySelector('.profile-pic');
const FIXED_AVATAR = 'assets/images/avatar_1.webp';

(function initAvatarAndTheme() {
    if (avatarImg) avatarImg.src = FIXED_AVATAR;
    localStorage.setItem('selectedAvatar', FIXED_AVATAR);

    localStorage.setItem('selectedTheme', DESKTOP_DEFAULT_THEME_ID);
    localStorage.setItem('selectedThemeMode', 'dark');
    localStorage.setItem('darkThemeIndex', '0');
    applyTheme(isMobileViewport() ? MOBILE_THEME_ID : DESKTOP_DEFAULT_THEME_ID);
    syncModeButtons('dark');
})();

modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        applyThemeMode(button.dataset.themeMode, { advanceDark: false });
    });
});

initLocalPreviewControls();
