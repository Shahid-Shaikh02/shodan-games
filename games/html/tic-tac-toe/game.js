/**
 * Tic-Tac-Toe Logic & State Visualization
 * Features: Fully Responsive Scaling, Yellow Background, Bold Marks, Online Multiplayer, Score Tracking
 */

// --- 1. INJECT CUSTOM THEME & OVERLAY CSS ---
const customStyles = document.createElement('style');
customStyles.textContent = `
    :root {
        --primary: #1B1C1D; 
        --primary-hover: #333333;
        --secondary: #2E7D32; 
        --surface-container: #ffcb2e; 
        --surface: #ffffff;
        --on-surface-default: #1B1C1D;
        --on-surface-variant: #555555;
        --chart-1: #2E7D32; 
        --chart-2: #f0dbb1; 
        --chart-4: #E53935; 
        --outline: #1B1C1D;
    }

    .control-grid { display: grid !important; grid-template-columns: 1fr !important; gap: 20px !important; padding: 24px !important; }
    .xxs-row { display: grid !important; grid-template-columns: 1fr 120px !important; align-items: center !important; gap: 12px !important; width: 100% !important; }
    .xxs-row.full { grid-template-columns: 1fr !important; }
    .xxs-label { pointer-events: none !important; color: var(--primary) !important; font-weight: bold !important; font-size: 14px !important; mask-image: none !important; -webkit-mask-image: none !important; }
    .xxs-switch, .xxs-btn-group, .xxs-btn { pointer-events: auto !important; cursor: pointer !important; position: relative !important; z-index: 999 !important; }

    .xxs-btn-group { display: flex !important; width: 120px !important; margin-left: auto !important; border: 3px solid var(--primary) !important; border-radius: 8px !important; overflow: hidden !important; box-shadow: 4px 4px 0px var(--primary) !important; background: transparent !important; }
    .xxs-btn-group .xxs-btn { flex: 1 !important; border-radius: 0 !important; font-weight: 900 !important; font-size: 18px !important; height: 34px !important; border: none !important; transition: color 0.1s, box-shadow 0.1s !important; }
    .xxs-btn-group .xxs-btn:nth-child(1) { background-color: var(--chart-1) !important; color: #1B1C1D !important; border-right: 3px solid var(--primary) !important; }
    .xxs-btn-group .xxs-btn:nth-child(1).selected { color: #ffffff !important; box-shadow: none !important; }
    .xxs-btn-group .xxs-btn:nth-child(2) { background-color: var(--chart-4) !important; color: #1B1C1D !important; }
    .xxs-btn-group .xxs-btn:nth-child(2).selected { color: #ffffff !important; box-shadow: none !important; }

    .xxs-switch { background-color: #ffffff !important; border: 2px solid var(--primary) !important; box-shadow: 3px 3px 0px var(--primary) !important; margin-left: auto !important; }
    .xxs-switch .knob { background-color: var(--chart-4) !important; }
    .xxs-switch.active { background-color: #ffffff !important; }
    .xxs-switch.active .knob { background-color: var(--chart-1) !important; }

    .control-grid .xxs-row > .xxs-btn { background-color: #ffffff !important; color: #1B1C1D !important; border: 2px solid #1B1C1D !important; box-shadow: 3px 3px 0px #1B1C1D !important; font-weight: 900 !important; font-size: 16px !important; height: 42px !important; transition: opacity 0.2s ease, background-color 0.2s ease !important; }
    .control-grid .xxs-row > .xxs-btn:hover { background-color: #e8e8e8 !important; opacity: 0.7 !important; }
    .control-grid .xxs-row > .xxs-btn:active { box-shadow: inset 0px 4px 8px rgba(0,0,0,0.2) !important; transform: translateY(2px) !important; }

    #game-ui-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 50; overflow: hidden; font-family: var(--ff-sans); color: var(--on-surface-default); }
    .hud-element { pointer-events: auto; position: absolute; }

    #main-menu, #mode-menu { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background: radial-gradient(circle, #ffde75 0%, #ffcb2e 100%); backdrop-filter: blur(10px); transition: opacity 0.3s; position: absolute; top: 0; left: 0; }
    #mode-menu { display: none; z-index: 55; opacity: 0; }
    
    .mode-options { display: flex; flex-direction: column; gap: 12px; width: 100%; }
    .bot-difficulties { display: none; gap: 8px; margin-top: 4px; animation: fadeIn 0.2s ease-out; }
    .bot-difficulties.open { display: flex; }
    .btn-diff { flex: 1; background: transparent; color: var(--primary); border: 2px solid var(--primary); padding: 8px 0; border-radius: var(--radius-s); font-weight: 900; font-size: 14px; cursor: pointer; transition: background 0.2s, color 0.2s, transform 0.1s; }
    .btn-diff:hover { background: var(--primary); color: white; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

    .menu-card { background: rgba(255, 255, 255, 0.95); border: 3px solid var(--outline); padding: 40px; border-radius: var(--radius-l); text-align: center; width: 90%; max-width: 450px; box-shadow: 8px 8px 0px rgba(27, 28, 29, 0.9); }
    .menu-title { font-family: var(--ff-mono); font-size: clamp(20px, 5vw, 28px); color: var(--primary); margin-bottom: 24px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; }
    .menu-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .btn-play, .btn-credits { flex: 1; min-width: 120px; justify-content: center; }
    .btn-play { background: var(--primary); color: white; padding: 12px 24px; border: none; border-radius: var(--radius-s); font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px;}
    .btn-play:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); transition: 0.2s; }
    .btn-credits { background: transparent; color: var(--primary); padding: 12px 24px; border: 2px solid var(--outline); border-radius: var(--radius-s); cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; }
    .btn-credits:hover { background: rgba(0,0,0,0.05); }

    #game-hud { display: none; width: 100%; height: 100%; }
    .top-center-nav { top: 15px; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; white-space: nowrap; }
    .nav-btn { background: rgba(255, 255, 255, 0.9); border: 2px solid var(--outline); color: var(--primary); padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: bold; display: flex; align-items: center; gap: 6px; box-shadow: 2px 2px 0px var(--primary); }
    .nav-btn:hover { background: white; transform: translateY(-1px); box-shadow: 3px 3px 0px var(--primary); }

    .status-panel { top: 15px; right: 20px; text-align: right; font-family: var(--ff-mono); font-size: 14px; line-height: 1.8; background: rgba(255, 255, 255, 0.9); padding: 8px 12px; border-radius: 8px; border: 2px solid var(--outline); color: var(--primary); box-shadow: 4px 4px 0px var(--primary); font-weight: bold;}

    @media (max-width: 600px) {
        .status-panel { top: 65px; left: 50%; transform: translateX(-50%); right: auto; text-align: center; width: auto; display: flex; gap: 16px; padding: 4px 16px; align-items: center; white-space: nowrap;}
        .status-panel div { margin: 0 !important; }
    }

    #intro-popup { display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle, #ffde75 0%, #ffcb2e 100%); flex-direction: column; align-items: center; justify-content: center; z-index: 60; }
    #intro-popup h2 { margin: 0 0 10px 0; font-size: clamp(24px, 6vw, 32px); color: var(--primary); letter-spacing: 4px; text-transform: uppercase; font-weight: 900;}
    #intro-popup .handle { color: var(--on-surface-variant); font-family: var(--ff-mono); margin-bottom: 30px; font-size: 18px; font-weight: bold;}
    .loading-bar { width: 80%; max-width: 300px; height: 6px; background: rgba(0,0,0,0.1); border-radius: 3px; overflow: hidden; border: 1px solid var(--primary); }
    .loading-fill { width: 0%; height: 100%; background: var(--primary); }

    #credits-popup { display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); align-items: center; justify-content: center; z-index: 150; }
    .credits-card { background: #1B1C1D; border: 2px solid var(--outline); padding: 40px; border-radius: var(--radius-l); text-align: center; color: #ffffff; box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.5); display: flex; flex-direction: column; align-items: center; width: 90%; max-width: 340px; }
    .credit-title { font-size: 24px; font-weight: 900; margin-bottom: 8px; letter-spacing: 1px; }
    .credit-subtitle { font-size: 14px; color: #aaaaaa; margin-bottom: 8px; }
    .credit-handle { font-size: 18px; color: #A8C7FA; font-family: var(--ff-mono); margin-bottom: 24px; font-weight: bold; }
    .credit-links { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; width: 100%; }
    .credit-btn { background: #3a3f50; color: white; border: none; padding: 12px 20px; border-radius: var(--radius-s); font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; font-size: 14px; transition: background 0.2s, transform 0.1s; }
    .credit-btn:hover { background: #4a5060; transform: translateY(-2px); }
    .credit-close { background: transparent; color: white; border: 2px solid #555555; padding: 10px 40px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
    .credit-close:hover { background: rgba(255,255,255,0.1); }
`;
document.head.appendChild(customStyles);

