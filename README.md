# 🌍 Travel Planner Pro

¡Bienvenido a **Travel Planner Pro**! Una aplicación web moderna, rápida y dinámica diseñada para exploradores y entusiastas del turismo. Este ecosistema te permite buscar información detallada de cualquier país en tiempo real utilizando la API de **REST Countries**, gestionar tus destinos favoritos y llevar un registro exacto de tu rastro de navegación mediante un historial inteligente.

La interfaz está construida bajo una estética limpia inspirada en **Bento Grid** y sigue las directrices visuales de **Material Design 3**, adaptándose perfectamente a cualquier dispositivo móvil y PC.

---

## 🚀 Características Clave

* **Búsqueda Global Inteligente:** Encuentra cualquier país al instante con datos centralizados y actualizados (banderas, capitales, continentes).
* **Sección de Favoritos Personalizada:** Guarda tus destinos predilectos usando almacenamiento persistente (`localStorage`) para consultarlos cuando quieras.
* **Historial de Exploración Rápido:** Guarda de forma automática el identificador único (`cca3`) de los países que visitas, mostrándolos en orden cronológico inverso (el último visitado primero).
* **Fichas Técnicas Dinámicas (`paginadynamic.html`):** Una sola interfaz adaptativa que recibe parámetros dinámicos para renderizar los datos técnicos de cada país de manera fluida sin recargar la app.
* **Ecosistema UI Adaptativo (Tema Claro/Oscuro):** Transición cromática ultra suave entre modos visuales mediante inyección de clases en el DOM y variables CSS nativas (`:root`).
* **Diseño Mobile-First Eficiente:** Barra de navegación fija inferior (`mobile-nav`) optimizada con eventos táctiles reactivos para celulares que no obstruye la lectura del pie de página.

---

## 🛠️ Stack Tecnológico utilizado

* **HTML5:** Estructura semántica avanzada para SEO y accesibilidad.
* **CSS3 Avanzado (Flexbox & Grid):** Maquetación responsiva con sistemas de rejilla Bento controlados para evitar deformaciones horizontales.
* **JavaScript Vanilla (ES6+):** Lógica asíncrona (`Fetch API`, `Async/Await`), manipulación dinámica del DOM y gestión del estado mediante Web Storage API.
* **Google Material Symbols:** Iconografía vectorial estilizada y escalable de alta fidelidad.

---

## 📂 Arquitectura del Repositorio

```text
Travel Planner Pro/
│
├── SRC/
│   ├── index.html               # Pantalla de inicio y motor de búsqueda
│   │
│   ├── PAGES/
│   │   ├── favoritos.html       # Rejilla con tus destinos guardados
│   │   ├── historial.html       # Rastro cronológico de navegación por ID
│   │   └── paginadynamic.html   # Vista detallada de la ficha técnica del país
│   │
│   ├── STYLES/
│   │   └── favoritos.css        # Hoja de estilos centralizada (Modo Oscuro, Grid y Layouts)
│   │
│   └── SCRIPTS/
│       ├── busqueda.js          # Lógica del input de destinos y filtros de la API
│       ├── favoritos.js         # Orquestador del render de favoritos de forma asíncrona
│       ├── historial.js         # Consumo del endpoint por código (/alpha/) e inversión cronológica
│       └── dynamic.js           # Manejo de la lógica interna de la ficha detallada y toggle de favoritos
│
└── README.md                    # Documentación del proyecto
