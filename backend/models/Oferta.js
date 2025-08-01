const mongoose = require('mongoose');

const OfertaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  idEmprendimiento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emprendimiento',
    required: true
  }
});

module.exports = mongoose.model('Oferta', OfertaSchema);
