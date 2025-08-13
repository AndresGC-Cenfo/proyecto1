let calendar;
let eventos = []; // siempre en formato FullCalendar: { title, start, extendedProps: { descripcion, ubicacion, categoria? } }

document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('calendar');

  // 1) Cargar desde API pública
  try {
    const r = await fetch('/api/eventos'); // público
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json(); // [{ nombre, descripcion, fechaEvento, ubicacion, ... }]
    eventos = data.map(e => ({
      id: e._id,
      title: e.nombre,
      start: e.fechaEvento,             // FullCalendar acepta ISO Date
      extendedProps: {
        descripcion: e.descripcion,
        ubicacion: e.ubicacion,
        // si no hay categoría en el backend, úsala solo para la UI lateral
        categoria: e.categoria || 'importantes'
      }
    }));
  } catch (err) {
    console.warn('Fallo al leer /api/eventos, cargando demo. Detalle:', err);
    // Demo fallback
    eventos = [
      { title: 'Día de la Independencia', start: '2025-08-20', extendedProps: { categoria: 'feriados' } },
      { title: 'Día de la Virgen De los Angeles', start: '2025-08-15', extendedProps: { categoria: 'feriados' } },
      { title: 'Fiesta Patronal', start: '2025-08-20', extendedProps: { categoria: 'fiestas' } },
      { title: 'Reunión Comunal', start: '2025-08-04', extendedProps: { categoria: 'importantes' } },
      { title: 'Misa Especial', start: '2025-08-08', extendedProps: { categoria: 'parroquiales' } },
      { title: 'Entrega de Informes', start: '2025-08-10', extendedProps: { categoria: 'importantes' } }
    ];
  }

  // 2) Instanciar FullCalendar
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
    events: eventos,
    eventColor: '#2196f3',
    eventClick(info) {
      const { title, start, extendedProps } = info.event;
      const fecha = new Date(start).toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' });
      const hora  = new Date(start).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false });
      const desc  = extendedProps?.descripcion ? `\nDescripción: ${extendedProps.descripcion}` : '';
      const ubi   = extendedProps?.ubicacion ? `\nUbicación: ${extendedProps.ubicacion}` : '';
      alert(`${title}\n${fecha} ${hora}${ubi}${desc}`);
    }
  });
  calendar.render();

  // 3) Llenar listas laterales
  listarEventos();
});

// Filtra el calendario por categoría (si hay); si no hay, muestra todo
function mostrarEventos(tipo) {
  // Si los eventos no traen 'categoria', no filtramos
  const hayCategorias = eventos.some(e => e.extendedProps?.categoria);
  if (!hayCategorias) return; // no aplica filtro

  calendar.removeAllEvents();
  eventos
    .filter(e => String(e.extendedProps?.categoria).toLowerCase() === tipo.toLowerCase())
    .forEach(e => calendar.addEvent(e));
}

// Pinta las listas laterales
function listarEventos() {
  const $fer = document.getElementById("listaFeriados");
  const $fie = document.getElementById("listaFiestas");
  const $imp = document.getElementById("listaFechasImportantes");
  const $par = document.getElementById("listaParroquiales");
  [$fer, $fie, $imp, $par].forEach(ul => ul.innerHTML = "");

  const hayCategorias = eventos.some(e => e.extendedProps?.categoria);

  eventos.forEach(e => {
    const cat = hayCategorias ? e.extendedProps.categoria : 'importantes'; // fallback
    const li = `<li>${e.title}</li>`;
    switch (cat) {
      case 'feriados':      $fer.insertAdjacentHTML('beforeend', li); break;
      case 'fiestas':       $fie.insertAdjacentHTML('beforeend', li); break;
      case 'parroquiales':  $par.insertAdjacentHTML('beforeend', li); break;
      default:              $imp.insertAdjacentHTML('beforeend', li); break; // 'importantes' o fallback
    }
  });
}
