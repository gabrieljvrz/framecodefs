const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. pega o token do header da requisição
  const token = req.header('x-auth-token');

  // 2. se não houver token, recusa o acesso
  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  // 3. se houver token, verifica se é válido
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // adiciona os dados do usuário (id, email, etc.) ao objeto da requisição
    next(); // passa para a próxima função (o controller)
  } catch (ex) {
    res.status(400).json({ message: 'Token inválido.' });
  }
};