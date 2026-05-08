/**
 * @fileoverview Rutas CRUD de Productos - Botica Nova Salud
 */

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { checkAuth, checkRole } = require('../middleware/auth');

// ── Helpers ──────────────────────────────────────────────────
const validarProducto = (body) => {
  const errores = [];
  const { nombre_comercial, id_laboratorio, id_categoria, id_presentacion } = body;

  if (!nombre_comercial || nombre_comercial.trim().length < 2)
    errores.push('El nombre comercial debe tener al menos 2 caracteres.');
  if (nombre_comercial && nombre_comercial.trim().length > 150)
    errores.push('El nombre comercial no puede superar 150 caracteres.');
  if (!id_laboratorio) errores.push('El laboratorio es requerido.');
  if (!id_categoria)   errores.push('La categoría es requerida.');
  if (!id_presentacion) errores.push('La presentación es requerida.');

  return errores;
};

// ─────────────────────────────────────────────────────────────
// GET /api/productos  — Listar todos
// ─────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const query = `
    SELECT
      p.id_producto, p.nombre_comercial, p.principio_activo, p.concentracion,
      p.requiere_receta, p.descripcion, p.estado,
      p.id_categoria, p.id_laboratorio, p.id_presentacion,
      c.nombre  AS nombre_categoria,
      l.nombre  AS nombre_laboratorio,
      pres.nombre AS nombre_presentacion,
      SUM(lo.stock_actual)  AS stock_total,
      MIN(lo.stock_minimo)  AS stock_minimo,
      MIN(lo.fecha_vencimiento) AS proximo_vencimiento,
      DATEDIFF(MIN(lo.fecha_vencimiento), CURDATE()) AS dias_para_vencer
    FROM Productos p
    LEFT JOIN Categorias     c    ON p.id_categoria    = c.id_categoria
    LEFT JOIN Laboratorios   l    ON p.id_laboratorio  = l.id_laboratorio
    LEFT JOIN Presentaciones pres ON p.id_presentacion = pres.id_presentacion
    LEFT JOIN Lotes          lo   ON p.id_producto     = lo.id_producto
    WHERE p.estado = 1
    GROUP BY p.id_producto
    ORDER BY p.nombre_comercial ASC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener productos' });
    res.json(results);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/productos/catalogos  — Categorías, labs, presentaciones
// ─────────────────────────────────────────────────────────────
router.get('/catalogos', (req, res) => {
  // Ejecutamos las 3 queries en paralelo y esperamos todas
  const sqlCategorias     = 'SELECT id_categoria AS id, nombre FROM Categorias WHERE estado = 1 ORDER BY nombre';
  const sqlLaboratorios   = 'SELECT id_laboratorio AS id, nombre FROM Laboratorios WHERE estado = 1 ORDER BY nombre';
  const sqlPresentaciones = 'SELECT id_presentacion AS id, nombre FROM Presentaciones ORDER BY nombre';

  let done = 0;
  const result = {};
  let hasError = false;

  const finish = (key, err, rows) => {
    if (hasError) return;
    if (err) {
      hasError = true;
      console.error(`Error al obtener ${key}:`, err);
      return res.status(500).json({ error: `Error al obtener ${key}: ${err.message}` });
    }
    result[key] = rows;
    done++;
    if (done === 3) res.json(result);
  };

  db.query(sqlCategorias,     (err, rows) => finish('categorias',     err, rows));
  db.query(sqlLaboratorios,   (err, rows) => finish('laboratorios',   err, rows));
  db.query(sqlPresentaciones, (err, rows) => finish('presentaciones', err, rows));
});