// --- 2. SETUP APP & STATE ---
const { state, ui } = WH.createApp({
    title: "Tic-Tac-Toe Debugger",
    params: {
        sfx: { type: 'boolean', label: 'Sound Effects (SFX)', value: true },
        startingPlayer: { type: 'segmented', label: 'Who Starts?', options: ['X', 'O'], value: 'X' }
    }
});

document.querySelector('.widget-header').style.display = 'none';
const controlsGrid = document.querySelector('.control-grid');
controlsGrid.style.cssText = `
    position: absolute; top: 65px; left: 50%; transform: translateX(-50%);
    width: 90%; max-width: 340px; background: var(--chart-2); border: 2px solid var(--outline);
    border-radius: var(--radius-m); display: none !important; z-index: 100;
    box-shadow: 6px 6px 0px rgba(27,28,29,0.9); pointer-events: auto; color: var(--primary);
`;

state.boardState = ['', '', '', '', '', '', '', '', ''];
state.cols = 3;
state.rows = 3;
state.isXTurn = true;
state.movesCount = 0;
state.winner = null;
state.winningLine = null;
state.scoreX = 0;
state.scoreO = 0;
state.myScore = 0;
state.opponentScore = 0;
state.gameOverTriggered = false;
state.animScale = {};          
state.shakeOffset = { x: 0, y: 0 }; 
state.myRestartVote = false;
state.opponentRestartVote = false;

function resetGame(s) {
    s.boardState = ['', '', '', '', '', '', '', '', ''];
    s.cols = 3;
    s.rows = 3;
    
    // X ALWAYS goes first. 
    if (s.gameMode !== 'online') {
        s.isXTurn = s.startingPlayer === 'X';
    } else {
        s.isXTurn = true; 
    }
    
    s.movesCount = 0;
    s.winner = null;
    s.winningLine = null;
    s.gameOverTriggered = false;
    s.animScale = {};          
    s.shakeOffset = { x: 0, y: 0 }; 
    s.myRestartVote = false;
    s.opponentRestartVote = false;
}

// Animation Helpers
function animateMove(index) {
    state.animScale[index] = 0;
    anime({ targets: state.animScale, [index]: 1, duration: 600, easing: 'easeOutElastic(1, .5)' });
}

function triggerShake() {
    state.shakeOffset = { x: 0, y: 0 };
    anime({ targets: state.shakeOffset, x: [15, -15, 10, -10, 5, -5, 0], y: [5, -5, 5, -5, 2, -2, 0], duration: 500, easing: 'easeInOutQuad' });
}

function showTemporaryAlert(msg) {
    const alertBox = document.getElementById('custom-alert-popup');
    document.getElementById('custom-alert-title').textContent = "Match Starting";
    document.getElementById('custom-alert-msg').textContent = msg;
    document.getElementById('btn-custom-alert-ok').style.display = 'none';
    alertBox.style.display = 'flex';
    setTimeout(() => { alertBox.style.display = 'none'; }, 2500); 
}

function triggerGameOver(winner) {
    if (state.gameOverTriggered) return;
    state.gameOverTriggered = true;

    setTimeout(() => {
        const title = document.getElementById('confirm-title');
        const msg = document.getElementById('confirm-msg');
        title.textContent = "Game Over!";
        msg.textContent = winner === 'Draw' ? "It's a draw. Play again?" : winner + " won! Play again?";
        
        document.getElementById('btn-confirm-yes').onclick = () => {
            document.getElementById('confirm-popup').style.display = 'none';
            if (state.gameMode === 'online' && peerConn) {
                state.myRestartVote = true;
                peerConn.send({ type: 'RESTART_VOTE' });
                
                if (state.opponentRestartVote) {
                    executeRematch();
                } else {
                    document.getElementById('custom-alert-title').textContent = "Waiting";
                    document.getElementById('custom-alert-msg').textContent = "Waiting for opponent to accept...";
                    document.getElementById('btn-custom-alert-ok').style.display = 'none';
                    document.getElementById('custom-alert-popup').style.display = 'flex';
                }
            } else {
                resetGame(state);
            }
        };
        document.getElementById('btn-confirm-no').onclick = () => {
            document.getElementById('confirm-popup').style.display = 'none';
            if (state.gameMode === 'online' && peerConn) peerConn.send({ type: 'RESTART_DECLINE' });
            document.getElementById('btn-home').click();
        };
        document.getElementById('confirm-popup').style.display = 'flex';
    }, 1000); 
}

