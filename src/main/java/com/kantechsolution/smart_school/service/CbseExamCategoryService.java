package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.CbseExamCategory;
import com.kantechsolution.smart_school.repository.CbseExamCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CbseExamCategoryService implements ApplicationRunner {

    private final CbseExamCategoryRepository cbseExamCategoryRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (cbseExamCategoryRepository.count() > 0) {
            return;
        }
        seedCategories();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllCategories() {
        return cbseExamCategoryRepository.findAllByOrderByCategoryNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> getCategoryNames() {
        return cbseExamCategoryRepository.findAllByOrderByCategoryNameAsc().stream()
                .map(CbseExamCategory::getCategoryName)
                .toList();
    }

    @Transactional
    public Map<String, Object> createCategory(String categoryName) {
        String trimmed = validateName(categoryName);
        if (cbseExamCategoryRepository.existsByCategoryNameIgnoreCase(trimmed)) {
            throw new IllegalArgumentException("Category already exists");
        }
        CbseExamCategory saved = cbseExamCategoryRepository.save(
                CbseExamCategory.builder().categoryName(trimmed).build());
        return toResponse(saved);
    }

    @Transactional
    public Map<String, Object> updateCategory(Long id, String categoryName) {
        String trimmed = validateName(categoryName);
        CbseExamCategory existing = cbseExamCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
        if (cbseExamCategoryRepository.existsByCategoryNameIgnoreCaseAndIdNot(trimmed, id)) {
            throw new IllegalArgumentException("Category already exists");
        }
        existing.setCategoryName(trimmed);
        return toResponse(cbseExamCategoryRepository.save(existing));
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!cbseExamCategoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found with ID: " + id);
        }
        cbseExamCategoryRepository.deleteById(id);
    }

    private void seedCategories() {
        List.of("Main Subjects", "Internal Assessment").forEach(name ->
                cbseExamCategoryRepository.save(CbseExamCategory.builder().categoryName(name).build()));
    }

    private String validateName(String categoryName) {
        if (categoryName == null || categoryName.trim().isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }
        return categoryName.trim();
    }

    private Map<String, Object> toResponse(CbseExamCategory category) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", category.getId());
        map.put("categoryName", category.getCategoryName());
        return map;
    }
}
