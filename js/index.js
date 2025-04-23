// index.js — exibe populares e busca
const API_KEY = '4b0e7368cf5b0af1c5e7627dd5cefd53';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w300';

if (!getSession()) location.href = 'login.html';

document.getElementById('logoutBtn').onclick = () => {
  logout();
  location.href = 'login.html';
};

async function fetchMovies(path) {
  const res = await fetch(`${BASE_URL}${path}?api_key=${API_KEY}&language=pt-BR`);
  const data = await res.json();
  return data.results;
}

function renderMovies(list) {
  const grid = document.getElementById('moviesGrid');
  grid.innerHTML = '';
  list.forEach(m => {
    const div = document.createElement('div');
    div.className = 'movie-card';
    div.innerHTML = `
      <img src="${IMG_URL + m.poster_path}" alt="${m.title}">
      <div class="info">
        <h3>${m.title}</h3>
        <button onclick="location.href='movie.html?id=${m.id}'">Ver / Resenhar</button>
      </div>
    `;
    grid.appendChild(div);
  });
}

(async () => {
  const populares = await fetchMovies('/movie/popular');
  renderMovies(populares);
})();

document.getElementById('searchForm').addEventListener('submit', async e => {
  e.preventDefault();
  const q = document.getElementById('query').value.trim();
  if (!q) return;
  const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(q)}`);
  const data = await res.json();
  renderMovies(data.results);
});
