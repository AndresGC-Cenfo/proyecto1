const form = document.querySelector('.formulario');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const correo = document.getElementById('correo').value.trim();

  try {
    const resp = await fetch('/api/usuarios/password/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo })
    });
    const data = await resp.json();

    // Si el backend devolvió resetUrl, redirigimos directo (sin email real)
    if (data.resetUrl) {
      window.location.href = data.resetUrl;
    } else {
      alert(data.mensaje || 'Si el correo existe, se enviará un enlace para restablecer.');
    }
  } catch (err) {
    alert('Error al procesar la solicitud. Intenta de nuevo.');
  }
});