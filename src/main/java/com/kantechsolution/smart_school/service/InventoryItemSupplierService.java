package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.InventoryItemSupplier;
import com.kantechsolution.smart_school.repository.InventoryItemStockRepository;
import com.kantechsolution.smart_school.repository.InventoryItemSupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class InventoryItemSupplierService {

    private final InventoryItemSupplierRepository supplierRepository;
    private final InventoryItemStockRepository stockRepository;

    public InventoryItemSupplierService(
            InventoryItemSupplierRepository supplierRepository,
            InventoryItemStockRepository stockRepository
    ) {
        this.supplierRepository = supplierRepository;
        this.stockRepository = stockRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listSuppliers() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (InventoryItemSupplier supplier : supplierRepository.findAllByOrderByNameAsc()) {
            rows.add(toMap(supplier));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> createSupplier(Map<String, Object> payload) {
        InventoryItemSupplier supplier = applyPayload(new InventoryItemSupplier(), payload, null);
        supplier.setIsActive(true);
        return toMap(supplierRepository.save(supplier));
    }

    @Transactional
    public Map<String, Object> updateSupplier(Long id, Map<String, Object> payload) {
        InventoryItemSupplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item supplier not found"));
        supplier = applyPayload(supplier, payload, id);
        return toMap(supplierRepository.save(supplier));
    }

    @Transactional
    public void deleteSupplier(Long id) {
        InventoryItemSupplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item supplier not found"));
        if (stockRepository.existsBySupplier_Id(id)) {
            throw new IllegalArgumentException("This supplier is used by item stock and cannot be deleted");
        }
        supplierRepository.delete(supplier);
    }

    private InventoryItemSupplier applyPayload(InventoryItemSupplier supplier, Map<String, Object> payload, Long currentId) {
        String name = text(payload.get("name"));
        if (name.isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        boolean duplicate = currentId == null
                ? supplierRepository.findByNameIgnoreCase(name).isPresent()
                : supplierRepository.existsByNameIgnoreCaseAndIdNot(name, currentId);
        if (duplicate) {
            throw new IllegalArgumentException("This item supplier already exists");
        }
        supplier.setName(name);
        supplier.setPhone(blankToNull(text(payload.get("phone"))));
        supplier.setEmail(blankToNull(text(payload.get("email"))));
        supplier.setAddress(blankToNull(text(payload.get("address"))));
        supplier.setContactPersonName(blankToNull(text(payload.get("contactPersonName"))));
        supplier.setContactPersonPhone(blankToNull(text(payload.get("contactPersonPhone"))));
        supplier.setContactPersonEmail(blankToNull(text(payload.get("contactPersonEmail"))));
        supplier.setDescription(blankToNull(text(payload.get("description"))));
        return supplier;
    }

    private Map<String, Object> toMap(InventoryItemSupplier supplier) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", supplier.getId());
        map.put("name", supplier.getName());
        map.put("phone", value(supplier.getPhone()));
        map.put("email", value(supplier.getEmail()));
        map.put("address", value(supplier.getAddress()));
        map.put("contactPersonName", value(supplier.getContactPersonName()));
        map.put("contactPersonPhone", value(supplier.getContactPersonPhone()));
        map.put("contactPersonEmail", value(supplier.getContactPersonEmail()));
        map.put("description", value(supplier.getDescription()));
        return map;
    }

    private String value(String text) {
        return text == null ? "" : text;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
