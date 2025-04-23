// movie.js — detalhes e resenhas por filme
const API_KEY = '4b0e7368cf5b0af1c5e7627dd5cefd53';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w300';
const REVIEWS_KEY = 'reviews';

if (!getSession()) location.href = 'login.html';

function getReviews() {
  return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
}

function saveReviews(r) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(r));
}

function getMovieId() {
  return new URLSearchParams(location.search).get('id');
}

async function loadMovie() {
  const id = getMovieId();
  const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=pt-BR`);
  const movie = await res.json();
  document.getElementById('movieDetails').innerHTML = `
    <h1>${movie.title}</h1>
    <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}">
    <p>${movie.overview}</p>
    <p><strong>Lançamento:</strong> ${movie.release_date}</p>
  `;
  renderReviews();
}

function renderReviews() {
  const id = getMovieId();
  const all = getReviews().filter(r => r.movieId === id);
  const listEl = document.getElementById('reviewsList');
  listEl.innerHTML = '';
  if (all.length) {
    const avg = (all.reduce((sum,r)=>sum+Number(r.rating),0) / all.length).toFixed(2);
    document.getElementById('avgRating').textContent = avg;
    all.forEach(r => {
      const li = document.createElement('li');
      li.className = 'review-item';
      const user = getUsers().find(u=>u.email===r.userEmail);
      li.innerHTML = `
        <header>
          <div class="meta"><strong>${user.name}</strong> — ${r.rating}/5</div>
          ${r.userEmail===getSession().email 
            ? `<div>
                <button onclick="editReview('${r.id}')">Editar</button>
                <button onclick="deleteReview('${r.id}')">Excluir</button>
               </div>`
            : ''
          }
        </header>
        <p>${r.text}</p>
      `;
      listEl.appendChild(li);
    });
  } else {
    document.getElementById('avgRating').textContent = '—';
  }
}

document.getElementById('reviewForm').addEventListener('submit', e => {
  e.preventDefault();
  const session = getSession();
  const text = e.target.text.value.trim();
  const rating = e.target.rating.value;
  if (!text) return alert('Escreva algo');
  const id = getMovieId();
  const title = document.querySelector('#movieDetails h1').textContent;
  const reviews = getReviews();
  const review = {
    id: Date.now().toString(),
    movieId: id,
    movieTitle: title,
    userEmail: session.email,
    rating,
    text
  };
  reviews.push(review);
  saveReviews(reviews);
  e.target.reset();
  renderReviews();
});

function deleteReview(id) {
  if (!confirm('Confirma exclusão?')) return;
  const filtered = getReviews().filter(r => r.id !== id);
  saveReviews(filtered);
  renderReviews();
}

function editReview(id) {
  const reviews = getReviews();
  const r = reviews.find(r=>r.id===id);
  const newText = prompt('Edite sua resenha:', r.text);
  if (newText==null) return;
  const newRating = prompt('Nova nota (0–5):', r.rating);
  if (newRating==null) return;
  r.text = newText.trim();
  r.rating = newRating;
  saveReviews(reviews);
  renderReviews();
}

loadMovie();
