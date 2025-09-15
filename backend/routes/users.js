const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// buscar perfil do usuário logado (protegido)
router.get('/me', authMiddleware, userController.getMyProfile);

// atualizar perfil do usuário logado (protegido)
router.put('/me', authMiddleware, userController.updateMyProfile);

// [ADMIN] buscar todos os usuários (protegido por auth e admin)
router.get('/', [authMiddleware, adminMiddleware], userController.getAllUsers);

module.exports = router;