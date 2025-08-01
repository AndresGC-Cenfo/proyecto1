const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verificarToken = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) return res.status(401).json({ mensaje: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = await User.findById(decoded.id).select('-contrasena');
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido' });
  }
};

// Middleware para verificar roles
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }
    next();
  };
};

module.exports = {
  verificarToken,
  verificarRol
};
