// profile.js — edição de perfil e listagem de resenhas do usuário
const REVIEWS_KEY = 'reviews';

if (!getSession()) location.href = 'login.html';

const session = getSession();
document.getElementById('logoutBtn').onclick = () => {
  logout();
  location.href = 'login.html';
};

const form = document.getElementById('profileForm');
form.name.value = session.name;
form.email.value = session.email;

form.addEventListener('submit', e => {
  e.preventDefault();
  const newName = form.name.value.trim();
  if (!newName) return alert('Nome não pode ser vazio');
  const users = getUsers();
  const u = users.find(u=>u.email===session.email);
  u.name = newName;
  saveUsers(users);
  localStorage.setItem('session', JSON.stringify({ ...session, name: newName }));
  alert('Perfil atualizado');
  loadMyReviews();
});

function getReviews() {
  return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
}

function renderReviewItem(r) {
  const li = document.createElement('li');
  li.className = 'review-item';
  li.innerHTML = `
    <header>
      <div class="meta"><strong>${r.movieTitle}</strong> — ${r.rating}/5</div>
      <div>
        <button onclick="goToMovie('${r.movieId}')">Ver</button>
        <button onclick="editReview('${r.id}')">Editar</button>
        <button onclick="deleteReview('${r.id}')">Excluir</button>
      </div>
    </header>
    <p>${r.text}</p>
  `;
  return li;
}

function loadMyReviews() {
  const listEl = document.getElementById('myReviews');
  const mine = getReviews().filter(r=>r.userEmail===session.email);
  listEl.innerHTML = '';
  mine.forEach(r => listEl.appendChild(renderReviewItem(r)));
}

window.goToMovie = id => {
  location.href = `movie.html?id=${id}`;
};

window.deleteReview = id => {
  if (!confirm('Excluir resenha?')) return;
  const filtered = getReviews().filter(r => r.id !== id);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(filtered));
  loadMyReviews();
};

window.editReview = id => {
  const reviews = getReviews();
  const r = reviews.find(r=>r.id===id);
  const newText = prompt('Edite sua resenha:', r.text);
  if (newText==null) return;
  const newRating = prompt('Nova nota (0–5):', r.rating);
  if (newRating==null) return;
  r.text = newText.trim();
  r.rating = newRating;
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  loadMyReviews();
};

loadMyReviews();
