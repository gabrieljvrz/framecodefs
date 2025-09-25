document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('framecode_token') || sessionStorage.getItem('framecode_token');
  if (!token) {
    alert("Você precisa estar logado para acessar o perfil.");
    window.location.href = "login.html";
    return;
  }

  // --- ELEMENTOS DO DOM ---
  const displayNameEl = document.getElementById("displayName");
  const editModeForm = document.getElementById("editMode");
  const editNameInput = document.getElementById("editName");
  const editEmailInput = document.getElementById("editEmail");
  const editPasswordInput = document.getElementById("editPassword");
  const editProfileBtn = document.getElementById("editProfileBtn");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const backProfileBtn = document.getElementById("backProfileBtn");
  const avatarImg = document.querySelector(".user-info .avatar img");
  const changeAvatarBtn = document.getElementById("changeAvatarBtn");
  const avatarInput = document.getElementById("avatarInput");
  const myReviewsList = document.getElementById("myReviews");
  const recentActivitiesEl = document.getElementById("recentActivities");
  const logoutBtn = document.getElementById('logoutBtn');
  const noRecentActivities = document.getElementById('no-recent-activities')
  let currentUserData = null;
  
  // --- FUNÇÕES DE LÓGICA ---

  // Adicione esta função a ambos os ficheiros JS

