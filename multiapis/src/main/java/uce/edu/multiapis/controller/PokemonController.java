package uce.edu.multiapis.controller;



import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@RestController
@RequestMapping("/api/pokemon")
public class PokemonController {

    private final HttpClient httpClient = HttpClient.newHttpClient();


    @GetMapping("/lista")
    public String obtenerPokemones(
            @org.springframework.web.bind.annotation.RequestParam(
                    defaultValue = "0"
            ) int inicio,
            @org.springframework.web.bind.annotation.RequestParam(
                    defaultValue = "20"
            ) int cantidad
    ) throws Exception {

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(
                        "https://pokeapi.co/api/v2/pokemon?offset="
                                + inicio + "&limit=" + cantidad
                ))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        return response.body();
    }


    @GetMapping("/{nombre}")
    public String buscarPokemon(@PathVariable String nombre)
            throws Exception {

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(
                        "https://pokeapi.co/api/v2/pokemon/" + nombre
                ))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        return response.body();
    }
}

