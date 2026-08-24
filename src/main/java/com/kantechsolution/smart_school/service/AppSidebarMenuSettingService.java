package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppSidebarMenuItem;
import com.kantechsolution.smart_school.model.AppSidebarSubMenuItem;
import com.kantechsolution.smart_school.repository.AppSidebarMenuItemRepository;
import com.kantechsolution.smart_school.repository.AppSidebarSubMenuItemRepository;
import com.kantechsolution.smart_school.service.SidebarMenuCatalogLoader.CatalogSubMenu;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Order(46)
public class AppSidebarMenuSettingService implements ApplicationRunner {

    private static final String[][] ALL_MENUS = {
            {"front-office", "Front Office"},
            {"student-information", "Student Information"},
            {"fees-collection", "Fees Collection"},
            {"online-course", "Online Course"},
            {"behaviour-records", "Behaviour Records"},
            {"multi-branch", "Multi Branch"},
            {"gmeet-live-classes", "Gmeet Live Classes"},
            {"zoom-live-classes", "Zoom Live Classes"},
            {"income", "Income"},
            {"expenses", "Expenses"},
            {"qr-code-attendance", "QR Code Attendance"},
            {"cbse-examination", "CBSE Examination"},
            {"examinations", "Examinations"},
            {"attendance", "Attendance"},
            {"online-examinations", "Online Examinations"},
            {"academics", "Academics"},
            {"annual-calendar", "Annual Calendar"},
            {"lesson-plan", "Lesson Plan"},
            {"human-resource", "Human Resource"},
            {"communicate", "Communicate"},
            {"download-center", "Download Center"},
            {"homework", "Homework"},
            {"library", "Library"},
            {"inventory", "Inventory"},
            {"student-cv", "Student CV"},
            {"transport", "Transport"},
            {"hostel", "Hostel"},
            {"certificate", "Certificate"},
            {"front-cms", "Front CMS"},
            {"alumni", "Alumni"},
            {"reports", "Reports"},
            {"system-setting", "System Setting"},
            {"quick-fees", "Quick Fees"},
            {"thermal-print", "Thermal Print"},
            {"whatsapp-messaging", "Whatsapp Messaging"}
    };

    private static final String[] DEFAULT_SELECTED_ORDER = {
            "front-office", "student-information", "fees-collection", "online-course",
            "behaviour-records", "multi-branch", "gmeet-live-classes", "zoom-live-classes", "income",
            "expenses", "qr-code-attendance", "cbse-examination", "examinations", "attendance",
            "online-examinations", "academics", "annual-calendar", "lesson-plan", "human-resource",
            "communicate", "download-center", "homework", "library", "inventory", "student-cv",
            "transport", "hostel", "certificate", "front-cms", "alumni", "reports", "system-setting"
    };

    private static final String[] DEFAULT_MENU_LIST_ORDER = {
            "quick-fees", "thermal-print", "whatsapp-messaging"
    };

