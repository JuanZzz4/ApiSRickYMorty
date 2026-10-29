// --- 0. URL BASE DE LA API ---
// En Docker/EC2 Nginx sirve el front y hace proxy de /api -> backend (mismo origen, puerto 80).
// En local (Live Server u otro puerto) se llama directo al backend Spring en el 8080.
const API_BASE = (location.port === "" || location.port === "80")
    ? ""
    : "http://localhost:8080";

// --- 1. SELECCIÓN DE ELEMENTOS DEL DOM ---
const btnRick = document.getElementById("btnRick");
const btnBuscar = document.getElementById("btnBuscar");

const titulo = document.getElementById("titulo");
const busqueda = document.getElementById("busqueda");
const resultados = document.getElementById("resultados");

// --- VARIABLES DE ESTADO Y PAGINACIÓN ---
let paginaRick = 1;              // Página actual para Rick y Morty.
const tarjetasPorPagina = 12;    // Cantidad de elementos a mostrar por página en el front.
let temporizador;                // Variable para el control del retraso en la búsqueda (debounce).

// --- CONFIGURACIÓN DE EVENTOS ---
btnRick.addEventListener("click", cargarRick);
btnBuscar.addEventListener("click", buscar);

busqueda.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        clearTimeout(temporizador);
        buscar();
    }
});

// Evento de entrada en el buscador con temporizador (Debounce de 4 segundos)
busqueda.addEventListener("input", function () {
    clearTimeout(temporizador);

    temporizador = setTimeout(function () {
        if (busqueda.value.trim() !== "") {
            buscar();
        }
    }, 4000);
});


// --- 2. GESTIÓN DE RICK Y MORTY ---
async function cargarRick() {
    paginaRick = 1;
    titulo.textContent = "Personajes de Rick y Morty";
    busqueda.placeholder = "Buscar personaje...";
    busqueda.value = "";

    await mostrarPaginaRick();
}

async function mostrarPaginaRick() {
    resultados.innerHTML = "<p>Cargando personajes...</p>";

    try {
        const inicio = (paginaRick - 1) * tarjetasPorPagina;
        const paginaApi = Math.floor(inicio / 20) + 1;
        const posicion = inicio % 20;

        // Petición al backend de Spring Boot para Rick y Morty
        const respuesta = await fetch(
            API_BASE + "/api/rickandmorty/personajes?pagina=" + paginaApi
        );

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los personajes");
        }

        const datos = await respuesta.json();

        let personajes = datos.results.slice(
            posicion,
            posicion + tarjetasPorPagina
        );

        // Lógica para completar elementos si la página cruza el límite de la API externa
        if (personajes.length < tarjetasPorPagina && datos.info.next) {
            const respuestaSiguiente = await fetch(
                API_BASE + "/api/rickandmorty/personajes?pagina=" + (paginaApi + 1)
            );

            if (respuestaSiguiente.ok) {
                const datosSiguientes = await respuestaSiguiente.json();

                personajes = personajes.concat(
                    datosSiguientes.results.slice(
                        0,
                        tarjetasPorPagina - personajes.length
                    )
                );
            }
        }

        mostrarRick(personajes);

        // Agrega botones de paginación dinámicos
        agregarPaginacion(
            paginaRick > 1,
            inicio + personajes.length < datos.info.count,
            () => {
                paginaRick--;
                mostrarPaginaRick();
            },
            () => {
                paginaRick++;
                mostrarPaginaRick();
            }
        );

    } catch (error) {
        resultados.innerHTML =
            "<p>No se pudieron cargar los personajes. Intenta nuevamente.</p>";
    }
}


// --- 3. FUNCIÓN DE BÚSQUEDA ---
async function buscar() {
    const nombre = busqueda.value.trim();

    if (nombre === "") {
        alert("Escribe un nombre para buscar.");
        return;
    }

    resultados.innerHTML = "<p>Buscando...</p>";

    try {
        const respuesta = await fetch(
            API_BASE + "/api/rickandmorty/buscar?nombre=" +
            encodeURIComponent(nombre)
        );

        const datos = await respuesta.json();
        mostrarRick(datos.results);
    } catch (error) {
        resultados.innerHTML = "<p>No se encontraron resultados.</p>";
    }
}


