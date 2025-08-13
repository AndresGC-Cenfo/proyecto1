const Anuncio = require('../models/Anuncio');

// Ciudadano: ver anuncios aprobados
const obtenerAnuncios = async (req, res) => {
  try {
    const anuncios = await Anuncio.find({ estado: 'aprobado' }).sort({ fechaPublicacion: -1 });
    res.json(anuncios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener anuncios', error });
  }
};

// Ciudadano: ver detalle
const obtenerAnuncioPorId = async (req, res) => {
  try {
    const anuncio = await Anuncio.findById(req.params.id);
    if (!anuncio || anuncio.estado !== 'aprobado') {
      return res.status(404).json({ mensaje: 'Anuncio no disponible' });
    }
    res.json(anuncio);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener detalle', error });
  }
};

// Admin: crear anuncio
const crearAnuncio = async (req, res) => {
  const { titulo, descripcion } = req.body;
  try {
    const nuevo = new Anuncio({
      titulo,
      descripcion,
      autorId: req.usuario._id
    });
    await nuevo.save();
    res.status(201).json({ mensaje: 'Anuncio creado', anuncio: nuevo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear anuncio', error });
  }
};

// Admin: actualizar estado (aprobar/rechazar)
const actualizarEstado = async (req, res) => {
  const { estado } = req.body;
  try {
    const anuncio = await Anuncio.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    res.json(anuncio);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar estado', error });
  }
};

// Admin: eliminar
const eliminarAnuncio = async (req, res) => {
  try {
    await Anuncio.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Anuncio eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar anuncio', error });
  }
};

module.exports = {
  obtenerAnuncios,
  obtenerAnuncioPorId,
  crearAnuncio,
  actualizarEstado,
  eliminarAnuncio
};
