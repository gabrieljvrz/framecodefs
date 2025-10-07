// backend/routes/favorites.js
const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const authMiddleware = require('../middleware/authMiddleware');

// Buscar todos os favoritos do usuário logado
router.get('/', authMiddleware, favoritesController.getUserFavorites);

// Buscar apenas os IDs dos filmes favoritos do usuário logado
router.get('/ids', authMiddleware, favoritesController.getUserFavoriteIds);

// Adicionar um filme aos favoritos
router.post('/', authMiddleware, favoritesController.addFavorite);

// Remover um filme dos favoritos
router.delete('/:movieId', authMiddleware, favoritesController.removeFavorite);

// Rota PÚBLICA para buscar favoritos de um usuário por ID
router.get('/user/:userId', favoritesController.getFavoritesByUserId);

module.exports = router;