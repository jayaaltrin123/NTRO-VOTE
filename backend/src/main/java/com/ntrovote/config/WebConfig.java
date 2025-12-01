package com.ntrovote.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /images/** to the local uploads directory
        // Adjust path as needed. For now, we'll use a folder named 'uploads' in the
        // project root
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:uploads/");
    }
}
