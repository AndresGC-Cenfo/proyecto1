// ==== CONFIG ====
const API_OFERTAS = '/api/ofertas';
const API_EMPRENDIMIENTOS = '/api/emprendimientos/admin'; // lista global para el select
const TOKEN = localStorage.getItem('token');

const headers = (json = false) => {
  const h = { 'Authorization': `Bearer ${TOKEN}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

// ==== STATE/UI ====
let filaSeleccionada = null;
let filaEditando = null;
let editId = null;
let cache = [];
let emprendimientos = []; // para el select

const tbody = document.querySelector('#tablaOfertas tbody');
const btnRegistrar = document.getElementById('btnRegistrar');
const btnEditar = document.getElementById('btnEditar');
const btnEliminar = document.getElementById('btnEliminar');
const btnEnviar = document.getElementById('btnEnviarCambios');
const confirmEliminarBtn = document.getElementById('confirmEliminarBtn');
const cancelEliminarBtn = document.getElementById('cancelEliminarBtn');

// ==== BANNERS ====
function mostrarBannerExito(msg = 'Operación exitosa') {
  const b = document.getElementById('registroExitosoBanner');
  b.querySelector('span').innerHTML = `<i class="fas fa-circle-check"></i> ${msg}`;
  b.style.display = 'flex';
  setTimeout(() => b.style.display = 'none', 2500);
}
function mostrarBannerError(m) {
  const b = document.getElementById('errorRegistroBanner');
  document.getElementById('mensaje').textContent = m || 'Ocurrió un error';
  b.style.display = 'block';
  setTimeout(() => b.style.display = 'none', 3000);
}

// ==== HELPERS ====
const pad2 = (n) => String(n).padStart(2, '0');
function toYYYYMMDD(d) {
  const dt = new Date(d);
  if (isNaN(dt)) return '';
  return `${dt.getFullYear()}-${pad2(dt.getMonth()+1)}-${pad2(dt.getDate())}`;
}
function estadoDesdeVigencia(inicio, fin) {
  const hoy = new Date();
  const dIni = new Date(inicio);
  const dFin = new Date(fin);
  if (hoy < dIni) return 'Próxima';
  if (hoy > dFin) return 'Expirada';
  return 'Vigente';
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
function selectEmprHTML(selectedId) {
  const opts = emprendimientos.map(e =>
    `<option value="${e._id}" ${String(selectedId) === String(e._id) ? 'selected':''}>${e.nombreNegocio}</option>`
  ).join('');
  return `<select id="iEmpr">${opts}</select>`;
}

// ==== RENDER ====
function renderLista(lista) {
  cache = Array.isArray(lista) ? lista : [];
  tbody.innerHTML = '';
  if (!cache.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" style="text-align:center;opacity:.7">Sin registros</td>`;
    tbody.appendChild(tr);
    return;
  }
  cache.forEach(o => {
    const tr = document.createElement('tr');
    tr.dataset.id = o._id;
    const ini = toYYYYMMDD(o.fechaInicio);
    const fin = toYYYYMMDD(o.fechaFin);
    const est = estadoDesdeVigencia(o.fechaInicio, o.fechaFin);
    tr.innerHTML = `
      <td>${o.nombre || ''}</td>
      <td>${o.idEmprendimiento?.nombreNegocio || '(sin nombre)'}</td>
      <td>${ini} → ${fin}</td>
      <td>${est}</td>
      <td>${o.descripcion || '—'}</td>
    `;
    tr.addEventListener('click', () => toggleSeleccion(tr));
    tbody.appendChild(tr);
  });
}

function plantillaInputs(val = {}) {
  const tr = document.createElement('tr');
  tr.classList.add('fila-edicion');
  const ini = val.fechaInicio ? toYYYYMMDD(val.fechaInicio) : '';
  const fin = val.fechaFin ? toYYYYMMDD(val.fechaFin) : '';
  tr.innerHTML = `
    <td><input id="iNombre" type="text" placeholder="Nombre de la oferta" value="${val.nombre || ''}"></td>
    <td>${selectEmprHTML(val.idEmprendimiento?._id || val.idEmprendimiento)}</td>
    <td>
      <input id="iInicio" type="date" value="${ini}" style="width:48%">
      <input id="iFin" type="date" value="${fin}" style="width:48%;margin-left:4%">
    </td>
    <td>${(ini && fin) ? estadoDesdeVigencia(ini, fin) : '—'}</td>
    <td><input id="iDescripcion" type="text" placeholder="Descripción" value="${val.descripcion || ''}"></td>
  `;
  return tr;
}

