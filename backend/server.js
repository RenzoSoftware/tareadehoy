const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const clientesRoutes = require('./routes/clientes');
const ventasRoutes = require('./routes/ventas');
const comprasRoutes = require('./routes/compras');
const proveedoresRoutes = require('./routes/proveedores');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/proveedores', proveedoresRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
