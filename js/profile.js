// Carrega elementos do DOM
const editProfileBtn = document.getElementById("editProfileBtn");
const displayNameEl = document.getElementById("displayName");

const editModeForm = document.getElementById("editMode"); // ✅ Agora controlamos o form todo
const editNameInput = document.getElementById("editName");
const editEmailInput = document.getElementById("editEmail");
const editPasswordInput = document.getElementById("editPassword");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const backProfileBtn = document.getElementById("backProfileBtn"); // Novo botão Voltar

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

// Garante que os campos comecem desabilitados
editNameInput.disabled = true;
editEmailInput.disabled = true;
editPasswordInput.disabled = true;

// Garante que os botões Salvar e Voltar comecem escondidos
saveProfileBtn.style.display = "none";
backProfileBtn.style.display = "none"; // Esconde o botão Voltar inicialmente

// Estado de edição
let isEditing = false;

// Função do botão Editar
editProfileBtn.addEventListener("click", () => {
  // Mostrar o formulário inteiro
  editModeForm.style.display = "block";

  // Habilitar campos
  editNameInput.disabled = false;
  editEmailInput.disabled = false;
  editPasswordInput.disabled = false;
  editPasswordInput.value = ""; // Limpa placeholder

  editProfileBtn.style.display = "none"; // Esconde o botão de editar
  saveProfileBtn.style.display = "inline-block"; // Mostra o botão de salvar
  backProfileBtn.style.display = "inline-block"; // Mostra o botão de voltar
  saveProfileBtn.classList.remove("hidden"); 
  backProfileBtn.classList.remove("hidden");
  isEditing = true;
});

// Função do botão Salvar
saveProfileBtn.addEventListener("click", () => {
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

  editProfileBtn.style.display = "inline-block"; // Mostra o botão de editar
  saveProfileBtn.style.display = "none"; // Esconde o botão de salvar
  backProfileBtn.style.display = "none"; // Esconde o botão de voltar
  isEditing = false;

  // Atualiza exibição do nome
  displayNameEl.textContent = newName;
});

// Função do botão Voltar
backProfileBtn.addEventListener("click", () => {
  // Esconder o formulário
  editModeForm.style.display = "none";

  // Restaurar valores originais dos campos e desabilitá-los
  editNameInput.value = session.name;
  editEmailInput.value = session.email;
  editPasswordInput.value = "*********"; // Placeholder visual

  editNameInput.disabled = true;
  editEmailInput.disabled = true;
  editPasswordInput.disabled = true;

  editProfileBtn.style.display = "inline-block"; // Mostra o botão de editar
  saveProfileBtn.style.display = "none"; // Esconde o botão de salvar
  backProfileBtn.style.display = "none"; // Esconde o botão de voltar
  isEditing = false;
});

// ====== RESTANTE DO CÓDIGO ======
function getReviews() {
  return JSON.parse(localStorage.getItem("reviews")) || [];
}

async function loadMyReviews() { // Modificado para async
  const reviews = getReviews().filter((r) => r.userEmail === session.email);
  const list = document.getElementById("myReviews");
  list.innerHTML = "";

  const apiKey = "3b08d5dfa29024b5dcb74e8bff23f984"; // Adicionado apiKey
  const imageBase = "https://image.tmdb.org/t/p/w200"; // Adicionado imageBase, w200 é um bom tamanho aqui

  for (const r of reviews) { // Modificado para for...of para usar await
    let posterUrl = "https://via.placeholder.com/100x150?text=Sem+Imagem"; // Placeholder
    try {
      const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${r.movieId}?api_key=${apiKey}&language=pt-BR`;
      const res = await fetch(movieDetailsUrl);
      const movieData = await res.json();
      if (movieData.poster_path) {
        posterUrl = `${imageBase}${movieData.poster_path}`;
      }
    } catch (e) {
      console.error("Erro ao buscar poster para review:", e);
    }

    const li = document.createElement("li");
    li.className = "review-item";
    // Adicionado img para o poster
    li.innerHTML = `
      <img src="${posterUrl}" alt="Pôster de ${r.movieTitle}" style="width: 80px; height: auto; margin-right: 15px; vertical-align: top;">
      <div style="display: inline-block; vertical-align: top; width: calc(100% - 100px);">
        <header>
          <strong>${r.movieTitle}</strong>
          <span class="meta"> • Nota: ${r.rating}/5 ⭐</span>
          <button onclick="editReview(${reviews.indexOf(r)})">✏️ Editar</button>
          <button onclick="deleteReview(${reviews.indexOf(r)})">❌ Excluir</button>
        </header>
        <p>${r.comment}</p>
      </div>
    `;
    list.appendChild(li);
  }
}

function editReview(indexInFilteredArray) {
  const allUserReviews = getReviews().filter((r) => r.userEmail === session.email);
  const reviewToEdit = allUserReviews[indexInFilteredArray];

  // Encontrar a review original no array completo de reviews para obter o índice global correto
  const allReviewsOriginal = getReviews();
  const globalReviewIndex = allReviewsOriginal.findIndex(
    (r_global) =>
      r_global.userEmail === reviewToEdit.userEmail &&
      r_global.movieId === reviewToEdit.movieId &&
      r_global.comment === reviewToEdit.comment && // Pode precisar de um ID único de review se comentários puderem ser iguais
      r_global.rating === reviewToEdit.rating
  );

  if (globalReviewIndex === -1) {
    alert("Erro ao encontrar a avaliação para editar.");
    return;
  }
  
  const review = allReviewsOriginal[globalReviewIndex]; // Usar a referência do array original

  const newComment = prompt("Edite seu comentário:", review.comment);
  const newRating = prompt("Altere a nota (0 a 5):", review.rating);

  if (newComment !== null && newRating !== null) {
    const parsedRating = parseInt(newRating);
    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
      alert("Nota inválida. Por favor, insira um número entre 0 e 5.");
      return;
    }
    allReviewsOriginal[globalReviewIndex].comment = newComment;
    allReviewsOriginal[globalReviewIndex].rating = Math.min(5, Math.max(0, parsedRating));
    
    localStorage.setItem("reviews", JSON.stringify(allReviewsOriginal));
    loadMyReviews();
    loadRecentActivities(); // Recarrega atividades recentes também
  }
}

function deleteReview(indexInFilteredArray) {
  if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;

  const allUserReviews = getReviews().filter((r) => r.userEmail === session.email);
  const reviewToDelete = allUserReviews[indexInFilteredArray];

  const allReviewsOriginal = getReviews();
  const updatedReviews = allReviewsOriginal.filter(
    (r_global) =>
      !(
        r_global.userEmail === reviewToDelete.userEmail &&
        r_global.movieId === reviewToDelete.movieId &&
        r_global.comment === reviewToDelete.comment && // Pode precisar de um ID único de review
        r_global.rating === reviewToDelete.rating
      )
  );

  localStorage.setItem("reviews", JSON.stringify(updatedReviews));
  loadMyReviews();
  loadRecentActivities(); // Recarrega atividades recentes também
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