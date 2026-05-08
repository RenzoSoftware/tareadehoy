const express = require('express');
const router = express.Router();
const db = require('../db');

// Login
router.post('/login', (req, res) => {
  const { usuario, contrasena } = req.body;
  
  // Consulta extendida para obtener datos del empleado y su cargo
  // Se obtienen los datos del empleado y su cargo mediante JOINs
  const query = `
    SELECT 
      u.id_usuario, u.username, u.estado,
      e.nombres, e.apellidos,
      c.nombre AS cargo,
      c.id_cargo
    FROM usuarios u
    JOIN empleados e ON u.id_empleado = e.id_empleado
    JOIN cargos c    ON e.id_cargo    = c.id_cargo
    WHERE u.username = ? AND u.password_hash = SHA2(?, 256)
  `;
  
  db.query(query, [usuario, contrasena], (err, results) => {
    if (err) {
      console.error('Error en Login:', err);
      return res.status(500).json({ error: 'Error en el servidor', details: err.message });
    }
    
    if (results.length > 0) {
      const user = results[0];
      if (user.estado === 0) {
        return res.status(403).json({ success: false, message: 'Usuario deshabilitado' });
      }
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  });
});

module.exports = router;
