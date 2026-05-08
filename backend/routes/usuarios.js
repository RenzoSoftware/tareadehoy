const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/usuarios - Listar todos
router.get('/', (req, res) => {
    const query = 'SELECT id_usuario, nombre_completo, email, rol, turno, telefono, colegiatura, activo, ultimo_acceso FROM Usuarios ORDER BY id_usuario DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET /api/usuarios/:id - Detalle
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT id_usuario, nombre_completo, email, rol, turno, telefono, colegiatura, activo, ultimo_acceso FROM Usuarios WHERE id_usuario = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        
        // Simular historial para el frontend
        const usuario = results[0];
        usuario.historial = [
            { fecha: new Date(), accion: 'Inicio de sesión', modulo: 'Auth' },
            { fecha: new Date(Date.now() - 3600000), accion: 'Venta realizada', modulo: 'Ventas' }
        ];
        res.json(usuario);
    });
});

// POST /api/usuarios - Crear
router.post('/', (req, res) => {
    const { nombre_completo, email, password, rol, turno, telefono, colegiatura, activo } = req.body;
    const query = 'INSERT INTO Usuarios (nombre_completo, email, password_hash, rol, turno, telefono, colegiatura, activo) VALUES (?, ?, SHA2(?, 256), ?, ?, ?, ?, ?)';
    db.query(query, [nombre_completo, email, password, rol, turno, telefono, colegiatura, activo ? 1 : 0], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, message: 'Usuario creado' });
    });
});

// PUT /api/usuarios/:id - Editar
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nombre_completo, email, rol, turno, telefono, colegiatura, activo } = req.body;
    const query = 'UPDATE Usuarios SET nombre_completo = ?, email = ?, rol = ?, turno = ?, telefono = ?, colegiatura = ?, activo = ? WHERE id_usuario = ?';
    db.query(query, [nombre_completo, email, rol, turno, telefono, colegiatura, activo ? 1 : 0, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Usuario actualizado' });
    });
});

// PUT /api/usuarios/:id/estado - Toggle activo
router.put('/:id/estado', (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;
    const query = 'UPDATE Usuarios SET activo = ? WHERE id_usuario = ?';
    db.query(query, [activo ? 1 : 0, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Estado actualizado' });
    });
});

// DELETE /api/usuarios/:id - Eliminar
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Usuarios WHERE id_usuario = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Usuario eliminado' });
    });
});

module.exports = router;
