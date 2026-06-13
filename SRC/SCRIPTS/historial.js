// =========================================================================
// 1. CONTROLADORES Y SELECTORES
// =========================================================================
const inputPais = document.getElementById("search-input");
const botonBuscar = document.getElementById("search-button");
const contenedorSugerencias = document.getElementById("features-suggestions");
const historial = JSON.parse(localStorage.getItem('historial_local')) || [];
// =========================================================================
// 2. FUNCIÓN PARA CARGAR LAS SUGERENCIAS INICIALES (Corregida con data-code)
// =========================================================================
async function cargarSugerenciasIniciales() {
    try {
        const [resJapon, resEEUU, resLetonia] = await Promise.all([
            fetch("https://restcountries.com/v3.1/name/japan"),
            fetch("https://restcountries.com/v3.1/name/usa"),
            fetch("https://restcountries.com/v3.1/name/latvia")
        ]);

        const [datosJapon, datosEEUU, datosLetonia] = await Promise.all([
            resJapon.json(),
            resEEUU.json(),
            resLetonia.json()
        ]);

        // Extraemos los códigos CCA3 para las sugerencias iniciales
        const jpCode = datosJapon[0].cca3;
        const jpBandera = datosJapon[0].flags.png;
        const jpContinente = datosJapon[0].continents[0];
        const jpCapital = datosJapon[0].capital[0];

        const usCode = datosEEUU[0].cca3;
        const usBandera = datosEEUU[0].flags.png;
        const usContinente = datosEEUU[0].continents[0];
        const usCapital = datosEEUU[0].capital[0];

        const lvCode = datosLetonia[0].cca3;
        const lvBandera = datosLetonia[0].flags.png;
        const lvContinente = datosLetonia[0].continents[0];
        const lvCapital = datosLetonia[0].capital[0];

        // CORRECCIÓN: Se añade el atributo data-code a cada tarjeta de sugerencia
        contenedorSugerencias.innerHTML = `
            <div class="feature-card" data-code="${jpCode}" style="cursor: pointer;">
                <div class="img-bandera">
                    <img src="${jpBandera}" alt="Japón">
                </div>
                <h3 class="text-busqueda">Japón</h3>
                <p class="info-general">
                    <strong>Capital:</strong> ${jpCapital} <br>
                    <strong>Continente:</strong> ${jpContinente}
                </p>
            </div>

            <div class="feature-card" data-code="${usCode}" style="cursor: pointer;">
                <div class="img-bandera">
                    <img src="${usBandera}" alt="EE.UU.">
                </div>
                <h3 class="text-busqueda">Estados Unidos</h3>
                <p class="info-general">
                    <strong>Capital:</strong> ${usCapital} <br>
                    <strong>Continente:</strong> ${usContinente}
                </p>
            </div>

            <div class="feature-card" data-code="${lvCode}" style="cursor: pointer;">
                <div class="img-bandera">
                    <img src="${lvBandera}" alt="Letonia">
                </div>
                <h3 class="text-busqueda">Letonia</h3>
                <p class="info-general">
                    <strong>Capital:</strong> ${lvCapital} <br>
                    <strong>Continente:</strong> ${lvContinente}
                </p>
            </div>
        `;
    } catch (error) {
        console.error("Error al cargar sugerencias iniciales:", error);
    }
}

// =========================================================================
// 3. FUNCIÓN DE BÚSQUEDA DINÁMICA (Corregida con data-code)
// =========================================================================
async function buscarPais() {
    const paisBuscado = inputPais.value.trim();

    if (paisBuscado === "") {
        cargarSugerenciasIniciales();
        return;
    }

    try {
        let datos = null;
        const terminoLimpio = encodeURIComponent(paisBuscado.toLowerCase());

        const res = await fetch(`https://restcountries.com/v3.1/name/${terminoLimpio}`);
        if (res.ok) {
            datos = await res.json();
        } else {
            const resTraduccion = await fetch(`https://restcountries.com/v3.1/translation/${terminoLimpio}`);
            if (resTraduccion.ok) {
                datos = await resTraduccion.json();
            }
        }

        if (!datos || datos.length === 0) {
            contenedorSugerencias.innerHTML = `
                <div style="text-align: center; padding: 20px; grid-column: 1/-1;">
                    <p>No se encontró ningún país llamado "${paisBuscado}".</p>
                </div>
            `;
            return;
        }

        const pais = datos[0];
        
        let nombrePais = pais.name.common; 
        if (pais.name.translations && pais.name.translations.spa) {
            nombrePais = pais.name.translations.spa.common;
        } else if (pais.translations && pais.translations.spa) {
            nombrePais = pais.translations.spa.common;
        }

        const banderaUrl = pais.flags.png;
        const continente = pais.continents ? pais.continents[0] : "No disponible";
        const capital = pais.capital ? pais.capital[0] : "No disponible";

        // CORRECCIÓN: Se añade el atributo data-code a la tarjeta del resultado buscado
        contenedorSugerencias.innerHTML = `
            <div class="feature-card" data-code="${pais.cca3}" style="cursor: pointer;">
                <div class="img-bandera">
                    <img src="${banderaUrl}" alt="Bandera de ${nombrePais}">
                </div>
                <h3 class="text-busqueda">${nombrePais}</h3>
                <p class="info-general">
                    <strong>Capital:</strong> ${capital} <br>
                    <strong>Continente:</strong> ${continente}
                </p>
            </div>
        `;

    } catch (error) {
        console.error("Error en la ejecución de la búsqueda:", error);
    }
}

// =========================================================================
// 4. DISPARADORES Y LISTENERS DE EVENTOS
// =========================================================================
cargarSugerenciasIniciales();

    botonBuscar.addEventListener("click", buscarPais);


    inputPais.addEventListener("keypress", (e) => 
        {
            if (e.key === "Enter") 
            {
                buscarPais();
            }
        });


// =========================================================================
// CONTROLADOR DE CLICS (Funciona perfectamente con los cambios de arriba)
// =========================================================================
// =========================================================================
// CONTROLADOR DE CLICS (REDIRECCIÓN TOTALMENTE AUTOMÁTICA)
// =========================================================================
contenedorSugerencias.addEventListener('click', (event) => {
    const tarjetaTocada = event.target.closest('.feature-card');
    if (!tarjetaTocada) return;
    
    const codigoPais = tarjetaTocada.dataset.code;
    console.log("Código capturado con éxito:", codigoPais);
    
    if (!codigoPais) {
        console.error("La tarjeta tocada no tiene un atributo 'data-code' válido.");
        return;
    }
    
    localStorage.setItem('paisSeleccionado', codigoPais);

    // 1. Capturamos la fecha y hora del momento exacto del click
    const fechaHoraActual = new Date().toLocaleString('es-CO', { 
        dateStyle: 'short', 
        timeStyle: 'short' 
    });

    // 2. Traemos el historial actual asegurando que sea un Array
    let historialActual = localStorage.getItem('historial_local');
    historialActual = historialActual ? JSON.parse(historialActual) : [];

    // 3. Agregamos el nuevo objeto con el código del país y su marca de tiempo
    historialActual.push({
        idPais: codigoPais,
        fecha: fechaHoraActual
    });

    // 4. Guardamos la estructura actualizada en el LocalStorage
    localStorage.setItem('historial_local', JSON.stringify(historialActual));
    
    window.location.href = `paginadynamic.html`;
});
