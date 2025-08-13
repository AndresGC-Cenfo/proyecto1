// /frontend/js/administrador/gestion-transporte.js

// ==== CONFIG ====
const API_TRANSPORTE = '/api/transporte';
const TOKEN = localStorage.getItem('token');

const headers = (json = false) => {
  const h = {};
  if (TOKEN) h['Authorization'] = `Bearer ${TOKEN}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

// Catálogo de rutas canónicas
const RUTAS = [
  { code: 'HI-CTG', label: 'Cartago' },
  { code: 'HI-ESC', label: 'Escazú' },
  { code: 'HI-ALT', label: 'Alajuelita' },
  { code: 'HI-ALA', label: 'Alajuela' },
  { code: 'HI-HER', label: 'Heredia' },
];
const selectRutaHTML = (selected) =>
  `<select id="iRuta">
    ${RUTAS.map(r => `<option value="${r.code}" ${r.code===selected?'selected':''}>${r.label} (${r.code})</option>`).join('')}
   </select>`;

// ==== STATE/UI ====
let filaSeleccionada = null;
let filaEditando = null;
let editId = null;
let cache = [];

const tbody = document.querySelector('#tablaTransporte tbody');
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
function toHuman(dt) {
  const d = new Date(dt);
  if (isNaN(d)) return '—';
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
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
const nl2br = (s='') => String(s).replace(/\n/g, '<br>');

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
  cache.forEach(doc => {
    const tr = document.createElement('tr');
    tr.dataset.id = doc._id;
    tr.innerHTML = `
      <td>${doc.transportista || ''}</td>
      <td>${doc.ruta || ''}</td>
      <td style="white-space:pre-wrap">${nl2br(doc.horario || '')}</td>
      <td style="white-space:pre-wrap">${nl2br(doc.tarifa || '')}</td>
      <td>${doc.contacto || '—'}</td>
      <td>${toHuman(doc.fechaActualizacion)}</td>
    `;
    tr.addEventListener('click', () => toggleSeleccion(tr));
    tbody.appendChild(tr);
  });
}

// ==== API ====
async function cargarRutas() {
  const r = await fetch(API_TRANSPORTE, { headers: headers() });
  if (!r.ok) {
    let msg = `No se pudieron cargar (HTTP ${r.status})`;
    try { const err = await r.json(); if (err?.mensaje) msg += ` - ${err.mensaje}`; } catch {}
    throw new Error(msg);
  }
  renderLista(await r.json());
}
async function crearRuta(payload) {
  const r = await fetch(API_TRANSPORTE, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al crear ruta');
  return r.json();
}
async function editarRuta(id, payload) {
  const r = await fetch(`${API_TRANSPORTE}/${id}`, {
    method: 'PUT',
    headers: headers(true),
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al editar ruta');
  return r.json();
}
async function eliminarRuta(id) {
  const r = await fetch(`${API_TRANSPORTE}/${id}`, {
    method: 'DELETE',
    headers: headers()
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al eliminar ruta');
  return r.json();
}

// ==== UI ====
function plantillaInputs(val = {}) {
  const tr = document.createElement('tr');
  tr.classList.add('fila-edicion');
  tr.innerHTML = `
    <td><input id="iTransportista" type="text" placeholder="Transportista" value="${val.transportista || ''}"></td>
    <td>${selectRutaHTML(val.ruta)}</td>
    <td>
      <textarea id="iHorario" rows="3" placeholder="Un horario por línea (Enter para saltos)">${val.horario || ''}</textarea>
    </td>
    <td>
      <textarea id="iTarifa" rows="3" placeholder="Ej.: Lumaca — 1600 CRC&#10;Chilsaca — 500 CRC">${val.tarifa || ''}</textarea>
    </td>
    <td><input id="iContacto" type="text" placeholder="Contacto (opcional)" value="${val.contacto || ''}"></td>
    <td style="opacity:.6">${val.fechaActualizacion ? toHuman(val.fechaActualizacion) : 'Se asigna al guardar'}</td>
  `;
  return tr;
}

function nuevoRegistro() {
  if (tbody.querySelector('tr input, tr select, tr textarea')) return mostrarBannerError('Debe completar el registro/edición actual.');
  editId = null;
  filaEditando = plantillaInputs();
  tbody.prepend(filaEditando);
  if (filaSeleccionada) { filaSeleccionada.classList.remove('filaSeleccionada'); filaSeleccionada = null; }
}

function editarRegistro() {
  if (!filaSeleccionada) return mostrarBannerError('Seleccione una fila para editar.');
  if (tbody.querySelector('tr input, tr select, tr textarea')) return mostrarBannerError('Ya hay una fila en edición/registro.');
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
    await eliminarRuta(id);
    filaSeleccionada = null;
    await cargarRutas();
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

  const transportista = fila.querySelector('#iTransportista').value.trim();
  const ruta          = fila.querySelector('#iRuta').value;
  const horario       = fila.querySelector('#iHorario').value.trim(); // mantiene saltos internos
  const tarifa        = fila.querySelector('#iTarifa').value.trim();  // mantiene saltos internos
  const contacto      = fila.querySelector('#iContacto').value.trim();

  if (!transportista || !ruta || !horario || !tarifa) {
    return mostrarBannerError('Completa transportista, ruta, horario y tarifa.');
  }

  const payload = { transportista, ruta, horario, tarifa, contacto };

  try {
    if (editId) await editarRuta(editId, payload);
    else await crearRuta(payload);

    filaEditando = null;
    editId = null;
    await cargarRutas();
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
  try { await cargarRutas(); } catch (e) { mostrarBannerError(e.message); }
});
