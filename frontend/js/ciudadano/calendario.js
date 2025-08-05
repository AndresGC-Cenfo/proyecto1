let calendar; // Variable global para FullCalendar

//el get se le hace a esta variable, los eventos vienen en json
let eventos = [
  { title: 'Día de la Independencia', start: '2025-08-20', categoria: 'feriados' },
  { title: 'Día de la Virgen De los Angeles', start: '2025-08-15', categoria: 'feriados' },
  { title: 'Fiesta Patronal', start: '2025-08-20',  categoria: 'fiestas' },
  { title: 'Reunión Comunal', start: '2025-08-04',  categoria: 'importantes' },
  { title: 'Misa Especial', start: '2025-08-08',  categoria: 'parroquiales' },
  { title: 'Entrega de Informes', start: '2025-08-10', categoria: 'importantes' }
];

document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('calendar');

  try {
    const response = await fetch('/api/eventos');
    if (response.ok) {
      eventos = await response.json();
    }
  } catch (error) {
    console.warn('Usando eventos de prueba porque no se pudo obtener la API', error);
  }

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    events: eventos,
    eventColor: '#2196f3'
  });

  calendar.render();

  listarEventos();
});

function mostrarEventos(tipo) {
  const filtrados = eventos.filter(
    evento => evento.categoria.toLowerCase() === tipo.toLowerCase()
  );

  calendar.removeAllEvents();
  filtrados.forEach(evento => {
    calendar.addEvent(evento);
  });
}

function listarEventos() {
  document.getElementById("listaFeriados").innerHTML = "";
  document.getElementById("listaFiestas").innerHTML = "";
  document.getElementById("listaFechasImportantes").innerHTML = "";
  document.getElementById("listaParroquiales").innerHTML = "";

  eventos.forEach((evento) => {
    switch (evento.categoria) {
      case "feriados":
        document.getElementById("listaFeriados")
          .insertAdjacentHTML('beforeend', `<li>${evento.title}</li>`);
        break;

      case "fiestas":
        document.getElementById("listaFiestas")
          .insertAdjacentHTML('beforeend', `<li>${evento.title}</li>`);
        break;

      case "importantes":
        document.getElementById("listaFechasImportantes")
          .insertAdjacentHTML('beforeend', `<li>${evento.title}</li>`);
        break;

      case "parroquiales":
        document.getElementById("listaParroquiales")
          .insertAdjacentHTML('beforeend', `<li>${evento.title}</li>`);
        break;
    }
  });
}
