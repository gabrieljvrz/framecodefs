const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// rota para buscar avaliações de um filme (pública)
// GET /api/reviews/:movieId
router.get('/:movieId', reviewController.getReviewsByMovie);

// rota para criar uma nova avaliação (protegida)
// POST /api/reviews
router.post('/', authMiddleware, reviewController.createReview);

// rota para buscar as avaliações do usuário logado (protegida)
router.get('/user/me', authMiddleware, reviewController.getMyReviews);

// [ADMIN] rota para deletar qualquer avaliação (protegida por auth e admin)
router.delete('/:id', [authMiddleware, adminMiddleware], reviewController.deleteReview);

module.exports = router;