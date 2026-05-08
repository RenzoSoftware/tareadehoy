const express = require('express');
const router = express.Router();
const db = require('../db');
const { checkAuth, checkRole } = require('../middleware/auth');

// Listar tipos de comprobantes
router.get('/comprobantes', (req, res) => {
  db.query('SELECT * FROM tipos_comprobante', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Resumen de ventas para reportes
router.get('/resumen', (req, res) => {
  const query = `
    SELECT 
      (SELECT SUM(total) FROM Ventas WHERE DATE(fecha_hora) = CURDATE() AND estado = 'ACTIVA') as hoy,
      (SELECT SUM(total) FROM Ventas WHERE MONTH(fecha_hora) = MONTH(CURDATE()) AND YEAR(fecha_hora) = YEAR(CURDATE()) AND estado = 'ACTIVA') as mes,
      (SELECT AVG(total) FROM Ventas WHERE estado = 'ACTIVA') as ticketPromedio,
      (SELECT COUNT(*) FROM Ventas WHERE estado = 'ACTIVA') as totalTransacciones
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

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

// Listar ventas con filtros
router.get('/', (req, res) => {
  const { desde, hasta, tipo, usuario } = req.query;
  let query = `
    SELECT 
      v.id_venta, v.fecha_hora, v.serie, v.correlativo, v.numero_completo, v.total,
      tc.nombre AS tipo_comprobante,
      c.nombres_razon AS cliente_nombre,
      CONCAT(e.nombres, ' ', e.apellidos) AS vendedor,
      (SELECT COUNT(*) FROM Detalle_Ventas dv WHERE dv.id_venta = v.id_venta) as cantidad_items
    FROM Ventas v
    JOIN Tipos_Comprobante tc ON v.id_tipo_comprobante = tc.id_tipo_comprobante
    LEFT JOIN Clientes c ON v.id_cliente = c.id_cliente
    JOIN Usuarios u ON v.id_usuario = u.id_usuario
    JOIN Empleados e ON u.id_empleado = e.id_empleado
    WHERE v.estado = 'ACTIVA'
  `;
  const params = [];

  if (desde) { query += ' AND DATE(v.fecha_hora) >= ?'; params.push(desde); }
  if (hasta) { query += ' AND DATE(v.fecha_hora) <= ?'; params.push(hasta); }
  if (tipo && tipo !== 'Todos') { query += ' AND tc.nombre = ?'; params.push(tipo); }
  if (usuario && usuario !== 'Todos') { query += ' AND CONCAT(e.nombres, \' \', e.apellidos) = ?'; params.push(usuario); }

  query += ' ORDER BY v.fecha_hora DESC';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Obtener detalle de una venta
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const queryVenta = `
    SELECT 
      v.*, tc.nombre AS tipo_comprobante,
      c.nombres_razon AS cliente_nombre,
      CONCAT(e.nombres, ' ', e.apellidos) AS vendedor
    FROM Ventas v
    JOIN Tipos_Comprobante tc ON v.id_tipo_comprobante = tc.id_tipo_comprobante
    LEFT JOIN Clientes c ON v.id_cliente = c.id_cliente
    JOIN Usuarios u ON v.id_usuario = u.id_usuario
    JOIN Empleados e ON u.id_empleado = e.id_empleado
    WHERE v.id_venta = ?
  `;
  
  db.query(queryVenta, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });

    const venta = results[0];
    const queryDetalle = `
      SELECT dv.*, p.nombre_comercial
      FROM Detalle_Ventas dv
      JOIN Productos p ON dv.id_producto = p.id_producto
      WHERE dv.id_venta = ?
    `;

    db.query(queryDetalle, [id], (err, detalle) => {
      if (err) return res.status(500).json({ error: err.message });
      venta.detalle = detalle;
      res.json(venta);
    });
  });
});

// Registrar venta
router.post('/', (req, res) => {
  const { id_cliente, id_usuario, id_tipo_comprobante, forma_pago, monto_recibido, total, detalle } = req.body;

  // Calcular subtotal e IGV a partir del total (precio ya incluye IGV)
  const subtotal = parseFloat((total / 1.18).toFixed(2));
  const igv      = parseFloat((total - subtotal).toFixed(2));

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });

    // serie y correlativo los asigna el trigger automáticamente
    const queryVenta = `
      INSERT INTO ventas (id_tipo_comprobante, id_cliente, id_usuario, forma_pago, monto_recibido, subtotal, igv, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(queryVenta, [id_tipo_comprobante, id_cliente, id_usuario, forma_pago || 'CONTADO', monto_recibido || total, subtotal, igv, total], (err, results) => {
      if (err) {
        console.error('Error INSERT ventas:', err);
        return db.rollback(() => res.status(500).json({ error: err.message }));
      }

      const idVenta = results.insertId;
      // detalle_ventas: subtotal es columna generada, no se inserta
      const queryDetalle = 'INSERT INTO detalle_ventas (id_venta, id_producto, id_precio, cantidad, precio_unitario) VALUES ?';
      const values = detalle.map(d => [idVenta, d.id_producto, d.id_precio || d.id_producto_precio, d.cantidad, d.precio_unitario]);

      db.query(queryDetalle, [values], (err) => {
        if (err) {
          console.error('Error INSERT detalle_ventas:', err);
          return db.rollback(() => res.status(500).json({ error: err.message }));
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => res.status(500).json({ error: err.message }));
          }
          res.json({ success: true, id_venta: idVenta });
        });
      });
    });
  });
});

module.exports = router;
