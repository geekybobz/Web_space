// ========== CUSTOM CURSOR ==========
const cursorDot     = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline) {
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    let _cursorRafId = null;
    function _startCursorRaf() {
        if (_cursorRafId) return;
        function step() {
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;
            cursorOutline.style.left = outlineX + 'px';
            cursorOutline.style.top  = outlineY + 'px';
            if (Math.abs(mouseX - outlineX) + Math.abs(mouseY - outlineY) < 0.3) {
                _cursorRafId = null;
                return;
            }
            _cursorRafId = requestAnimationFrame(step);
        }
        _cursorRafId = requestAnimationFrame(step);
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top  = mouseY + 'px';
        _startCursorRaf();
    });

    const interactables = document.querySelectorAll('a, button, .skill-tag, .project-card, .philosophy-card, .page-dot');
    interactables.forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(2)';
            cursorDot.style.backgroundColor = 'var(--accent-1)';
            cursorOutline.style.transform   = 'translate(-50%, -50%) scale(1.5)';
            cursorOutline.style.borderColor = 'var(--accent-1)';
        });
        item.addEventListener('mouseleave', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorDot.style.backgroundColor = 'var(--accent-2)';
            cursorOutline.style.transform   = 'translate(-50%, -50%) scale(1)';
            cursorOutline.style.borderColor = 'rgba(139, 92, 246, 0.5)';
        });
    });
}
