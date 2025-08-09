// Seleccionar inputs y formulario
const formulario = document.getElementById('formulario');
const inputs = document.querySelectorAll('#formulario input');

// Expresiones de validación
const expresiones = {
  usuario: /^[a-zA-Z0-9\_\-]{4,16}$/,
  nombre: /^[a-zA-ZÀ-ÿ\s]{3,45}$/,
  password: /^.{4,12}$/,
  correo: /^[a-zA-Z0-9\_]+@[a-zA-Z]+\.[a-zA-Z]+$/,
  cedula: /^\d{9}$/
};

// Estado de los campos
const campos = {
  usuario: false,
  nombre: false,
  password: false,
  correo: false,
  cedula: false
};

// Validar formulario según input
const validarFormulario = (e) => {
  switch (e.target.name) {
    case "correo":
      validarCampo(expresiones.correo, e.target, "correo");
      break;
    case "password":
      validarCampo(expresiones.password, e.target, "password");
      break;
    case "cedula":
      validarCampo(expresiones.cedula, e.target, "cedula");
      break;
  }
};

// Validar campo genérico
const validarCampo = (expresion, input, campo) => {
  if (expresion.test(input.value)) {
    campos[campo] = true;
  } else {
    campos[campo] = false;
  }
};

// Escuchar eventos de los inputs
inputs.forEach((input) => {
  input.addEventListener("keyup", validarFormulario);
  input.addEventListener("blur", validarFormulario);
});

// Envío del formulario y conexión al backend
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("correo").value;
  const contrasena = document.getElementById("contrasena").value;

  if (!campos.correo) {
    alert("Por favor ingrese un correo válido.");
    return;
  }

  try {
    const respuesta = await fetch("http://localhost:5000/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, contrasena }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      alert(data.mensaje || "Credenciales incorrectas");
      return;
    }

    // Guardar token y redirigir por rol
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    switch (data.usuario.rol) {
      case "administrador":
        window.location.href = "../administrador/gestion-anuncios.html";
        break;
      case "emprendedor":
        window.location.href = "../emprendedor/mis-emprendimientos.html";
        break;
      case "ciudadano":
        window.location.href = "../ciudadano/ofertas.html";
        break;
      default:
        alert("Rol no reconocido");
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    alert("Error de red o servidor.");
  }
});
