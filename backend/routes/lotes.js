/**
 * @fileoverview Rutas para la gestión de Lotes e Inventario
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { checkAuth, checkRole } = require('../middleware/auth');

// Listar lotes de un producto
router.get('/producto/:id', checkAuth, (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT * FROM Lotes 
    WHERE id_producto = ? 
    ORDER BY fecha_vencimiento ASC
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Registrar nuevo lote
router.post('/', checkAuth, checkRole(['Administrador', 'Almacenero']), (req, res) => {
  const { id_producto, numero_lote, fecha_vencimiento, stock_actual, stock_minimo } = req.body;
  const query = `
    INSERT INTO Lotes (id_producto, numero_lote, fecha_vencimiento, stock_actual, stock_minimo) 
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [id_producto, numero_lote, fecha_vencimiento, stock_actual, stock_minimo], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

// Actualizar stock de un lote (Ajuste manual)
router.patch('/:id/stock', checkAuth, checkRole(['Administrador', 'Almacenero']), (req, res) => {
  const { id } = req.params;
  const { nuevo_stock } = req.body;
  db.query('UPDATE Lotes SET stock_actual = ? WHERE id_lote = ?', [nuevo_stock, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