function checkWinner(board, cols=3, rows=3) {
    for(let r=0; r<rows; r++) { for(let c=0; c<=cols-3; c++) { const i = r*cols+c; if(board[i] && board[i]==board[i+1] && board[i]==board[i+2]) return {winner: board[i], line: [i, i+1, i+2]}; } }
    for(let c=0; c<cols; c++) { for(let r=0; r<=rows-3; r++) { const i = r*cols+c; if(board[i] && board[i]==board[i+cols] && board[i]==board[i+2*cols]) return {winner: board[i], line: [i, i+cols, i+2*cols]}; } }
    for(let r=0; r<=rows-3; r++) { for(let c=0; c<=cols-3; c++) { const i = r*cols+c; if(board[i] && board[i]==board[i+cols+1] && board[i]==board[i+2*cols+2]) return {winner: board[i], line: [i, i+cols+1, i+2*cols+2]}; } }
    for(let r=0; r<=rows-3; r++) { for(let c=2; c<cols; c++) { const i = r*cols+c; if(board[i] && board[i]==board[i+cols-1] && board[i]==board[i+2*cols-2]) return {winner: board[i], line: [i, i+cols-1, i+2*cols-2]}; } }
    return null;
}

// --- BOT AI ENGINE ---
function getBotMove(board, diff, botMark, humanMark, cols=3, rows=3, mode='bot') {
    const emptySpots = board.map((m, i) => m === '' ? i : null).filter(i => i !== null);
    if (emptySpots.length === 0) return { action: 'none' };

    function minimax(newBoard, player, depth = 0) {
        if (depth > 5) return { score: 0 };
        const avail = newBoard.map((m, i) => m === '' ? i : null).filter(i => i !== null);
        const win = checkWinner(newBoard, cols, rows);
        if (win && win.winner === humanMark) return { score: -10 };
        if (win && win.winner === botMark) return { score: 10 };
        if (avail.length === 0) return { score: 0 };

        const moves = [];
        for (let i = 0; i < avail.length; i++) {
            const move = { index: avail[i] };
            newBoard[avail[i]] = player;
            const result = minimax(newBoard, player === botMark ? humanMark : botMark, depth + 1);
            move.score = result.score;
            newBoard[avail[i]] = '';
            moves.push(move);
        }

        let bestMove = 0, bestScore = player === botMark ? -10000 : 10000;
        for (let i = 0; i < moves.length; i++) {
            if (player === botMark) { if (moves[i].score > bestScore) { bestScore = moves[i].score; bestMove = i; } } 
            else { if (moves[i].score < bestScore) { bestScore = moves[i].score; bestMove = i; } }
        }
        return moves[bestMove];
    }

    if (diff === 'easy') return { action: 'move', index: emptySpots[Math.floor(Math.random() * emptySpots.length)] };

    let botWinningMove = -1, humanWinningMoves = [];
    const tempBoard = [...board];
    for (let i=0; i<emptySpots.length; i++) {
        tempBoard[emptySpots[i]] = botMark; if (checkWinner(tempBoard, cols, rows)) botWinningMove = emptySpots[i];
        tempBoard[emptySpots[i]] = humanMark; if (checkWinner(tempBoard, cols, rows)) humanWinningMoves.push(emptySpots[i]);
        tempBoard[emptySpots[i]] = ''; 
    }

    if (mode === 'fun') {
        if (diff === 'medium') {
            if (botWinningMove !== -1) return { action: 'move', index: botWinningMove };
            if (humanWinningMoves.length > 1 || emptySpots.length <= 1) return { action: 'cheat_expand' };
            if (humanWinningMoves.length === 1) return { action: 'move', index: humanWinningMoves[0] };
            return { action: 'move', index: emptySpots[Math.floor(Math.random() * emptySpots.length)] };
        }
        if (diff === 'hard') {
            if (botWinningMove !== -1) return { action: 'move', index: botWinningMove };
            if (humanWinningMoves.length > 1) return { action: 'cheat_expand' };
            if (humanWinningMoves.length === 1) return { action: 'move', index: humanWinningMoves[0] };
            const best = minimax([...board], botMark);
            if (best.score <= 0 && emptySpots.length <= 3) return { action: 'cheat_expand' };
            return { action: 'move', index: best.index };
        }
    }

    if (mode === 'bot' && diff === 'medium') {
        if (Math.random() > 0.5) return { action: 'move', index: emptySpots[Math.floor(Math.random() * emptySpots.length)] };
    }
    return { action: 'move', index: minimax([...board], botMark).index };
}

// --- 2.5 CUSTOM AUDIO SYNTHESIZER ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (!state.sfx || audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    if (type === 'x') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'o') { 
        osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
        gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'win') { 
        osc.type = 'square'; osc.frequency.setValueAtTime(400, now); osc.frequency.setValueAtTime(600, now + 0.1); osc.frequency.setValueAtTime(800, now + 0.2);
        gain.gain.setValueAtTime(0.15, now); gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
    } else if (type === 'win-alt') { 
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(600, now); osc.frequency.setValueAtTime(450, now + 0.1); osc.frequency.setValueAtTime(900, now + 0.25);
        gain.gain.setValueAtTime(0.15, now); gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
    } else if (type === 'draw') { 
        osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(150, now + 0.4);
        gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
    } else if (type === 'click') { 
        osc.type = 'triangle'; osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
    }
}

// --- 3. LAYOUT INJECTION ---
ui.splitViz('60%');

