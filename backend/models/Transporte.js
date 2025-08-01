const mongoose = require('mongoose');

const TransporteSchema = new mongoose.Schema({
  transportista: { type: String, required: true },
  ruta: { type: String, required: true },
  horario: { type: String, required: true },
  tarifa: { type: String, required: true },
  contacto: { type: String, required: false },
  fechaActualizacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transporte', TransporteSchema);
