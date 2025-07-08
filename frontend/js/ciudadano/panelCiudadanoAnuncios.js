let filaSeleccionada = null;

const confirmModal = document.getElementById('confirmModal');
const closeButton = document.querySelector('.close-button');
const confirmYesButton = document.getElementById('confirmYes');
const confirmNoButton = document.getElementById('confirmNo');

function desplegarCajasInput() {
    let tabla = document.querySelector("#tablaAnuncios")
    let cuerpo = document.getElementsByTagName("tbody")[0]
    let primeraFila = cuerpo.insertRow(0)

    for (let i = 0; i < 5; i++) { 
        primeraFila.insertCell(i);
    }

    primeraFila.cells[0].innerHTML = '<input id="nombreUsuario" type="text" placeholder="Ingresar Usuario">';
    primeraFila.cells[1].innerHTML = '<input id="contenido" type="text" placeholder="Ingresar Contenido">';
    primeraFila.cells[2].innerHTML = '<input id="fecha" type="date" placeholder="Ingresar Fecha">';
    primeraFila.cells[3].innerHTML = `
        <div class="image-upload-container">
            <input type="file" id="imageUpload" accept="image/jpeg, image/png, image/gif" onchange="previewImage(event)">
            <label for="imageUpload" class="image-upload-label">Seleccionar Imagen</label>
            <img class="image-preview" src="#" alt="Vista previa" style="display:none;">
        </div>
    `;
    primeraFila.cells[4].innerHTML = '<input id="estado" type="text" value="Pendiente" readonly>'; // Estado por defecto "Pendiente" y readonly
}

function previewImage(event) {
    const file = event.target.files[0];
    const parentDiv = event.target.closest('.image-upload-container');
    const preview = parentDiv ? parentDiv.querySelector('.image-preview') : null;

    if (file && preview) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else if (preview) {
        preview.src = '#';
        preview.style.display = 'none';
    }
}

function ingresarRegistrosTabla() {
    filas = document.querySelectorAll("#tablaAnuncios tbody tr");
    filas.forEach(fila => {
        if (fila.querySelector('input')) { 
            let tr = document.createElement("tr");
            
            let usuario = fila.querySelector('#nombreUsuario') ? fila.querySelector('#nombreUsuario').value : '';
            let contenido = fila.querySelector('#contenido') ? fila.querySelector('#contenido').value : '';
            let fecha = fila.querySelector('#fecha') ? fila.querySelector('#fecha').value : '';
            let estado = fila.querySelector('#estado') ? fila.querySelector('#estado').value : 'Pendiente'; 
            
            let imagePreview = fila.querySelector('.image-preview');
            let imgSrc = (imagePreview && imagePreview.src && imagePreview.style.display !== 'none' && imagePreview.src !== window.location.href + '#') ? imagePreview.src : '';

            let tdUsuario = document.createElement("td");
            tdUsuario.textContent = usuario;
            tr.appendChild(tdUsuario);

            let tdContenido = document.createElement("td");
            tdContenido.textContent = contenido;
            tr.appendChild(tdContenido);

            let tdFecha = document.createElement("td");
            tdFecha.textContent = fecha;
            tr.appendChild(tdFecha);

            let tdImagen = document.createElement("td");
            if (imgSrc) {
                let img = document.createElement("img");
                img.src = imgSrc;
                img.classList.add("image-preview-table");
                tdImagen.appendChild(img);
            }
            tr.appendChild(tdImagen);

            let tdEstado = document.createElement("td");
            tdEstado.textContent = estado;
            tr.appendChild(tdEstado);
            
            fila.replaceWith(tr);
        }
    });
    asignarEventosFilas();
}

function asignarEventosFilas() {
    let filasRegistradas = document.querySelectorAll("#tablaAnuncios tbody tr");

    filasRegistradas.forEach(fila => {
        fila.removeEventListener("click", filaClickHandler);
        fila.addEventListener("click", filaClickHandler);
    });
}

