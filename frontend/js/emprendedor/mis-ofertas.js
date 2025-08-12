// ==== CONFIG ====
const API_OFERTAS = '/api/ofertas';
const API_EMPRENDIMIENTOS = '/api/emprendimientos'; // si tu endpoint es '/api/emprendimientos/mis', cámbialo aquí
const TOKEN = localStorage.getItem('token');

const tablaBody = document.querySelector('#tablaEmprendimientos tbody');
const btnRegistrar = document.getElementById('btnRegistrar');
const btnEditar = document.getElementById('btnEditar');
const btnEliminar = document.getElementById('btnEliminar');
const btnEnviar = document.getElementById('btnEnviarCambios');
const confirmEliminarBtn = document.getElementById('confirmEliminarBtn');
const cancelEliminarBtn = document.getElementById('cancelEliminarBtn');

let filaSeleccionada = null;
let filaEditando = null;
let editId = null;
let misEmprendimientos = []; // para el select

function authHeaders(json = false) {
  const h = { 'Authorization': `Bearer ${TOKEN}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

// ==== BANNERS ====
function mostrarBannerExito(msg = 'Operación exitosa') {
  const banner = document.getElementById('registroExitosoBanner');
  banner.querySelector('span').innerHTML = `<i class="fas fa-circle-check"></i> ${msg}`;
  banner.style.display = 'flex';
  setTimeout(() => banner.style.display = 'none', 2500);
}
function mostrarBannerError(m) {
  const banner = document.getElementById('errorRegistroBanner');
  document.getElementById('mensaje').textContent = m || 'Ocurrió un error';
  banner.style.display = 'block';
  setTimeout(() => banner.style.display = 'none', 3000);
}

// ==== HELPERS ====
function toYYYYMMDD(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function estadoDesdeVigencia(inicio, fin) {
  const hoy = new Date();
  const dIni = new Date(inicio);
  const dFin = new Date(fin);
  if (hoy < dIni) return 'Próxima';
  if (hoy > dFin) return 'Expirada';
  return 'Vigente';
}
function selectEmprHTML(selectedId) {
  const opts = misEmprendimientos.map(e =>
    `<option value="${e._id}" ${String(selectedId) === String(e._id) ? 'selected':''}>${e.nombreNegocio}</option>`
  ).join('');
  return `<select id="iEmpr">${opts}</select>`;
}

// ==== RENDER ====
function renderLista(lista) {
  tablaBody.innerHTML = '';
  if (!lista || !lista.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" style="text-align:center;opacity:.7">Sin registros</td>`;
    tablaBody.appendChild(tr);
    return;
  }

  lista.forEach(doc => {
    const tr = document.createElement('tr');
    tr.dataset.id = doc._id;
    const nombreEmp = doc.idEmprendimiento?.nombreNegocio || '(sin nombre)';
    const ini = toYYYYMMDD(doc.fechaInicio);
    const fin = toYYYYMMDD(doc.fechaFin);
    const est = estadoDesdeVigencia(doc.fechaInicio, doc.fechaFin);

    tr.innerHTML = `
      <td>${doc.nombre || ''}</td>
      <td>${nombreEmp}</td>
      <td>${ini} → ${fin}</td>
      <td>${est}</td>
      <td>${doc.descripcion || '—'}</td>
    `;
    tr.addEventListener('click', () => toggleSeleccion(tr));
    tablaBody.appendChild(tr);
  });
}

function toggleSeleccion(tr) {
  if (filaSeleccionada === tr) {
    tr.classList.remove('filaSeleccionada');
    filaSeleccionada = null;
  } else {
    if (filaSeleccionada) filaSeleccionada.classList.remove('filaSeleccionada');
    filaSeleccionada = tr;
    tr.classList.add('filaSeleccionada');
  }
}

// ==== API ====
async function cargarMisEmprendimientos() {
  const r = await fetch(API_EMPRENDIMIENTOS, { headers: authHeaders() });
  if (!r.ok) throw new Error('No se pudieron cargar tus emprendimientos');
  misEmprendimientos = await r.json();
}

async function cargarMisOfertas() {
  const r = await fetch(`${API_OFERTAS}/mias`, { headers: authHeaders() });
  if (!r.ok) throw new Error('No se pudieron cargar tus ofertas');
  const data = await r.json();
  renderLista(data);
}

