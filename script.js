// Cambiar entre modo claro y oscuro
document.getElementById("toggle-mode").addEventListener("click", function () {
    const body = document.body;
    const isDarkMode = body.classList.toggle("dark-mode");
    body.classList.toggle("light-mode", !isDarkMode);
    this.textContent = isDarkMode ? "Modo Claro" : "Modo Oscuro";
    
    // Guardar modo en almacenamiento
    chrome.storage.local.set({ mode: isDarkMode ? "dark" : "light" });
});

// Límite de filas
const LIMITE_FILAS = 7;
const listaActividades = document.getElementById("lista-actividades");
const notificacion = document.getElementById("notificacion");

// Función para agregar una nueva actividad
function agregarFila() {
    if (listaActividades.children.length >= LIMITE_FILAS) {
        notificacion.textContent = "Solo se permiten 7 registros de actividades.";
        notificacion.style.display = "block";
        return;
    }

    notificacion.style.display = "none";

    const nuevaActividad = document.createElement("li");
    nuevaActividad.className = "list-group-item d-flex align-items-center";
    nuevaActividad.innerHTML = `
        <span class="numero"></span>
        <input type="text" class="form-control flex-grow-1" placeholder="Escribe una actividad">
        <input type="time" class="form-control horario-input">
        <button class="btn btn-info btn-hora-actual">Now</button>
    `;
    listaActividades.appendChild(nuevaActividad);

    // Añadir evento al botón "Hora Actual"
    nuevaActividad.querySelector(".btn-hora-actual").addEventListener("click", function () {
        const ahora = new Date();
        const horas = String(ahora.getHours()).padStart(2, "0");
        const minutos = String(ahora.getMinutes()).padStart(2, "0");
        nuevaActividad.querySelector(".horario-input").value = `${horas}:${minutos}`;
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
        hora: item.querySelector("input[type='time']").value
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
            document.getElementById("toggle-mode").textContent = "Modo Claro";
        } else {
            body.classList.remove("dark-mode");
            body.classList.add("light-mode");
            document.getElementById("toggle-mode").textContent = "Modo Oscuro";
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
                    <span class="numero">${index + 1}</span>
                    <input type="text" class="form-control flex-grow-1" value="${actividad.actividad}">
                    <input type="time" class="form-control horario-input" value="${actividad.hora}">
                    <button class="btn btn-info btn-hora-actual">Now</button>
                `;
                listaActividades.appendChild(nuevaActividad);

                nuevaActividad.querySelector(".btn-hora-actual").addEventListener("click", function () {
                    const ahora = new Date();
                    const horas = String(ahora.getHours()).padStart(2, "0");
                    const minutos = String(ahora.getMinutes()).padStart(2, "0");
                    nuevaActividad.querySelector(".horario-input").value = `${horas}:${minutos}`;
                });
            });
            actualizarNumeros();
        }
    });
}

// Restaurar datos al cargar el documento
document.addEventListener("DOMContentLoaded", restaurarDatos);

// Escuchar cambios en los inputs y guardar datos automáticamente
document.addEventListener("input", guardarDatos);

// Agregar fila de actividad
document.getElementById("btn-agregar-fila").addEventListener("click", agregarFila);
