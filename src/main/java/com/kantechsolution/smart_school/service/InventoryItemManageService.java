package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.InventoryItem;
import com.kantechsolution.smart_school.model.InventoryItemCategory;
import com.kantechsolution.smart_school.repository.InventoryIssueItemRepository;
import com.kantechsolution.smart_school.repository.InventoryItemCategoryRepository;
import com.kantechsolution.smart_school.repository.InventoryItemRepository;
import com.kantechsolution.smart_school.repository.InventoryItemStockRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Order(14)
public class InventoryItemManageService implements ApplicationRunner {

    private final InventoryItemRepository itemRepository;
    private final InventoryItemCategoryRepository categoryRepository;
    private final InventoryIssueItemRepository issueRepository;
    private final InventoryItemStockRepository stockRepository;

    public InventoryItemManageService(
            InventoryItemRepository itemRepository,
            InventoryItemCategoryRepository categoryRepository,
            InventoryIssueItemRepository issueRepository,
            InventoryItemStockRepository stockRepository
    ) {
        this.itemRepository = itemRepository;
        this.categoryRepository = categoryRepository;
        this.issueRepository = issueRepository;
        this.stockRepository = stockRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (InventoryItem item : itemRepository.findAll()) {
            if (item.getUnit() == null || item.getUnit().isBlank()) {
                item.setUnit("Piece");
                itemRepository.save(item);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listItems() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (InventoryItem item : itemRepository.findAllWithCategory()) {
            rows.add(toMap(item));
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listCategories() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (InventoryItemCategory category : categoryRepository.findAllByOrderByNameAsc()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", category.getId());
            row.put("name", category.getName());
            row.put("description", category.getDescription() == null ? "" : category.getDescription());
            rows.add(row);
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> createItem(Map<String, Object> payload) {
        InventoryItem item = applyPayload(new InventoryItem(), payload, null);
        item.setAvailableQuantity(0);
        item.setIsActive(true);
        item = itemRepository.save(item);
        return toMap(itemRepository.findDetailById(item.getId()).orElse(item));
    }

    @Transactional
    public Map<String, Object> updateItem(Long id, Map<String, Object> payload) {
        InventoryItem item = itemRepository.findDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        item = applyPayload(item, payload, id);
        item = itemRepository.save(item);
        return toMap(itemRepository.findDetailById(item.getId()).orElse(item));
    }

    @Transactional
    public void deleteItem(Long id) {
        InventoryItem item = itemRepository.findDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        if (issueRepository.existsByItem_Id(id) || stockRepository.existsByItem_Id(id)) {
            throw new IllegalArgumentException("This item is used in stock or issue records and cannot be deleted");
        }
        itemRepository.delete(item);
    }

    private InventoryItem applyPayload(InventoryItem item, Map<String, Object> payload, Long currentId) {
        String name = text(payload.get("name"));
        if (name.isBlank()) {
            throw new IllegalArgumentException("Item is required");
        }
        Long categoryId = parseLong(payload.get("categoryId"), "Item Category");
        if (categoryId == null) {
            throw new IllegalArgumentException("Item Category is required");
        }
        String unit = text(payload.get("unit"));
        if (unit.isBlank()) {
            throw new IllegalArgumentException("Unit is required");
        }
        InventoryItemCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Item Category not found"));
        boolean duplicate = currentId == null
                ? itemRepository.existsByNameIgnoreCaseAndCategory_Id(name, categoryId)
                : itemRepository.existsByNameIgnoreCaseAndCategory_IdAndIdNot(name, categoryId, currentId);
        if (duplicate) {
            throw new IllegalArgumentException("This item already exists in the selected category");
        }
        item.setName(name);
        item.setCategory(category);
        item.setUnit(unit);
        item.setDescription(blankToNull(text(payload.get("description"))));
        return item;
    }

    private Map<String, Object> toMap(InventoryItem item) {
        InventoryItemCategory category = item.getCategory();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId());
        map.put("name", item.getName());
        map.put("categoryId", category == null ? null : category.getId());
        map.put("categoryName", category == null ? "" : category.getName());
        map.put("unit", item.getUnit() == null ? "" : item.getUnit());
        map.put("description", item.getDescription() == null ? "" : item.getDescription());
        map.put("availableQuantity", item.getAvailableQuantity() == null ? 0 : item.getAvailableQuantity());
        return map;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private Long parseLong(Object value, String label) {
        String raw = text(value);
        if (raw.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(raw);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(label + " is invalid");
        }
    }
}
