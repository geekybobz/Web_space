        // ── Animated progress bar (random drift) ──────────────
        const fill   = document.getElementById('progress-fill');
        const pctTxt = document.getElementById('pct-display');
        let current  = 0;
        const MIN = 12, MAX = 78;

        (function rampUp() {
            if (current < 40) {
                current = Math.min(current + 1.2, 40);
                fill.style.width   = current + '%';
                pctTxt.textContent = Math.round(current) + '%';
                requestAnimationFrame(rampUp);
            } else {
                setInterval(() => {
                    // -6 to +8: slight optimism bias 😄
                    const step = (Math.random() * 14) - 6;
                    current = Math.min(MAX, Math.max(MIN, current + step));
                    fill.style.width   = current.toFixed(1) + '%';
                    pctTxt.textContent = Math.round(current) + '%';
                }, 900);
            }
        })();
