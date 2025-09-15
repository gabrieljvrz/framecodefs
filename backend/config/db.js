// configuração da conexão com o banco de dados
const mysql = require('mysql2');
require('dotenv').config(); // carrega as variáveis do arquivo .env

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// exporta a pool de conexões para ser usada em outros arquivos
module.exports = pool.promise();