const Emprendimiento = require('../models/Emprendimiento');

// Listar TODOS los emprendimientos (ADMIN) con filtro opcional ?estado=
const obtenerEmprendimientosAdmin = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.estado) filtro.estado = req.query.estado; // pendiente|aprobado|rechazado
    const lista = await Emprendimiento.find(filtro)
      .sort({ fechaRegistro: -1 })
      .populate('idEmprendedor', 'nombre email'); // opcional
    res.json(lista);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener (admin)', error });
  }
};

// Permitir que ADMIN también pueda actualizar campos básicos
const actualizarEmprendimientoAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const body = (({ nombreNegocio, descripcion, categoria, contacto, ubicacion, imagenUrl }) =>
      ({ nombreNegocio, descripcion, categoria, contacto, ubicacion, imagenUrl }))(req.body);

    const doc = await Emprendimiento.findById(id);
    if (!doc) return res.status(404).json({ mensaje: 'No encontrado' });

    const esDueno = String(doc.idEmprendedor) === String(req.usuario._id);
    const esAdmin = req.usuario?.rol === 'administrador';
    if (!esDueno && !esAdmin) return res.status(403).json({ mensaje: 'No autorizado' });

    Object.entries(body).forEach(([k, v]) => { if (typeof v !== 'undefined') doc[k] = v; });

    await doc.save();
    res.json({ mensaje: 'Actualizado', emprendimiento: doc });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar', error });
  }
};

// Permitir que ADMIN también pueda eliminar
const eliminarEmprendimientoAdmin = async (req, res) => {
  try {
    const doc = await Emprendimiento.findById(req.params.id);
    if (!doc) return res.status(404).json({ mensaje: 'No encontrado' });

    const esDueno = String(doc.idEmprendedor) === String(req.usuario._id);
    const esAdmin = req.usuario?.rol === 'administrador';
    if (!esDueno && !esAdmin) return res.status(403).json({ mensaje: 'No autorizado' });

    await doc.deleteOne();
    res.status(200).json({ mensaje: 'Eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar', error });
  }
};

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

const actualizarEmprendimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const body = (({ nombreNegocio, descripcion, categoria, contacto, ubicacion, imagenUrl }) =>
      ({ nombreNegocio, descripcion, categoria, contacto, ubicacion, imagenUrl }))(req.body);

    const doc = await Emprendimiento.findById(id);
    if (!doc) return res.status(404).json({ mensaje: 'No encontrado' });

    // Solo dueño (o cambia tu regla si admin también)
    if (String(doc.idEmprendedor) !== String(req.usuario._id)) {
      return res.status(403).json({ mensaje: 'No autorizado' });
    }

    // OJO: el estado no se modifica aquí (eso es del admin via PATCH /:id/estado)
    Object.entries(body).forEach(([k, v]) => {
      if (typeof v !== 'undefined') doc[k] = v;
    });

    await doc.save();
    res.json({ mensaje: 'Actualizado', emprendimiento: doc });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar', error });
  }
};

// exportar también:
module.exports = {
  crearEmprendimiento,
  obtenerMisEmprendimientos,
  eliminarEmprendimiento,
  actualizarEstado,
  actualizarEmprendimiento,
  obtenerEmprendimientosAdmin,
  actualizarEmprendimientoAdmin,
  eliminarEmprendimientoAdmin
};