const Transporte = require('../models/Transporte');
const { normalizarRuta, CODIGOS_RUTA } = require('../config/rutasTransporte');

// GET público: lista todas las rutas publicadas
const obtenerTransportes = async (req, res) => {
  try {
    const lista = await Transporte.find().sort({ transportista: 1 });
    res.json(lista);
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al obtener transporte', error: e.message });
  }
};

// POST (admin): crear registro normalizando ruta
const crearTransporte = async (req, res) => {
  try {
    const payload = {
      transportista: req.body.transportista,
      ruta: normalizarRuta(req.body.ruta),
      horario: req.body.horario,
      tarifa: req.body.tarifa,
      contacto: req.body.contacto || ''
    };
    if (!CODIGOS_RUTA.includes(payload.ruta)) {
      return res.status(400).json({ mensaje: `Ruta inválida. Use: ${CODIGOS_RUTA.join(', ')}` });
    }
    const doc = await Transporte.create(payload);
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al crear ruta', error: e.message });
  }
};

// PUT (admin): editar y normalizar ruta si viene
const editarTransporte = async (req, res) => {
  try {
    const updates = { ...req.body, fechaActualizacion: new Date() };
    if (typeof updates.ruta !== 'undefined' && updates.ruta !== null) {
      updates.ruta = normalizarRuta(updates.ruta);
      if (!CODIGOS_RUTA.includes(updates.ruta)) {
        return res.status(400).json({ mensaje: `Ruta inválida. Use: ${CODIGOS_RUTA.join(', ')}` });
      }
    }
    const doc = await Transporte.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!doc) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al editar ruta', error: e.message });
  }
};

// DELETE (admin)
const eliminarTransporte = async (req, res) => {
  try {
    const doc = await Transporte.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al eliminar ruta', error: e.message });
  }
};

module.exports = {
  obtenerTransportes,
  crearTransporte,
  editarTransporte,
  eliminarTransporte
};