const uiLayer = document.createElement('div');
uiLayer.id = 'game-ui-layer';
uiLayer.innerHTML = `
    <div id="main-menu" class="hud-element">
        <div class="menu-card">
            <div class="menu-title">Tic-Tac-Toe</div>
            <div class="menu-buttons">
                <button class="btn-play" id="btn-play">
                    <span class="google-symbols">play_arrow</span> PLAY
                </button>
                <button class="btn-credits" id="btn-credits">
                    <span class="google-symbols">info</span> CREDITS
                </button>
            </div>
        </div>
    </div>

    <div id="mode-menu" class="hud-element">
        <div class="menu-card">
            <div class="menu-title">Select Mode</div>
            <div class="mode-options">
                <button class="btn-play" id="btn-pass-play" style="width: 100%; justify-content: center;">
                    <span class="google-symbols">group</span> Pass N Play
                </button>
                <button class="btn-play" id="btn-online-mode" style="width: 100%; justify-content: center; background: #0B57D0;">
                    <span class="google-symbols">public</span> Online 1v1
                </button>
                <button class="btn-credits" id="btn-bot-mode" style="width: 100%; justify-content: center;">
                    <span class="google-symbols">smart_toy</span> Play vs Bot
                </button>
                <div class="bot-difficulties" id="bot-diff-container">
                    <button class="btn-diff" id="btn-bot-easy">EASY</button>
                    <button class="btn-diff" id="btn-bot-medium">MED</button>
                    <button class="btn-diff" id="btn-bot-hard">HARD</button>
                </div>
                <button class="btn-credits" id="btn-fun-mode" style="width: 100%; justify-content: center; border-color: var(--chart-3); color: var(--chart-3);">
                    <span class="google-symbols">attractions</span> Play vs Fun
                </button>
                <div class="bot-difficulties" id="fun-diff-container">
                    <button class="btn-diff" id="btn-fun-easy" style="border-color: var(--chart-3); color: var(--chart-3);">EASY</button>
                    <button class="btn-diff" id="btn-fun-medium" style="border-color: var(--chart-3); color: var(--chart-3);">MED</button>
                    <button class="btn-diff" id="btn-fun-hard" style="border-color: var(--chart-3); color: var(--chart-3);">HARD</button>
                </div>
            </div>
            <button class="credit-close" id="btn-mode-back" style="margin-top: 24px; color: var(--primary); border-color: var(--outline);">Back</button>
        </div>
    </div>

    <div id="game-hud">
        <div class="hud-element top-center-nav">
            <button class="nav-btn" id="btn-home"><span class="google-symbols">home</span> Home</button>
            <button class="nav-btn" id="btn-restart"><span class="google-symbols">refresh</span> Restart</button>
            <button class="nav-btn" id="btn-settings"><span class="google-symbols">settings</span> Settings</button>
        </div>

        <div class="hud-element status-panel">
            <div style="font-size: 16px; margin-bottom: 4px; border-bottom: 1px solid var(--outline); padding-bottom: 4px;">
                <span id="score-label-1">Player X</span> <span style="color: var(--chart-1)" id="stat-score-x">0</span> - 
                <span style="color: var(--chart-4)" id="stat-score-o">0</span> <span id="score-label-2">Player O</span>
            </div>
            <div>Turn: <span id="stat-turn" style="color: var(--chart-1)">X</span></div>
            <div>Moves: <span id="stat-moves">0</span></div>
            <div id="stat-winner"></div>
        </div>
    </div>

    <!-- Custom Alert Pop-up -->
    <div id="custom-alert-popup" class="hud-element" style="display: none; position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); align-items:center; justify-content: center; z-index: 170;">
        <div class="menu-card" style="max-width: 360px; padding: 30px;">
            <div class="menu-title" id="custom-alert-title" style="font-size: 20px; margin-bottom: 20px;">Alert</div>
            <div id="custom-alert-msg" style="margin-bottom: 20px; font-weight: bold; color: var(--primary);"></div>
            <button class="btn-play" id="btn-custom-alert-ok" style="width: 100%; justify-content: center;">OK</button>
        </div>
    </div>

    <!-- Confirm / Request Pop-up -->
    <div id="confirm-popup" class="hud-element" style="display: none; position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); align-items:center; justify-content: center; z-index: 170;">
        <div class="menu-card" style="max-width: 360px; padding: 30px;">
            <div class="menu-title" id="confirm-title" style="font-size: 20px; margin-bottom: 20px;">Restart?</div>
            <div id="confirm-msg" style="margin-bottom: 20px; font-weight: bold; color: var(--primary);"></div>
            <div style="display: flex; gap: 12px; width: 100%;">
                <button class="btn-play" id="btn-confirm-yes" style="flex: 1; justify-content: center; background: var(--chart-1);">Yes</button>
                <button class="btn-play" id="btn-confirm-no" style="flex: 1; justify-content: center; background: var(--chart-4);">No</button>
            </div>
        </div>
    </div>

    <div id="intro-popup">
        <h2>Tic-Tac-Toe</h2>
        <span class="handle">shodan games</span>
        <div class="loading-bar"><div class="loading-fill" id="intro-fill"></div></div>
    </div>

    <div id="credits-popup" class="hud-element">
        <div class="credits-card">
            <div class="credit-title">Tic-Tac-Toe</div>
            <div class="credit-subtitle">Created & Developed by</div>
            <div class="credit-handle">@shodan_dev</div>
            <div class="credit-links">
                <a href="https://www.youtube.com/@shodangp" target="_blank" class="credit-btn">
                    <span class="google-symbols" style="color: #ff5555;">play_arrow</span> YouTube (@shodangp)
                </a>
                <a href="https://www.youtube.com/@shodan_dev" target="_blank" class="credit-btn">
                    <span class="google-symbols" style="color: #ff5555;">play_arrow</span> YouTube (@shodan_dev)
                </a>
                <a href="https://github.com/Shahid-Shaikh02" target="_blank" class="credit-btn">
                    <span class="google-symbols">code</span> GitHub
                </a>
            </div>
            <button class="credit-close" id="btn-credits-close">Close</button>
        </div>
    </div>

    <!-- Online Room Pop-up -->
    <div id="online-popup" class="hud-element" style="display: none; position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); align-items:center; justify-content: center; z-index: 160;">
        <div class="menu-card" style="max-width: 360px; padding: 30px;">
            <div class="menu-title" style="font-size: 20px; margin-bottom: 20px;">Online Lobby</div>
            <div id="online-initial-controls" style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
                <button class="btn-play" id="btn-create-room" style="justify-content: center; width: 100%;">Create Room</button>
                <div style="display: flex; gap: 8px; align-items: stretch; width: 100%;">
                    <input type="text" id="room-code-input" placeholder="ROOM CODE" style="flex: 1; min-width: 0; padding: 10px 12px; border-radius: 8px; border: 2px solid var(--outline); font-weight: bold; text-transform: uppercase; font-size: 14px; outline: none;">
                    <button class="btn-credits" id="btn-join-room" style="flex: 0 0 auto; min-width: 80px; padding: 10px; margin: 0;">Join</button>
                </div>
            </div>
            <div id="online-status-msg" style="margin-top: 20px; font-weight: bold; color: var(--primary); min-height: 24px;"></div>
            <button class="credit-close" id="btn-online-close" style="margin-top: 20px; color: var(--primary); border-color: var(--outline);">Cancel</button>
        </div>
    </div>
`;
document.querySelector('.viz-container').appendChild(uiLayer);

// UI References
const elMenu = document.getElementById('main-menu');
const elModeMenu = document.getElementById('mode-menu');
const elHud = document.getElementById('game-hud');
const elIntro = document.getElementById('intro-popup');
const fillIntro = document.getElementById('intro-fill');
const statTurn = document.getElementById('stat-turn');
const statMoves = document.getElementById('stat-moves');
const statWinner = document.getElementById('stat-winner');

// --- 4. UI EVENTS & FLOW ---
let peer = null, peerConn = null, myMark = 'X', isLeaving = false, isHost = false;
const ROOM_PREFIX = 'shodan-game-';

document.getElementById('btn-online-mode').onclick = () => {
    playSound('click'); document.getElementById('online-popup').style.display = 'flex';
    document.getElementById('online-status-msg').textContent = 'Choose an option.';
};

document.getElementById('btn-online-close').onclick = () => {
    playSound('click'); document.getElementById('online-popup').style.display = 'none';
    if (peer) { peer.destroy(); peer = null; } 
};

