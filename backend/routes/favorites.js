const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const authMiddleware = require('../middleware/authMiddleware');

// buscar todos os favoritos do usuário logado
router.get('/', authMiddleware, favoritesController.getUserFavorites);

// buscar apenas os IDs dos filmes favoritos do usuário logado
router.get('/ids', authMiddleware, favoritesController.getUserFavoriteIds);

// adicionar um filme aos favoritos
router.post('/', authMiddleware, favoritesController.addFavorite);

// remover um filme dos favoritos
router.delete('/:movieId', authMiddleware, favoritesController.removeFavorite);

// rota pública para buscar favoritos de um usuário por ID
router.get('/user/:userId', favoritesController.getFavoritesByUserId);

module.exports = router;