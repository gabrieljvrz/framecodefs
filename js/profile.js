// Carrega elementos do DOM
const editProfileBtn = document.getElementById("editProfileBtn");
const displayNameEl = document.getElementById("displayName");

const editModeForm = document.getElementById("editMode"); // ✅ Agora controlamos o form todo
const editNameInput = document.getElementById("editName");
const editEmailInput = document.getElementById("editEmail");
const editPasswordInput = document.getElementById("editPassword");


// Elementos do avatar
const avatarImg = document.querySelector(".user-info .avatar img");
const changeAvatarBtn = document.getElementById("changeAvatarBtn");
const avatarInput = document.getElementById("avatarInput");

// Carrega avatar salvo (se existir)
const savedAvatar = localStorage.getItem("userAvatar");
if (savedAvatar) {
  avatarImg.src = savedAvatar;
}

// Ao clicar no botão, abre o seletor de arquivos
changeAvatarBtn.addEventListener("click", () => {
  avatarInput.click();
});

// Quando um arquivo é selecionado
avatarInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const newAvatarURL = e.target.result;
      avatarImg.src = newAvatarURL;
      localStorage.setItem("userAvatar", newAvatarURL); // Salva no localStorage
    };
    reader.readAsDataURL(file);
  } else {
    alert("Por favor, selecione uma imagem válida (jpg, png, etc).");
  }
});

// Obtém sessão do usuário
let session = JSON.parse(localStorage.getItem("session"));

if (!session) {
  alert("Você precisa estar logado para acessar o perfil.");
  window.location.href = "login.html";
}

// Preenche os campos com os dados da sessão
editNameInput.value = session.name;
editEmailInput.value = session.email;
editPasswordInput.value = "*********"; // Placeholder visual
displayNameEl.textContent = session.name;

// Estado de edição
let isEditing = false;

// Função do botão Editar/Salvar
editProfileBtn.addEventListener("click", () => {
  if (!isEditing) {
    // Mostrar o formulário inteiro
    editModeForm.style.display = "block";

    // Habilitar campos
    editNameInput.disabled = false;
    editEmailInput.disabled = false;
    editPasswordInput.disabled = false;
    editPasswordInput.value = ""; // Limpa placeholder

    editProfileBtn.textContent = "Salvar Alterações";
    isEditing = true;
  } else {
    const newName = editNameInput.value.trim();
    const newEmail = editEmailInput.value.trim();
    const newPassword = editPasswordInput.value.trim();

    if (!newName || !newEmail) {
      alert("Nome e e-mail são obrigatórios!");
      return;
    }

    // Atualiza a sessão
    session.name = newName;
    session.email = newEmail;
    if (newPassword) session.password = newPassword;

    localStorage.setItem("session", JSON.stringify(session));
    alert("Perfil atualizado com sucesso!");

    // Desabilitar campos
    editNameInput.disabled = true;
    editEmailInput.disabled = true;
    editPasswordInput.disabled = true;
    editPasswordInput.value = "*********"; // Restaura placeholder visual

    editProfileBtn.textContent = "Editar Perfil";
    isEditing = false;

    // Atualiza exibição do nome
    displayNameEl.textContent = newName;
  }
});

// ====== RESTANTE DO CÓDIGO ======
function getReviews() {
  return JSON.parse(localStorage.getItem("reviews")) || [];
}

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
        <span class="meta"> • Nota: ${r.rating}⭐</span>
        <button onclick="editReview(${index})">✏️ Editar</button>
        <button onclick="deleteReview(${index})">❌ Excluir</button>
      </header>
      <p>${r.comment}</p>
    `;
    list.appendChild(li);
  });
}

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
        `https://api.themoviedb.org/3/movie/ ${r.movieId}?api_key=${apiKey}&language=pt-BR`
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