const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de usuario
app.use('/api/usuarios', require('./routes/userRoutes'));
app.use('/api/emprendimientos', require('./routes/emprendimientoRoutes'));
app.use('/api/anuncios', require('./routes/anuncioRoutes'));
app.use('/api/eventos', require('./routes/eventoRoutes'));
app.use('/api/transporte', require('./routes/transporteRoutes'));
app.use('/api/reportes', require('./routes/reporteRoutes'));
app.use('/api/ofertas', require('./routes/ofertaRoutes'));

// Conexión a la base de datos
connectDB();

// Ruta base
app.get('/', (req, res) => {
  res.send('🎉 Bienvenido a Comunidad Conectada API');
});

// Arranque del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