// Host: Create Room
document.getElementById('btn-create-room').onclick = () => {
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    isHost = true;
    
    document.getElementById('online-status-msg').innerHTML = 
        '<div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px;">' +
            '<span style="font-size: 16px;">Room Code:</span>' +
            '<span style="font-size: 24px; color: var(--chart-1); letter-spacing: 2px;">' + roomCode + '</span>' +
            '<button id="btn-copy-link" style="background: transparent; border: 2px solid var(--outline); border-radius: 6px; padding: 4px; cursor: pointer; display: flex; transition: 0.2s;" title="Copy Invite Link">' +
                '<span class="google-symbols" style="font-size: 20px; color: var(--primary);">content_copy</span>' +
            '</button>' +
        '</div>' +
        '<span style="font-size: 14px; font-weight: normal;">Waiting for opponent...</span>';

    document.getElementById('btn-copy-link').onclick = () => {
        const inviteUrl = window.location.origin + window.location.pathname + '?room=' + roomCode;
        navigator.clipboard.writeText(inviteUrl).then(() => {
            const btn = document.getElementById('btn-copy-link');
            btn.innerHTML = '<span class="google-symbols" style="font-size: 20px; color: var(--chart-1);">check</span>';
            setTimeout(() => { btn.innerHTML = '<span class="google-symbols" style="font-size: 20px; color: var(--primary);">content_copy</span>'; }, 2000);
        });
    };

    if (peer) peer.destroy(); 
    peer = new Peer(ROOM_PREFIX + roomCode, {
        config: { 'iceServers': [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] }
    });

    peer.on('connection', (conn) => {
        peerConn = conn;
        peerConn.on('open', () => {
            const cryptoArray = new Uint8Array(1);
            window.crypto.getRandomValues(cryptoArray);
            const amIX = cryptoArray[0] % 2 === 0;
            
            myMark = amIX ? 'X' : 'O';
            
            peerConn.send({ type: 'INIT', mark: amIX ? 'O' : 'X' });

            setupConnection();
            document.getElementById('online-popup').style.display = 'none';
            startGame('online', null);
            showTemporaryAlert('Coin Toss: You are ' + myMark + ' (' + (myMark === 'X' ? 'Green' : 'Red') + '). X goes first!');
        });
    });
};

document.getElementById('btn-join-room').onclick = () => {
    const code = document.getElementById('room-code-input').value.trim().toUpperCase();
    if (!code) return;
    isHost = false; 
    document.getElementById('online-status-msg').textContent = 'Connecting to room...';
    
    if (peer) peer.destroy();
    peer = new Peer({
        config: { 'iceServers': [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] }
    }); 
    
    peer.on('open', () => {
        peerConn = peer.connect(ROOM_PREFIX + code);
        peerConn.on('open', () => {
            setupConnection();
            document.getElementById('online-status-msg').textContent = 'Waiting for host to assign roles...';
        });
    });
    peer.on('error', (err) => {
        if (err.type === 'peer-unavailable') document.getElementById('online-status-msg').textContent = 'Room not found! Check code.';
        else document.getElementById('online-status-msg').textContent = 'Connection error.';
    });
};

function executeRematch() {
    document.getElementById('custom-alert-popup').style.display = 'none';
    state.myRestartVote = false;
    state.opponentRestartVote = false;
    
    if (isHost) {
        const cryptoArray = new Uint8Array(1);
        window.crypto.getRandomValues(cryptoArray);
        const amIX = cryptoArray[0] % 2 === 0;
        
        myMark = amIX ? 'X' : 'O';
        peerConn.send({ type: 'RESTART_SYNC', mark: amIX ? 'O' : 'X' });
        resetGame(state);
        showTemporaryAlert('Coin Toss: You are ' + myMark + ' (' + (myMark === 'X' ? 'Green' : 'Red') + '). X goes first!');
    }
}

function setupConnection() {
    peerConn.on('data', (data) => {
        if (data.type === 'INIT') {
            myMark = data.mark;
            document.getElementById('online-popup').style.display = 'none';
            startGame('online', null);
            showTemporaryAlert('Coin Toss: You are ' + myMark + ' (' + (myMark === 'X' ? 'Green' : 'Red') + '). X goes first!');
        } else if (data.type === 'MOVE') {
            const newBoard = [...state.boardState]; newBoard[data.index] = data.mark;
            state.boardState = newBoard; state.movesCount++;
            playSound(data.mark === 'X' ? 'x' : 'o');
            animateMove(data.index);

            const winCheck = checkWinner(newBoard, state.cols, state.rows);
            if (winCheck) {
                state.winner = winCheck.winner; state.winningLine = winCheck.line;
                if (state.winner === myMark) state.myScore++; else if (state.winner !== 'Draw') state.opponentScore++;
                playSound(state.winner === state.startingPlayer ? 'win' : 'win-alt'); triggerGameOver(state.winner);
            } else if (state.movesCount >= state.boardState.length) {
                state.winner = 'Draw'; playSound('draw'); triggerGameOver('Draw');
            } else { state.isXTurn = !state.isXTurn; }
        } else if (data.type === 'RESTART_VOTE') {
            state.opponentRestartVote = true;
            if (state.myRestartVote) {
                executeRematch();
            } else {
                const title = document.getElementById('confirm-title'), msg = document.getElementById('confirm-msg');
                title.textContent = "Restart?"; msg.textContent = "Opponent wants to restart. Accept?";
                document.getElementById('btn-confirm-yes').onclick = () => {
                    document.getElementById('confirm-popup').style.display = 'none';
                    state.myRestartVote = true;
                    peerConn.send({ type: 'RESTART_VOTE' });
                    executeRematch();
                };
                document.getElementById('btn-confirm-no').onclick = () => {
                    document.getElementById('confirm-popup').style.display = 'none';
                    peerConn.send({ type: 'RESTART_DECLINE' });
                };
                document.getElementById('confirm-popup').style.display = 'flex';
            }
        } else if (data.type === 'RESTART_SYNC') {
            playSound('click'); 
            myMark = data.mark;
            resetGame(state);
            showTemporaryAlert('Coin Toss: You are ' + myMark + ' (' + (myMark === 'X' ? 'Green' : 'Red') + '). X goes first!');
        } else if (data.type === 'RESTART_DECLINE') {
            document.getElementById('btn-custom-alert-ok').style.display = 'flex';
            document.getElementById('custom-alert-title').textContent = "Declined";
            document.getElementById('custom-alert-msg').textContent = "Opponent declined the restart.";
            document.getElementById('btn-custom-alert-ok').onclick = () => document.getElementById('custom-alert-popup').style.display = 'none';
        }
    });

    peerConn.on('close', () => {
        if (isLeaving) return; // Prevent the false alert if WE clicked Home
        document.getElementById('custom-alert-title').textContent = "Disconnected";
        document.getElementById('custom-alert-msg').textContent = "Your opponent left the match.";
        document.getElementById('btn-custom-alert-ok').style.display = 'flex';
        document.getElementById('btn-custom-alert-ok').onclick = () => {
            document.getElementById('custom-alert-popup').style.display = 'none'; 
            isLeaving = true; 
            document.getElementById('btn-home').click(); 
        };
        document.getElementById('custom-alert-popup').style.display = 'flex';
    });
}

