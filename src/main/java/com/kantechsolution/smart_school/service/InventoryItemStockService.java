package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.InventoryItem;
import com.kantechsolution.smart_school.model.InventoryItemCategory;
import com.kantechsolution.smart_school.model.InventoryItemStock;
import com.kantechsolution.smart_school.model.InventoryItemStore;
import com.kantechsolution.smart_school.model.InventoryItemSupplier;
import com.kantechsolution.smart_school.repository.InventoryItemCategoryRepository;
import com.kantechsolution.smart_school.repository.InventoryItemRepository;
import com.kantechsolution.smart_school.repository.InventoryItemStockRepository;
import com.kantechsolution.smart_school.repository.InventoryItemStoreRepository;
import com.kantechsolution.smart_school.repository.InventoryItemSupplierRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@Order(13)
public class InventoryItemStockService implements ApplicationRunner {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter US = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final InventoryItemCategoryRepository categoryRepository;
    private final InventoryItemRepository itemRepository;
    private final InventoryItemSupplierRepository supplierRepository;
    private final InventoryItemStoreRepository storeRepository;
    private final InventoryItemStockRepository stockRepository;
    private final UploadStorage uploadStorage;

    public InventoryItemStockService(
            InventoryItemCategoryRepository categoryRepository,
            InventoryItemRepository itemRepository,
            InventoryItemSupplierRepository supplierRepository,
            InventoryItemStoreRepository storeRepository,
            InventoryItemStockRepository stockRepository,
            UploadStorage uploadStorage
    ) {
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
        this.supplierRepository = supplierRepository;
        this.storeRepository = storeRepository;
        this.stockRepository = stockRepository;
        this.uploadStorage = uploadStorage;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        ensureSupplier("Camlin Stationers", null, null, null, "Bruce Stark", null, null, null);
        ensureSupplier("David Furniture", null, null, null, "Peter", null, null, null);
        ensureSupplier("Jhon smith Supplier", null, null, null, null, null, null, null);
        ensureStore("Libraray Store", "LB2", null);
        ensureStore("Science Store", "SC2", null);
        ensureStore("Uniform Dress Store", "UND23", null);
        ensureStore("Furniture Store", "FS342", null);
        ensureStore(
                "Chemistry Equipment",
                "Ch201",
                "The basic idea about the proper and necessary chemistry lab apparatus should be cleared among the students."
        );
        ensureStore("Sports Store", "sp55", null);
        categoryRepository.findByNameIgnoreCase("Chemistry Lab Apparatus").ifPresent(category -> {
            if (!itemRepository.existsByNameIgnoreCaseAndCategory_Id("Lab Equipment", category.getId())) {
                InventoryItem item = InventoryItem.builder()
                        .name("Lab Equipment")
                        .category(category)
                        .unit("Piece")
                        .availableQuantity(10)
                        .build();
                item.setIsActive(true);
                itemRepository.save(item);
            }
        });
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listStock() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (InventoryItemStock stock : stockRepository.findAllWithDetails()) {
            rows.add(toMap(stock));
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStock(Long id) {
        return toMap(stockRepository.findDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item stock not found")));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> formOptions() {
        Map<String, Object> options = new LinkedHashMap<>();
        options.put("categories", listNamed(categoryRepository.findAllByOrderByNameAsc()));
        options.put("suppliers", listNamed(supplierRepository.findAllByOrderByNameAsc()));
        List<Map<String, Object>> stores = new ArrayList<>();
        for (InventoryItemStore store : storeRepository.findAllByOrderByNameAsc()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", store.getId());
            row.put("name", store.getName());
            row.put("code", store.getCode());
            row.put("label", formatStore(store));
            stores.add(row);
        }
        options.put("stores", stores);
        return options;
    }

    @Transactional
    public Map<String, Object> createStock(Map<String, String> payload, MultipartFile document) {
        InventoryItemStock stock = applyPayload(new InventoryItemStock(), payload);
        stock.setIsActive(true);
        applyDocument(stock, document, false);
        applyQuantityDelta(stock.getItem(), signedQuantity(stock), null);
        stock = stockRepository.save(stock);
        return toMap(stockRepository.findDetailById(stock.getId()).orElse(stock));
    }

    @Transactional
    public Map<String, Object> updateStock(Long id, Map<String, String> payload, MultipartFile document) {
        InventoryItemStock existing = stockRepository.findDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item stock not found"));
        Integer previousDelta = signedQuantity(existing);
        InventoryItem previousItem = existing.getItem();

        Long previousItemId = previousItem == null ? null : previousItem.getId();
        InventoryItemStock stock = applyPayload(existing, payload);
        applyDocument(stock, document, true);
        Long newItemId = stock.getItem() == null ? null : stock.getItem().getId();
        if (previousItemId != null && previousItemId.equals(newItemId)) {
            applyQuantityDelta(stock.getItem(), signedQuantity(stock), previousDelta);
        } else {
            applyQuantityDelta(stock.getItem(), signedQuantity(stock), null);
            applyQuantityDelta(previousItem, 0, previousDelta);
        }
        stock = stockRepository.save(stock);
        return toMap(stockRepository.findDetailById(stock.getId()).orElse(stock));
    }

    @Transactional
    public void deleteStock(Long id) {
        InventoryItemStock stock = stockRepository.findDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item stock not found"));
        applyQuantityDelta(stock.getItem(), 0, signedQuantity(stock));
        stockRepository.delete(stock);
    }

    private InventoryItemStock applyPayload(InventoryItemStock stock, Map<String, String> payload) {
        Long itemId = parseLong(payload.get("itemId"), "Item");
        if (itemId == null) {
            throw new IllegalArgumentException("Item is required");
        }
        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        Integer quantity = parseInteger(payload.get("quantity"), "Quantity");
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        BigDecimal purchasePrice = parseDecimal(payload.get("purchasePrice"), "Purchase Price");
        if (purchasePrice == null) {
            throw new IllegalArgumentException("Purchase Price is required");
        }
        LocalDate stockDate = parseDate(payload.get("date"));
        if (stockDate == null) {
            throw new IllegalArgumentException("Date is required");
        }

        String symbol = text(payload.get("quantitySymbol"));
        if (!"-".equals(symbol)) {
            symbol = "+";
        }

        Long supplierId = parseLong(payload.get("supplierId"), "Supplier");
        InventoryItemSupplier supplier = supplierId == null ? null : supplierRepository.findById(supplierId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
        Long storeId = parseLong(payload.get("storeId"), "Store");
        InventoryItemStore store = storeId == null ? null : storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));

        stock.setItem(item);
        stock.setSupplier(supplier);
        stock.setStore(store);
        stock.setQuantitySymbol(symbol);
        stock.setQuantity(quantity);
        stock.setPurchasePrice(purchasePrice);
        stock.setStockDate(stockDate);
        stock.setDescription(blankToNull(text(payload.get("description"))));
        return stock;
    }

    private void applyDocument(InventoryItemStock stock, MultipartFile document, boolean keepExisting) {
        if (document == null || document.isEmpty()) {
            if (!keepExisting) {
                stock.setDocumentPath(null);
                stock.setDocumentName(null);
            }
            return;
        }
        String originalName = document.getOriginalFilename() != null ? document.getOriginalFilename() : "document";
        String extension = "";
        if (originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        }
        try {
            Path uploadDir = uploadStorage.getInventoryDir();
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Path target = uploadDir.resolve(filename);
            Files.copy(document.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            stock.setDocumentPath("/uploads/inventory/" + filename);
            stock.setDocumentName(originalName);
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store document");
        }
    }

    private void applyQuantityDelta(InventoryItem item, Integer newDelta, Integer previousDelta) {
        if (item == null) {
            return;
        }
        int available = item.getAvailableQuantity() == null ? 0 : item.getAvailableQuantity();
        if (previousDelta != null) {
            available -= previousDelta;
        }
        if (newDelta != null) {
            available += newDelta;
        }
        item.setAvailableQuantity(Math.max(0, available));
        itemRepository.save(item);
    }

    private Integer signedQuantity(InventoryItemStock stock) {
        if (stock == null || stock.getQuantity() == null) {
            return 0;
        }
        return "-".equals(stock.getQuantitySymbol()) ? -stock.getQuantity() : stock.getQuantity();
    }

    private Map<String, Object> toMap(InventoryItemStock stock) {
        InventoryItem item = stock.getItem();
        InventoryItemCategory category = item == null ? null : item.getCategory();
        InventoryItemSupplier supplier = stock.getSupplier();
        InventoryItemStore store = stock.getStore();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", stock.getId());
        map.put("itemId", item == null ? null : item.getId());
        map.put("itemName", item == null ? "" : item.getName());
        map.put("categoryId", category == null ? null : category.getId());
        map.put("categoryName", category == null ? "" : category.getName());
        map.put("supplierId", supplier == null ? null : supplier.getId());
        map.put("supplierName", supplier == null ? "" : supplier.getName());
        map.put("storeId", store == null ? null : store.getId());
        map.put("storeName", store == null ? "" : formatStore(store));
        map.put("quantitySymbol", stock.getQuantitySymbol());
        map.put("quantity", stock.getQuantity());
        map.put("purchasePrice", stock.getPurchasePrice());
        map.put("date", stock.getStockDate() == null ? "" : stock.getStockDate().format(ISO));
        map.put("dateDisplay", formatUs(stock.getStockDate()));
        map.put("description", stock.getDescription() == null ? "" : stock.getDescription());
        map.put("documentPath", stock.getDocumentPath());
        map.put("documentName", stock.getDocumentName());
        return map;
    }

    private List<Map<String, Object>> listNamed(List<?> entities) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object entity : entities) {
            Map<String, Object> row = new LinkedHashMap<>();
            if (entity instanceof InventoryItemCategory category) {
                row.put("id", category.getId());
                row.put("name", category.getName());
            } else if (entity instanceof InventoryItemSupplier supplier) {
                row.put("id", supplier.getId());
                row.put("name", supplier.getName());
            }
            rows.add(row);
        }
        return rows;
    }

    private void ensureSupplier(
            String name,
            String phone,
            String email,
            String address,
            String contactPersonName,
            String contactPersonPhone,
            String contactPersonEmail,
            String description
    ) {
        supplierRepository.findByNameIgnoreCase(name).ifPresentOrElse(existing -> {
            boolean changed = false;
            changed |= fillIfBlank(existing.getPhone(), phone, existing::setPhone);
            changed |= fillIfBlank(existing.getEmail(), email, existing::setEmail);
            changed |= fillIfBlank(existing.getAddress(), address, existing::setAddress);
            changed |= fillIfBlank(existing.getContactPersonName(), contactPersonName, existing::setContactPersonName);
            changed |= fillIfBlank(existing.getContactPersonPhone(), contactPersonPhone, existing::setContactPersonPhone);
            changed |= fillIfBlank(existing.getContactPersonEmail(), contactPersonEmail, existing::setContactPersonEmail);
            changed |= fillIfBlank(existing.getDescription(), description, existing::setDescription);
            if (changed) {
                supplierRepository.save(existing);
            }
        }, () -> saveSupplier(name, phone, email, address, contactPersonName, contactPersonPhone, contactPersonEmail, description));
    }

    private boolean fillIfBlank(String current, String incoming, java.util.function.Consumer<String> setter) {
        if ((current == null || current.isBlank()) && incoming != null && !incoming.isBlank()) {
            setter.accept(incoming);
            return true;
        }
        return false;
    }

    private void saveSupplier(
            String name,
            String phone,
            String email,
            String address,
            String contactPersonName,
            String contactPersonPhone,
            String contactPersonEmail,
            String description
    ) {
        InventoryItemSupplier supplier = InventoryItemSupplier.builder()
                .name(name)
                .phone(phone)
                .email(email)
                .address(address)
                .contactPersonName(contactPersonName)
                .contactPersonPhone(contactPersonPhone)
                .contactPersonEmail(contactPersonEmail)
                .description(description)
                .build();
        supplier.setIsActive(true);
        supplierRepository.save(supplier);
    }

    private void ensureStore(String name, String code, String description) {
        storeRepository.findByNameIgnoreCase(name).ifPresentOrElse(existing -> {
            boolean changed = false;
            if ((existing.getCode() == null || existing.getCode().isBlank()) && code != null && !code.isBlank()) {
                existing.setCode(code);
                changed = true;
            }
            if ((existing.getDescription() == null || existing.getDescription().isBlank())
                    && description != null && !description.isBlank()) {
                existing.setDescription(description);
                changed = true;
            }
            if (changed) {
                storeRepository.save(existing);
            }
        }, () -> saveStore(name, code, description));
    }

    private void saveStore(String name, String code, String description) {
        InventoryItemStore store = InventoryItemStore.builder()
                .name(name)
                .code(code)
                .description(description)
                .build();
        store.setIsActive(true);
        storeRepository.save(store);
    }

    private String formatStore(InventoryItemStore store) {
        if (store.getCode() == null || store.getCode().isBlank()) {
            return store.getName();
        }
        return store.getName() + " (" + store.getCode() + ")";
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private Long parseLong(String value, String label) {
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

    private Integer parseInteger(String value, String label) {
        String raw = text(value);
        if (raw.isBlank()) {
            return null;
        }
        try {
            return Integer.parseInt(raw);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(label + " must be a number");
        }
    }

    private BigDecimal parseDecimal(String value, String label) {
        String raw = text(value);
        if (raw.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(raw);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(label + " must be a number");
        }
    }

    private LocalDate parseDate(String value) {
        String raw = text(value);
        if (raw.isBlank()) {
            return null;
        }
        try {
            if (raw.contains("-")) {
                return LocalDate.parse(raw, ISO);
            }
            return LocalDate.parse(raw, US);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Date must be a valid date");
        }
    }

    private String formatUs(LocalDate date) {
        return date == null ? "" : date.format(US);
    }
}
