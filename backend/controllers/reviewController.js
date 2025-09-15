const db = require('../config/db');

// listar todas as avaliações de um filme
exports.getReviewsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const [reviews] = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name as userName 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.movie_id = ? 
       ORDER BY r.created_at DESC`,
      [movieId]
    );
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// criar uma nova avaliação (requer autenticação)
exports.createReview = async (req, res) => {
  try {
    const { rating, comment, movieId, movieTitle } = req.body;
    const userId = req.user.id; // pegamos o ID do usuário do token (via middleware)

    if (!rating || !comment || !movieId || !movieTitle) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const [result] = await db.query(
      'INSERT INTO reviews (rating, comment, movie_id, movie_title, user_id) VALUES (?, ?, ?, ?, ?)',
      [rating, comment, movieId, movieTitle, userId]
    );

    res.status(201).json({ message: 'Avaliação criada com sucesso!', reviewId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// buscar todas as avaliações do usuário logado
exports.getMyReviews = async (req, res) => {
  try {
    const [myReviews] = await db.query(
      'SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(myReviews);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// [ADMIN] deletar uma avaliação por ID
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params; // ID da avaliação a ser deletada
    await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ message: 'Avaliação deletada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};