// Custom Cursor Logic
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Add slight delay for outline curve effect
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Interactive 3D Avatar Tilt Effect
const avatarContainer = document.querySelector('.hero-avatar');
const avatarImg = document.querySelector('.profile-pic');

if (avatarImg) {
    const avatars = ['avatar_1.png', 'avatar_2.png'];
    // Pick a random avatar; if same as last shown, pick the other one
    const lastAvatar = localStorage.getItem('selectedAvatar');
    let nextAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    if (nextAvatar === lastAvatar) {
        nextAvatar = avatars.find(a => a !== lastAvatar) || nextAvatar;
    }
    avatarImg.src = nextAvatar;
    localStorage.setItem('selectedAvatar', nextAvatar);
}

if (avatarContainer && avatarImg) {
    avatarContainer.addEventListener('mousemove', (e) => {
        const rect = avatarContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xRotation = 12 * ((y - rect.height / 2) / rect.height);
        const yRotation = -12 * ((x - rect.width / 2) / rect.width);
        
        // Keep base scale(1.15) face-zoom, add extra 1.05 on hover tilt
        avatarImg.style.transform = `perspective(500px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) scale(1.22)`;
    });

    avatarContainer.addEventListener('mouseleave', () => {
        // Return to base face-zoom scale
        avatarImg.style.transform = `perspective(500px) rotateX(0deg) rotateY(0deg) scale(1.15)`;
        avatarImg.style.transition = `transform 0.35s ease-out`;
    });
    
    avatarContainer.addEventListener('mouseenter', () => {
        avatarImg.style.transition = `transform 0.12s ease-out`;
    });
}

// Removed interactive state vector logic in favor of automated CSS animation

// Simulate neural network pulses and state vector optimization based on button click
const blochBanner = document.querySelector('.quantum-banner .hero-visual');
const stateVectorArrow = document.getElementById('state-vector');
const fidelityReadout = document.getElementById('fidelity-score');
const pStrengthReadout = document.getElementById('pulse-strength');
const sinePath = document.getElementById('sine-wave-path');
const firePulseBtn = document.getElementById('fire-pulse-btn');

if (blochBanner && stateVectorArrow && sinePath && firePulseBtn) {
    let currentAmplitude = 0;
    let targetAmplitude = 0;
    let isPulseActive = false;
    let chaoticSpinTimeout;
    
    // Base spin to keep things moving slowly
    let baseSpinZ = 0; 
    
    // Pitch determines if pointing at |0> (0deg) or |1> (180deg)
    let currentPitchX = 180; 
    let targetPitchX = 180; 

    const MAX_AMPLITUDE = 80;

    // Animation Loop
    function updateQuantumState() {
        // Smoothly interpolate current amplitude towards target
        currentAmplitude += (targetAmplitude - currentAmplitude) * 0.1;
        
        // Decay target amplitude back to 0 slowly
        targetAmplitude *= 0.95;
        
        if (currentAmplitude < 0.5) currentAmplitude = 0;

        // Draw Sine Wave
        const d = `M 0 20 Q 50 ${20 - currentAmplitude} 100 20 T 200 20`;
        sinePath.setAttribute('d', d);

        // Update State Vector
        // If pulse active, we inject chaotic noise, else we smoothly interpolate to target Pitch
        if (isPulseActive) {
            currentPitchX += (Math.random() - 0.5) * 100; // Chaotic jumping
            baseSpinZ += (Math.random() - 0.5) * 100;
            
            // Text reads random noise
            if(fidelityReadout) fidelityReadout.innerText = (Math.random() * 0.99).toFixed(4);
            if(pStrengthReadout) pStrengthReadout.innerText = (Math.random() * 5).toFixed(2);
            
        } else {
            // Smoothly move towards target pole
            currentPitchX += (targetPitchX - currentPitchX) * 0.05;
            baseSpinZ += 0.5; // continuous slow spin
            
            // Text stabilizes
            const normalizedFid = 1 - (currentPitchX / 180);
            if(fidelityReadout) fidelityReadout.innerText = (0.5 + (normalizedFid * 0.499)).toFixed(4);
            if(pStrengthReadout) pStrengthReadout.innerText = (currentAmplitude / MAX_AMPLITUDE * 5).toFixed(2);
        }

        // Clamp Pitch for visual sanity
        if (currentPitchX < 0) currentPitchX = 0;
        if (currentPitchX > 180) currentPitchX = 180;
        
        stateVectorArrow.style.transform = `translate(-50%, -100%) rotateZ(${baseSpinZ}deg) rotateX(${currentPitchX}deg)`;

        requestAnimationFrame(updateQuantumState);
    }
    
    // Start Animation Loop
    updateQuantumState();

    // Fire Pulse (step_>) Button Logic
    let isHoldingBtn = false;
    let holdStartTime = 0;

    firePulseBtn.addEventListener('mousedown', () => {
        if (isPulseActive) return;
        isHoldingBtn = true;
        holdStartTime = Date.now();
        // Visual feedback for charging
        firePulseBtn.style.transform = 'translate(-50%) translateY(2px)';
        firePulseBtn.style.background = 'rgba(16, 185, 129, 0.2)';
    });

    // Support touch devices as well
    firePulseBtn.addEventListener('touchstart', (e) => {
        e.preventDefault(); 
        if (isPulseActive) return;
        isHoldingBtn = true;
        holdStartTime = Date.now();
        firePulseBtn.style.transform = 'translate(-50%) translateY(2px)';
        firePulseBtn.style.background = 'rgba(16, 185, 129, 0.2)';
    });

    const releasePulse = () => {
        if (!isHoldingBtn) return;
        isHoldingBtn = false;
        firePulseBtn.style.transform = '';
        firePulseBtn.style.background = '';
        
        if (isPulseActive) return;
        
        const holdDuration = Date.now() - holdStartTime;
        
        // Calculate intensity based on hold time (cap at 2000ms for max effect)
        let intensityFactor = Math.min(holdDuration / 2000, 1.0);
        
        // Ensure a minimum pulse even for quick taps
        if (intensityFactor < 0.2) intensityFactor = 0.2; 
        
        // 1. Fire pulse with intensity-based amplitude, plus some randomness
        targetAmplitude = MAX_AMPLITUDE * intensityFactor * (0.8 + Math.random() * 0.4); 
        isPulseActive = true;
        
        clearTimeout(chaoticSpinTimeout);
        
        // 2. Chaotic search phase scales with intensity
        const searchDuration = 500 + (intensityFactor * 1500); 
        
        chaoticSpinTimeout = setTimeout(() => {
            isPulseActive = false;
            
            // 3. Peak state reached - map intensity to state pitch
            // Max intensity (1.0) gets very close to |0> (pitch ~ 0)
            // Low intensity might only reach halfway up the sphere
            targetPitchX = 180 - (180 * intensityFactor); 
            
            // 4. Decay back to |1> 
            setTimeout(() => {
                targetPitchX = 180;
            }, 3000 + (intensityFactor * 3000)); // Hold longer if better state
            
        }, searchDuration);
    };

    window.addEventListener('mouseup', releasePulse);
    window.addEventListener('touchend', releasePulse);
}

