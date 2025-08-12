// --- Config ---
const API_BASE = '';              // si frontend y backend viven en el mismo host, déjalo vacío
const TOKEN_KEY = 'token';        // donde guardas el JWT al hacer login
const PAGE_SIZE = 20;             // por si quieres paginar luego

// --- Helpers de UI (banners ya existen en tu HTML) ---
const $mensajeBanner = document.getElementById('errorRegistroBanner');
const $mensajeTxt    = document.getElementById('mensaje');
function showError(msg) {
  if ($mensajeTxt) $mensajeTxt.textContent = msg || 'Ocurrió un error cargando los anuncios.';
  if ($mensajeBanner) $mensajeBanner.style.display = 'flex';
}
function hideError() {
  if ($mensajeBanner) $mensajeBanner.style.display = 'none';
  if ($mensajeTxt) $mensajeTxt.textContent = '';
}

// --- Elementos de la tabla ---
const $tabla = document.getElementById('tablaAnuncios');
const $tbody = $tabla ? $tabla.querySelector('tbody') : null;

// Estado de carga
function setLoading() {
  if (!$tbody) return;
  $tbody.innerHTML = `
    <tr>
      <td colspan="4" style="text-align:center; opacity: .8;">Cargando anuncios...</td>
    </tr>`;
}

// Pintar filas
function renderRows(anuncios = []) {
  if (!$tbody) return;
  if (!Array.isArray(anuncios) || anuncios.length === 0) {
    $tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; opacity: .8;">No hay anuncios aprobados por ahora.</td>
      </tr>`;
    return;
  }

  const rows = anuncios.map(a => {
    // Campos defensivos
    const usuario = a.autor?.nombre || a.autor?.correo || '—';
    const contenido = a.contenido || a.descripcion || a.titulo || '—';
    const estado = a.estado || '—';
    const fecha = a.fecha_publicacion || a.fecha || a.createdAt || a.updatedAt || null;

    const dt = fecha ? new Date(fecha) : null;
    const fechaFmt = dt
      ? `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : '—';

    return `
      <tr>
        <td>${escapeHTML(usuario)}</td>
        <td>${escapeHTML(contenido)}</td>
        <td>${escapeHTML(estado)}</td>
        <td>${fechaFmt}</td>
      </tr>`;
  }).join('');

  $tbody.innerHTML = rows;
}

// Sanitizar simple para celdas
function escapeHTML(str) {
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}

// --- Cargar datos desde API ---
async function fetchAnuncios({ page = 1, limit = PAGE_SIZE } = {}) {
  const url = new URL(`${API_BASE}/api/anuncios`, location.origin);
  url.searchParams.set('estado', 'aprobado');   // clave para RF-04 (solo aprobados)
  url.searchParams.set('page', page);
  url.searchParams.set('limit', limit);
  url.searchParams.set('sort', '-fecha');       // intenta ordenar por fecha descendente si el backend lo soporta

  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(url.pathname + '?' + url.searchParams.toString(), { headers });
  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    throw new Error(data.mensaje || 'No se pudieron obtener los anuncios');
  }

  // admite dos formatos comunes: { anuncios:[...] } o arreglo directo
  return Array.isArray(data) ? data : (data.anuncios || data.items || []);
}

// --- Init ---
(async function init() {
  try {
    hideError();
    setLoading();
    const anuncios = await fetchAnuncios();

    // ordenar en cliente si el backend no ordena:
    anuncios.sort((a, b) => {
      const da = new Date(a.fecha_publicacion || a.fecha || a.createdAt || 0).getTime();
      const db = new Date(b.fecha_publicacion || b.fecha || b.createdAt || 0).getTime();
      return db - da;
    });

    renderRows(anuncios);
  } catch (err) {
    renderRows([]);   // limpia "Cargando..."
    showError(err.message);
    console.error(err);
  }
})();
