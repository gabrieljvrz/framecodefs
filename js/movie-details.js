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
const reviewSectionTitle = document.querySelector('.review-section h2');
const starRatingContainer = document.querySelector('.new-star-rating');
const ratingValueInput = document.getElementById('ratingValue');

const searchResultsSection = document.getElementById('searchResultsSection');
const searchResultsGrid = document.getElementById('searchResultsGrid');
const searchResultsTitle = document.getElementById('searchResultsTitle');

let currentMovieData = null;

// --- FUNÇÕES AUXILIARES ---
function createMovieCard(movie) {
  const card = document.createElement("div");
  card.classList.add("movie-card");
  const title = movie.title || movie.name || "Título Desconhecido";
  const posterPath = movie.poster_path ? `${imageBase}${movie.poster_path}` : "https://via.placeholder.com/500x750?text=Sem+Imagem";

  card.innerHTML = `
    <a href="movie.html?id=${movie.id}">
      <img src="${posterPath}" alt="${title}">
    </a>
    <h3>${title}</h3>
  `;
  return card;
}

function generateStarsHTML(rating) {
  let starsHTML = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  for (let i = 0; i < fullStars; i++) { starsHTML += `<img src="assets/star.png" alt="Estrela cheia">`; }
  if (hasHalfStar) { starsHTML += `<img src="assets/half-star.png" alt="Meia estrela">`; }
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) { starsHTML += `<img src="assets/empty-star.png" alt="Estrela vazia">`; }
  return starsHTML;
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// --- LÓGICA PRINCIPAL DA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId   = urlParams.get("id");
    const token = localStorage.getItem('framecode_token') || sessionStorage.getItem('framecode_token');
    let loggedInUser = null;

    if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.user) {
            loggedInUser = decodedToken.user;
        }
    }

    if (!movieId) {
        movieTitle.textContent = "Filme não encontrado";
        return;
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

    function setupStarRating() {
        if (!starRatingContainer) return;
        starRatingContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const starImg = document.createElement('img');
            starImg.src = 'assets/empty-star.png';
            starImg.dataset.value = i;
            starRatingContainer.appendChild(starImg);
        }
        const stars = Array.from(starRatingContainer.children);
        const updateStars = (rating) => {
            stars.forEach((star, index) => {
                const starValue = index + 1;
                if (rating >= starValue) star.src = 'assets/star.png';
                else if (rating >= starValue - 0.5) star.src = 'assets/half-star.png';
                else star.src = 'assets/empty-star.png';
            });
        };
        stars.forEach((star, index) => {
            star.addEventListener('mousemove', (e) => {
                const rect = star.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const isHalf = mouseX < rect.width / 2;
                updateStars(index + (isHalf ? 0.5 : 1));
            });
            star.addEventListener('click', (e) => {
                const rect = star.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const isHalf = mouseX < rect.width / 2;
                ratingValueInput.value = index + (isHalf ? 0.5 : 1);
                updateStars(parseFloat(ratingValueInput.value));
            });
        });
        starRatingContainer.addEventListener('mouseleave', () => updateStars(parseFloat(ratingValueInput.value) || 0));
        updateStars(parseFloat(ratingValueInput.value) || 0);
    }

    async function renderReviews() {
        reviewsList.innerHTML = "<li>Carregando avaliações...</li>";
        try {
            const response = await fetch(`http://localhost:3000/api/reviews/${movieId}`);
            const reviewsForThisMovie = await response.json();
            if (!response.ok) throw new Error('Não foi possível carregar as avaliações.');
            reviewsList.innerHTML = "";
            let sumOfRatings = 0;
            let userHasAlreadyReviewed = false;
            if (reviewsForThisMovie.length === 0) {
                reviewsList.innerHTML = "<h4 id='no-reviews-h4'>Nenhuma avaliação ainda. Seja o primeiro!</h4>";
            }
            reviewsForThisMovie.forEach(review => {
                sumOfRatings += review.rating;
                const avatarSrc = review.avatar_url ? `http://localhost:3000${review.avatar_url}` : 'assets/user icon.png';
                if (loggedInUser && loggedInUser.id == review.user_id) {
                    userHasAlreadyReviewed = true;
                }
                const li = document.createElement('li');
                li.className = "review-item";
                li.id = `review-${review.id}`;
                let buttons = '';
                if (loggedInUser) {
                    if (loggedInUser.id == review.user_id) {
                        buttons = `<button class="edit-review-btn" data-review-id="${review.id}" data-comment="${review.comment.replace(/"/g, '&quot;')}" data-rating="${review.rating}"><img src="assets/edit.png"> Editar</button>
                                   <button class="delete-review-btn" data-review-id="${review.id}"><img src="assets/delete.png"> Excluir</button>`;
                    } else if (loggedInUser.role === 'admin') {
                        buttons = `<button class="delete-review-btn admin-delete" data-review-id="${review.id}"><img src="assets/delete.png"> Excluir (Admin)</button>`;
                    }
                }
                let profileLinkHTML = '';
                if (loggedInUser && loggedInUser.id == review.user_id) {
                    // Se a avaliação for do usuário logado, o link não tem ID
                    profileLinkHTML = `<strong><a href="profile.html" class="profile-link">${review.userName || 'Anônimo'}</a></strong>`;
                } else {
                    // Se for de outro usuário, o link tem o ID
                    profileLinkHTML = `<strong><a href="profile.html?id=${review.user_id}" class="profile-link">${review.userName || 'Anônimo'}</a></strong>`;
                }

                li.innerHTML = `
                    <header>
                        <div class="review-author-info">
                            <img src="${avatarSrc}" alt="Avatar de ${review.userName}" class="review-avatar">
                            ${profileLinkHTML}
                        </div>
                        <div class="meta-and-actions">
                            <div class="review-actions">${buttons}</div>
                            <span class="meta"> • Nota: ${parseFloat(review.rating)}/5⭐</span>
                        </div>
                    </header>
                    <p>${review.comment}</p>
                `;
                reviewsList.appendChild(li);
            });
            if (reviewsForThisMovie.length > 0) {
                const avg = sumOfRatings / reviewsForThisMovie.length;
                const formattedAvg = parseFloat(avg.toFixed(1));
                avgRatingEl.innerHTML = `<div style="font-size: 1.5rem; font-weight: bold;">${formattedAvg}</div><div class="static-stars">${generateStarsHTML(formattedAvg)}</div>`;
            } else {
                avgRatingEl.textContent = '—';
            }
            if (userHasAlreadyReviewed) {
                reviewForm.style.display = 'none';
                if (reviewSectionTitle) reviewSectionTitle.textContent = '';
            } else if (loggedInUser) {
                reviewForm.style.display = 'flex';
                if (reviewSectionTitle) reviewSectionTitle.textContent = 'Deixe sua Avaliação:';
            } else {
                reviewForm.style.display = 'none';
                if (reviewSectionTitle) reviewSectionTitle.textContent = 'Faça login para deixar sua avaliação';
            }
        } catch (error) {
            reviewsList.innerHTML = `<li>Erro ao carregar avaliações: ${error.message}</li>`;
            avgRatingEl.textContent = '—';
        }
    }

    reviewForm.addEventListener('submit', async e => {
        e.preventDefault();
        const rating = parseFloat(ratingValueInput.value);
        const comment = document.getElementById('text').value.trim();
        if (rating === 0 || !comment) return alert('Selecione uma nota e escreva sua resenha.');
        try {
            const response = await fetch('http://localhost:3000/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ rating, comment, movieId: movieId, movieTitle: currentMovieData?.title || 'Título desconhecido' })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            reviewForm.reset();
            ratingValueInput.value = "0";
            setupStarRating();
            renderReviews();
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    });

    async function deleteReview(reviewId, isAdminDelete) {
        const confirmationText = isAdminDelete ? "ADMIN: Tem certeza que deseja excluir esta avaliação?" : "Tem certeza que deseja excluir sua avaliação?";
        if (!confirm(confirmationText)) return;
        const url = isAdminDelete ? `http://localhost:3000/api/reviews/${reviewId}` : `http://localhost:3000/api/reviews/me/${reviewId}`;
        try {
            const response = await fetch(url, {
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
    
    // --- EVENT LISTENERS GLOBAIS DA PÁGINA ---
    
    // Escuta por cliques na lista de avaliações para apagar
    reviewsList.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-review-btn');
        if (deleteButton) {
            const reviewId = deleteButton.dataset.reviewId;
            const isAdmin = deleteButton.classList.contains('admin-delete');
            deleteReview(reviewId, isAdmin);
        }
    });
    
    // Escuta pelo evento do modal para atualizar a lista
    document.addEventListener('reviewsUpdated', renderReviews);
    
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
                searchResultsSection.style.display = 'none';
                detailsContainer.style.display = 'block';
            }
        });
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => e.preventDefault());
        }
    }

    // --- INICIALIZAÇÃO ---
    loadMovieDetails(movieId);
    loadMovieCredits(movieId);
    renderReviews();
    setupStarRating();
});