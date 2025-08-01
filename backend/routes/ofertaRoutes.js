const express = require('express');
const router = express.Router();
const {
  obtenerOfertas,
  crearOferta,
  editarOferta,
  eliminarOferta
} = require('../controllers/ofertaController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Ciudadano
router.get('/', obtenerOfertas);

// Emprendedor y Admin
router.post('/', verificarToken, verificarRol('emprendedor', 'administrador'), crearOferta);
router.put('/:id', verificarToken, verificarRol('emprendedor', 'administrador'), editarOferta);
router.delete('/:id', verificarToken, verificarRol('emprendedor', 'administrador'), eliminarOferta);

module.exports = router;
