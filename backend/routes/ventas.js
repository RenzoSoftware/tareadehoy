const express = require('express');
const router = express.Router();
const db = require('../db');

// Resumen de ventas del día
router.get('/resumen-hoy', (req, res) => {
  const query = 'SELECT SUM(total) as totalVentas, COUNT(*) as cantidadVentas FROM ventas WHERE DATE(fecha_hora) = CURDATE()';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
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
