const Transporte = require('../models/Transporte');

// Obtener todas las rutas (ciudadano)
const obtenerRutas = async (req, res) => {
  try {
    const rutas = await Transporte.find().sort({ transportista: 1 });
    res.json(rutas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener rutas', error });
  }
};

// Crear ruta (admin)
const crearRuta = async (req, res) => {
  const { transportista, ruta, horario, tarifa, contacto } = req.body;

  try {
    const nueva = new Transporte({ transportista, ruta, horario, tarifa, contacto });
    await nueva.save();
    res.status(201).json({ mensaje: 'Ruta creada', ruta: nueva });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear ruta', error });
  }
};

// Editar ruta (admin)
const editarRuta = async (req, res) => {
  try {
    const actualizada = await Transporte.findByIdAndUpdate(
      req.params.id,
      { ...req.body, fechaActualizacion: Date.now() },
      { new: true }
    );
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al editar ruta', error });
  }
};

// Eliminar ruta (admin)
const eliminarRuta = async (req, res) => {
  try {
    await Transporte.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Ruta eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar ruta', error });
  }
};

module.exports = {
  obtenerRutas,
  crearRuta,
  editarRuta,
  eliminarRuta
};
