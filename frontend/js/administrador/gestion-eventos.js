
let filaSeleccionada=null;
/* FUNCIONALIDAD PARA BOTON REGISTRAR*/
// Funcion para desplegar cajas de input en la primera fila de la tabla
function desplegarCajasInput(){
    // Verifica si ya existe una fila con inputs
    const existenInputs = document.querySelector("#tablaEmprendimientos tbody tr input");
    // No inserta otra fila si ya hay inputs
    if (existenInputs) {
        mostrarBannerError("Debe completar el registro actual antes de ingresar un nuevo registro. "); 
        return;
    }
    const cuerpo = document.getElementsByTagName("tbody")[0];
    const primeraFila = cuerpo.insertRow(0);

    for (let i = 0; i < 6; i++) {
        primeraFila.insertCell(i);
    }

    primeraFila.cells[0].innerHTML = '<input id="idEvento" type="text" placeholder="Ingresar Id" > ';
    primeraFila.cells[1].innerHTML = '<input id="nombreEvento" type="text" placeholder="Ingresar nombre">';
    primeraFila.cells[2].innerHTML = '<input id="descripcionEvento" type="text" placeholder="Ingresar Descripcion">';
    primeraFila.cells[3].innerHTML = '<input id="fechaEvento" type="date" placeholder="Ingresar fecha">'
    primeraFila.cells[4].innerHTML = '<input id="ubicacionEvento" type="text" placeholder="Ingresar ubicacion">'
    primeraFila.cells[5].innerHTML = '<input id="idOrganizadorEvento" type="text" placeholder="Ingresar Id">'
    asignarEventosFilas();
}


//Convertir las filas de inputs a tds (simula el registro de las filas) para ingresarlos a la tabla y simular el request post
function ingresarRegistrosTabla() {
    const fila = document.querySelector("#tablaEmprendimientos tbody tr"); // Solo la primera fila (con inputs)
    const tr = document.createElement("tr");
    const inputs = fila.querySelectorAll("input, select");

    for (let input of inputs) {
        const td = document.createElement("td");

        if (input.type === "file") {
            const file = input.files[0];
            if (!file) {
                mostrarBannerError("Debe subir una imagen.");
                return;
            }
            td.textContent = file.name;
        } else if (input.tagName === "SELECT" || input.type === "select-one") {
            td.textContent = input.options[input.selectedIndex].text;
        } else {
            if (input.value.trim() === "") {
                mostrarBannerError("Debe completar todos los campos.");
                return;
            }
            td.textContent = input.value;
        }

        tr.appendChild(td);
    }

    // Reemplaza solo la fila de inputs
    fila.replaceWith(tr);

    mostrarBannerExito();
    asignarEventosFilas();
}

/*FUNCIONALIDAD PARA LA SELECCION DE FILAS EN LA TABLA*/
function asignarEventosFilas() {
    let filasRegistradas = document.querySelectorAll("#tablaEmprendimientos tbody tr");

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
btnRegistrar.addEventListener("click",desplegarCajasInput)
btnEnviarCambios.addEventListener("click",ingresarRegistrosTabla)
btnEditar.addEventListener("click", () => {
    if (filaSeleccionada) {
        editarFila();
        
    }
});

btnEliminar.addEventListener("click", () => {
  if (filaSeleccionada) {
    document.getElementById("eliminarBanner").style.display = "flex";
  } else {
    alert("Seleccione una fila para eliminar.");
  }
});

document.getElementById("confirmEliminarBtn").addEventListener("click", () => {
    if (filaSeleccionada) {
        eliminarAnuncio();
        filaSeleccionada = null;
    }
    document.getElementById("eliminarBanner").style.display = "none";
});

document.getElementById("cancelEliminarBtn").addEventListener("click", () => {
    document.getElementById("eliminarBanner").style.display = "none";
});

 //Llamar funcion al cargar pagina
asignarEventosFilas();


//Funciones asociadas a banners
function mostrarBannerExito() {
  const banner = document.getElementById("registroExitosoBanner");
  banner.style.display = "flex";
  setTimeout(() => {
    banner.style.display = "none";
  }, 2500);
}

function mostrarBannerError(mensajeMostrar){
    const banner = document.getElementById("errorRegistroBanner")
    banner.style.display = "block";
    let texto = document.getElementById("mensaje")
    texto.textContent=mensajeMostrar
  setTimeout(() => {
    banner.style.display = "none";
  }, 2500);
}
