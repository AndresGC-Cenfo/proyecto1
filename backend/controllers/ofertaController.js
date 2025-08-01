const Oferta = require('../models/Oferta');

// Ciudadano: ver ofertas
const obtenerOfertas = async (req, res) => {
  try {
    const hoy = new Date();
    const ofertas = await Oferta.find({
      fechaInicio: { $lte: hoy },
      fechaFin: { $gte: hoy }
    }).populate('idEmprendimiento', 'nombreNegocio');
    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener ofertas', error });
  }
};

// Emprendedor: crear oferta
const crearOferta = async (req, res) => {
  const { nombre, descripcion, fechaInicio, fechaFin, idEmprendimiento } = req.body;

  try {
    const nueva = new Oferta({
      nombre,
      descripcion,
      fechaInicio,
      fechaFin,
      idEmprendimiento
    });

    await nueva.save();
    res.status(201).json({ mensaje: 'Oferta creada', oferta: nueva });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear oferta', error });
  }
};

// Emprendedor/Admin: editar
const editarOferta = async (req, res) => {
  try {
    const actualizada = await Oferta.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al editar oferta', error });
  }
};

// Emprendedor/Admin: eliminar
const eliminarOferta = async (req, res) => {
  try {
    await Oferta.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Oferta eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar oferta', error });
  }
};

module.exports = {
  obtenerOfertas,
  crearOferta,
  editarOferta,
  eliminarOferta
};
