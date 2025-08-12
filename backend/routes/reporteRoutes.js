const express = require('express');
const router = express.Router();

const {
  crearReporte,
  obtenerReportes,
  obtenerMisReportes,
  actualizarMiReporte,
  actualizarEstadoReporte,
  eliminarMiReporte
} = require('../controllers/reporteController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Listar:
// - Admin: todos
// - Ciudadano/Emprendedor: solo los suyos
router.get('/', verificarToken, obtenerReportes);

// (Opcional) compat: listar "míos"
router.get('/mios', verificarToken, verificarRol('ciudadano', 'emprendedor'), obtenerMisReportes);

// Crear: ciudadano / emprendedor
router.post('/', verificarToken, verificarRol('ciudadano', 'emprendedor'), crearReporte);

// Actualizar MI reporte (descripcion/imagenUrl)
router.put('/:id', verificarToken, actualizarMiReporte);

// Eliminar MI reporte
router.delete('/:id', verificarToken, eliminarMiReporte);

// Cambiar estado: SOLO admin
router.patch('/:id/estado', verificarToken, verificarRol('administrador'), actualizarEstadoReporte);

module.exports = router;
