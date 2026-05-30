// ========== AVATAR + THEME SELECTION ==========
// On every fresh page load: randomly alternate avatar, then select from the active mode family.
const avatarImg = document.querySelector('.profile-pic');

(function initAvatarAndTheme() {
    // --- Pick avatar (alternate from last session) ---
    const lastAvatar = localStorage.getItem('selectedAvatar');
    let chosenAvatar = avatarPool[Math.floor(Math.random() * avatarPool.length)];
    if (chosenAvatar === lastAvatar) {
        const others = avatarPool.filter(a => a !== lastAvatar);
        chosenAvatar = others[Math.floor(Math.random() * others.length)] || chosenAvatar;
    }
    localStorage.setItem('selectedAvatar', chosenAvatar);

    // Apply avatar to hero image
    if (avatarImg) avatarImg.src = chosenAvatar;

    const mode = initialThemeMode();
    applyThemeMode(mode, { advanceDark: mode === 'dark' && !sessionStorage.getItem('q-intro-seen') });
})();

modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        applyThemeMode(button.dataset.themeMode, { advanceDark: false });
    });
});

initLocalPreviewControls();
