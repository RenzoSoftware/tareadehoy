const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const clientesRoutes = require('./routes/clientes');
const ventasRoutes = require('./routes/ventas');
const tiposComprobanteRoutes = require('./routes/tiposComprobante');
const catalogosRoutes = require('./routes/catalogos');
const lotesRoutes = require('./routes/lotes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/tipos-comprobante', tiposComprobanteRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/lotes', lotesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
