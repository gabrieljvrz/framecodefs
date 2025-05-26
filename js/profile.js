// profile.js
const editProfileBtn = document.getElementById('editProfileBtn');
editProfileBtn.addEventListener('click', () => {
  editProfileBtn.textContent = 'Salvar Alterações';
})

// Verifica se o usuário está logado
const session = JSON.parse(localStorage.getItem("session"));
if (!session) {
  alert("Você precisa estar logado para acessar o perfil.");
  window.location.href = "login.html";
}

// Exibe nome e email do usuário
document.getElementById("displayName").textContent = session.name;
document.getElementById("displayEmail").textContent = session.email;

// Função para obter todas as reviews salvas
function getReviews() {
  return JSON.parse(localStorage.getItem("reviews")) || [];
}

// Carrega as avaliações do usuário
function loadMyReviews() {
  const reviews = getReviews().filter((r) => r.userEmail === session.email);
  const list = document.getElementById("myReviews");
  list.innerHTML = "";

  reviews.forEach((r, index) => {
    const li = document.createElement("li");
    li.className = "review-item";
    li.innerHTML = `
      <header>
        <strong>${r.movieTitle}</strong>
        <span class="meta"> • Nota: ${r.rating}⭐</span> <button onclick="editReview(${index})">✏️ Editar</button> <button onclick="deleteReview(${index})">❌ Excluir</button>
      </header>
      <p>${r.comment}</p>
      
    `;
    list.appendChild(li);
  });
}

// Editar avaliação
function editReview(index) {
  const reviews = getReviews().filter((r) => r.userEmail === session.email);
  const review = reviews[index];
  const newComment = prompt("Edite seu comentário:", review.comment);
  const newRating = prompt("Altere a nota (0 a 5):", review.rating);
  if (newComment !== null && newRating !== null) {
    review.comment = newComment;
    review.rating = Math.min(5, Math.max(0, parseInt(newRating)));
    const allReviews = getReviews();
    const reviewIndex = allReviews.findIndex(
      (r) =>
        r.userEmail === session.email &&
        r.movieId === review.movieId &&
        r.comment === review.comment
    );
    if (reviewIndex !== -1) {
      allReviews[reviewIndex] = review;
      localStorage.setItem("reviews", JSON.stringify(allReviews));
      loadMyReviews();
      loadRecentActivities();
    }
  }
}

// Excluir avaliação
function deleteReview(index) {
  if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;
  const userReviews = getReviews().filter((r) => r.userEmail === session.email);
  const review = userReviews[index];

  const allReviews = getReviews().filter((r) => {
    return !(
      r.userEmail === session.email &&
      r.movieId === review.movieId &&
      r.comment === review.comment
    );
  });

  localStorage.setItem("reviews", JSON.stringify(allReviews));
  loadMyReviews();
  loadRecentActivities();
}

// Carrega atividades recentes (últimas 6 avaliações)
async function loadRecentActivities() {
  const apiKey = "3b08d5dfa29024b5dcb74e8bff23f984";
  const imageBase = "https://image.tmdb.org/t/p/w200";
  const activitiesEl = document.getElementById("recentActivities");
  const reviews = getReviews()
    .filter((r) => r.userEmail === session.email)
    .slice(-6)
    .reverse();

  activitiesEl.innerHTML = "";

  for (let r of reviews) {
    let poster = "https://via.placeholder.com/200x300?text=Sem+Imagem";
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${r.movieId}?api_key=${apiKey}&language=pt-BR`
      );
      const data = await res.json();
      if (data.poster_path) {
        poster = `${imageBase}${data.poster_path}`;
      }
    } catch (e) {
      console.error("Erro ao buscar poster:", e);
    }

    const card = document.createElement("div");
    card.className = "activity-card";
    card.innerHTML = `
      <a href="movie.html?id=${r.movieId}">
        <img src="${poster}" alt="${r.movieTitle}">
      </a>
      <div class="stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
    `;
    activitiesEl.appendChild(card);
  }
}

// Executa carregamento ao abrir a página
loadMyReviews();
loadRecentActivities();