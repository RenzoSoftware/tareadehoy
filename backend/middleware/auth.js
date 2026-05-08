/**
 * @fileoverview Middleware de autenticación y autorización
 */

const checkAuth = (req, res, next) => {
  // En un entorno real, aquí se verificaría un token JWT.
  // Por ahora, usamos los headers que el frontend enviará para demostración
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'No autorizado. Inicie sesión.' });
  }
  next();
};

const checkRole = (rolesPermitidos) => {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (!rolesPermitidos.includes(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado. No tiene permisos suficientes.' });
    }
    next();
  };
};

module.exports = { checkAuth, checkRole };
