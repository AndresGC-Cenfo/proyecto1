const express = require('express');
const router = express.Router();
const {
  obtenerEventos,
  crearEvento,
  editarEvento,
  eliminarEvento
} = require('../controllers/eventoController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Público (calendario ciudadano)
router.get('/', obtenerEventos);

// Admin
router.post('/', verificarToken, verificarRol('administrador'), crearEvento);
router.put('/:id', verificarToken, verificarRol('administrador'), editarEvento);
router.delete('/:id', verificarToken, verificarRol('administrador'), eliminarEvento);

module.exports = router;
