const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000, // 60 segundos
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
});

// Teste de conexão
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    console.error('Host:', process.env.DB_HOST);
    console.error('Port:', process.env.DB_PORT);
    console.error('User:', process.env.DB_USER);
    console.error('Database:', process.env.DB_NAME);
  } else {
    console.log('✅ Conectado ao banco de dados MySQL!');
    connection.release();
  }
});

module.exports = pool.promise();