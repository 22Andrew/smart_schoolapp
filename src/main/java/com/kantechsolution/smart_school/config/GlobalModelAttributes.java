package com.kantechsolution.smart_school.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalModelAttributes {

    @Value("${app.version}")
    private String appVersion;

    @ModelAttribute("appVersion")
    public String appVersion() {
        return appVersion;
    }
}
