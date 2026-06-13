// ==========================================
// 1. SISTEMA DE REGISTRO DE PRIMER INGRESO
// ==========================================

function validarCorreo(email) {
    return email.includes('@') && email.includes('.', email.indexOf('@'));
}

function registrarPrimerIngreso() {
    let usuarioRegistrado = localStorage.getItem('nombreUsuario');

    // Si ya existe el usuario
    if (usuarioRegistrado !== null) {
        // BLINDAJE: Solo intentamos cambiar el texto si el elemento realmente existe en esta página
        const tituloBienvenida = document.querySelector('.welcome-title');
        if (tituloBienvenida) {
            tituloBienvenida.textContent = `¡Bienvenido de vuelta, ${usuarioRegistrado}!`;
        }
        return; 
    }

    alert("¡Bienvenido a Travel Planner Pro! Para continuar, por favor completa tu registro.");

    // --- VALIDACIÓN: NOMBRE COMPLETO ---
    let nombre = "";
    while (true) {
        nombre = prompt("Ingresa tu Nombre Completo:");
        if (nombre === null) {
            alert("Registro cancelado. No podrás usar el sistema hasta registrarte.");
            return;
        }
        nombre = nombre.trim();
        if (nombre.length >= 3) break;
        alert("❌ Error: El nombre debe tener al menos 3 caracteres.");
    }

    // --- VALIDACIÓN: CORREO ELECTRÓNICO ---
    let correo = "";
    while (true) {
        correo = prompt("Ingresa tu Correo Electrónico:");
        if (correo === null) {
            alert("Registro cancelado. No podrás usar el sistema hasta registrarte.");
            return;
        }
        correo = correo.trim();
        if (validarCorreo(correo)) break;
        alert("❌ Error: Ingresa un correo electrónico válido.");
    }

    // --- VALIDACIÓN: PAÍS DE RESIDENCIA ---
    let pais = "";
    while (true) {
        pais = prompt("¿Cuál es tu País de residencia?");
        if (pais === null) {
            alert("Registro cancelado. No podrás usar el sistema hasta registrarte.");
            return;
        }
        pais = pais.trim();
        if (pais.length >= 2) break;
        alert("❌ Error: El país no puede estar vacío.");
    }

    // Guardado de datos
    localStorage.setItem('nombreUsuario', nombre);
    localStorage.setItem('correoUsuario', correo);
    localStorage.setItem('paisUsuario', pais);

    alert("¡Registro completado con éxito! Disfruta de tu aventura.");
    
    // BLINDAJE: Igual aquí, solo cambia el texto si existe la etiqueta
    const tituloBienvenida = document.querySelector('.welcome-title');
    if (tituloBienvenida) {
        tituloBienvenida.textContent = `¡Bienvenido de vuelta, ${nombre}!`;
    }
}

// Ejecutamos el registro de inmediato
registrarPrimerIngreso();


// ==========================================
// 2. SISTEMA DE CAMBIO DE TEMA (CLARO/OSCURO)
// ==========================================

let modoVisual = localStorage.getItem('temaActual') || 'white'; 
let icono;          
let mostrarmensaje; 

if (modoVisual === 'white') {
    mostrarmensaje = 'Claro';
    icono = 'light_mode'; 
} else {
    mostrarmensaje = 'Oscuro';
    icono = 'dark_mode';  
}

// Inyección inicial en el HTML
document.getElementById('mostrarmensaje').textContent = mostrarmensaje; 
document.getElementById('icono-tema').textContent = icono;             
document.documentElement.className = modoVisual;                        

const boton = document.getElementById('theme-toggle');

function toggleTheme() {
    if (modoVisual === 'dark') {
        mostrarmensaje = 'Claro';
        modoVisual = 'white';
        icono = 'light_mode';
    } else {
        mostrarmensaje = 'Oscuro';
        modoVisual = 'dark';
        icono = 'dark_mode';
    }
    
    document.getElementById('mostrarmensaje').textContent = mostrarmensaje; 
    document.getElementById('icono-tema').textContent = icono;             
    
    localStorage.setItem('temaActual', modoVisual); 
    document.documentElement.className = modoVisual; 
}

boton.addEventListener('click', toggleTheme);