const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const likeController = require('../controllers/likeController');

// rota para buscar avaliações de um filme (pública)
// GET /api/reviews/:movieId
router.get('/:movieId', reviewController.getReviewsByMovie);

// rota para criar uma nova avaliação (protegida)
// POST /api/reviews
router.post('/', authMiddleware, reviewController.createReview);

// rota para buscar as avaliações do usuário logado (protegida)
router.get('/user/me', authMiddleware, reviewController.getMyReviews);

// rota para o USUÁRIO ATUALIZAR sua própria avaliação (protegida)
router.put('/me/:id', authMiddleware, reviewController.updateMyReview);

// rota para o USUÁRIO DELETAR sua própria avaliação (protegida)
router.delete('/me/:id', authMiddleware, reviewController.deleteMyReview);

// [ADMIN] rota para deletar qualquer avaliação (protegida por auth e admin)
router.delete('/:id', [authMiddleware, adminMiddleware], reviewController.deleteReview);

// [ADMIN] Rota para buscar TODAS as avaliações
router.get('/all/reviews', [authMiddleware, adminMiddleware], reviewController.getAllReviews);

// Rota PÚBLICA para buscar avaliações de um usuário por ID
router.get('/user/:userId', reviewController.getReviewsByUserId);

// Rota para curtir uma avaliação (protegida)
router.post('/:reviewId/like', authMiddleware, likeController.likeReview);

// Rota para descurtir uma avaliação (protegida)
router.delete('/:reviewId/like', authMiddleware, likeController.unlikeReview);

module.exports = router;