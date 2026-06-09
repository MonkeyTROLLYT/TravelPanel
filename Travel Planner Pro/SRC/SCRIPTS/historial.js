document.addEventListener("DOMContentLoaded", () => {
    renderizarListaHistorial();
});

async function renderizarListaHistorial() {
    const contenedor = document.getElementById("contenedor-historial");
    if (!contenedor) return;
    
    // Leer el array de objetos desde el almacenamiento (Ej: [{idPais: "COL", fecha: "08/06/2026, 7:15 p.m."}])
    const historialRaw = JSON.parse(localStorage.getItem("historial_local")) || [];
    
    // Invertimos el orden para que los países más recientes salgan primero
    const historial = [...historialRaw].reverse();

    // CONDICIÓN: Si no hay elementos en el historial
    if (historial.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-historial-box">
                <span class="emoji-historial">⏳</span>
                <h3>Tu historial está vacío</h3>
                <p>Comienza a explorar países en la sección de búsqueda para ver tu rastro de navegación aquí.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = ""; // Limpiar estado de carga

    // Recorremos cada objeto del historial
    for (const item of historial) {
        // EXTRAEMOS LOS DOS CAMPOS: El ID del país y la fecha guardada
        const idPais = item.idPais;
        const fechaVisita = item.fecha || "Fecha no disponible";

        try {
            // Buscamos en la API usando el endpoint de códigos (/alpha/)
            const res = await fetch(`https://restcountries.com/v3.1/alpha/${idPais}`);
            if (!res.ok) throw new Error("No se pudo resolver el país por ID");
            
            const data = await res.json();
            const pais = data[0];

            // EXTRAER DATOS SEGUROS DE LA API:
            const nombreReal = pais.name && pais.name.common ? pais.name.common : "País desconocido";
            const banderaUrl = pais.flags && pais.flags.png ? pais.flags.png : "";
            const codigoCca3 = pais.cca3 || idPais; 
            const capital = pais.capital && pais.capital[0] ? pais.capital[0] : "No disponible";
            const region = pais.region || "No disponible";

            // Creamos la tarjeta con tu estructura horizontal exacta
            const tarjeta = document.createElement("div");
            tarjeta.className = "feature-card";
            tarjeta.setAttribute("data-code", codigoCca3);
            tarjeta.style.cursor = "pointer";
            
            // AGREGAMOS LA FECHA ABAJO EN LA INFO GENERAL
            tarjeta.innerHTML = `
                <div class="img-bandera">
                    <img src="${banderaUrl}" alt="${nombreReal}">
                </div>
                <h3 class="text-busqueda">${nombreReal}</h3>
                <p class="info-general">
                    <strong>Capital:</strong> ${capital} <br>
                    <strong>Continente:</strong> ${region} <br>
                    <span style="display: flex; align-items: center; gap: 4px; color: var(--on-surface-variant); font-size: 12px; margin-top: 6px;">
                        <span class="material-symbols-outlined" style="font-size: 16px;">schedule</span>
                        Explorado el: ${fechaVisita}
                    </span>
                </p>
            `;

            // Al hacer click, guardamos el ID seleccionado y redirigimos
            tarjeta.addEventListener("click", () => {
                localStorage.setItem("paisSeleccionado", codigoCca3);
                window.location.href = "/SRC/PAGES/paginadynamic.html";
            });

            contenedor.appendChild(tarjeta);

        } catch (error) {
            console.error(`Error procesando elemento del historial con ID: ${idPais}`, error);
            
            // Tarjeta de contingencia estilizada incluyendo la fecha
            const tarjetaError = document.createElement("div");
            tarjetaError.className = "feature-card";
            tarjetaError.innerHTML = `
                <div class="img-bandera" style="background: #2c3a4c; display:flex; align-items:center; justify-content:center;">
                    <span style="font-size: 2rem;">⚠️</span>
                </div>
                <h3 class="text-busqueda">Código: ${idPais}</h3>
                <p class="info-general" style="color: #ff4757;">
                    Error al cargar los datos del destino. <br>
                    <span style="color: var(--on-surface-variant); font-size: 12px;">Intentado el: ${fechaVisita}</span>
                </p>
            `;
            contenedor.appendChild(tarjetaError);
        }
    }
}