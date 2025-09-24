const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Esta função de registo permanece exatamente a mesma, não precisa de ser alterada.
exports.register = async (req, res) => {
  // 1. extrair os dados do corpo da requisição
  const { name, email, cpf, data_nascimento, password } = req.body;

  // 2. validação simples
  if (!name || !email || !cpf || !data_nascimento || !password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
  }

  try {
    // 3. verificar se o e-mail ou CPF já existem no banco
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ? OR cpf = ?',
      [email, cpf]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'E-mail ou CPF já cadastrado.' });
    }

    // 4. criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. inserir o novo usuário no banco de dados
    await db.query(
      'INSERT INTO users (name, email, cpf, data_nascimento, password) VALUES (?, ?, ?, ?, ?)',
      [name, email, cpf, data_nascimento, hashedPassword]
    );

    // 6. enviar uma resposta de sucesso
    res.status(201).json({ message: 'Usuário registrado com sucesso!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao tentar registrar o usuário.' });
  }
};


// ================== ESTA É A FUNÇÃO ATUALIZADA ==================
// Substitua a sua função exports.login por esta versão completa.

exports.login = async (req, res) => {
  // Adicionamos 'rememberMe' para ser lido do corpo da requisição
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, forneça e-mail e senha.' });
  }

  try {
    // 1. encontrar o usuário pelo e-mail (lógica mantida)
    const [userRows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (userRows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = userRows[0];

    // 2. comparar a senha (lógica mantida)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 3. criar o payload do token (lógica mantida)
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
    
    // 4. NOVA LÓGICA: Definir a duração do token
    const expiresIn = rememberMe ? '30d' : '1d'; // 30 dias se marcado, 1 dia se não

    // 5. criar e enviar o token com a duração correta
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: expiresIn }, // Usamos a nova duração variável
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};