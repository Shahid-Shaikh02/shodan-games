// ==========================================
// SHODAN GAMES - PORTFOLIO JAVASCRIPT
// ==========================================

// Configuration
const CONFIG = {
    gamesJsonPath: './games-list.json',
    defaultThumbnail: null, // Set to a default image path if needed
    enableVideoPreview: true,
    enableAnalytics: false // Set to true if you add Google Analytics
};

// Game data storage
let gamesData = {
    featured: [],
    unity: [],
    html: []
};

// Initialize the portfolio
document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    setupEventListeners();
});

// Load games from JSON file
async function loadGames() {
    const loadingEl = document.getElementById('loading');
    const emptyStateEl = document.getElementById('empty-state');

    try {
        const response = await fetch(CONFIG.gamesJsonPath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        gamesData = await response.json();
        
        // Hide loading
        loadingEl.style.display = 'none';
        
        // Check if we have any games
        const totalGames = (gamesData.featured?.length || 0) + 
                          (gamesData.unity?.length || 0) + 
                          (gamesData.html?.length || 0);
        
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
                <p style="font-size: 0.9em;">Please check that games-list.json exists and is valid</p>
            </div>
        `;
    }
}

// Render all game categories
function renderGames() {
    // Render Featured Games
    if (gamesData.featured && gamesData.featured.length > 0) {
        renderGameSection('featured', gamesData.featured);
    }
    
    // Render Unity Games
    if (gamesData.unity && gamesData.unity.length > 0) {
        renderGameSection('unity', gamesData.unity);
    }
    
    // Render HTML5 Games
    if (gamesData.html && gamesData.html.length > 0) {
        renderGameSection('html', gamesData.html);
    }
}

// Render a specific game section
function renderGameSection(category, games) {
    const sectionEl = document.getElementById(`${category}-section`);
    const gamesGridEl = document.getElementById(`${category}-games`);
    
    if (!sectionEl || !gamesGridEl) {
        console.warn(`Section elements not found for category: ${category}`);
        return;
    }
    
    // Show section
    sectionEl.style.display = 'block';
    
    // Create game cards
    gamesGridEl.innerHTML = games.map(game => createGameCard(game)).join('');
    
    // Setup video preview handlers if enabled
    if (CONFIG.enableVideoPreview) {
        setupVideoHandlers(gamesGridEl);
    }
}

// Create a game card HTML
function createGameCard(game) {
    const thumbnail = game.thumbnail || CONFIG.defaultThumbnail || '';
    const hasVideo = game.video && CONFIG.enableVideoPreview;
    const tags = game.tags || [];
    
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
                    </video>` : 
                    ''
                }
                <div class="play-overlay"></div>
            </div>
            <div class="game-info">
                <h3 class="game-title">${escapeHtml(game.title)}</h3>
                <p class="game-description">${escapeHtml(game.description)}</p>
                <div class="game-tags">
                    ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
                <div class="game-actions">
                    <button class="btn btn-play" onclick="playGame('${escapeHtml(game.playUrl)}', '${escapeHtml(game.title)}')">
                        ▶ Play Now
                    </button>
                    ${game.sourceUrl ? 
                        `<a href="${escapeHtml(game.sourceUrl)}" target="_blank" rel="noopener" class="btn btn-source">
                            📁 Source
                        </a>` : 
                        ''
                    }
                </div>
            </div>
        </div>
    `;
}

// Setup video preview handlers
function setupVideoHandlers(containerEl) {
    const gameCards = containerEl.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        const video = card.querySelector('video');
        if (!video) return;
        
        card.addEventListener('mouseenter', () => {
            video.play().catch(err => {
                console.log('Video play failed:', err);
            });
        });
        
        card.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
    });
}

// Play game in modal
// Play game in a new tab
function playGame(url, title) {
    // Option 1: Open in a NEW tab (Recommended)
    // window.open(url, '_blank');

    // Option 2: Open in the SAME tab (Delete the line above and uncomment this one if you prefer)
    window.location.href = url;
    
    // Keep Analytics (Optional)
    if (CONFIG.enableAnalytics && typeof gtag !== 'undefined') {
        gtag('event', 'play_game', {
            'game_title': title,
            'game_url': url
        });
    }
}


// old model for play game!!
// function playGame(url, title) {
//     const modal = document.getElementById('game-modal');
//     const iframe = document.getElementById('game-frame');
    
//     iframe.src = url;
//     modal.classList.add('active');
//     document.body.style.overflow = 'hidden';
    
//     // Track game plays (if analytics enabled)
//     if (CONFIG.enableAnalytics && typeof gtag !== 'undefined') {
//         gtag('event', 'play_game', {
//             'game_title': title,
//             'game_url': url
//         });
//     }
// }

// Close game modal
function closeGame() {
    const modal = document.getElementById('game-modal');
    const iframe = document.getElementById('game-frame');
    
    modal.classList.remove('active');
    iframe.src = '';
    document.body.style.overflow = 'auto';
}

// Setup event listeners
function setupEventListeners() {
    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeGame();
        }
    });
    
    // Close modal on background click
    const modal = document.getElementById('game-modal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeGame();
        }
    });
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Error handling for images
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
        const thumbnail = e.target.closest('.game-thumbnail');
        if (thumbnail && !thumbnail.querySelector('.no-thumbnail')) {
            thumbnail.innerHTML = '<div class="no-thumbnail">🎮</div>' + thumbnail.innerHTML;
        }
    }
}, true);

// Make functions globally accessible
window.playGame = playGame;
window.closeGame = closeGame;
