// js/movie-details.js

const apiKey    = "3b08d5dfa29024b5dcb74e8bff23f984";
const apiBase   = "https://api.themoviedb.org/3";
const imageBase = "https://image.tmdb.org/t/p/w500";

// --- ELEMENTOS DO DOM ---
const detailsContainer = document.querySelector('.container');
const movieTitle       = document.getElementById("movieTitle");
const movieOverview    = document.getElementById("movieOverview");
const movieReleaseDate = document.getElementById("movieReleaseDate");
const movieGenres      = document.getElementById("movieGenres");
const movieCast        = document.getElementById("movieCast");
const moviePoster      = document.querySelector(".movie-poster");
const reviewForm       = document.getElementById('reviewForm');
const reviewsList      = document.getElementById('reviewsList');
const avgRatingEl      = document.getElementById('avgRating');

const searchResultsSection = document.getElementById('searchResultsSection');
const searchResultsGrid = document.getElementById('searchResultsGrid');
const searchResultsTitle = document.getElementById('searchResultsTitle');

let currentMovieData = null;

// --- LÓGICA DE PESQUISA ---

// CORREÇÃO 2: A tag <h3> foi movida para fora do <a> para ser exibida corretamente.
function createMovieCard(movie) {
  const card = document.createElement("div");
  card.classList.add("movie-card");
  const title = movie.title || movie.name || "Título Desconhecido";
  const posterPath = movie.poster_path ? `${imageBase}${movie.poster_path}` : "https://via.placeholder.com/500x750?text=Sem+Imagem";

  // A CORREÇÃO ESTÁ AQUI: A tag <h3> foi movida para FORA da tag <a>.
  card.innerHTML = `
    <a href="movie.html?id=${movie.id}">
      <img src="${posterPath}" alt="${title}">
    </a>
    <h3>${title}</h3>
  `;
  return card;
}

async function searchMovies(query) {
  const url = `${apiBase}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pt-BR`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    searchResultsGrid.innerHTML = "";
    if (!data.results || data.results.length === 0) {
      searchResultsGrid.innerHTML = "<p>Nenhum filme encontrado!</p>";
      return;
    }
    data.results.forEach((movie) => {
      const card = createMovieCard(movie);
      searchResultsGrid.appendChild(card);
    });
  } catch (error) {
    searchResultsGrid.innerHTML = "<p>Erro ao buscar filmes.</p>";
  }
}

// CORREÇÃO 1: A lógica de pesquisa agora usa o evento 'input' para ser em tempo real.
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim();
    if (searchTerm) {
      detailsContainer.style.display = 'none';
      searchResultsSection.style.display = 'block';
      searchResultsTitle.textContent = `Resultados da busca para: "${searchTerm}"`;
      searchMovies(searchTerm);
    } else {
      // Se o campo de busca for limpo, volta a mostrar os detalhes do filme
      searchResultsSection.style.display = 'none';
      detailsContainer.style.display = 'block';
    }
  });

  // Mantemos o evento de submit para o caso de o utilizador premir Enter, para garantir o comportamento
  if (searchForm) {
      searchForm.addEventListener('submit', (e) => e.preventDefault());
  }
}


// --- LÓGICA ORIGINAL DA PÁGINA DE DETALHES ---
const urlParams = new URLSearchParams(window.location.search);
const movieId   = urlParams.get("id");

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Erro ao descodificar o token JWT:", e);
    return null;
  }
}

const token = localStorage.getItem('framecode_token');
let loggedInUser = null;
if (token) {
  const decodedToken = parseJwt(token);
  if (decodedToken && decodedToken.user) {
    loggedInUser = decodedToken.user;
  }
}

async function loadMovieDetails(id) {
  const url = `${apiBase}/movie/${id}?api_key=${apiKey}&language=pt-BR`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    currentMovieData = data;
    movieTitle.textContent       = data.title || data.name;
    movieOverview.textContent    = data.overview || "Sem sinopse disponível.";
    movieReleaseDate.textContent = data.release_date || "Data não disponível.";
    movieGenres.textContent      = data.genres.map(g => g.name).join(", ") || "Gêneros não informados.";
    moviePoster.src              = data.poster_path ? `${imageBase}${data.poster_path}` : "https://via.placeholder.com/500x750?text=Sem+Imagem";
    moviePoster.alt              = data.title || "Sem título";
  } catch (err) {
    movieTitle.textContent    = "Erro ao carregar detalhes.";
  }
}

