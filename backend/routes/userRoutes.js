const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario } = require('../controllers/userController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// POST /api/usuarios
router.post('/', registrarUsuario);
router.post('/login', loginUsuario);
router.get('/perfil', verificarToken, (req, res) => {
  res.json({ mensaje: 'Acceso autorizado', usuario: req.usuario });
});

module.exports = router;