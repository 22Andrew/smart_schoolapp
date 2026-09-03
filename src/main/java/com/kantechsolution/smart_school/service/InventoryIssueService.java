package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.InventoryIssueItem;
import com.kantechsolution.smart_school.model.InventoryItem;
import com.kantechsolution.smart_school.model.InventoryItemCategory;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.InventoryIssueItemRepository;
import com.kantechsolution.smart_school.repository.InventoryItemCategoryRepository;
import com.kantechsolution.smart_school.repository.InventoryItemRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Order(12)
public class InventoryIssueService implements ApplicationRunner {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter US = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final InventoryItemCategoryRepository categoryRepository;
    private final InventoryItemRepository itemRepository;
    private final InventoryIssueItemRepository issueRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;

    public InventoryIssueService(
            InventoryItemCategoryRepository categoryRepository,
            InventoryItemRepository itemRepository,
            InventoryIssueItemRepository issueRepository,
            StaffMemberRepository staffMemberRepository,
            StudentAdmissionRepository studentAdmissionRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
        this.issueRepository = issueRepository;
        this.staffMemberRepository = staffMemberRepository;
        this.studentAdmissionRepository = studentAdmissionRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (categoryRepository.count() > 0) {
            return;
        }
        InventoryItemCategory stationery = saveCategory("Books Stationery", null);
        InventoryItemCategory staffDress = saveCategory("Staff Dress", null);
        InventoryItemCategory furniture = saveCategory("Furniture", null);
        InventoryItemCategory sports = saveCategory("Sports", null);
        InventoryItemCategory lab = saveCategory("Chemistry Lab Apparatus", "Chemistry Lab Apparatus");
        saveItem("Notebooks", stationery, 80);
        saveItem("Uniform", staffDress, 40);
        saveItem("Class Board", furniture, 15);
        saveItem("Table chair", furniture, 25);
        saveItem("Cricket Bat", sports, 12);
        saveItem("Projectors", lab, 8);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listIssues() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (InventoryIssueItem issue : issueRepository.findAllWithDetails()) {
            rows.add(toIssueMap(issue));
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
            rows.add(row);
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listItems(Long categoryId) {
        List<InventoryItem> items = categoryId == null
                ? itemRepository.findAllWithCategory()
                : itemRepository.findByCategoryId(categoryId);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (InventoryItem item : items) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", item.getId());
            row.put("name", item.getName());
            row.put("categoryId", item.getCategory() == null ? null : item.getCategory().getId());
            row.put("categoryName", item.getCategory() == null ? "" : item.getCategory().getName());
            row.put("unit", item.getUnit() == null ? "" : item.getUnit());
            row.put("description", item.getDescription() == null ? "" : item.getDescription());
            row.put("availableQuantity", item.getAvailableQuantity() == null ? 0 : item.getAvailableQuantity());
            rows.add(row);
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> formOptions() {
        Map<String, Object> options = new LinkedHashMap<>();
        options.put("userTypes", List.of("Student", "Staff"));
        options.put("staff", staffOptions());
        options.put("students", studentOptions());
        options.put("categories", listCategories());
        return options;
    }

    @Transactional
    public Map<String, Object> createIssue(Map<String, Object> payload) {
        String userType = text(payload.get("userType"));
        if (userType.isBlank()) {
            throw new IllegalArgumentException("User Type is required");
        }
        Long issueToId = parseLong(payload.get("issueToId"), "Issue To");
        if (issueToId == null) {
            throw new IllegalArgumentException("Issue To is required");
        }
        Long issuedById = parseLong(payload.get("issuedById"), "Issue By");
        if (issuedById == null) {
            throw new IllegalArgumentException("Issue By is required");
        }
        LocalDate issueDate = parseDate(payload.get("issueDate"), true);
        if (issueDate == null) {
            throw new IllegalArgumentException("Issue Date is required");
        }
        Long itemId = parseLong(payload.get("itemId"), "Item");
        if (itemId == null) {
            throw new IllegalArgumentException("Item is required");
        }
        Integer quantity = parseInteger(payload.get("quantity"), "Quantity");
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        if (item.getAvailableQuantity() != null && item.getAvailableQuantity() < quantity) {
            throw new IllegalArgumentException("Not enough quantity available");
        }

        StaffMember issuedBy = staffMemberRepository.findById(issuedById)
                .orElseThrow(() -> new IllegalArgumentException("Issue By staff not found"));

        Recipient recipient = resolveRecipient(userType, issueToId);
        LocalDate returnDate = parseDate(payload.get("returnDate"), false);

        InventoryIssueItem issue = InventoryIssueItem.builder()
                .item(item)
                .userType(userType)
                .issueToId(recipient.id)
                .issueToName(recipient.name)
                .issueToCode(recipient.code)
                .issuedBy(issuedBy)
                .issueDate(issueDate)
                .returnDate(returnDate)
                .note(blankToNull(text(payload.get("note"))))
                .quantity(quantity)
                .status("Issued")
                .build();
        issue.setIsActive(true);
        issue = issueRepository.save(issue);

        if (item.getAvailableQuantity() != null) {
            item.setAvailableQuantity(Math.max(0, item.getAvailableQuantity() - quantity));
            itemRepository.save(item);
        }
        return toIssueMap(issueRepository.findDetailById(issue.getId()).orElse(issue));
    }

    @Transactional
    public Map<String, Object> returnIssue(Long id) {
        InventoryIssueItem issue = issueRepository.findDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("Issue item not found"));
        if ("Returned".equalsIgnoreCase(issue.getStatus())) {
            throw new IllegalArgumentException("This item has already been returned");
        }
        issue.setStatus("Returned");
        if (issue.getReturnDate() == null) {
            issue.setReturnDate(LocalDate.now());
        }
        issueRepository.save(issue);

        InventoryItem item = issue.getItem();
        if (item != null && item.getAvailableQuantity() != null && issue.getQuantity() != null) {
            item.setAvailableQuantity(item.getAvailableQuantity() + issue.getQuantity());
            itemRepository.save(item);
        }
        return toIssueMap(issue);
    }

    @Transactional
    public void deleteIssue(Long id) {
        InventoryIssueItem issue = issueRepository.findDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("Issue item not found"));
        if (!"Returned".equalsIgnoreCase(issue.getStatus())) {
            InventoryItem item = issue.getItem();
            if (item != null && item.getAvailableQuantity() != null && issue.getQuantity() != null) {
                item.setAvailableQuantity(item.getAvailableQuantity() + issue.getQuantity());
                itemRepository.save(item);
            }
        }
        issueRepository.delete(issue);
    }

    private Recipient resolveRecipient(String userType, Long id) {
        if ("Staff".equalsIgnoreCase(userType)) {
            StaffMember staff = staffMemberRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Issue To staff not found"));
            return new Recipient(staff.getId(), staffFullName(staff), staff.getStaffId());
        }
        StudentAdmission student = studentAdmissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Issue To student not found"));
        return new Recipient(student.getId(), studentFullName(student), student.getAdmissionNo());
    }

    private List<Map<String, Object>> staffOptions() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (StaffMember staff : staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", staff.getId());
            row.put("name", staffFullName(staff));
            row.put("code", staff.getStaffId());
            row.put("label", staffFullName(staff) + (staff.getStaffId() == null ? "" : " (" + staff.getStaffId() + ")"));
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, Object>> studentOptions() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : studentAdmissionRepository.findAllByOrderByIdDesc()) {
            if (student.isDisabled()) {
                continue;
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", student.getId());
            row.put("name", studentFullName(student));
            row.put("code", student.getAdmissionNo());
            row.put("label", studentFullName(student)
                    + (student.getAdmissionNo() == null ? "" : " (" + student.getAdmissionNo() + ")"));
            rows.add(row);
        }
        return rows;
    }

    private Map<String, Object> toIssueMap(InventoryIssueItem issue) {
        InventoryItem item = issue.getItem();
        InventoryItemCategory category = item == null ? null : item.getCategory();
        StaffMember issuedBy = issue.getIssuedBy();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", issue.getId());
        map.put("itemName", item == null ? "" : item.getName());
        map.put("note", issue.getNote() == null ? "" : issue.getNote());
        map.put("itemCategory", category == null ? "" : category.getName());
        map.put("issueReturn", formatRange(issue.getIssueDate(), issue.getReturnDate()));
        map.put("issueTo", formatPerson(issue.getIssueToName(), issue.getIssueToCode()));
        map.put("issuedBy", issuedBy == null ? "" : formatPerson(staffFullName(issuedBy), issuedBy.getStaffId()));
        map.put("quantity", issue.getQuantity());
        map.put("status", issue.getStatus());
        map.put("returned", "Returned".equalsIgnoreCase(issue.getStatus()));
        return map;
    }

    private InventoryItemCategory saveCategory(String name, String description) {
        InventoryItemCategory category = InventoryItemCategory.builder()
                .name(name)
                .description(description)
                .build();
        category.setIsActive(true);
        return categoryRepository.save(category);
    }

    private void saveItem(String name, InventoryItemCategory category, int qty) {
        InventoryItem item = InventoryItem.builder()
                .name(name)
                .category(category)
                .unit("Piece")
                .availableQuantity(qty)
                .build();
        item.setIsActive(true);
        itemRepository.save(item);
    }

    private String formatRange(LocalDate start, LocalDate end) {
        if (start == null) {
            return "";
        }
        if (end == null) {
            return formatUs(start);
        }
        return formatUs(start) + " - " + formatUs(end);
    }

    private String formatPerson(String name, String code) {
        String displayName = name == null ? "" : name.trim();
        if (code == null || code.isBlank()) {
            return displayName;
        }
        return displayName + " (" + code.trim() + ")";
    }

    private String staffFullName(StaffMember staff) {
        return (nullToEmpty(staff.getFirstName()) + " " + nullToEmpty(staff.getLastName())).trim();
    }

    private String studentFullName(StudentAdmission student) {
        return (nullToEmpty(student.getFirstName()) + " " + nullToEmpty(student.getLastName())).trim();
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private String formatUs(LocalDate date) {
        return date == null ? "" : date.format(US);
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

    private Integer parseInteger(Object value, String label) {
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

    private LocalDate parseDate(Object value, boolean required) {
        String raw = text(value);
        if (raw.isBlank()) {
            return required ? null : null;
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

    private record Recipient(Long id, String name, String code) {}
}
