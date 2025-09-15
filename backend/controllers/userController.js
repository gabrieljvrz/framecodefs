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

// [ADMIN] listar todos os usuários
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, created_at FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};