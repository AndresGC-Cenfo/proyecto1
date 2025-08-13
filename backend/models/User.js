const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  nombre: String,
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  telefono: String,
  fechaNacimiento: Date,
  foto: String,
  rol: {
    type: String,
    enum: ['ciudadano', 'emprendedor', 'administrador'],
    default: 'ciudadano'
  }
}, { timestamps: true });

// Hashear contraseña antes de guardar
UserSchema.pre('save', async function (next) {
  if (!this.isModified('contrasena')) return next();
  const salt = await bcrypt.genSalt(10);
  this.contrasena = await bcrypt.hash(this.contrasena, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);
