  async function loadUserReviews() {
      const url = isMyProfile ? `http://localhost:3000/api/reviews/user/me` : `http://localhost:3000/api/reviews/user/${userIdToFetch}`;
      
      // --- CORREÇÃO AQUI ---
      // Prepara as opções da requisição para SEMPRE enviar o token, se ele existir.
      const options = { headers: {} };
      if (token) {
          options.headers['x-auth-token'] = token;
      }
      // ---------------------
      
      myReviewsList.innerHTML = "<li>Carregando avaliações...</li>";
      recentActivitiesEl.innerHTML = "";
      
      try {
          // A requisição agora envia as 'options' com o token
          const response = await fetch(url, options);
          if (!response.ok) throw new Error('Falha ao carregar avaliações.');
          
          const reviews = await response.json();
          myReviewsList.innerHTML = "";
          
          if (reviews.length === 0) {
              if (noRecentActivities) noRecentActivities.style.display = "flex";
              myReviewsList.innerHTML = `<h4 id='no-reviews-h4'>${isMyProfile ? 'Você' : 'Este usuário'} ainda não fez nenhuma avaliação.</h4>`;
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

              let buttons = '';
              if (isMyProfile) {
                  buttons = ` 
                    <button class="edit-review-btn" data-review-id="${r.id}" data-comment="${r.comment.replace(/"/g, '&quot;')}" data-rating="${r.rating}"><img src="assets/edit.png"> Editar</button> 
                    <button class="delete-review-btn" data-review-id="${r.id}"><img src="assets/delete.png"> Excluir</button>
                  `;
              } 
              else if (loggedInUser && loggedInUser.role === 'admin' && !isMyProfile) {
                  buttons = ` 
                    <button class="delete-review-btn admin-delete" data-review-id="${r.id}"><img src="assets/delete.png"> Excluir (Admin)</button>
                  `;
              }

              // Agora esta lógica funcionará em todos os perfis
              const likeBtnClass = r.user_has_liked ? 'like-btn liked' : 'like-btn';
              const likeBtnDisabled = !loggedInUser ? 'disabled' : '';

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
                              <span class="meta"> • Nota: ${parseFloat(r.rating)}/5 ⭐</span>
                              <div class="review-actions">${buttons}</div>
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

// ==============================================================================================

// --- SUBSTITUA a sua função loadUserReviews por esta ---
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
        recentActivitiesEl.innerHTML = "";
        
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error('Falha ao carregar avaliações.');
            
            const data = await response.json();
            const reviews = data.reviews;
            
            myReviewsList.innerHTML = "";
            
            if (reviews.length === 0) {
                if (noRecentActivities) noRecentActivities.style.display = "flex";
                myReviewsList.innerHTML = `<h4 id='no-reviews-h4'>${isMyProfile ? 'Você' : 'Este usuário'} ainda não fez nenhuma avaliação.</h4>`;
                myReviewsPagination.style.display = 'none';
                return;
            } else {
                 myReviewsPagination.style.display = 'flex';
            }
            
            // ... (TODA a lógica do 'for (const r of reviews)' continua aqui, sem alterações)
            for (const r of reviews) {
                // ... (seu código de criar o li da avaliação)
                const li = document.createElement("li");
                li.className = "review-item";
                li.id = `my-review-${r.id}`;

                // ... (resto da sua lógica para poster, botões, etc.)
                let buttons = '';
                if (isMyProfile) {
                    buttons = ` 
                    <button class="edit-review-btn" data-review-id="${r.id}" data-comment="${r.comment.replace(/"/g, '&quot;')}" data-rating="${r.rating}"><img src="assets/edit.png"> Editar</button> 
                    <button class="delete-review-btn" data-review-id="${r.id}"><img src="assets/delete.png"> Excluir</button>
                    `;
                } 
                else if (loggedInUser && loggedInUser.role === 'admin' && !isMyProfile) {
                    buttons = ` 
                    <button class="delete-review-btn admin-delete" data-review-id="${r.id}"><img src="assets/delete.png"> Excluir (Admin)</button>
                    `;
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
                                <span class="meta"> • Nota: ${parseFloat(r.rating)}/5 ⭐</span>
                                <div class="review-actions">${buttons}</div>
                            </div>
                        </header>
                        <p>${r.comment}</p>
                    </div>
                `;

                myReviewsList.appendChild(li);

                // Lógica de atividades recentes não precisa mudar
                // ...
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