async function crearOferta(payload) {
  const r = await fetch(API_OFERTAS, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al crear');
  return r.json();
}

async function actualizarOferta(id, payload) {
  const r = await fetch(`${API_OFERTAS}/${id}`, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al actualizar');
  return r.json();
}

async function eliminarOferta(id) {
  const r = await fetch(`${API_OFERTAS}/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al eliminar');
  return r.json();
}

// ==== UI (crear/editar/eliminar) ====
function plantillaInputs(val = {}) {
  const tr = document.createElement('tr');
  tr.classList.add('fila-edicion');
  const ini = val.fechaInicio ? toYYYYMMDD(val.fechaInicio) : '';
  const fin = val.fechaFin ? toYYYYMMDD(val.fechaFin) : '';

  tr.innerHTML = `
    <td><input id="iNombre" type="text" placeholder="Nombre de la oferta" value="${val.nombre || ''}"></td>
    <td>${selectEmprHTML(val.idEmprendimiento?._id || val.idEmprendimiento)}</td>
    <td>
      <input id="iInicio" type="date" value="${ini}" style="width: 48%">
      <input id="iFin" type="date" value="${fin}" style="width: 48%; margin-left: 4%">
    </td>
    <td>${(ini && fin) ? estadoDesdeVigencia(ini, fin) : '—'}</td>
    <td><input id="iDescripcion" type="text" placeholder="Descripción" value="${val.descripcion || ''}"></td>
  `;
  return tr;
}

function nuevoRegistro() {
  if (!misEmprendimientos.length) return mostrarBannerError('Primero crea un emprendimiento.');
  if (filaEditando) return mostrarBannerError('Termina el registro/edición actual.');
  editId = null;
  filaEditando = plantillaInputs();
  tablaBody.prepend(filaEditando);
  if (filaSeleccionada) { filaSeleccionada.classList.remove('filaSeleccionada'); filaSeleccionada = null; }
}

function editarRegistro() {
  if (!filaSeleccionada) return mostrarBannerError('Selecciona una fila para editar.');
  if (filaEditando) return mostrarBannerError('Termina el registro/edición actual.');

  const [tdNombre, tdEmp, tdVig, /*tdEst*/, tdDesc] = filaSeleccionada.children;
  const vigParts = (tdVig.textContent || '').split('→').map(s => s.trim());

  const val = {
    _id: filaSeleccionada.dataset.id,
    nombre: tdNombre.textContent,
    idEmprendimiento: misEmprendimientos.find(e => tdEmp.textContent === e.nombreNegocio)?._id,
    fechaInicio: vigParts[0] || '',
    fechaFin: vigParts[1] || '',
    descripcion: tdDesc.textContent === '—' ? '' : tdDesc.textContent
  };

  editId = val._id;
  filaEditando = plantillaInputs(val);
  tablaBody.prepend(filaEditando);
}

function pedirConfirmacionEliminar() {
  if (!filaSeleccionada) return mostrarBannerError('Selecciona una fila para eliminar.');
  document.getElementById('eliminarBanner').style.display = 'flex';
}

async function confirmarEliminar() {
  try {
    const id = filaSeleccionada?.dataset.id;
    if (!id) return;
    await eliminarOferta(id);
    filaSeleccionada = null;
    await cargarMisOfertas();
    mostrarBannerExito('Eliminado correctamente');
  } catch (e) {
    mostrarBannerError(e.message || 'Error al eliminar');
  } finally {
    document.getElementById('eliminarBanner').style.display = 'none';
  }
}
function cancelarEliminar() {
  document.getElementById('eliminarBanner').style.display = 'none';
}

async function enviarCambios() {
  if (!filaEditando) return mostrarBannerError('No hay cambios por enviar.');

  const nombre = document.getElementById('iNombre').value.trim();
  const idEmprendimiento = document.getElementById('iEmpr').value;
  const fechaInicio = document.getElementById('iInicio').value;
  const fechaFin = document.getElementById('iFin').value;
  const descripcion = document.getElementById('iDescripcion').value.trim();

  if (!nombre || !descripcion || !idEmprendimiento || !fechaInicio || !fechaFin) {
    return mostrarBannerError('Completa nombre, descripción, emprendimiento y fechas.');
  }
  if (new Date(fechaInicio) > new Date(fechaFin)) {
    return mostrarBannerError('La fecha de inicio no puede ser posterior a la fecha fin.');
  }

  const payload = { nombre, descripcion, fechaInicio, fechaFin, idEmprendimiento };

  try {
    if (editId) {
      await actualizarOferta(editId, payload);
    } else {
      await crearOferta(payload);
    }
    filaEditando = null;
    editId = null;
    await cargarMisOfertas();
    mostrarBannerExito('Cambios guardados');
  } catch (e) {
    mostrarBannerError(e.message || 'Error al guardar');
  }
}

// ==== Eventos ====
btnRegistrar.addEventListener('click', nuevoRegistro);
btnEditar.addEventListener('click', editarRegistro);
btnEliminar.addEventListener('click', pedirConfirmacionEliminar);
confirmEliminarBtn.addEventListener('click', confirmarEliminar);
cancelEliminarBtn.addEventListener('click', cancelarEliminar);
btnEnviar.addEventListener('click', enviarCambios);

// ==== Init ====
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await cargarMisEmprendimientos();
    await cargarMisOfertas();
  } catch (e) {
    mostrarBannerError(e.message);
  }
});
