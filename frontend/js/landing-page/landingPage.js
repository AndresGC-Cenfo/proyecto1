document.addEventListener('DOMContentLoaded', () => {
    
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) { 
                e.preventDefault(); 

                const targetId = href;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    window.scrollTo({
                        top: targetElement.offsetTop - navbarHeight,
                        behavior: 'smooth'
                    });
                }
            }
            
        });
    });

    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
    }

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const mensaje = document.getElementById('mensaje').value;

            if (nombre && email) {
                console.log('¡Formulario Enviado!');
                console.log('Nombre:', nombre);
                console.log('Email:', email);
                console.log('Mensaje:', mensaje);

                alert('¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.');
                contactForm.reset();
            } else {
                alert('Por favor, complete los campos requeridos (Nombre y Email).');
            }
        });
    }
});