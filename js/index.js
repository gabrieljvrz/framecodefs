const token = localStorage.getItem('framecode_token') || sessionStorage.getItem('framecode_token');
if (window.location.pathname.includes('login.html') && token) {
  window.location.href = 'index.html';
}

const apiKey = "3b08d5dfa29024b5dcb74e8bff23f984";
const apiBase = "https://api.themoviedb.org/3";
const imageBase = "https://image.tmdb.org/t/p/w500";

const banner = document.querySelector(".banner");
const queryInput = document.querySelector("#searchInput");
const moviesGrid = document.querySelector(".movies-grid");
const moviesTitle = document.querySelector("#moviesTitle");

// Função para criar um card de filme com link
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
    </a>
    <div class="movie-info">
      <h3>${title}</h3>
    </div>
  `;

  return card;
}

//Exibir filmes populares inicialmente
async function fetchPopularMovies() {
  const urlPage1 = `${apiBase}/movie/popular?api_key=${apiKey}&language=pt-BR&page=1`;
  const urlPage2 = `${apiBase}/movie/popular?api_key=${apiKey}&language=pt-BR&page=2`;

  try {
    const [res1, res2] = await Promise.all([fetch(urlPage1), fetch(urlPage2)]);
    const data1 = await res1.json();
    const data2 = await res2.json();

    const combinedResults = [...data1.results, ...data2.results];
    const limitedResults = combinedResults.slice(0, 24); 

    moviesGrid.innerHTML = "";
    moviesTitle.textContent = "Populares";

    limitedResults.forEach((movie) => {
      const card = createMovieCard(movie);
      moviesGrid.appendChild(card);
    });

  } catch (error) {
    moviesGrid.innerHTML = "<p>Erro ao carregar os filmes populares.</p>";
  }
}


// Buscar filmes
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

// Evento de digitação na barra de pesquisa
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

// Carregar filmes populares ao abrir a página
fetchPopularMovies();