// Add hover effect to interactive elements
const interactables = document.querySelectorAll('a, button, .skill-tag, .project-card');

interactables.forEach(item => {
    item.addEventListener('mouseenter', () => {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(2)';
        cursorDot.style.backgroundColor = 'var(--accent-1)';
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursorOutline.style.borderColor = 'var(--accent-1)';
    });

    item.addEventListener('mouseleave', () => {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorDot.style.backgroundColor = 'var(--accent-2)';
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorOutline.style.borderColor = 'rgba(139, 92, 246, 0.5)';
    });
});

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Navigation Toggle
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');

if(mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Close mobile menu when clicking a link
const navItems = document.querySelectorAll('.nav-link');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        if(navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
});


// Intersection Observer for Reveal Animations
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Optional: stop observing once revealed
            // observer.unobserve(entry.target);
        }
    });
};

const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => {
    revealObserver.observe(el);
});

// Re-check reveals on resize/zoom so nothing stays hidden after layout shift
function checkRevealsInView() {
    revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('active');
        }
    });
}
window.addEventListener('resize', checkRevealsInView);
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', checkRevealsInView);
}

// On load trigger for top elements
window.addEventListener('load', () => {
    setTimeout(() => {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('active');
            }
        });
        
        // Neural Network SVG connection lines
        const svgContainer = document.querySelector('.nn-connections');
        const layers = document.querySelectorAll('.nn-layer');

        if(svgContainer && layers.length > 0) {
            const svgRect = svgContainer.getBoundingClientRect();
            
            for (let i = 0; i < layers.length - 1; i++) {
                const currentLayerNodes = layers[i].querySelectorAll('.node');
                const nextLayerNodes = layers[i+1].querySelectorAll('.node');
                
                currentLayerNodes.forEach(startNode => {
                    const startRect = startNode.getBoundingClientRect();
                    // Coordinates relative to SVG container
                    const startX = startRect.left + (startRect.width/2) - svgRect.left;
                    const startY = startRect.top + (startRect.height/2) - svgRect.top;
                    
                    nextLayerNodes.forEach(endNode => {
                        const endRect = endNode.getBoundingClientRect();
                        const endX = endRect.left + (endRect.width/2) - svgRect.left;
                        const endY = endRect.top + (endRect.height/2) - svgRect.top;
                        
                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.setAttribute('x1', startX);
                        line.setAttribute('y1', startY);
                        line.setAttribute('x2', endX);
                        line.setAttribute('y2', endY);
                        line.classList.add('nn-line');
                        
                        svgContainer.appendChild(line);
                    });
                });
            }
        }
    }, 100);
});
