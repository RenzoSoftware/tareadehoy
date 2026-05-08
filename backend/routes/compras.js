const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/compras - Listar todas con info de proveedor
router.get('/', (req, res) => {
  const query = `
    SELECT c.*, p.razon_social, p.ruc,
    (SELECT COUNT(*) FROM Compra_Detalle cd WHERE cd.id_compra = c.id_compra) as items_count
    FROM Compras c
    JOIN Proveedores p ON c.id_proveedor = p.id_proveedor
    ORDER BY c.fecha_compra DESC, c.id_compra DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener compras:', err);
      return res.status(500).json({ error: 'Error al obtener compras' });
    }
    res.json(results);
  });
});

// GET /api/compras/:id - Obtener detalle completo
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const queryCompra = `
    SELECT c.*, p.razon_social, p.ruc
    FROM Compras c
    JOIN Proveedores p ON c.id_proveedor = p.id_proveedor
    WHERE c.id_compra = ?
  `;
  
  db.query(queryCompra, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener compra' });
    if (results.length === 0) return res.status(404).json({ error: 'Compra no encontrada' });

    const compra = results[0];
    const queryDetalle = `
      SELECT cd.*, p.nombre_comercial
      FROM Compra_Detalle cd
      JOIN Productos p ON cd.id_producto = p.id_producto
      WHERE cd.id_compra = ?
    `;

    db.query(queryDetalle, [id], (err, detalle) => {
      if (err) return res.status(500).json({ error: 'Error al obtener detalle' });
      compra.detalle = detalle;
      res.json(compra);
    });
  });
});

// POST /api/compras - Registrar compra y actualizar stock
router.post('/', (req, res) => {
  const { id_proveedor, fecha_compra, nro_factura, forma_pago, estado, notas, total, detalle } = req.body;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });

    const queryCompra = `
      INSERT INTO Compras (id_proveedor, fecha_compra, nro_factura, forma_pago, estado, notas, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(queryCompra, [id_proveedor, fecha_compra, nro_factura, forma_pago, estado, notas, total], (err, result) => {
      if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

      const id_compra = result.insertId;
      const queryDetalle = 'INSERT INTO Compra_Detalle (id_compra, id_producto, cantidad, precio_unitario, subtotal) VALUES ?';
      const values = detalle.map(d => [id_compra, d.id_producto, d.cantidad, d.precio_unitario, d.subtotal]);

      db.query(queryDetalle, [values], (err) => {
        if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

        // Actualizar Stock (Lotes)
        // Por cada producto en el detalle, sumamos al stock_actual del lote más reciente o creamos uno nuevo
        // Para esta botica, asumiremos que existe al menos un lote o creamos uno genérico
        const stockPromises = detalle.map(item => {
          return new Promise((resolve, reject) => {
            // Buscamos si existe un lote para este producto
            db.query('SELECT id_lote FROM Lotes WHERE id_producto = ? LIMIT 1', [item.id_producto], (err, lotes) => {
              if (err) return reject(err);
              
              if (lotes.length > 0) {
                // Actualizamos el existente
                db.query('UPDATE Lotes SET stock_actual = stock_actual + ? WHERE id_lote = ?', [item.cantidad, lotes[0].id_lote], (err) => {
                  if (err) reject(err); else resolve();
                });
              } else {
                // Creamos uno genérico (vencimiento en 1 año por defecto)
                db.query('INSERT INTO Lotes (id_producto, numero_lote, fecha_vencimiento, stock_actual, stock_minimo) VALUES (?, ?, ?, ?, ?)', 
                  [item.id_producto, 'LOTE-GEN', new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], item.cantidad, 5], 
                  (err) => { if (err) reject(err); else resolve(); }
                );
              }
            });
          });
        });

        Promise.all(stockPromises)
          .then(() => {
            db.commit((err) => {
              if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
              res.json({ success: true, id_compra });
            });
          })
          .catch(err => {
            db.rollback(() => res.status(500).json({ error: err.message }));
          });
      });
    });
  });
});

// PUT /api/compras/:id - Actualizar estado (ej: Marcar como pagado)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const query = 'UPDATE Compras SET estado = ? WHERE id_compra = ?';
  db.query(query, [estado, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar estado' });
    res.json({ message: 'Estado actualizado' });
  });
});

// DELETE /api/compras/:id - Anular compra (revertir stock)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });

    // 1. Obtener el detalle para saber qué stock revertir
    db.query('SELECT id_producto, cantidad FROM Compra_Detalle WHERE id_compra = ?', [id], (err, detalle) => {
      if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

      // 2. Revertir stock
      const revertPromises = detalle.map(item => {
        return new Promise((resolve, reject) => {
          db.query('UPDATE Lotes SET stock_actual = stock_actual - ? WHERE id_producto = ? ORDER BY id_lote DESC LIMIT 1', [item.cantidad, item.id_producto], (err) => {
            if (err) reject(err); else resolve();
          });
        });
      });

      Promise.all(revertPromises)
        .then(() => {
          // 3. Cambiar estado a Anulado
          db.query('UPDATE Compras SET estado = "Anulado" WHERE id_compra = ?', [id], (err) => {
            if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

            db.commit((err) => {
              if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
              res.json({ success: true, message: 'Compra anulada y stock revertido' });
            });
          });
        })
        .catch(err => {
          db.rollback(() => res.status(500).json({ error: err.message }));
        });
    });
  });
});

module.exports = router;
