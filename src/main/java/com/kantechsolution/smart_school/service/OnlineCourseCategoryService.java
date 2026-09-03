package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.OnlineCourseCategory;
import com.kantechsolution.smart_school.repository.OnlineCourseCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OnlineCourseCategoryService {

    private static final String[] DEFAULTS = {
            "Personal Development",
            "Health & Fitness Courses",
            "Network & Security Course",
            "Lifestyle course",
            "UPGRADE SKILL",
            "Business Marketing"
    };

    @Autowired
    private OnlineCourseCategoryRepository categoryRepository;

    @Transactional
    public List<Map<String, Object>> getAll() {
        List<OnlineCourseCategory> categories = categoryRepository.findAllByOrderByCategoryNameAsc();
        if (categories.isEmpty()) {
            categories = seedDefaults();
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (OnlineCourseCategory category : categories) {
            rows.add(toRow(category));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        String name = text(body.get("categoryName"));
        if (name.isBlank()) {
            throw new IllegalArgumentException("Category Name is required");
        }
        if (categoryRepository.existsByCategoryNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Category already exists");
        }
        OnlineCourseCategory category = new OnlineCourseCategory();
        category.setCategoryName(name);
        return toRow(categoryRepository.save(category));
    }

    @Transactional
    public Map<String, Object> update(Long id, Map<String, Object> body) {
        OnlineCourseCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        String name = text(body.get("categoryName"));
        if (name.isBlank()) {
            throw new IllegalArgumentException("Category Name is required");
        }
        categoryRepository.findByCategoryNameIgnoreCase(name).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Category already exists");
            }
        });
        category.setCategoryName(name);
        return toRow(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Category not found");
        }
        categoryRepository.deleteById(id);
    }

    private List<OnlineCourseCategory> seedDefaults() {
        List<OnlineCourseCategory> defaults = new ArrayList<>();
        for (String name : DEFAULTS) {
            OnlineCourseCategory category = new OnlineCourseCategory();
            category.setCategoryName(name);
            defaults.add(category);
        }
        return categoryRepository.saveAll(defaults);
    }

    private Map<String, Object> toRow(OnlineCourseCategory category) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", category.getId());
        row.put("categoryName", category.getCategoryName());
        return row;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
