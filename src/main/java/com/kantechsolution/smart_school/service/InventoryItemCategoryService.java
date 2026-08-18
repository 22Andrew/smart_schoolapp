package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.InventoryItemCategory;
import com.kantechsolution.smart_school.repository.InventoryItemCategoryRepository;
import com.kantechsolution.smart_school.repository.InventoryItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class InventoryItemCategoryService {

    private final InventoryItemCategoryRepository categoryRepository;
    private final InventoryItemRepository itemRepository;

    public InventoryItemCategoryService(
            InventoryItemCategoryRepository categoryRepository,
            InventoryItemRepository itemRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listCategories() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (InventoryItemCategory category : categoryRepository.findAllByOrderByNameAsc()) {
            rows.add(toMap(category));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> createCategory(Map<String, Object> payload) {
        InventoryItemCategory category = applyPayload(new InventoryItemCategory(), payload, null);
        category.setIsActive(true);
        return toMap(categoryRepository.save(category));
    }

    @Transactional
    public Map<String, Object> updateCategory(Long id, Map<String, Object> payload) {
        InventoryItemCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item category not found"));
        category = applyPayload(category, payload, id);
        return toMap(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        InventoryItemCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item category not found"));
        if (itemRepository.existsByCategory_Id(id)) {
            throw new IllegalArgumentException("This category is used by inventory items and cannot be deleted");
        }
        categoryRepository.delete(category);
    }

    private InventoryItemCategory applyPayload(InventoryItemCategory category, Map<String, Object> payload, Long currentId) {
        String name = text(payload.get("name"));
        if (name.isBlank()) {
            throw new IllegalArgumentException("Item Category is required");
        }
        boolean duplicate = currentId == null
                ? categoryRepository.findByNameIgnoreCase(name).isPresent()
                : categoryRepository.existsByNameIgnoreCaseAndIdNot(name, currentId);
        if (duplicate) {
            throw new IllegalArgumentException("This item category already exists");
        }
        category.setName(name);
        category.setDescription(blankToNull(text(payload.get("description"))));
        return category;
    }

    private Map<String, Object> toMap(InventoryItemCategory category) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", category.getId());
        map.put("name", category.getName());
        map.put("description", category.getDescription() == null ? "" : category.getDescription());
        return map;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
