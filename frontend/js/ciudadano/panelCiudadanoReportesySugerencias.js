// ===== Config =====
const API_BASE = ''; // mismo host
const TOKEN_KEY = 'token';

// ===== Utilidades de UI =====
const $bannerOk = document.getElementById('registroExitosoBanner');
const $bannerErr = document.getElementById('errorRegistroBanner');
const $errTxt    = document.getElementById('mensaje');

function ok(msg = 'Cambios guardados') {
  if ($bannerOk) {
    $bannerOk.querySelector('span')?.lastChild?.nodeValue && ($bannerOk.querySelector('span').lastChild.nodeValue = ' ' + msg);
    $bannerOk.style.display = 'flex';
    setTimeout(() => { $bannerOk.style.display = 'none'; }, 2000);
  }
}
function errorUI(msg = 'Ocurrió un error') {
  if ($bannerErr && $errTxt) {
    $errTxt.textContent = msg;
    $bannerErr.style.display = 'block';
    setTimeout(() => { $bannerErr.style.display = 'none'; }, 2500);
  }
}

// ===== Helpers =====
function authHeaders(extra = {}) {
  const h = { ...extra };
  const t = localStorage.getItem(TOKEN_KEY);
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
}
function escapeHTML(s) {
  return String(s ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'", '&#039;');
}
function fmtFecha(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
}

// ===== DOM refs =====
const $tabla   = document.getElementById('tablaReportes');
const $tbody   = $tabla?.querySelector('tbody');
const $btnReg  = document.getElementById('btnRegistrar');
const $btnEdit = document.getElementById('btnEditar');
const $btnDel  = document.getElementById('btnEliminar');
const $btnSend = document.getElementById('btnEnviarCambios');

const $confirmBanner = document.getElementById('eliminarBanner');
const $btnConfirmDel = document.getElementById('confirmEliminarBtn');
const $btnCancelDel  = document.getElementById('cancelEliminarBtn');

let filaSeleccionada = null;
let editBuffer = null; // { mode: 'create'|'edit', id?, refs: {...} }

// ===== Carga inicial =====
init();
async function init() {
  try {
    pintarCargando();
    const items = await apiListar();
    renderRows(items);
    wireRowSelection();
  } catch (e) {
    renderRows([]);
    errorUI(e.message || 'No se pudieron cargar los reportes');
  }
}

// ===== API =====
async function apiListar() {
  const resp = await fetch(`${API_BASE}/api/reportes`, { headers: authHeaders() });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.mensaje || 'Error al obtener reportes');

  // Espera { reportes: [...] }
  const arr = data.reportes || [];
  // orden por fecha desc (createdAt o fechaEnvio)
  arr.sort((a,b) => new Date(b.createdAt || b.fechaEnvio || 0) - new Date(a.createdAt || a.fechaEnvio || 0));
  return arr;
}

async function apiCrear(payload) {
  const resp = await fetch(`${API_BASE}/api/reportes`, {
    method: 'POST',
    headers: authHeaders({'Content-Type':'application/json'}),
    body: JSON.stringify(payload)
  });
  const data = await resp.json().catch(()=> ({}));
  if (!resp.ok) throw new Error(data.mensaje || 'No se pudo crear el reporte');
  return data.reporte || data;
}

async function apiActualizar(id, payload) {
  const resp = await fetch(`${API_BASE}/api/reportes/${id}`, {
    method: 'PUT',
    headers: authHeaders({'Content-Type':'application/json'}),
    body: JSON.stringify(payload)
  });
  const data = await resp.json().catch(()=> ({}));
  if (!resp.ok) throw new Error(data.mensaje || 'No se pudo actualizar el reporte');
  return data.reporte || data;
}

async function apiEliminar(id) {
  // (Si decides permitir a ciudadanos borrar los suyos, crea un DELETE en el backend.
  // Por ahora asumimos que sólo admin puede eliminar, así que podría devolver 403.)
  const resp = await fetch(`${API_BASE}/api/reportes/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  const data = await resp.json().catch(()=> ({}));
  if (!resp.ok) throw new Error(data.mensaje || 'No se pudo eliminar el reporte');
  return true;
}

// ===== Render =====
function pintarCargando() {
  if ($tbody) {
    $tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;opacity:.8;">Cargando...</td></tr>`;
  }
}

function renderRows(items) {
  if (!$tbody) return;
  if (!items?.length) {
    $tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;opacity:.8;">No hay reportes todavía.</td></tr>`;
    return;
  }
  $tbody.innerHTML = items.map(it => {
    const usuario = it.idCiudadano?.nombre || it.idCiudadano?.correo || '—';
    const contenido = it.descripcion || '—';
    const estado = it.estado || 'pendiente';
    const imagen = it.imagenUrl ? `<a href="${escapeHTML(it.imagenUrl)}" target="_blank" rel="noopener">Ver</a>` : '—';
    const fecha = fmtFecha(it.createdAt || it.fechaEnvio);
    return `
      <tr data-id="${escapeHTML(it._id || it.id || '')}">
        <td>${escapeHTML(usuario)}</td>
        <td>${escapeHTML(contenido)}</td>
        <td>${escapeHTML(estado)}</td>
        <td>${imagen}</td>
        <td>${fecha}</td>
      </tr>`;
  }).join('');
}

