// ========== AVATAR + THEME SELECTION ==========
const avatarImg = document.querySelector('.profile-pic');
const FIXED_AVATAR = 'assets/images/optimized/avatar_1-320.webp';

(function initAvatarAndTheme() {
    if (avatarImg) avatarImg.src = FIXED_AVATAR;
    localStorage.setItem('selectedAvatar', FIXED_AVATAR);

    localStorage.setItem('selectedTheme', DESKTOP_DEFAULT_THEME_ID);
    localStorage.setItem('selectedThemeMode', 'dark');
    localStorage.setItem('darkThemeIndex', '0');
    applyTheme(isMobileViewport() ? MOBILE_THEME_ID : DESKTOP_DEFAULT_THEME_ID);
    syncModeButtons('dark');
})();

// Theme toggle temporarily disabled while bright mode is being redesigned.
// modeButtons.forEach((button) => {
//     button.addEventListener('click', () => {
//         applyThemeMode(button.dataset.themeMode, { advanceDark: false });
//     });
// });

initLocalPreviewControls();
