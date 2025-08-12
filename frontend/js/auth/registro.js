// Seleccionar inputs y formulario
const formulario = document.getElementById('formulario');
const inputs = document.querySelectorAll('#formulario input');

// Expresiones de validación
const expresiones = {
  usuario: /^[a-zA-Z0-9\_\-]{4,16}$/,
  nombre: /^[a-zA-ZÀ-ÿ\s]{3,45}$/, // letras + espacios, 3-45
  password: /^.{4,12}$/,            // 4-12 caracteres
  correo: /^[a-zA-Z0-9\_]+@[a-zA-Z]+\.[a-zA-Z]+$/, // simple
  cedula: /^\d{9}$/                 // 9 dígitos
};

// Estado de los campos
const campos = {
  usuario: false,
  nombre: false,
  password: false,
  correo: false,
  cedula: false
};

// Validar campo genérico (solo toggle de estado para no tocar estilos)
// const validarCampo = (expresion, input, campo) => {
//   campos[campo] = expresion.test(input.value);
// };

const validarCampo =(expresion,input,campo)=>{
    //expresion -- valor
    //test() -- /^[a-zA-Z0-9\_\-]{4,16}$/.test("")--> true o false
    if(expresion.test(input.value)){
        document.getElementById(`grupo__${campo}`).classList.remove("formulario__grupo-incorrecto");
        document.getElementById(`grupo__${campo}`).classList.add("formulario__grupo-correcto");
        document.querySelector(`#grupo__${campo} .formulario__input-error`).classList.remove("formulario__input-error-activo");
        document.querySelector(`#grupo__${campo} i`).classList.remove("bxs-x-circle");
        document.querySelector(`#grupo__${campo} i`).classList.add("bxs-check-circle");
        campos[campo]=true;
    }else{
        //                       grupo__telefono
        document.getElementById(`grupo__${campo}`).classList.add("formulario__grupo-incorrecto");
        document.getElementById(`grupo__${campo}`).classList.remove("formulario__grupo-correcto");
        document.querySelector(`#grupo__${campo} .formulario__input-error`).classList.add("formulario__input-error-activo");
        document.querySelector(`#grupo__${campo} i`).classList.add("bxs-x-circle");
        document.querySelector(`#grupo__${campo} i`).classList.remove("bxs-check-circle");
        campos[campo]=false;
    }
}


// Validaciones por input
const validarFormulario = (e) => {
  switch (e.target.name) {
    case "nombre":
      validarCampo(expresiones.nombre, e.target, "nombre");
      break;
    case "correo":
      validarCampo(expresiones.correo, e.target, "correo");
      break;
    case "password":
      validarCampo(expresiones.password, e.target, "password");
      validarPassword2();
      break;
    case "password2":
      validarPassword2();
      break;
    case "cedula":
      validarCampo(expresiones.cedula, e.target, "cedula");
      break;
  }
};



// Validar coincidencia de contraseñas (corrige bug: usar 'password' como string)
const validarPassword2 = () => {
  const inputPassword1 = document.getElementById("password");
  const inputPassword2 = document.getElementById("password2");
  const coincide = inputPassword1.value === inputPassword2.value && expresiones.password.test(inputPassword1.value);

  // No tocamos clases, solo estado interno:
  campos["password"] = coincide;
};

// Escuchar eventos
inputs.forEach((input) => {
  input.addEventListener("keyup", validarFormulario);
  input.addEventListener("blur", validarFormulario);
});

// Envío del formulario → conectar con backend
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("password").value;
  const password2 = document.getElementById("password2").value;
  const rol = document.getElementById("tipoUsuario").value; // ciudadano | emprendedor,
  const cedula = document.getElementById("cedula").value.trim();

  // Validaciones mínimas para backend
  if (!nombre || !campos.nombre || !campos.correo || !campos.password || contrasena !== password2 || !campos.cedula) {
    document.getElementById("formulario__mensaje").classList.add("formulario__mensaje-activo");
    return;
  }

  try {
    const cuerpo = {
      nombre,
      correo,
      contrasena,     // backend espera 'contrasena'
      rol,
      foto: "",        // aún no subimos archivo; backend acepta string opcional
      cedula
    };

    const resp = await fetch("http://localhost:5000/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo)
    });

    const data = await resp.json();

    if (!resp.ok) {
      alert(data.mensaje || "No se pudo registrar el usuario");
      return;
    }

    // Éxito: feedback y redirección a login
    document.getElementById("formulario__mensaje").classList.remove("formulario__mensaje-activo");
    document.getElementById("formulario__mensaje-exito").classList.add("formulario__mensaje-exito-activo");

    setTimeout(() => {
      window.location.href = "./inicio-sesion.html";
    }, 1000);

  } catch (error) {
    console.error("Error de conexión:", error);
    alert("No se pudo conectar con el servidor");
  }
});