/**
 * 2D Top-Down Car Physics Simulator
 * Visualizing vectors: Forward, Velocity, and Sideways Slip.
 */

// 1. Setup App (UI + State)
// Detect if the user is on a touch device
const isMobile = window.matchMedia("(pointer: coarse)").matches;

// Base settings for everyone
const appParams = {
    grip: { value: 0.8, min: 0.05, max: 1.0, step: 0.05, label: "Tire Grip" },
    // REVERTED back to normal 1200 baseline
    power: { value: 1200, min: 500, max: 4000, step: 100, label: "Engine Power" }, 
    sfx: { value: true, label: "Engine SFX" }
};

// ONLY add these sliders if the user is on a mobile device
if (isMobile) {
    appParams.dpadSize = { value: 50, min: 30, max: 90, step: 5, label: "D-Pad Size" };
    appParams.dpadOpacity = { value: 0.2, min: 0.1, max: 0.8, step: 0.1, label: "Button Visibility" };
}

// Add the reset button at the very bottom
appParams.reset = { type: 'button', label: 'Reset Car', onClick: (s) => resetCar(s) };

const { state, ui } = WH.createApp({
    title: 'Car Vector Physics | @shodan_dev',
    params: appParams
});

// SAFE STATE: Set default car type
state.currentCarType = 'sports'; 

// --- LOAD CAR IMAGES ---
const sportsCarImg = new Image();
sportsCarImg.src = 'cars-selector/sports-car.png';

const sedanCarImg = new Image();
sedanCarImg.src = 'cars-selector/sedan-car.png';

// --- Instantly update buttons when sliders move ---
if (isMobile) {
    // Set initial CSS variables
    document.documentElement.style.setProperty('--dpad-size', state.dpadSize + 'px');
    document.documentElement.style.setProperty('--dpad-opacity', state.dpadOpacity);

    // Listen for slider changes
    window.addEventListener('widget-state-update', (e) => {
        if (e.detail.key === 'dpadSize') {
            document.documentElement.style.setProperty('--dpad-size', e.detail.value + 'px');
        }
        if (e.detail.key === 'dpadOpacity') {
            document.documentElement.style.setProperty('--dpad-opacity', e.detail.value);
        }
    });
}

// 2. Initialize Internal State
state.x = 0;
state.y = 0;
state.vx = 0;
state.vy = 0;
state.angle = -Math.PI / 2; // Facing Up initially
state.keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };
state.initialized = false;
state.trail = []; // To store skid marks

// Helper: Reset function
function resetCar(s) {
    s.vx = 0;
    s.vy = 0;
    s.angle = -Math.PI / 2;
    s.trail = [];
    // Reset to center later in loop once width/height are known
    s.needsCenter = true;
}

// 3. Setup Input Listeners
window.addEventListener('keydown', (e) => { if (state.keys.hasOwnProperty(e.key)) state.keys[e.key] = true; });
window.addEventListener('keyup', (e) => { if (state.keys.hasOwnProperty(e.key)) state.keys[e.key] = false; });

// --- 3.5 Setup Mobile D-Pad Listeners ---
function setupMobileControls() {
    const mobileControls = document.getElementById('mobile-controls');
    const vizContainer = document.getElementById('viz');
    
    // MOVES the buttons inside the black game cover
    if (mobileControls && vizContainer) {
        vizContainer.appendChild(mobileControls);
    }

    function attachTouch(id, key) {
        const btn = document.getElementById(id);
        if (!btn) return;
        
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            state.keys[key] = true;
        }, { passive: false });
        
        const stopTouch = (e) => {
            e.preventDefault();
            state.keys[key] = false;
        };
        btn.addEventListener('touchend', stopTouch, { passive: false });
        btn.addEventListener('touchcancel', stopTouch, { passive: false });
    }

    attachTouch('btn-up', 'w');
    attachTouch('btn-down', 's');
    attachTouch('btn-left', 'a');
    attachTouch('btn-right', 'd');
}

// Initialize the mobile controls
setupMobileControls();

// --- 3.8 ENGINE AUDIO MANAGER (VIRTUAL GEARBOX) ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

