// ========== POSTER TOGGLES ==========
const posterToggleButtons = Array.from(document.querySelectorAll('.poster-toggle'));
if (posterToggleButtons.length) {
    posterToggleButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('aria-controls');
            const embed = targetId ? document.getElementById(targetId) : null;
            if (!embed) return;
            const expanded = button.getAttribute('aria-expanded') === 'true';
            embed.hidden = expanded;
            button.setAttribute('aria-expanded', String(!expanded));
            const icon = button.querySelector('i');
            if (expanded) {
                button.childNodes[0].textContent = 'View Poster ';
                if (icon) { icon.className = 'fa-solid fa-arrow-right'; }
            } else {
                button.childNodes[0].textContent = 'Hide Poster ';
                if (icon) { icon.className = 'fa-solid fa-arrow-up'; }
                const iframe = embed.querySelector('iframe[data-src]');
                if (iframe && !iframe.hasAttribute('src')) {
                    iframe.setAttribute('src', iframe.dataset.src);
                }
            }
        });
    });
}
