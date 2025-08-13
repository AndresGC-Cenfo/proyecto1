const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const {
  obtenerOfertas,
  obtenerMisOfertas,
  crearOferta,
  editarOferta,
  eliminarOferta,
  obtenerOfertasAdmin
} = require('../controllers/ofertaController');

// Público (vigentes)
router.get('/', obtenerOfertas);

// Emprendedor/Admin (sus propias)
router.get('/mias', verificarToken, verificarRol('emprendedor', 'administrador'), obtenerMisOfertas);
// Admin (todas)
router.get('/admin', verificarToken, verificarRol('administrador'), obtenerOfertasAdmin);

router.post('/', verificarToken, verificarRol('emprendedor', 'administrador'), crearOferta);
router.put('/:id', verificarToken, verificarRol('emprendedor', 'administrador'), editarOferta);
router.delete('/:id', verificarToken, verificarRol('emprendedor', 'administrador'), eliminarOferta);


module.exports = router;
