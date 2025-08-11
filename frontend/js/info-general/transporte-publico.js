
//aqui va el get request
rutasTransporte = [{Transportista:"Meche",Ruta:"HI-HER",Horario:"6:00AM-6:00PM",Tarfia:"1500 CRC",Contacto:"50304303"},
                    {Transportista:"Lumaca",Ruta:"HI-CTG",Horario:"6:00AM-6:00PM",Tarfia:"1600 CRC",Contacto:"50304303"},
                    {Transportista:"Tapachula",Ruta:"HI-ALT",Horario:"6:00AM-6:00PM",Tarfia:"500 CRC",Contacto:"50304303"},
                    {Transportista:"Chilsaca",Ruta:"HI-CTG",Horario:"6:00AM-6:00PM",Tarfia:"500 CRC",Contacto:"50304303"}
]


 // Coordenadas predeterminadas
  const sanJose = L.latLng(9.8881, -84.0495)
  const higuito = L.latLng(9.856084643672421, -84.05174727013659);
  const cartago = L.latLng(9.8644, -83.9194);
  const escazu = L.latLng(9.9443342, -84.1508813); 
  const paseoColon = L.latLng(9.935401736398788,-84.09312964403644);
  const alajuelita = L.latLng(9.899941521084704,-84.10095508571916);
  const alajuela = L.latLng(10.012584022802493,-84.20443811222292);
  const heredia = L.latLng(9.997255550523061,-84.11452118850231)

    // Lista de rutas predeterminadas desde Higuito con color
  const rutas = {
    "HI-CTG":{ destino: cartago, nombre: "Cartago", color: 'black' },
    "HI-ESC":{ destino: escazu, nombre: "Escazu", color: 'black' },
    "HI-ALT":{ destino: alajuelita, nombre: "Alajuelita", color: 'black' },
    "HI-ALA":{destino:alajuela, nombre:"Alajuela",color:'black'},
    "HI-HER":{destino:heredia,nombre:"Heredia",color:'black'}
  };

// Crear el mapa
 const map = L.map('map').setView(sanJose, 11);

// Agregar la capa base del mapa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

paginaRutas = document.getElementById("datosRutas")

Object.values(rutas).forEach((rutas,index)=>{
    paginaRutas.innerHTML+=`<p id=ruta${rutas.nombre} class="nombre-rutas">Higuito-${rutas.nombre}`
})

// Obtener todos los <p> creados
const ps = document.getElementsByClassName("nombre-rutas");

// Asignar evento click a cada <p>
Array.from(ps).forEach((p) => {
    p.addEventListener("click", () => {
        let codigoRuta = "";

        // Mapear el id del <p> al código de ruta de rutasTransporte
        switch (p.id) {
            case "rutaHeredia":
                codigoRuta = "HI-HER";
                break;
            case "rutaCartago":
                codigoRuta = "HI-CTG";
                break;
            case "rutaAlajuelita":
                codigoRuta = "HI-ALT";
                break;
            case "rutaEscazu":
                codigoRuta="HI-ESC";
                break;
            case "rutaAlajuela":
                codigoRuta="HI-ALA"
                break;
            default:
                codigoRuta = "";
                break;
        }

        // Filtrar las tarifas según la ruta seleccionada
        const datos = rutasTransporte.filter(r => r.Ruta === codigoRuta);


        const contTarifas = document.getElementById("datosTarifas");
        const contHorarios = document.getElementById("datosHorarios");

        if (datos.length > 0) {
            contTarifas.innerHTML = datos.map(d => `<p>${d.Transportista} — ${d.Tarfia}</p>`).join("");
            contHorarios.innerHTML = datos.map(d => `<p>${d.Horario}</p>`).join("");
        } else {
            contTarifas.innerHTML = "<p>No hay tarifas disponibles</p>";
            contHorarios.innerHTML = "<p>No hay horarios disponibles</p>";
        }

        const rutaObj = rutas[codigoRuta];    

    if (!rutaObj) return;

    if (window._routingCtrl) map.removeControl(window._routingCtrl);

    window._routingCtrl = L.Routing.control({
      waypoints: [higuito, rutaObj.destino],
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      lineOptions: { styles: [{ color: rutaObj.color, weight: 5 }] },
      addWaypoints: false,
      showAlternatives: false,
      routeWhileDragging: false,
      createMarker: function(i, waypoint) {
        return L.marker(waypoint.latLng).bindPopup(i === 0 ? "Higuito" : rutaObj.nombre);
      }
    }).addTo(map);

    });
});


