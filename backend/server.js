const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const clientesRoutes = require('./routes/clientes');
const ventasRoutes = require('./routes/ventas');
const cajaRoutes = require('./routes/caja');
const catalogosRoutes = require('./routes/catalogos');
const lotesRoutes = require('./routes/lotes');
const proveedoresRoutes = require('./routes/proveedores');
const usuariosRoutes = require('./routes/usuarios');
const comprasRoutes = require('./routes/compras');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/caja', cajaRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/lotes', lotesRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/compras', comprasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