let idleGain, speedGain1, speedGain2, speedGain3;
let idleSource, speedSource1, speedSource2, speedSource3;
let audioStarted = false;
let contextResumed = false; 

// Track volumes for our 4 separate layers
const audioState = { idleVol: 0, s1Vol: 0, s2Vol: 0, s3Vol: 0, speedPitch: 0.5 };
let idleBuffer = null;
let speedBuffer = null;

// Preload the audio files directly into memory
async function loadAudio(url) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await audioCtx.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.error("Error loading audio:", url, e);
    }
}

// Load files and start them if the user already clicked
Promise.all([
    loadAudio('resources/car-idealing.wav'),
    loadAudio('resources/car-speeding.wav') 
]).then(([idleBuf, speedBuf]) => {
    idleBuffer = idleBuf;
    speedBuffer = speedBuf;
    if (contextResumed && !audioStarted) initAudioNodes();
});

function initAudioNodes() {
    if (!idleBuffer || !speedBuffer || audioStarted) return;

    // 1. Setup Idle Audio
    idleGain = audioCtx.createGain(); idleGain.gain.value = 0; idleGain.connect(audioCtx.destination);
    idleSource = audioCtx.createBufferSource(); idleSource.buffer = idleBuffer; idleSource.loop = true;
    idleSource.connect(idleGain); idleSource.start();

    // 2. Setup Low Gear (01:00 to 04:00)
    speedGain1 = audioCtx.createGain(); speedGain1.gain.value = 0; speedGain1.connect(audioCtx.destination);
    speedSource1 = audioCtx.createBufferSource(); speedSource1.buffer = speedBuffer; 
    speedSource1.loop = true; speedSource1.loopStart = 1; speedSource1.loopEnd = 4;
    speedSource1.connect(speedGain1); speedSource1.start(0, 1); 

    // 3. Setup Med Gear (04:00 to 10:00)
    speedGain2 = audioCtx.createGain(); speedGain2.gain.value = 0; speedGain2.connect(audioCtx.destination);
    speedSource2 = audioCtx.createBufferSource(); speedSource2.buffer = speedBuffer; 
    speedSource2.loop = true; speedSource2.loopStart = 4; speedSource2.loopEnd = 10;
    speedSource2.connect(speedGain2); speedSource2.start(0, 4); 

    // 4. Setup High Gear (10:00 to 22:00)
    speedGain3 = audioCtx.createGain(); speedGain3.gain.value = 0; speedGain3.connect(audioCtx.destination);
    speedSource3 = audioCtx.createBufferSource(); speedSource3.buffer = speedBuffer; 
    speedSource3.loop = true; speedSource3.loopStart = 10; speedSource3.loopEnd = Math.min(22, speedBuffer.duration - 0.05);
    speedSource3.connect(speedGain3); speedSource3.start(0, 10); 

    audioStarted = true;
}

// Unlock audio on first touch/click
function unlockAudio() {
    if (!contextResumed) {
        audioCtx.resume().then(() => {
            contextResumed = true;
            initAudioNodes(); 
        });
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
    }
}
window.addEventListener('keydown', unlockAudio);
window.addEventListener('touchstart', unlockAudio, { passive: true });

