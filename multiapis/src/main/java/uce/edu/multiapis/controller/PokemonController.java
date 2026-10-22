package uce.edu.multiapis.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@RestController // Indica que esta clase es un controlador REST; procesa solicitudes HTTP y devuelve datos (generalmente JSON) directamente al cliente.
@RequestMapping("/api/pokemon") // Define la ruta base para todos los endpoints de este controlador. Todas las URLs aquí empezarán con /api/pokemon.
public class PokemonController {

    // Instancia de HttpClient de Java para realizar peticiones HTTP salientes hacia servicios externos (PokeAPI).
    private final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Endpoint 1: Obtener lista paginada de Pokémon.
     * Ruta completa: GET /api/pokemon/lista?inicio=0&cantidad=20
     */
    @GetMapping("/lista")
    public String obtenerPokemones(
            @org.springframework.web.bind.annotation.RequestParam(
                    defaultValue = "0"
            ) int inicio, // Parámetro de paginación: desde qué registro empieza (por defecto 0).
            @org.springframework.web.bind.annotation.RequestParam(
                    defaultValue = "20"
            ) int cantidad // Parámetro de paginación: cuántos registros trae (por defecto 20).
    ) throws Exception {

        // 1. Construimos la petición HTTP hacia la PokeAPI oficial agregando los parámetros de offset y limit.
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(
                        "https://pokeapi.co/api/v2/pokemon?offset="
                                + inicio + "&limit=" + cantidad
                ))
                .GET() // Método HTTP GET para solicitar recursos.
                .build();

        // 2. Enviamos la petición de manera síncrona usando el httpClient y esperamos la respuesta como String (JSON).
        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        // 3. Retornamos el cuerpo del JSON recibido desde PokeAPI directamente al frontend que hizo la llamada.
        return response.body();
    }

    /**
     * Endpoint 2: Buscar un Pokémon específico por nombre o ID.
     * Ruta completa: GET /api/pokemon/{nombre} (Ejemplo: /api/pokemon/pikachu)
     */
    @GetMapping("/{nombre}")
    public String buscarPokemon(@PathVariable String nombre)
            throws Exception {

        // 1. Capturamos la variable de la URL ({nombre}) y armamos la URL dinámica para consultar la PokeAPI.
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(
                        "https://pokeapi.co/api/v2/pokemon/" + nombre
                ))
                .GET()
                .build();

        // 2. Ejecutamos la solicitud HTTP hacia la PokeAPI.
        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        // 3. Devolvemos la respuesta en formato JSON de vuelta al cliente (frontend).
        return response.body();
    }
}