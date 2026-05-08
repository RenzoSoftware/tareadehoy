/**
 * @fileoverview Rutas CRUD de Clientes - Botica Nova Salud
 */

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { checkAuth, checkRole } = require('../middleware/auth');

// ── Helpers ──────────────────────────────────────────────────
const validarCliente = (body) => {
  const errores = [];
  const { nombres_razon, numero_documento, id_tipo_doc } = body;

  if (!nombres_razon || nombres_razon.trim().length < 3)
    errores.push('El nombre debe tener al menos 3 caracteres.');
  if (nombres_razon && nombres_razon.trim().length > 200)
    errores.push('El nombre no puede superar 200 caracteres.');
  if (!numero_documento || numero_documento.trim().length < 8)
    errores.push('El número de documento debe tener al menos 8 caracteres.');
  if (numero_documento && numero_documento.trim().length > 15)
    errores.push('El número de documento no puede superar 15 caracteres.');
  if (!id_tipo_doc)
    errores.push('El tipo de documento es requerido.');

  return errores;
};

// ─────────────────────────────────────────────────────────────
// GET /api/clientes  — Listar todos
// ─────────────────────────────────────────────────────────────
router.get('/', checkAuth, (req, res) => {
  const query = `
    SELECT c.*, tdi.descripcion AS tipo_doc_descripcion, tdi.codigo AS tipo_doc_codigo
    FROM Clientes c
    LEFT JOIN Tipo_Documento_Identidad tdi ON c.id_tipo_doc = tdi.id_tipo_doc
    ORDER BY c.nombres_razon ASC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener clientes' });
    res.json(results);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/clientes/tipos-doc  — Tipos de documento
// ─────────────────────────────────────────────────────────────
router.get('/tipos-doc', checkAuth, (req, res) => {
  db.query('SELECT * FROM Tipo_Documento_Identidad ORDER BY id_tipo_doc', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener tipos de documento' });
    res.json(results);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/clientes/buscar/:documento  — Buscar por documento
// ─────────────────────────────────────────────────────────────
router.get('/buscar/:documento', checkAuth, (req, res) => {
  const { documento } = req.params;
  const query = `
    SELECT c.*, tdi.descripcion AS tipo_doc_descripcion
    FROM Clientes c
    LEFT JOIN Tipo_Documento_Identidad tdi ON c.id_tipo_doc = tdi.id_tipo_doc
    WHERE c.numero_documento = ?
  `;
  db.query(query, [documento], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al buscar cliente' });
    if (results.length > 0) return res.json(results[0]);
    res.status(404).json({ message: 'Cliente no encontrado' });
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/clientes/:id  — Obtener uno
// ─────────────────────────────────────────────────────────────
router.get('/:id', checkAuth, (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const query = `
    SELECT c.*, tdi.descripcion AS tipo_doc_descripcion
    FROM Clientes c
    LEFT JOIN Tipo_Documento_Identidad tdi ON c.id_tipo_doc = tdi.id_tipo_doc
    WHERE c.id_cliente = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener cliente' });
    if (results.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(results[0]);
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/clientes  — Crear
// ─────────────────────────────────────────────────────────────
router.post('/', checkAuth, checkRole(['Administrador', 'Cajero']), (req, res) => {
  const errores = validarCliente(req.body);
  if (errores.length > 0) return res.status(400).json({ errores });

  const { nombres_razon, numero_documento, id_tipo_doc, direccion, telefono, email } = req.body;

  // Verificar duplicado
  db.query(
    'SELECT id_cliente FROM Clientes WHERE numero_documento = ? AND id_tipo_doc = ?',
    [numero_documento.trim(), id_tipo_doc],
    (err, existing) => {
      if (err) return res.status(500).json({ error: 'Error al verificar duplicado' });
      if (existing.length > 0)
        return res.status(409).json({ error: 'Ya existe un cliente con ese número de documento.' });

      const query = `
        INSERT INTO Clientes (id_tipo_doc, numero_documento, nombres_razon, direccion, telefono, email)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.query(
        query,
        [id_tipo_doc, numero_documento.trim(), nombres_razon.trim(),
         direccion?.trim() || null, telefono?.trim() || null, email?.trim() || null],
        (err2, result) => {
          if (err2) return res.status(500).json({ error: 'Error al crear cliente' });
          res.status(201).json({ success: true, id_cliente: result.insertId });
        }
      );
    }
  );
});

// ─────────────────────────────────────────────────────────────
// PUT /api/clientes/:id  — Actualizar
// ─────────────────────────────────────────────────────────────
router.put('/:id', checkAuth, checkRole(['Administrador', 'Cajero']), (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const errores = validarCliente(req.body);
  if (errores.length > 0) return res.status(400).json({ errores });

  const { nombres_razon, numero_documento, id_tipo_doc, direccion, telefono, email } = req.body;

  // Verificar duplicado excluyendo el propio registro
  db.query(
    'SELECT id_cliente FROM Clientes WHERE numero_documento = ? AND id_tipo_doc = ? AND id_cliente != ?',
    [numero_documento.trim(), id_tipo_doc, id],
    (err, existing) => {
      if (err) return res.status(500).json({ error: 'Error al verificar duplicado' });
      if (existing.length > 0)
        return res.status(409).json({ error: 'Ya existe otro cliente con ese número de documento.' });

      const query = `
        UPDATE Clientes
        SET id_tipo_doc = ?, numero_documento = ?, nombres_razon = ?,
            direccion = ?, telefono = ?, email = ?
        WHERE id_cliente = ?
      `;
      db.query(
        query,
        [id_tipo_doc, numero_documento.trim(), nombres_razon.trim(),
         direccion?.trim() || null, telefono?.trim() || null, email?.trim() || null, id],
        (err2, result) => {
          if (err2) return res.status(500).json({ error: 'Error al actualizar cliente' });
          if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
          res.json({ success: true });
        }
      );
    }
  );
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/clientes/:id  — Eliminar
// ─────────────────────────────────────────────────────────────
router.delete('/:id', checkAuth, checkRole(['Administrador']), (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  // Verificar si tiene ventas asociadas
  db.query('SELECT COUNT(*) AS total FROM Ventas WHERE id_cliente = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al verificar dependencias' });
    if (rows[0].total > 0)
      return res.status(409).json({
        error: `No se puede eliminar: el cliente tiene ${rows[0].total} venta(s) registrada(s).`
      });

    db.query('DELETE FROM Clientes WHERE id_cliente = ?', [id], (err2, result) => {
      if (err2) return res.status(500).json({ error: 'Error al eliminar cliente' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
      res.json({ success: true });
    });
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/clientes/top-frecuentes
// ─────────────────────────────────────────────────────────────
router.get('/top-frecuentes', checkAuth, (req, res) => {
  const query = `
    SELECT c.id_cliente, c.nombres_razon, COUNT(v.id_venta) as total_compras, SUM(v.total) as total_invertido
    FROM Clientes c
    JOIN Ventas v ON c.id_cliente = v.id_cliente
    WHERE v.estado = 'ACTIVA'
    GROUP BY c.id_cliente
    ORDER BY total_compras DESC
    LIMIT 5
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
