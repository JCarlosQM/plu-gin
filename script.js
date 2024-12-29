// Variables globales
const LIMITE_FILAS = 5;
const listaActividades = document.getElementById("lista-actividades");
const notificacion = document.getElementById("notificacion");
const toggleModeButton = document.getElementById("toggle-mode");
const modeIcon = document.getElementById("mode-icon");
const resetButton = document.getElementById("reset-button");

// Cambiar entre modo claro y oscuro
function cambiarModo() {
    const body = document.body;
    const isDarkMode = body.classList.toggle("dark-mode");
    body.classList.toggle("light-mode", !isDarkMode);

    // Cambiar icono dependiendo del modo
    if (isDarkMode) {
        modeIcon.src = "./image/dark.svg"; // Icono de modo oscuro
    } else {
        modeIcon.src = "./image/light.svg"; // Icono de modo claro
    }
    
    // Guardar modo en almacenamiento
    chrome.storage.local.set({ mode: isDarkMode ? "dark" : "light" });
}

toggleModeButton.addEventListener("click", cambiarModo);

// Función para agregar una nueva actividad
function agregarFila() {
    if (listaActividades.children.length >= LIMITE_FILAS) {
        notificacion.textContent = "Solo se permiten 5 registros de actividades.";
        notificacion.style.display = "block";
        notificacion.style.fontSize = "10px"; 
        return;
    }

    notificacion.style.display = "none";

    const nuevaActividad = document.createElement("li");
    nuevaActividad.className = "list-group-item d-flex align-items-center";
    nuevaActividad.innerHTML = `
        <span class="numero me-3">1</span>
        <input type="text" class="form-control flex-grow-1" placeholder="Escribe una actividad">
        <input type="time" class="form-control horario-input">
        <button class="btn btn-info btn-hora-actual">Now</button>
        <div class="options-menu" style="display: none;">
            <button class="btn btn-sm btn-success btn-concluir">Concluir</button>
            <button class="btn btn-sm btn-danger btn-eliminar">Eliminar</button>
        </div>
    `;
    listaActividades.appendChild(nuevaActividad);

    // Añadir evento al botón "Hora Actual"
    nuevaActividad.querySelector(".btn-hora-actual").addEventListener("click", function () {
        const ahora = new Date();
        const horas = String(ahora.getHours()).padStart(2, "0");
        const minutos = String(ahora.getMinutes()).padStart(2, "0");
        nuevaActividad.querySelector(".horario-input").value = `${horas}:${minutos}`;
    });

    // Mostrar el menú de opciones al hacer clic en el número
    nuevaActividad.querySelector(".numero").addEventListener("click", function () {
        const menu = nuevaActividad.querySelector(".options-menu");
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    // Concluir/Reabrir actividad
    nuevaActividad.querySelector(".btn-concluir").addEventListener("click", function () {
        const isConcluida = nuevaActividad.classList.contains("concluida");
        if (isConcluida) {
            // Reabrir la tarea
            nuevaActividad.classList.remove("concluida");
            this.textContent = "Concluir"; // Cambiar el texto a "Concluir"
        } else {
            // Concluir la tarea
            nuevaActividad.classList.add("concluida");
            this.textContent = "Reabrir"; // Cambiar el texto a "Reabrir"
        }

        const menu = nuevaActividad.querySelector(".options-menu");
        menu.style.display = "none"; // Ocultar el menú después de hacer clic
    });

    // Eliminar actividad
    nuevaActividad.querySelector(".btn-eliminar").addEventListener("click", function () {
        listaActividades.removeChild(nuevaActividad);
    });

    actualizarNumeros();
    guardarDatos(); // Guardar los datos al agregar una fila
}

// Actualizar números
function actualizarNumeros() {
    document.querySelectorAll("#lista-actividades .list-group-item").forEach((actividad, index) => {
        actividad.querySelector(".numero").textContent = index + 1;
    });
}

// Guardar los datos actuales en el almacenamiento
function guardarDatos() {
    const actividades = Array.from(listaActividades.children).map(item => ({
        actividad: item.querySelector("input[type='text']").value,
        hora: item.querySelector("input[type='time']").value,
        concluida: item.classList.contains("concluida")
    }));

    const prioridades = Array.from(document.querySelectorAll("table input")).map(input => input.value);
    const ideas = document.querySelector("textarea").value;

    chrome.storage.local.set({ actividades, prioridades, ideas });
}

// Restaurar datos desde el almacenamiento
function restaurarDatos() {
    chrome.storage.local.get(["actividades", "prioridades", "ideas", "mode"], (result) => {
        // Restaurar modo
        const body = document.body;
        if (result.mode === "dark") {
            body.classList.remove("light-mode");
            body.classList.add("dark-mode");
            modeIcon.src = "./image/dark.svg"; // Icono de modo oscuro
        } else {
            body.classList.remove("dark-mode");
            body.classList.add("light-mode");
            modeIcon.src = "./image/light.svg"; // Icono de modo claro
        }

        // Restaurar prioridades
        if (result.prioridades) {
            document.querySelectorAll("table input").forEach((input, index) => {
                input.value = result.prioridades[index] || "";
            });
        }

        // Restaurar ideas
        if (result.ideas) {
            document.querySelector("textarea").value = result.ideas;
        }

        // Restaurar actividades
        if (result.actividades) {
            listaActividades.innerHTML = "";
            result.actividades.forEach((actividad, index) => {
                const nuevaActividad = document.createElement("li");
                nuevaActividad.className = "list-group-item d-flex align-items-center";
                nuevaActividad.innerHTML = `
                    <span class="numero me-3">${index + 1}</span>
                    <input type="text" class="form-control flex-grow-1" value="${actividad.actividad}">
                    <input type="time" class="form-control horario-input" value="${actividad.hora}">
                    <button class="btn btn-info btn-hora-actual">Now</button>
                    <div class="options-menu" style="display: none;">
                        <button class="btn btn-sm btn-success btn-concluir">${actividad.concluida ? "Reabrir" : "Concluir"}</button>
                        <button class="btn btn-sm btn-danger btn-eliminar">Eliminar</button>
                    </div>
                `;
                listaActividades.appendChild(nuevaActividad);

                if (actividad.concluida) {
                    nuevaActividad.classList.add("concluida");
                }

                nuevaActividad.querySelector(".btn-hora-actual").addEventListener("click", function () {
                    const ahora = new Date();
                    const horas = String(ahora.getHours()).padStart(2, "0");
                    const minutos = String(ahora.getMinutes()).padStart(2, "0");
                    nuevaActividad.querySelector(".horario-input").value = `${horas}:${minutos}`;
                });

                nuevaActividad.querySelector(".numero").addEventListener("click", function () {
                    const menu = nuevaActividad.querySelector(".options-menu");
                    menu.style.display = menu.style.display === "block" ? "none" : "block";
                });

                nuevaActividad.querySelector(".btn-concluir").addEventListener("click", function () {
                    const isConcluida = nuevaActividad.classList.contains("concluida");
                    if (isConcluida) {
                        // Reabrir la tarea
                        nuevaActividad.classList.remove("concluida");
                        this.textContent = "Concluir"; // Cambiar el texto a "Concluir"
                    } else {
                        // Concluir la tarea
                        nuevaActividad.classList.add("concluida");
                        this.textContent = "Reabrir"; // Cambiar el texto a "Reabrir"
                    }

                    const menu = nuevaActividad.querySelector(".options-menu");
                    menu.style.display = "none"; // Ocultar el menú después de hacer clic
                });

                nuevaActividad.querySelector(".btn-eliminar").addEventListener("click", function () {
                    listaActividades.removeChild(nuevaActividad);
                });
            });
            actualizarNumeros();
        }
    });
}

// Función para resetear todo
function resetearTodo() {
    // Borrar almacenamiento local
    chrome.storage.local.clear(function() {
        console.log("Datos resetados.");
    });

    // Restaurar la interfaz de usuario al estado inicial
    const body = document.body;
    body.classList.remove("dark-mode", "light-mode");
    body.classList.add("light-mode");
    modeIcon.src = "./image/light.svg"; // Icono de modo claro

    listaActividades.innerHTML = ""; // Limpiar lista de actividades

    // Borrar prioridades e ideas
    document.querySelectorAll("table input").forEach(input => input.value = "");
    document.querySelector("textarea").value = "";
}

resetButton.addEventListener("click", resetearTodo);

// Restaurar datos al cargar el documento
document.addEventListener("DOMContentLoaded", restaurarDatos);

// Escuchar cambios en los inputs y guardar datos automáticamente
document.addEventListener("input", guardarDatos);

// Agregar fila de actividad
document.getElementById("btn-agregar-fila").addEventListener("click", agregarFila);
