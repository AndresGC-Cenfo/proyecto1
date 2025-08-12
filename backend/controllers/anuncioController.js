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

// Admin: crear
const crearAnuncio = async (req, res) => {
  const { titulo, descripcion, fechaPublicacion } = req.body;
  try {
    const nuevo = new Anuncio({
      titulo,
      descripcion,
      autorId: req.usuario._id,
      ...(fechaPublicacion ? { fechaPublicacion } : {})
    });
    await nuevo.save();
    res.status(201).json({ mensaje: 'Anuncio creado', anuncio: nuevo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear anuncio', error });
  }
};

// Listado ADMIN
const obtenerAnunciosAdmin = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.estado) filtro.estado = req.query.estado;
    const anuncios = await Anuncio.find(filtro)
      .sort({ fechaPublicacion: -1 })
      .populate('autorId', 'nombre email');
    res.json(anuncios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener anuncios (admin)', error });
  }
};

// Editar contenido/fecha (ADMIN)
const actualizarAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fechaPublicacion } = req.body;

    const update = {};
    if (typeof titulo !== 'undefined') update.titulo = titulo;
    if (typeof descripcion !== 'undefined') update.descripcion = descripcion;
    if (typeof fechaPublicacion !== 'undefined') update.fechaPublicacion = fechaPublicacion;

    const anuncio = await Anuncio.findByIdAndUpdate(id, update, { new: true });
    if (!anuncio) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json({ mensaje: 'Anuncio actualizado', anuncio });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar anuncio', error });
  }
};

// Admin: actualizar estado
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
  eliminarAnuncio,
  obtenerAnunciosAdmin,
  actualizarAnuncio
};
