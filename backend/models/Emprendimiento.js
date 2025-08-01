const mongoose = require('mongoose');

const EmprendimientoSchema = new mongoose.Schema({
  nombreNegocio: { type: String, required: true },
  descripcion: { type: String, required: true },
  categoria: { type: String },
  contacto: { type: String },
  ubicacion: { type: String },
  imagenUrl: { type: String },
  idEmprendedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Emprendimiento', EmprendimientoSchema);
