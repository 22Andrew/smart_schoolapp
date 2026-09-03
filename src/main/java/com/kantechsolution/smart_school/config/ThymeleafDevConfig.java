package com.kantechsolution.smart_school.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.core.Ordered;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.FileTemplateResolver;
import org.thymeleaf.templateresolver.ITemplateResolver;

import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Loads Thymeleaf templates from src/main/resources/templates when running locally
 * from the project root. This avoids missing-page errors when IDE builds do not
 * copy every HTML file into target/classes.
 */
@Configuration
@Conditional(ThymeleafDevConfig.LocalTemplatesAvailable.class)
public class ThymeleafDevConfig {

    private static final Path TEMPLATE_DIR = Path.of("src/main/resources/templates");

    @Bean
    public ITemplateResolver localFileTemplateResolver() {
        Path templateRoot = Path.of(System.getProperty("user.dir")).resolve(TEMPLATE_DIR).toAbsolutePath().normalize();
        String prefix = templateRoot.toString().replace('\\', '/') + "/";

        FileTemplateResolver resolver = new FileTemplateResolver();
        resolver.setPrefix(prefix);
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false);
        resolver.setCheckExistence(true);
        resolver.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return resolver;
    }

    static final class LocalTemplatesAvailable implements Condition {
        @Override
        public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
            Path templateRoot = Path.of(System.getProperty("user.dir")).resolve(TEMPLATE_DIR);
            return Files.isDirectory(templateRoot) && Files.exists(templateRoot.resolve("login.html"));
        }
    }
}
