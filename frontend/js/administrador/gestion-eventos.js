// ==== CONFIG ====
const API_EVENTOS = '/api/eventos';
const TOKEN = localStorage.getItem('token'); // requerido para POST/PUT/DELETE (admin)

const headers = (json = false) => {
  const h = {};
  if (TOKEN) h['Authorization'] = `Bearer ${TOKEN}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

// ==== STATE/UI ====
let filaSeleccionada = null;
let filaEditando = null;
let editId = null;
let cache = [];

const tbody = document.querySelector('#tablaEventos tbody');
const btnRegistrar = document.getElementById('btnRegistrar');
const btnEditar = document.getElementById('btnEditar');
const btnEliminar = document.getElementById('btnEliminar');
const btnEnviar = document.getElementById('btnEnviarCambios');
const confirmEliminarBtn = document.getElementById('confirmEliminarBtn');
const cancelEliminarBtn = document.getElementById('cancelEliminarBtn');

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
const pad2 = (n) => String(n).padStart(2, '0');
function toYYYYMMDD(d) {
  const dt = new Date(d);
  if (isNaN(dt)) return '';
  return `${dt.getFullYear()}-${pad2(dt.getMonth()+1)}-${pad2(dt.getDate())}`;
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

// ==== RENDER ====
function renderLista(lista) {
  cache = Array.isArray(lista) ? lista : [];
  tbody.innerHTML = '';
  if (!cache.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="6" style="text-align:center;opacity:.7">Sin registros</td>`;
    tbody.appendChild(tr);
    return;
  }
  cache.forEach(ev => {
    const tr = document.createElement('tr');
    tr.dataset.id = ev._id;
    tr.innerHTML = `
      <td>${ev._id}</td>
      <td>${ev.nombre || ''}</td>
      <td>${ev.descripcion || ''}</td>
      <td>${toYYYYMMDD(ev.fechaEvento)}</td>
      <td>${ev.ubicacion || ''}</td>
      <td>${(ev.idOrganizador && (ev.idOrganizador._id || ev.idOrganizador)) || '—'}</td>
    `;
    tr.addEventListener('click', () => toggleSeleccion(tr));
    tbody.appendChild(tr);
  });
}

// ==== API ====
async function cargarEventos() {
  const r = await fetch(API_EVENTOS, { headers: headers() });
  if (!r.ok) {
    let msg = `No se pudieron cargar (HTTP ${r.status})`;
    try { const err = await r.json(); if (err?.mensaje) msg += ` - ${err.mensaje}`; } catch {}
    throw new Error(msg);
  }
  renderLista(await r.json());
}
async function crearEvento(payload) {
  const r = await fetch(API_EVENTOS, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al crear evento');
  return r.json();
}
async function editarEvento(id, payload) {
  const r = await fetch(`${API_EVENTOS}/${id}`, {
    method: 'PUT',
    headers: headers(true),
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al editar evento');
  return r.json();
}
async function eliminarEvento(id) {
  const r = await fetch(`${API_EVENTOS}/${id}`, {
    method: 'DELETE',
    headers: headers()
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al eliminar evento');
  return r.json();
}

// ==== UI ====
function plantillaInputs(val = {}) {
  const tr = document.createElement('tr');
  tr.classList.add('fila-edicion');
  tr.innerHTML = `
    <td title="ID asignado automáticamente">Auto</td>
    <td><input id="iNombre" type="text" placeholder="Nombre del evento" value="${val.nombre || ''}"></td>
    <td><input id="iDescripcion" type="text" placeholder="Descripción" value="${val.descripcion || ''}"></td>
    <td><input id="iFecha" type="date" value="${val.fechaEvento ? toYYYYMMDD(val.fechaEvento) : ''}"></td>
    <td><input id="iUbicacion" type="text" placeholder="Ubicación" value="${val.ubicacion || ''}"></td>
    <td title="Se asigna desde tu sesión">Auto</td>
  `;
  return tr;
}

function nuevoRegistro() {
  if (tbody.querySelector('tr input, tr select')) {
    return mostrarBannerError('Debe completar el registro/edición actual.');
  }
  editId = null;
  filaEditando = plantillaInputs();
  tbody.prepend(filaEditando);
  if (filaSeleccionada) { filaSeleccionada.classList.remove('filaSeleccionada'); filaSeleccionada = null; }
}

function editarRegistro() {
  if (!filaSeleccionada) return mostrarBannerError('Seleccione una fila para editar.');
  if (tbody.querySelector('tr input, tr select')) {
    return mostrarBannerError('Ya hay una fila en edición/registro.');
  }
  const id = filaSeleccionada.dataset.id;
  const src = cache.find(x => String(x._id) === String(id)) || {};
  editId = id;
  filaEditando = plantillaInputs(src);
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
    await eliminarEvento(id);
    filaSeleccionada = null;
    await cargarEventos();
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

  const nombre       = fila.querySelector('#iNombre').value.trim();
  const descripcion  = fila.querySelector('#iDescripcion').value.trim();
  const fechaEvento  = fila.querySelector('#iFecha').value;
  const ubicacion    = fila.querySelector('#iUbicacion').value.trim();

  if (!nombre || !descripcion || !fechaEvento || !ubicacion) {
    return mostrarBannerError('Completa nombre, descripción, fecha y ubicación.');
  }

  const payload = { nombre, descripcion, fechaEvento, ubicacion };

  try {
    if (editId) {
      await editarEvento(editId, payload);
    } else {
      await crearEvento(payload);
    }
    filaEditando = null;
    editId = null;
    await cargarEventos();
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
  try { await cargarEventos(); }
  catch (e) { mostrarBannerError(e.message); }
});
