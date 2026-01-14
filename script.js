<script>
        // Game Data Structure - ADD YOUR GAMES HERE
        const gamesData = {
            featured: [
                {
                    id: 1,
                    title: "Sample Game 1",
                    thumbnail: "https://via.placeholder.com/300x300?text=Game+1",
                    video: "https://via.placeholder.com/300x300?text=Video+1",
                    badge: "hot",
                    type: "html", // 'html' or 'external'
                    link: "./games/game1/index.html" // Local path or external URL
                }
            ],
            html: [
                // Add your HTML/CSS/JS games here
                // {
                //     id: 2,
                //     title: "Your Game Name",
                //     thumbnail: "path/to/thumbnail.jpg",
                //     video: "path/to/preview.mp4",
                //     badge: "new",
                //     type: "html",
                //     link: "./games/your-game/index.html"
                // }
            ],
            unity: [
                // Add your Unity games here (external links)
                // {
                //     id: 3,
                //     title: "Your Unity Game",
                //     thumbnail: "https://example.com/thumbnail.jpg",
                //     video: "https://example.com/preview.mp4",
                //     badge: "updated",
                //     type: "external",
                //     link: "https://itch.io/your-game" // or GameJolt link
                // }
            ]
        };

        // Initialize the game grid
        function initializeGames() {
            const hasFeatured = gamesData.featured.length > 0;
            const hasHTML = gamesData.html.length > 0;
            const hasUnity = gamesData.unity.length > 0;

            if (hasFeatured) {
                renderGames(gamesData.featured, 'gameGridFeatured');
            } else {
                document.getElementById('gameGridFeatured').parentElement.style.display = 'none';
            }

            if (hasHTML) {
                renderGames(gamesData.html, 'gameGridHTML');
            } else {
                document.getElementById('gameGridHTML').parentElement.style.display = 'none';
            }

            if (hasUnity) {
                renderGames(gamesData.unity, 'gameGridUnity');
            } else {
                document.getElementById('gameGridUnity').parentElement.style.display = 'none';
            }

            // Show empty state if no games
            if (!hasFeatured && !hasHTML && !hasUnity) {
                document.querySelector('.container').innerHTML = `
                    <div class="empty-state">
                        <h2>Coming Soon!</h2>
                        <p>Games will be added here soon. Check back later!</p>
                    </div>
                `;
            }
        }

        // Render games to the grid
        function renderGames(games, gridId) {
            const grid = document.getElementById(gridId);
            grid.innerHTML = '';

            games.forEach(game => {
                const gameCard = document.createElement('div');
                gameCard.className = 'game-card';
                gameCard.innerHTML = `
                    <div class="game-card-media">
                        <img src="${game.thumbnail}" alt="${game.title}" class="game-card-image" />
                        <video class="game-card-video" autoplay muted loop>
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
                grid.appendChild(gameCard);
            });
        }

        // Handle game play
        function playGame(link, type) {
            if (type === 'html') {
                // Open local HTML game
                window.location.href = link;
            } else if (type === 'external') {
                // Open external game in new tab
                window.open(link, '_blank');
            }
        }

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const allCards = document.querySelectorAll('.game-card');
            
            allCards.forEach(card => {
                const title = card.querySelector('.game-title').textContent.toLowerCase();
                if (title.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Initialize on page load
        window.addEventListener('load', initializeGames);
    </script>
