// Game Data Structure
let gamesData = {
  featured: [],
  html: [],
  unity: []
};

// DOM REFERENCES
const container = document.getElementById('gamesContainer');

// SAFETY CHECK
if (!container) {
  console.error('gamesContainer not found in HTML');
  throw new Error('Missing container');
}

// Detect GitHub Pages subdirectory
const isGitHubPages = window.location.hostname.includes('github.io');
const basePath = isGitHubPages ? '/shodan-games/' : './';

console.log(`Using base path: ${basePath}`);

// ============================================
// LOAD ALL GAMES FROM CATEGORY STRUCTURE
// ============================================
async function loadAllGames() {
  try {
    console.log('Loading games list...');
    
    // Fetch games-list.json
    const listResponse = await fetch(`${basePath}games-list.json`);
    if (!listResponse.ok) {
      throw new Error(`Failed to load games-list.json: ${listResponse.status}`);
    }
    
    const gamesList = await listResponse.json().catch(err => {
      console.error('Invalid JSON in games-list.json:', err);
      throw new Error('games-list.json is corrupted');
    });

    console.log('Games list loaded:', gamesList);

    // Loop through categories
    for (const category in gamesList.categories) {
      const gameFolders = gamesList.categories[category];
      
      for (const gameFolderName of gameFolders) {
        try {
          // Full path: games/web-game/ball-escapes-a-circular-trap/data.json
          const folder = `${category}/${gameFolderName}`;
          const dataPath = `${basePath}games/${folder}/data.json`;
          
          console.log(`Loading: ${dataPath}`);
          
          const response = await fetch(dataPath);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const gameData = await response.json();
          
          // ========== FIX PATHS ==========
          const removeLeadingDot = (path) => path.replace(/^\.\//, '');
          
          gameData.thumbnail = `${basePath}games/${folder}/${removeLeadingDot(gameData.thumbnail)}`;
          gameData.video = `${basePath}games/${folder}/${removeLeadingDot(gameData.video)}`;
          gameData.link = `${basePath}games/${folder}/${removeLeadingDot(gameData.link)}`;
          
          console.log(`✅ Loaded: ${gameData.title}`, gameData);
          
          // Always add to category first
          if (gameData.type === 'html') {
            gamesData.html.push(gameData);
          } else if (gameData.type === 'external') {
            gamesData.unity.push(gameData);
          }

          // Then also add to featured if marked
          if (gameData.badge === 'hot' || gameData.featured === true) {
            gamesData.featured.push(gameData);
          }

          
        } catch (error) {
          console.warn(`❌ Could not load game: ${gameFolderName}`, error.message);
        }
      }
    }

    console.log('Final gamesData:', gamesData);
    initializeGames();
    
  } catch (error) {
    console.error('❌ Error loading games:', error);
  }
}

// ============================================
// INITIALIZE GAME GRID
// ============================================
function initializeGames() {
  const hasFeatured = gamesData.featured && gamesData.featured.length > 0;
  const hasHTML = gamesData.html && gamesData.html.length > 0;
  const hasUnity = gamesData.unity && gamesData.unity.length > 0;

  console.log(`Featured: ${hasFeatured}, HTML: ${hasHTML}, Unity: ${hasUnity}`);

  // Render Featured Games
  if (hasFeatured) {
    renderGames(gamesData.featured, 'gameGridFeatured');
  } else {
    // Hide both the title and the grid
    const featuredGrid = document.getElementById('gameGridFeatured');
    const featuredTitle = featuredGrid?.previousElementSibling;
    if (featuredGrid) {
      featuredGrid.style.display = 'none';
      if (featuredTitle?.classList.contains('section-title')) {
        featuredTitle.style.display = 'none';
      }
    }
  }

  // Render HTML Games
  if (hasHTML) {
    renderGames(gamesData.html, 'gameGridHTML');
  } else {
    const htmlSection = document.getElementById('gameGridHTML');
    if (htmlSection) {
      htmlSection.parentElement.style.display = 'none';
    }
  }

  // Render Unity Games
  if (hasUnity) {
    renderGames(gamesData.unity, 'gameGridUnity');
  } else {
    const unitySection = document.getElementById('gameGridUnity');
    if (unitySection) {
      unitySection.parentElement.style.display = 'none';
    }
  }

  // Show empty state if no games
  if (!hasFeatured && !hasHTML && !hasUnity) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>🎮 Coming Soon!</h2>
        <p>Games will be added here soon. Check back later!</p>
      </div>
    `;
  }
}

// ============================================
// RENDER GAMES TO GRID
// ============================================
function renderGames(games, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) {
    console.error(`Grid not found: ${gridId}`);
    return;
  }
  
  grid.innerHTML = '';

  games.forEach(game => {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';

    gameCard.innerHTML = `
      <div class="game-card-media">
        <img src="${game.thumbnail}" alt="${game.title}" class="game-card-image" loading="lazy" />
        <video class="game-card-video" muted loop preload="metadata">
          <source src="${game.video}" type="video/mp4" />
        </video>
        <div class="game-card-info">
          <div class="game-title">${game.title}</div>
          <div>
            ${game.badge ? `<span class="game-badge ${game.badge}">${game.badge.toUpperCase()}</span>` : ''}
          </div>
          <button class="play-btn" onclick="playGame('${game.link}', '${game.type}')">Play</button>
        </div>
      </div>
    `;

    // Video preview on hover
    const video = gameCard.querySelector('.game-card-video');
    gameCard.addEventListener('mouseenter', () => {
      if (game.video) {
        video.play().catch(err => console.warn('Video autoplay blocked:', err));
      }
    });

    gameCard.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });

    grid.appendChild(gameCard);
  });
}

// ============================================
// HANDLE GAME PLAY
// ============================================
function playGame(link, type) {
  try {
    if (type === 'html') {
      // Open local HTML game with correct base path
      const gameLink = link.startsWith('/') ? link : `${basePath}${link}`;
      window.location.href = gameLink;
    } else if (type === 'external') {
      // Open external game in new tab
      window.open(link, '_blank');
    } else {
      console.warn('Unknown game type:', type);
    }
  } catch (error) {
    console.error('Error playing game:', error);
  }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const allCards = document.querySelectorAll('.game-card');

    allCards.forEach(card => {
      const title = card.querySelector('.game-title').textContent.toLowerCase();
      card.style.display = title.includes(searchTerm) ? '' : 'none';
    });
  });
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
window.addEventListener('load', loadAllGames);
