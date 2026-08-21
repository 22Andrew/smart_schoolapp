package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppCustomField;
import com.kantechsolution.smart_school.repository.AppCustomFieldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AppCustomFieldService {

    private static final Map<String, String> BELONG_TO_OPTIONS = linkedMap(
            "students", "Student",
            "staff", "Staff",
            "transfer_certificate", "Transfer Certificate"
    );

    private static final Map<String, String> FIELD_TYPES = linkedMap(
            "input", "Input",
            "number", "Number",
            "textarea", "Textarea",
            "select", "Select",
            "multiselect", "Multi Select",
            "checkbox", "Checkbox",
            "date_picker", "Date Picker",
            "date_picker_time", "Datetime Picker",
            "colorpicker", "Color Picker",
            "link", "Hyperlink"
    );

    private static final Set<String> VALUE_REQUIRED_TYPES = Set.of("select", "multiselect", "checkbox", "link");

    private final AppCustomFieldRepository repository;

    @Transactional(readOnly = true)
    public Map<String, Object> getPageData() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("belongToOptions", toOptionList(BELONG_TO_OPTIONS));
        data.put("fieldTypes", toOptionList(FIELD_TYPES));
        data.put("groupedFields", listGrouped());
        return data;
    }

    @Transactional(readOnly = true)
    public Map<String, List<Map<String, Object>>> listGrouped() {
        Map<String, List<Map<String, Object>>> grouped = new LinkedHashMap<>();
        for (String key : BELONG_TO_OPTIONS.keySet()) {
            grouped.put(key, new ArrayList<>());
        }
        for (AppCustomField field : repository.findAllByOrderByBelongToAscWeightAscNameAsc()) {
            grouped.computeIfAbsent(field.getBelongTo(), k -> new ArrayList<>()).add(toMap(field));
        }
        return grouped;
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> payload) {
        validatePayload(payload);
        String belongTo = normalizeBelongTo(payload.get("belongTo"));
        AppCustomField field = AppCustomField.builder()
                .belongTo(belongTo)
                .fieldType(normalizeType(payload.get("fieldType")))
                .name(requiredText(payload.get("name"), "Field name is required"))
                .bsColumn(normalizeColumn(payload.get("bsColumn")))
                .fieldValues(optionalText(payload.get("fieldValues")))
                .requiredField(boolValue(payload.get("requiredField"), false))
                .visibleOnTable(boolValue(payload.get("visibleOnTable"), false))
                .weight(nextWeight(belongTo))
                .build();
        field.setIsActive(true);
        return toMap(repository.save(field));
    }

    @Transactional
    public Map<String, Object> update(Long id, Map<String, Object> payload) {
        AppCustomField field = requireField(id);
        validatePayload(payload);
        field.setBelongTo(normalizeBelongTo(payload.get("belongTo")));
        field.setFieldType(normalizeType(payload.get("fieldType")));
        field.setName(requiredText(payload.get("name"), "Field name is required"));
        field.setBsColumn(normalizeColumn(payload.get("bsColumn")));
        field.setFieldValues(optionalText(payload.get("fieldValues")));
        field.setRequiredField(boolValue(payload.get("requiredField"), false));
        field.setVisibleOnTable(boolValue(payload.get("visibleOnTable"), false));
        return toMap(repository.save(field));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Custom field not found");
        }
        repository.deleteById(id);
    }

    @Transactional
    public void reorder(String belongTo, List<Long> ids) {
        String normalizedBelongTo = normalizeBelongTo(belongTo);
        if (ids == null || ids.isEmpty()) {
            return;
        }
        int weight = 1;
        for (Long id : ids) {
            AppCustomField field = requireField(id);
            if (!normalizedBelongTo.equals(field.getBelongTo())) {
                throw new IllegalArgumentException("Invalid reorder request");
            }
            field.setWeight(weight++);
            repository.save(field);
        }
    }

    private void validatePayload(Map<String, Object> payload) {
        String belongTo = normalizeBelongTo(payload.get("belongTo"));
        if (!BELONG_TO_OPTIONS.containsKey(belongTo)) {
            throw new IllegalArgumentException("Field belongs to is required");
        }
        String fieldType = normalizeType(payload.get("fieldType"));
        if (!FIELD_TYPES.containsKey(fieldType)) {
            throw new IllegalArgumentException("Field type is required");
        }
        requiredText(payload.get("name"), "Field name is required");
        normalizeColumn(payload.get("bsColumn"));

        if (VALUE_REQUIRED_TYPES.contains(fieldType)) {
            String values = optionalText(payload.get("fieldValues"));
            if (values.isBlank()) {
                throw new IllegalArgumentException("Field values are required for the selected field type");
            }
        }
    }

    private int nextWeight(String belongTo) {
        return repository.findByBelongToOrderByWeightAscNameAsc(belongTo).size() + 1;
    }

    private AppCustomField requireField(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Custom field not found"));
    }

    private Map<String, Object> toMap(AppCustomField field) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", field.getId());
        map.put("belongTo", field.getBelongTo());
        map.put("belongToLabel", BELONG_TO_OPTIONS.getOrDefault(field.getBelongTo(), field.getBelongTo()));
        map.put("fieldType", field.getFieldType());
        map.put("fieldTypeLabel", FIELD_TYPES.getOrDefault(field.getFieldType(), field.getFieldType()));
        map.put("name", field.getName());
        map.put("bsColumn", field.getBsColumn());
        map.put("fieldValues", field.getFieldValues());
        map.put("requiredField", Boolean.TRUE.equals(field.getRequiredField()));
        map.put("visibleOnTable", Boolean.TRUE.equals(field.getVisibleOnTable()));
        map.put("weight", field.getWeight());
        return map;
    }

    private List<Map<String, String>> toOptionList(Map<String, String> options) {
        List<Map<String, String>> list = new ArrayList<>();
        options.forEach((value, label) -> {
            Map<String, String> item = new LinkedHashMap<>();
            item.put("value", value);
            item.put("label", label);
            list.add(item);
        });
        return list;
    }

    private String normalizeBelongTo(Object value) {
        if (value == null) {
            throw new IllegalArgumentException("Field belongs to is required");
        }
        return value.toString().trim();
    }

    private String normalizeType(Object value) {
        if (value == null) {
            throw new IllegalArgumentException("Field type is required");
        }
        return value.toString().trim();
    }

    private int normalizeColumn(Object value) {
        if (value == null || value.toString().isBlank()) {
            throw new IllegalArgumentException("Grid column is required");
        }
        int column;
        try {
            column = Integer.parseInt(value.toString().trim());
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Grid column must be a number between 1 and 12");
        }
        if (column < 1 || column > 12) {
            throw new IllegalArgumentException("Grid column must be between 1 and 12");
        }
        return column;
    }

    private String requiredText(Object value, String message) {
        String text = optionalText(value);
        if (text.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return text;
    }

    private String optionalText(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private boolean boolValue(Object value, boolean defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        return Boolean.parseBoolean(value.toString());
    }

    private static Map<String, String> linkedMap(String... entries) {
        Map<String, String> map = new LinkedHashMap<>();
        for (int i = 0; i < entries.length; i += 2) {
            map.put(entries[i], entries[i + 1]);
        }
        return map;
    }
}
