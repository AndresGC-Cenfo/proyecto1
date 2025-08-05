// Seleccionar inputs y formulario
const formulario = document.getElementById('formulario');
const inputs = document.querySelectorAll('#formulario input');

// Expresiones de validación
const expresiones ={
    usuario : /^[a-zA-Z0-9\_\-]{4,16}$/,//SOLO ADMITE LETRAS MAYUSCULAS MINUSCULAS, GUIO Y GUION BAJO, NUMEROS Y DEBE SER MINIMO 4 CARECTERS Y MAXIMO 16
    nombre : /^[a-zA-ZÀ-ÿ\s]{3,45}$/ ,//SOLO ADMITE LETRAS MAYUSCULAS MINUSCULAS ACEPTA EL ACENTO, ESPACIO MINIMO 3 Y 45
    password:/^.{4,12}$/,//ACEPTA TODO PERO DE 4 A 12 CARACTERES
    correo : /^[a-zA-Z0-9\_]+@[a-zA-Z]+\.[a-zA-Z]+$/,//dato1@dato2.com  DATO1 = ADMITE MAYUSCULAS MINUSCULAS NUMEROS GUION BAJO  DATO2 = ADMITE SOLO LETRAS DATO3 = SOLO LETRAS
    cedula :/^\d{9}$/ //debe ser de 10 digitos
}


// Estado de los campos
const campos={
    usuario: false,
    nombre: false,
    password: false,
    correo: false,
    cedula:false
}
;

// Validar formulario según input
const validarFormulario = (e) => {
    switch (e.target.name) {
        case "correo":
            validarCampo(expresiones.correo, e.target, "correo");
        break;
        case "password":
            //funcion
            validarCampo(expresiones.password,e.target,"password");
            validarPassword2();
        break;
        case "password2":
            //funciones
            validarPassword2();
        break;
        case "cedula":
            //funcion
            validarCampo(expresiones.cedula,e.target,"cedula");
        break;

    }
};

// Validar campo genérico
const validarCampo = (expresion, input, campo) => {
    if (expresion.test(input.value)) {
        document.getElementById(`grupo__${campo}`).classList.add("formulario__grupo-correcto");
        document.getElementById(`grupo__${campo}`).classList.remove("formulario__grupo-incorrecto");
        document.querySelector(`#grupo__${campo} .formulario__input-error`).classList.remove("formulario__input-error-activo");
        document.querySelector(`#grupo__${campo} i`).classList.remove("bxs-x-circle");
        document.querySelector(`#grupo__${campo} i`).classList.add("bxs-check-circle");
        campos[campo] = true;
    } else {
        document.getElementById(`grupo__${campo}`).classList.add("formulario__grupo-incorrecto");
        document.getElementById(`grupo__${campo}`).classList.remove("formulario__grupo-correcto");
        document.querySelector(`#grupo__${campo} .formulario__input-error`).classList.add("formulario__input-error-activo");
        document.querySelector(`#grupo__${campo} i`).classList.add("bxs-x-circle");
        document.querySelector(`#grupo__${campo} i`).classList.remove("bxs-check-circle");
        campos[campo] = false;
    }
};

const validarPassword2 = ()=>{
    let inputPassword1= document.getElementById("password");
    let inputPassword2= document.getElementById("password2");

    if(inputPassword1.value !== inputPassword2.value){
        document.getElementById(`grupo__password2`).classList.add("formulario__grupo-incorrecto");
        document.getElementById(`grupo__password2`).classList.remove("formulario__grupo-correcto");
        document.querySelector(`#grupo__password2 .formulario__input-error`).classList.add("formulario__input-error-activo");
        document.querySelector(`#grupo__password2 i`).classList.add("bxs-x-circle");
        document.querySelector(`#grupo__password2 i`).classList.remove("bxs-check-circle");
        campos[password]=false;
    }else{
        document.getElementById(`grupo__password2`).classList.remove("formulario__grupo-incorrecto");
        document.getElementById(`grupo__password2`).classList.add("formulario__grupo-correcto");
        document.querySelector(`#grupo__password2 .formulario__input-error`).classList.remove("formulario__input-error-activo");
        document.querySelector(`#grupo__password2 i`).classList.remove("bxs-x-circle");
        document.querySelector(`#grupo__password2 i`).classList.add("bxs-check-circle");
        campos[password]=true;
    }
}

// Escuchar eventos de los inputs
inputs.forEach((input) => {
    input.addEventListener("keyup", validarFormulario);
    input.addEventListener("blur", validarFormulario);
});

// Envío del formulario
formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    if (campos.correo) {
        document.getElementById("formulario__mensaje").classList.remove("formulario__mensaje-activo");
        document.getElementById("formulario__mensaje-exito").classList.add("formulario__mensaje-exito-activo");

        setTimeout(() => {
            formulario.reset();
            document.getElementById("formulario__mensaje-exito").classList.remove("formulario__mensaje-exito-activo");
            document.getElementById(`grupo__correo`).classList.remove("formulario__grupo-correcto");
        }, 3000);
    } 
    
    else {
        document.getElementById("formulario__mensaje").classList.add("formulario__mensaje-activo");
    }
});
