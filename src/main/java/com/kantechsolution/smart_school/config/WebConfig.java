package com.kantechsolution.smart_school.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

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
    }
}
