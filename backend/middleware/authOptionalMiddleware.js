const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // pega o token do header
    const token = req.header('x-auth-token');

    // se não houver token, simplesmente continua para a rota.
    // o usuário não será autenticado, mas a rota não será bloqueada.
    if (!token) {
        return next();
    }

    try {
        // se houver um token, tenta verificá-lo
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // se for válido, adiciona o payload do usuário à requisição (req)
        req.user = decoded.user;
        next();
    } catch (err) {
        // se o token for inválido (expirado, etc.), não faz nada e apenas continua.
        // não envia um erro 401, pois a autenticação é opcional.
        next();
    }
};