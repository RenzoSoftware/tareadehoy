const express = require('express');
const router = express.Router();
const db = require('../db');

// Resumen de ventas del día
router.get('/resumen-hoy', (req, res) => {
  const query = 'SELECT SUM(total) as totalVentas, COUNT(*) as cantidadVentas FROM Ventas WHERE DATE(fecha_hora) = CURDATE() AND estado = "ACTIVA"';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// Top 5 productos más vendidos con rango de días configurable
router.get('/top-vendidos', (req, res) => {
  const { dias = 30 } = req.query;
  const query = `
    SELECT 
      p.nombre_comercial,
      SUM(dv.cantidad) as total_vendido
    FROM Detalle_Ventas dv
    JOIN Productos p ON dv.id_producto = p.id_producto
    JOIN Ventas v ON dv.id_venta = v.id_venta
    WHERE v.fecha_hora >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      AND v.estado = 'ACTIVA'
    GROUP BY p.id_producto
    ORDER BY total_vendido DESC
    LIMIT 5
  `;
  
  db.query(query, [parseInt(dias)], (err, results) => {
    if (err) {
      console.error('Error al obtener top vendidos:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Registrar venta
router.post('/', (req, res) => {
  const { id_cliente, id_usuario, id_tipo_comprobante, serie_documento, numero_documento, total, detalle } = req.body;
  
  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });

    const queryVenta = `
      INSERT INTO ventas (id_cliente, id_usuario, id_tipo_comprobante, serie_documento, numero_documento, total, fecha_hora) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    
    db.query(queryVenta, [id_cliente, id_usuario, id_tipo_comprobante, serie_documento, numero_documento, total], (err, results) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: err.message });
        });
      }

      const idVenta = results.insertId;
      const queryDetalle = 'INSERT INTO detalle_ventas (id_venta, id_producto, id_producto_precio, cantidad, precio_unitario, subtotal) VALUES ?';
      const values = detalle.map(d => [idVenta, d.id_producto, d.id_producto_precio, d.cantidad, d.precio_unitario, d.subtotal]);

      db.query(queryDetalle, [values], (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: err.message });
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: err.message });
            });
          }
          res.json({ success: true, id_venta: idVenta });
        });
      });
    });
  });
});

// Listar tipos de comprobantes
router.get('/comprobantes', (req, res) => {
  db.query('SELECT * FROM tipos_comprobantes', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
