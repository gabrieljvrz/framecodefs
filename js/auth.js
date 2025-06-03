const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const messageArea = document.getElementById('messageArea');
const cpfInput = document.getElementById('cpf');
const data_nascimentoInput = document.getElementById('data_nascimento');

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

//Login
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

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); // remove tudo que não for número

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let dig1 = 11 - (soma % 11);
    if (dig1 >= 10) dig1 = 0;

    if (dig1 !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let dig2 = 11 - (soma % 11);
    if (dig2 >= 10) dig2 = 0;

    if (dig2 !== parseInt(cpf.charAt(10))) return false;

    return true;
}

// Registro
if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessage();
    const name = this.name.value.trim();
    const email = this.email.value.trim();
    const cpf = this.cpf.value.trim();
    const data_nascimento = this.data_nascimento.value.trim();
    const pw = this.password.value;
    const cpw = this.confirmPassword.value;
    if (!name || !email || !pw || !cpw || !cpf || !data_nascimento) return showMessage('Preencha todos os campos.', 'error');
    if (pw.length < 6) return showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
    if (!isValidEmail(email)) return showMessage('E‑mail inválido.', 'error');
    if (pw !== cpw) return showMessage('Senhas não conferem.', 'error');
    const users = getUsers();
    if (users.find(u => u.email === email)) return showMessage('E‑mail já cadastrado.', 'error');
    if (users.find(u => u.cpf === cpf)) return showMessage('CPF já cadastrado.', 'error');
    users.push({ name, email, cpf, data_nascimento, password: pw });
    saveUsers(users);
    showMessage('Conta criada com sucesso!', 'success');
    setTimeout(() => location.href = 'login.html', 1500);
  });
}