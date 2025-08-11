const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { registrarUsuario, loginUsuario, solicitarRestablecimiento, restablecerContrasena } = require('../controllers/userController');

// POST /api/usuarios
router.post('/', registrarUsuario);
router.post('/login', loginUsuario);

// NUEVO:
router.post('/password/forgot', solicitarRestablecimiento);
router.post('/password/reset', restablecerContrasena);

router.get('/perfil', verificarToken, (req, res) => {
  res.json({ mensaje: 'Acceso autorizado', usuario: req.usuario });
});

module.exports = router;