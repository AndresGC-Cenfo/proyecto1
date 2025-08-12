const express = require('express');
const router = express.Router();
const {
  crearEmprendimiento,
  obtenerMisEmprendimientos,
  eliminarEmprendimiento,
  actualizarEstado,
  actualizarEmprendimiento           
} = require('../controllers/emprendimientoController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Rutas para emprendedor
router.post('/', verificarToken, verificarRol('emprendedor'), crearEmprendimiento);
router.get('/', verificarToken, verificarRol('emprendedor'), obtenerMisEmprendimientos);
router.delete('/:id', verificarToken, verificarRol('emprendedor'), eliminarEmprendimiento);
router.put('/:id', verificarToken, verificarRol('emprendedor'), actualizarEmprendimiento);

// Ruta para admin
router.patch('/:id/estado', verificarToken, verificarRol('administrador'), actualizarEstado);

module.exports = router;
