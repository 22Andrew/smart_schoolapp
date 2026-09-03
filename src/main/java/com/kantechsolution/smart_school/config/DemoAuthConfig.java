package com.kantechsolution.smart_school.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(AppDemoAuthProperties.class)
public class DemoAuthConfig {
}
