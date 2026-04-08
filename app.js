// ─────────────────────────────────────────────
//  ArcadeZone — app.js
// ─────────────────────────────────────────────

const GAMES_URL = 'games.json';

let allGames   = [];
let activeCategory = 'All';
let searchQuery    = '';

// ── DOM refs ──
const gameGrid      = document.getElementById('gameGrid');
const gameCount     = document.getElementById('gameCount');
const noResults     = document.getElementById('noResults');
const catFilters    = document.getElementById('categoryFilters');
const searchInput   = document.getElementById('searchInput');

const modalOverlay  = document.getElementById('modalOverlay');
const modalClose    = document.getElementById('modalClose');
const gameFrame     = document.getElementById('gameFrame');
const iframeLoader  = document.getElementById('iframeLoader');
const modalTitle    = document.getElementById('modalTitle');
const modalEmoji    = document.getElementById('modalEmoji');
const modalCat      = document.getElementById('modalCat');
const modalDesc     = document.getElementById('modalDesc');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// ─────────────────────────────────────────────
//  FETCH & INIT
// ─────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch(GAMES_URL);
    if (!res.ok) throw new Error('Failed to load games.json');
    allGames = await res.json();
    buildCategories();
    renderGames();
  } catch (err) {
    gameGrid.innerHTML = `
      <div class="no-results" style="display:block; grid-column:1/-1;">
        <span>⚠️</span>
        <p>Could not load games. Make sure <strong>games.json</strong> is in the same folder.</p>
        <p style="margin-top:8px;font-size:0.8rem;opacity:0.5;">${err.message}</p>
      </div>`;
  }
}

// ─────────────────────────────────────────────
//  CATEGORIES
// ─────────────────────────────────────────────
function buildCategories() {
  const cats = ['All', ...new Set(allGames.map(g => g.category))];
  catFilters.innerHTML = '';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat === 'All' ? ' active' : '');
    btn.dataset.cat = cat;
    btn.textContent = cat;
    btn.addEventListener('click', () => selectCategory(cat));
    catFilters.appendChild(btn);
  });
}

function selectCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });
  renderGames();
}

// ─────────────────────────────────────────────
//  RENDER GAMES
// ─────────────────────────────────────────────
function renderGames() {
  const query = searchQuery.toLowerCase().trim();

  const filtered = allGames.filter(g => {
    const matchCat   = activeCategory === 'All' || g.category === activeCategory;
    const matchSearch = !query ||
      g.title.toLowerCase().includes(query) ||
      g.description.toLowerCase().includes(query) ||
      g.category.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  gameCount.textContent = filtered.length;
  gameGrid.innerHTML = '';

  if (filtered.length === 0) {
    noResults.style.display = 'block';
    return;
  }
  noResults.style.display = 'none';

  filtered.forEach((game, i) => {
    const card = createCard(game, i);
    gameGrid.appendChild(card);
  });
}

// ─────────────────────────────────────────────
//  CREATE CARD
// ─────────────────────────────────────────────
function createCard(game, index) {
  const card = document.createElement('div');
  card.className = 'game-card';
  card.style.animationDelay = `${index * 40}ms`;
  card.innerHTML = `
    <div class="card-thumb">
      <span>${game.thumbnail}</span>
      <div class="card-thumb-glow"></div>
    </div>
    <div class="card-body">
      <div class="card-title">${game.title}</div>
      <div class="card-desc">${game.description}</div>
      <div class="card-footer">
        <span class="card-cat">${game.category}</span>
        <span class="card-play">▶ Play</span>
      </div>
    </div>
  `;
  card.addEventListener('click', () => openGame(game));
  return card;
}

// ─────────────────────────────────────────────
//  MODAL — OPEN / CLOSE
// ─────────────────────────────────────────────
function openGame(game) {
  // Populate modal info
  modalTitle.textContent = game.title;
  modalEmoji.textContent = game.thumbnail;
  modalCat.textContent   = game.category;
  modalDesc.textContent  = game.description;

  // Show loader, clear previous src
  iframeLoader.classList.remove('hidden');
  gameFrame.src = '';

  // Open overlay
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Load game
  gameFrame.src = game.url;

  gameFrame.onload = () => {
    iframeLoader.classList.add('hidden');
  };

  // Fallback hide loader after 6s (some iframes block onload)
  setTimeout(() => iframeLoader.classList.add('hidden'), 6000);
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  gameFrame.src = '';
}

// ─────────────────────────────────────────────
//  FULLSCREEN
// ─────────────────────────────────────────────
fullscreenBtn.addEventListener('click', () => {
  const wrapper = document.querySelector('.iframe-wrapper');
  if (wrapper.requestFullscreen) wrapper.requestFullscreen();
  else if (wrapper.webkitRequestFullscreen) wrapper.webkitRequestFullscreen();
});

// ─────────────────────────────────────────────
//  EVENT LISTENERS
// ─────────────────────────────────────────────
modalClose.addEventListener('click', closeModal);

// Click outside modal to close
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Search
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderGames();
});

// ─────────────────────────────────────────────
//  START
// ─────────────────────────────────────────────
init();
