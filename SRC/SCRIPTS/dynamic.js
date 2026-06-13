// =========================================================================
// 1. CONFIGURACIÓN DE APIS (Solo OpenTripMap requiere Key)
// =========================================================================
const OPENTRIPMAP_KEY = "5ae2e3f221c38a28845f05b6d0723083df2a9b558939233e8163f9d6"; // Reemplaza con tu token de OpenTripMap

// =========================================================================
// 2. SELECTORES DEL DOM (Estructura Bento Grid)
// =========================================================================
const elFlag = document.getElementById("country-flag");
const elName = document.getElementById("country-name");
const elOfficialName = document.getElementById("country-official-name");
const elCapital = document.getElementById("country-capital");
const elPopulation = document.getElementById("country-population");
const elRegion = document.getElementById("country-region");
const elSubregion = document.getElementById("country-subregion");
const elLanguage = document.getElementById("country-language");
const elCurrencyInfo = document.getElementById("country-currency-info");

// Clima (Open-Meteo)
const elWeatherTemp = document.getElementById("weather-temp");
const elWeatherCondition = document.getElementById("weather-condition");
const elWeatherHumidity = document.getElementById("weather-humidity");
const elWeatherWind = document.getElementById("weather-wind");

// Conversor (Frankfurter)
const elTargetCurrencyCode = document.getElementById("target-currency-code");
const elConverterAmount = document.getElementById("converter-amount");
const elConverterSource = document.getElementById("converter-source");
const elConverterResultValue = document.getElementById("converter-result-value");

// Atracciones (OpenTripMap)
const elAttractionsContainer = document.getElementById("attractions-container");

let tasaCambioActual = 1;

// =========================================================================
// 3. EVENTO DE INICIALIZACIÓN
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const codigoPais = localStorage.getItem('paisSeleccionado');

    if (!codigoPais || codigoPais.length !== 3) {
        console.error("No hay un código de país válido.");
        window.location.href = "/SRC/index.html";
        return;
    }

    cargarEcosistemaEspecifico(codigoPais);
});

// =========================================================================
// 4. FUNCIÓN CENTRAL (ORQUESTADORA)
// =========================================================================
async function cargarEcosistemaEspecifico(codigo) {
    try {
        // --- API 1: REST COUNTRIES ---
        const resCountry = await fetch(`https://restcountries.com/v3.1/alpha/${codigo}`);
        if (!resCountry.ok) throw new Error("Error en REST Countries");
        const dataCountry = await resCountry.json();
        const pais = dataCountry[0];

        // Pintar info general exigida
        renderizarRestCountries(pais);
        
        // Inicializar favoritos de manera aislada y protegida
        inicializarFavoritos();

        // Coordenadas para el Clima y Atracciones
        const [lat, lon] = pais.latlng || [0, 0];
        
        // Código de moneda (Ej: JPY, EUR, USD)
        const codigoMoneda = pais.currencies ? Object.keys(pais.currencies)[0] : null;

        // --- API 2: CLIMA (Open-Meteo mediante Coordenadas) ---
        if (lat && lon) {
            cargarClimaMeteo(lat, lon);
            // --- API 4: ATRACCIONES (OpenTripMap mediante Coordenadas) ---
            cargarAtraccionesTuristicas(lat, lon);
        }

        // --- API 3: CONVERSIÓN (Frankfurter API) ---
        if (codigoMoneda) {
            elTargetCurrencyCode.textContent = codigoMoneda;
            inicializarConversorFrankfurter(codigoMoneda);
        } else {
            elCurrencyInfo.textContent = "Moneda no disponible";
        }

    } catch (error) {
        console.error("Error cargando componentes:", error);
    }
}

// =========================================================================
// 5. RENDERIZAR API 1 - REST COUNTRIES
// =========================================================================
function renderizarRestCountries(pais) {
    const nombreEsp = pais.name.translations?.spa?.common || pais.name.common;
    const oficialEsp = pais.name.translations?.spa?.official || pais.name.official;

    elFlag.src = pais.flags.png;
    elFlag.alt = `Bandera de ${nombreEsp}`;
    elName.textContent = nombreEsp;
    elOfficialName.textContent = oficialEsp;
    
    elCapital.textContent = pais.capital ? pais.capital[0] : "No disponible";
    elPopulation.textContent = pais.population.toLocaleString();
    elRegion.textContent = pais.region || "No disponible";
    elSubregion.textContent = pais.subregion || "No disponible";
    elLanguage.textContent = pais.languages ? Object.values(pais.languages).join(", ") : "No disponible";

    if (pais.currencies) {
        const divisaKey = Object.keys(pais.currencies)[0];
        elCurrencyInfo.textContent = `${divisaKey} - ${pais.currencies[divisaKey].name}`;
    }
}

