const express = require('express');
const router = express.Router();
const {
  obtenerOfertas,       // público (vigentes)
  obtenerMisOfertas,    // emprendedor/admin
  crearOferta,
  editarOferta,
  eliminarOferta
} = require('../controllers/ofertaController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Ciudadano (sin token): ofertas vigentes hoy
router.get('/', obtenerOfertas);

// Emprendedor/Admin (token)
router.get('/mias', verificarToken, verificarRol('emprendedor', 'administrador'), obtenerMisOfertas);
router.post('/', verificarToken, verificarRol('emprendedor', 'administrador'), crearOferta);
router.put('/:id', verificarToken, verificarRol('emprendedor', 'administrador'), editarOferta);
router.delete('/:id', verificarToken, verificarRol('emprendedor', 'administrador'), eliminarOferta);

module.exports = router;
