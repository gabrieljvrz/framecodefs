// js/index.js

const API_KEY = '4b0e7368cf5b0af1c5e7627dd5cefd53';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w300';
const PLACEHOLDER_IMG = 'https://via.placeholder.com/300x450?text=Sem+Imagem';

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('query');
const moviesGrid = document.getElementById('moviesGrid');
const logoutBtn = document.getElementById('logoutBtn');

// Linha problemática comentada/removida:
// if (!getSession()) location.href = 'login.html';

// Bloco do botão de logout comentado/modificado para não dar erro:
if (logoutBtn) { // Verifica se o botão existe antes de adicionar o evento
    logoutBtn.onclick = () => {
        // logout(); // Função logout() não existe globalmente, então comentamos
        alert('Funcionalidade de logout a ser implementada.'); // Mensagem temporária
        // location.href = 'login.html'; // Comentado para não depender do logout real
    };
}


// Busca filmes populares ou por pesquisa
async function fetchMovies(path, query = '') {
  try {
    const url = query
      ? `${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`
      : `${BASE_URL}${path}?api_key=${API_KEY}&language=pt-BR`;

    const res = await fetch(url);
    if (!res.ok) { // Adiciona verificação se a resposta da API foi bem sucedida
        console.error('Erro na API:', res.status, await res.text());
        moviesGrid.innerHTML = `<p>Erro ao carregar filmes. Verifique o console para mais detalhes.</p>`;
        return [];
    }
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    moviesGrid.innerHTML = `<p>Ocorreu um erro ao tentar buscar os filmes. Tente novamente mais tarde.</p>`;
    return [];
  }
}

// Renderiza os filmes na tela
function renderMovies(list) {
  moviesGrid.innerHTML = ''; // Limpa a grade

  if (!list || list.length === 0) { // Verifica se a lista é undefined ou vazia
    moviesGrid.innerHTML = '<p>Nenhum filme encontrado.</p>';
    return;
  }

  list.forEach(movie => {
    const { id, title, poster_path, vote_average } = movie; // Adicionei vote_average como exemplo

    const card = document.createElement('div');
    card.className = 'movie-card';

    card.innerHTML = `
      <a href="movie.html?id=${id}"><img src="${poster_path ? IMG_URL + poster_path : PLACEHOLDER_IMG}" alt="${title}"></a>
      <div class="info">
        <h4>${title}</h4>
      </div>
    `;
    // Nota: 'movie.html' precisará ser criada se ainda não existir.

    moviesGrid.appendChild(card);
  });
}

// Carrega os filmes populares ao abrir
(async () => {
  const populares = await fetchMovies('/movie/popular');
  renderMovies(populares.slice(0, 16));
})();

// Faz busca ao enviar o formulário
if (searchForm) { // Verifica se o formulário de busca existe
    searchForm.addEventListener('submit', async e => {
      e.preventDefault();
      const query = searchInput.value.trim();
      // if (!query) return; // Removido para permitir buscar "em branco" e recarregar populares (opcional)
      
      if (query) {
        const results = await fetchMovies('', query); // A busca usa query, o path '' é ignorado como antes
        renderMovies(results);
      } else {
        // Se a busca for em branco, carrega os populares novamente
        const populares = await fetchMovies('/movie/popular');
        renderMovies(populares);
      }
    });
} 
document.addEventListener("DOMContentLoaded", () => {
  const moviesGrid = document.getElementById("moviesGrid");

  const filmes = [
    { id: 1, titulo: "Wedding Banquet", imagem: "https://image.tmdb.org/t/p/w500/7F3DD35JBy4D2vX9cuJYXbSlrbB.jpg" },
    { id: 2, titulo: "Sinners", imagem: "https://image.tmdb.org/t/p/w500/3AK3kSdykCYw3GSCVZEKJ3eOaRn.jpg" },
    { id: 3, titulo: "Wally's Island", imagem: "https://image.tmdb.org/t/p/w500/1CSWsd3wbnWVJbwMFfTzZKN6DMp.jpg" },
    { id: 4, titulo: "Julie Keeps Quiet", imagem: "https://image.tmdb.org/t/p/w500/ndZ0SjN0Ki9n4QKzU7FMuBYuWCO.jpg" },
    { id: 5, titulo: "Holy Cow", imagem: "https://image.tmdb.org/t/p/w500/t4tR5tD17aY0MOfMdN3ukRjqY1j.jpg" },
    { id: 6, titulo: "Warfare", imagem: "https://image.tmdb.org/t/p/w500/3DZJEMcf7szfUgMJm3pODgOK0Qk.jpg" },
  ];

  filmes.forEach(filme => {
    const movieLink = document.createElement("a");
    movieLink.href = `movie.html?id=${filme.id}`;
    movieLink.classList.add("movie-card");

    movieLink.innerHTML = `
      <img src="${filme.imagem}" alt="${filme.titulo}" />
      <div class="movie-title-hover">${filme.titulo}</div>
    `;

    moviesGrid.appendChild(movieLink);
  });
});
