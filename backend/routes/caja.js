const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/caja/hoy - Estado de la caja actual
router.get('/hoy', (req, res) => {
    // Buscamos la caja abierta más reciente
    const query = 'SELECT * FROM Cajas WHERE estado = "Abierta" ORDER BY id_caja DESC LIMIT 1';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || { estado: 'Cerrada' });
    });
});

// GET /api/caja/movimientos - Listar movimientos por fecha
router.get('/movimientos', (req, res) => {
    const { fecha } = req.query;
    const query = `
        SELECT m.*, u.nombre_completo as usuario 
        FROM Movimientos_Caja m 
        JOIN Usuarios u ON m.id_usuario = u.id_usuario 
        WHERE DATE(m.fecha_hora) = ? 
        ORDER BY m.fecha_hora DESC
    `;
    db.query(query, [fecha], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST /api/caja/abrir - Abrir caja
router.post('/abrir', (req, res) => {
    const { monto_inicial, observaciones } = req.body;
    const id_usuario = 1; // Simulado para este ejemplo, debería venir del token/sesión
    
    const query = 'INSERT INTO Cajas (monto_inicial, observaciones, estado, id_usuario, fecha_apertura) VALUES (?, ?, "Abierta", ?, NOW())';
    db.query(query, [monto_inicial, observaciones, id_usuario], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, message: 'Caja abierta' });
    });
});

// POST /api/caja/cerrar - Cerrar caja
router.post('/cerrar', (req, res) => {
    const { monto_contado, observaciones } = req.body;
    
    // 1. Encontrar caja abierta
    db.query('SELECT id_caja FROM Cajas WHERE estado = "Abierta" ORDER BY id_caja DESC LIMIT 1', (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ error: 'No hay una caja abierta para cerrar' });
        
        const id_caja = results[0].id_caja;
        const query = 'UPDATE Cajas SET monto_final = ?, observaciones_cierre = ?, estado = "Cerrada", fecha_cierre = NOW() WHERE id_caja = ?';
        
        db.query(query, [monto_contado, observaciones, id_caja], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Caja cerrada correctamente' });
        });
    });
});

// POST /api/caja/movimiento - Registrar movimiento
router.post('/movimiento', (req, res) => {
    const { tipo, categoria, monto, descripcion, forma_pago } = req.body;
    const id_usuario = 1; // Simulado

    const query = 'INSERT INTO Movimientos_Caja (tipo, categoria, monto, descripcion, forma_pago, id_usuario, fecha_hora) VALUES (?, ?, ?, ?, ?, ?, NOW())';
    db.query(query, [tipo, categoria, monto, descripcion, forma_pago, id_usuario], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Movimiento registrado' });
    });
});

module.exports = router;
