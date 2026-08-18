package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.InventoryItemStore;
import com.kantechsolution.smart_school.repository.InventoryItemStockRepository;
import com.kantechsolution.smart_school.repository.InventoryItemStoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class InventoryItemStoreService {

    private final InventoryItemStoreRepository storeRepository;
    private final InventoryItemStockRepository stockRepository;

    public InventoryItemStoreService(
            InventoryItemStoreRepository storeRepository,
            InventoryItemStockRepository stockRepository
    ) {
        this.storeRepository = storeRepository;
        this.stockRepository = stockRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listStores() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (InventoryItemStore store : storeRepository.findAllByOrderByNameAsc()) {
            rows.add(toMap(store));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> createStore(Map<String, Object> payload) {
        InventoryItemStore store = applyPayload(new InventoryItemStore(), payload, null);
        store.setIsActive(true);
        return toMap(storeRepository.save(store));
    }

    @Transactional
    public Map<String, Object> updateStore(Long id, Map<String, Object> payload) {
        InventoryItemStore store = storeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item store not found"));
        store = applyPayload(store, payload, id);
        return toMap(storeRepository.save(store));
    }

    @Transactional
    public void deleteStore(Long id) {
        InventoryItemStore store = storeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item store not found"));
        if (stockRepository.existsByStore_Id(id)) {
            throw new IllegalArgumentException("This store is used by item stock and cannot be deleted");
        }
        storeRepository.delete(store);
    }

    private InventoryItemStore applyPayload(InventoryItemStore store, Map<String, Object> payload, Long currentId) {
        String name = text(payload.get("name"));
        if (name.isBlank()) {
            throw new IllegalArgumentException("Item Store Name is required");
        }
        boolean duplicate = currentId == null
                ? storeRepository.findByNameIgnoreCase(name).isPresent()
                : storeRepository.existsByNameIgnoreCaseAndIdNot(name, currentId);
        if (duplicate) {
            throw new IllegalArgumentException("This item store already exists");
        }
        store.setName(name);
        store.setCode(blankToNull(text(payload.get("code"))));
        store.setDescription(blankToNull(text(payload.get("description"))));
        return store;
    }

    private Map<String, Object> toMap(InventoryItemStore store) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", store.getId());
        map.put("name", store.getName());
        map.put("code", store.getCode() == null ? "" : store.getCode());
        map.put("description", store.getDescription() == null ? "" : store.getDescription());
        return map;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