let gameState = 'menu', introTimer = 0; const INTRO_DURATION = 1.5; let settingsOpen = false;

document.getElementById('btn-play').onclick = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playSound('click'); elModeMenu.style.display = 'flex';
    document.getElementById('bot-diff-container').classList.remove('open');
    setTimeout(() => { elMenu.style.opacity = '0'; elModeMenu.style.opacity = '1'; }, 10);
    setTimeout(() => { elMenu.style.display = 'none'; }, 300);
};

document.getElementById('btn-mode-back').onclick = () => {
    playSound('click'); elMenu.style.display = 'flex';
    setTimeout(() => { elModeMenu.style.opacity = '0'; elModeMenu.style.opacity = '1'; }, 10);
    setTimeout(() => { elModeMenu.style.display = 'none'; }, 300);
};

// Start Game Execution Logic
const startGame = (mode, diff) => {
    playSound('click'); state.gameMode = mode; state.botDifficulty = diff;
    isLeaving = false; // Reset leave flag for new games
    elModeMenu.style.opacity = '0';
    setTimeout(() => { elModeMenu.style.display = 'none'; }, 300);
    gameState = 'intro'; introTimer = INTRO_DURATION;
    elIntro.style.display = 'flex'; resetGame(state);
};

document.getElementById('btn-pass-play').onclick = () => startGame('pass', null);

document.getElementById('btn-bot-mode').onclick = () => { playSound('click'); document.getElementById('fun-diff-container').classList.remove('open'); document.getElementById('bot-diff-container').classList.toggle('open'); };
document.getElementById('btn-bot-easy').onclick = () => startGame('bot', 'easy');
document.getElementById('btn-bot-medium').onclick = () => startGame('bot', 'medium');
document.getElementById('btn-bot-hard').onclick = () => startGame('bot', 'hard');

document.getElementById('btn-fun-mode').onclick = () => { playSound('click'); document.getElementById('bot-diff-container').classList.remove('open'); document.getElementById('fun-diff-container').classList.toggle('open'); };
document.getElementById('btn-fun-easy').onclick = () => startGame('fun', 'easy');
document.getElementById('btn-fun-medium').onclick = () => startGame('fun', 'medium');
document.getElementById('btn-fun-hard').onclick = () => startGame('fun', 'hard');

document.getElementById('btn-restart').onclick = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playSound('click');
    
    if (state.gameMode === 'online') {
        state.myRestartVote = true;
        if (peerConn) peerConn.send({ type: 'RESTART_VOTE' });
        
        if (state.opponentRestartVote) {
            executeRematch();
        } else {
            document.getElementById('custom-alert-title').textContent = "Waiting";
            document.getElementById('custom-alert-msg').textContent = "Waiting for opponent to accept...";
            document.getElementById('btn-custom-alert-ok').style.display = 'none';
            document.getElementById('custom-alert-popup').style.display = 'flex';
        }
    } else {
        const title = document.getElementById('confirm-title'), msg = document.getElementById('confirm-msg');
        title.textContent = "Restart?"; msg.textContent = "Are you sure you want to restart the match?";
        document.getElementById('btn-confirm-yes').onclick = () => { document.getElementById('confirm-popup').style.display = 'none'; resetGame(state); };
        document.getElementById('btn-confirm-no').onclick = () => { document.getElementById('confirm-popup').style.display = 'none'; };
        document.getElementById('confirm-popup').style.display = 'flex';
    }
};

document.getElementById('btn-home').onclick = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playSound('click');
    
    // Show "You left" message if leaving an active online match
    if (state.gameMode === 'online' && peerConn && !isLeaving) {
        isLeaving = true; // Tell the network listener to ignore the disconnect
        document.getElementById('custom-alert-title').textContent = "Left Match";
        document.getElementById('custom-alert-msg').textContent = "You have safely left the match.";
        document.getElementById('btn-custom-alert-ok').style.display = 'flex';
        document.getElementById('btn-custom-alert-ok').onclick = () => {
            document.getElementById('custom-alert-popup').style.display = 'none';
        };
        document.getElementById('custom-alert-popup').style.display = 'flex';
    }

    if (peer) { peer.destroy(); peer = null; } peerConn = null;
    state.scoreX = 0; state.scoreO = 0; state.myScore = 0; state.opponentScore = 0;
    gameState = 'menu'; elHud.style.display = 'none'; elModeMenu.style.display = 'none';
    controlsGrid.style.setProperty('display', 'none', 'important'); settingsOpen = false;
    elMenu.style.display = 'flex'; setTimeout(() => { elMenu.style.opacity = '1'; }, 10);
};

document.getElementById('btn-settings').onclick = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playSound('click'); settingsOpen = !settingsOpen;
    controlsGrid.style.setProperty('display', settingsOpen ? 'grid' : 'none', 'important');
};

window.addEventListener('pointerdown', (e) => {
    if (!settingsOpen) return;
    const settingsBtn = document.getElementById('btn-settings'), controls = document.querySelector('.control-grid');
    if (controls && settingsBtn && !controls.contains(e.target) && !settingsBtn.contains(e.target)) {
        settingsOpen = false; controls.style.setProperty('display', 'none', 'important');
    }
});

document.getElementById('btn-credits').onclick = () => { document.getElementById('credits-popup').style.display = 'flex'; };
document.getElementById('btn-credits-close').onclick = () => { document.getElementById('credits-popup').style.display = 'none'; };

state._subscribe((key, val) => { if (key === 'startingPlayer' && gameState === 'menu') { state.isXTurn = val === 'X'; } });

