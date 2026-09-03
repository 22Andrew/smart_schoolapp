package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StudentCategory;
import com.kantechsolution.smart_school.repository.StudentCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for student category persistence
 */
@Service
public class StudentCategoryService {

    @Autowired
    private StudentCategoryRepository categoryRepository;

    public List<StudentCategory> getAllCategories() {
        return categoryRepository.findAllByOrderByIdAsc();
    }

    public Optional<StudentCategory> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    @Transactional
    public StudentCategory createCategory(String categoryName) {
        String trimmed = categoryName == null ? "" : categoryName.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }
        if (categoryRepository.existsByCategoryNameIgnoreCase(trimmed)) {
            throw new IllegalArgumentException("Category already exists");
        }
        return categoryRepository.save(new StudentCategory(trimmed));
    }

    @Transactional
    public StudentCategory updateCategory(Long id, String categoryName) {
        String trimmed = categoryName == null ? "" : categoryName.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }

        StudentCategory existing = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Optional<StudentCategory> duplicate = categoryRepository.findByCategoryNameIgnoreCase(trimmed);
        if (duplicate.isPresent() && !duplicate.get().getId().equals(id)) {
            throw new IllegalArgumentException("Category already exists");
        }

        existing.setCategoryName(trimmed);
        return categoryRepository.save(existing);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Category not found");
        }
        categoryRepository.deleteById(id);
    }
}
