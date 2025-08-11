// js/auth/restablecer-contrasena.js

// Utilidad: obtener params de la URL
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

const token = getQueryParam('token');
const email = getQueryParam('email'); // solo informativo; el backend no lo necesita
if (!token) {
  alert('Falta el token de restablecimiento.');
  // Opcional: redirigir a solicitar enlace
  // window.location.href = 'restablecer-contrasena.html';
}

// Seleccionar inputs y formulario
const formulario = document.getElementById('formulario');
const inputs = document.querySelectorAll('#formulario input');

// Expresiones de validación
const expresiones = {
  password: /^.{4,72}$/ // permite 4-72 chars
};

// Estado de los campos
const campos = {
  password: false,
  password2: false
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

const validarPassword2 = () => {
  const inputPassword1 = document.getElementById("password");
  const inputPassword2 = document.getElementById("password2");
  if (inputPassword1.value !== inputPassword2.value || inputPassword2.value.length === 0) {
    document.getElementById('grupo__password2').classList.add("formulario__grupo-incorrecto");
    document.getElementById('grupo__password2').classList.remove("formulario__grupo-correcto");
    document.querySelector('#grupo__password2 .formulario__input-error').classList.add("formulario__input-error-activo");
    document.querySelector('#grupo__password2 i').classList.add("bxs-x-circle");
    document.querySelector('#grupo__password2 i').classList.remove("bxs-check-circle");
    campos.password2 = false; // <— FIX del bug
  } else {
    document.getElementById('grupo__password2').classList.remove("formulario__grupo-incorrecto");
    document.getElementById('grupo__password2').classList.add("formulario__grupo-correcto");
    document.querySelector('#grupo__password2 .formulario__input-error').classList.remove("formulario__input-error-activo");
    document.querySelector('#grupo__password2 i').classList.remove("bxs-x-circle");
    document.querySelector('#grupo__password2 i').classList.add("bxs-check-circle");
    campos.password2 = true; // <— FIX del bug
  }
};

// Escuchar eventos de los inputs
inputs.forEach((input) => {
  input.addEventListener("keyup", (e) => {
    if (e.target.name === 'password') {
      validarCampo(expresiones.password, e.target, "password");
      validarPassword2();
    }
    if (e.target.name === 'password2') validarPassword2();
  });
  input.addEventListener("blur", (e) => {
    if (e.target.name === 'password') {
      validarCampo(expresiones.password, e.target, "password");
      validarPassword2();
    }
    if (e.target.name === 'password2') validarPassword2();
  });
});

// Envío del formulario
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ok = campos.password && campos.password2;
  if (!ok) {
    document.getElementById("formulario__mensaje").classList.add("formulario__mensaje-activo");
    return;
  }

  document.getElementById("formulario__mensaje").classList.remove("formulario__mensaje-activo");

  try {
    const password = document.getElementById('password').value;
    const resp = await fetch('/api/usuarios/password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });
    const data = await resp.json();
    if (resp.ok) {
      document.getElementById("formulario__mensaje-exito").classList.add("formulario__mensaje-exito-activo");
      setTimeout(() => {
        window.location.href = 'inicio-sesion.html';
      }, 1500);
    } else {
      alert(data.mensaje || 'No se pudo restablecer la contraseña');
    }
  } catch (err) {
    alert('Error al procesar la solicitud. Intenta de nuevo.');
  }
});
