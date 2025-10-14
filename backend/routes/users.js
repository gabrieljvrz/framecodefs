const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');

// configuração do multer para guardar os avatares
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // diretório onde os arquivos serão guardados
  },
  filename: function (req, file, cb) {
    // cria um nome de arquivo único para evitar conflitos
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

// o 'upload.single('avatar')' é o middleware que processa o arquivo
router.post('/me/avatar', [authMiddleware, upload.single('avatar')], userController.uploadAvatar);

// rota pública para buscar um usuário por ID
router.get('/:id', userController.getUserById);

module.exports = router;