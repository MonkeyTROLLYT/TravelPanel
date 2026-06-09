document.addEventListener("DOMContentLoaded", () => {
    renderizarListaFavoritos();
});

async function renderizarListaFavoritos() {
    const contenedor = document.getElementById("contenedor-favoritos");
    if (!contenedor) return;
    
    // Leer el array real desde el almacenamiento local
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    // CONDICIÓN: Si no hay favoritos, muestra el mensaje usando tus estilos
    if (favoritos.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-favoritos-box">
                <span class="emoji-vacio">🤍</span>
                <h3>Aquí saldrán tus favoritos</h3>
                <p>Busca cualquier país en la pantalla principal y presiona el botón del corazón para agregarlo a tu lista personalizada.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = ""; // Limpiar el texto de carga

    // Mapear cada elemento guardado haciendo la llamada a REST Countries
    for (const nombrePais of favoritos) {
        try {
            const res = await fetch(`https://restcountries.com/v3.1/name/${nombrePais}?fullText=true`);
            if (!res.ok) throw new Error("No se pudo resolver el país");
            
            const data = await res.json();
            const pais = data[0];

            // Extraemos las variables dinámicas de la API basadas en tu estructura
            const banderaUrl = pais.flags.png;
            const codigoCca3 = pais.cca3; // ID de 3 letras para redirección (Ej: JPN, COL)
            const capital = pais.capital ? pais.capital[0] : "No disponible";
            const region = pais.region;

            // Creamos el contenedor usando TU estructura exacta de "feature-card"
            const tarjeta = document.createElement("div");
            tarjeta.className = "feature-card";
            tarjeta.setAttribute("data-code", codigoCca3);
            tarjeta.style.cursor = "pointer";
            
            tarjeta.innerHTML = `
                <div class="img-bandera">
                    <img src="${banderaUrl}" alt="${nombrePais}">
                </div>
                <h3 class="text-busqueda">${nombrePais}</h3>
                <p class="info-general">
                    <strong>Capital:</strong> ${capital} <br>
                    <strong>Continente:</strong> ${region}
                </p>
            `;

            // EVENTO CLICK: Al darle a la tarjeta, guarda el código y te redirige al detalle dinámico
            tarjeta.addEventListener("click", () => {
                localStorage.setItem("paisSeleccionado", codigoCca3);
                window.location.href = "/SRC/PAGES/paginadynamic.html";
            });

            contenedor.appendChild(tarjeta);

        } catch (error) {
            console.error(`Error procesando la tarjeta de: ${nombrePais}`, error);
            
            // Tarjeta de contingencia por si se cae el internet o la API falla con un país
            const tarjetaError = document.createElement("div");
            tarjetaError.className = "feature-card";
            tarjetaError.innerHTML = `
                <h3 class="text-busqueda">${nombrePais}</h3>
                <p class="info-general" style="color: #ff4757;">
                    Error al sincronizar datos en tiempo real.
                </p>
            `;
            contenedor.appendChild(tarjetaError);
        }
    }
}