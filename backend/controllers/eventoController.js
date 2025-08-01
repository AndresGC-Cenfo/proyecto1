const Evento = require('../models/Evento');

// Obtener todos los eventos (ciudadano)
const obtenerEventos = async (req, res) => {
  try {
    const eventos = await Evento.find().sort({ fechaEvento: 1 });
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener eventos', error });
  }
};

// Crear evento (admin)
const crearEvento = async (req, res) => {
  const { nombre, descripcion, fechaEvento, ubicacion } = req.body;

  try {
    const nuevo = new Evento({
      nombre,
      descripcion,
      fechaEvento,
      ubicacion,
      idOrganizador: req.usuario._id
    });

    await nuevo.save();
    res.status(201).json({ mensaje: 'Evento creado', evento: nuevo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear evento', error });
  }
};

// Editar evento (admin)
const editarEvento = async (req, res) => {
  try {
    const evento = await Evento.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(evento);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al editar evento', error });
  }
};

// Eliminar evento (admin)
const eliminarEvento = async (req, res) => {
  try {
    await Evento.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Evento eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar evento', error });
  }
};

module.exports = {
  obtenerEventos,
  crearEvento,
  editarEvento,
  eliminarEvento
};
