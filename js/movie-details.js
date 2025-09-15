const apiKey    = "3b08d5dfa29024b5dcb74e8bff23f984";
const apiBase   = "https://api.themoviedb.org/3";
const imageBase = "https://image.tmdb.org/t/p/w500";

//DOM
const movieTitle       = document.getElementById("movieTitle");
const movieOverview    = document.getElementById("movieOverview");
const movieReleaseDate = document.getElementById("movieReleaseDate");
const movieGenres      = document.getElementById("movieGenres");
const movieCast        = document.getElementById("movieCast");
const moviePoster      = document.querySelector(".movie-poster");

const reviewForm   = document.getElementById('reviewForm');
const reviewsList  = document.getElementById('reviewsList');
const avgRatingEl  = document.getElementById('avgRating');

let currentMovieData = null;

// extrai ID
const urlParams = new URLSearchParams(window.location.search);
const movieId   = urlParams.get("id");

// única definição de loadMovieDetails:
async function loadMovieDetails(id) {
  const url = `${apiBase}/movie/${id}?api_key=${apiKey}&language=pt-BR`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    currentMovieData = data;

    // preenche DOM
    movieTitle.textContent       = data.title || data.name;
    movieOverview.textContent    = data.overview || "Sem sinopse disponível.";
    movieReleaseDate.textContent = data.release_date || "Data não disponível.";
    movieGenres.textContent      = data.genres.map(g => g.name).join(", ") || "Gêneros não informados.";
    moviePoster.src              = data.poster_path
                                      ? `${imageBase}${data.poster_path}`
                                      : "https://via.placeholder.com/500x750?text=Sem+Imagem";
    moviePoster.alt              = data.title || "Sem título";
  } catch (err) {
    movieTitle.textContent    = "Erro ao carregar detalhes.";
    movieOverview.textContent = "";
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

// review helpers
function getAllReviews() { return JSON.parse(localStorage.getItem('reviews') || '[]'); }
function saveAllReviews(a) { return localStorage.setItem('reviews', JSON.stringify(a)); }

async function renderReviews() {
  reviewsList.innerHTML = ""; 
  try {
    const response = await fetch(`http://localhost:3000/api/reviews/${movieId}`);
    const reviewsForThisMovie = await response.json();

    if (!response.ok) {
        throw new Error('Não foi possível carregar as avaliações.');
    }
    
    let sumOfRatings = 0;

    if (reviewsForThisMovie.length === 0) {
        reviewsList.innerHTML = "<li>Nenhuma avaliação ainda. Seja o primeiro!</li>";
    }

    reviewsForThisMovie.forEach(review => {
        sumOfRatings += review.rating;

        const li = document.createElement('li');
        li.className = "review-item";
        li.innerHTML = `
        <header>
            <strong>${review.userName || 'Anônimo'}</strong>
            <span class="meta"> • Nota: ${review.rating}/5⭐</span>
        </header>
        <p>${review.comment}</p>
        `;
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


// intercepta submit
reviewForm.addEventListener('submit', async e => {
  e.preventDefault();

  const token = localStorage.getItem('framecode_token');
  if (!token) {
    alert('Você precisa estar logado para fazer uma avaliação.');
    window.location.href = 'login.html';
    return;
  }

  const sel = document.querySelector('input[name="star"]:checked');
  const rating = sel ? +sel.value : 0;
  const comment = document.getElementById('text').value.trim();
  
  if (!rating || !comment) {
    return alert('Selecione uma nota e escreva sua resenha.');
  }

  try {
    const response = await fetch('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token // Enviamos o token para o middleware de autenticação!
        },
        body: JSON.stringify({
            rating,
            comment,
            movieId: movieId, // Variável global que já tem o ID do filme
            movieTitle: currentMovieData?.title || 'Título desconhecido'
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao publicar avaliação.');
    }

    reviewForm.reset();
    renderReviews(); // Recarrega as avaliações da API para mostrar a nova

  } catch (error) {
    alert(`Erro: ${error.message}`);
  }
});

// quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', () => {
  if (!movieId) {
    movieTitle.textContent = "Filme não encontrado";
    return;
  }
  loadMovieDetails(movieId);
  loadMovieCredits(movieId);
  renderReviews();
});
