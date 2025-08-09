const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/usuarios', require('./routes/userRoutes'));
app.use('/api/emprendimientos', require('./routes/emprendimientoRoutes'));
app.use('/api/anuncios', require('./routes/anuncioRoutes'));
app.use('/api/eventos', require('./routes/eventoRoutes'));
app.use('/api/transporte', require('./routes/transporteRoutes'));
app.use('/api/reportes', require('./routes/reporteRoutes'));
app.use('/api/ofertas', require('./routes/ofertaRoutes'));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Conexión a la base de datos
connectDB();

// Ruta base (opcional: redirige a la página principal)
app.get('/', (req, res) => {
  res.redirect('/pages/index.html');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
