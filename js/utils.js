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
  
  window.getUsers = getUsers;
  window.saveUsers = saveUsers;
  window.loginUser = loginUser;
  window.logout = logout;
  window.getSession = getSession;