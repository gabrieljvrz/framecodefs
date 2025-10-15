const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
const corsOptions = {
  origin: 'https://framecode.netlify.app',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// rotas da API
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews'); 
const userRoutes = require('./routes/users');
const favoriteRoutes = require('./routes/favorites'); 

app.get('/', (req, res) => {
  res.send('API do FrameCode está funcionando!');
});

app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes);

// inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});