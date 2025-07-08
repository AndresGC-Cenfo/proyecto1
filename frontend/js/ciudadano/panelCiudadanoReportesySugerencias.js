let filaSeleccionada = null;

const confirmModal = document.getElementById('confirmModal');
const closeButton = document.querySelector('.close-button');
const confirmYesButton = document.getElementById('confirmYes');
const confirmNoButton = document.getElementById('confirmNo');

function desplegarCajasInputReporte() {
    let tabla = document.querySelector("#tablaReportes");
    let cuerpo = document.getElementsByTagName("tbody")[0];
    let primeraFila = cuerpo.insertRow(0);

    for (let i = 0; i < 6; i++) {
        primeraFila.insertCell(i);
    }

    primeraFila.cells[0].innerHTML = '<input id="nombreUsuarioReporte" type="text" placeholder="Ingresar Usuario">';
    
    // Columna 2: Tipo de Contenido (Índice 1) - Dropdown para Tipo
    primeraFila.cells[1].innerHTML = `
        <select id="tipoReporte">
            <option value="" disabled selected>Seleccione</option> <option value="Reporte">Reporte</option>
            <option value="Sugerencia">Sugerencia</option>
        </select>
    `;
    
    primeraFila.cells[2].innerHTML = '<input id="contenidoReporte" type="text" placeholder="Ingresar Contenido">';
    
    primeraFila.cells[3].innerHTML = '<input id="fechaReporte" type="date">';
    

    primeraFila.cells[4].innerHTML = `
        <div class="image-upload-container">
            <input type="file" id="imageUploadReporte" accept="image/jpeg, image/png, image/gif" onchange="previewImageReporte(event)">
            <label for="imageUploadReporte" class="image-upload-label">Subir Imagen</label>
            <img id="imagePreviewReporte" class="image-preview" src="#" alt="Vista previa" style="display: none;">
        </div>
    `;
    
    primeraFila.cells[5].innerHTML = `
        <select id="estadoReporte">
            <option value="Pendiente" selected>Pendiente</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
        </select>
    `;
}

function previewImageReporte(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const output = document.getElementById('imagePreviewReporte');
        output.src = reader.result;
        output.style.display = 'block';
    };
    reader.readAsDataURL(event.target.files[0]);
}


function previewEditImageReporte(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const output = document.getElementById('editImagePreviewReporte');
        output.src = reader.result;
        output.style.display = 'block';
    };
    reader.readAsDataURL(event.target.files[0]);
}


function ingresarRegistrosTablaReporte() {
    let inputsAndSelects = document.querySelectorAll("#tablaReportes tbody tr:first-child input, #tablaReportes tbody tr:first-child select");
    let nuevaFila = document.createElement("tr");

    inputsAndSelects.forEach(input => {
        let td = document.createElement("td");
        if (input.type === "file") {
            const imgPreview = document.getElementById('imagePreviewReporte');
            if (imgPreview && imgPreview.src && imgPreview.src !== '#' && imgPreview.style.display !== 'none') {
                const img = document.createElement('img');
                img.src = imgPreview.src;
                img.classList.add('image-preview-table');
                td.appendChild(img);
            } else {
                td.textContent = 'No imagen';
            }
        } else {

            if (input.tagName === 'SELECT' && input.value === '') {
                 td.textContent = 'N/A';
            } else {
                 td.textContent = input.value;
            }
        }
        nuevaFila.appendChild(td);
    });

    let cuerpo = document.getElementsByTagName("tbody")[0];
    if (cuerpo) {
        cuerpo.appendChild(nuevaFila);
    }

    let primeraFilaInputs = document.querySelector("#tablaReportes tbody tr:first-child");
    if (primeraFilaInputs) {
        primeraFilaInputs.remove();
    }
    filaSeleccionada = null;
    asignarEventosFilasReporte();
}

function editarFilaReporte() {
    if (!filaSeleccionada) {
        alert("Seleccione una fila para editar.");
        return;
    }

    let cuerpo = document.getElementsByTagName("tbody")[0];
    let nuevaFila = document.createElement("tr");

    let filasCampos = filaSeleccionada.querySelectorAll("td");

    const camposHTML = [
        '<input id="editUsuarioReporte" type="text" placeholder="Ingresar Usuario">', 
        `<select id="editTipoReporte">
            <option value="" disabled>Seleccionar Tipo</option>
            <option value="Reporte">Reporte</option>
            <option value="Sugerencia">Sugerencia</option>
        </select>`,
        '<input id="editContenidoReporte" type="text" placeholder="Ingresar Contenido">', 
        '<input id="editFechaReporte" type="date">', 
        `
        <div class="image-upload-container">
            <input type="file" id="editImageUploadReporte" accept="image/jpeg, image/png, image/gif" onchange="previewEditImageReporte(event)">
            <label for="editImageUploadReporte" class="image-upload-label">Cambiar Imagen</label>
            <img id="editImagePreviewReporte" class="image-preview" src="#" alt="Vista previa" style="display: none;">
        </div>
        `,
        '<input id="editEstadoReporte" type="text" readonly>'
    ];

    filasCampos.forEach((campo, index) => {
        let nuevaCelda = document.createElement("td");
        nuevaCelda.innerHTML = camposHTML[index]; 
        const inputElement = nuevaCelda.querySelector('input, select');
        if (inputElement) {
            if (inputElement.type === "file") {
                const existingImage = campo.querySelector('img');
                if (existingImage) {
                    const previewImg = nuevaCelda.querySelector('#editImagePreviewReporte');
                    previewImg.src = existingImage.src;
                    previewImg.style.display = 'block';
                }
            } else {
               
                if (inputElement.tagName === 'SELECT') {
                    inputElement.value = campo.textContent.trim();
                    if (inputElement.value === '') {
                        inputElement.querySelector('option[value=""]').selected = true;
                    }
                } else {
                    inputElement.value = campo.textContent.trim();
                }
            }
        }
        nuevaFila.appendChild(nuevaCelda);
    });

    cuerpo.insertBefore(nuevaFila, filaSeleccionada.nextSibling);
    filaSeleccionada.remove();
    filaSeleccionada = nuevaFila;
    asignarEventosFilasReporte();
}


function asignarEventosFilasReporte() {
    let filas = document.querySelectorAll("#tablaReportes tbody tr");
    filas.forEach(fila => {
        fila.removeEventListener("click", seleccionarFilaReporte);
        fila.addEventListener("click", seleccionarFilaReporte);
    });
}

function seleccionarFilaReporte(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'LABEL') {
        return;
    }

    if (filaSeleccionada) {
        filaSeleccionada.classList.remove("filaSeleccionada");
    }
    filaSeleccionada = event.currentTarget;
    filaSeleccionada.classList.add("filaSeleccionada");
}

function eliminarReporte() {
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


const btnRegistrarReporte = document.querySelector("#btnRegistrarReporte");
const btnEnviarCambiosReporte = document.querySelector("#btnEnviarCambiosReporte");
const btnEditarReporte = document.querySelector("#btnEditarReporte");
const btnEliminarReporte = document.querySelector("#btnEliminarReporte");

if (btnRegistrarReporte) btnRegistrarReporte.addEventListener("click", desplegarCajasInputReporte);
if (btnEnviarCambiosReporte) btnEnviarCambiosReporte.addEventListener("click", ingresarRegistrosTablaReporte);
if (btnEditarReporte) btnEditarReporte.addEventListener("click", editarFilaReporte);
if (btnEliminarReporte) btnEliminarReporte.addEventListener("click", eliminarReporte);

document.addEventListener("DOMContentLoaded", asignarEventosFilasReporte);