const Reporte = require('../models/Reporte');

// Ciudadano: crear reporte
const crearReporte = async (req, res) => {
  const { tipo, descripcion } = req.body;

  try {
    const nuevo = new Reporte({
      tipo,
      descripcion,
      idCiudadano: req.usuario._id
    });

    await nuevo.save();
    res.status(201).json({ mensaje: 'Reporte enviado', reporte: nuevo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al enviar reporte', error });
  }
};

// Ciudadano: ver mis reportes
const obtenerMisReportes = async (req, res) => {
  try {
    const reportes = await Reporte.find({ idCiudadano: req.usuario._id });
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reportes', error });
  }
};

// Admin: ver todos los reportes
const obtenerTodosReportes = async (req, res) => {
  try {
    const reportes = await Reporte.find().populate('idCiudadano', 'nombre correo');
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reportes', error });
  }
};

// Admin: actualizar estado
const actualizarEstadoReporte = async (req, res) => {
  try {
    const { estado } = req.body;
    const actualizado = await Reporte.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar estado', error });
  }
};

module.exports = {
  crearReporte,
  obtenerMisReportes,
  obtenerTodosReportes,
  actualizarEstadoReporte
};