async function loadMovieCredits(id) {
  const url = `${apiBase}/movie/${id}/credits?api_key=${apiKey}&language=pt-BR`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    const topCast = data.cast.slice(0, 5).map(a => a.name);
    movieCast.textContent = topCast.join(", ") || "Elenco não disponível.";
  } catch {
    movieCast.textContent = "Erro ao carregar elenco.";
  }
}

async function renderReviews() {
  reviewsList.innerHTML = "<li>Carregando avaliações...</li>";
  try {
    const response = await fetch(`http://localhost:3000/api/reviews/${movieId}`);
    const reviewsForThisMovie = await response.json();
    if (!response.ok) throw new Error('Não foi possível carregar as avaliações.');
    reviewsList.innerHTML = "";
    let sumOfRatings = 0;
    if (reviewsForThisMovie.length === 0) {
      reviewsList.innerHTML = "<li>Nenhuma avaliação ainda. Seja o primeiro!</li>";
    }
    reviewsForThisMovie.forEach(review => {
      sumOfRatings += review.rating;
      const li = document.createElement('li');
      li.className = "review-item";
      li.id = `review-${review.id}`;
      let buttons = '';
      if (loggedInUser) {
        if (loggedInUser.id == review.user_id) {
            buttons = `<button onclick="editReview(${review.id}, '${review.comment.replace(/'/g, "\\'")}', ${review.rating})">Editar</button><button onclick="deleteMyReview(${review.id})">Excluir</button>`;
        } 
        else if (loggedInUser.role === 'admin') {
            buttons = `<button onclick="deleteAnyReview(${review.id})">Excluir (Admin)</button>`;
        }
      }
      li.innerHTML = `<header><strong>${review.userName||'Anônimo'}</strong><div class="meta-and-actions"><span class="meta"> • Nota: ${review.rating}/5⭐</span><div class="review-actions">${buttons}</div></div></header><p>${review.comment}</p>`;
      reviewsList.appendChild(li);
    });
    if (reviewsForThisMovie.length > 0) {
      const avg = Math.round(sumOfRatings / reviewsForThisMovie.length);
      avgRatingEl.textContent = '★'.repeat(avg) + '☆'.repeat(5 - avg);
    } else {
      avgRatingEl.textContent = '—';
    }
  } catch (error) {
    reviewsList.innerHTML = `<li>Erro ao carregar avaliações: ${error.message}</li>`;
    avgRatingEl.textContent = '—';
  }
}

reviewForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!token) {
        alert('Você precisa estar logado para fazer uma avaliação.');
        return (window.location.href = 'login.html');
    }
    const sel = document.querySelector('input[name="star"]:checked');
    const rating = sel ? +sel.value : 0;
    const comment = document.getElementById('text').value.trim();
    if (!rating || !comment) return alert('Selecione uma nota e escreva sua resenha.');
    try {
        const response = await fetch('http://localhost:3000/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ rating, comment, movieId: movieId, movieTitle: currentMovieData?.title || 'Título desconhecido' })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        reviewForm.reset();
        renderReviews();
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
});

async function editReview(reviewId, oldComment, oldRating) {
  const newComment = prompt("Edite seu comentário:", oldComment);
  if (newComment === null || newComment.trim() === '') return;
  const newRatingStr = prompt("Altere a nota (1 a 5):", oldRating);
  if (newRatingStr === null) return;
  const newRating = parseInt(newRatingStr);
  if (isNaN(newRating) || newRating < 1 || newRating > 5) return alert("Nota inválida. Por favor, insira um número entre 1 e 5.");
  try {
    const response = await fetch(`http://localhost:3000/api/reviews/me/${reviewId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify({ comment: newComment, rating: newRating })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    alert('Avaliação atualizada!');
    renderReviews();
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }
}

async function deleteMyReview(reviewId) {
  if (!confirm("Tem certeza que deseja excluir sua avaliação?")) return;
  try {
    const response = await fetch(`http://localhost:3000/api/reviews/me/${reviewId}`, {
      method: 'DELETE',
      headers: { 'x-auth-token': token }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    alert('Avaliação excluída!');
    renderReviews();
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }
}

async function deleteAnyReview(reviewId) {
  if (!confirm("ADMIN: Tem certeza que deseja excluir esta avaliação?")) return;
  try {
    const response = await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { 'x-auth-token': token }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    alert('Avaliação excluída pelo administrador!');
    renderReviews();
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (!movieId) {
    movieTitle.textContent = "Filme não encontrado";
    return;
  }
  loadMovieDetails(movieId);
  loadMovieCredits(movieId);
  renderReviews();
});