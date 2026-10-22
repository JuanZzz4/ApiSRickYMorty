// --- 1. SELECCIÓN DE ELEMENTOS DEL DOM ---
const btnRick = document.getElementById("btnRick");
const btnPokemon = document.getElementById("btnPokemon");
const btnBuscar = document.getElementById("btnBuscar");

const titulo = document.getElementById("titulo");
const busqueda = document.getElementById("busqueda");
const resultados = document.getElementById("resultados");

// --- VARIABLES DE ESTADO Y PAGINACIÓN ---
let apiActual = "rick";          // Controla qué API está activa actualmente ("rick" o "pokemon").
let paginaRick = 1;              // Página actual para Rick y Morty.
let paginaPokemon = 0;           // Página actual para Pokémon.
const tarjetasPorPagina = 12;    // Cantidad de elementos a mostrar por página en el front.
let pokemonesCargados = [];
let temporizador;                // Variable para el control del retraso en la búsqueda (debounce).

// --- CONFIGURACIÓN DE EVENTOS ---
btnRick.addEventListener("click", cargarRick);
btnPokemon.addEventListener("click", cargarPokemon);
btnBuscar.addEventListener("click", buscar);

// Evento de entrada en el buscador con temporizador (Debounce de 4 segundos) para optimizar peticiones.
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
    apiActual = "rick";
    paginaRick = 0;
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
            "/api/rickandmorty/personajes?pagina=" + paginaApi
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
                "/api/rickandmorty/personajes?pagina=" + (paginaApi + 1)
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


// --- 3. GESTIÓN DE POKÉMON ---
async function cargarPokemon() {
    apiActual = "pokemon";
    paginaPokemon = 0;
    titulo.textContent = "Pokémon";
    busqueda.placeholder = "Buscar Pokémon...";
    busqueda.value = "";

    const respuesta = await fetch("/api/pokemon/lista");
    const datos = await respuesta.json();

    pokemonesCargados = datos.results;

    await mostrarPaginaPokemon();
}

async function mostrarPaginaPokemon() {
    resultados.innerHTML = "<p>Cargando Pokémon...</p>";

    try {
        const inicio = paginaPokemon * tarjetasPorPagina;

        // Solicita una lista paginada al backend de Pokémon
        const respuesta = await fetch(
            "/api/pokemon/lista?inicio=" + inicio +
            "&cantidad=" + tarjetasPorPagina
        );

        const datos = await respuesta.json();

        // Promise.all permite hacer múltiples peticiones en paralelo para obtener el detalle de cada Pokémon
        const pokemones = await Promise.all(
            datos.results.map(async (pokemon) => {
                const respuestaPokemon = await fetch(
                    "/api/pokemon/" + encodeURIComponent(pokemon.name)
                );

                if (!respuestaPokemon.ok) {
                    throw new Error("Error al cargar Pokémon");
                }

                return await respuestaPokemon.json();
            })
        );

        mostrarPokemon(pokemones);

        agregarPaginacion(
            paginaPokemon > 0,
            inicio + datos.results.length < datos.count,
            () => {
                paginaPokemon--;
                mostrarPaginaPokemon();
            },
            () => {
                paginaPokemon++;
                mostrarPaginaPokemon();
            }
        );

    } catch (error) {
        resultados.innerHTML =
            "<p>No se pudieron cargar los Pokémon. Intenta nuevamente.</p>";
    }
}


// --- 4. FUNCIÓN GLOBAL DE BÚSQUEDA ---
async function buscar() {
    const nombre = busqueda.value.trim();

    if (nombre === "") {
        alert("Escribe un nombre para buscar.");
        return;
    }

    resultados.innerHTML = "<p>Buscando...</p>";

    try {
        if (apiActual === "rick") {
            // Búsqueda en el backend de Rick y Morty
            const respuesta = await fetch(
                "/api/rickandmorty/buscar?nombre=" +
                encodeURIComponent(nombre)
            );

            const datos = await respuesta.json();
            mostrarRick(datos.results);
        } else {
            // Búsqueda en el backend de Pokémon
            const respuesta = await fetch(
                "/api/pokemon/" + encodeURIComponent(nombre.toLowerCase())
            );

            const pokemon = await respuesta.json();
            mostrarPokemon([pokemon]);
        }
    } catch (error) {
        resultados.innerHTML = "<p>No se encontraron resultados.</p>";
    }
}