// 4. Initialize Engine
WH.initCanvas('viz', (ctx) => {
    
    // The render loop
    return ({ ctx, width, height, time, dt, pointer, state }) => {
        // Handle First Frame or Resizing
        if (!state.initialized || state.needsCenter) {
            state.x = width / 2;
            state.y = height / 2;
            state.initialized = true;
            state.needsCenter = false;
        }

        // --- 1. PHYSICS CALCULATION ---
        
        // Input processing
        const moveInput = (state.keys.w || state.keys.ArrowUp ? 1 : 0) - (state.keys.s || state.keys.ArrowDown ? 1 : 0);
        const steerInput = (state.keys.d || state.keys.ArrowRight ? 1 : 0) - (state.keys.a || state.keys.ArrowLeft ? 1 : 0);

        // --- NEW: VEHICLE DYNAMICS MODIFIERS ---
        let powerMult = 1.0;
        let steerMult = 1.0;
        let gripMult = 1.0;

        if (state.currentCarType === 'sports') {
            powerMult = 2.65; // Increased: Hits ~350 km/h (Highest top speed)
            steerMult = 1.0;  // Standard nimble handling
            gripMult = 1.0;   // Standard grip
        } else if (state.currentCarType === 'muscle') {
            powerMult = 1.90; // Decreased: Capped around ~250 km/h
            steerMult = 0.70; // -30% Cornering turn speed (Sluggish/Heavy)
            gripMult = 0.70;  // -30% Traction (Tail-happy, drifts easily)
        } else if (state.currentCarType === 'sedan') {
            powerMult = 1.50; // Standard: Capped around ~200 km/h
            steerMult = 1.25; // +25% Cornering turn speed (Nimble handling)
            gripMult = 1.40;  // +40% Traction (Sticks to the road)
        }

        // Movement Vectors
        const fx = Math.cos(state.angle); // Forward X
        const fy = Math.sin(state.angle); // Forward Y
        const rx = Math.cos(state.angle + Math.PI / 2); // Right X
        const ry = Math.sin(state.angle + Math.PI / 2); // Right Y

        // Project velocity onto local axes
        const forwardSpeed = state.vx * fx + state.vy * fy;
        const sideSpeed = state.vx * rx + state.vy * ry;

        // Acceleration (Modified by Car Type)
        const accel = moveInput * (state.power * powerMult) * dt;
        state.vx += fx * accel;
        state.vy += fy * accel;

        // Steering (Modified by Car Type)
        const steerSpeed = 4.5 * steerMult; // radians per second
        const steerFactor = Math.min(Math.abs(forwardSpeed) / 100, 1.0) * (forwardSpeed < 0 ? -1 : 1);
        state.angle += steerInput * steerSpeed * steerFactor * dt;

        // Grip / Friction Logic (Modified by Car Type)
        const gripEffect = (state.grip * gripMult) * 15.0; 
        state.vx -= rx * sideSpeed * gripEffect * dt;
        state.vy -= ry * sideSpeed * gripEffect * dt;

        // General Drag (Air resistance / Rolling resistance)
        state.vx *= 0.985;
        state.vy *= 0.985;

        // Update Position
        state.x += state.vx * dt;
        state.y += state.vy * dt;

        // Screen Wrap (Optional but keeps simulation continuous)
        const margin = 50;
        if (state.x < -margin) state.x = width + margin;
        if (state.x > width + margin) state.x = -margin;
        if (state.y < -margin) state.y = height + margin;
        if (state.y > height + margin) state.y = -margin;

        // Trail Logic (Skid marks when drifting)
        const slipRatio = Math.abs(sideSpeed) / (Math.abs(forwardSpeed) + 1);
        if (slipRatio > 0.3 || (Math.abs(accel) > 0 && Math.abs(forwardSpeed) < 50)) {
             state.trail.push({ x: state.x, y: state.y, alpha: 1.0 });
        }
        if (state.trail.length > 100) state.trail.shift();

        // --- 2. DRAWING ---

        // ENLARGED CAR SIZE: Changed from 0.08 to 0.13
        const carSize = Math.min(width, height) * 0.13; 
        const vectorScale = 0.5; 

        // Draw Trails
        ctx.strokeStyle = WH.transparent('--on-surface-default', 0.2);
        ctx.lineWidth = 2;
        ctx.beginPath();
        state.trail.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Draw Car Body
        ctx.save();
        ctx.translate(state.x, state.y);
        ctx.rotate(state.angle);
        
        // Shadow/Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = WH.transparent('--primary', 0.4);

        if (state.currentCarType === 'sports' && sportsCarImg.complete) {
            ctx.rotate(Math.PI / 2);
            const imgRatio = sportsCarImg.height / (sportsCarImg.width || 1);
            const imgW = carSize;
            const imgH = carSize * imgRatio; 
            ctx.drawImage(sportsCarImg, -imgW/2, -imgH/2, imgW, imgH);
            
        } else if (state.currentCarType === 'sedan' && sedanCarImg.complete) {
            ctx.rotate(Math.PI / 2);
            const imgRatio = sedanCarImg.height / (sedanCarImg.width || 1);
            const imgW = carSize;
            const imgH = carSize * imgRatio; 
            ctx.drawImage(sedanCarImg, -imgW/2, -imgH/2, imgW, imgH);
            
        } else {
            // MUSCLE CAR (The flat code logic)
            ctx.fillStyle = WH.getColor('--primary');
            ctx.fillRect(-carSize/2, -carSize/4, carSize, carSize/2);
            
            ctx.fillStyle = WH.getColor('--surface'); // Windshield
            ctx.fillRect(carSize/4, -carSize/5, carSize/6, carSize/2.5);
        }
        
        ctx.restore();

        // --- 3. VECTOR VISUALS ---
        
        // 1. Forward Vector (Blue) - Where the nose points
        const fLen = carSize * 1.5;
        ctx.drawArrow(state.x, state.y, fx * fLen, fy * fLen, '--chart-1');
        
        // 2. Velocity Vector (Red) - Actual momentum
        const vLen = Math.sqrt(state.vx**2 + state.vy**2) * vectorScale;
        if (vLen > 5) {
            ctx.drawArrow(state.x, state.y, state.vx * vectorScale, state.vy * vectorScale, '--chart-4');
        }

        // 3. Sideways Slip (Green) - The "Drift" component
        // Velocity projected onto the 'Right' vector
        const slipX = rx * sideSpeed;
        const slipY = ry * sideSpeed;
        if (Math.abs(sideSpeed) > 5) {
            ctx.drawArrow(state.x, state.y, slipX * vectorScale, slipY * vectorScale, '--chart-2');
        }

        // Labels for Vectors
        // if (vLen > 20) {
        //     ctx.save();
        //     ctx.font = '12px sans-serif';
        //     ctx.fillStyle = WH.getColor('--on-surface-default');
        //     ctx.fillText("Forward (Facing)", state.x + fx * fLen + 10, state.y + fy * fLen);
        //     ctx.restore();
        // }

        // --- Legend Overlay (Shifted down to clear Home Button) ---
        ctx.drawTag("Blue: Forward Facing", 20, 80, '--chart-1');
        ctx.drawTag("Red: Actual Velocity", 20, 115, '--chart-4');
        ctx.drawTag("Green: Sideways Slip", 20, 150, '--chart-2');

        // --- NEW: TOP-RIGHT HUD (Inside Canvas) ---
        // FIX: Use Total Velocity instead of Forward Vector to prevent audio/speed glitching during spins
        const totalVelocity = Math.sqrt(state.vx**2 + state.vy**2);
        const currentSpeedKmH = Math.round(totalVelocity * 0.1);
        
        ctx.save();
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.font = 'bold 16px monospace';
        
        ctx.fillStyle = window.WH.getColor('--on-surface-default');
        ctx.fillText(`SPEED: ${currentSpeedKmH} km/h`, width - 20, 20);
        
        ctx.fillStyle = window.WH.getColor('--on-surface-de-emphasis');
        ctx.fillText(`SLIP: ${Math.round(sideSpeed)} px/s`, width - 20, 45);
        
        ctx.fillStyle = state.grip > 0.5 ? window.WH.getColor('--success') : window.WH.getColor('--warning');
        ctx.fillText(`GRIP: ${state.grip > 0.5 ? "Sticky" : "Drifty"}`, width - 20, 70);
        ctx.restore();

        // --- NEW: 3-SECOND INTRO SPLASH ---
        if (time < 3) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Fades out smoothly between second 2 and 3
            ctx.globalAlpha = time > 2 ? 3 - time : 1.0; 

            // Title
            ctx.fillStyle = window.WH.getColor('--on-surface-default');
            ctx.font = 'bold 36px sans-serif';
            ctx.fillText("Car Vector Physics", width / 2, height / 2 - 20);
            
            // Subtitle / Developer
            ctx.font = 'bold 18px monospace';
            ctx.fillStyle = window.WH.getColor('--primary');
            ctx.fillText("@shodan_dev", width / 2, height / 2 + 15);
            
            // Instructions
            ctx.font = '14px sans-serif';
            ctx.fillStyle = window.WH.getColor('--on-surface-de-emphasis');
            ctx.fillText("Use WASD, Arrow Keys, or D-Pad to Drive", width / 2, height / 2 + 50);

            ctx.restore();
        }

        // --- 4. DYNAMIC ENGINE AUDIO (SMART GEARBOX) ---
        if (audioStarted) {
            let targetIdle = 0;
            let targetS1 = 0;
            let targetS2 = 0;
            let targetS3 = 0;
            let targetPitch = 0.5;

            const isSfxOn = state.sfx !== false;
            
            // 1. Determine the top speed of the CURRENT car
            let maxSpeed = 350; // Default for Sports
            if (state.currentCarType === 'muscle') maxSpeed = 250;
            if (state.currentCarType === 'sedan') maxSpeed = 200;

            const gasPedal = Math.abs(moveInput); 

            if (currentSpeedKmH === 0 && gasPedal === 0) {
                targetIdle = 0.6; 
                targetPitch = 0.5; 
            } else {
                targetIdle = Math.max(0, 0.6 - (currentSpeedKmH * 0.05));
                let baseVol = gasPedal > 0 ? 0.8 : 0.3;

                // 2. DYNAMIC GEARBOX: Calculate shift points based on car's top speed
                const shift1 = maxSpeed * 0.30; // Shifts to 2nd gear at 30% of max speed
                const shift2 = maxSpeed * 0.65; // Shifts to 3rd gear at 65% of max speed

                if (currentSpeedKmH <= shift1) {
                    targetS1 = baseVol;      // Low Gear
                } else if (currentSpeedKmH <= shift2) {
                    targetS2 = baseVol;      // Med Gear
                } else {
                    targetS3 = baseVol;      // High Gear
                }

                // 3. Pitch: Scales perfectly to the car's specific top speed
                let basePitch = gasPedal > 0 ? 0.9 : 0.6;
                targetPitch = basePitch + (currentSpeedKmH / maxSpeed) * 1.3; 
            }

            if (!isSfxOn) {
                targetIdle = targetS1 = targetS2 = targetS3 = 0;
            }

            audioState.idleVol += (targetIdle - audioState.idleVol) * 0.1;
            audioState.s1Vol += (targetS1 - audioState.s1Vol) * 0.1;
            audioState.s2Vol += (targetS2 - audioState.s2Vol) * 0.1;
            audioState.s3Vol += (targetS3 - audioState.s3Vol) * 0.1;
            audioState.speedPitch += (targetPitch - audioState.speedPitch) * 0.1;

            if (idleGain) idleGain.gain.value = audioState.idleVol;
            if (speedGain1) speedGain1.gain.value = audioState.s1Vol;
            if (speedGain2) speedGain2.gain.value = audioState.s2Vol;
            if (speedGain3) speedGain3.gain.value = audioState.s3Vol;

            if (speedSource1) speedSource1.playbackRate.value = audioState.speedPitch;
            if (speedSource2) speedSource2.playbackRate.value = audioState.speedPitch;
            if (speedSource3) speedSource3.playbackRate.value = audioState.speedPitch;
        }
    };
});

