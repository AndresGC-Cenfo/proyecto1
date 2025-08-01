const express = require('express');
const router = express.Router();
const {
  obtenerRutas,
  crearRuta,
  editarRuta,
  eliminarRuta
} = require('../controllers/transporteController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Rutas públicas (ciudadanos)
router.get('/', obtenerRutas);

// Admin
router.post('/', verificarToken, verificarRol('administrador'), crearRuta);
router.put('/:id', verificarToken, verificarRol('administrador'), editarRuta);
router.delete('/:id', verificarToken, verificarRol('administrador'), eliminarRuta);

module.exports = router;
