// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('framecode_token') || sessionStorage.getItem('framecode_token');
    
    // 1. Proteção da Página
    if (!token) {
        alert('Acesso negado.');
        window.location.href = 'login.html';
        return;
    }

    function parseJwt(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    const decodedToken = parseJwt(token);
    if (!decodedToken || decodedToken.user.role !== 'admin') {
        alert('Acesso negado. Esta página é apenas para administradores.');
        window.location.href = 'index.html';
        return;
    }

    const headers = { 'x-auth-token': token };

    // 2. Funções para Carregar os Dados
    async function loadDashboardData() {
        await fetchUsers();
        await fetchAllReviews();
    }

    async function fetchUsers() {
        try {
            const response = await fetch('http://localhost:3000/api/users', { headers });
            const users = await response.json();

            document.getElementById('totalUsersStat').textContent = users.length;

            const tableBody = document.getElementById('usersTableBody');
            tableBody.innerHTML = '';
            users.forEach(user => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                `;
            });
        } catch (error) {
            console.error('Erro ao buscar utilizadores:', error);
        }
    }

    async function fetchAllReviews() {
        try {
            const response = await fetch('http://localhost:3000/api/reviews/all/reviews', { headers });
            const reviews = await response.json();

            document.getElementById('totalReviewsStat').textContent = reviews.length;

            const reviewsList = document.getElementById('reviewsList');
            reviewsList.innerHTML = '';
            reviews.forEach(review => {
                const item = document.createElement('li');
                item.className = 'admin-review-item';
                item.id = `review-item-${review.id}`;
                item.innerHTML = `
                    <header>
                        <div>
                            <strong>${review.movie_title}</strong> por <em>${review.userName}</em>
                        </div>
                        <button class="delete-review-btn" data-id="${review.id}"><img src="assets/delete.png"> Excluir</button>
                    </header>
                    <p>"${review.comment}"</p>
                    <div class="meta">Nota: ${review.rating}/5 - ${new Date(review.created_at).toLocaleString()}</div>
                `;
                reviewsList.appendChild(item);
            });
        } catch (error) {
            console.error('Erro ao buscar avaliações:', error);
        }
    }

    // 3. Lógica para Apagar Avaliações
    document.getElementById('reviewsList').addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-review-btn')) {
            const reviewId = e.target.dataset.id;
            if (confirm(`ADMIN: Tem certeza que deseja excluir a avaliação #${reviewId}?`)) {
                try {
                    const response = await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
                        method: 'DELETE',
                        headers: headers
                    });
                    if (!response.ok) throw new Error('Falha ao apagar a avaliação.');
                    
                    document.getElementById(`review-item-${reviewId}`).remove();
                    // Atualiza a estatística
                    const totalReviewsEl = document.getElementById('totalReviewsStat');
                    totalReviewsEl.textContent = parseInt(totalReviewsEl.textContent) - 1;

                } catch (error) {
                    alert(error.message);
                }
            }
        }
    });

    // Carrega tudo ao iniciar
    loadDashboardData();
});