// ===== Config =====
const API_BASE = ''; // mismo host
const TOKEN_KEY = 'token';

// ===== Banners (reutiliza los del HTML) =====
const $bannerOk  = document.getElementById('registroExitosoBanner');   // lo usaremos como “cargado”
const $bannerErr = document.getElementById('errorRegistroBanner');
const $errTxt    = document.getElementById('mensaje');

function errorUI(msg = 'Ocurrió un error') {
  if ($bannerErr && $errTxt) {
    $errTxt.textContent = msg;
    $bannerErr.style.display = 'block';
    setTimeout(() => { $bannerErr.style.display = 'none'; }, 2500);
  } else {
    alert(msg);
  }
}
function infoOk(msg = 'Ofertas cargadas') {
  if ($bannerOk) {
    const span = $bannerOk.querySelector('span');
    if (span) {
      // Reemplaza el texto manteniendo el icono si hay
      const icon = span.querySelector('i');
      span.innerHTML = (icon ? icon.outerHTML + ' ' : '') + msg;
    }
    $bannerOk.style.display = 'flex';
    setTimeout(() => { $bannerOk.style.display = 'none'; }, 1500);
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
function fmtFechaSolo(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString();
}
function hoyISO() {
  const now = new Date();
  return now.toISOString();
}

// ===== DOM =====
const $tabla = document.getElementById('tablaOfertas');
const $tbody = $tabla?.querySelector('tbody');

init().catch(e => errorUI(e.message));

async function init() {
  pintarCargando();

  // 1) Intentamos varias formas de obtener "ofertas" por si tu backend expone distintas respuestas.
  const ofertas = await apiListarOfertas();

  // 2) Filtramos para el panel ciudadano:
  //    - estado: 'aprobado' (si existe)
  //    - vigentes hoy (fechaInicio <= hoy <= fechaFin), si las fechas existen
  const now = new Date();
  const filtradas = ofertas.filter(o => {
    const estadoOk = (o.estado ? String(o.estado).toLowerCase() === 'aprobado' : true);
    let vigenciaOk = true;
    if (o.fechaInicio || o.fechaFin) {
      const ini = o.fechaInicio ? new Date(o.fechaInicio) : null;
      const fin = o.fechaFin    ? new Date(o.fechaFin)    : null;
      if (ini && now < ini) vigenciaOk = false;
      if (fin && now > fin) vigenciaOk = false;
    }
    return estadoOk && vigenciaOk;
  });

  renderRows(filtradas);
  infoOk('Ofertas cargadas');
}

async function apiListarOfertas() {
  // Probamos primero con querys útiles si tu backend las soporta (no rompe si no):
  const urls = [
    `${API_BASE}/api/ofertas?estado=aprobado&vigentes=true`,
    `${API_BASE}/api/ofertas`, // fallback general
  ];

  let data = null, lastErr = null;
  for (const url of urls) {
    try {
      const resp = await fetch(url, { headers: authHeaders() });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(json.mensaje || `Error ${resp.status}`);
      data = json;
      break;
    } catch (e) {
      lastErr = e;
    }
  }
  if (!data) throw lastErr || new Error('No se pudieron obtener las ofertas');

  // Normaliza: puede venir como arreglo, {ofertas:[...]}, {items:[...]} o {data:[...]}
  let arr = [];
  if (Array.isArray(data)) arr = data;
  else arr = data.ofertas || data.items || data.data || [];

  // Ordena por fecha de inicio desc (si existe), luego por creación desc:
  arr.sort((a,b) => new Date(b.fechaInicio || b.createdAt || 0) - new Date(a.fechaInicio || a.createdAt || 0));

  return arr;
}

function pintarCargando() {
  if ($tbody) {
    $tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;opacity:.8;">Cargando ofertas...</td></tr>`;
  }
}

function renderRows(items) {
  if (!$tbody) return;
  if (!items?.length) {
    $tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;opacity:.8;">No hay ofertas disponibles en este momento.</td></tr>`;
    return;
  }

  $tbody.innerHTML = items.map(o => {
    const nombre = o.nombre || o.titulo || '—';
    const emp = (o.emprendimiento?.nombre_negocio) || (o.emprendimiento?.nombre) || o.nombreNegocio || '—';
    const ini = fmtFechaSolo(o.fechaInicio);
    const fin = fmtFechaSolo(o.fechaFin);
    const vigencia = (ini !== '—' || fin !== '—') ? `${ini} - ${fin}` : '—';
    const estado = o.estado ? String(o.estado).charAt(0).toUpperCase() + String(o.estado).slice(1) : '—';
    const img = o.imagenUrl || o.logoUrl || o.imagen || '';

    const imgCell = img
      ? `<a href="${escapeHTML(img)}" target="_blank" rel="noopener">Ver imagen</a>`
      : '—';

    return `
      <tr>
        <td>${escapeHTML(nombre)}</td>
        <td>${escapeHTML(emp)}</td>
        <td>${escapeHTML(vigencia)}</td>
        <td>${escapeHTML(estado)}</td>
        <td>${imgCell}</td>
      </tr>
    `;
  }).join('');
}
