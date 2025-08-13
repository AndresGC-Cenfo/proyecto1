const Oferta = require('../models/Oferta');
const Emprendimiento = require('../models/Emprendimiento');

// Ciudadano: ver solo ofertas vigentes (sin login)
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

// Helper: asegurar que el emprendimiento pertenece al usuario (o es admin)
async function assertPropiedad(req, idEmprendimiento) {
  // req.usuario._id y req.usuario.rol vienen del middleware de auth
  const esAdmin = req.usuario?.rol === 'administrador';
  if (esAdmin) return;

  const existe = await Emprendimiento.findOne({
    _id: idEmprendimiento,
    idEmprendedor: req.usuario._id
  }).select('_id');

  if (!existe) {
    const err = new Error('No autorizado');
    err.status = 403;
    throw err;
  }
}

// Emprendedor/Admin: ver MIS ofertas (sin filtrar por fecha)
const obtenerMisOfertas = async (req, res) => {
  try {
    // listar emprendimientos del usuario
    const misEmpr = await Emprendimiento.find({ idEmprendedor: req.usuario._id })
      .select('_id');
    const ids = misEmpr.map(e => e._id);

    const ofertas = await Oferta.find({ idEmprendimiento: { $in: ids } })
      .populate('idEmprendimiento', 'nombreNegocio');

    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener mis ofertas', error });
  }
};

// Emprendedor/Admin: crear
const crearOferta = async (req, res) => {
  const { nombre, descripcion, fechaInicio, fechaFin, idEmprendimiento } = req.body;

  try {
    await assertPropiedad(req, idEmprendimiento);

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
    const status = error.status || 500;
    res.status(status).json({ mensaje: 'Error al crear oferta', error: error.message || error });
  }
};

// Emprendedor/Admin: editar
const editarOferta = async (req, res) => {
  try {
    const oferta = await Oferta.findById(req.params.id);
    if (!oferta) return res.status(404).json({ mensaje: 'No encontrado' });

    // Validar propiedad con el emprendimiento actual (y con el nuevo si viene en body)
    await assertPropiedad(req, oferta.idEmprendimiento);
    if (req.body.idEmprendimiento && String(req.body.idEmprendimiento) !== String(oferta.idEmprendimiento)) {
      await assertPropiedad(req, req.body.idEmprendimiento);
    }

    const campos = ['nombre', 'descripcion', 'fechaInicio', 'fechaFin', 'idEmprendimiento'];
    campos.forEach(k => {
      if (typeof req.body[k] !== 'undefined') oferta[k] = req.body[k];
    });

    await oferta.save();
    res.json({ mensaje: 'Oferta actualizada', oferta });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ mensaje: 'Error al editar oferta', error: error.message || error });
  }
};

// Emprendedor/Admin: eliminar
const eliminarOferta = async (req, res) => {
  try {
    const oferta = await Oferta.findById(req.params.id);
    if (!oferta) return res.status(404).json({ mensaje: 'No encontrado' });

    await assertPropiedad(req, oferta.idEmprendimiento);

    await oferta.deleteOne();
    res.json({ mensaje: 'Oferta eliminada' });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ mensaje: 'Error al eliminar oferta', error: error.message || error });
  }
};

// Listado ADMIN: ver todas las ofertas (opcional: ?emprendimiento=<id>)
const obtenerOfertasAdmin = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.emprendimiento) filtro.idEmprendimiento = req.query.emprendimiento;

    const ofertas = await Oferta.find(filtro)
      .sort({ fechaInicio: -1 })
      .populate('idEmprendimiento', 'nombreNegocio');

    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener ofertas (admin)', error });
  }
};

module.exports = {
  obtenerOfertas,      // público (ciudadano) - vigentes
  obtenerMisOfertas,   // autenticado (emprendedor/admin)
  crearOferta,
  editarOferta,
  eliminarOferta,
  obtenerOfertasAdmin
};
