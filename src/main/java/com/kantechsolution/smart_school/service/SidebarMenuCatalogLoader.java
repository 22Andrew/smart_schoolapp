package com.kantechsolution.smart_school.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class SidebarMenuCatalogLoader {

    private static final Pattern MENU_PATTERN = Pattern.compile("data-submenu=\"([^\"]+)\"");
    private static final Pattern SUBMENU_PATTERN = Pattern.compile(
            "<a\\s+[^>]*href=\"([^\"]*)\"[^>]*class=\"submenu-item[^\"]*\"[^>]*>([^<]+)</a>"
                    + "|<a\\s+[^>]*class=\"submenu-item[^\"]*\"[^>]*href=\"([^\"]*)\"[^>]*>([^<]+)</a>",
            Pattern.CASE_INSENSITIVE);

    public Map<String, List<CatalogSubMenu>> loadCatalog() {
        try {
            String html = StreamUtils.copyToString(
                    new ClassPathResource("templates/fragments/sidebar.html").getInputStream(),
                    StandardCharsets.UTF_8);
            return parseSidebarHtml(html);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load sidebar fragment for submenu catalog", e);
        }
    }

    Map<String, List<CatalogSubMenu>> parseSidebarHtml(String html) {
        Map<String, List<CatalogSubMenu>> catalog = new LinkedHashMap<>();
        String currentParent = null;

        for (String line : html.split("\\R")) {
            Matcher menuMatcher = MENU_PATTERN.matcher(line);
            if (menuMatcher.find()) {
                currentParent = menuMatcher.group(1);
                catalog.computeIfAbsent(currentParent, key -> new ArrayList<>());
                continue;
            }

            if (currentParent == null) {
                continue;
            }

            Matcher submenuMatcher = SUBMENU_PATTERN.matcher(line);
            if (submenuMatcher.find()) {
                String href = submenuMatcher.group(1) != null ? submenuMatcher.group(1) : submenuMatcher.group(3);
                String name = submenuMatcher.group(2) != null ? submenuMatcher.group(2) : submenuMatcher.group(4);
                String slug = slugify(name);
                catalog.get(currentParent).add(new CatalogSubMenu(slug, name.trim(), href.trim()));
            }
        }

        return catalog;
    }

    private String slugify(String value) {
        String slug = value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return slug.isBlank() ? "item" : slug;
    }

    public record CatalogSubMenu(String slug, String name, String href) {
    }
}
