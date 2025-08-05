function cambiarMapa(lugar) {
    const iframe = document.getElementById('mapaFrame');
    iframe.src = "https://www.google.com/maps?q=" + encodeURIComponent(lugar) + "&output=embed";
}