// --- 5. GAME INTERACTION & CANVAS (Top) ---
WH.initCanvas('vizTop', (ctx) => {
    return ({ width, height, pointer, dt }) => {
        ctx.fillStyle = WH.getColor('--surface-container'); ctx.fillRect(0, 0, width, height);

        if (gameState === 'intro') {
            introTimer -= dt; fillIntro.style.width = (1 - (introTimer / INTRO_DURATION)) * 100 + '%';
            if (introTimer <= 0) { gameState = 'playing'; elIntro.style.display = 'none'; elHud.style.display = 'block'; updateCodeState(); }
            return;
        }
        if (gameState !== 'playing') return;

        const safeMarginTop = window.innerWidth <= 600 ? 100 : 60, safeHeight = height - safeMarginTop;
        const cols = state.cols || 3, rows = state.rows || 3, minDim = Math.min(width * 0.9, safeHeight * 0.9);
        const cellSize = minDim / Math.max(cols, rows), gridX = (width / 2) - (cellSize * cols / 2), gridY = safeMarginTop + (safeHeight / 2) - (cellSize * rows / 2);

        // Apply Global Board Shake
        ctx.save();
        ctx.translate(state.shakeOffset?.x || 0, state.shakeOffset?.y || 0);

        ctx.strokeStyle = WH.getColor('--outline'); ctx.lineWidth = Math.max(4, cellSize * 0.05); ctx.lineCap = 'round'; ctx.beginPath();
        for (let i = 1; i < cols; i++) { ctx.moveTo(gridX + i * cellSize, gridY); ctx.lineTo(gridX + i * cellSize, gridY + rows * cellSize); }
        for (let i = 1; i < rows; i++) { ctx.moveTo(gridX, gridY + i * cellSize); ctx.lineTo(gridX + cols * cellSize, gridY + i * cellSize); }
        ctx.stroke();

        const currentMark = state.isXTurn ? 'X' : 'O';
        const isBotTurn = (state.gameMode === 'bot' || state.gameMode === 'fun') && currentMark === 'O';

        // --- BOT EXECUTION ---
        if (isBotTurn && !state.winner && !settingsOpen && gameState === 'playing') {
            if (!state.botTimer) state.botTimer = 0.5;
            state.botTimer -= dt;
            if (state.botTimer <= 0) {
                const move = getBotMove(state.boardState, state.botDifficulty, 'O', 'X', cols, rows, state.gameMode);
                if (move.action === 'cheat_expand') {
                    const newCols = cols + 1, newBoard = [];
                    for (let r=0; r<rows; r++) { for (let c=0; c<cols; c++) newBoard.push(state.boardState[r*cols + c]); newBoard.push(''); }
                    newBoard[Math.floor(rows / 2) * newCols + (newCols - 1)] = 'O';
                    state.cols = newCols; state.boardState = newBoard; state.movesCount++;
                    if (audioCtx.state === 'suspended') audioCtx.resume(); playSound('o');
                    triggerShake(); animateMove(Math.floor(rows / 2) * newCols + (newCols - 1));
                    const winCheck = checkWinner(newBoard, newCols, rows);
                    if (winCheck) {
                        state.winner = winCheck.winner; state.winningLine = winCheck.line;
                        if (state.winner === 'X') state.scoreX++; else if (state.winner === 'O') state.scoreO++;
                        playSound(state.winner === state.startingPlayer ? 'win' : 'win-alt'); triggerGameOver(state.winner);
                    } else { state.isXTurn = !state.isXTurn; }
                } else if (move.action === 'move' && move.index !== -1) {
                    const newBoard = [...state.boardState]; newBoard[move.index] = 'O';
                    state.boardState = newBoard; state.movesCount++;
                    if (audioCtx.state === 'suspended') audioCtx.resume(); playSound('o');
                    animateMove(move.index);
                    const winCheck = checkWinner(newBoard, cols, rows);
                    if (winCheck) {
                        state.winner = winCheck.winner; state.winningLine = winCheck.line;
                        if (state.winner === 'X') state.scoreX++; else if (state.winner === 'O') state.scoreO++;
                        playSound(state.winner === state.startingPlayer ? 'win' : 'win-alt'); triggerGameOver(state.winner);
                    } else if (state.movesCount >= state.boardState.length) {
                        state.winner = 'Draw'; playSound('draw'); triggerGameOver('Draw');
                    } else { state.isXTurn = !state.isXTurn; }
                }
                state.botTimer = null;
            }
        }

        for (let i = 0; i < state.boardState.length; i++) {
            const row = Math.floor(i / cols), col = i % cols, x = gridX + col * cellSize, y = gridY + row * cellSize;
            const isMyOnlineTurn = state.gameMode !== 'online' || (state.isXTurn ? 'X' : 'O') === myMark;

            if (pointer.justPressed && !state.winner && !settingsOpen && !isBotTurn && isMyOnlineTurn) {
                if (audioCtx.state === 'suspended') audioCtx.resume();
                if (pointer.x >= x && pointer.x <= x + cellSize && pointer.y >= y && pointer.y <= y + cellSize) {
                    if (state.boardState[i] === '') {
                        const currentMark = state.isXTurn ? 'X' : 'O'; const newBoard = [...state.boardState]; newBoard[i] = currentMark;
                        state.boardState = newBoard; state.movesCount++; playSound(currentMark === 'X' ? 'x' : 'o');
                        animateMove(i);
                        if (state.gameMode === 'online' && peerConn) peerConn.send({ type: 'MOVE', index: i, mark: currentMark });
                        const winCheck = checkWinner(newBoard, cols, rows);
                        if (winCheck) {
                            state.winner = winCheck.winner; state.winningLine = winCheck.line;
                            if (state.gameMode === 'online') {
                                if (state.winner === myMark) state.myScore++; else if (state.winner !== 'Draw') state.opponentScore++;
                            } else {
                                if (state.winner === 'X') state.scoreX++; else if (state.winner === 'O') state.scoreO++;
                            }
                            playSound(state.winner === state.startingPlayer ? 'win' : 'win-alt'); triggerGameOver(state.winner);
                        } else if (state.movesCount >= state.boardState.length) {
                            state.winner = 'Draw'; playSound('draw'); triggerGameOver('Draw');
                        } else { state.isXTurn = !state.isXTurn; }
                    }
                }
            }

            if (state.winningLine && state.winningLine.includes(i)) {
                const margin = cellSize * 0.1; ctx.fillStyle = WH.transparent('--on-surface-default', 0.15); ctx.beginPath();
                ctx.roundRect(x + margin, y + margin, cellSize - (margin * 2), cellSize - (margin * 2), margin); ctx.fill();
            }

            const mark = state.boardState[i];
            if (mark) {
                const scale = state.animScale[i] !== undefined ? state.animScale[i] : 1;
                ctx.save(); 
                
                // Translate to the center of the cell, scale, and translate back
                ctx.translate(x + cellSize/2, y + cellSize/2);
                ctx.scale(scale, scale);
                ctx.translate(-(x + cellSize/2), -(y + cellSize/2));
                
                ctx.strokeStyle = mark === 'X' ? WH.getColor('--chart-1') : WH.getColor('--chart-4'); ctx.lineWidth = cellSize * 0.15; ctx.lineCap = 'round'; const pad = cellSize * 0.20;
                if (mark === 'O') { ctx.beginPath(); ctx.arc(x + cellSize/2, y + cellSize/2, (cellSize / 2) - pad, 0, Math.PI * 2); ctx.stroke(); } 
                else if (mark === 'X') { ctx.beginPath(); ctx.moveTo(x + pad, y + pad); ctx.lineTo(x + cellSize - pad, y + cellSize - pad); ctx.moveTo(x + cellSize - pad, y + pad); ctx.lineTo(x + pad, y + cellSize - pad); ctx.stroke(); }
                
                ctx.restore();
            }
        }
        
        // Restore from Global Board Shake
        ctx.restore();

        // Update HUD
        if (state.gameMode === 'online') {
            document.getElementById('score-label-1').innerHTML = 'You (<span style="color: ' + (myMark === 'X' ? 'var(--chart-1)' : 'var(--chart-4)') + '">' + myMark + '</span>)';
            document.getElementById('stat-score-x').textContent = state.myScore || 0;
            document.getElementById('score-label-2').innerHTML = 'Opponent (<span style="color: ' + (myMark === 'X' ? 'var(--chart-4)' : 'var(--chart-1)') + '">' + (myMark === 'X' ? 'O' : 'X') + '</span>)';
            document.getElementById('stat-score-o').textContent = state.opponentScore || 0;
        } else {
            document.getElementById('score-label-1').innerHTML = 'Player X';
            document.getElementById('stat-score-x').textContent = state.scoreX || 0;
            document.getElementById('score-label-2').innerHTML = 'Player O';
            document.getElementById('stat-score-o').textContent = state.scoreO || 0;
        }

        if (state.winner) {
            statTurn.textContent = '-';
        } else {
            let turnText = state.isXTurn ? 'X' : 'O';
            if (state.gameMode === 'online') {
                const isMyTurn = (state.isXTurn ? 'X' : 'O') === myMark;
                turnText += isMyTurn ? ' (You)' : ' (Opponent)';
            }
            statTurn.textContent = turnText;
        }
        statTurn.style.color = state.isXTurn ? WH.getColor('--chart-1') : WH.getColor('--chart-4');
        statMoves.textContent = state.movesCount;

        if (state.winner) {
            statWinner.textContent = state.winner === 'Draw' ? "It's a Draw!" : state.winner + " WINS!";
            statWinner.style.color = state.winner === 'X' ? WH.getColor('--chart-1') : (state.winner === 'O' ? WH.getColor('--chart-4') : '#1B1C1D');
        } else { statWinner.textContent = ""; }
    };
});

