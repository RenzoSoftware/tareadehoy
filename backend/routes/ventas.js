const express = require('express');
const router = express.Router();
const db = require('../db');

// Resumen de ventas del día
router.get('/resumen-hoy', (req, res) => {
  const query = 'SELECT SUM(Total_Venta) as totalVentas, COUNT(*) as cantidadVentas FROM Ventas WHERE DATE(Fecha_Venta) = CURDATE()';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// Registrar venta
router.post('/', (req, res) => {
  const { id_cliente, id_usuario, id_tipo_comprobante, subtotal, igv, total, detalle } = req.body;
  
  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });

    const queryVenta = 'INSERT INTO Ventas (ID_Cliente, ID_Usuario, ID_Tipo_Comprobante, Subtotal, IGV, Total_Venta, Fecha_Venta) VALUES (?, ?, ?, ?, ?, ?, NOW())';
    
    db.query(queryVenta, [id_cliente, id_usuario, id_tipo_comprobante, subtotal, igv, total], (err, results) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: err.message });
        });
      }

      const idVenta = results.insertId;
      const queryDetalle = 'INSERT INTO Detalle_Ventas (ID_Venta, ID_Producto, Cantidad, Precio_Unitario, Subtotal) VALUES ?';
      const values = detalle.map(d => [idVenta, d.id_producto, d.cantidad, d.precio, d.subtotal]);

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
  db.query('SELECT * FROM Tipos_Comprobantes', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
