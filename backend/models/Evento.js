const mongoose = require('mongoose');

const EventoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  fechaEvento: { type: Date, required: true },
  ubicacion: { type: String, required: true },
  idOrganizador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Evento', EventoSchema);
