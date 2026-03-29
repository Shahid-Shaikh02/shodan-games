Shodan Games
Shodan Games is a curated collection of browser-based games built and maintained by Shodan (Shahid Shaikh).
This repository powers the live site at: https://shahid-shaikh02.github.io/shodan-games/

Overview
Shodan Games serves as a centralised hub to showcase, host, and iterate on multiple web games under a single, consistent experience.
The platform is implemented using a lightweight, performant front‑end stack (HTML, CSS, JavaScript) and a JSON‑driven configuration for game metadata and content.

Key characteristics:

Centralised listing of multiple games with a unified UI and UX
JSON-based configuration for game catalog and content
Static, CDN‑friendly hosting via GitHub Pages
Simple to extend, maintain, and iterate for future titles
Features
Game catalog management

games-list.json contains metadata for each game (title, description, URLs, tags, etc.).
Designed for easy addition, removal, or modification of games without changing core logic.
Dynamic front‑end

index.html provides the main landing page and layout shell.
script.js dynamically loads and renders the games list, game details, and interactions from JSON.
Responsive styling

style.css implements a responsive layout compatible with modern desktop and mobile browsers.
Focus on clean, minimal visual design to highlight games and thumbnails.
Error handling & routing

Custom 404.html page for invalid or outdated links.
Safe fallback behavior for missing or malformed game entries.
Static hosting & CI-friendly

Deployed via GitHub Pages with frequent updates.
No backend dependency, suitable for low-latency global access.
Tech Stack
Frontend:

HTML5
CSS3
Vanilla JavaScript (ES6+)
Data / Configuration:

JSON (games-list.json and related data structures)
Hosting / DevOps:

GitHub Pages for static hosting
Git and GitHub for version control and collaboration
Project Structure
shodan-games/
├── games/              # Game assets, subfolders, and related resources
├── 404.html            # Custom 404 error page for invalid routes
├── index.html          # Main landing page for the Shodan Games hub
├── script.js           # Core client-side logic and dynamic rendering
├── style.css           # Global styles and responsive layout
├── games-list.json     # Master list of games and metadata
├── .gitignore          # Git ignore rules
└── Readme.md           # Project documentation 
For any suggestions, enquiries, or contact, mail me at: shodansstudio@gmail.com
Gaming youtube@shodangp & Dev youtube@shodan_dev