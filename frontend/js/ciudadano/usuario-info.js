// --- Utilidades generales ---
const API_BASE = ''; // si sirves todo desde el mismo host, deja vacío. Si no: 'http://localhost:3000'
const TOKEN_KEY = 'token';

function getToken() {
  const t = localStorage.getItem(TOKEN_KEY);
  if (!t) throw new Error('No hay token. Inicia sesión nuevamente.');
  return t;
}

function setMensaje(texto, tipo = 'info') {
  const box = document.getElementById('mensaje');
  if (!box) return;
  box.hidden = false;
  box.textContent = texto;
  box.className = 'alert ' + (tipo === 'ok' ? 'alert-ok' : tipo === 'error' ? 'alert-error' : 'alert-info');
}

function limpiarMensaje() {
  const box = document.getElementById('mensaje');
  if (!box) return;
  box.hidden = true;
  box.textContent = '';
  box.className = 'alert';
}

// --- Validaciones simples (cliente) ---
const reglas = {
  nombre: v => v.trim().length >= 2 || 'Ingresa tu nombre completo.',
  correo: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Correo inválido.',
  telefono: v => (v.trim() === '' || /^[0-9+\-\s()]{7,20}$/.test(v)) || 'Teléfono inválido.',
  fechaNacimiento: v => {
    if (!v) return true;
    const fecha = new Date(v);
    const hoy = new Date();
    return (fecha < hoy) || 'La fecha de nacimiento no puede ser futura.';
  },
  cedula: v => (v.trim() === '' || /^[0-9\-]{7,20}$/.test(v)) || 'Cédula inválida.'
};

function validarFormulario(datos) {
  for (const [campo, fn] of Object.entries(reglas)) {
    const res = fn(datos[campo] ?? '');
    if (res !== true) return { ok: false, error: res, campo };
  }
  return { ok: true };
}

// --- Previsualización de la foto ---
const fotoInput = document.getElementById('foto');
const fotoPreview = document.getElementById('fotoPreview');
if (fotoInput && fotoPreview) {
  fotoInput.addEventListener('input', () => {
    const url = fotoInput.value.trim();
    if (!url) return;
    fotoPreview.src = url;
  });
}

// --- Cargar perfil al entrar ---
async function cargarPerfil() {
  try {
    limpiarMensaje();
    setMensaje('Cargando tu información...', 'info');

    const resp = await fetch(`${API_BASE}/api/usuarios/perfil`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!resp.ok) {
      throw new Error('No se pudo obtener el perfil. Inicia sesión otra vez.');
    }

    const data = await resp.json();
    // Estructura esperada: { mensaje: 'Acceso autorizado', usuario: { ... } }
    const u = data.usuario || data; // por si devuelves el usuario directo

    // Poblar inputs (según tu esquema)
    document.getElementById('nombre').value = u.nombre ?? '';
    document.getElementById('correo').value = u.correo ?? '';
    document.getElementById('telefono').value = u.telefono ?? '';
    document.getElementById('fechaNacimiento').value = u.fechaNacimiento ? new Date(u.fechaNacimiento).toISOString().slice(0,10) : '';
    document.getElementById('cedula').value = u.cedula ?? '';
    document.getElementById('rol').value = u.rol ?? 'ciudadano';
    if (u.foto) {
      document.getElementById('foto').value = u.foto;
      if (fotoPreview) fotoPreview.src = u.foto;
    }

    setMensaje('Información cargada.', 'ok');
    setTimeout(limpiarMensaje, 1200);
  } catch (err) {
    setMensaje(err.message || 'Error al cargar el perfil.', 'error');
  }
}

// --- Guardar cambios ---
const form = document.getElementById('formCuenta');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarMensaje();

    const payload = {
      nombre: document.getElementById('nombre').value.trim(),
      correo: document.getElementById('correo').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      fechaNacimiento: document.getElementById('fechaNacimiento').value, // ISO (yyyy-mm-dd)
      cedula: document.getElementById('cedula').value.trim(),
      foto: document.getElementById('foto').value.trim(),
      // rol se mantiene sólo lectura y no se envía
    };

    // Validar cliente
    const val = validarFormulario(payload);
    if (!val.ok) {
      setMensaje(val.error, 'error');
      const campo = document.getElementById(val.campo);
      if (campo) campo.focus();
      return;
    }

    // Confirmación si cambia el correo
    const correoActual = form.dataset.correoActual || '';
    const cambiandoCorreo = correoActual && correoActual !== payload.correo;
    if (cambiandoCorreo && !confirm('Estás cambiando el correo. Es posible que necesites iniciar sesión nuevamente. ¿Continuar?')) {
      return;
    }

    try {
      setMensaje('Guardando cambios...', 'info');

      const resp = await fetch(`${API_BASE}/api/usuarios/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.mensaje || 'No se pudo actualizar el perfil.');
      }

      setMensaje('Perfil actualizado correctamente.', 'ok');

      // Actualizar caché local de correo para detectar futuros cambios
      form.dataset.correoActual = payload.correo;

      // Si tu backend emite un nuevo token cuando cambia el correo, podrías actualizarlo aquí
      // if (data.token) localStorage.setItem(TOKEN_KEY, data.token);

      // Feedback visual corto
      setTimeout(limpiarMensaje, 1500);
    } catch (err) {
      setMensaje(err.message || 'Error al actualizar el perfil.', 'error');
    }
  });

  // Guardar correo actual para detección de cambio
  // (Se define después de cargarPerfil, pero por si se ejecuta antes)
  form.addEventListener('reset', () => {
    // reset visual adicional si quieres
    setTimeout(() => limpiarMensaje(), 150);
  });
}

// Inicializar
cargarPerfil().then(() => {
  // Guardar el correo actual en data-* para comparar en submit
  const correoInput = document.getElementById('correo');
  if (correoInput && form) form.dataset.correoActual = correoInput.value.trim();
});
