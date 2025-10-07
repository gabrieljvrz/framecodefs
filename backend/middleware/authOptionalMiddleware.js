const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Pega o token do header
    const token = req.header('x-auth-token');

    // Se não houver token, simplesmente continua para a rota.
    // O usuário não será autenticado, mas a rota não será bloqueada.
    if (!token) {
        return next();
    }

    try {
        // Se houver um token, tenta verificá-lo
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Se for válido, adiciona o payload do usuário à requisição (req)
        req.user = decoded.user;
        next();
    } catch (err) {
        // Se o token for inválido (expirado, etc.), não faz nada e apenas continua.
        // Não enviamos um erro 401, pois a autenticação é opcional.
        next();
    }
};