function generateStarsHTML(rating) {
  let starsHTML = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    starsHTML += `<img src="assets/star.png" alt="Estrela cheia">`;
  }
  if (hasHalfStar) {
    starsHTML += `<img src="assets/half-star.png" alt="Meia estrela">`;
  }
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += `<img src="assets/empty-star.png" alt="Estrela vazia">`;
  }
  return starsHTML;
}

  // Lógica da foto de perfil (Atualizada para usar a API)
  changeAvatarBtn.addEventListener("click", () => {
    avatarInput.click();
  });

  avatarInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      return alert("Por favor, selecione um ficheiro de imagem válido.");
    }
    
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      // O cabeçalho 'Content-Type' não é definido aqui, o navegador faz isso automaticamente
      const response = await fetch('http://localhost:3000/api/users/me/avatar', {
        method: 'POST',
        headers: {
          'x-auth-token': token // Enviamos apenas o token de autenticação
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Atualiza a imagem na página com a nova URL retornada pelo servidor
      avatarImg.src = `http://localhost:3000${data.avatarUrl}`;
      alert('Foto de perfil atualizada com sucesso!');
    } catch (error) {
      alert(`Erro ao atualizar a foto: ${error.message}`);
    }
  });

  // Função para buscar e preencher os dados do perfil via API (Atualizada para carregar avatar)
  async function loadProfile() {
    try {
      const response = await fetch('http://localhost:3000/api/users/me', { 
        headers: { 'x-auth-token': token } 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao carregar perfil.');
      }
      
      const user = await response.json();
      currentUserData = user;

      displayNameEl.textContent = user.name;
      editNameInput.value = user.name;
      editEmailInput.value = user.email;

      // Carrega o avatar do banco de dados
      if (user.avatar_url) {
        avatarImg.src = `http://localhost:3000${user.avatar_url}`;
      } else {
        avatarImg.src = 'assets/user icon.png'; // Imagem padrão
      }

    } catch (error) {
      alert(error.message);
      if (error.message.includes('inválido') || error.message.includes('negado')) {
        localStorage.removeItem('framecode_token');
        sessionStorage.removeItem('framecode_token');
        window.location.href = 'login.html';
      }
    }
  }

  // Função para buscar e renderizar as avaliações do usuário via API
  // js/profile.js

// SUBSTITUA A SUA FUNÇÃO loadMyReviews INTEIRA POR ESTA:
// js/profile.js -> Substitua a sua função loadMyReviews por esta

async function loadMyReviews() {
  myReviewsList.innerHTML = "<li>Carregando avaliações...</li>";
  recentActivitiesEl.innerHTML = "";

  // CORREÇÃO: Definimos a variável 'headers' aqui dentro para garantir que ela exista.
  const headers = { 'Content-Type': 'application/json', 'x-auth-token': token };

  try {
    const response = await fetch('http://localhost:3000/api/reviews/user/me', { headers });
    if (!response.ok) throw new Error('Falha ao carregar avaliações.');

    const reviews = await response.json();
    myReviewsList.innerHTML = "";
    
    if (reviews.length === 0) {
      if(document.getElementById('no-recent-activities')) {
        document.getElementById('no-recent-activities').style.display = "flex";
      }
      myReviewsList.innerHTML = "<h4 id='no-reviews-h4'>Você ainda não fez nenhuma avaliação.</h4>";
      return;
    }
    
    const apiKey = "3b08d5dfa29024b5dcb74e8bff23f984"; 
    const imageBase = "https://image.tmdb.org/t/p/w200";
    const recentReviews = reviews.slice(0, 7);

    for (const r of reviews) {
      let posterUrl = "https://via.placeholder.com/100x150?text=Sem+Imagem";
      try {
          const movieRes = await fetch(`https://api.themoviedb.org/3/movie/${r.movie_id}?api_key=${apiKey}&language=pt-BR`);
          const movieData = await movieRes.json();
          if(movieData.poster_path) posterUrl = `${imageBase}${movieData.poster_path}`;
      } catch(e) { console.error("Erro ao buscar poster"); }

      const li = document.createElement("li");
      li.className = "review-item";
      li.id = `my-review-${r.id}`;

      const buttons = `
        <button class="edit-review-btn" data-review-id="${r.id}" data-comment="${r.comment.replace(/"/g, '&quot;')}" data-rating="${r.rating}"><img src="assets/edit.png"> Editar </button>
        <button class="delete-review-btn" data-review-id="${r.id}"><img src="assets/delete.png"> Excluir</button>
      `;
      //<div class="static-stars">${generateStarsHTML(r.rating)}</div> <span class="meta"> • ${parseFloat(r.rating)}/5 </span>
      li.innerHTML = `
        <a href="movie.html?id=${r.movie_id}">
          <img src="${posterUrl}" alt="Pôster de ${r.movie_title}" class="review-poster">
        </a>
        <div class="review-content">
          <header>
            <strong>
              <a href="movie.html?id=${r.movie_id}" class="review-movie-title">${r.movie_title}</a>
            </strong>
            <div class="meta-and-actions">
            <div class="review-actions">${buttons}</div>
            <div class="static-stars"><span class="meta"> ${parseFloat(r.rating)}/5 </span> ${generateStarsHTML(r.rating)}</div>
            </div>
          </header>
          <p>${r.comment}</p>
        </div>
      `;
      myReviewsList.appendChild(li);

      if(recentReviews.find(rev => rev.id === r.id)) {
          const card = document.createElement("div");
          card.className = "activity-card";
          card.innerHTML = `
            <a href="movie.html?id=${r.movie_id}">
              <img src="${posterUrl}" alt="${r.movie_title}">
            </a>
            <div class="static-stars">${generateStarsHTML(r.rating)}</div>
          `;
          recentActivitiesEl.appendChild(card);
      }
    }
    addEventListenersToReviewButtons();
  } catch (error) {
    myReviewsList.innerHTML = `<li>${error.message}</li>`;
  }
}
  
  function addEventListenersToReviewButtons() {
    document.querySelectorAll('.edit-review-btn').forEach(button => {
      button.replaceWith(button.cloneNode(true));
    });
    document.querySelectorAll('.edit-review-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const { reviewId, comment, rating } = e.currentTarget.dataset;
            editReviewOnProfile(reviewId, comment, rating);
        });
    });
    document.querySelectorAll('.delete-review-btn').forEach(button => {
      button.replaceWith(button.cloneNode(true));
    });
    document.querySelectorAll('.delete-review-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const { reviewId } = e.currentTarget.dataset;
            deleteReviewOnProfile(reviewId);
        });
    });
  }

  async function editReviewOnProfile(reviewId, oldComment, oldRating) {
    const newComment = prompt("Edite seu comentário:", oldComment);
    if (newComment === null || newComment.trim() === '') return;
    const newRatingStr = prompt("Altere a nota (1 a 5):", oldRating);
    if (newRatingStr === null) return;
    const newRating = parseFloat(newRatingStr.replace(',', '.'));
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
      loadMyReviews();
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  }

  async function deleteReviewOnProfile(reviewId) {
    if (!confirm("Tem certeza que deseja excluir sua avaliação?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/reviews/me/${reviewId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      alert('Avaliação excluída!');
      loadMyReviews();
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  }

  editProfileBtn.addEventListener("click", () => {
    editModeForm.style.display = "block";
    editNameInput.disabled = false;
    editEmailInput.disabled = false;
    editPasswordInput.disabled = false;
    editPasswordInput.value = "";
    editPasswordInput.placeholder = "Nova senha (deixe em branco para não alterar)";
    editProfileBtn.style.display = "none";
    saveProfileBtn.style.display = "inline-block";
    backProfileBtn.style.display = "inline-block";
  });
  
  backProfileBtn.addEventListener("click", () => {
    editModeForm.style.display = "none";
    editNameInput.disabled = true;
    editEmailInput.disabled = true;
    editPasswordInput.disabled = true;
    if(currentUserData) {
        editNameInput.value = currentUserData.name;
        editEmailInput.value = currentUserData.email;
        editPasswordInput.value = "";
        editPasswordInput.placeholder = "Nova senha (opcional)";
    }
    editProfileBtn.style.display = "inline-block";
    saveProfileBtn.style.display = "none";
    backProfileBtn.style.display = "none";
  });

  editModeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = editNameInput.value.trim();
    const newEmail = editEmailInput.value.trim();
    const newPassword = editPasswordInput.value.trim();
    if (!newName || !newEmail) {
      alert("Nome e e-mail são obrigatórios!");
      return;
    }
    const body = { name: newName, email: newEmail };
    if (newPassword && newPassword.length > 0) {
      if (newPassword.length < 6) {
        alert("A nova senha deve ter pelo menos 6 caracteres.");
        return;
      }
      body.password = newPassword;
    }
    try {
        const response = await fetch('http://localhost:3000/api/users/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if(!response.ok) throw new Error(data.message || "Erro desconhecido.");
        alert('Perfil atualizado com sucesso!');
        await loadProfile();
        backProfileBtn.click();
    } catch(error) {
        alert(`Erro ao atualizar: ${error.message}`);
    }
  });

  // --- INICIALIZAÇÃO E BOTÃO DE SAIR ---
  loadProfile();
  loadMyReviews();
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('framecode_token');
      sessionStorage.removeItem('framecode_token');
      localStorage.removeItem('userAvatar'); // Remove o avatar do localStorage também
      alert('Você saiu da sua conta.');
      window.location.href = 'login.html';
    });
  }
});