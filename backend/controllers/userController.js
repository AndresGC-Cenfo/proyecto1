const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

// 1) Solicitar restablecimiento
const solicitarRestablecimiento = async (req, res) => {
  const { correo } = req.body;
  try {
    const usuario = await User.findOne({ correo });
    if (!usuario) {
      // No revelar si el correo existe: responder 200 igual
      return res.status(200).json({ mensaje: 'Si el correo existe, se enviará un enlace para restablecer.' });
    }

    // Generar token "crudo" y almacenar solo el hash
    const tokenPlano = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenPlano).digest('hex');

    usuario.resetPasswordToken = tokenHash;
    usuario.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hora
    await usuario.save();

    // Como no usamos email aquí, devolvemos la URL para que el frontend redirija
    const base = process.env.FRONTEND_BASE_URL || 'http://localhost:5000';
    const resetUrl = `${base}/pages/auth/establecer-nueva-contrasena.html?token=${tokenPlano}&email=${encodeURIComponent(correo)}`;

    return res.status(200).json({
      mensaje: 'Si el correo existe, se enviará un enlace para restablecer.',
      resetUrl
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al solicitar restablecimiento', error });
  }
};

// 2) Establecer nueva contraseña
const restablecerContrasena = async (req, res) => {
  const { token, password } = req.body;
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const usuario = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({ mensaje: 'Token inválido o expirado' });
    }

    usuario.contrasena = password; // se hashea en el pre('save')
    usuario.resetPasswordToken = undefined;
    usuario.resetPasswordExpires = undefined;
    await usuario.save();

    return res.status(200).json({ mensaje: 'Contraseña restablecida correctamente' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al restablecer contraseña', error });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  solicitarRestablecimiento,
  restablecerContrasena
};