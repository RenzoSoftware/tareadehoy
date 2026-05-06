const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar clientes
router.get('/', (req, res) => {
  db.query('SELECT * FROM clientes', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Buscar cliente por número de documento
router.get('/buscar/:documento', (req, res) => {
  const { documento } = req.params;
  const query = 'SELECT * FROM clientes WHERE numero_documento = ?';
  db.query(query, [documento], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  });
});

// Registrar cliente
router.post('/', (req, res) => {
  const { nombre, num_doc } = req.body;
  const query = 'INSERT INTO clientes (nombres_razon_social, numero_documento) VALUES (?, ?)';
  
  db.query(query, [nombre, num_doc], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id_cliente: results.insertId });
  });
});

module.exports = router;