function wireRowSelection() {
  $tbody?.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('click', () => {
      if (filaSeleccionada) filaSeleccionada.classList.remove('filaSeleccionada');
      filaSeleccionada = tr;
      tr.classList.add('filaSeleccionada');
    });
  });
}

// ===== Fila de edición/creación (inputs) =====
function addInputRow(prefill = {}) {
  // Evitar duplicado
  if ($tbody.querySelector('tr[data-editing="1"]')) {
    errorUI('Completa o cancela la edición actual.');
    return null;
  }

  const tr = document.createElement('tr');
  tr.setAttribute('data-editing','1');
  tr.innerHTML = `
    <td><input id="nombreUsuario" type="text" value="${escapeHTML(prefill.usuario || '')}" placeholder="Tu nombre" /></td>
    <td><input id="descripcion" type="text" value="${escapeHTML(prefill.descripcion || '')}" placeholder="Describe tu reporte o sugerencia" /></td>
    <td>
      <span id="estadoFijo">Pendiente</span>
      <input id="estadoReporte" type="hidden" value="pendiente">
    </td>
    <td>
      <input id="imagenUrl" type="url" placeholder="https://enlace-a-imagen (opcional)" value="${escapeHTML(prefill.imagenUrl || '')}">
    </td>
    <td><input id="fechayHora" type="datetime-local" style="color:#333" value="${prefill.fechaLocal || ''}" disabled></td>
  `;
  $tbody.insertBefore(tr, $tbody.firstChild);
  return tr;
}

function collectInputRow(tr) {
  const descripcion = tr.querySelector('#descripcion')?.value.trim();
  const imagenUrl = tr.querySelector('#imagenUrl')?.value.trim();

  if (!descripcion) {
    throw new Error('Completa la descripción.');
  }

  // Payload para backend (no enviamos estado; lo fija el servidor)
  const payload = {
    tipo: 'reporte',  // o 'sugerencia' si luego das opción en UI
    descripcion,
    imagenUrl: imagenUrl || undefined
  };
  return { payload };
}

// ===== Botones =====
$btnReg?.addEventListener('click', () => {
  const tr = addInputRow({ });
  if (tr) editBuffer = { mode: 'create', refs: { tr } };
});

$btnEdit?.addEventListener('click', () => {
  if (!filaSeleccionada) return alert('Selecciona una fila para editar.');
  const c = filaSeleccionada.querySelectorAll('td');
  const prefill = {
    usuario: c[0]?.textContent.trim(),
    descripcion: c[1]?.textContent.trim()
    // imagenUrl no lo podemos inferir del link "Ver" fácilmente
  };
  const tr = addInputRow(prefill);
  if (tr) {
    editBuffer = { mode: 'edit', id: filaSeleccionada.getAttribute('data-id'), refs: { tr } };
    filaSeleccionada.classList.remove('filaSeleccionada');
    filaSeleccionada = null;
  }
});

$btnDel?.addEventListener('click', () => {
  if (!filaSeleccionada) return alert('Selecciona una fila para eliminar.');
  $confirmBanner.style.display = 'flex';
});

$btnConfirmDel?.addEventListener('click', async () => {
  try {
    const id = filaSeleccionada?.getAttribute('data-id');
    if (!id) throw new Error('Fila sin id');
    await apiEliminar(id);
    filaSeleccionada.remove();
    filaSeleccionada = null;
    ok('Reporte eliminado');
  } catch (e) {
    errorUI(e.message);
  } finally {
    $confirmBanner.style.display = 'none';
  }
});
$btnCancelDel?.addEventListener('click', () => { $confirmBanner.style.display = 'none'; });

$btnSend?.addEventListener('click', async () => {
  if (!editBuffer?.refs?.tr) return errorUI('No hay cambios por enviar.');
  try {
    const { payload } = collectInputRow(editBuffer.refs.tr);

    if (editBuffer.mode === 'create') {
      await apiCrear(payload);
      ok('Reporte creado');
    } else {
      await apiActualizar(editBuffer.id, { descripcion: payload.descripcion, imagenUrl: payload.imagenUrl });
      ok('Reporte actualizado');
    }

    // Recarga lista
    const items = await apiListar();
    renderRows(items);
    wireRowSelection();
    editBuffer = null;
  } catch (e) {
    errorUI(e.message);
  }
});
