
let filaSeleccionada=null;
/* FUNCIONALIDAD PARA BOTON REGISTRAR*/
// Funcion para desplegar cajas de input en la primera fila de la tabla
function desplegarCajasInput(){
    let tabla=document.querySelector("#tablaAnuncios")    
    let cuerpo = document.getElementsByTagName("tbody")[0]
    let primeraFila = cuerpo.insertRow(0)

    for (let i = 0; i < 4; i++) {
    primeraFila.insertCell(i);  // crea 4 celdas vacias
    }

    //Agrega el input 
    primeraFila.cells[0].innerHTML = '<input id="nombreUsuario" type="text" placeholder="Ingresar Usuario">';
    primeraFila.cells[1].innerHTML = '<input id="contenido" type="text" placeholder="Ingresar Contenido">';
    primeraFila.cells[2].innerHTML = '<input id="estado" type="text" placeholder="Ingresar Estado">';
    primeraFila.cells[3].innerHTML = '<input id="fecha" type="date" placeholder="Ingrear Fecha">';

}

//Convertir las filas de inputs a tds (simula el registro de las filas)
function ingresarRegistrosTabla(){
    filas=document.querySelectorAll("#tablaAnuncios tbody tr")
    filas.forEach(fila=>{
        let tr = document.createElement("tr")
        let inputs = fila.querySelectorAll("input")
        inputs.forEach(input=>{
            let td= document.createElement("td")
            td.textContent=input.value
            tr.appendChild(td)
        })
        // Si la fila tiene inputs, se reemplaza la fila tr de inputs con una fila tr de tds
        if(inputs.length>0){
            fila.replaceWith(tr)
        }
        
    })
    asignarEventosFilas()
}

/*FUNCIONALIDAD PARA LA SELECCION DE FILAS EN LA TABLA*/
function asignarEventosFilas() {
    let filasRegistradas = document.querySelectorAll("#tablaAnuncios tbody tr");

    filasRegistradas.forEach(fila => {
        fila.addEventListener("click", () => {
            if (fila == filaSeleccionada) {
                // Deseleccionar si es la misma fila
                fila.classList.remove("filaSeleccionada");
                filaSeleccionada = null;
            } else {
                // Quitar selección anterior si es que habia
                if (filaSeleccionada) {
                    filaSeleccionada.classList.remove("filaSeleccionada");
                }

                // Seleccionar nueva fila
                filaSeleccionada = fila;
                filaSeleccionada.classList.add("filaSeleccionada");
            }
        });
    });
}

/*FUNCIONALIDAD PARA BOTON EDITAR*/
function editarFila(){
    let cuerpo = document.getElementsByTagName("tbody")[0]
    let nuevaFila = document.createElement("tr")

    filasCampos = filaSeleccionada.querySelectorAll("td")

    filasCampos.forEach(campo=>{
    let nuevoInput =document.createElement("input")
    let nuevaCelda=document.createElement("td")

    nuevoInput.value=campo.textContent
    nuevaCelda.appendChild(nuevoInput)
    nuevaFila.appendChild(nuevaCelda)
    })

    cuerpo.insertBefore(nuevaFila,cuerpo.firstChild)

    filaSeleccionada.remove();
    
    asignarEventosFilas()
}


/*FUNCIONALIDAD PARA ELIMINAR ANUNCIOS*/
function eliminarAnuncio(){
    filaSeleccionada.classList.remove("filaSeleccionada");
    filaSeleccionada.remove()

}


/*EVENT LISTENERS PARA LOS BOTONES*/
btnRegistrar = document.querySelector("#btnRegistrar");
btnEnviarCambios=document.querySelector("#btnEnviarCambios")
btnEditar =  document.querySelector("#btnEditar")
btnEliminar = document.querySelector("#btnEliminar")
btnEliminar.addEventListener("click", () => {
    if (filaSeleccionada) {
        eliminarAnuncio();
        filaSeleccionada = null; // limpiar variable
    } else {
        alert("Seleccione una fila para eliminar.");
    }
});
btnRegistrar.addEventListener("click",desplegarCajasInput)
btnEnviarCambios.addEventListener("click",ingresarRegistrosTabla)
btnEditar.addEventListener("click", () => {
    if (filaSeleccionada) {
        editarFila();
        
    }
});

 //Llamar funcion al cargar pagina
asignarEventosFilas();
