const express = require('express');
const router = express.Router();
const {
  crearReporte,
  obtenerMisReportes,
  obtenerTodosReportes,
  actualizarEstadoReporte
} = require('../controllers/reporteController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Ciudadano
router.post('/', verificarToken, verificarRol('ciudadano'), crearReporte);
router.get('/mios', verificarToken, verificarRol('ciudadano'), obtenerMisReportes);

// Admin
router.get('/', verificarToken, verificarRol('administrador'), obtenerTodosReportes);
router.patch('/:id/estado', verificarToken, verificarRol('administrador'), actualizarEstadoReporte);

module.exports = router;
