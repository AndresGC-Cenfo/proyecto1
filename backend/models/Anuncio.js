const mongoose = require('mongoose');

const AnuncioSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  fechaPublicacion: { type: Date, default: Date.now },
  autorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
  }
});

module.exports = mongoose.model('Anuncio', AnuncioSchema);
