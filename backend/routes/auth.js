const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// rota para registrar um novo usuário
// POST /api/auth/register
router.post('/register', authController.register);

// rota para fazer login
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;