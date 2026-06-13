document.addEventListener("DOMContentLoaded", () => {
    renderizarHistorialAtracciones();
});

async function renderizarHistorialAtracciones() {
    const contenedor = document.getElementById("contenedor-historial");
    if (!contenedor) return;
    
    const atraccionesFavs = JSON.parse(localStorage.getItem("atracciones_favoritas")) || [];

    if (atraccionesFavs.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-favoritos-box">
                <span class="emoji-vacio">🗺️</span>
                <h3>No hay atracciones en tu historial</h3>
                <p>Explora países y añade tus lugares turísticos favoritos para verlos recopilados aquí.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = ""; 

    for (const item of atraccionesFavs) {
        const codigoPais = item.idPais;       
        const nombreAtraccion = item.idAtraccion; 

        try {
            // CAMBIO AQUÍ: Usamos /alpha/ porque lo que tienes guardado es el código de 3 letras (JPN)
            const res = await fetch(`https://restcountries.com/v3.1/alpha/${codigoPais}`);
            if (!res.ok) throw new Error("No se pudo obtener la bandera del país");
            
            const data = await res.json();
            const pais = data[0];

            const banderaUrl = pais.flags.png;
            const codigoCca3 = pais.cca3; 

            const tarjeta = document.createElement("div");
            tarjeta.className = "feature-card";
            tarjeta.style.cursor = "pointer";
            
            tarjeta.innerHTML = `
                <div class="img-bandera">
                    <img src="${banderaUrl}" alt="País: ${codigoPais}">
                </div>
                <h3 class="text-busqueda">${nombreAtraccion}</h3>
                <p class="info-general" style="padding: 0 16px 16px 16px; font-size: 13px; opacity: 0.8;">
                    <strong>Ubicación:</strong> ${pais.name.common}
                </p>
            `;

            tarjeta.addEventListener("click", () => {
                localStorage.setItem("paisSeleccionado", codigoCca3);
                window.location.href = "/SRC/PAGES/paginadynamic.html";
            });

            contenedor.appendChild(tarjeta);

        } catch (error) {
            console.error(`Error al cargar historial para: ${nombreAtraccion}`, error);
            
            const tarjetaError = document.createElement("div");
            tarjetaError.className = "feature-card";
            tarjetaError.innerHTML = `
                <h3 class="text-busqueda">${nombreAtraccion || "Atracción"}</h3>
                <p class="info-general" style="color: #ff4757; padding: 16px;">
                    País: ${codigoPais} <br>
                    No se pudo sincronizar la bandera.
                </p>
            `;
            
            tarjetaError.addEventListener("click", () => {
                localStorage.setItem("paisSeleccionado", codigoPais);
                window.location.href = "/SRC/PAGES/paginadynamic.html";
            });

            contenedor.appendChild(tarjetaError);
        }
    }
}