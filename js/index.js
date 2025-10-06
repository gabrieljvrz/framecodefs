// js/index.js (VERSÃO COMPLETA E ATUALIZADA)

const apiKey = "3b08d5dfa29024b5dcb74e8bff23f984";
const apiBase = "https://api.themoviedb.org/3";
const imageBase = "https://image.tmdb.org/t/p/w500";

// --- ELEMENTOS DO DOM ---
const banner = document.querySelector(".banner");
const searchInput = document.getElementById("searchInput");

const moviesGridSection = document.getElementById('moviesGridSection');
const moviesTitle = document.getElementById("moviesTitle");
const moviesGrid = document.getElementById("moviesGrid");

const usersGridSection = document.getElementById('usersGridSection');
const usersTitle = document.getElementById("usersTitle");
const usersGrid = document.getElementById("usersGrid");

// --- FUNÇÕES DE CRIAÇÃO DE CARDS ---

function createMovieCard(movie) {
  const card = document.createElement("div");
  card.classList.add("movie-card");
  const title = movie.title || movie.name || "Título Desconhecido";
  const posterPath = movie.poster_path ? `${imageBase}${movie.poster_path}` : "https://via.placeholder.com/500x750?text=Sem+Imagem";
  
  card.innerHTML = `
    <a href="movie.html?id=${movie.id}">
      <img src="${posterPath}" alt="${title}">
    </a>
    <h3>${title}</h3>
  `;
  return card;
}

// NOVA FUNÇÃO para criar cards de usuário
function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'user-card';
    
    // Lógica para decidir qual imagem usar (a do usuário ou a padrão)
    const avatarSrc = user.avatar_url 
        ? `http://localhost:3000${user.avatar_url}` 
        : 'assets/user icon.png';

    card.innerHTML = `
        <a href="profile.html?id=${user.id}">
            <img src="${avatarSrc}" alt="Avatar de ${user.name}">
            <h3>${user.name}</h3>
        </a>
    `;
    return card;
}

// --- FUNÇÕES DE BUSCA NA API ---

async function fetchPopularMovies() {
  const url = `${apiBase}/movie/popular?api_key=${apiKey}&language=pt-BR&page=1`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    moviesGrid.innerHTML = "";
    moviesTitle.textContent = "Populares";
    data.results.forEach((movie) => {
      const card = createMovieCard(movie);
      moviesGrid.appendChild(card);
    });
  } catch (error) {
    moviesGrid.innerHTML = "<p>Erro ao carregar os filmes populares.</p>";
  }
}

async function searchMovies(query) {
  const url = `${apiBase}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pt-BR`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    moviesGrid.innerHTML = "";
    if (!data.results || data.results.length === 0) {
      moviesGrid.innerHTML = "<p>Nenhum filme encontrado com este termo.</p>";
      return;
    }
    data.results.forEach((movie) => {
      const card = createMovieCard(movie);
      moviesGrid.appendChild(card);
    });
  } catch (error) {
    moviesGrid.innerHTML = "<p>Erro ao buscar filmes.</p>";
  }
}

// NOVA FUNÇÃO para buscar usuários
async function searchUsers(query) {
    const token = localStorage.getItem('framecode_token') || sessionStorage.getItem('framecode_token');
    if (!token) {
        usersGridSection.style.display = 'none'; // Esconde a seção se não estiver logado
        return;
    }

    const url = `http://localhost:3000/api/users?search=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url, {
            headers: { 'x-auth-token': token }
        });
        if (!response.ok) throw new Error('Falha na busca de usuários');

        const data = await response.json();
        usersGrid.innerHTML = '';

        if (data.users.length > 0) {
            usersGridSection.style.display = 'block'; // Mostra a seção de usuários
            usersTitle.textContent = "Usuários Encontrados";
            data.users.forEach(user => {
                const card = createUserCard(user);
                usersGrid.appendChild(card);
            });
        } else {
            usersGridSection.style.display = 'none'; // Esconde a seção se não houver resultados
        }
    } catch (error) {
        console.error(error);
        usersGridSection.style.display = 'none';
    }
}


// --- LÓGICA DE EVENTOS ---

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    if (searchQuery) {
        searchInput.value = searchQuery;
        banner.style.display = 'none';
        moviesTitle.textContent = `Resultados da busca por Filmes: "${searchQuery}"`;
        searchMovies(searchQuery);
        searchUsers(searchQuery); // Também busca por usuários
    } else {
        fetchPopularMovies();
    }
});

searchInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value.trim();

  if (searchTerm.length >= 1) {
    banner.style.display = 'none';
    moviesTitle.textContent = `Resultados da busca por Filmes: "${searchTerm}"`;
    searchMovies(searchTerm);
    searchUsers(searchTerm); // ATUALIZADO: Chama a busca de usuários também
  } else {
    banner.style.display = 'flex';
    usersGridSection.style.display = 'none'; // Esconde a seção de usuários ao limpar a busca
    fetchPopularMovies();
  }
});