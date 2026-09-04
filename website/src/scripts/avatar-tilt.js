// ========== AVATAR TILT ==========
const avatarContainer = document.querySelector('.hero-avatar');
if (avatarContainer && avatarImg) {
    avatarContainer.addEventListener('mousemove', (e) => {
        const rect = avatarContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xRot =  12 * ((y - rect.height / 2) / rect.height);
        const yRot = -12 * ((x - rect.width  / 2) / rect.width);
        avatarImg.style.transform = `perspective(500px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale(1.22)`;
    });
    avatarContainer.addEventListener('mouseleave', () => {
        avatarImg.style.transform  = `perspective(500px) rotateX(0deg) rotateY(0deg) scale(1.15)`;
        avatarImg.style.transition = `transform 0.35s ease-out`;
    });
    avatarContainer.addEventListener('mouseenter', () => {
        avatarImg.style.transition = `transform 0.12s ease-out`;
    });
}
