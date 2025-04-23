// auth.js — registra e autentica usuários via localStorage
const KEY_USERS = 'users';
const KEY_SESSION = 'session';

function getUsers() {
  return JSON.parse(localStorage.getItem(KEY_USERS) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(KEY_USERS, JSON.stringify(users));
}

function registerUser(name, email, password) {
  const users = getUsers();
  if (users.some(u => u.email === email)) throw 'E‑mail já cadastrado';
  users.push({ name, email, password });
  saveUsers(users);
}

function loginUser(email, password) {
  const user = getUsers().find(u => u.email === email && u.password === password);
  if (!user) throw 'Credenciais inválidas';
  localStorage.setItem(KEY_SESSION, JSON.stringify({ name: user.name, email: user.email }));
}

function getSession() {
  return JSON.parse(localStorage.getItem(KEY_SESSION) || 'null');
}

function logout() {
  localStorage.removeItem(KEY_SESSION);
}

// Validações simples
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(pw) {
  return pw.length >= 6;
}
