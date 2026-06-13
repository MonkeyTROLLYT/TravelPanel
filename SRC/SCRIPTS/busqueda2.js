// =========================================================================
// 1. CONTROLADORES, SELECTORES Y CONFIGURACIÓN PROXY (Para solucionar CORS)
// =========================================================================
const inputPais = document.getElementById("search-input");
const botonBuscar = document.getElementById("search-button");
const contenedorSugerencias = document.getElementById("features-suggestions");

// Proxy inverso gratuito para añadir las cabeceras Access-Control-Allow-Origin
const PROXY_CORS = "https://api.allorigins.win/get?url=";

// =========================================================================
// 2. FUNCIÓN PARA CARGAR LAS SUGERENCIAS INICIALES (Solución CORS Aplicada)
// =========================================================================
async function cargarSugerenciasIniciales() {
    try {
        // Construimos las URLs codificadas pasándolas por el Proxy de AllOrigins
        const urlJapon = `${PROXY_CORS}${encodeURIComponent("https://restcountries.com/v3.1/name/japan")}`;
        const urlEEUU = `${PROXY_CORS}${encodeURIComponent("https://restcountries.com/v3.1/name/usa")}`;
        const urlLetonia = `${PROXY_CORS}${encodeURIComponent("https://restcountries.com/v3.1/name/latvia")}`;

        // Ejecutamos las peticiones en paralelo protegiendo caídas individuales con .catch
        const [resJapon, resEEUU, resLetonia] = await Promise.all([
            fetch(urlJapon).catch(e => ({ ok: false })),
            fetch(urlEEUU).catch(e => ({ ok: false })),
            fetch(urlLetonia).catch(e => ({ ok: false }))
        ]);

        // Valores por defecto (respaldo local inmediato) por si el proxy falla
        let jpCode = "JPN", jpBandera = "placeholder-flag.png", jpCapital = "Tokio", jpContinente = "Asia";
        let usCode = "USA", usBandera = "placeholder-flag.png", usCapital = "Washington D.C.", usContinente = "Norteamérica";
        let lvCode = "LVA", lvBandera = "placeholder-flag.png", lvCapital = "Riga", lvContinente = "Europa";

        // AllOrigins devuelve la respuesta real dentro de una propiedad llamada "contents" como String text
        if (resJapon.ok) {
            const jsonProxy = await resJapon.json();
            const datosJapon = JSON.parse(jsonProxy.contents);
            if (datosJapon && datosJapon[0]) {
                jpCode = datosJapon[0].cca3;
                jpBandera = datosJapon[0].flags.png;
                jpContinente = datosJapon[0].continents[0];
                jpCapital = datosJapon[0].capital[0];
            }
        }
        if (resEEUU.ok) {
            const jsonProxy = await resEEUU.json();
            const datosEEUU = JSON.parse(jsonProxy.contents);
            if (datosEEUU && datosEEUU[0]) {
                usCode = datosEEUU[0].cca3;
                usBandera = datosEEUU[0].flags.png;
                usContinente = datosEEUU[0].continents[0];
                usCapital = datosEEUU[0].capital[0];
            }
        }
        if (resLetonia.ok) {
            const jsonProxy = await resLetonia.json();
            const datosLetonia = JSON.parse(jsonProxy.contents);
            if (datosLetonia && datosLetonia[0]) {
                lvCode = datosLetonia[0].cca3;
                lvBandera = datosLetonia[0].flags.png;
                lvContinente = datosLetonia[0].continents[0];
                lvCapital = datosLetonia[0].capital[0];
            }
        }

        // Renderizado del contenedor con las tres tarjetas iniciales
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
        console.error("Error crítico al procesar sugerencias con proxy:", error);
    }
}

