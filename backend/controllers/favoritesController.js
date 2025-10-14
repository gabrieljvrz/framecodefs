const db = require('../config/db');

// adicionar um favorito
exports.addFavorite = async (req, res) => {
    const { movieId, movieTitle, moviePosterPath } = req.body;
    const userId = req.user.id;
    try {
        await db.query(
            'INSERT INTO user_favorites (user_id, movie_id, movie_title, movie_poster_path) VALUES (?, ?, ?, ?)',
            [userId, movieId, movieTitle, moviePosterPath]
        );
        res.status(201).json({ message: 'Filme adicionado aos favoritos!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este filme já está nos seus favoritos.' });
        }
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// remover um favorito
exports.removeFavorite = async (req, res) => {
    const { movieId } = req.params;
    const userId = req.user.id;
    try {
        await db.query('DELETE FROM user_favorites WHERE user_id = ? AND movie_id = ?', [userId, movieId]);
        res.json({ message: 'Filme removido dos favoritos.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// obter todos os favoritos de um usuário
exports.getUserFavorites = async (req, res) => {
    const userId = req.user.id;
    try {
        const [favorites] = await db.query('SELECT movie_id, movie_title, movie_poster_path FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// obter apenas os IDs dos favoritos
exports.getUserFavoriteIds = async (req, res) => {
    const userId = req.user.id;
    try {
        const [favoriteIds] = await db.query('SELECT movie_id FROM user_favorites WHERE user_id = ?', [userId]);
        res.json(favoriteIds.map(fav => fav.movie_id));
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// obter favoritos de um usuário por ID
exports.getFavoritesByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const [favorites] = await db.query('SELECT movie_id, movie_title, movie_poster_path FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};