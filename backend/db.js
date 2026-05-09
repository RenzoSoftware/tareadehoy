const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'boticanovasalud'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ ERROR DE CONEXIÓN A DB:');
    console.error('Mensaje:', err.message);
    console.error('Código:', err.code);
    console.error('Host:', process.env.DB_HOST || 'localhost');
    console.error('Base de datos:', process.env.DB_NAME || 'boticanovasalud');
    return;
  }
  console.log('✅ Conectado exitosamente a MySQL: ' + (process.env.DB_NAME || 'boticanovasalud'));
});

module.exports = connection;
