const listaNoticias = [{nombreUsuario:"CarlosAlv",contenido:"Accidente ocurrido en las cercanías del centro de Higuito.",direccionImagen:"../../assets/images/accidente1.jpg",fechaPublicacion:"Martes 3 de julio",horaPublicacion:"18:00"}]


const tablaNoticias = document.getElementById("tablaCuerpoNoticias")

listaNoticias.forEach(fila=>{

    const row = document.createElement("tr")

    row.innerHTML=(

        `
        <td>${fila.nombreUsuario}</td>
        <td>${fila.contenido}</td>
        <td class="imagen-suceso"><img class="imagen" src="${fila.direccionImagen}" alt=""></td>
        <td>${fila.fechaPublicacion}</td>
        <td>${fila.horaPublicacion}</td>
        `
    )

    tablaNoticias.appendChild(row)

})