// --- 4. RENDERIZADO EN PANTALLA ---
function mostrarRick(personajes) {
    resultados.innerHTML = "";

    if (!personajes || personajes.length === 0) {
        resultados.innerHTML = "<p>No se encontraron personajes.</p>";
        return;
    }

    personajes.forEach(personaje => {
        resultados.innerHTML += `
            <div class="tarjeta">
                <img src="${personaje.image}" alt="${personaje.name}" loading="lazy">
                <div class="tarjeta-info">
                    <h3>${personaje.name}</h3>
                    <p class="estado ${personaje.status.toLowerCase()}">${personaje.status}</p>
                    <p>${personaje.species}</p>
                    <button onclick="verDetalleRick(${personaje.id})">
                        Ver detalles
                    </button>
                </div>
            </div>
        `;
    });
}
// --- 6. VISTAS DE DETALLE INDIVIDUAL ---
/*async function verDetalleRick(id) {
    try {
        const respuesta = await fetch(
            API_BASE + "/api/rickandmorty/personaje/" + id
        );

        const personaje = await respuesta.json();

        resultados.innerHTML = `
            <div>
                <button onclick="cargarRick()">Volver</button>
                <img src="${personaje.image}" width="180">
                <h2>${personaje.name}</h2>
                <p>Estado: ${personaje.status}</p>
                <p>Especie: ${personaje.species}</p>
                <p>Género: ${personaje.gender}</p>
                <p>Origen: ${personaje.origin.name}</p>
                <p>Ubicación: ${personaje.location.name}</p>
            </div>
        `;
    } catch (error) {
        resultados.innerHTML =
            "<p>No se pudieron cargar los detalles.</p>";
    }
}
    */

// --- 5. VISTA DE DETALLE (CON ENDPOINT ANIDADO Y ENCADENAMIENTO) ---
async function verDetalleRick(id) {
    try {
        // 1. Primera petición: Obtenemos el personaje (Endpoint principal)
        const respuesta = await fetch(API_BASE + "/api/rickandmorty/personaje/" + id);
        const personaje = await respuesta.json();

        // 2. ENDPOINT ANIDADO Y ENCADENAMIENTO:
        // Tomamos los primeros 3 episodios del arreglo de URLs que trae el personaje
        const urlsEpisodios = personaje.episode.slice(0, 3); 

        // Hacemos un fetch a cada URL anidada en paralelo usando Promise.all
        const peticionesEpisodios = urlsEpisodios.map(async (urlEpisodio) => {
            const resEp = await fetch(urlEpisodio);
            return await resEp.json();
        });

        const episodios = await Promise.all(peticionesEpisodios);

        // Convertimos los episodios en una lista de HTML
        const listaEpisodiosHTML = episodios.map(ep => 
            `<li>${ep.name} (${ep.episode})</li>`
        ).join("");

        // 3. PINTAR EN LA WEB
        resultados.innerHTML = `
            <div class="detalle">
                <img src="${personaje.image}" alt="${personaje.name}">
                <div>
                    <button class="volver" onclick="cargarRick()">← Volver</button>
                    <h2>${personaje.name}</h2>
                    <p class="estado ${personaje.status.toLowerCase()}">${personaje.status}</p>
                    <p>Especie: ${personaje.species}</p>
                    <p>Género: ${personaje.gender}</p>
                    <p>Origen: ${personaje.origin.name}</p>
                    <hr>
                    <h3>Episodios (Datos Anidados y Encadenados)</h3>
                    <ul>
                        ${listaEpisodiosHTML}
                    </ul>
                </div>
            </div>
        `;
    } catch (error) {
        resultados.innerHTML =
            "<p>No se pudieron cargar los detalles y los episodios.</p>";
    }
}


// --- 6. COMPONENTE REUTILIZABLE DE PAGINACIÓN ---
function agregarPaginacion(puedeAnterior, puedeSiguiente, anterior, siguiente) {
    const controles = document.createElement("div");

    controles.className = "paginacion";

    controles.innerHTML = `
        <button id="btnAnterior" ${puedeAnterior ? "" : "disabled"}>
            ← Anterior
        </button>
        <button id="btnSiguiente" ${puedeSiguiente ? "" : "disabled"}>
            Siguiente →
        </button>
    `;

    resultados.appendChild(controles);

    document.getElementById("btnAnterior").addEventListener("click", anterior);
    document.getElementById("btnSiguiente").addEventListener("click", siguiente);
}



