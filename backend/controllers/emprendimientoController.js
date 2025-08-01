const Emprendimiento = require('../models/Emprendimiento');

// Crear emprendimiento (solo emprendedores)
const crearEmprendimiento = async (req, res) => {
  const { nombreNegocio, descripcion, categoria, contacto, ubicacion, imagenUrl } = req.body;

  try {
    const nuevo = new Emprendimiento({
      nombreNegocio,
      descripcion,
      categoria,
      contacto,
      ubicacion,
      imagenUrl,
      idEmprendedor: req.usuario._id
    });

    await nuevo.save();
    res.status(201).json({ mensaje: 'Emprendimiento creado', emprendimiento: nuevo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear emprendimiento', error });
  }
};

// Obtener los emprendimientos del emprendedor logueado
const obtenerMisEmprendimientos = async (req, res) => {
  try {
    const lista = await Emprendimiento.find({ idEmprendedor: req.usuario._id });
    res.status(200).json(lista);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener', error });
  }
};

// Eliminar emprendimiento
const eliminarEmprendimiento = async (req, res) => {
  try {
    const emprendimiento = await Emprendimiento.findById(req.params.id);

    if (!emprendimiento) {
      return res.status(404).json({ mensaje: 'No encontrado' });
    }

    if (String(emprendimiento.idEmprendedor) !== String(req.usuario._id)) {
      return res.status(403).json({ mensaje: 'No autorizado' });
    }

    await emprendimiento.deleteOne();
    res.status(200).json({ mensaje: 'Eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar', error });
  }
};

// Cambiar estado (solo admin)
const actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const emprendimiento = await Emprendimiento.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    res.status(200).json(emprendimiento);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar estado', error });
  }
};

module.exports = {
  crearEmprendimiento,
  obtenerMisEmprendimientos,
  eliminarEmprendimiento,
  actualizarEstado
};
