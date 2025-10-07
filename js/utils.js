  console.log("utils.js foi carregado com sucesso!");
  
  function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }
  
  function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  function loginUser(email, password) {
    const user = getUsers().find(u => u.email === email && u.password === password);
    if (!user) throw 'Credenciais inválidas';
    localStorage.setItem('session', JSON.stringify(user));
  }
  
  function logout() {
    localStorage.removeItem('session');
  }
  
  function getSession() {
    return JSON.parse(localStorage.getItem('session') || 'null');
  }

  /**
 * Exibe uma notificação toast na tela.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} [type='info'] - O tipo de toast ('success', 'error', 'info').
 * @param {number} [duration=3000] - A duração em milissegundos.
 */
  function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Gatilho para a animação de saída
    setTimeout(() => {
      toast.classList.add('hide');
      // Remove o elemento do DOM após a animação de saída
      toast.addEventListener('animationend', () => {
        container.removeChild(toast);
      });
    }, duration);
  }

  window.getUsers = getUsers;
  window.saveUsers = saveUsers;
  window.loginUser = loginUser;
  window.logout = logout;
  window.getSession = getSession;
  window.showToast = showToast;