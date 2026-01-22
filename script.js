
// ==========================================
// SHODAN GAMES - PORTFOLIO JAVASCRIPT
// ==========================================

const CONFIG = {
    gamesJsonPath: './games-list.json',
    defaultThumbnail: null,
    enableVideoPreview: true,
    enableAnalytics: false
};

// Data storage
let gamesData = {
    featured: [],
    unity: [],
    html: []
};

document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    setupEventListeners();
});

// 1. ADVANCED LOADING SYSTEM
async function loadGames() {
    const loadingEl = document.getElementById('loading');
    const emptyStateEl = document.getElementById('empty-state');

    try {
        // Fetch the category list
        const response = await fetch(CONFIG.gamesJsonPath);
        if (!response.ok) throw new Error(`Failed to load list: ${response.status}`);
        
        const data = await response.json();
        const categories = data.categories || {};

        // Create a list of all file fetches we need to do
        let fetchPromises = [];

        // Loop through JSON categories (html, unity)
        for (const [category, gameFolders] of Object.entries(categories)) {
            
            // Loop through each game folder in that category
            gameFolders.forEach(folderName => {
                // Construct path: games/html/snake/data.json
                const jsonPath = `games/${category}/${folderName}/data.json`;
                
                // Add to fetch list
                fetchPromises.push(
                    fetchGameData(jsonPath, category, folderName)
                );
            });
        }

        // Run all fetches in parallel
        await Promise.all(fetchPromises);

        // Hide loading screen
        loadingEl.style.display = 'none';

        // Check if we found any games
        const totalGames = gamesData.featured.length + gamesData.unity.length + gamesData.html.length;
        if (totalGames === 0) {
            emptyStateEl.style.display = 'block';
        } else {
            renderGames();
        }

    } catch (error) {
        console.error('Error loading games:', error);
        loadingEl.innerHTML = `
            <div style="color: #ff6b6b;">
                <p>⚠️ Error loading games</p>
                <p style="font-size: 0.9em;">Check console for details.</p>
            </div>
        `;
    }
}

// Helper: Fetch a single game's data.json
async function fetchGameData(path, category, folderName) {
    try {
        const res = await fetch(path);
        if (!res.ok) return;

        const game = await res.json();

        // AUTO-FIX PATHS:
        // This converts "thumb.png" -> "games/html/snake/thumb.png"
        const rootPath = `games/${category}/${folderName}/`;
        
        const fix = (p) => (p && !p.startsWith('http') && !p.startsWith('./')) ? rootPath + p : p;

        game.thumbnail = fix(game.thumbnail);
        game.video = fix(game.video);
        game.playUrl = fix(game.playUrl);

        // Store in correct array
        if (gamesData[category]) {
            gamesData[category].push(game);
        }

        // Add to featured if marked
        if (game.isFeatured) {
            gamesData.featured.push(game);
        }

    } catch (err) {
        console.warn(`Could not load game at ${path}`, err);
    }
}

// 2. RENDERING SYSTEM
function renderGames() {
    // Render Featured
    if (gamesData.featured.length > 0) {
        renderGameSection('featured', gamesData.featured);
    }
    // Render Unity
    if (gamesData.unity.length > 0) {
        renderGameSection('unity', gamesData.unity);
    }
    // Render HTML
    if (gamesData.html.length > 0) {
        renderGameSection('html', gamesData.html);
    }
}

function renderGameSection(category, games) {
    const sectionEl = document.getElementById(`${category}-section`);
    const gamesGridEl = document.getElementById(`${category}-games`);
    
    if (sectionEl && gamesGridEl) {
        sectionEl.style.display = 'block';
        gamesGridEl.innerHTML = games.map(game => createGameCard(game)).join('');
        
        if (CONFIG.enableVideoPreview) {
            setupVideoHandlers(gamesGridEl);
        }
    }
}

function createGameCard(game) {
    const thumbnail = game.thumbnail || '';
    const hasVideo = game.video && CONFIG.enableVideoPreview;
    
    return `
        <div class="game-card" data-game-title="${escapeHtml(game.title)}">
            <div class="game-thumbnail" onclick="playGame('${escapeHtml(game.playUrl)}', '${escapeHtml(game.title)}')" style="cursor: pointer;">
                ${thumbnail ? 
                    `<img src="${escapeHtml(thumbnail)}" alt="${escapeHtml(game.title)}" loading="lazy">` : 
                    `<div class="no-thumbnail">🎮</div>`
                }
                ${hasVideo ? 
                    `<video muted loop preload="none">
                        <source src="${escapeHtml(game.video)}" type="video/mp4">
                    </video>` : ''
                }
                <div class="play-overlay"></div>
            </div>
            <div class="game-info">
                <h3 class="game-title">${escapeHtml(game.title)}</h3>
                <p class="game-description">${escapeHtml(game.description)}</p>
                <div class="game-tags">
                    ${(game.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
                <div class="game-actions">
                    <button class="btn btn-play" onclick="playGame('${escapeHtml(game.playUrl)}', '${escapeHtml(game.title)}')">
                        ▶ Play Now
                    </button>
                    ${game.sourceUrl ? 
                        `<a href="${escapeHtml(game.sourceUrl)}" target="_blank" class="btn btn-source">📁 Source</a>` : ''
                    }
                </div>
            </div>
        </div>
    `;
}

// 3. INTERACTION HANDLERS
function setupVideoHandlers(containerEl) {
    const gameCards = containerEl.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        const video = card.querySelector('video');
        if (!video) return;
        
        card.addEventListener('mouseenter', () => video.play().catch(() => {}));
        card.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
    });
}

function playGame(url, title) {
    // Open in new tab
    window.open(url, '_blank');
    
    if (CONFIG.enableAnalytics && typeof gtag !== 'undefined') {
        gtag('event', 'play_game', { 'game_title': title, 'game_url': url });
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m]);
}

// Keep modal code just in case needed later, though unused for new tab behavior
function closeGame() {
    const modal = document.getElementById('game-modal');
    if(modal) modal.classList.remove('active');
}

function setupEventListeners() {
    // Optional: Add global listeners here if needed
}

// Make globally accessible
window.playGame = playGame;
window.closeGame = closeGame;
