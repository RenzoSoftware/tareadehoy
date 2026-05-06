const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/login', (req, res) => {
  const { usuario, contrasena } = req.body;
  const query = 'SELECT * FROM usuarios WHERE username = ? AND password_hash = SHA2(?, 256)';
  
  db.query(query, [usuario, contrasena], (err, results) => {
    if (err) {
      console.error('Error en Login:', err);
      return res.status(500).json({ error: 'Error en el servidor', details: err.message });
    }
    
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  });
});

module.exports = router;