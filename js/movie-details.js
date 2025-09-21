// js/movie-details.js

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

const urlParams = new URLSearchParams(window.location.search);
const movieId   = urlParams.get("id");

// =================== FUNÇÃO parseJwt CORRIGIDA ===================
// Esta nova versão converte corretamente de Base64Url para Base64 antes de descodificar.
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
// =================================================================

const token = localStorage.getItem('framecode_token');
let loggedInUser = null;
if (token) {
  const decodedToken = parseJwt(token);
  // A estrutura aninhada estava correta, como vimos no jwt.io
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
        // Usamos texto simples nos botões
        if (loggedInUser.id == review.user_id) {
            buttons = `
              <button onclick="editReview(${review.id}, '${review.comment.replace(/'/g, "\\'")}', ${review.rating})"><img src="assets/edit.png"> Editar</button>
              <button onclick="deleteMyReview(${review.id})"><img src="assets/delete.png"> Excluir</button>
            `;
        } 
        else if (loggedInUser.role === 'admin') {
            buttons = `<button onclick="deleteAnyReview(${review.id})"><img src="assets/delete.png"> Excluir (Admin)</button>`;
        }
      }

      // Nova estrutura HTML para agrupar a nota e as ações
      li.innerHTML = `
        <header>
          <strong>${review.userName || 'Anônimo'}</strong>
          <div class="meta-and-actions">
            <div class="review-actions">${buttons}</div>
            <span class="meta"> Nota: ${review.rating}/5⭐</span>
          </div>
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
            body: JSON.stringify({
                rating, comment,
                movieId: movieId,
                movieTitle: currentMovieData?.title || 'Título desconhecido'
            })
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
  if (isNaN(newRating) || newRating < 1 || newRating > 5) {
    return alert("Nota inválida. Por favor, insira um número entre 1 e 5.");
  }
  
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
  // Pode remover o bloco de depuração se quiser, ou deixá-lo para futuros testes.
  loadMovieDetails(movieId);
  loadMovieCredits(movieId);
  renderReviews();
});