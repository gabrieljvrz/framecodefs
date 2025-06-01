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

function renderReviews() {
  const allReviews = getAllReviews();
  const reviewsForThisMovie = allReviews.filter(r => String(r.movieId) === movieId);
  reviewsList.innerHTML = "";
  let sumOfRatings = 0;

  const loggedInUserSession = JSON.parse(localStorage.getItem('session'));
  const loggedInUserEmail = loggedInUserSession?.email;
  // Assumindo que o avatar do usuário logado está em 'userAvatar'
  const loggedInUserAvatar = localStorage.getItem('userAvatar'); 

  reviewsForThisMovie.forEach(review => {
    sumOfRatings += review.rating;

    let avatarSrc = 'assets/user icon.png'; // Placeholder padrão
    // Verifica se a review é do usuário logado e se ele tem avatar
    if (review.userEmail === loggedInUserEmail && loggedInUserAvatar) {
      avatarSrc = loggedInUserAvatar;
    } 
    // Se não for o usuário logado, ou se ele não tiver avatar, usa o placeholder.
    // No futuro, você poderia adicionar uma lógica para buscar avatares de outros usuários se eles forem armazenados de forma diferente.
    // Exemplo: const specificUserAvatar = localStorage.getItem(`userAvatar_${review.userEmail}`);
    // if (specificUserAvatar) avatarSrc = specificUserAvatar;

    const li = document.createElement('li');
    li.className = "review-item";
    // Adiciona a tag <img> para o avatar
    li.innerHTML = `
      <header>
        <img src="${avatarSrc}" alt="Avatar de ${review.userName || review.userEmail || 'Anônimo'}" class="review-avatar" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px; vertical-align: middle;">
        <strong>${review.userName || review.userEmail || 'Anônimo'}</strong>
        <span class="meta"> • Nota: ${review.rating}/5⭐</span>
      </header>
      <p>${review.comment}</p>
    `;
    reviewsList.appendChild(li);
  });

  if (reviewsForThisMovie.length) {
    const avg = Math.round(sumOfRatings / reviewsForThisMovie.length);
    avgRatingEl.textContent = '★'.repeat(avg) + '☆'.repeat(5 - avg);
  } else {
    avgRatingEl.textContent = '—';
  }
}

// intercepta submit
reviewForm.addEventListener('submit', e => {
  e.preventDefault();
  const sel     = document.querySelector('input[name="star"]:checked');
  const rating  = sel ? +sel.value : 0;
  const comment = document.getElementById('text').value.trim();
  if (!rating||!comment) {
    return alert('Selecione uma nota e escreva sua resenha.');
  }
  const session = JSON.parse(localStorage.getItem('session') || 'null');
  const review  = {
    movieId,
    movieTitle: currentMovieData?.title||'',
    rating,
    comment,
    userEmail: session?.email,
    userName:  session?.name
  };
  const all = getAllReviews();
  all.push(review);
  saveAllReviews(all);
  reviewForm.reset();
  renderReviews();
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