// --- 6. CODE STATE VISUALIZATION (Bottom D3) ---
const updateCodeState = WH.initD3('vizBottom', (selection) => {
    const svg = selection.append('svg').style('width', '100%').style('height', '100%');
    svg.append('text').attr('x', 20).attr('y', 30).attr('fill', WH.getColor('--primary')).style('font-weight', '900').style('font-size', '14px').text('INTERNAL STATE: boardState Array');
    const g = svg.append('g'), varsGroup = svg.append('g');

    return () => {
        if (gameState !== 'playing') { svg.style('display', 'none'); return; }
        svg.style('display', 'block');
        const rect = selection.node().getBoundingClientRect(), currentW = rect.width || 800, currentH = rect.height || 300;
        g.attr('transform', `translate(20, 60)`);

        const boxSize = Math.max(20, Math.min((currentW - 40) / state.boardState.length, Math.min(80, currentH * 0.3)));
        const boxes = g.selectAll('g.array-cell').data(state.boardState), enter = boxes.enter().append('g').attr('class', 'array-cell');
        enter.append('rect').attr('rx', 6).attr('stroke', WH.getColor('--outline')).attr('stroke-width', 2);
        enter.append('text').attr('class', 'val').attr('text-anchor', 'middle').style('font-weight', '900').style('font-size', 'clamp(14px, 2vw, 24px)');
        enter.append('text').attr('class', 'idx').attr('text-anchor', 'middle').attr('font-size', '11px').attr('fill', WH.getColor('--on-surface-variant')).style('font-weight', 'bold');
        enter.append('text').attr('class', 'idx-matrix').attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', '#555555').style('font-weight', 'normal');

        const all = enter.merge(boxes);
        all.attr('transform', (d, i) => `translate(${i * boxSize}, 0)`);
        all.select('rect').attr('width', Math.max(1, boxSize - 6)).attr('height', Math.max(1, boxSize - 6)).attr('fill', (d) => d === '' ? WH.getColor('--surface') : WH.transparent('--outline', 0.05));
        all.select('text.val').attr('x', boxSize / 2 - 3).attr('y', boxSize / 2 + 5).text(d => d || '-').attr('fill', (d) => d === 'X' ? WH.getColor('--chart-1') : (d === 'O' ? WH.getColor('--chart-4') : WH.getColor('--outline')));

        const cols = state.cols || 3;
        all.select('text.idx').attr('x', boxSize / 2 - 3).attr('y', boxSize + 16).text((d, i) => { const row = Math.floor(i / cols), col = i % cols; return `[${row}, ${col}]`; });
        all.select('text.idx-matrix').attr('x', boxSize / 2 - 3).attr('y', boxSize + 28).style('display', boxSize < 40 ? 'none' : 'block').text((d, i) => { const alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G'], row = Math.floor(i / cols) + 1, colLabel = alpha[i % cols] || '?'; return `${colLabel}${row} [${i}]`; });

        const vars = [{ label: 'isXTurn', value: state.isXTurn.toString() }, { label: 'movesCount', value: state.movesCount.toString() }, { label: 'winner', value: state.winner || 'null' }];
        const varGroups = varsGroup.selectAll('g.var-display').data(vars), varEnter = varGroups.enter().append('g').attr('class', 'var-display');
        varEnter.append('text').attr('class', 'label').attr('font-size', '11px').style('font-weight', 'bold').attr('fill', WH.getColor('--on-surface-variant'));
        varEnter.append('text').attr('class', 'value').attr('y', 16).attr('font-weight', '900').attr('font-size', '14px').attr('fill', WH.getColor('--primary'));

        const allVars = varEnter.merge(varGroups), varsY = boxSize + 140;
        allVars.attr('transform', (d, i) => { let cols = Math.floor(currentW / 120); if (cols < 1) cols = 1; return `translate(${(i % cols) * 120 + 20}, ${varsY + (Math.floor(i / cols) * 35)})`; });
        allVars.select('.label').text(d => d.label); allVars.select('.value').text(d => d.value);
    };
});

// Cleanly sever network connections if the user closes the browser tab
window.addEventListener('beforeunload', () => {
    if (peer) {
        peer.destroy();
    }
});

let debounceTimer;
state._subscribe(() => { cancelAnimationFrame(debounceTimer); debounceTimer = requestAnimationFrame(() => updateCodeState()); });

// Auto-fill Room Code from URL (e.g., ?room=ABCDE)
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomToJoin = urlParams.get('room');
    if (roomToJoin) {
        // Programmatically click through the menus to open the lobby
        document.getElementById('btn-play').click();
        setTimeout(() => {
            document.getElementById('btn-online-mode').click();
            document.getElementById('room-code-input').value = roomToJoin.toUpperCase();
        }, 400); // Wait for animations to finish
    }
});