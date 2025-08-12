// === Config ===
const API_BASE = '/api/emprendimientos'; // ajusta si montaste en otra ruta
const TOKEN = localStorage.getItem('token');

const tablaBody = document.querySelector('#tablaEmprendimientos tbody');
const btnRegistrar = document.getElementById('btnRegistrar');
const btnEditar = document.getElementById('btnEditar');
const btnEliminar = document.getElementById('btnEliminar');
const btnEnviar = document.getElementById('btnEnviarCambios');
const confirmEliminarBtn = document.getElementById('confirmEliminarBtn');
const cancelEliminarBtn = document.getElementById('cancelEliminarBtn');

let filaSeleccionada = null;   // <tr> seleccionado (de datos)
let filaEditando = null;       // <tr> con inputs arriba
let editId = null;             // null => crear, string => editar

function authHeaders(json = false) {
  const h = { 'Authorization': `Bearer ${TOKEN}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

// === Banners utilitarios (ya existen en tu HTML) ===
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

// === Render de filas ===
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
    tr.innerHTML = `
      <td>${doc.nombreNegocio || ''}</td>
      <td>${doc.descripcion || ''}</td>
      <td>${doc.categoria || ''}</td>
      <td>${doc.estado || 'pendiente'}</td>
      <td>${doc.imagenUrl ? `<a href="${doc.imagenUrl}" target="_blank">Ver imagen</a>` : '—'}</td>
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

// === Fila de edición/alta (inputs) ===
function plantillaInputs(val = {}) {
  const tr = document.createElement('tr');
  tr.classList.add('fila-edicion');
  tr.innerHTML = `
    <td><input id="iNombre" type="text" placeholder="Nombre del negocio" value="${val.nombreNegocio || ''}"></td>
    <td><input id="iDescripcion" type="text" placeholder="Descripción" value="${val.descripcion || ''}"></td>
    <td><input id="iCategoria" type="text" placeholder="Categoría" value="${val.categoria || ''}"></td>
    <td>${val.estado || 'pendiente'}</td>
    <td><input id="iImagenUrl" type="text" placeholder="https://ruta/imagen.jpg" value="${val.imagenUrl || ''}"></td>
  `;
  return tr;
}

// === Cargar mis emprendimientos ===
async function cargarLista() {
  try {
    const r = await fetch(`${API_BASE}`, { headers: authHeaders() });
    if (r.status === 401 || r.status === 403) throw new Error('No autorizado');
    const data = await r.json();
    renderLista(data);
  } catch (e) {
    mostrarBannerError(e.message);
  }
}

// === Crear / Editar / Eliminar ===
function nuevoRegistro() {
  if (filaEditando) return mostrarBannerError('Termina el registro/edición actual.');
  editId = null;
  filaEditando = plantillaInputs();
  tablaBody.prepend(filaEditando);
  if (filaSeleccionada) { filaSeleccionada.classList.remove('filaSeleccionada'); filaSeleccionada = null; }
}

function editarRegistro() {
  if (!filaSeleccionada) return mostrarBannerError('Selecciona una fila para editar.');
  if (filaEditando) return mostrarBannerError('Termina el registro/edición actual.');

  const vals = {
    _id: filaSeleccionada.dataset.id,
    nombreNegocio: filaSeleccionada.children[0].textContent,
    descripcion:    filaSeleccionada.children[1].textContent,
    categoria:      filaSeleccionada.children[2].textContent,
    estado:         filaSeleccionada.children[3].textContent,
    imagenUrl:      (filaSeleccionada.children[4].querySelector('a')?.getAttribute('href')) || ''
  };
  editId = vals._id;
  filaEditando = plantillaInputs(vals);
  tablaBody.prepend(filaEditando);
  // mantener selección visual si quieres, pero no es necesario
}

function pedirConfirmacionEliminar() {
  if (!filaSeleccionada) return mostrarBannerError('Selecciona una fila para eliminar.');
  document.getElementById('eliminarBanner').style.display = 'flex';
}

async function confirmarEliminar() {
  try {
    const id = filaSeleccionada?.dataset.id;
    if (!id) return;
    const r = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!r.ok) throw (await r.json());
    filaSeleccionada = null;
    await cargarLista();
    mostrarBannerExito('Eliminado correctamente');
  } catch (e) {
    mostrarBannerError(e.mensaje || 'Error al eliminar');
  } finally {
    document.getElementById('eliminarBanner').style.display = 'none';
  }
}
function cancelarEliminar() {
  document.getElementById('eliminarBanner').style.display = 'none';
}

async function enviarCambios() {
  if (!filaEditando) return mostrarBannerError('No hay cambios por enviar.');

  const payload = {
    nombreNegocio: document.getElementById('iNombre').value.trim(),
    descripcion:   document.getElementById('iDescripcion').value.trim(),
    categoria:     document.getElementById('iCategoria').value.trim(),
    imagenUrl:     document.getElementById('iImagenUrl').value.trim()
    // contacto/ubicacion se pueden agregar después en la UI si los necesitas
  };
  if (!payload.nombreNegocio || !payload.descripcion || !payload.categoria) {
    return mostrarBannerError('Completa nombre, descripción y categoría.');
  }

  try {
    let r;
    if (editId) {
      r = await fetch(`${API_BASE}/${editId}`, {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify(payload)
      });
    } else {
      r = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(payload)
      });
    }
    if (!r.ok) throw (await r.json());
    // reset
    filaEditando = null;
    editId = null;
    await cargarLista();
    mostrarBannerExito('Cambios guardados');
  } catch (e) {
    mostrarBannerError(e.mensaje || 'Error al guardar');
  }
}

// === Eventos ===
btnRegistrar.addEventListener('click', nuevoRegistro);
btnEditar.addEventListener('click', editarRegistro);
btnEliminar.addEventListener('click', pedirConfirmacionEliminar);
confirmEliminarBtn.addEventListener('click', confirmarEliminar);
cancelEliminarBtn.addEventListener('click', cancelarEliminar);
btnEnviar.addEventListener('click', enviarCambios);

window.addEventListener('DOMContentLoaded', cargarLista);