// =========================================================================
// 3. FUNCIÓN DE BÚSQUEDA DINÁMICA (Bypaseando CORS con AllOrigins)
// =========================================================================
async function buscarPais() {
    const paisBuscado = inputPais.value.trim();

    if (paisBuscado === "") {
        cargarSugerenciasIniciales();
        return;
    }

    const terminoLimpio = encodeURIComponent(paisBuscado.toLowerCase());
    let datos = null;

    try {
        // 1. Intentamos buscar por Nombre pasando a través del Proxy
        const urlName = `${PROXY_CORS}${encodeURIComponent(`https://restcountries.com/v3.1/name/${terminoLimpio}`)}`;
        const res = await fetch(urlName).catch(() => ({ ok: false }));

        if (res.ok) {
            const jsonProxy = await res.json();
            // Validamos que AllOrigins haya podido obtener contenido del servidor remoto
            if (jsonProxy.contents) {
                datos = JSON.parse(jsonProxy.contents);
            }
        }

        // 2. Si falló el nombre, intentamos buscar por Traducción usando el Proxy
        if (!datos || datos.length === 0) {
            const urlTranslation = `${PROXY_CORS}${encodeURIComponent(`https://restcountries.com/v3.1/translation/${terminoLimpio}`)}`;
            const resTraduccion = await fetch(urlTranslation).catch(() => ({ ok: false }));

            if (resTraduccion.ok) {
                const jsonProxyTrad = await resTraduccion.json();
                if (jsonProxyTrad.contents) {
                    datos = JSON.parse(jsonProxyTrad.contents);
                }
            }
        }

        // 3. Si obtuvimos datos válidos procesamos el DOM de la sugerencia
        if (datos && datos.length > 0) {
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

            // Guardamos los datos completos del país para que dynamic.js pueda renderizarlos de inmediato
            localStorage.setItem('countryData', JSON.stringify(pais));

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
        } else {
            // Si la API explícitamente dice que el país no existe (ej. error 404 real)
            contenedorSugerencias.innerHTML = `
                <div style="text-align: center; padding: 20px; grid-column: 1/-1;">
                    <p>No se encontró ningún país llamado "${paisBuscado}".</p>
                </div>
            `;
        }

    } catch (error) {
        console.warn("Fallo total de comunicación. Aplicando contingencia local de emergencia...", error);
        ejecutarRespaldoLocal(paisBuscado);
    }
}

/**
 * Respaldo local de emergencia si el proxy o el internet fallan por completo
 */
function ejecutarRespaldoLocal(nombreDelPais) {
    const codigoSimulado = nombreDelPais.substring(0, 3).toUpperCase();
    
    const paisRespaldo = {
        name: {
            common: nombreDelPais.toUpperCase(),
            official: `${nombreDelPais.toUpperCase()} (Información Local de Emergencia)`
        },
        translations: { spa: { common: nombreDelPais.toUpperCase() } },
        cca3: codigoSimulado,
        capital: ["Capital Local"],
        population: "Sincronizando...",
        region: "Global",
        subregion: "Mundial",
        languages: { backup: "Local" },
        currencies: { USD: { name: "Dólar", symbol: "$" } },
        flags: { png: "placeholder-flag.png" },
        continents: ["Mundo Enrutado"]
    };

    localStorage.setItem('countryData', JSON.stringify(paisRespaldo));

    contenedorSugerencias.innerHTML = `
        <div class="feature-card" data-code="${codigoSimulado}" style="cursor: pointer;">
            <div class="img-bandera">
                <img src="placeholder-flag.png" alt="Bandera Temporal">
            </div>
            <h3 class="text-busqueda">${nombreDelPais.toUpperCase()}</h3>
            <p class="info-general">
                <strong>Capital:</strong> Ver detalles local <br>
                <strong>Continente:</strong> Acceso offline
            </p>
        </div>
    `;
}

// =========================================================================
// 4. DISPARADORES Y LISTENERS DE EVENTOS
// =========================================================================
// Carga inicial al arrancar el documento
cargarSugerenciasIniciales();

botonBuscar.addEventListener("click", buscarPais);

inputPais.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        buscarPais();
    }
});

// =========================================================================
// 5. CONTROLADOR DE CLICS (Historial es-CO y Redirección Total sin interrupciones)
// =========================================================================
contenedorSugerencias.addEventListener('click', (event) => {
    const tarjetaTocada = event.target.closest('.feature-card');
    if (!tarjetaTocada) return;
    
    const codigoPais = tarjetaTocada.dataset.code;
    console.log("Código de país capturado con éxito:", codigoPais);
    
    if (!codigoPais) {
        console.error("La tarjeta seleccionada carece de un 'data-code' válido.");
        return;
    }
    
    // Almacenamos la selección de control
    localStorage.setItem('paisSeleccionado', codigoPais);

    // 1. Capturamos la marca de tiempo local de Colombia
    const fechaHoraActual = new Date().toLocaleString('es-CO', { 
        dateStyle: 'short', 
        timeStyle: 'short' 
    });

    // 2. Extraemos el array del historial asegurándonos de que no devuelva nulo
    let historialActual = localStorage.getItem('historial_local');
    historialActual = historialActual ? JSON.parse(historialActual) : [];

    // 3. Añadimos el nuevo nodo de datos visitados
    historialActual.push({
        idPais: codigoPais,
        fecha: fechaHoraActual
    });

    // 4. Guardamos la estructura actualizada en formato String para JSON
    localStorage.setItem('historial_local', JSON.stringify(historialActual));
    
    // Redirigimos sin retrasar al navegador
    window.location.href = `paginadynamic.html`;
});
