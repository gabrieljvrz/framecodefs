// backend/controllers/likeController.js
const db = require('../config/db');

// curtir uma avaliação
exports.likeReview = async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user.id;
    try {
        await db.query(
            'INSERT INTO review_likes (user_id, review_id) VALUES (?, ?)',
            [userId, reviewId]
        );
        res.status(201).json({ message: 'Avaliação curtida!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Você já curtiu esta avaliação.' });
        }
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// descurtir uma avaliação
exports.unlikeReview = async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user.id;
    try {
        await db.query('DELETE FROM review_likes WHERE user_id = ? AND review_id = ?', [userId, reviewId]);
        res.json({ message: 'Avaliação descurtida.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};