// Seleção de elementos
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const messageArea = document.getElementById('messageArea');

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showMessage(message, type) {
  if (!messageArea) return;
  messageArea.textContent = message;
  messageArea.className = 'message-area';
  messageArea.classList.add(type);
  messageArea.style.display = 'block';
}

function clearMessage() {
  if (!messageArea) return;
  messageArea.textContent = '';
  messageArea.className = 'message-area';
  messageArea.style.display = 'none';
}

// Login
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessage();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    if (!email || !senha) return showMessage('Por favor, preencha todos os campos.', 'error');
    if (!isValidEmail(email)) return showMessage('E‑mail inválido.', 'error');
    try {
      loginUser(email, senha);
      showMessage('Login realizado com sucesso!', 'success');
      setTimeout(() => location.href = 'index.html', 1000);
    } catch (err) {
      showMessage(err, 'error');
    }
  });
  emailInput.addEventListener('input', clearMessage);
  senhaInput.addEventListener('input', clearMessage);
}

// Registro
if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessage();
    const name = this.name.value.trim();
    const email = this.email.value.trim();
    const pw = this.password.value;
    const cpw = this.confirmPassword.value;
    if (!name || !email || !pw || !cpw) return showMessage('Preencha todos os campos.', 'error');
    if (!isValidEmail(email)) return showMessage('E‑mail inválido.', 'error');
    if (pw !== cpw) return showMessage('Senhas não conferem.', 'error');
    const users = getUsers();
    if (users.find(u => u.email === email)) return showMessage('E‑mail já cadastrado.', 'error');
    users.push({ name, email, password: pw });
    saveUsers(users);
    showMessage('Conta criada com sucesso!', 'success');
    setTimeout(() => location.href = 'login.html', 1500);
  });
}