// ==== API ====
async function cargarEmprendimientosAdmin() {
  const r = await fetch(API_EMPRENDIMIENTOS, { headers: headers() });
  if (!r.ok) {
    let msg = `No se pudieron cargar emprendimientos (HTTP ${r.status})`;
    try { const err = await r.json(); if (err?.mensaje) msg += ` - ${err.mensaje}`; } catch {}
    throw new Error(msg);
  }
  emprendimientos = await r.json();
}
async function cargarOfertasAdmin() {
  const r = await fetch(`${API_OFERTAS}/admin`, { headers: headers() });
  if (!r.ok) {
    let msg = `No se pudieron cargar ofertas (HTTP ${r.status})`;
    try { const err = await r.json(); if (err?.mensaje) msg += ` - ${err.mensaje}`; } catch {}
    throw new Error(msg);
  }
  renderLista(await r.json());
}
async function crearOferta(payload) {
  const r = await fetch(API_OFERTAS, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al crear');
  return r.json();
}
async function actualizarOferta(id, payload) {
  const r = await fetch(`${API_OFERTAS}/${id}`, {
    method: 'PUT',
    headers: headers(true),
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al actualizar');
  return r.json();
}
async function eliminarOferta(id) {
  const r = await fetch(`${API_OFERTAS}/${id}`, {
    method: 'DELETE',
    headers: headers()
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al eliminar');
  return r.json();
}

// ==== UI (crear/editar/eliminar) ====
function nuevoRegistro() {
  if (!emprendimientos.length) return mostrarBannerError('No hay emprendimientos para asociar.');
  if (tbody.querySelector('tr input, tr select')) return mostrarBannerError('Termine la edición/registro actual.');
  editId = null;
  filaEditando = plantillaInputs();
  tbody.prepend(filaEditando);
  if (filaSeleccionada) { filaSeleccionada.classList.remove('filaSeleccionada'); filaSeleccionada = null; }
}

function editarRegistro() {
  if (!filaSeleccionada) return mostrarBannerError('Seleccione una fila para editar.');
  if (tbody.querySelector('tr input, tr select')) return mostrarBannerError('Termine la edición/registro actual.');

  const [tdNombre, tdEmp, tdVig, , tdDesc] = filaSeleccionada.children;
  const vigParts = (tdVig.textContent || '').split('→').map(s => s.trim());
  const emp = emprendimientos.find(e => e.nombreNegocio === tdEmp.textContent);

  const val = {
    _id: filaSeleccionada.dataset.id,
    nombre: tdNombre.textContent,
    idEmprendimiento: emp?._id,
    fechaInicio: vigParts[0] || '',
    fechaFin: vigParts[1] || '',
    descripcion: tdDesc.textContent === '—' ? '' : tdDesc.textContent
  };

  editId = val._id;
  filaEditando = plantillaInputs(val);
  tbody.prepend(filaEditando);
}

function pedirConfirmacionEliminar() {
  if (!filaSeleccionada) return mostrarBannerError('Seleccione una fila para eliminar.');
  document.getElementById('eliminarBanner').style.display = 'flex';
}
async function confirmarEliminar() {
  try {
    const id = filaSeleccionada?.dataset.id;
    if (!id) return;
    await eliminarOferta(id);
    filaSeleccionada = null;
    await cargarOfertasAdmin();
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
  const fila = filaEditando;
  if (!fila) return mostrarBannerError('No hay cambios por enviar.');

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
    if (editId) await actualizarOferta(editId, payload);
    else await crearOferta(payload);

    filaEditando = null;
    editId = null;
    await cargarOfertasAdmin();
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
    await cargarEmprendimientosAdmin();
    await cargarOfertasAdmin();
  } catch (e) {
    mostrarBannerError(e.message);
  }
});
