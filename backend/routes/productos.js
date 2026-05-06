const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar productos
router.get('/', (req, res) => {
  const query = `
    SELECT p.*, c.Nombre_Categoria, l.Nombre_Laboratorio, pr.Nombre_Presentacion, um.Nombre_Unidad
    FROM Productos p
    LEFT JOIN Categorias c ON p.ID_Categoria = c.ID_Categoria
    LEFT JOIN Laboratorios l ON p.ID_Laboratorio = l.ID_Laboratorio
    LEFT JOIN Presentaciones pr ON p.ID_Presentacion = pr.ID_Presentacion
    LEFT JOIN Unidades_Medida um ON p.ID_Unidad = um.ID_Unidad
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Buscar productos por nombre o código
router.get('/search', (req, res) => {
  const { term } = req.query;
  const query = `
    SELECT p.*, pp.Precio_Unidad, pp.Precio_Blister, pp.Precio_Caja
    FROM Productos p
    LEFT JOIN Productos_Precios pp ON p.ID_Producto = pp.ID_Producto
    WHERE p.Nombre_Producto LIKE ? OR p.Codigo_Producto LIKE ?
  `;
  const searchTerm = `%${term}%`;
  
  db.query(query, [searchTerm, searchTerm], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Agregar producto
router.post('/', (req, res) => {
  const { nombre, categoria, laboratorio, presentacion, unidad, stock } = req.body;
  const query = 'INSERT INTO Productos (Nombre_Producto, ID_Categoria, ID_Laboratorio, ID_Presentacion, ID_Unidad, Stock) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [nombre, categoria, laboratorio, presentacion, unidad, stock], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: results.insertId });
  });
});

module.exports = router;