// --- 5. RENDERIZADO EN PANTALLA (HTML DINÁMICO) ---
function mostrarRick(personajes) {
    resultados.innerHTML = "";

    if (!personajes || personajes.length === 0) {
        resultados.innerHTML = "<p>No se encontraron personajes.</p>";
        return;
    }

    personajes.forEach(personaje => {
        resultados.innerHTML += `
            <div>
                <img src="${personaje.image}" width="120">
                <h3>${personaje.name}</h3>
                <p>Estado: ${personaje.status}</p>
                <p>Especie: ${personaje.species}</p>
                <button onclick="verDetalleRick(${personaje.id})">
                    Ver detalles
                </button>
            </div>
        `;
    });
}

function mostrarPokemon(pokemones) {
    resultados.innerHTML = "";

    pokemones.forEach(pokemon => {
        const imagen = pokemon.image ||
            pokemon.sprites?.front_default;

        resultados.innerHTML += `
            <div>
                <img src="${imagen || ""}" width="120">
                <h3>${pokemon.name}</h3>
                <p>Número: ${pokemon.id}</p>
                <p>Altura: ${pokemon.height}</p>
                <p>Peso: ${pokemon.weight}</p>
                <button onclick="verDetallePokemon('${pokemon.name}')">
                    Ver detalles
                </button>
            </div>
            <hr>
        `;
    });
}


// --- 6. VISTAS DE DETALLE INDIVIDUAL ---
async function verDetalleRick(id) {
    try {
        const respuesta = await fetch(
            "/api/rickandmorty/personaje/" + id
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

async function verDetallePokemon(nombre) {
    try {
        const respuesta = await fetch(
            "/api/pokemon/" + encodeURIComponent(nombre)
        );

        const pokemon = await respuesta.json();

        const tipos = pokemon.types
            .map(tipo => tipo.type.name)
            .join(", ");

        resultados.innerHTML = `
            <div>
                <button onclick="cargarPokemon()">Volver</button>
                <img src="${pokemon.sprites.front_default || ""}" width="180">
                <h2>${pokemon.name}</h2>
                <p>Número: ${pokemon.id}</p>
                <p>Tipos: ${tipos}</p>
                <p>Altura: ${pokemon.height}</p>
                <p>Peso: ${pokemon.weight}</p>
                <p>Experiencia base: ${pokemon.base_experience ?? "No disponible"}</p>
            </div>
        `;
    } catch (error) {
        resultados.innerHTML =
            "<p>No se pudieron cargar los detalles del Pokémon.</p>";
    }
}


// --- 7. COMPONENTE REUTILIZABLE DE PAGINACIÓN ---
function agregarPaginacion(puedeAnterior, puedeSiguiente, anterior, siguiente) {
    const controles = document.createElement("div");

    controles.style.gridColumn = "1 / -1";
    controles.style.display = "flex";
    controles.style.justifyContent = "center";
    controles.style.gap = "12px";
    controles.style.margin = "20px";

    controles.innerHTML = `
        <button id="btnAnterior" ${puedeAnterior ? "" : "disabled"}>
            Anterior
        </button>
        <button id="btnSiguiente" ${puedeSiguiente ? "" : "disabled"}>
            Siguiente
        </button>
    `;

    resultados.appendChild(controles);

    document.getElementById("btnAnterior").addEventListener("click", anterior);
    document.getElementById("btnSiguiente").addEventListener("click", siguiente);
}