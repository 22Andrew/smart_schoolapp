package com.kantechsolution.smart_school.service;

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationTemplateService {

    public String render(String template, Map<String, String> variables) {
        if (template == null || template.isBlank()) {
            return "";
        }
        String rendered = template;
        if (variables != null) {
            for (Map.Entry<String, String> entry : variables.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue() == null ? "" : entry.getValue();
                rendered = rendered.replace("{{" + key + "}}", value);
            }
        }
        return rendered.replaceAll("\\{\\{[^}]+}}", "");
    }
}
