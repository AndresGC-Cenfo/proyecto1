const mongoose = require('mongoose');

const ReporteSchema = new mongoose.Schema({
  tipo: { type: String, required: true }, // "reporte" o "sugerencia"
  descripcion: { type: String, required: true },
  estado: {
    type: String,
    enum: ['pendiente', 'en proceso', 'resuelto'],
    default: 'pendiente'
  },
  idCiudadano: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fechaEnvio: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reporte', ReporteSchema);
