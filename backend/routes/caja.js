const express = require('express');
const router = express.Router();
const db = require('../db');
const { checkAuth, checkRole } = require('../middleware/auth');

// GET /api/caja/hoy - Estado de la caja actual con totales
router.get('/hoy', checkAuth, (req, res) => {
    const query = 'SELECT * FROM Cajas WHERE estado = "Abierta" ORDER BY id_caja DESC LIMIT 1';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length === 0) {
            return res.json({ estado: 'Cerrada' });
        }

        const caja = results[0];
        const fecha = new Date(caja.fecha_apertura).toISOString().split('T')[0];

        // Calcular totales de ventas por forma de pago y movimientos
        const queryTotales = `
            SELECT 
                SUM(CASE WHEN forma_pago = 'EFECTIVO' AND tipo = 'INGRESO' THEN monto ELSE 0 END) as ventas_efectivo,
                SUM(CASE WHEN forma_pago = 'TARJETA' AND tipo = 'INGRESO' THEN monto ELSE 0 END) as ventas_tarjeta,
                SUM(CASE WHEN (forma_pago = 'YAPE' OR forma_pago = 'PLIN') AND tipo = 'INGRESO' THEN monto ELSE 0 END) as ventas_digital,
                SUM(CASE WHEN tipo = 'INGRESO' THEN monto ELSE 0 END) as total_ingresos,
                SUM(CASE WHEN tipo = 'EGRESO' THEN monto ELSE 0 END) as total_egresos
            FROM Movimientos_Caja 
            WHERE DATE(fecha_hora) = ?
        `;

        db.query(queryTotales, [fecha], (err, totals) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                ...caja,
                resumen: totals[0]
            });
        });
    });
});

// GET /api/caja/movimientos - Listar movimientos por fecha
router.get('/movimientos', checkAuth, (req, res) => {
    const { fecha } = req.query;
    const query = `
        SELECT m.*, u.username as usuario 
        FROM Movimientos_Caja m 
        LEFT JOIN Usuarios u ON m.id_usuario = u.id_usuario 
        WHERE DATE(m.fecha_hora) = ? 
        ORDER BY m.fecha_hora DESC
    `;
    db.query(query, [fecha], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST /api/caja/abrir - Abrir caja
router.post('/abrir', checkAuth, (req, res) => {
    const { monto_inicial, observaciones } = req.body;
    const id_usuario = req.headers['x-user-id'] || 1;
    
    const query = 'INSERT INTO Cajas (monto_inicial, observaciones, estado, id_usuario, fecha_apertura) VALUES (?, ?, "Abierta", ?, NOW())';
    db.query(query, [monto_inicial, observaciones, id_usuario], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, message: 'Caja abierta' });
    });
});

// POST /api/caja/cerrar - Cerrar caja
router.post('/cerrar', checkAuth, (req, res) => {
    const { monto_contado, observaciones } = req.body;
    
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
router.post('/movimiento', checkAuth, (req, res) => {
    const { tipo, categoria, monto, descripcion, forma_pago } = req.body;
    const id_usuario = req.headers['x-user-id'] || 1;

    const query = 'INSERT INTO Movimientos_Caja (tipo, categoria, monto, descripcion, forma_pago, id_usuario, fecha_hora) VALUES (?, ?, ?, ?, ?, ?, NOW())';
    db.query(query, [tipo, categoria, monto, descripcion, forma_pago, id_usuario], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Movimiento registrado' });
    });
});

// GET /api/caja/reporte - Reporte de cierre
router.get('/reporte', checkAuth, (req, res) => {
    const { fecha } = req.query;
    
    const query = `
        SELECT 
            c.*,
            u.username as usuario_apertura,
            (SELECT SUM(monto) FROM Movimientos_Caja WHERE DATE(fecha_hora) = ? AND tipo = 'INGRESO') as total_ingresos,
            (SELECT SUM(monto) FROM Movimientos_Caja WHERE DATE(fecha_hora) = ? AND tipo = 'EGRESO') as total_egresos,
            (SELECT SUM(monto) FROM Movimientos_Caja WHERE DATE(fecha_hora) = ? AND tipo = 'INGRESO' AND forma_pago = 'EFECTIVO') as ventas_efectivo,
            (SELECT SUM(monto) FROM Movimientos_Caja WHERE DATE(fecha_hora) = ? AND tipo = 'INGRESO' AND forma_pago = 'TARJETA') as ventas_tarjeta,
            (SELECT SUM(monto) FROM Movimientos_Caja WHERE DATE(fecha_hora) = ? AND tipo = 'INGRESO' AND (forma_pago = 'YAPE' OR forma_pago = 'PLIN')) as ventas_digital
        FROM Cajas c
        LEFT JOIN Usuarios u ON c.id_usuario = u.id_usuario
        WHERE DATE(c.fecha_apertura) = ?
        ORDER BY c.id_caja DESC LIMIT 1
    `;

    db.query(query, [fecha, fecha, fecha, fecha, fecha, fecha], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || { error: 'No se encontró reporte para esta fecha' });
    });
});

module.exports = router;
