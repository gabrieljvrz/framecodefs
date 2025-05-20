const apiKey = "3b08d5dfa29024b5dcb74e8bff23f984";
const apiBase = "https://api.themoviedb.org/3";
const imageBase = "https://image.tmdb.org/t/p/w500";

// Elementos do DOM
const movieTitle = document.getElementById("movieTitle");
const movieOverview = document.getElementById("movieOverview");
const movieReleaseDate = document.getElementById("movieReleaseDate");
const movieGenres = document.getElementById("movieGenres");
const movieCast = document.getElementById("movieCast");
const moviePoster = document.querySelector(".movie-poster");

// Pega o ID do filme da URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");

if (movieId) {
  loadMovieDetails(movieId);
  loadMovieCredits(movieId);
} else {
  movieTitle.textContent = "Filme não encontrado";
}

// Função para buscar detalhes do filme
async function loadMovieDetails(id) {
  const url = `${apiBase}/movie/${id}?api_key=${apiKey}&language=pt-BR`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    movieTitle.textContent = data.title || data.name;
    movieOverview.textContent = data.overview || "Sem sinopse disponível.";
    movieReleaseDate.textContent = data.release_date || "Data não disponível.";
    movieGenres.textContent = data.genres.map(g => g.name).join(", ") || "Gêneros não informados.";

    moviePoster.src = data.poster_path
      ? `${imageBase}${data.poster_path}`
      : "https://via.placeholder.com/500x750?text=Sem+Imagem";
    moviePoster.alt = data.title || "Sem título";
  } catch (error) {
    movieTitle.textContent = "Erro ao carregar detalhes.";
    movieOverview.textContent = "";
  }
}

// Função para buscar o elenco principal do filme
async function loadMovieCredits(id) {
  const url = `${apiBase}/movie/${id}/credits?api_key=${apiKey}&language=pt-BR`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const topCast = data.cast.slice(0, 5).map(actor => actor.name);
    movieCast.textContent = topCast.join(", ") || "Elenco não disponível.";
  } catch (error) {
    movieCast.textContent = "Erro ao carregar elenco.";
  }
}
