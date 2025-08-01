const express = require('express');
const router = express.Router();
const {
  obtenerAnuncios,
  obtenerAnuncioPorId,
  crearAnuncio,
  actualizarEstado,
  eliminarAnuncio
} = require('../controllers/anuncioController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Rutas públicas (usuarios ciudadanos)
router.get('/', obtenerAnuncios);
router.get('/:id', obtenerAnuncioPorId);

// Rutas protegidas (admin)
router.post('/', verificarToken, verificarRol('administrador'), crearAnuncio);
router.patch('/:id/estado', verificarToken, verificarRol('administrador'), actualizarEstado);
router.delete('/:id', verificarToken, verificarRol('administrador'), eliminarAnuncio);

module.exports = router;
