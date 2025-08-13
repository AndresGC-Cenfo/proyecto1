const express = require('express');
const router = express.Router();

const {
  obtenerTransportes,
  crearTransporte,
  editarTransporte,
  eliminarTransporte
} = require('../controllers/transporteController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Público
router.get('/', obtenerTransportes);

// Admin
router.post('/', verificarToken, verificarRol('administrador'), crearTransporte);
router.put('/:id', verificarToken, verificarRol('administrador'), editarTransporte);
router.delete('/:id', verificarToken, verificarRol('administrador'), eliminarTransporte);

module.exports = router;
