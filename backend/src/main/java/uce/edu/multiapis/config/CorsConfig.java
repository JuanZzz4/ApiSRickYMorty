package uce.edu.multiapis.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Permite que el frontend abierto en local (Live Server, puerto 5500, etc.)
 * pueda llamar al backend en http://localhost:8080.
 * En Docker/EC2 no hace falta: Nginx hace de proxy bajo el mismo origen.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins("*").allowedMethods("GET");
    }
}
