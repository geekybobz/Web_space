// ========== PROJECT CARD TOGGLES ==========
const projectToggleButtons = Array.from(document.querySelectorAll('.project-toggle'));

if (projectToggleButtons.length) {
    const closeProjectCard = (button) => {
        const detailId = button.getAttribute('aria-controls');
        const detail = detailId ? document.getElementById(detailId) : null;
        if (!detail) return;
        detail.hidden = true;
        button.setAttribute('aria-expanded', 'false');
        button.textContent = 'View Abstract';
        button.closest('.research-card')?.classList.remove('is-open');
    };

    const openProjectCard = (button) => {
        const detailId = button.getAttribute('aria-controls');
        const detail = detailId ? document.getElementById(detailId) : null;
        if (!detail) return;
        projectToggleButtons.forEach((otherButton) => {
            if (otherButton !== button) closeProjectCard(otherButton);
        });
        detail.hidden = false;
        button.setAttribute('aria-expanded', 'true');
        button.textContent = 'Hide Abstract';
        button.closest('.research-card')?.classList.add('is-open');
    };

    projectToggleButtons.forEach((button) => {
        closeProjectCard(button);
        button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') === 'true';
            if (expanded) {
                closeProjectCard(button);
                return;
            }
            openProjectCard(button);
        });
    });
}
