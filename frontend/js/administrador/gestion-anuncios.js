let filaSeleccionada = null;
function desplegarCajasInput() {
    let tabla = document.querySelector("#tablaAnuncios")
    let cuerpo = document.getElementsByTagName("tbody")[0]
    let primeraFila = cuerpo.insertRow(0)

    for (let i = 0; i < 4; i++) {
        primeraFila.insertCell(i);
    }

    primeraFila.cells[0].innerHTML = '<input id="nombreUsuario" type="text" placeholder="Ingresar Usuario">';
    primeraFila.cells[1].innerHTML = '<input id="contenido" type="text" placeholder="Ingresar Contenido">';
    primeraFila.cells[2].innerHTML = '<input id="estado" type="text" placeholder="Ingresar Estado">';
    primeraFila.cells[3].innerHTML = '<input id="fecha" type="date" placeholder="Ingrear Fecha">';
}