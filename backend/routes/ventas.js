const express = require('express');
const router = express.Router();
const db = require('../db');
const { checkAuth, checkRole } = require('../middleware/auth');

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

// Registrar venta usando el procedimiento almacenado
router.post('/', async (req, res) => {
  const { id_cliente, id_usuario, id_tipo_comprobante, forma_pago, monto_recibido, detalle } = req.body;
  
  try {
    // Para cada producto en el detalle, buscamos el lote más próximo a vencer con stock
    const detalleConLotes = await Promise.all(detalle.map(async (item) => {
      return new Promise((resolve, reject) => {
        const queryLote = `
          SELECT id_lote 
          FROM lotes 
          WHERE id_producto = ? AND stock_actual >= ? 
          ORDER BY fecha_vencimiento ASC 
          LIMIT 1
        `;
        db.query(queryLote, [item.id_producto, item.cantidad], (err, results) => {
          if (err) return reject(err);
          if (results.length === 0) return reject(new Error(`Stock insuficiente para el producto ID ${item.id_producto}`));
          resolve({
            id_precio: item.id_producto_precio,
            id_lote: results[0].id_lote,
            cantidad: item.cantidad
          });
        });
      });
    }));

    const query = 'CALL sp_registrar_venta(?, ?, ?, ?, ?, ?, @p_id_venta, @p_mensaje)';
    const params = [
      id_tipo_comprobante,
      id_cliente,
      id_usuario,
      forma_pago || 'CONTADO',
      monto_recibido || 0,
      JSON.stringify(detalleConLotes)
    ];

    db.query(query, params, (err) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query('SELECT @p_id_venta AS id_venta, @p_mensaje AS mensaje', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const { id_venta, mensaje } = results[0];
        if (id_venta === -1) {
          return res.status(400).json({ error: mensaje });
        }
        res.json({ success: true, id_venta, mensaje });
      });
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar tipos de comprobantes (corregido el nombre de la tabla)
router.get('/comprobantes', (req, res) => {
  db.query('SELECT * FROM tipos_comprobante', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Listar todas las ventas con detalle
router.get('/', checkAuth, (req, res) => {
  const query = `
    SELECT v.*, c.nombres_razon, u.username, tc.nombre AS tipo_comprobante
    FROM Ventas v
    JOIN Clientes c ON v.id_cliente = c.id_cliente
    JOIN Usuarios u ON v.id_usuario = u.id_usuario
    JOIN Tipos_Comprobante tc ON v.id_tipo_comprobante = tc.id_tipo_comprobante
    ORDER BY v.fecha_hora DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Obtener detalle de una venta
router.get('/:id', checkAuth, (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT dv.*, p.nombre_comercial, p.principio_activo
    FROM Detalle_Ventas dv
    JOIN Productos p ON dv.id_producto = p.id_producto
    WHERE dv.id_venta = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Anular venta
router.patch('/:id/anular', checkAuth, checkRole(['Administrador']), (req, res) => {
  const { id } = req.params;
  
  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });

    // 1. Cambiar estado de la venta
    db.query('UPDATE Ventas SET estado = "ANULADA" WHERE id_venta = ?', [id], (err1) => {
      if (err1) return db.rollback(() => res.status(500).json({ error: err1.message }));

      // 2. Reponer stock de los lotes
      const queryDetalle = 'SELECT id_lote, cantidad FROM Detalle_Ventas WHERE id_venta = ?';
      db.query(queryDetalle, [id], (err2, items) => {
        if (err2) return db.rollback(() => res.status(500).json({ error: err2.message }));

        const updatePromises = items.map(item => {
          return new Promise((resolve, reject) => {
            db.query('UPDATE Lotes SET stock_actual = stock_actual + ? WHERE id_lote = ?', [item.cantidad, item.id_lote], (err3) => {
              if (err3) reject(err3);
              else resolve();
            });
          });
        });

        Promise.all(updatePromises)
          .then(() => {
            db.commit((err4) => {
              if (err4) return db.rollback(() => res.status(500).json({ error: err4.message }));
              res.json({ success: true, message: 'Venta anulada y stock repuesto.' });
            });
          })
          .catch(error => {
            db.rollback(() => res.status(500).json({ error: error.message }));
          });
      });
    });
  });
});

module.exports = router;