// =========================================================================
// 6. API 2 - CLIMA ACTUAL (Open-Meteo)
// =========================================================================
async function cargarClimaMeteo(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
        const res = await fetch(url);
        const data = await res.json();

        const actual = data.current;
        elWeatherTemp.textContent = `${Math.round(actual.temperature_2m)}°C`;
        elWeatherHumidity.textContent = `${actual.relative_humidity_2m}%`;
        elWeatherWind.textContent = `${actual.wind_speed_10m.toFixed(1)} km/h`;
        
        elWeatherCondition.textContent = traducirCodigoWMO(actual.weather_code);

    } catch (error) {
        console.error("Error en Open-Meteo:", error);
        elWeatherCondition.textContent = "Clima no disponible";
    }
}

function traducirCodigoWMO(code) {
    if (code === 0) return "Cielo Despejado";
    if (code >= 1 && code <= 3) return "Parcialmente Nublado";
    if (code >= 45 && code <= 48) return "Niebla";
    if (code >= 51 && code <= 67) return "Llovizna/Lluvia";
    if (code >= 71 && code <= 77) return "Nevada";
    if (code >= 80 && code <= 82) return "Chubascos";
    if (code >= 95) return "Tormenta Eléctrica";
    return "Nublado";
}

// =========================================================================
// 7. API 3 - CONVERSIÓN DE MONEDAS (Frankfurter API)
// =========================================================================
function inicializarConversorFrankfurter(monedaDestino) {
    elConverterAmount.addEventListener("input", calcularConversion);
    elConverterSource.addEventListener("change", () => {
        solicitarTasaFrankfurter(elConverterSource.value, monedaDestino);
    });

    solicitarTasaFrankfurter(elConverterSource.value, monedaDestino);
}

async function solicitarTasaFrankfurter(origen, destino) {
    if (origen === destino) {
        tasaCambioActual = 1;
        calcularConversion();
        return;
    }

    try {
        elConverterResultValue.textContent = "...";
        const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${origen}&symbols=${destino}`);
        
        if (!res.ok) throw new Error("Divisa no soportada por Frankfurter temporalmente");
        const data = await res.json();
        
        tasaCambioActual = data.rates[destino];
        calcularConversion();
    } catch (error) {
        console.error("Error en Frankfurter:", error);
        elConverterResultValue.textContent = "N/A";
    }
}

function calcularConversion() {
    const cantidad = parseFloat(elConverterAmount.value);
    if (isNaN(cantidad) || cantidad <= 0) {
        elConverterResultValue.textContent = "0.00";
        return;
    }
    const resultado = cantidad * tasaCambioActual;
    elConverterResultValue.textContent = resultado.toLocaleString(undefined, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    });
}

// =========================================================================
// 8. API 4 - ATRACCIONES TURÍSTICAS (OpenTripMap - Mínimo 5)
// =========================================================================
async function cargarAtraccionesTuristicas(lat, lon) {
    try {
        elAttractionsContainer.innerHTML = "<p>Buscando atracciones relevantes...</p>";
        
        const urlList = `https://api.opentripmap.com/0.1/en/places/radius?radius=50000&lon=${lon}&lat=${lat}&kinds=interesting_places&limit=10&apikey=${OPENTRIPMAP_KEY}`;
        const resList = await fetch(urlList);
        const dataList = await resList.json();

        if (!dataList.features || dataList.features.length === 0) {
            elAttractionsContainer.innerHTML = "<p>No se encontraron atracciones turísticas cercanas en esta región.</p>";
            return;
        }

        elAttractionsContainer.innerHTML = "";
        let contadorCargadas = 0;

        for (const feature of dataList.features) {
            if (contadorCargadas >= 5) break;

            const xid = feature.properties.xid;
            const urlDetail = `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${OPENTRIPMAP_KEY}`;
            
            const resDetail = await fetch(urlDetail);
            const detail = await resDetail.json();

            const descripcion = detail.wikipedia_extracts ? detail.wikipedia_extracts.text : detail.info?.descr || "Punto de gran relevancia turística, histórica y arquitectónica dentro de la región.";
            let imagenUrl = "";

            if (detail.preview && detail.preview.source) {
                imagenUrl = detail.preview.source;
            } else {
                const numerosId = xid.replace(/\D/g, "") || "10";
                const seed = parseInt(numerosId) % 1000; 
                imagenUrl = `https://picsum.photos/500/350?random=${seed}`;
            }
            const categoria = detail.kinds ? detail.kinds.split(",")[0].replace("_", " ") : "Turismo General";

            elAttractionsContainer.innerHTML += `
                <article class="attraction-item-card">
                    <div class="attraction-img-thumb">
                        <img src="${imagenUrl}" alt="${detail.name}" class="attraction-img">
                    </div>
                    <div class="attraction-info-content">
                        
                        <div class="attraction-header">
                            <span class="card-tag" style="text-transform: capitalize;">${categoria}</span>
                            
                            <button class="btn-fav-atraccion" data-id="${detail.id || detail.name}">
                                <span class="material-symbols-outlined">favorite</span>
                            </button>
                        </div>

                        <h3>${detail.name || "Lugar Histórico Interesante"}</h3>
                        <p class="attraction-description">${acortarTexto(descripcion, 110)}</p>
                    </div>
                </article>
            `;
            contadorCargadas++;
        }

    } catch (error) {
        console.error("Error en OpenTripMap:", error);
        elAttractionsContainer.innerHTML = "<p>Error al cargar las atracciones turísticas.</p>";
    }
}

