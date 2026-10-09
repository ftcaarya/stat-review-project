let reviews = [];
let nextId = 1000;
const votedIds = new Set(JSON.parse(localStorage.getItem('votedIds') || '[]'));

const listEl = document.getElementById('review-list');
const sortSelect = document.getElementById('sort-select');
const form = document.getElementById('review-form');

function ratingClass(r) {
  if (r >= 8) return 'rating-high';
  if (r >= 5) return 'rating-mid';
  return 'rating-low';
}

function initials(name) {
  return name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderSummary() {
  const count = reviews.length;
  const avg = count ? (reviews.reduce((s, r) => s + r.rating, 0) / count) : 0;
  document.getElementById('avg-score').textContent = count ? avg.toFixed(1) : '–';
  document.getElementById('review-count').textContent = `${count} review${count === 1 ? '' : 's'}`;

  const counts = Array(10).fill(0);
  reviews.forEach(r => counts[r.rating - 1]++);
  const max = Math.max(1, ...counts);
  const distEl = document.getElementById('distribution');
  distEl.innerHTML = '';
  for (let i = 10; i >= 1; i--) {
    const c = counts[i - 1];
    const row = document.createElement('div');
    row.className = 'dist-row';
    row.innerHTML = `
      <span class="dist-label">${i}</span>
      <span class="dist-bar-bg"><span class="dist-bar-fill" style="width:${(c / max) * 100}%"></span></span>
      <span class="dist-count">${c}</span>
    `;
    distEl.appendChild(row);
  }
}

function renderList() {
  const mode = sortSelect.value;
  const sorted = [...reviews];
  if (mode === 'recent') sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  else if (mode === 'highest') sorted.sort((a, b) => b.rating - a.rating);
  else if (mode === 'lowest') sorted.sort((a, b) => a.rating - b.rating);
  else if (mode === 'helpful') sorted.sort((a, b) => b.helpful - a.helpful);

  listEl.innerHTML = '';
  sorted.forEach(r => {
    const card = document.createElement('article');
    card.className = 'review-card';
    const voted = votedIds.has(r.id);
    card.innerHTML = `
      <div class="review-top">
        <div class="review-user">
          <div class="avatar">${initials(r.username)}</div>
          <div class="user-meta">
            <div class="username">${r.username}</div>
            <div class="date">${formatDate(r.date)}</div>
          </div>
        </div>
        <div class="rating-badge ${ratingClass(r.rating)}">${r.rating}/10</div>
      </div>
      <h3 class="review-title">${r.title}</h3>
      <p class="review-text">${r.text}</p>
      <div class="review-foot">
        <button class="helpful-btn ${voted ? 'voted' : ''}" data-id="${r.id}">
          👍 Helpful (<span class="helpful-count">${r.helpful}</span>)
        </button>
      </div>
    `;
    listEl.appendChild(card);
  });

  listEl.querySelectorAll('.helpful-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const review = reviews.find(r => r.id === id);
      if (!review) return;
      if (votedIds.has(id)) {
        votedIds.delete(id);
        review.helpful--;
      } else {
        votedIds.add(id);
        review.helpful++;
      }
      localStorage.setItem('votedIds', JSON.stringify([...votedIds]));
      renderList();
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const username = document.getElementById('input-username').value.trim();
  const rating = Number(document.getElementById('input-rating').value);
  const title = document.getElementById('input-title').value.trim();
  const text = document.getElementById('input-text').value.trim();
  if (!username || !rating || !title || !text) return;

  reviews.unshift({
    id: nextId++,
    username: escapeHtml(username),
    date: new Date().toISOString().slice(0, 10),
    rating,
    title: escapeHtml(title),
    text: escapeHtml(text),
    helpful: 0
  });

  form.reset();
  sortSelect.value = 'recent';
  renderSummary();
  renderList();
});

sortSelect.addEventListener('change', renderList);

fetch('reviews.json')
  .then(res => res.json())
  .then(data => {
    reviews = data;
    renderSummary();
    renderList();
  })
  .catch(err => {
    listEl.innerHTML = '<p>Could not load reviews. Make sure you are running this through a local server, not opening the file directly.</p>';
    console.error(err);
  });
