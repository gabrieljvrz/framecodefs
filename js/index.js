const API_KEY = '4b0e7368cf5b0af1c5e7627dd5cefd53';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w300';
const PLACEHOLDER_IMG = 'https://via.placeholder.com/300x450?text=Sem+Imagem';

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('query');
const moviesGrid = document.getElementById('moviesGrid');
const logoutBtn = document.getElementById('logoutBtn');

// Verifica se o usuário está logado
if (!getSession()) location.href = 'login.html';

// Logout
logoutBtn.onclick = () => {
  logout();
  location.href = 'login.html';
};

// Busca filmes populares ou por pesquisa
async function fetchMovies(path, query = '') {
  try {
    const url = query
      ? `${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`
      : `${BASE_URL}${path}?api_key=${API_KEY}&language=pt-BR`;

    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    return [];
  }
}

// Renderiza os filmes na tela
function renderMovies(list) {
  moviesGrid.innerHTML = '';

  if (!list.length) {
    moviesGrid.innerHTML = '<p>Nenhum filme encontrado.</p>';
    return;
  }

  list.forEach(movie => {
    const { id, title, poster_path } = movie;

    const card = document.createElement('div');
    card.className = 'movie-card';

    card.innerHTML = `
      <img src="${poster_path ? IMG_URL + poster_path : PLACEHOLDER_IMG}" alt="${title}">
      <div class="info">
        <h3>${title}</h3>
        <button onclick="location.href='movie.html?id=${id}'">Ver / Resenhar</button>
      </div>
    `;

    moviesGrid.appendChild(card);
  });
}

// Carrega os filmes populares ao abrir
(async () => {
  const populares = await fetchMovies('/movie/popular');
  renderMovies(populares);
})();

// Faz busca ao enviar o formulário
searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  const results = await fetchMovies('', query);
  renderMovies(results);
});
