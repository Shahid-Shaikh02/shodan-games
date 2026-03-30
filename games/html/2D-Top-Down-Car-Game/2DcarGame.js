/**
 * 2D Top-Down Car Physics Simulator
 * Visualizing vectors: Forward, Velocity, and Sideways Slip.
 */

// 1. Setup App (UI + State)
const { state, ui } = WH.createApp({
    title: 'Car Vector Physics | @shodan_dev',
    params: {
        grip: { value: 0.8, min: 0.05, max: 1.0, step: 0.05, label: "Tire Grip" },
        power: { value: 1200, min: 500, max: 2500, step: 100, label: "Engine Power" },
        reset: { type: 'button', label: 'Reset Car', onClick: (s) => resetCar(s) }
    }
});

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

        // Movement Vectors
        const fx = Math.cos(state.angle); // Forward X
        const fy = Math.sin(state.angle); // Forward Y
        const rx = Math.cos(state.angle + Math.PI / 2); // Right X
        const ry = Math.sin(state.angle + Math.PI / 2); // Right Y

        // Project velocity onto local axes
        const forwardSpeed = state.vx * fx + state.vy * fy;
        const sideSpeed = state.vx * rx + state.vy * ry;

        // Acceleration
        const accel = moveInput * state.power * dt;
        state.vx += fx * accel;
        state.vy += fy * accel;

        // Steering (Only steer if car has some momentum)
        const steerSpeed = 4.5; // radians per second
        // We steer based on forward speed to simulate turn radius
        const steerFactor = Math.min(Math.abs(forwardSpeed) / 100, 1.0) * (forwardSpeed < 0 ? -1 : 1);
        state.angle += steerInput * steerSpeed * steerFactor * dt;

        // Grip / Friction Logic (Crucial for drifting)
        // We cancel out sideways velocity based on the grip slider
        // grip = 1.0 means sideways speed is killed almost instantly
        const gripEffect = state.grip * 15.0; // multiplier to make slider feel right
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

        const carSize = Math.min(width, height) * 0.08;
        const vectorScale = 0.5; // Scale for visual arrows

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

        // Simple Rectangle Car
        ctx.fillStyle = WH.getColor('--primary');
        ctx.fillRect(-carSize/2, -carSize/4, carSize, carSize/2);
        
        // Windshield (Identify Front)
        ctx.fillStyle = WH.getColor('--surface');
        ctx.fillRect(carSize/4, -carSize/5, carSize/6, carSize/2.5);
        
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
        if (vLen > 20) {
            ctx.save();
            ctx.font = '12px sans-serif';
            ctx.fillStyle = WH.getColor('--on-surface-default');
            ctx.fillText("Forward (Facing)", state.x + fx * fLen + 10, state.y + fy * fLen);
            ctx.restore();
        }

        // Legend Overlay
        ctx.drawTag("Blue: Forward Facing", 20, 30, '--chart-1');
        ctx.drawTag("Red: Actual Velocity", 20, 65, '--chart-4');
        ctx.drawTag("Green: Sideways Slip", 20, 100, '--chart-2');

        // Instructions
        if (time < 5) {
            ui.setStatus("Use WASD or Arrow Keys to Drive");
        } else {
            ui.setStatus("Use WASD or Arrow Keys to Drive");
        }

        // HUD Stats
        const currentSpeedKmH = Math.round(Math.abs(forwardSpeed) * 0.1);
        ui.setHUD([
            { label: "Speed", value: `${currentSpeedKmH} km/h` },
            { label: "Slip", value: `${Math.round(sideSpeed)} px/s` },
            { label: "Grip Status", value: state.grip > 0.5 ? "Sticky" : "Drifty" }
        ]);
    };
});