// Seleciona os elementos do DOM
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const messageArea = document.getElementById('messageArea'); // Nosso novo elemento de mensagem

// Função para validar o formato do e-mail (expressão regular simples)
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Função para exibir mensagens
function showMessage(message, type) {
    messageArea.textContent = message; // Define o texto da mensagem
    messageArea.className = 'message-area'; // Reseta as classes
    messageArea.classList.add(type); // Adiciona 'success' ou 'error'
    messageArea.style.display = 'block'; // Garante que está visível
}

// Função para limpar mensagens
function clearMessage() {
    messageArea.textContent = '';
    messageArea.className = 'message-area'; // Reseta as classes
    messageArea.style.display = 'none'; // Esconde a área de mensagem
}

// Adiciona um "ouvinte de evento" para o evento 'submit' do formulário
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário
    clearMessage(); // Limpa mensagens anteriores a cada tentativa

    const email = emailInput.value.trim(); // .trim() remove espaços em branco no início e fim
    const senha = senhaInput.value;

    // 1. Validação se os campos estão preenchidos
    if (!email || !senha) {
        showMessage('Por favor, preencha todos os campos.', 'error');
        if (!email) { // Dá foco ao campo de e-mail se estiver vazio
            emailInput.focus();
        } else { // Senão, dá foco ao campo de senha
            senhaInput.focus();
        }
        return; // Para a execução se houver erro
    }

    // 2. Validação do formato do e-mail
    if (!isValidEmail(email)) {
        showMessage('Por favor, insira um endereço de e-mail válido.', 'error');
        emailInput.focus(); // Dá foco ao campo de e-mail
        return; // Para a execução se houver erro
    }

    // Se todas as validações passarem:
    // Simulação de login (em um app real, aqui você faria uma chamada para o servidor)
    showMessage('Login realizado com sucesso (simulação)! E-mail: ' + email, 'success');

    // Opcional: Simular um pequeno atraso antes de limpar o formulário ou redirecionar
    setTimeout(() => {
        loginForm.reset(); // Limpa o formulário
        clearMessage(); // Limpa a mensagem de sucesso após um tempo
        emailInput.focus(); // Coloca o foco de volta no campo de e-mail para um novo login
        // window.location.href = 'pagina_principal.html'; // Exemplo de redirecionamento
    }, 2000); // Atraso de 2 segundos (2000 milissegundos)
});

// Opcional: Limpar mensagem de erro quando o usuário começar a digitar novamente
emailInput.addEventListener('input', clearMessage);
senhaInput.addEventListener('input', clearMessage);