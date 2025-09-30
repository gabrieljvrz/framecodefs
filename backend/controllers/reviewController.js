const db = require('../config/db');

// listar todas as avaliações de um filme
exports.getReviewsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const [reviews] = await db.query(
      `SELECT r.id, r.user_id, r.rating, r.comment, r.created_at, u.name as userName, u.avatar_url
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
    const userId = req.user.id; // Pegamos o ID do usuário do token

    if (!rating || !comment || !movieId || !movieTitle) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // ================== NOVA VERIFICAÇÃO ==================
    // 1. Verifica se já existe uma avaliação para este utilizador e este filme
    const [existingReview] = await db.query(
      'SELECT id FROM reviews WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );

    // 2. Se a avaliação já existir, retorna um erro de conflito
    if (existingReview.length > 0) {
      return res.status(409).json({ message: 'Você já avaliou este filme.' }); // 409: Conflito
    }
    // =======================================================

    // 3. Se não existir, insere a nova avaliação (lógica original)
    const [result] = await db.query(
      'INSERT INTO reviews (rating, comment, movie_id, movie_title, user_id) VALUES (?, ?, ?, ?, ?)',
      [rating, comment, movieId, movieTitle, userId]
    );

    res.status(201).json({ message: 'Avaliação criada com sucesso!', reviewId: result.insertId });
  } catch (error) {
    console.error(error);
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

// atualizar uma avaliação que pertence ao usuário logado
exports.updateMyReview = async (req, res) => {
  try {
    const { id } = req.params; // ID da review
    const { rating, comment } = req.body;
    const userId = req.user.id; // ID do usuário logado

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Nota e comentário são obrigatórios.' });
    }

    // primeiro, verifica se a avaliação pertence mesmo ao usuário
    const [reviewRows] = await db.query('SELECT * FROM reviews WHERE id = ?', [id]);
    if (reviewRows.length === 0) {
      return res.status(404).json({ message: 'Avaliação não encontrada.' });
    }

    if (reviewRows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não pode editar esta avaliação.' });
    }

    // se tudo estiver certo, atualiza
    await db.query(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment, id]
    );
    
    res.json({ message: 'Avaliação atualizada com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// deletar uma avaliação que pertence ao usuário logado
exports.deleteMyReview = async (req, res) => {
  try {
    const { id } = req.params; // ID da review
    const userId = req.user.id; // ID do usuário logado

    // verifica se a avaliação pertence ao usuário
    const [reviewRows] = await db.query('SELECT * FROM reviews WHERE id = ?', [id]);
    if (reviewRows.length === 0) {
      return res.status(404).json({ message: 'Avaliação não encontrada.' });
    }

    if (reviewRows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você não pode excluir esta avaliação.' });
    }

    // se pertencer, deleta
    await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    
    res.json({ message: 'Avaliação excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// [ADMIN] Listar TODAS as avaliações com paginação e pesquisa
exports.getAllReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchTerm = req.query.search || '';
        const offset = (page - 1) * limit;

        let whereClause = '';
        const params = [];

        if (searchTerm) {
            whereClause = 'WHERE r.movie_title LIKE ?';
            params.push(`%${searchTerm}%`);
        }

        const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM reviews r ${whereClause}`, params);
        
        const [reviews] = await db.query(
          `SELECT r.id, r.comment, r.rating, r.movie_title, r.created_at, u.name as userName
           FROM reviews r
           JOIN users u ON r.user_id = u.id
           ${whereClause}
           ORDER BY r.created_at DESC
           LIMIT ? OFFSET ?`,
          [...params, limit, offset]
        );
        
        res.json({
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            reviews
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};