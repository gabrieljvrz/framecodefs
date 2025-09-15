const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, forneça e-mail e senha.' });
  }

  try {
    // 1. encontrar o usuário pelo e-mail
    const [userRows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (userRows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' }); // 401: Não autorizado
    }

    const user = userRows[0];

    // 2. comparar a senha enviada com a senha criptografada no banco
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 3. se as senhas correspondem, criar o token JWT
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }, // o token expira em 7 dias
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // 4. enviar o token de volta para o cliente
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};