/**
 * @fileoverview Rutas para la gestión de Catálogos (Categorías, Laboratorios, Presentaciones)
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { checkAuth, checkRole } = require('../middleware/auth');

// ── Categorías ────────────────────────────────────────────────
router.get('/categorias', (req, res) => {
  db.query('SELECT * FROM Categorias WHERE estado = 1 ORDER BY nombre', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/categorias', checkAuth, checkRole(['Administrador']), (req, res) => {
  const { nombre, descripcion } = req.body;
  db.query('INSERT INTO Categorias (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

router.put('/categorias/:id', checkAuth, checkRole(['Administrador']), (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  db.query('UPDATE Categorias SET nombre = ?, descripcion = ? WHERE id_categoria = ?', [nombre, descripcion, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

router.delete('/categorias/:id', checkAuth, checkRole(['Administrador']), (req, res) => {
  const { id } = req.params;
  db.query('UPDATE Categorias SET estado = 0 WHERE id_categoria = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ── Laboratorios ──────────────────────────────────────────────
router.get('/laboratorios', (req, res) => {
  db.query('SELECT * FROM Laboratorios WHERE estado = 1 ORDER BY nombre', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/laboratorios', checkAuth, checkRole(['Administrador', 'Almacenero']), (req, res) => {
  const { nombre, pais_origen, ruc, contacto, telefono, email } = req.body;
  db.query(
    'INSERT INTO Laboratorios (nombre, pais_origen, ruc, contacto, telefono, email) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, pais_origen, ruc, contacto, telefono, email],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: result.insertId });
    }
  );
});

// ── Presentaciones ────────────────────────────────────────────
router.get('/presentaciones', (req, res) => {
  db.query('SELECT * FROM Presentaciones ORDER BY nombre', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/presentaciones', checkAuth, checkRole(['Administrador', 'Almacenero']), (req, res) => {
  const { nombre } = req.body;
  db.query('INSERT INTO Presentaciones (nombre) VALUES (?)', [nombre], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

module.exports = router;
