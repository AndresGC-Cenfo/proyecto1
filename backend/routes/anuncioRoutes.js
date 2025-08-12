const express = require('express');
const router = express.Router();
const {
  obtenerAnuncios,
  obtenerAnuncioPorId,
  crearAnuncio,
  actualizarEstado,
  eliminarAnuncio,
  obtenerAnunciosAdmin,
  actualizarAnuncio
} = require('../controllers/anuncioController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Rutas públicas (usuarios ciudadanos)
router.get('/', obtenerAnuncios);

// Get anuncios Admin
router.get('/admin', verificarToken, verificarRol('administrador'), obtenerAnunciosAdmin);

// Detalle público (solo aprobados)
router.get('/:id', obtenerAnuncioPorId);

// Admin
router.put('/:id', verificarToken, verificarRol('administrador'), actualizarAnuncio);
router.post('/', verificarToken, verificarRol('administrador'), crearAnuncio);
router.patch('/:id/estado', verificarToken, verificarRol('administrador'), actualizarEstado);
router.delete('/:id', verificarToken, verificarRol('administrador'), eliminarAnuncio);

module.exports = router;
