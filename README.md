# 🚀 Explorador de Rick y Morty (Multi-APIs Project)

Aplicación Web Full-Stack desarrollada como un sistema intermediario (**Proxy / Backend for Frontend**) que consume la API oficial de Rick y Morty. El proyecto está construido utilizando **Spring Boot** en el backend y **JavaScript vainilla (ES6+)** en el frontend, implementando flujos asíncronos avanzados, paginación, búsqueda optimizada y encadenamiento de endpoints anidados.

---

## 🛠️ Tecnologías Utilizadas

* **Backend:** Java 21+, Spring Boot (Web, REST Controllers), Java `HttpClient`.
* **Frontend:** HTML5, CSS3, JavaScript Asíncrono (`async/await`, `fetch`, `Promise.all`).
* **Herramientas de construcción:** Maven.
* **Fuente de datos externa:** [Rick and Morty API](https://rickandmortyapi.com/).

---

## 🏗️ Arquitectura y Flujo Técnico (Front to Back)

La aplicación implementa una arquitectura desacoplada donde el servidor de Spring Boot actúa como un puente seguro:

1. **Frontend (`app.js`):** Captura las interacciones del usuario mediante el DOM y realiza peticiones HTTP asíncronas (`fetch`) hacia las rutas locales del servidor backend (`/api/rickandmorty/...`).
2. **Controlador REST (`RickAndMortyController`):** Recibe las peticiones en Spring Boot gracias a las anotaciones `@RestController` y `@GetMapping`.
3. **Cliente HTTP en Java (`HttpClient`):** El backend procesa la ruta, construye una nueva petición segura (`HttpRequest`) hacia la API externa oficial y espera la respuesta en formato JSON.
4. **Respuesta al Cliente:** El servidor reenvía la información estructurada de regreso al frontend para su renderizado dinámico en pantalla.

---

## ✨ Características Técnicas Destacadas

* **Consumo de Endpoints Anidados y Encadenamiento (*API Chaining*):** 
  Al consultar el detalle de un personaje, la aplicación no solo obtiene sus datos básicos, sino que extrae las URLs relativas del campo anidado `character.episode` y dispara peticiones secundarias en paralelo utilizando `Promise.all` para unificar la información de los episodios en la interfaz web.
* **Optimización de Búsqueda (*Debounce*):** 
  Implementación de un temporizador con `setTimeout` y `clearTimeout` en el buscador para evitar saturar al servidor con peticiones innecesarias en cada pulsación de teclado.
* **Paginación Dinámica:** 
  Control de navegación por páginas tanto en la lista principal de personajes como en la gestión de resultados.

---

## 📂 Estructura del Proyecto

```text
multiapis/
│
├── src/
│   ├── main/
│   │   ├── java/uce/edu/multiapis/
│   │   │   ├── controller/
│   │   │   │   └── RickAndMortyController.java  # Controlador REST y cliente HTTP
│   │   │   └── MultiapisApplication.java        # Clase principal de arranque Spring Boot
│   │   │
│   │   └── resources/
│   │       └── static/                          # Archivos estáticos del Frontend
│   │           ├── index.html                   # Interfaz de usuario principal
│   │           ├── app.js                       # Lógica de consumo fetch, DOM y Promise.all
│   │           └── estilos.css                  # Hoja de estilos de la aplicación
│   │
└── pom.xml                                      # Dependencias y configuración de Maven