function acortarTexto(texto, limite) {
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + "...";
}

// =========================================================================
// 9. LÓGICA ULTRA-SEGURA DE FAVORITOS (LOCAL STORAGE)
// =========================================================================

function inicializarFavoritos() {
    try {
        const btnFavorito = document.getElementById('btn-favorito');
        
        // 1. Si el botón no existe en la página, salimos de inmediato
        if (!btnFavorito) return;

        // 2. Capturamos el nombre del país desde tu H1
        const elNombreContainer = document.getElementById('country-name');
        if (!elNombreContainer) return;
        const nombrePais = elNombreContainer.textContent.trim();

        // Helper seguro para leer localStorage
        const obtenerFavoritos = () => {
            try {
                return JSON.parse(localStorage.getItem('favoritos')) || [];
            } catch (e) {
                return [];
            }
        };

        // 3. Buscamos el icono de forma dinámica ADENTRO del botón actual
        const verificarEstado = () => {
            const favoritos = obtenerFavoritos();
            const icono = btnFavorito.querySelector('span'); // Buscamos el span directamente
            
            if (!icono) return;

            if (favoritos.includes(nombrePais)) {
                icono.textContent = "❤️";
            } else {
                icono.textContent = "🤍";
            }
        };

        // 4. Asignamos el evento directamente sin clonar nada
        // Usamos ONCLICK para asegurarnos de que si la función se ejecuta dos veces, el evento viejo se pise solo y no se duplique
        btnFavorito.onclick = () => {
            let favoritos = obtenerFavoritos();

            if (favoritos.includes(nombrePais)) {
                favoritos = favoritos.filter(pais => pais !== nombrePais);
            } else {
                favoritos.push(nombrePais);
            }

            localStorage.setItem('favoritos', JSON.stringify(favoritos));
            verificarEstado();
        };

        // Evaluar el estado apenas cargue la página
        verificarEstado();

    } catch (err) {
        console.error("Error en favoritos:", err);
    }
}

document.addEventListener('click', (e) => {
    const boton = e.target.closest('.btn-fav-atraccion');
    if (!boton) return; 

    // 1. Sacamos el nombre de la atracción desde el h3 de la tarjeta
    const tarjeta = boton.closest('.attraction-item-card');
    const nombreAtraccion = tarjeta.querySelector('h3').textContent.trim();

    // 2. LEEMOS EL PAÍS QUE YA ESTÁ GUARDADO EN EL LOCALSTORAGE
    const paisAGuardar = localStorage.getItem('paisSeleccionado') || "Desconocido";

    // 3. Traemos la lista de atracciones favoritas actuales
    let favs = localStorage.getItem('atracciones_favoritas');
    favs = favs ? JSON.parse(favs) : [];

    // 4. Buscamos si ya existe el par usando la combinación correcta
    const index = favs.findIndex(item => item.idAtraccion === nombreAtraccion && item.idPais === paisAGuardar);

    if (index !== -1) {
        // Si ya existía, lo quitamos
        favs.splice(index, 1);
        boton.classList.remove('active');
    } else {
        // Si no, agregamos el par con el país que recuperamos
        favs.push({
            idPais: paisAGuardar,
            idAtraccion: nombreAtraccion
        });
        boton.classList.add('active');
    }

    // 5. Guardamos la lista de atracciones actualizada
    localStorage.setItem('atracciones_favoritas', JSON.stringify(favs));
});

// ¡No olvides llamarla justo después de rellenar el elAttractionsContainer!
verificarFavoritosGuardados();