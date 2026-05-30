// ── Subtle card entrance ───────────────────────────────
const card = document.querySelector('.uc-card');
card.style.opacity   = '0';
card.style.transform = 'translateY(28px)';
card.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
requestAnimationFrame(() => requestAnimationFrame(() => {
    card.style.opacity   = '1';
    card.style.transform = 'translateY(0)';
}));
