const express = require('express');
const router = express.Router();
 const {
   crearEmprendimiento,
   obtenerMisEmprendimientos,
   eliminarEmprendimiento,
   actualizarEstado,
   actualizarEmprendimiento,        
   obtenerEmprendimientosAdmin
 } = require('../controllers/emprendimientoController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Rutas para emprendedor
router.post('/', verificarToken, verificarRol('emprendedor'), crearEmprendimiento);
router.get('/', verificarToken, verificarRol('emprendedor'), obtenerMisEmprendimientos);

// Admin: listado global
router.get('/admin', verificarToken, verificarRol('administrador'), obtenerEmprendimientosAdmin);

// Editar / Eliminar (dueño o admin)
router.put('/:id', verificarToken, verificarRol('emprendedor', 'administrador'), actualizarEmprendimiento);
router.delete('/:id', verificarToken, verificarRol('emprendedor', 'administrador'), eliminarEmprendimiento);

// Moderación de estado (solo admin)
router.patch('/:id/estado', verificarToken, verificarRol('administrador'), actualizarEstado);


module.exports = router;
