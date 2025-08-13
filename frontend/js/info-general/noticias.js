// === CONFIG ===
const API_ANUNCIOS = '/api/anuncios';
const tbody = document.getElementById('tablaCuerpoNoticias');

// === HELPERS ===
function formatearFechaHora(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return { fecha: '—', hora: '—' };
  // Español Costa Rica
  const fecha = d.toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' });
  const hora  = d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false });
  // Capitalizar inicial de la fecha (opcional)
  return { fecha: fecha.charAt(0).toUpperCase() + fecha.slice(1), hora };
}

function celdaImagen(url) {
  if (!url) return '—';
  // Evita romper layout si no hay estilo:
  return `<img class="imagen" src="${url}" alt="Imagen anuncio" style="max-height:60px;object-fit:cover">`;
}

function render(anuncios) {
  tbody.innerHTML = '';
  if (!anuncios?.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" style="text-align:center;opacity:.7">Sin noticias por ahora</td>`;
    tbody.appendChild(tr);
    return;
  }

  anuncios.forEach(a => {
    const usuario = a.autorId?.nombre || a.autorId?.email || (typeof a.autorId === 'string' ? a.autorId : '—');
    const contenido = [a.titulo, a.descripcion].filter(Boolean).join(' — ');
    const { fecha, hora } = formatearFechaHora(a.fechaPublicacion);
    const imgHtml = celdaImagen(a.imagenUrl || a.imagen); // por si más adelante agregan campo de imagen

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${usuario || '—'}</td>
      <td>${contenido || ''}</td>
      <td class="imagen-suceso">${imgHtml}</td>
      <td>${fecha}</td>
      <td>${hora}</td>
    `;
    tbody.appendChild(tr);
  });
}

// === DATA ===
async function cargarNoticias() {
  try {
    const r = await fetch(API_ANUNCIOS);
    if (!r.ok) {
      let msg = `No se pudieron cargar las noticias (HTTP ${r.status})`;
      try { const err = await r.json(); if (err?.mensaje) msg += ` - ${err.mensaje}`; } catch {}
      throw new Error(msg);
    }
    const data = await r.json();
    render(data);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:#b00020;text-align:center">${e.message || 'Error al cargar'}</td></tr>`;
  }
}

document.addEventListener('DOMContentLoaded', cargarNoticias);
