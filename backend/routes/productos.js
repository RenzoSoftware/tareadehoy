const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar productos con sus categorías y laboratorios
router.get('/', (req, res) => {
  const query = `
    SELECT p.id_producto, p.nombre_comercial, p.principio_activo, p.stock_actual_unidades, p.stock_minimo_unidades, p.fecha_vencimiento,
           c.nombre_categoria, l.nombre_laboratorio
    FROM productos p
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    LEFT JOIN laboratorios l ON p.id_laboratorio = l.id_laboratorio
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al listar productos:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Buscar productos por nombre o código para la venta
router.get('/search', (req, res) => {
  const { term } = req.query;
  const query = `
    SELECT p.id_producto, p.nombre_comercial, p.stock_actual_unidades,
           pp.precio_unitario, pp.id_producto_precio
    FROM productos p
    LEFT JOIN detalle_ventas pp ON p.id_producto = pp.id_producto
    WHERE p.nombre_comercial LIKE ?
    GROUP BY p.id_producto
  `;
  const searchTerm = `%${term}%`;
  
  db.query(query, [searchTerm], (err, results) => {
    if (err) {
      console.error('Error al buscar productos:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
