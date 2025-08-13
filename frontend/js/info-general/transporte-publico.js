// /frontend/js/info-general/transporte-publico.js

const sanJose   = L.latLng(9.8881, -84.0495);
const higuito   = L.latLng(9.856084643672421, -84.05174727013659);
const cartago   = L.latLng(9.8644, -83.9194);
const escazu    = L.latLng(9.9443342, -84.1508813);
const alajuelita= L.latLng(9.899941521084704, -84.10095508571916);
const alajuela  = L.latLng(10.012584022802493, -84.20443811222292);
const heredia   = L.latLng(9.997255550523061, -84.11452118850231);

// Códigos conocidos para trazar (incluye alias HI-CTGO)
const RUTAS_MAP = {
  "HI-CTG":  { destino: cartago,     nombre: "Cartago",     color: "black" },
  "HI-CTGO": { destino: cartago,     nombre: "Cartago",     color: "black" }, // alias
  "HI-ESC":  { destino: escazu,      nombre: "Escazú",      color: "black" },
  "HI-ALT":  { destino: alajuelita,  nombre: "Alajuelita",  color: "black" },
  "HI-ALA":  { destino: alajuela,    nombre: "Alajuela",    color: "black" },
  "HI-HER":  { destino: heredia,     nombre: "Heredia",     color: "black" }
};

let rutasTransporte = [];

const map = L.map('map').setView(sanJose, 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const $rutas    = document.getElementById('datosRutas');
const $tarifas  = document.getElementById('datosTarifas');
const $horarios = document.getElementById('datosHorarios');

function limpiarVehiculos() {
  $tarifas.innerHTML  = '';
  $horarios.innerHTML = '';
}
function renderTarifasHorarios(code) {
  const datos = rutasTransporte.filter(r => r.ruta === code);
  if (!datos.length) {
    $tarifas.innerHTML  = '<p>No hay tarifas disponibles</p>';
    $horarios.innerHTML = '<p>No hay horarios disponibles</p>';
    return;
  }
  $tarifas.innerHTML = datos.map(d =>
    `<p>${d.transportista} — ${d.tarifa}${d.contacto ? ` <span style="opacity:.7">(${d.contacto})</span>` : ''}</p>`
  ).join('');
  $horarios.innerHTML = datos.map(d => `<p>${d.horario}</p>`).join('');
}
function trazarRuta(code) {
  const rutaObj = RUTAS_MAP[code];
  if (window._routingCtrl) map.removeControl(window._routingCtrl);
  if (!rutaObj) return; // sin trazado conocido: solo mostramos datos
  window._routingCtrl = L.Routing.control({
    waypoints: [higuito, rutaObj.destino],
    router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
    lineOptions: { styles: [{ color: rutaObj.color, weight: 5 }] },
    addWaypoints: false, showAlternatives: false, routeWhileDragging: false,
    createMarker: (i, wp) => L.marker(wp.latLng).bindPopup(i===0?'Higuito':rutaObj.nombre)
  }).addTo(map);
}
function botonRuta(code, label) {
  const p = document.createElement('p');
  p.className = 'nombre-rutas';
  p.id = `ruta-${code}`;
  p.textContent = `Higuito - ${label}`;
  p.addEventListener('click', () => {
    renderTarifasHorarios(code);
    trazarRuta(code);
    document.querySelectorAll('.nombre-rutas').forEach(el => el.classList.remove('active'));
    p.classList.add('active');
  });
  return p;
}

async function cargarRutas() {
  try {
    const r = await fetch('/api/transporte');
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    rutasTransporte = data.map(x => ({
      transportista: x.transportista || '',
      ruta: (x.ruta || '').toUpperCase().trim(),
      horario: x.horario || '',
      tarifa: x.tarifa || '',
      contacto: x.contacto || ''
    }));

    const codigos = [...new Set(rutasTransporte.map(r => r.ruta))]; // <- ya NO filtramos
    if (!codigos.length) {
      $rutas.innerHTML = '<p style="opacity:.7">No hay rutas publicadas</p>';
      limpiarVehiculos();
      return;
    }

    $rutas.innerHTML = '';
    codigos.forEach(code => {
      const label = RUTAS_MAP[code]?.nombre || code;
      $rutas.appendChild(botonRuta(code, label));
    });

    document.getElementById(`ruta-${codigos[0]}`).click();
  } catch (err) {
    console.error('Error cargando rutas', err);
    $rutas.innerHTML = '<p style="color:#b00020">No se pudieron cargar las rutas públicas.</p>';
    limpiarVehiculos();
  }
}
document.addEventListener('DOMContentLoaded', cargarRutas);