// --- Overlay UI Logic (Dynamic Injection) ---
function setupOverlayUI() {
    const controlsMenu = document.getElementById('controls-root');
    const vizContainer = document.getElementById('viz');

    if (vizContainer && controlsMenu && !document.getElementById('settings-toggle')) {
        
        // --- NEW: TOP-CENTER MENU WRAPPER ---
        const topMenu = document.createElement('div');
        topMenu.id = 'top-menu-container';
        vizContainer.appendChild(topMenu);

        // 1. Home Button (Inside top menu)
        const homeBtn = document.createElement('a');
        homeBtn.id = 'home-btn';
        homeBtn.className = 'overlay-btn';
        homeBtn.textContent = '🏠 Home';
        homeBtn.href = 'https://shahid-shaikh02.github.io/shodan-games/'; 
        topMenu.appendChild(homeBtn);

        // 2. Settings Button (Inside top menu)
        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'settings-toggle';
        settingsBtn.className = 'overlay-btn';
        settingsBtn.textContent = '⚙️ Settings';
        topMenu.appendChild(settingsBtn);
        vizContainer.appendChild(controlsMenu);

        // 3. Credits Button (Now sits cleanly in the top-left)
        const creditBtn = document.createElement('button');
        creditBtn.id = 'credit-btn';
        creditBtn.className = 'overlay-btn';
        creditBtn.textContent = '✨ Credits';
        vizContainer.appendChild(creditBtn);

        // 4. Credits Popup
        const toast = document.createElement('div');
        toast.id = 'credit-toast';
        toast.innerHTML = `
            <h2 style="margin:0; font-family:sans-serif;">Car Vector Physics</h2>
            <p style="margin:0; font-family:sans-serif; color:#aaa;">Created & Developed by</p>
            <h3 style="margin:0; font-family:monospace; color:var(--primary);">@shodan_dev</h3>
            <div style="display:flex; gap:10px; justify-content:center; margin-top:12px;">
                <a href="https://www.youtube.com/@shodan_dev" target="_blank" class="xxs-btn" style="text-decoration:none; font-size:13px; height:32px; flex:none; padding:0 15px;">▶ YouTube</a>
                <a href="https://github.com/Shahid-Shaikh02/" target="_blank" class="xxs-btn" style="text-decoration:none; font-size:13px; height:32px; flex:none; padding:0 15px;">🐙 GitHub</a>
            </div>
            <button id="close-credit" class="xxs-btn" style="margin-top:15px; background:var(--surface-container-highest); border:1px solid var(--outline);">Close</button>
        `;
        vizContainer.appendChild(toast);

        // 5. Garage Button
        const garageBtn = document.createElement('button');
        garageBtn.id = 'garage-btn';
        garageBtn.className = 'overlay-btn';
        garageBtn.textContent = '🚘 Garage';
        vizContainer.appendChild(garageBtn);

        // 6. Garage Modal (3 Cars)
        const garageModal = document.createElement('div');
        garageModal.id = 'garage-modal';
        garageModal.innerHTML = `
            <div class="modal-header">SPAWN VEHICLE</div>
            <div class="car-options">
                <button id="switch-sports" class="modal-btn active">Sports Car</button>
                <button id="switch-muscle" class="modal-btn">Muscle Car</button>
                <button id="switch-sedan" class="modal-btn">Sedan Car</button>
            </div>
            <button id="close-garage" class="modal-close-btn">Close</button>
        `;
        vizContainer.appendChild(garageModal);

        // --- Interaction Logic ---
        const toggleMenu = (e) => { e.preventDefault(); e.stopPropagation(); controlsMenu.classList.toggle('menu-open'); };
        settingsBtn.addEventListener('click', toggleMenu);
        settingsBtn.addEventListener('touchstart', toggleMenu, { passive: false });

        creditBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toast.classList.add('show'); });
        document.getElementById('close-credit').addEventListener('click', () => toast.classList.remove('show') );

        garageBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); garageModal.classList.add('show'); });
        document.getElementById('close-garage').addEventListener('click', () => garageModal.classList.remove('show') );

        // --- 3-Car Switcher Logic ---
        const btnSports = document.getElementById('switch-sports');
        const btnMuscle = document.getElementById('switch-muscle');
        const btnSedan = document.getElementById('switch-sedan');
        
        const updateGarageUI = (activeBtn, type) => {
            state.currentCarType = type;
            [btnSports, btnMuscle, btnSedan].forEach(btn => btn.classList.remove('active'));
            activeBtn.classList.add('active');
        };

        btnSports.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); updateGarageUI(btnSports, 'sports'); });
        btnMuscle.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); updateGarageUI(btnMuscle, 'muscle'); });
        btnSedan.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); updateGarageUI(btnSedan, 'sedan'); });

        vizContainer.addEventListener('touchstart', (e) => {
            if (e.target.id !== 'settings-toggle' && !controlsMenu.contains(e.target)) controlsMenu.classList.remove('menu-open');
        }, { passive: true });
    }
}
setupOverlayUI();
setTimeout(setupOverlayUI, 500);