function filaClickHandler() {
    let fila = this;
    if (fila === filaSeleccionada) {
        fila.classList.remove("filaSeleccionada");
        filaSeleccionada = null;
    } else {
        if (filaSeleccionada) {
            filaSeleccionada.classList.remove("filaSeleccionada");
        }
        filaSeleccionada = fila;
        filaSeleccionada.classList.add("filaSeleccionada");
    }
}

function editarFila() {
    if (!filaSeleccionada) {
        alert("Seleccione una fila para editar.");
        return;
    }

    let cuerpo = document.getElementsByTagName("tbody")[0];
    let nuevaFila = document.createElement("tr");

    let celdas = Array.from(filaSeleccionada.cells);
    const originalUsuario = celdas[0] ? celdas[0].textContent : '';
    const originalContenido = celdas[1] ? celdas[1].textContent : '';
    const originalFecha = celdas[2] ? celdas[2].textContent : '';
    const originalImagenSrc = celdas[3] && celdas[3].querySelector('img') ? celdas[3].querySelector('img').src : '';
    const originalEstado = celdas[4] ? celdas[4].textContent : '';

    const originalRowElement = filaSeleccionada;
    originalRowElement.remove();

    let usuarioInputTd = document.createElement("td");
    usuarioInputTd.innerHTML = `<input type="text" value="${originalUsuario}">`;
    nuevaFila.appendChild(usuarioInputTd);

    let contenidoInputTd = document.createElement("td");
    contenidoInputTd.innerHTML = `<input type="text" value="${originalContenido}">`;
    nuevaFila.appendChild(contenidoInputTd);

    let fechaInputTd = document.createElement("td");
    fechaInputTd.innerHTML = `<input type="date" value="${originalFecha}">`;
    nuevaFila.appendChild(fechaInputTd);

    let imagenInputTd = document.createElement("td");
    const displayStyle = originalImagenSrc !== '' && originalImagenSrc !== '#' && originalImagenSrc !== window.location.href + '#' ? 'block' : 'none';

    imagenInputTd.innerHTML = `
        <div class="image-upload-container">
            <input type="file" id="imageUploadEdit" accept="image/jpeg, image/png, image/gif" onchange="previewImage(event)">
            <label for="imageUploadEdit" class="image-upload-label">Seleccionar Imagen</label>
            <img class="image-preview" src="${originalImagenSrc}" alt="Vista previa" style="display:${displayStyle};">
        </div>
    `;
    nuevaFila.appendChild(imagenInputTd);

    let estadoInputTd = document.createElement("td");
    estadoInputTd.innerHTML = `<input type="text" value="${originalEstado || 'Pendiente'}" readonly>`;
    nuevaFila.appendChild(estadoInputTd);

    cuerpo.insertBefore(nuevaFila, cuerpo.firstChild);

    filaSeleccionada = nuevaFila;
    filaSeleccionada.classList.add("filaSeleccionada");

    asignarEventosFilas();
}

function eliminarAnuncio() {
    if (filaSeleccionada) {
        confirmModal.style.display = 'flex'; 
    } else {
        alert("Seleccione una fila para eliminar.");
    }
}

confirmYesButton.addEventListener('click', () => {
    if (filaSeleccionada) {
        filaSeleccionada.classList.remove("filaSeleccionada");
        filaSeleccionada.remove();
        filaSeleccionada = null; 
    }
    confirmModal.style.display = 'none'; 
});

confirmNoButton.addEventListener('click', () => {
    confirmModal.style.display = 'none'; 
});

closeButton.addEventListener('click', () => {
    confirmModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == confirmModal) {
        confirmModal.style.display = 'none';
    }
});

const btnRegistrar = document.querySelector("#btnRegistrar");
const btnEnviarCambios = document.querySelector("#btnEnviarCambios");
const btnEditar = document.querySelector("#btnEditar");
const btnEliminar = document.querySelector("#btnEliminar");

if (btnRegistrar) btnRegistrar.addEventListener("click", desplegarCajasInput);
if (btnEnviarCambios) btnEnviarCambios.addEventListener("click", ingresarRegistrosTabla);
if (btnEditar) btnEditar.addEventListener("click", editarFila);
if (btnEliminar) btnEliminar.addEventListener("click", eliminarAnuncio); 

document.addEventListener("DOMContentLoaded", asignarEventosFilas);