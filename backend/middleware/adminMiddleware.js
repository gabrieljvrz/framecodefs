module.exports = function(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next(); // se for admin, pode prosseguir
  } else {
    res.status(403).json({ message: 'Acesso negado. Requer privilégios de administrador.' }); // 403: Proibido
  }
};