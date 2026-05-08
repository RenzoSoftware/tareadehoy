/**
 * @fileoverview Rutas para gestión de Tipos de Comprobante
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { checkAuth, checkRole } = require('../middleware/auth');

// Listar todos
router.get('/', checkAuth, (req, res) => {
  db.query('SELECT * FROM tipos_comprobante', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Actualizar serie/correlativo (Solo Admin)
router.put('/:id', checkAuth, checkRole(['Administrador']), (req, res) => {
  const { id } = req.params;
  const { nombre, serie_actual, correlativo_actual } = req.body;
  
  const query = 'UPDATE tipos_comprobante SET nombre = ?, serie_actual = ?, correlativo_actual = ? WHERE id_tipo_comprobante = ?';
  db.query(query, [nombre, serie_actual, correlativo_actual, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Tipo de comprobante actualizado' });
  });
});

module.exports = router;
