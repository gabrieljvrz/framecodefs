document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('framecode_token') || sessionStorage.getItem('framecode_token');
  if (!token) {
    alert("Você precisa estar logado para acessar o perfil.");
    window.location.href = "login.html";
    return;
  }

  // elementos do DOM
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
  
  let currentUserData = null;

  const headers = {
    'Content-Type': 'application/json',
    'x-auth-token': token
  };

  // lógica da foto de perfil
  const savedAvatar = localStorage.getItem("userAvatar");
  if (savedAvatar) {
    avatarImg.src = savedAvatar;
  }
  changeAvatarBtn.addEventListener("click", () => {
    avatarInput.click();
  });
  avatarInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const newAvatarURL = e.target.result;
        avatarImg.src = newAvatarURL;
        localStorage.setItem("userAvatar", newAvatarURL); 
      };
      reader.readAsDataURL(file);
    } else {
      alert("Por favor, selecione uma imagem válida (jpg, png, etc).");
    }
  });

  // função para buscar e preencher os dados do perfil via API
  async function loadProfile() {
    try {
      const response = await fetch('http://localhost:3000/api/users/me', { headers });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao carregar perfil.');
      }
      
      const user = await response.json();
      currentUserData = user;

      displayNameEl.textContent = user.name;
      editNameInput.value = user.name;
      editEmailInput.value = user.email;

    } catch (error) {
      alert(error.message);
      // se o token for inválido, desloga o usuário
      if (error.message.includes('inválido') || error.message.includes('negado')) {
        localStorage.removeItem('framecode_token');
        localStorage.removeItem('userAvatar'); // limpa também o avatar
        window.location.href = 'login.html';
      }
    }
  }

  // função para buscar e renderizar as avaliações do usuário via API
  async function loadMyReviews() {
    const list = document.getElementById("myReviews");
    const activitiesEl = document.getElementById("recentActivities");
    list.innerHTML = "<li>Carregando avaliações...</li>";
    activitiesEl.innerHTML = "";

    try {
      const response = await fetch('http://localhost:3000/api/reviews/user/me', { headers });
      if (!response.ok) throw new Error('Falha ao carregar avaliações.');

      const reviews = await response.json();
      list.innerHTML = ""; // limpa a mensagem de "carregando"
      
      if(reviews.length === 0) {
        list.innerHTML = "<h4 id='noReviewsH4'>Você ainda não fez nenhuma avaliação.</h4>";
        return;
      }
      
      const apiKey = "3b08d5dfa29024b5dcb74e8bff23f984"; 
      const imageBase = "https://image.tmdb.org/t/p/w200";

      // para as atividades recentes, pegamos as 6 últimas
      const recentReviews = reviews.slice(0, 6);

      for (const r of reviews) {
        let posterUrl = "https://via.placeholder.com/100x150?text=Sem+Imagem";
        try {
            const movieRes = await fetch(`https://api.themoviedb.org/3/movie/${r.movie_id}?api_key=${apiKey}&language=pt-BR`);
            const movieData = await movieRes.json();
            if(movieData.poster_path) posterUrl = `${imageBase}${movieData.poster_path}`;
        } catch(e) { console.error("Erro ao buscar poster"); }

        // adiciona à lista principal de "Minhas Avaliações"
        const li = document.createElement("li");
        li.className = "review-item";
        li.innerHTML = `
          <img src="${posterUrl}" alt="Pôster de ${r.movie_title}" style="width: 80px; height: auto; margin-right: 15px; vertical-align: top;">
          <div style="display: inline-block; vertical-align: top; width: calc(100% - 100px);">
            <header>
              <strong>${r.movie_title}</strong>
              <span class="meta"> • Nota: ${r.rating}/5 ⭐</span>
            </header>
            <p>${r.comment}</p>
          </div>
        `;
        list.appendChild(li);

        // se a avaliação estiver entre as 6 recentes, adiciona também na outra seção
        if(recentReviews.includes(r)) {
            const card = document.createElement("div");
            card.className = "activity-card";
            card.innerHTML = `
              <a href="movie.html?id=${r.movie_id}">
                <img src="${posterUrl}" alt="${r.movie_title}">
              </a>
              <div class="stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
            `;
            activitiesEl.appendChild(card);
        }
      }
    } catch (error) {
      list.innerHTML = `<li>${error.message}</li>`;
    }
  }

  // lógica dos botões de edição do formulário
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
    
    // restaura valores originais
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

  // evento para o botão Salvar
  editModeForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // evita o recarregamento da página

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
        await loadProfile(); // recarrega os dados do perfil
        backProfileBtn.click(); // simula o clique no botão voltar para fechar o formulário

    } catch(error) {
        alert(`Erro ao atualizar: ${error.message}`);
    }
  });


  // carrega os dados iniciais da página
  loadProfile();
  loadMyReviews();
});

// js/profile.js -> Adicione no final do ficheiro

// Lógica para o botão de Sair
const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    // Apaga o token de ambos os locais de armazenamento
    localStorage.removeItem('framecode_token');
    sessionStorage.removeItem('framecode_token');

    // Apaga também o avatar guardado
    localStorage.removeItem('userAvatar');
    
    // Mostra um alerta e redireciona para a página de login
    alert('Você saiu da sua conta.');
    window.location.href = 'login.html';
  });
}