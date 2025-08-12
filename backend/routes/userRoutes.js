const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { registrarUsuario, loginUsuario, solicitarRestablecimiento, restablecerContrasena, actualizarPerfil } = require('../controllers/userController');

// POST /api/usuarios
router.post('/', registrarUsuario);
router.post('/login', loginUsuario);

// NUEVO:
router.post('/password/forgot', solicitarRestablecimiento);
router.post('/password/reset', restablecerContrasena);

// routes/userRoutes.js
router.put('/perfil', verificarToken, actualizarPerfil);


router.get('/perfil', verificarToken, (req, res) => {
  res.json({ mensaje: 'Acceso autorizado', usuario: req.usuario });
});

module.exports = router;