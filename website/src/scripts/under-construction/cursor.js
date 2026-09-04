
        // ── Custom cursor ──────────────────────────────────────
        const dot     = document.getElementById('cursor-dot');
        const outline = document.getElementById('cursor-outline');
        let mx = -100, my = -100, ox = -100, oy = -100;
        window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        (function animCursor() {
            ox += (mx - ox) * 0.15;
            oy += (my - oy) * 0.15;
            dot.style.left     = mx + 'px';
            dot.style.top      = my + 'px';
            outline.style.left = ox + 'px';
            outline.style.top  = oy + 'px';
            requestAnimationFrame(animCursor);
        })();
