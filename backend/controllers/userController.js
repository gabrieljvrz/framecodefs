const db = require('../config/db');
const bcrypt = require('bcryptjs');

// buscar dados do perfil do usuário logado
exports.getMyProfile = async (req, res) => {
  try {
    const [userRows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.json(userRows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// atualizar o perfil do usuário logado
exports.updateMyProfile = async (req, res) => {
    const { name, email, password } = req.body;
    const userId = req.user.id;

    if (!name || !email) {
        return res.status(400).json({ message: 'Nome e e-mail são obrigatórios.' });
    }

    try {
        let hashedPassword;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const fieldsToUpdate = [name, email];
        let sql = 'UPDATE users SET name = ?, email = ?';
        if (hashedPassword) {
            sql += ', password = ?';
            fieldsToUpdate.push(hashedPassword);
        }
        sql += ' WHERE id = ?';
        fieldsToUpdate.push(userId);

        await db.query(sql, fieldsToUpdate);
        res.json({ message: 'Perfil atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar o perfil.' });
    }
};

// [ADMIN] Listar todos os utilizadores com paginação e pesquisa
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchTerm = req.query.search || '';
        const offset = (page - 1) * limit;

        let whereClause = '';
        const params = [];

        if (searchTerm) {
            whereClause = 'WHERE name LIKE ? OR email LIKE ?';
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        // Query para obter o total de utilizadores (para a paginação)
        const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
        
        // Query para obter os utilizadores da página atual
        const [users] = await db.query(`SELECT id, name, email, role, created_at FROM users ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);

        res.json({
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            users
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// Upload de avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum ficheiro enviado.' });
    }

    // O caminho do ficheiro guardado pelo multer
    const avatarUrl = `/uploads/${req.file.filename}`;

    // Atualiza o utilizador no banco de dados com o novo URL do avatar
    await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);

    res.json({ message: 'Avatar atualizado com sucesso!', avatarUrl: avatarUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao fazer upload do avatar.' });
  }
};

// Também precisamos de atualizar a função getMyProfile para retornar o avatar_url
exports.getMyProfile = async (req, res) => {
  try {
    // ATUALIZADO: Adicionado avatar_url ao SELECT
    const [userRows] = await db.query('SELECT id, name, email, role, avatar_url FROM users WHERE id = ?', [req.user.id]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.json(userRows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};