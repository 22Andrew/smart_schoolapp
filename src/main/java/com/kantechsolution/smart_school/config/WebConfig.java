package com.kantechsolution.smart_school.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * Serves uploaded student photos from the local uploads directory.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private UploadStorage uploadStorage;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = uploadStorage.getRoot().toUri().toString();
        if (!location.endsWith("/")) {
            location = location + "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);

        addStaticHandler(registry, "/css/**", "css");
        addStaticHandler(registry, "/js/**", "js");
        addStaticHandler(registry, "/images/**", "images");
    }

    private void addStaticHandler(ResourceHandlerRegistry registry, String pattern, String directory) {
        List<String> locations = new ArrayList<>();
        locations.add("classpath:/static/" + directory + "/");

        Path devDir = Path.of(System.getProperty("user.dir"))
                .resolve("src/main/resources/static/" + directory)
                .toAbsolutePath()
                .normalize();
        if (Files.isDirectory(devDir)) {
            String devLocation = devDir.toUri().toString();
            if (!devLocation.endsWith("/")) {
                devLocation = devLocation + "/";
            }
            locations.add(devLocation);
        }

        registry.addResourceHandler(pattern)
                .addResourceLocations(locations.toArray(String[]::new));
    }
}
