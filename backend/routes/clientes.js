const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar clientes
router.get('/', (req, res) => {
  db.query('SELECT * FROM Clientes', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Buscar cliente por documento
router.get('/buscar/:documento', (req, res) => {
  const { documento } = req.params;
  db.query('SELECT * FROM Clientes WHERE Numero_Documento = ?', [documento], (err, results) => {
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
  const { nombre, tipo_doc, num_doc, direccion, telefono } = req.body;
  const query = 'INSERT INTO Clientes (Nombre_Cliente, Tipo_Documento, Numero_Documento, Direccion, Telefono) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [nombre, tipo_doc, num_doc, direccion, telefono], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: results.insertId });
  });
});

module.exports = router;