    private final AppSidebarMenuItemRepository repository;
    private final AppSidebarSubMenuItemRepository subMenuRepository;
    private final SidebarMenuCatalogLoader catalogLoader;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        syncMenus();
        syncSubMenus();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("menuList", toSlugNameList(false));
        map.put("selectedMenus", toSlugNameList(true));
        map.put("submenus", buildSubMenuResponse());
        return map;
    }

    @Transactional
    public Map<String, Object> saveSettings(List<String> menuListSlugs,
                                            List<String> selectedMenuSlugs,
                                            Map<String, List<String>> subMenuSelections) {
        if (menuListSlugs == null) {
            menuListSlugs = List.of();
        }
        if (selectedMenuSlugs == null) {
            selectedMenuSlugs = List.of();
        }
        if (subMenuSelections == null) {
            subMenuSelections = Map.of();
        }

        Map<String, AppSidebarMenuItem> bySlug = new LinkedHashMap<>();
        repository.findAll().forEach(item -> bySlug.put(item.getSlug(), item));

        for (String slug : menuListSlugs) {
            if (slug != null && !slug.isBlank() && !bySlug.containsKey(slug.trim())) {
                throw new IllegalArgumentException("Unknown sidebar menu: " + slug);
            }
        }
        for (String slug : selectedMenuSlugs) {
            if (slug != null && !slug.isBlank() && !bySlug.containsKey(slug.trim())) {
                throw new IllegalArgumentException("Unknown sidebar menu: " + slug);
            }
        }

        applyOrder(selectedMenuSlugs, true, bySlug);
        applyOrder(menuListSlugs, false, bySlug);
        repository.saveAll(bySlug.values());
        saveSubMenuSelections(subMenuSelections);
        return getSettings();
    }

    private void saveSubMenuSelections(Map<String, List<String>> subMenuSelections) {
        Map<String, Map<String, AppSidebarSubMenuItem>> byParent = indexSubMenusByParent();

        for (Map.Entry<String, List<String>> entry : subMenuSelections.entrySet()) {
            String parentSlug = entry.getKey();
            if (parentSlug == null || parentSlug.isBlank()) {
                continue;
            }
            Map<String, AppSidebarSubMenuItem> parentItems = byParent.get(parentSlug.trim());
            if (parentItems == null) {
                continue;
            }

            List<String> orderedSlugs = entry.getValue() != null ? entry.getValue() : List.of();
            Set<String> selectedSlugs = new LinkedHashSet<>();
            for (String slug : orderedSlugs) {
                if (slug != null && !slug.isBlank()) {
                    selectedSlugs.add(slug.trim());
                }
            }

            for (AppSidebarSubMenuItem item : parentItems.values()) {
                item.setSelectedInSidebar(false);
            }

            int order = 1;
            for (String slug : orderedSlugs) {
                if (slug == null || slug.isBlank()) {
                    continue;
                }
                AppSidebarSubMenuItem item = parentItems.get(slug.trim());
                if (item == null) {
                    throw new IllegalArgumentException("Unknown submenu: " + parentSlug + "/" + slug);
                }
                item.setSelectedInSidebar(true);
                item.setSortOrder(order++);
            }

            int hiddenOrder = order;
            for (AppSidebarSubMenuItem item : parentItems.values()) {
                if (!Boolean.TRUE.equals(item.getSelectedInSidebar())) {
                    item.setSortOrder(hiddenOrder++);
                }
            }
        }

        subMenuRepository.saveAll(byParent.values().stream().flatMap(map -> map.values().stream()).toList());
    }

    private Map<String, Map<String, AppSidebarSubMenuItem>> indexSubMenusByParent() {
        Map<String, Map<String, AppSidebarSubMenuItem>> byParent = new LinkedHashMap<>();
        for (AppSidebarSubMenuItem item : subMenuRepository.findAllByOrderByParentMenuSlugAscSortOrderAscNameAsc()) {
            byParent.computeIfAbsent(item.getParentMenuSlug(), key -> new LinkedHashMap<>())
                    .put(item.getSlug(), item);
        }
        return byParent;
    }

    private Map<String, List<Map<String, Object>>> buildSubMenuResponse() {
        Map<String, List<Map<String, Object>>> response = new LinkedHashMap<>();
        for (AppSidebarSubMenuItem item : subMenuRepository.findAllByOrderByParentMenuSlugAscSortOrderAscNameAsc()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("slug", item.getSlug());
            row.put("name", item.getName());
            row.put("href", item.getHref());
            row.put("selected", Boolean.TRUE.equals(item.getSelectedInSidebar()));
            row.put("sortOrder", item.getSortOrder());
            response.computeIfAbsent(item.getParentMenuSlug(), key -> new ArrayList<>()).add(row);
        }
        return response;
    }

    private void applyOrder(List<String> slugs, boolean selected, Map<String, AppSidebarMenuItem> bySlug) {
        for (int i = 0; i < slugs.size(); i++) {
            String slug = slugs.get(i);
            if (slug == null || slug.isBlank()) {
                continue;
            }
            AppSidebarMenuItem item = bySlug.get(slug.trim());
            if (item == null) {
                throw new IllegalArgumentException("Unknown sidebar menu: " + slug);
            }
            item.setSelectedInSidebar(selected);
            item.setSortOrder(i + 1);
        }
    }

    private List<Map<String, Object>> toSlugNameList(boolean selected) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (AppSidebarMenuItem item : repository.findBySelectedInSidebarOrderBySortOrderAscNameAsc(selected)) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("slug", item.getSlug());
            row.put("name", item.getName());
            row.put("sortOrder", item.getSortOrder());
            rows.add(row);
        }
        return rows;
    }

    private void syncMenus() {
        Map<String, AppSidebarMenuItem> existingBySlug = new LinkedHashMap<>();
        repository.findAll().forEach(item -> existingBySlug.putIfAbsent(item.getSlug(), item));

        Map<String, String> namesBySlug = new LinkedHashMap<>();
        for (String[] row : ALL_MENUS) {
            namesBySlug.put(row[0], row[1]);
        }

        Set<String> canonicalSlugs = namesBySlug.keySet();

        if (repository.count() == 0) {
            seedDefaults(namesBySlug);
        } else {
            for (Map.Entry<String, String> entry : namesBySlug.entrySet()) {
                String slug = entry.getKey();
                AppSidebarMenuItem item = existingBySlug.get(slug);
                if (item == null) {
                    item = new AppSidebarMenuItem();
                    item.setSlug(slug);
                    item.setName(entry.getValue());
                    item.setSelectedInSidebar(isDefaultSelected(slug));
                    item.setSortOrder(defaultSortOrder(slug));
                    item.setIsActive(true);
                    repository.save(item);
                } else {
                    item.setName(entry.getValue());
                    if (item.getSelectedInSidebar() == null) {
                        item.setSelectedInSidebar(isDefaultSelected(slug));
                    }
                    if (item.getSortOrder() == null || item.getSortOrder() == 0) {
                        item.setSortOrder(defaultSortOrder(slug));
                    }
                    repository.save(item);
                }
            }

            existingBySlug.values().stream()
                    .filter(item -> !canonicalSlugs.contains(item.getSlug()))
                    .forEach(item -> repository.deleteById(item.getId()));
        }
    }

    private void syncSubMenus() {
        Map<String, List<CatalogSubMenu>> catalog = catalogLoader.loadCatalog();
        Map<String, Map<String, AppSidebarSubMenuItem>> existingByParent = indexSubMenusByParent();
        Set<String> canonicalParents = catalog.keySet();

        for (Map.Entry<String, List<CatalogSubMenu>> entry : catalog.entrySet()) {
            String parentSlug = entry.getKey();
            List<CatalogSubMenu> definitions = entry.getValue();
            Map<String, AppSidebarSubMenuItem> existingForParent =
                    existingByParent.computeIfAbsent(parentSlug, key -> new LinkedHashMap<>());
            Set<String> usedSlugs = new HashSet<>();

            for (int i = 0; i < definitions.size(); i++) {
                CatalogSubMenu definition = definitions.get(i);
                String slug = uniqueSlug(definition.slug(), usedSlugs);
                usedSlugs.add(slug);

                AppSidebarSubMenuItem item = existingForParent.get(slug);
                if (item == null) {
                    item = AppSidebarSubMenuItem.builder()
                            .parentMenuSlug(parentSlug)
                            .slug(slug)
                            .name(definition.name())
                            .href(definition.href())
                            .selectedInSidebar(true)
                            .sortOrder(i + 1)
                            .build();
                    item.setIsActive(true);
                    subMenuRepository.save(item);
                    existingForParent.put(slug, item);
                } else {
                    item.setName(definition.name());
                    item.setHref(definition.href());
                    if (item.getSelectedInSidebar() == null) {
                        item.setSelectedInSidebar(true);
                    }
                    item.setSortOrder(i + 1);
                    subMenuRepository.save(item);
                }
            }
        }

        subMenuRepository.deleteByParentMenuSlugNotIn(canonicalParents);
    }

    private String uniqueSlug(String baseSlug, Set<String> usedSlugs) {
        String slug = baseSlug == null || baseSlug.isBlank() ? "item" : baseSlug.trim().toLowerCase(Locale.ROOT);
        if (!usedSlugs.contains(slug)) {
            return slug;
        }
        int suffix = 2;
        while (usedSlugs.contains(slug + "-" + suffix)) {
            suffix++;
        }
        return slug + "-" + suffix;
    }

    private void seedDefaults(Map<String, String> namesBySlug) {
        int order = 1;
        for (String slug : DEFAULT_SELECTED_ORDER) {
            AppSidebarMenuItem item = new AppSidebarMenuItem();
            item.setSlug(slug);
            item.setName(namesBySlug.get(slug));
            item.setSelectedInSidebar(true);
            item.setSortOrder(order++);
            item.setIsActive(true);
            repository.save(item);
        }
        order = 1;
        for (String slug : DEFAULT_MENU_LIST_ORDER) {
            AppSidebarMenuItem item = new AppSidebarMenuItem();
            item.setSlug(slug);
            item.setName(namesBySlug.get(slug));
            item.setSelectedInSidebar(false);
            item.setSortOrder(order++);
            item.setIsActive(true);
            repository.save(item);
        }
    }

    private boolean isDefaultSelected(String slug) {
        for (String selectedSlug : DEFAULT_SELECTED_ORDER) {
            if (selectedSlug.equals(slug)) {
                return true;
            }
        }
        return false;
    }

    private int defaultSortOrder(String slug) {
        for (int i = 0; i < DEFAULT_SELECTED_ORDER.length; i++) {
            if (DEFAULT_SELECTED_ORDER[i].equals(slug)) {
                return i + 1;
            }
        }
        for (int i = 0; i < DEFAULT_MENU_LIST_ORDER.length; i++) {
            if (DEFAULT_MENU_LIST_ORDER[i].equals(slug)) {
                return i + 1;
            }
        }
        return 999;
    }
}
