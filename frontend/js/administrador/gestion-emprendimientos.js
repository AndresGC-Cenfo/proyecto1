// ==== CONFIG ====
const API_EMPRENDIMIENTOS = '/api/emprendimientos';
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

const tbody = document.querySelector('#tablaEmprendimientos tbody');
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
    tr.innerHTML = `<td colspan="5" style="text-align:center;opacity:.7">Sin registros</td>`;
    tbody.appendChild(tr);
    return;
  }
  cache.forEach(doc => {
    const tr = document.createElement('tr');
    tr.dataset.id = doc._id;
    tr.innerHTML = `
      <td>${doc.nombreNegocio || ''}</td>
      <td>${doc.descripcion || ''}</td>
      <td>${doc.categoria || ''}</td>
      <td>${doc.estado || 'pendiente'}</td>
      <td>${doc.imagenUrl ? `<a href="${doc.imagenUrl}" target="_blank">Ver imagen</a>` : '—'}</td>
    `;
    tr.addEventListener('click', () => toggleSeleccion(tr));
    tbody.appendChild(tr);
  });
}

// ==== API ====
async function cargarEmprendimientos(estado) {
  const qs = estado ? `?estado=${encodeURIComponent(estado)}` : '';
  const r = await fetch(`${API_EMPRENDIMIENTOS}/admin${qs}`, { headers: headers() });
  if (!r.ok) {
    let msg = `No se pudieron cargar (HTTP ${r.status})`;
    try { const err = await r.json(); if (err?.mensaje) msg += ` - ${err.mensaje}`; } catch {}
    throw new Error(msg);
  }
  renderLista(await r.json());
}

async function actualizarEmprendimiento(id, payload) {
  const r = await fetch(`${API_EMPRENDIMIENTOS}/${id}`, {
    method: 'PUT',
    headers: headers(true),
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al actualizar');
  return r.json();
}

async function cambiarEstado(id, estado) {
  const r = await fetch(`${API_EMPRENDIMIENTOS}/${id}/estado`, {
    method: 'PATCH',
    headers: headers(true),
    body: JSON.stringify({ estado })
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'No se pudo cambiar el estado');
  return r.json();
}

async function eliminarEmprendimiento(id) {
  const r = await fetch(`${API_EMPRENDIMIENTOS}/${id}`, {
    method: 'DELETE',
    headers: headers()
  });
  if (!r.ok) throw new Error((await r.json()).mensaje || 'Error al eliminar');
  return r.json();
}

// ==== UI ====
function plantillaInputs(val = {}) {
  const tr = document.createElement('tr');
  tr.classList.add('fila-edicion');
  tr.innerHTML = `
    <td><input id="iNombre" type="text" placeholder="Nombre del negocio" value="${val.nombreNegocio || ''}"></td>
    <td><input id="iDescripcion" type="text" placeholder="Descripción" value="${val.descripcion || ''}"></td>
    <td><input id="iCategoria" type="text" placeholder="Categoría" value="${val.categoria || ''}"></td>
    <td>
      <select id="iEstado">
        <option value="" ${!val.estado ? 'selected' : ''}>pendiente (por defecto)</option>
        <option value="pendiente" ${val.estado === 'pendiente' ? 'selected' : ''}>pendiente</option>
        <option value="aprobado" ${val.estado === 'aprobado' ? 'selected' : ''}>aprobado</option>
        <option value="rechazado" ${val.estado === 'rechazado' ? 'selected' : ''}>rechazado</option>
      </select>
    </td>
    <td><input id="iImagenUrl" type="text" placeholder="https://ruta/imagen.jpg" value="${val.imagenUrl || ''}"></td>
  `;
  return tr;
}

function nuevoRegistro() {
  // En admin NO se crean emprendimientos (los crea el emprendedor)
  mostrarBannerError('Los emprendimientos se crean desde el panel de Emprendedor.');
}

function editarRegistro() {
  if (!filaSeleccionada) return mostrarBannerError('Seleccione una fila para editar.');
  if (tbody.querySelector('tr input, tr select')) return mostrarBannerError('Termine la edición actual primero.');

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
    await eliminarEmprendimiento(id);
    filaSeleccionada = null;
    await cargarEmprendimientos();
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

  const nombreNegocio = fila.querySelector('#iNombre').value.trim();
  const descripcion   = fila.querySelector('#iDescripcion').value.trim();
  const categoria     = fila.querySelector('#iCategoria').value.trim();
  const imagenUrl     = fila.querySelector('#iImagenUrl').value.trim();
  const estadoNuevo   = fila.querySelector('#iEstado').value;

  if (!nombreNegocio || !descripcion || !categoria) {
    return mostrarBannerError('Completa nombre, descripción y categoría.');
  }

  try {
    const original = cache.find(a => String(a._id) === String(editId));
    await actualizarEmprendimiento(editId, { nombreNegocio, descripcion, categoria, imagenUrl });
    if (estadoNuevo && original && original.estado !== estadoNuevo) {
      await cambiarEstado(editId, estadoNuevo);
    }
    filaEditando = null;
    editId = null;
    await cargarEmprendimientos();
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
  try { await cargarEmprendimientos(); }
  catch (e) { mostrarBannerError(e.message); }
});