// ─────────────────────────────────────────────────────────────
// GET /api/productos/criticos
// ─────────────────────────────────────────────────────────────
router.get('/criticos', (req, res) => {
  const query = `
    SELECT p.id_producto, p.nombre_comercial, p.principio_activo,
           c.nombre AS nombre_categoria,
           SUM(lo.stock_actual) AS stock_total,
           MIN(lo.stock_minimo) AS stock_minimo
    FROM Productos p
    LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria
    LEFT JOIN Lotes lo     ON p.id_producto  = lo.id_producto
    WHERE p.estado = 1
    GROUP BY p.id_producto, p.nombre_comercial, p.principio_activo, c.nombre
    HAVING stock_total <= stock_minimo OR stock_total IS NULL
    ORDER BY stock_total ASC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener productos críticos' });
    res.json(results);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/productos/por-vencer?categoria=
// ─────────────────────────────────────────────────────────────
router.get('/por-vencer', (req, res) => {
  const { categoria } = req.query;
  const params = [];
  let havingClause = '';

  if (categoria && ['CRITICO', 'PROXIMO', 'NORMAL'].includes(categoria.toUpperCase())) {
    havingClause = 'HAVING categoria_vencimiento = ?';
    params.push(categoria.toUpperCase());
  }

  const query = `
    SELECT p.id_producto, p.nombre_comercial, p.principio_activo,
           c.nombre AS nombre_categoria,
           l.nombre AS nombre_laboratorio,
           lo.id_lote, lo.numero_lote, lo.fecha_vencimiento, lo.stock_actual,
           DATEDIFF(lo.fecha_vencimiento, CURDATE()) AS dias_para_vencer,
           CASE
             WHEN DATEDIFF(lo.fecha_vencimiento, CURDATE()) <= 7  THEN 'CRITICO'
             WHEN DATEDIFF(lo.fecha_vencimiento, CURDATE()) <= 30 THEN 'PROXIMO'
             ELSE 'NORMAL'
           END AS categoria_vencimiento
    FROM Lotes lo
    JOIN Productos p         ON lo.id_producto   = p.id_producto
    LEFT JOIN Categorias c   ON p.id_categoria   = c.id_categoria
    LEFT JOIN Laboratorios l ON p.id_laboratorio = l.id_laboratorio
    WHERE p.estado = 1 AND lo.stock_actual > 0
      AND lo.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    ${havingClause}
    ORDER BY lo.fecha_vencimiento ASC
  `;
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener alertas de vencimiento' });
    res.json(results);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/productos/search?term=
// ─────────────────────────────────────────────────────────────
router.get('/search', (req, res) => {
  const { term } = req.query;
  if (!term || term.trim().length === 0) return res.json([]);

  const searchTerm = `%${term.trim()}%`;
  const query = `
    SELECT p.id_producto, p.nombre_comercial, p.principio_activo, p.concentracion,
           c.nombre AS nombre_categoria,
           l.nombre AS nombre_laboratorio,
           pres.nombre AS nombre_presentacion,
           SUM(lo.stock_actual) AS stock_total,
           MIN(pp.precio_venta) AS precio_unitario,
           pp.id_precio         AS id_producto_precio
    FROM Productos p
    LEFT JOIN Categorias      c    ON p.id_categoria    = c.id_categoria
    LEFT JOIN Laboratorios    l    ON p.id_laboratorio  = l.id_laboratorio
    LEFT JOIN Presentaciones  pres ON p.id_presentacion = pres.id_presentacion
    LEFT JOIN Lotes           lo   ON p.id_producto     = lo.id_producto
    LEFT JOIN Producto_Precios pp  ON p.id_producto     = pp.id_producto AND pp.activo = 1
    WHERE p.estado = 1
      AND (p.nombre_comercial LIKE ? OR p.principio_activo LIKE ?)
    GROUP BY p.id_producto, pp.id_precio
    ORDER BY
      CASE WHEN p.nombre_comercial LIKE ? THEN 0 ELSE 1 END,
      p.principio_activo ASC, p.nombre_comercial ASC
    LIMIT 20
  `;
  db.query(query, [searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al buscar productos' });
    res.json(results);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/productos/sin-movimiento
// ─────────────────────────────────────────────────────────────
router.get('/sin-movimiento', (req, res) => {
  const query = `
    SELECT 
      p.id_producto, p.nombre_comercial,
      c.nombre AS nombre_categoria,
      SUM(lo.stock_actual) AS stock_total,
      MAX(v.fecha_hora) AS ultima_venta,
      DATEDIFF(CURDATE(), MAX(v.fecha_hora)) AS dias_sin_venta
    FROM Productos p
    LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria
    LEFT JOIN Lotes lo ON p.id_producto = lo.id_producto
    LEFT JOIN Detalle_Ventas dv ON p.id_producto = dv.id_producto
    LEFT JOIN Ventas v ON dv.id_venta = v.id_venta
    WHERE p.estado = 1
    GROUP BY p.id_producto
    HAVING dias_sin_venta >= 30 OR ultima_venta IS NULL
    ORDER BY dias_sin_venta DESC
    LIMIT 10
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener productos sin movimiento' });
    res.json(results);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/productos/resumen-stock
// ─────────────────────────────────────────────────────────────
router.get('/resumen-stock', (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN stock_total > stock_min THEN 1 ELSE 0 END) as normal,
      SUM(CASE WHEN stock_total <= stock_min AND stock_total > 0 THEN 1 ELSE 0 END) as critico,
      SUM(CASE WHEN stock_total <= 0 OR stock_total IS NULL THEN 1 ELSE 0 END) as sinStock
    FROM (
      SELECT p.id_producto, SUM(lo.stock_actual) as stock_total, MIN(lo.stock_minimo) as stock_min
      FROM Productos p
      LEFT JOIN Lotes lo ON p.id_producto = lo.id_producto
      WHERE p.estado = 1
      GROUP BY p.id_producto
    ) as t
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener resumen de stock' });
    res.json(results[0]);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/productos/vencimientos
// ─────────────────────────────────────────────────────────────
router.get('/vencimientos', (req, res) => {
  const { desde, hasta, categoria, laboratorio } = req.query;
  let query = `
    SELECT 
      p.id_producto, p.nombre_comercial, p.principio_activo,
      c.nombre AS nombre_categoria,
      l.nombre AS nombre_laboratorio,
      lo.numero_lote AS lote, lo.stock_actual, lo.fecha_vencimiento,
      DATEDIFF(lo.fecha_vencimiento, CURDATE()) AS dias_restantes
    FROM Lotes lo
    JOIN Productos p ON lo.id_producto = p.id_producto
    LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria
    LEFT JOIN Laboratorios l ON p.id_laboratorio = l.id_laboratorio
    WHERE p.estado = 1 AND lo.stock_actual > 0
  `;
  const params = [];

  if (desde) { query += ' AND lo.fecha_vencimiento >= ?'; params.push(desde); }
  if (hasta) { query += ' AND lo.fecha_vencimiento <= ?'; params.push(hasta); }
  if (categoria && categoria !== 'Todos') { query += ' AND c.nombre = ?'; params.push(categoria); }
  if (laboratorio && laboratorio !== 'Todos') { query += ' AND l.nombre = ?'; params.push(laboratorio); }

  query += ' ORDER BY lo.fecha_vencimiento ASC';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener vencimientos' });
    res.json(results);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/productos/resumen-vencimientos
// ─────────────────────────────────────────────────────────────
router.get('/resumen-vencimientos', (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN DATEDIFF(fecha_vencimiento, CURDATE()) <= 0 THEN 1 ELSE 0 END) as vencidos,
      SUM(CASE WHEN DATEDIFF(fecha_vencimiento, CURDATE()) BETWEEN 1 AND 7 THEN 1 ELSE 0 END) as vencen7,
      SUM(CASE WHEN DATEDIFF(fecha_vencimiento, CURDATE()) BETWEEN 1 AND 30 THEN 1 ELSE 0 END) as vencen30,
      SUM(CASE WHEN DATEDIFF(fecha_vencimiento, CURDATE()) BETWEEN 1 AND 90 THEN 1 ELSE 0 END) as vencen90
    FROM Lotes
    WHERE stock_actual > 0
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener resumen de vencimientos' });
    res.json(results[0]);
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/productos/:id/baja
// ─────────────────────────────────────────────────────────────
router.post('/:id/baja', (req, res) => {
  const { id } = req.params;
  const { motivo, cantidad, observaciones } = req.body;
  
  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });

    // Restar del lote más próximo a vencer
    const queryUpdate = `
      UPDATE Lotes 
      SET stock_actual = stock_actual - ? 
      WHERE id_producto = ? AND stock_actual >= ? 
      ORDER BY fecha_vencimiento ASC 
      LIMIT 1
    `;
    
    db.query(queryUpdate, [cantidad, id, cantidad], (err, result) => {
      if (err || result.affectedRows === 0) {
        return db.rollback(() => res.status(500).json({ error: 'Error al descontar stock para baja' }));
      }

      // Registrar en historial de bajas (si existiera la tabla, si no, solo el log)
      console.log(`Baja registrada: Prod ${id}, Cant ${cantidad}, Motivo ${motivo}, Obs: ${observaciones}`);

      db.commit((err) => {
        if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
        res.json({ success: true, message: 'Baja procesada correctamente' });
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/productos/:id  — Obtener uno
// ─────────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const query = `
    SELECT p.*, c.nombre AS nombre_categoria, l.nombre AS nombre_laboratorio, pres.nombre AS nombre_presentacion
    FROM Productos p
    LEFT JOIN Categorias     c    ON p.id_categoria    = c.id_categoria
    LEFT JOIN Laboratorios   l    ON p.id_laboratorio  = l.id_laboratorio
    LEFT JOIN Presentaciones pres ON p.id_presentacion = pres.id_presentacion
    WHERE p.id_producto = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener producto' });
    if (results.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(results[0]);
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/productos  — Crear
// ─────────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const errores = validarProducto(req.body);
  if (errores.length > 0) return res.status(400).json({ errores });

  const {
    codigo_barra, nombre_comercial, principio_activo, concentracion,
    id_laboratorio, id_categoria, id_presentacion,
    requiere_receta = 0, descripcion,
  } = req.body;

  // Verificar nombre duplicado
  db.query(
    'SELECT id_producto FROM Productos WHERE nombre_comercial = ? AND estado = 1',
    [nombre_comercial.trim()],
    (err, existing) => {
      if (err) return res.status(500).json({ error: 'Error al verificar duplicado' });
      if (existing.length > 0)
        return res.status(409).json({ error: 'Ya existe un producto con ese nombre comercial.' });

      const query = `
        INSERT INTO Productos
          (codigo_barra, nombre_comercial, principio_activo, concentracion,
           id_laboratorio, id_categoria, id_presentacion, requiere_receta, descripcion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        query,
        [codigo_barra?.trim() || null, nombre_comercial.trim(),
         principio_activo?.trim() || null, concentracion?.trim() || null,
         id_laboratorio, id_categoria, id_presentacion,
         requiere_receta ? 1 : 0, descripcion?.trim() || null],
        (err2, result) => {
          if (err2) return res.status(500).json({ error: 'Error al crear producto' });
          res.status(201).json({ success: true, id_producto: result.insertId });
        }
      );
    }
  );
});

// ─────────────────────────────────────────────────────────────
// PUT /api/productos/:id  — Actualizar
// ─────────────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const errores = validarProducto(req.body);
  if (errores.length > 0) return res.status(400).json({ errores });

  const {
    codigo_barra, nombre_comercial, principio_activo, concentracion,
    id_laboratorio, id_categoria, id_presentacion,
    requiere_receta = 0, descripcion,
  } = req.body;

  // Verificar nombre duplicado excluyendo el propio
  db.query(
    'SELECT id_producto FROM Productos WHERE nombre_comercial = ? AND estado = 1 AND id_producto != ?',
    [nombre_comercial.trim(), id],
    (err, existing) => {
      if (err) return res.status(500).json({ error: 'Error al verificar duplicado' });
      if (existing.length > 0)
        return res.status(409).json({ error: 'Ya existe otro producto con ese nombre comercial.' });

      const query = `
        UPDATE Productos SET
          codigo_barra = ?, nombre_comercial = ?, principio_activo = ?,
          concentracion = ?, id_laboratorio = ?, id_categoria = ?,
          id_presentacion = ?, requiere_receta = ?, descripcion = ?
        WHERE id_producto = ? AND estado = 1
      `;
      db.query(
        query,
        [codigo_barra?.trim() || null, nombre_comercial.trim(),
         principio_activo?.trim() || null, concentracion?.trim() || null,
         id_laboratorio, id_categoria, id_presentacion,
         requiere_receta ? 1 : 0, descripcion?.trim() || null, id],
        (err2, result) => {
          if (err2) return res.status(500).json({ error: 'Error al actualizar producto' });
          if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
          res.json({ success: true });
        }
      );
    }
  );
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/productos/:id  — Baja lógica (estado = 0)
// ─────────────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  // Verificar si tiene ventas
  db.query(
    'SELECT COUNT(*) AS total FROM Detalle_Ventas WHERE id_producto = ?',
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Error al verificar dependencias' });
      if (rows[0].total > 0)
        return res.status(409).json({
          error: `No se puede eliminar: el producto tiene ${rows[0].total} venta(s) registrada(s). Se realizará una baja lógica.`,
          canSoftDelete: true,
        });

      // Sin ventas: eliminar físicamente
      db.query('DELETE FROM Productos WHERE id_producto = ?', [id], (err2, result) => {
        if (err2) return res.status(500).json({ error: 'Error al eliminar producto' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ success: true, tipo: 'fisico' });
      });
    }
  );
});

// ─────────────────────────────────────────────────────────────
// PATCH /api/productos/:id/desactivar  — Baja lógica forzada
// ─────────────────────────────────────────────────────────────
router.patch('/:id/desactivar', (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  db.query(
    'UPDATE Productos SET estado = 0 WHERE id_producto = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al desactivar producto' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json({ success: true, tipo: 'logico' });
    }
  );
});

module.exports = router;
