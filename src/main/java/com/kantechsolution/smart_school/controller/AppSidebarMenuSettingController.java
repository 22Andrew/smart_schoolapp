package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AppSidebarMenuSettingService;
import com.kantechsolution.smart_school.service.RoleSidebarMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AppSidebarMenuSettingController {

    private final AppSidebarMenuSettingService appSidebarMenuSettingService;
    private final RoleSidebarMenuService roleSidebarMenuService;

    @GetMapping({"/admin/sidemenu", "/admin/sidemenu/", "/admin/sidemenu/index"})
    public String page() {
        return "sidemenu";
    }

    @GetMapping("/api/sidebar-menu-settings")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getSettings(Authentication authentication) {
        Map<String, Object> settings = appSidebarMenuSettingService.getSettings();
        return ResponseEntity.ok(roleSidebarMenuService.filterForRole(settings, authentication));
    }

    @PutMapping("/api/sidebar-menu-settings")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveSettings(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<String> menuList = castSlugList(payload.get("menuList"));
            List<String> selectedMenus = castSlugList(payload.get("selectedMenus"));
            Map<String, List<String>> submenus = castSubMenuMap(payload.get("submenus"));
            Map<String, Object> saved = appSidebarMenuSettingService.saveSettings(menuList, selectedMenus, submenus);
            response.put("success", true);
            response.put("message", "Sidebar menu updated successfully");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> castSlugList(Object value) {
        if (value == null) {
            return List.of();
        }
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        throw new IllegalArgumentException("Invalid sidebar menu payload");
    }

    @SuppressWarnings("unchecked")
    private Map<String, List<String>> castSubMenuMap(Object value) {
        if (value == null) {
            return Map.of();
        }
        if (!(value instanceof Map<?, ?> rawMap)) {
            throw new IllegalArgumentException("Invalid submenu payload");
        }
        Map<String, List<String>> result = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
            String parentSlug = String.valueOf(entry.getKey());
            Object listValue = entry.getValue();
            if (listValue instanceof List<?> list) {
                result.put(parentSlug, list.stream().map(String::valueOf).toList());
            } else {
                result.put(parentSlug, List.of());
            }
        }
        return result;
    }
}
