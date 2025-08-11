const express = require('express');
const router = express.Router();
const { solicitarReset, restablecerContrasena } = require('../controllers/passwordController');

// No requieren autenticación
router.post('/olvide', solicitarReset);
router.post('/restablecer', restablecerContrasena);

module.exports = router;
