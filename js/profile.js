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
  const noRecentActivities = document.getElementById('no-recent-activities');
  let currentUserData = null;

  // --- FUNÇÕES DE LÓGICA ---

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
      const response = await fetch('http://localhost:3000/api/users/me/avatar', {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      avatarImg.src = `http://localhost:3000${data.avatarUrl}`;
      alert('Foto de perfil atualizada com sucesso!');
    } catch (error) {
      alert(`Erro ao atualizar a foto: ${error.message}`);
    }
  });

  // Função para buscar e preencher os dados do perfil
  async function loadProfile() {
    try {
      const response = await fetch('http://localhost:3000/api/users/me', { headers: { 'x-auth-token': token } });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao carregar perfil.');
      }
      const user = await response.json();
      currentUserData = user;
      displayNameEl.textContent = user.name;
      editNameInput.value = user.name;
      editEmailInput.value = user.email;
      if (user.avatar_url) {
        avatarImg.src = `http://localhost:3000${user.avatar_url}`;
      } else {
        avatarImg.src = 'assets/user icon.png';
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

  // Função para buscar e renderizar as avaliações
  async function loadMyReviews() {
    myReviewsList.innerHTML = "<li>Carregando avaliações...</li>";
    recentActivitiesEl.innerHTML = "";
    try {
      const response = await fetch('http://localhost:3000/api/reviews/user/me', { headers: { 'x-auth-token': token } });
      if (!response.ok) throw new Error('Falha ao carregar avaliações.');
      const reviews = await response.json();
      myReviewsList.innerHTML = "";
      if (reviews.length === 0) {
        if (noRecentActivities) noRecentActivities.style.display = "flex";
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
          <button class="edit-review-btn" data-review-id="${r.id}" data-comment="${r.comment.replace(/"/g, '&quot;')}" data-rating="${r.rating}"><img src="assets/edit.png"> Editar</button> 
          <button class="delete-review-btn" data-review-id="${r.id}"><img src="assets/delete.png"> Excluir</button>
        `;
        li.innerHTML = `
          <a href="movie.html?id=${r.movie_id}"><img src="${posterUrl}" alt="Pôster de ${r.movie_title}" class="review-poster"></a>
          <div class="review-content">
            <header>
              <strong><a href="movie.html?id=${r.movie_id}" class="review-movie-title">${r.movie_title}</a></strong>
              <div class="meta-and-actions">
                <div class="review-actions">${buttons}</div>
                <span class="meta"> • Nota: ${parseFloat(r.rating)}/5 ⭐</span>
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
              <a href="movie.html?id=${r.movie_id}"><img src="${posterUrl}" alt="${r.movie_title}"></a>
              <div class="static-stars">${generateStarsHTML(r.rating)}</div>
            `;
            recentActivitiesEl.appendChild(card);
        }
      }
    } catch (error) {
      myReviewsList.innerHTML = `<li>${error.message}</li>`;
    }
  }

  // Função para excluir uma avaliação
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

  // --- LÓGICA DE EVENTOS ---
  
  // Escuta pelo evento do modal para atualizar a lista
  document.addEventListener('reviewsUpdated', loadMyReviews);

  // Escuta por cliques nos botões de apagar na lista de avaliações
  myReviewsList.addEventListener('click', (e) => {
    const deleteButton = e.target.closest('.delete-review-btn');
    if (deleteButton) {
        const { reviewId } = deleteButton.dataset;
        deleteReviewOnProfile(reviewId);
    }
  });

  // Lógica dos botões de edição do formulário do perfil
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
    const headers = { 'Content-Type': 'application/json', 'x-auth-token': token };
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
            headers,
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

  // Lógica do botão de Sair
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('framecode_token');
      sessionStorage.removeItem('framecode_token');
      localStorage.removeItem('userAvatar');
      alert('Você saiu da sua conta.');
      window.location.href = 'login.html';
    });
  }

  // --- INICIALIZAÇÃO DA PÁGINA ---
  loadProfile();
  loadMyReviews();
});