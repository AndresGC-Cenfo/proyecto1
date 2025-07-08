document.addEventListener('DOMContentLoaded', function () {
      const calendarEl = document.getElementById('calendar');
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: [
          { title: 'Evento A', start: '2025-07-20' },
          { title: 'Evento B', start: '2025-07-25' }
        ]
      });
      calendar.render();
    });