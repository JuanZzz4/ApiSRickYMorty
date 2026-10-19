package uce.edu.multiapis.controller;



import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@RestController
@RequestMapping("/api/rickandmorty")
public class RickAndMortyController {

    private final HttpClient httpClient = HttpClient.newHttpClient();


    @GetMapping("/personajes")
    public String obtenerPersonajes(
            @org.springframework.web.bind.annotation.RequestParam(
                    defaultValue = "1"
            ) int pagina
    ) throws Exception {

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(
                        "https://rickandmortyapi.com/api/character?page="
                                + pagina
                ))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        return response.body();
    }


    @GetMapping("/buscar")
    public String buscarPersonajes(
            @org.springframework.web.bind.annotation.RequestParam String nombre
    )

            throws Exception {

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

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        return response.body();
    }


    @GetMapping("/personaje/{id}")
    public String obtenerDetallePersonaje(
            @org.springframework.web.bind.annotation.PathVariable int id
    ) throws Exception {

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(
                        "https://rickandmortyapi.com/api/character/" + id
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

