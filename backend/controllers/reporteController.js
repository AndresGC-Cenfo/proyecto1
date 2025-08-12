const Reporte = require('../models/Reporte');

// Ciudadano/Emprendedor: crear (estado siempre 'pendiente')
const crearReporte = async (req, res) => {
  const { tipo, descripcion, imagenUrl } = req.body;

  try {
    const nuevo = new Reporte({
      tipo,
      descripcion,
      imagenUrl: imagenUrl || null,
      idCiudadano: req.usuario._id,
      estado: 'pendiente'
    });

    await nuevo.save();
    res.status(201).json({ mensaje: 'Reporte enviado', reporte: nuevo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al enviar reporte', error: error.message });
  }
};

// GET unificado:
// - Admin: todos (con populate)
// - Otros roles: solo sus reportes (cualquier estado)
const obtenerReportes = async (req, res) => {
  try {
    const { rol, _id } = req.usuario;
    const query = (rol === 'administrador') ? {} : { idCiudadano: _id };

    const reportes = await Reporte
      .find(query)
      .sort({ createdAt: -1 })
      .populate('idCiudadano', 'nombre correo');

    res.json({ reportes });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reportes', error: error.message });
  }
};

// (Opcional) mantener el endpoint "míos" si lo usas en otros lados
const obtenerMisReportes = async (req, res) => {
  try {
    const reportes = await Reporte
      .find({ idCiudadano: req.usuario._id })
      .sort({ createdAt: -1 });
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reportes', error: error.message });
  }
};

// Dueño actualiza SOLO descripcion/imagenUrl (no estado)
const actualizarMiReporte = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar propiedad
    const existente = await Reporte.findById(id);
    if (!existente) return res.status(404).json({ mensaje: 'No encontrado' });
    if (String(existente.idCiudadano) !== String(req.usuario._id) && req.usuario.rol !== 'administrador') {
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    const { descripcion, imagenUrl } = req.body;
    const update = {};
    if (typeof descripcion === 'string') update.descripcion = descripcion;
    if (typeof imagenUrl === 'string') update.imagenUrl = imagenUrl;

    const actualizado = await Reporte.findByIdAndUpdate(id, update, { new: true });
    res.json({ reporte: actualizado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar reporte', error: error.message });
  }
};

// Admin cambia estado
const actualizarEstadoReporte = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!['pendiente', 'en proceso', 'resuelto'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado inválido' });
    }
    const actualizado = await Reporte.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar estado', error: error.message });
  }
};

// Ciudadano/Emprendedor: eliminar SOLO si es el dueño. Admin: puede eliminar cualquiera.
const eliminarMiReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const rep = await Reporte.findById(id);
    if (!rep) return res.status(404).json({ mensaje: 'Reporte no encontrado' });

    const esDueno = String(rep.idCiudadano) === String(req.usuario._id);
    const esAdmin = req.usuario.rol === 'administrador';
    if (!esDueno && !esAdmin) {
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    await Reporte.findByIdAndDelete(id);
    return res.status(200).json({ mensaje: 'Reporte eliminado' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al eliminar reporte', error: error.message });
  }
};

module.exports = {
  crearReporte,
  obtenerReportes,
  obtenerMisReportes,
  actualizarMiReporte,
  actualizarEstadoReporte,
  eliminarMiReporte
};
