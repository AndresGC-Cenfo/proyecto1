// ==== CONFIG ====
const API_ANUNCIOS = '/api/anuncios';
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
let cache = []; // anuncios cargados

const tbody = document.querySelector('#tablaAnuncios tbody');
const btnAprobar = document.getElementById('btnAprobar');
const btnRechazar = document.getElementById('btnRechazar');
const btnRegistrar = document.getElementById('btnRegistrar');
const btnEditar = document.getElementById('btnEditar');
const btnEliminar = document.getElementById('btnEliminar');
const btnEnviar = document.getElementById('btnEnviarCambios');
const confirmEliminarBtn = document.getElementById('confirmEliminarBtn');
const cancelEliminarBtn = document.getElementById('cancelEliminarBtn');

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
function toLocalDateTimeInput(dt) {
  const d = new Date(dt);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function toHuman(dt) {
  const d = new Date(dt);
  if (isNaN(d)) return '—';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
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
    tr.innerHTML = `<td colspan="4" style="text-align:center;opacity:.7">Sin registros</td>`;
    tbody.appendChild(tr);
    return;
  }
  cache.forEach(a => {
    const tr = document.createElement('tr');
    tr.dataset.id = a._id;
    const usuario = a.autorId?.nombre || a.autorId?.email || '—';
    const contenido = [a.titulo, a.descripcion].filter(Boolean).join(' — ');
    tr.innerHTML = `
      <td>${usuario}</td>
      <td>${contenido}</td>
      <td>${a.estado || 'pendiente'}</td>
      <td>${toHuman(a.fechaPublicacion)}</td>
    `;
    tr.addEventListener('click', () => toggleSeleccion(tr));
    tbody.appendChild(tr);
  });
}

// ==== API ====
async function cargarAnuncios(estado) {
  const qs = estado ? `?estado=${encodeURIComponent(estado)}` : '';
  const r = await fetch(`${API_ANUNCIOS}/admin${qs}`, { headers: headers() });
  if (!r.ok) {
    let msg = `No se pudieron cargar los anuncios (HTTP ${r.status})`;
    try { const err = await r.json(); if (err?.mensaje) msg += ` - ${err.mensaje}`; } catch { }
    throw new Error(msg);
  }
  renderLista(await r.json());
}

async function crearAnuncio(payload) {
  const r = await fetch(API_ANUNCIOS, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al crear');
  return r.json();
}

async function actualizarAnuncio(id, payload) {
  const r = await fetch(`${API_ANUNCIOS}/${id}`, {
    method: 'PUT',
    headers: headers(true),
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al actualizar');
  return r.json();
}

async function eliminarAnuncio(id) {
  const r = await fetch(`${API_ANUNCIOS}/${id}`, {
    method: 'DELETE',
    headers: headers()
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al eliminar');
  return r.json();
}

async function cambiarEstado(id, estado /* 'aprobado'|'rechazado' */) {
  const r = await fetch(`${API_ANUNCIOS}/${id}/estado`, {
    method: 'PATCH',
    headers: headers(true),
    body: JSON.stringify({ estado })
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'No se pudo cambiar el estado');
  return r.json();
}

// ==== UI: CREAR / EDITAR / ELIMINAR ====
function plantillaInputs(val = {}) {
  const tr = document.createElement('tr');
  tr.classList.add('fila-edicion');
  tr.innerHTML = `
    <td title="Se asigna automáticamente con tu sesión">Auto</td>
    <td>
      <input id="iTitulo" type="text" placeholder="Título" value="${val.titulo || ''}" style="margin-bottom:6px">
      <input id="iDescripcion" type="text" placeholder="Descripción" value="${val.descripcion || ''}">
    </td>
    <td>
      <select id="iEstado">
        <option value="" ${!val.estado ? 'selected' : ''}>pendiente (por defecto)</option>
        <option value="pendiente" ${val.estado === 'pendiente' ? 'selected' : ''}>pendiente</option>
        <option value="aprobado" ${val.estado === 'aprobado' ? 'selected' : ''}>aprobado</option>
        <option value="rechazado" ${val.estado === 'rechazado' ? 'selected' : ''}>rechazado</option>
      </select>
    </td>
    <td><input id="iFecha" type="datetime-local" value="${val.fechaPublicacion ? toLocalDateTimeInput(val.fechaPublicacion) : ''}" style="color:#333"></td>
  `;
  return tr;
}


function nuevoRegistro() {
  if (tbody.querySelector('tr input, tr select')) {
    return mostrarBannerError('Debe completar el registro/edición actual.');
  }
  editId = null;
  filaEditando = plantillaInputs({ estado: 'pendiente' });
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
    await eliminarAnuncio(id);
    filaSeleccionada = null;
    await cargarAnuncios();
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

  const titulo = fila.querySelector('#iTitulo').value.trim();
  const descripcion = fila.querySelector('#iDescripcion').value.trim();
  const estadoSel = fila.querySelector('#iEstado').value;        // opcional
  const fechaSel = fila.querySelector('#iFecha').value;         // opcional

  if (!titulo || !descripcion) {
    return mostrarBannerError('Completa título y descripción.');
  }

  // Para el backend, ambos son opcionales:
  const payload = { titulo, descripcion };
  if (fechaSel) payload.fechaPublicacion = fechaSel;

  try {
    if (editId) {
      await actualizarAnuncio(editId, payload);
      const original = cache.find(a => String(a._id) === String(editId));
      if (estadoSel && original && original.estado !== estadoSel) {
        await cambiarEstado(editId, estadoSel);
      }
    } else {
      const res = await crearAnuncio(payload);
      const nuevoId = res?.anuncio?._id;
      if (estadoSel && estadoSel !== 'pendiente' && nuevoId) {
        await cambiarEstado(nuevoId, estadoSel);
      }
    }

    filaEditando = null;
    editId = null;
    await cargarAnuncios();
    mostrarBannerExito('Cambios guardados');
  } catch (e) {
    mostrarBannerError(e.message || 'Error al guardar');
  }
}

// ==== UI: Aprobar / Rechazar ====
async function aprobarSeleccionado() {
  if (!filaSeleccionada) return mostrarBannerError('Seleccione una fila para aprobar.');
  try {
    await cambiarEstado(filaSeleccionada.dataset.id, 'aprobado');
    await cargarAnuncios();
    mostrarBannerExito('Anuncio aprobado');
  } catch (e) {
    mostrarBannerError(e.message);
  }
}
async function rechazarSeleccionado() {
  if (!filaSeleccionada) return mostrarBannerError('Seleccione una fila para rechazar.');
  try {
    await cambiarEstado(filaSeleccionada.dataset.id, 'rechazado');
    await cargarAnuncios();
    mostrarBannerExito('Anuncio rechazado');
  } catch (e) {
    mostrarBannerError(e.message);
  }
}

// ==== Eventos ====
btnRegistrar.addEventListener('click', nuevoRegistro);
btnEditar.addEventListener('click', editarRegistro);
btnEliminar.addEventListener('click', pedirConfirmacionEliminar);
confirmEliminarBtn.addEventListener('click', confirmarEliminar);
cancelEliminarBtn.addEventListener('click', cancelarEliminar);
btnEnviar.addEventListener('click', enviarCambios);
btnAprobar.addEventListener('click', aprobarSeleccionado);
btnRechazar.addEventListener('click', rechazarSeleccionado);

// ==== Init ====
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await cargarAnuncios(); // todos
  } catch (e) {
    mostrarBannerError(e.message);
  }
});
