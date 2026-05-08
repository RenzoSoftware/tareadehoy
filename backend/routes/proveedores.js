const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/proveedores
router.get('/', (req, res) => {
    const query = 'SELECT * FROM Proveedores WHERE estado = 1 ORDER BY razon_social ASC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener proveedores:', err);
            return res.status(500).json({ error: 'Error al obtener proveedores' });
        }
        res.json(results);
    });
});

// GET /api/proveedores/:id
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM Proveedores WHERE id_proveedor = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener proveedor' });
        if (results.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
        res.json(results[0]);
    });
});

// POST /api/proveedores
router.post('/', (req, res) => {
    const { razon_social, ruc, direccion, telefono, correo, contacto_nombre } = req.body;
    const query = 'INSERT INTO Proveedores (razon_social, ruc, direccion, telefono, correo, contacto_nombre) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [razon_social, ruc, direccion, telefono, correo, contacto_nombre], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al crear proveedor' });
        res.status(201).json({ id: result.insertId, message: 'Proveedor creado con éxito' });
    });
});

// PUT /api/proveedores/:id
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { razon_social, ruc, direccion, telefono, correo, contacto_nombre, estado } = req.body;
    const query = 'UPDATE Proveedores SET razon_social = ?, ruc = ?, direccion = ?, telefono = ?, correo = ?, contacto_nombre = ?, estado = ? WHERE id_proveedor = ?';
    db.query(query, [razon_social, ruc, direccion, telefono, correo, contacto_nombre, estado, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar proveedor' });
        res.json({ message: 'Proveedor actualizado con éxito' });
    });
});

// DELETE /api/proveedores/:id (Baja lógica)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'UPDATE Proveedores SET estado = 0 WHERE id_proveedor = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al eliminar proveedor' });
        res.json({ message: 'Proveedor eliminado con éxito' });
    });
});

module.exports = router;
