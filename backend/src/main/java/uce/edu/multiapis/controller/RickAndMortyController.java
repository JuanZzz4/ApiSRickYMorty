package uce.edu.multiapis.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@RestController // Define la clase como un controlador REST que responderá con datos (JSON) directamente al cliente.
@RequestMapping("/api/rickandmorty") // Establece la ruta base; todas las URLs de este controlador comienzan con /api/rickandmorty.
public class RickAndMortyController {

    // Instancia de HttpClient para realizar peticiones HTTP salientes hacia la API de Rick y Morty.
    private final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Endpoint 1: Obtener lista de personajes paginada.
     * Ruta completa: GET /api/rickandmorty/personajes?pagina=1
     */
    @GetMapping("/personajes")
    public String obtenerPersonajes(
            @org.springframework.web.bind.annotation.RequestParam(
                    defaultValue = "1"
            ) int pagina // Parámetro opcional para la paginación; si no se envía, por defecto trae la página 1.
    ) throws Exception {

        // 1. Construimos la petición HTTP apuntando a la API oficial con el número de página recibido.
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(
                        "https://rickandmortyapi.com/api/character?page="
                                + pagina
                ))
                .GET()
                .build();

        // 2. Enviamos la petición y esperamos la respuesta en formato String (JSON).
        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        // 3. Retornamos el cuerpo del JSON obtenido directamente hacia el frontend.
        return response.body();
    }

    /**
     * Endpoint 2: Buscar personajes por nombre.
     * Ruta completa: GET /api/rickandmorty/buscar?nombre=Rick
     */
    @GetMapping("/buscar")
    public String buscarPersonajes(
            @org.springframework.web.bind.annotation.RequestParam String nombre // Parámetro obligatorio con el nombre a buscar.
    ) throws Exception {

        // 1. Construimos la petición sanitizando el texto con URLEncoder. 
        // Esto evita errores si el usuario busca nombres con espacios o caracteres especiales (ej: "Morty Smith").
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(
                        "https://rickandmortyapi.com/api/character/?name="
                                + java.net.URLEncoder.encode(
                                        nombre,
                                        java.nio.charset.StandardCharsets.UTF_8
                                )
                ))
                .GET()
                .build();

        // 2. Ejecutamos la solicitud HTTP hacia la API externa.
        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        // 3. Devolvemos la respuesta JSON al cliente.
        return response.body();
    }

    /**
     * Endpoint 3: Obtener el detalle de un personaje específico por su ID.
     * Ruta completa: GET /api/rickandmorty/personaje/5 (Ejemplo para el personaje con ID 5)
     */
    @GetMapping("/personaje/{id}")
    public String obtenerDetallePersonaje(
            @org.springframework.web.bind.annotation.PathVariable int id // Captura el ID directamente desde la estructura de la URL.
    ) throws Exception {

        // 1. Armamos la URI concatenando el ID del personaje solicitado.
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(
                        "https://rickandmortyapi.com/api/character/" + id
                ))
                .GET()
                .build();

        // 2. Enviamos la petición HTTP al servidor externo.
        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        // 3. Retornamos el resultado en formato JSON al frontend.
        return response.body();
    }
}