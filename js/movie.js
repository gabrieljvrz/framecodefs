// movie.js

const apiKey = "3b08d5dfa29024b5dcb74e8bff23f984";
const apiBase = "https://api.themoviedb.org/3";
const imageBase = "https://image.tmdb.org/t/p/w500";

const banner = document.querySelector(".banner");
const queryInput = document.querySelector("#searchInput");
const moviesGrid = document.querySelector(".movies-grid");
const moviesTitle = document.querySelector("#moviesTitle");

// Cria um card de filme com redirecionamento para a página de detalhes
function createMovieCard(movie) {
  const card = document.createElement("div");
  card.classList.add("movie-card");

  const title = movie.title || movie.name || "Título Desconhecido";
  const releaseDate = movie.release_date || movie.first_air_date || "Data não disponível";

  const posterPath = (movie.poster_path && movie.poster_path.trim() !== "")
    ? `${imageBase}${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=Sem+Imagem";

  card.innerHTML = `
    <a href="movie.html?id=${movie.id}">
      <img src="${posterPath}" alt="${title}">
      <div class="movie-info">
        <h3>${title}</h3>
        <p>Data de Lançamento: ${releaseDate}</p>
      </div>
    </a>
  `;

  return card;
}

// Carrega os filmes populares
async function fetchPopularMovies() {
  const url = `${apiBase}/movie/popular?api_key=${apiKey}&language=pt-BR`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    moviesGrid.innerHTML = "";
    moviesTitle.textContent = "Lançamentos";
    data.results.forEach((movie) => {
      const card = createMovieCard(movie);
      moviesGrid.appendChild(card);
    });
  } catch (error) {
    moviesGrid.innerHTML = "<p>Erro ao carregar os filmes populares.</p>";
  }
}

// Busca os filmes
async function searchMovies(query) {
  const url = `${apiBase}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pt-BR`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    moviesGrid.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      moviesGrid.innerHTML = "<p>Nenhum filme encontrado!</p>";
      return;
    }

    data.results.forEach((movie) => {
      const card = createMovieCard(movie);
      moviesGrid.appendChild(card);
    });
  } catch (error) {
    moviesGrid.innerHTML = "<p>Erro ao buscar filmes.</p>";
  }
}

// Evento para pesquisa
queryInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value.trim();

  if (searchTerm.length >= 1) {
    searchMovies(searchTerm);
    banner.classList.add("hidden");
    moviesTitle.textContent = `Resultados da busca para: "${searchTerm}"`;
  } else {
    fetchPopularMovies();
    banner.classList.remove("hidden");
    moviesTitle.textContent = "Lançamentos";
  }
});

fetchPopularMovies();