const User = require('../models/User');

// Registrar nuevo usuario
const registrarUsuario = async (req, res) => {
  const { nombre, correo, contrasena, telefono, fechaNacimiento, foto, rol, cedula } = req.body;

  try {
    // Verificar si ya existe
    const existe = await User.findOne({ correo });
    if (existe) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new User({
      nombre,
      correo,
      contrasena, // Aquí luego encriptamos
      telefono,
      fechaNacimiento,
      foto,
      rol,
      cedula
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', error });
  }
};

const bcrypt = require('bcrypt');

const loginUsuario = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const usuario = await User.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Credenciales incorrectas' });
    }

    const passwordValido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordValido) {
      return res.status(400).json({ mensaje: 'Credenciales incorrectas' });
    }

    const jwt = require('jsonwebtoken');

    // después de verificar contraseña:
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario
};