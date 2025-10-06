const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');

// Configuração do Multer para guardar os avatares
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Diretório onde os ficheiros serão guardados
  },
  filename: function (req, file, cb) {
    // Cria um nome de ficheiro único para evitar conflitos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`);
  }
});
const upload = multer({ storage: storage });

// buscar perfil do usuário logado (protegido)
router.get('/me', authMiddleware, userController.getMyProfile);

// atualizar perfil do usuário logado (protegido)
router.put('/me', authMiddleware, userController.updateMyProfile);

// [ADMIN] buscar todos os usuários (protegido por auth e admin)
router.get('/', [authMiddleware], userController.getAllUsers);

// O 'upload.single('avatar')' é o middleware que processa o ficheiro
router.post('/me/avatar', [authMiddleware, upload.single('avatar')], userController.uploadAvatar);

// Rota PÚBLICA para buscar um usuário por ID
router.get('/:id', userController.getUserById);

module.exports = router;