package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppRole;
import com.kantechsolution.smart_school.repository.AppRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Order(34)
public class AppRoleService implements ApplicationRunner {

    static final String TYPE_SYSTEM = "System";
    static final String TYPE_CUSTOM = "Custom";
    static final String SUPER_ADMIN = "Super Admin";

    private static final List<String> SYSTEM_ROLES = List.of(
            "Admin",
            "Teacher",
            "Accountant",
            "Librarian",
            "Receptionist",
            SUPER_ADMIN
    );

    private final AppRoleRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (String name : SYSTEM_ROLES) {
            if (repository.findByNameIgnoreCase(name).isEmpty()) {
                AppRole role = AppRole.builder()
                        .name(name)
                        .roleType(TYPE_SYSTEM)
                        .build();
                role.setIsActive(true);
                repository.save(role);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAll() {
        return repository.findAllByOrderByIdAsc().stream().map(this::toMap).toList();
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> payload) {
        String name = requiredName(payload.get("name"));
        if (repository.findByNameIgnoreCase(name).isPresent()) {
            throw new IllegalArgumentException("Role already exists");
        }
        AppRole role = AppRole.builder()
                .name(name)
                .roleType(TYPE_CUSTOM)
                .build();
        role.setIsActive(true);
        return toMap(repository.save(role));
    }

    @Transactional
    public Map<String, Object> update(Long id, Map<String, Object> payload) {
        AppRole role = requireRole(id);
        if (isSuperAdmin(role)) {
            throw new IllegalArgumentException("Super Admin cannot be edited");
        }
        String name = requiredName(payload.get("name"));
        if (repository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new IllegalArgumentException("Role already exists");
        }
        role.setName(name);
        return toMap(repository.save(role));
    }

    @Transactional
    public void delete(Long id) {
        AppRole role = requireRole(id);
        if (TYPE_SYSTEM.equals(role.getRoleType())) {
            throw new IllegalArgumentException("System roles cannot be deleted");
        }
        repository.deleteById(id);
    }

    private AppRole requireRole(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Role not found"));
    }

    private Map<String, Object> toMap(AppRole role) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", role.getId());
        map.put("name", role.getName());
        map.put("roleType", role.getRoleType());
        map.put("system", TYPE_SYSTEM.equals(role.getRoleType()));
        map.put("superAdmin", isSuperAdmin(role));
        return map;
    }

    private static boolean isSuperAdmin(AppRole role) {
        return SUPER_ADMIN.equalsIgnoreCase(role.getName());
    }

    private static String requiredName(Object value) {
        String name = value == null ? "" : value.toString().trim();
        if (name.isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        return name;
    }
}
