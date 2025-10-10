document.addEventListener('DOMContentLoaded', () => {
  // --- 1. ANÁLISE INICIAL (LÓGICA CORRIGIDA E REORDENADA) ---
  const token = localStorage.getItem('framecode_token') || sessionStorage.getItem('framecode_token');
  
  function parseJwt(token) {
    if (!token) return null;
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
  
  const decodedToken = parseJwt(token);
  const loggedInUser = decodedToken ? decodedToken.user : null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const profileIdFromUrl = urlParams.get('id');
  
  // A forma mais clara de decidir: se não há ID na URL, é o meu perfil.
  const isMyProfile = !profileIdFromUrl;
  
  const userIdToFetch = isMyProfile ? loggedInUser?.id : profileIdFromUrl;
  
  // Se o utilizador tenta ver o seu próprio perfil mas não está logado (ou tem token inválido)
  if (isMyProfile && !loggedInUser) {
    alert("Você precisa estar logado para acessar o seu perfil.", 'error');
    window.location.href = "login.html";
    return; // Para a execução do script
  }

  // Se o ID na URL é inválido ou não foi possível determinar um utilizador
  if (!userIdToFetch) {
    alert("Usuário não encontrado.");
    window.location.href = "index.html";
    return; // Para a execução do script
  }
  
  // --- 2. ELEMENTOS DO DOM (sem alterações) ---
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
  const adminBtn = document.getElementById('adminBtn');
  const noRecentActivities = document.getElementById('no-recent-activities');
  const myProfileIcon = document.getElementById('myProfileIcon');
  const favoritesGrid = document.getElementById('favoritesGrid');
  const favPrevBtn = document.getElementById('favPrevBtn');
  const favNextBtn = document.getElementById('favNextBtn');
  const noFavoritesMessage = document.getElementById('no-favorites');
  const myReviewsPagination = document.getElementById('myReviewsPagination');
  const myReviewsPrevBtn = document.getElementById('myReviewsPrevBtn');
  const myReviewsNextBtn = document.getElementById('myReviewsNextBtn');
  const myReviewsPageInfo = document.getElementById('myReviewsPageInfo');

  let currentUserData = null;

  let myReviewsCurrentPage = 1;
  const reviewsPerPage = 10;

  // --- 3. FUNÇÕES DE LÓGICA ---

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

  async function loadRecentActivities() {
      recentActivitiesEl.innerHTML = ""; // Limpa a área
      try {
          const response = await fetch(`http://localhost:3000/api/reviews/user/${userIdToFetch}/recent`);
          if (!response.ok) throw new Error('Falha ao carregar atividades recentes.');
          
          const recentReviews = await response.json();

          if (recentReviews.length === 0) {
              if (noRecentActivities) noRecentActivities.style.display = "flex";
              return;
          }

          if (noRecentActivities) noRecentActivities.style.display = "none";

          const apiKey = "3b08d5dfa29024b5dcb74e8bff23f984"; 
          const imageBase = "https://image.tmdb.org/t/p/w200";

          for (const r of recentReviews) {
              let posterUrl = "https://via.placeholder.com/200x300?text=Sem+Imagem";
              try {
                  const movieRes = await fetch(`https://api.themoviedb.org/3/movie/${r.movie_id}?api_key=${apiKey}&language=pt-BR`);
                  const movieData = await movieRes.json();
                  if(movieData.poster_path) posterUrl = `${imageBase}${movieData.poster_path}`;
              } catch(e) { console.error("Erro ao buscar poster para atividade recente:", e); }

              const card = document.createElement("div");
              card.className = "activity-card";
              card.innerHTML = `
                  <a href="movie.html?id=${r.movie_id}"><img src="${posterUrl}" alt="${r.movie_title}"></a>
                  <div class="static-stars">${generateStarsHTML(r.rating)}</div>
              `;
              recentActivitiesEl.appendChild(card);
          }

      } catch (error) {
          console.error(error);
          if (noRecentActivities) noRecentActivities.style.display = "flex";
      }
  }

  async function loadProfileData() {
    const url = isMyProfile ? `http://localhost:3000/api/users/me` : `http://localhost:3000/api/users/${userIdToFetch}`;
    const options = isMyProfile ? { headers: { 'x-auth-token': token } } : {};

    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Falha ao carregar perfil.');
      
      const user = await response.json();
      currentUserData = user;

      displayNameEl.textContent = user.name;
      avatarImg.src = user.avatar_url ? `http://localhost:3000${user.avatar_url}` : 'assets/user icon.png';
      
      if (isMyProfile) {
        editNameInput.value = user.name;
        editEmailInput.value = user.email;
        if (adminBtn && user.role === 'admin') {
          adminBtn.style.display = 'inline-block';
        }
      }
    } catch (error) {
      console.error(error);
      displayNameEl.textContent = "Usuário não encontrado";
    }
  }

// Substitua a sua função 'loadUserReviews' inteira por esta:
    async function loadUserReviews(page = 1) {
    myReviewsCurrentPage = page;
    const url = isMyProfile 
        ? `http://localhost:3000/api/reviews/user/me?page=${page}&limit=${reviewsPerPage}` 
        : `http://localhost:3000/api/reviews/user/${userIdToFetch}?page=${page}&limit=${reviewsPerPage}`;
    
    const options = { headers: {} };
    if (token) {
        options.headers['x-auth-token'] = token;
    }
    
    myReviewsList.innerHTML = "<li>Carregando avaliações...</li>";
    // REMOVEMOS: a linha que limpava recentActivitiesEl
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('Falha ao carregar avaliações.');
        
        const data = await response.json();
        const reviews = data.reviews;
        
        myReviewsList.innerHTML = "";
        
        if (reviews.length === 0 && page === 1) { // Só mostra mensagem se não houver reviews na primeira página
            myReviewsList.innerHTML = `<h4 id='no-reviews-h4'>${isMyProfile ? 'Você' : 'Este usuário'} ainda não fez nenhuma avaliação.</h4>`;
            myReviewsPagination.style.display = 'none';
            return;
        } else {
             myReviewsPagination.style.display = 'flex';
        }
        
        for (const r of reviews) {
            const li = document.createElement("li");
            li.className = "review-item";
            li.id = `my-review-${r.id}`;

            let buttons = '';
            if (isMyProfile) {
                buttons = `<button class="edit-review-btn" data-review-id="${r.id}" data-comment="${r.comment.replace(/"/g, '&quot;')}" data-rating="${r.rating}"><img src="assets/edit.png"> Editar</button> 
                           <button class="delete-review-btn" data-review-id="${r.id}"><img src="assets/delete.png"> Excluir</button>`;
            } else if (loggedInUser && loggedInUser.role === 'admin' && !isMyProfile) {
                buttons = `<button class="delete-review-btn admin-delete" data-review-id="${r.id}"><img src="assets/delete.png"> Excluir (Admin)</button>`;
            }

            const likeBtnClass = r.user_has_liked ? 'like-btn liked' : 'like-btn';
            const likeBtnDisabled = !loggedInUser ? 'disabled' : '';
            let posterUrl = "https://via.placeholder.com/100x150?text=Sem+Imagem";
            
            try {
                const apiKey = "3b08d5dfa29024b5dcb74e8bff23f984"; 
                const imageBase = "https://image.tmdb.org/t/p/w200";
                const movieRes = await fetch(`https://api.themoviedb.org/3/movie/${r.movie_id}?api_key=${apiKey}&language=pt-BR`);
                const movieData = await movieRes.json();
                if(movieData.poster_path) posterUrl = `${imageBase}${movieData.poster_path}`;
            } catch(e) { console.error("Erro ao buscar poster"); }

            li.innerHTML = `
                <a href="movie.html?id=${r.movie_id}"><img src="${posterUrl}" alt="Pôster de ${r.movie_title}" class="review-poster"></a>
                <div class="review-content">
                    <header>
                        <strong><a href="movie.html?id=${r.movie_id}" class="review-movie-title">${r.movie_title}</a></strong>
                        <div class="meta-and-actions">
                            <div class="like-section">
                                <button class="${likeBtnClass}" data-review-id="${r.id}" ${likeBtnDisabled}>❤</button>
                                <span id="like-count-${r.id}">${r.like_count || 0}</span>
                            </div>
                            <span class="meta"> ${parseFloat(r.rating)}/5 ⭐</span>
                            <div class="review-actions">${buttons}</div>
                        </div>
                    </header>
                    <p>${r.comment}</p>
                </div>
            `;
            myReviewsList.appendChild(li);
        }
        
        updateMyReviewsPagination(data.currentPage, data.totalPages);
    } catch (error) {
        myReviewsList.innerHTML = `<li>${error.message}</li>`;
    }
}
    
    // --- ADICIONE esta nova função ---
    function updateMyReviewsPagination(currentPage, totalPages) {
        if (totalPages <= 1) {
            myReviewsPagination.style.display = 'none';
            return;
        }

        myReviewsPageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        myReviewsPrevBtn.style.display = currentPage > 1 ? 'inline-block' : 'none';
        myReviewsNextBtn.style.display = currentPage < totalPages ? 'inline-block' : 'none';
    }

  // ================== LÓGICA DE FAVORITOS (COM PEQUENA ALTERAÇÃO) ==================
  let allFavorites = [];
  let favoritesCurrentPage = 0;
  const favoritesPerPage = 7;

  async function loadFavorites() {
      const url = isMyProfile 
          ? `http://localhost:3000/api/favorites` 
          : `http://localhost:3000/api/favorites/user/${userIdToFetch}`;
      
      const options = isMyProfile ? { headers: { 'x-auth-token': token } } : {};

      try {
          const response = await fetch(url, options);
          if (!response.ok) throw new Error('Falha ao carregar favoritos.');
          
          allFavorites = await response.json();
          
          if (allFavorites.length > 0) {
              document.querySelector('.favorites-section').style.display = 'block';
              displayFavoritePage();
          } else {
              document.querySelector('.favorites-section').style.display = 'none';
          }
      } catch (error) {
          console.error(error);
          document.querySelector('.favorites-section').style.display = 'none';
      }
  }

  function displayFavoritePage() {
    if (!favoritesGrid) return;

    favoritesGrid.innerHTML = '';
    const isMobile = window.innerWidth <= 768;

    // Se for mobile, mostra todos os filmes para o utilizador deslizar.
    // Se for desktop, "corta" a lista para a página atual.
    const moviesToDisplay = isMobile 
        ? allFavorites 
        : allFavorites.slice(favoritesCurrentPage * favoritesPerPage, (favoritesCurrentPage * favoritesPerPage) + favoritesPerPage);

    moviesToDisplay.forEach(fav => {
        const posterPath = fav.movie_poster_path ? `https://image.tmdb.org/t/p/w200${fav.movie_poster_path}` : "https://via.placeholder.com/200x300?text=Sem+Imagem";
        const card = document.createElement("div");
        card.className = "activity-card";
        card.innerHTML = `<a href="movie.html?id=${fav.movie_id}"><img src="${posterPath}" alt="${fav.movie_title}"></a>`;
        favoritesGrid.appendChild(card);
    });

    // No Desktop, controla a visibilidade dos botões de paginação
    if (!isMobile) {
        favPrevBtn.style.display = favoritesCurrentPage === 0 ? 'none' : 'flex';
        const end = (favoritesCurrentPage + 1) * favoritesPerPage;
        favNextBtn.style.display = end >= allFavorites.length ? 'none' : 'flex';
    } else {
      favPrevBtn.style.display = 'none';
      favNextBtn.style.display = 'none';
    }
  }
  // =======================================================================

  // --- 4. LÓGICA DE EVENTOS ---
  
  document.addEventListener('reviewsUpdated', loadUserReviews);

  // CORREÇÃO: Eventos de paginação movidos para fora do 'if (isMyProfile)'
  if (favPrevBtn) {
      favPrevBtn.addEventListener('click', () => {
          if (favoritesCurrentPage > 0) {
              favoritesCurrentPage--;
              displayFavoritePage();
          }
      });
  }
  
  if (favNextBtn) {
      favNextBtn.addEventListener('click', () => {
          const maxPage = Math.ceil(allFavorites.length / favoritesPerPage) - 1;
          if (favoritesCurrentPage < maxPage) {
              favoritesCurrentPage++;
              displayFavoritePage();
          }
      });
  }
  
  document.addEventListener('reviewsUpdated', loadUserReviews);

  if (isMyProfile) {
    changeAvatarBtn.style.display = 'block';
    editProfileBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'inline-block';
    
    if (myProfileIcon) myProfileIcon.style.display = 'none';

        // EVENTOS PARA PAGINAÇÃO DE FAVORITOS (CORRIGIDOS)
    if (favPrevBtn) {
      favPrevBtn.addEventListener('click', () => {
        if (favoritesCurrentPage > 0) {
          favoritesCurrentPage--;
          displayFavoritePage();
        }
      });
    }
    if (favNextBtn) {
      favNextBtn.addEventListener('click', () => {
        const maxPage = Math.ceil(allFavorites.length / favoritesPerPage) - 1;
        if (favoritesCurrentPage < maxPage) {
          favoritesCurrentPage++;
          displayFavoritePage();
        }
      });
    }

    changeAvatarBtn.addEventListener("click", () => avatarInput.click());
    avatarInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith("image/")) { alert("Por favor, selecione um ficheiro de imagem válido."); }
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const response = await fetch('http://localhost:3000/api/users/me/avatar', {
                method: 'POST',
                headers: { 'x-auth-token': token },
                body: formData,
            });
            const data = await response.json();
            // console.log("Resposta do servidor recebida:", data);
            if (!response.ok) throw new Error(data.message);
            // console.log("URL final que será usado na imagem:", `http://localhost:3000${data.avatarUrl}`);
            avatarImg.src = `http://localhost:3000${data.avatarUrl}`;
            alert('Foto de perfil atualizada com sucesso!');
        } catch (error) {
            // console.error("Ocorreu um erro no bloco 'catch':", error);
            alert(`Erro ao atualizar a foto: ${error.message}`);
        }
    });
    
    myReviewsList.addEventListener('click', (e) => {
      const deleteButton = e.target.closest('.delete-review-btn');
      if (deleteButton) {
          const { reviewId } = deleteButton.dataset;
          deleteReview(reviewId);
      }
    });

    async function deleteReview(reviewId, isAdminDelete) {
      const confirmationText = isAdminDelete ? "ADMIN: Tem certeza que deseja excluir esta avaliação?" : "Tem certeza que deseja excluir sua avaliação?";
      if (!confirm(confirmationText)) return;

      // Se for admin, usa a rota de admin. Se não, usa a rota do próprio usuário.
      const url = isAdminDelete ? `http://localhost:3000/api/reviews/${reviewId}` : `http://localhost:3000/api/reviews/me/${reviewId}`;

      try {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        alert('Avaliação excluída!');
        loadUserReviews(); // Recarrega a lista de avaliações do usuário atual
      } catch (error) {
        alert(`Erro: ${error.message}`);
      }
    }

    editProfileBtn.addEventListener("click", () => {
        editModeForm.classList.remove('hidden');
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
        editModeForm.classList.add('hidden');
        setTimeout(() => {
          editModeForm.style.display = "none";
        }, 400);
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
          await loadProfileData();
          backProfileBtn.click();
      } catch(error) {
          alert(`Erro ao atualizar: ${error.message}`);
      }
    });
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('framecode_token');
        sessionStorage.removeItem('framecode_token');
        localStorage.removeItem('userAvatar');
        alert('Você saiu da sua conta.');
        window.location.href = 'login.html';
      });
    }

  } else {
    // Se não for o meu perfil, esconde todos os controles de edição
    editProfileBtn.style.display = 'none';
    changeAvatarBtn.style.display = 'none';
    logoutBtn.style.display = 'none';
    if (adminBtn) adminBtn.style.display = 'none';

    if (loggedInUser && myProfileIcon) {
        myProfileIcon.style.display = 'block';
    }
  }

      document.addEventListener('click', async (e) => {
        const likeButton = e.target.closest('.like-btn');
        if (likeButton) {
            if (!token) {
                alert('Você precisa estar logado para curtir uma avaliação.');
            }
            
            const reviewId = likeButton.dataset.reviewId;
            const isLiked = likeButton.classList.contains('liked');
            const url = `http://localhost:3000/api/reviews/${reviewId}/like`;
            const method = isLiked ? 'DELETE' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'x-auth-token': token }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message);
                }

                // Atualiza a UI otimisticamente
                likeButton.classList.toggle('liked');
                const likeCountSpan = document.getElementById(`like-count-${reviewId}`);
                const currentCount = parseInt(likeCountSpan.textContent);
                likeCountSpan.textContent = isLiked ? currentCount - 1 : currentCount + 1;

            } catch (error) {
                alert(`Erro: ${error.message}`);
            }
        }
    });

      // --- ADICIONE os event listeners para os botões ---
  myReviewsPrevBtn.addEventListener('click', () => {
      if (myReviewsCurrentPage > 1) {
          loadUserReviews(myReviewsCurrentPage - 1);
      }
  });

  myReviewsNextBtn.addEventListener('click', () => {
      loadUserReviews(myReviewsCurrentPage + 1);
  });

  // --- 5. INICIALIZAÇÃO DA PÁGINA ---
  loadProfileData();
  loadUserReviews(myReviewsCurrentPage);
  loadFavorites();
  loadRecentActivities();
});