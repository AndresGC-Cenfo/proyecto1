const express = require('express');
const router = express.Router();
const {
  crearEmprendimiento,
  obtenerMisEmprendimientos,
  eliminarEmprendimiento,
  actualizarEstado
} = require('../controllers/emprendimientoController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Rutas para emprendedor
router.post('/', verificarToken, verificarRol('emprendedor'), crearEmprendimiento);
router.get('/', verificarToken, verificarRol('emprendedor'), obtenerMisEmprendimientos);
router.delete('/:id', verificarToken, verificarRol('emprendedor'), eliminarEmprendimiento);

// Ruta para admin
router.patch('/:id/estado', verificarToken, verificarRol('administrador'), actualizarEstado);

module.exports = router;
