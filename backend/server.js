const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(cors()); // permite requisições de outras origens (frontend)
app.use(express.json()); // permite que o servidor entenda JSON no corpo das requisições

// rotas da API
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews'); 
const userRoutes = require('./routes/users');

app.get('/', (req, res) => {
  res.send('API do FrameCode está funcionando!');
});

app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes); 
app.use('/api/users', userRoutes);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});