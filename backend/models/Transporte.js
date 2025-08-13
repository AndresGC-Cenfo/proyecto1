const { Schema, model } = require('mongoose');
const { CODIGOS_RUTA } = require('../config/rutasTransporte');

const TransporteSchema = new Schema(
  {
    transportista: { type: String, required: true, trim: true },
    ruta: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      enum: {
        values: CODIGOS_RUTA,
        message: 'Ruta inválida. Use uno de: ' + CODIGOS_RUTA.join(', ')
      }
    },
    horario: { type: String, required: true, trim: true },
    tarifa:  { type: String, required: true, trim: true },
    contacto:{ type: String, trim: true, default: '' },
    fechaActualizacion: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = model('Transporte', TransporteSchema);
