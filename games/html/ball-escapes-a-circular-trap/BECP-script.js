(() => {
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2;

    // --- CONFIG ---
    const ringCount = 6;           // number of circular lines
    const ringGap = 45;            // distance between rings (px)
    const ringStartRadius = 80;    // radius of innermost ring
    const segmentDegrees = 3;      // angle size of each saved/erased segment
    const eraseWidthSegments = 4;  // how wide to erase around contact (in segments)
    const ringStroke = 3;          // line thickness
    const ballRadius = 8;          // ball visual radius
    const bounceOuterIfClosed = true; // bounce on outer wall only if that segment exists

    // Build radii
    const radii = Array.from({length:ringCount}, (_,i)=> ringStartRadius + i*ringGap);

    // For each ring, keep a boolean array of segments: true = draw, false = erased
    const segPerRing = Math.round(360 / segmentDegrees);
    let rings; // will be created in reset()

    // Ball
    let ball, escaped = false, speedScale = parseFloat(document.getElementById('speed').value);

    function resetRings() {
      rings = radii.map(() => Array(segPerRing).fill(true));
      // Optional: pre-cut a small gap somewhere to tease an exit
      // rings[rings.length-1].fill(true); // keep outer intact initially
    }

    function resetBall() {
      escaped = false;
      document.getElementById('status').classList.remove('show');

      const angle = Math.random()*Math.PI*2;
      const startR = radii[0] - 10; // start inside inner ring
      const x = cx + Math.cos(angle)*startR;
      const y = cy + Math.sin(angle)*startR;

      // Random direction
      const dir = Math.random()*Math.PI*2;
      const baseSpeed = 2.0;
      ball = {
        x, y,
        vx: Math.cos(dir)*baseSpeed,
        vy: Math.sin(dir)*baseSpeed
      };
    }

    function reset() {
      resetRings();
      resetBall();
    }

    function angleToIndex(theta) {
      // theta in radians -> [0, 2pi)
      let deg = (theta * 180 / Math.PI) % 360;
      if (deg < 0) deg += 360;
      return Math.floor(deg / segmentDegrees);
    }

    function eraseSegment(ringIdx, segIdx) {
      const ring = rings[ringIdx];
      for (let k = -eraseWidthSegments; k <= eraseWidthSegments; k++) {
        let i = (segIdx + k) % segPerRing;
        if (i < 0) i += segPerRing;
        ring[i] = false;
      }
    }

    function draw() {
      ctx.clearRect(0,0,W,H);

      // Background subtle radial
      const g = ctx.createRadialGradient(cx,cy, 0, cx,cy, W*0.75);
      g.addColorStop(0, '#0f131a');
      g.addColorStop(1, '#0b0f15');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,W,H);

      // Draw rings (only intact segments)
      ctx.lineWidth = ringStroke;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#7aa2ff22'; // glow underlay
      drawRings('#2e7bff', '#7aa2ff22');

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI*2);
      ctx.fillStyle = escaped ? '#9bffb2' : '#ffd166';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Center point (optional)
      // ctx.fillStyle = '#223';
      // ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI*2); ctx.fill();
    }

    function drawRings(mainColor, glowColor) {
      // glow pass + main pass per ring
      for (let pass=0; pass<2; pass++) {
        ctx.strokeStyle = pass===0 ? glowColor : mainColor;
        ctx.lineWidth = pass===0 ? ringStroke+4 : ringStroke;
        ctx.shadowColor = pass===0 ? glowColor : 'transparent';
        ctx.shadowBlur = pass===0 ? 8 : 0;

        radii.forEach((r, idx) => {
          const segs = rings[idx];
          // draw continuous arcs for runs of true
          let runStart = null;
          for (let i=0;i<=segPerRing;i++){
            const on = segs[i % segPerRing];
            if (on && runStart===null) {
              runStart = i;
            }
            if ((!on || i===segPerRing) && runStart!==null) {
              const a0 = (runStart    ) * segmentDegrees * Math.PI/180;
              const a1 = (i           ) * segmentDegrees * Math.PI/180;
              ctx.beginPath();
              ctx.arc(cx, cy, r, a0, a1);
              ctx.stroke();
              runStart = null;
            }
          }
        });
      }
    }

    function step() {
      if (!escaped) {
        // Move ball
        ball.x += ball.vx * speedScale;
        ball.y += ball.vy * speedScale;

        // Collision vs rings
        const dx = ball.x - cx, dy = ball.y - cy;
        const dist = Math.hypot(dx, dy);
        const theta = Math.atan2(dy, dx);
        const segIdx = angleToIndex(theta);

        // Find the nearest ring index (if within hit threshold)
        const hitThreshold = ringStroke/2 + ballRadius + 1;
        for (let rIdx=0; rIdx<radii.length; rIdx++) {
          const r = radii[rIdx];
          const delta = Math.abs(dist - r);
          if (delta <= hitThreshold) {
            // If segment exists, erase it; if outer wall and closed, bounce
            if (rings[rIdx][segIdx]) {
              eraseSegment(rIdx, segIdx);

              // If it's the outer ring and we want bouncing only when closed:
              if (rIdx === rings.length-1 && bounceOuterIfClosed) {
                // reflect velocity as if hitting a circle
                reflectOnCircle(dx, dy);
              }
            }
          }
        }

        // Check for escape: if the ball goes beyond outer radius at its angle AND outer seg there is erased
        const outerR = radii[radii.length-1];
        if (dist > outerR + ballRadius + 2) {
          // ensure there's no segment at this angle (gap exists)
          const outerSegExists = rings[rings.length-1][segIdx];
          if (!outerSegExists) {
            escaped = true;
            document.getElementById('status').classList.add('show');
          } else {
            // If the segment exists and we drifted due to large step, reflect back
            reflectOnCircle(dx, dy);
            // nudge inside
            const pull = (outerR - ballRadius - 2) / dist;
            ball.x = cx + dx * pull;
            ball.y = cy + dy * pull;
          }
        }

        // Soft keep-in-bounds (canvas edges)
        if (ball.x < ballRadius || ball.x > W - ballRadius) ball.vx *= -1;
        if (ball.y < ballRadius || ball.y > H - ballRadius) ball.vy *= -1;
      }

      draw();
      requestAnimationFrame(step);
    }

    function reflectOnCircle(dx, dy) {
      // Reflect velocity around normal from center to ball (for circular wall bounce)
      const nx = dx, ny = dy;
      const nlen = Math.hypot(nx, ny) || 1;
      const ux = nx/nlen, uy = ny/nlen; // unit normal
      const vdotn = ball.vx*ux + ball.vy*uy;
      ball.vx = ball.vx - 2*vdotn*ux;
      ball.vy = ball.vy - 2*vdotn*uy;
    }

    // UI
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('speed').addEventListener('input', (e) => {
      speedScale = parseFloat(e.target.value);
    });

    // Init
    reset();
    draw();
    requestAnimationFrame(step);
  })();

  