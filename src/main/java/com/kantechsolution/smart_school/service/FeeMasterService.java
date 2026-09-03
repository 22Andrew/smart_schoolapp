package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.FeeGroup;
import com.kantechsolution.smart_school.model.FeeMaster;
import com.kantechsolution.smart_school.model.FeeMaster.FineType;
import com.kantechsolution.smart_school.model.FeeType;
import com.kantechsolution.smart_school.repository.FeeGroupRepository;
import com.kantechsolution.smart_school.repository.FeeMasterRepository;
import com.kantechsolution.smart_school.repository.FeeTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class FeeMasterService {

    public static final String DEFAULT_SESSION = "2026-27";

    @Autowired
    private FeeMasterRepository feeMasterRepository;

    @Autowired
    private FeeGroupRepository feeGroupRepository;

    @Autowired
    private FeeTypeRepository feeTypeRepository;

    public List<Map<String, Object>> getAllMasters(String sessionYear) {
        String session = normalizeSession(sessionYear);
        List<FeeMaster> rows = feeMasterRepository.findBySessionYearOrderByIdAsc(session);
        List<Map<String, Object>> result = new ArrayList<>();
        for (FeeMaster row : rows) {
            result.add(toMap(row));
        }
        return result;
    }

    public List<Map<String, Object>> getGroupedMasters(String sessionYear) {
        List<Map<String, Object>> flat = getAllMasters(sessionYear);
        Map<Long, Map<String, Object>> groups = new LinkedHashMap<>();

        for (Map<String, Object> item : flat) {
            Long groupId = (Long) item.get("feeGroupId");
            Map<String, Object> group = groups.get(groupId);
            if (group == null) {
                group = new HashMap<>();
                group.put("feeGroupId", groupId);
                group.put("feeGroupName", item.get("feeGroupName"));
                group.put("sessionYear", item.get("sessionYear"));
                group.put("items", new ArrayList<Map<String, Object>>());
                groups.put(groupId, group);
            }
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) group.get("items");
            items.add(item);
        }
        return new ArrayList<>(groups.values());
    }

    public Map<String, Object> getGroupDetail(Long feeGroupId, String sessionYear) {
        FeeGroup group = feeGroupRepository.findById(feeGroupId)
                .orElseThrow(() -> new IllegalArgumentException("Fees group not found"));
        String session = normalizeSession(sessionYear);

        List<Map<String, Object>> items = new ArrayList<>();
        for (FeeMaster row : feeMasterRepository.findByFeeGroupIdOrderByIdAsc(feeGroupId)) {
            if (session.equals(row.getSessionYear())) {
                items.add(toMap(row));
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("feeGroupId", group.getId());
        result.put("feeGroupName", group.getName());
        result.put("sessionYear", session);
        result.put("items", items);
        return result;
    }

    @Transactional
    public FeeMaster create(Long feeGroupId,
                            Long feeTypeId,
                            String sessionYear,
                            LocalDate dueDate,
                            Double amount,
                            String fineType,
                            Double percentage,
                            Double fixAmount) {
        FeeGroup group = feeGroupRepository.findById(feeGroupId)
                .orElseThrow(() -> new IllegalArgumentException("Fees group not found"));
        FeeType type = feeTypeRepository.findById(feeTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Fees type not found"));
        String session = normalizeSession(sessionYear);

        if (feeMasterRepository.existsByFeeGroupIdAndFeeTypeIdAndSessionYear(group.getId(), type.getId(), session)) {
            throw new IllegalArgumentException("This fees type already exists in the selected fees group");
        }

        FeeMaster master = new FeeMaster();
        applyValues(master, group, type, session, dueDate, amount, fineType, percentage, fixAmount);
        return feeMasterRepository.save(master);
    }

    @Transactional
    public FeeMaster update(Long id,
                            Long feeGroupId,
                            Long feeTypeId,
                            String sessionYear,
                            LocalDate dueDate,
                            Double amount,
                            String fineType,
                            Double percentage,
                            Double fixAmount) {
        FeeMaster existing = feeMasterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fees master not found"));
        FeeGroup group = feeGroupRepository.findById(feeGroupId)
                .orElseThrow(() -> new IllegalArgumentException("Fees group not found"));
        FeeType type = feeTypeRepository.findById(feeTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Fees type not found"));
        String session = normalizeSession(sessionYear);

        List<FeeMaster> sameGroupType = feeMasterRepository.findByFeeGroupIdOrderByIdAsc(group.getId());
        for (FeeMaster row : sameGroupType) {
            if (!row.getId().equals(id)
                    && row.getFeeType().getId().equals(type.getId())
                    && session.equals(row.getSessionYear())) {
                throw new IllegalArgumentException("This fees type already exists in the selected fees group");
            }
        }

        applyValues(existing, group, type, session, dueDate, amount, fineType, percentage, fixAmount);
        return feeMasterRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!feeMasterRepository.existsById(id)) {
            throw new IllegalArgumentException("Fees master not found");
        }
        feeMasterRepository.deleteById(id);
    }

    @Transactional
    public void deleteGroup(Long feeGroupId, String sessionYear) {
        String session = normalizeSession(sessionYear);
        feeMasterRepository.deleteByFeeGroupIdAndSessionYear(feeGroupId, session);
    }

    private void applyValues(FeeMaster master,
                             FeeGroup group,
                             FeeType type,
                             String session,
                             LocalDate dueDate,
                             Double amount,
                             String fineType,
                             Double percentage,
                             Double fixAmount) {
        if (amount == null || amount < 0) {
            throw new IllegalArgumentException("Amount is required");
        }
        FineType typeEnum = parseFineType(fineType);
        Double pct = percentage == null ? 0.0 : percentage;
        Double fix = fixAmount == null ? 0.0 : fixAmount;

        if (typeEnum == FineType.PERCENTAGE && pct < 0) {
            throw new IllegalArgumentException("Percentage is required");
        }
        if ((typeEnum == FineType.FIX_AMOUNT || typeEnum == FineType.CUMULATIVE) && fix < 0) {
            throw new IllegalArgumentException("Fix amount is required");
        }

        master.setFeeGroup(group);
        master.setFeeType(type);
        master.setSessionYear(session);
        master.setDueDate(dueDate);
        master.setAmount(amount);
        master.setFineType(typeEnum);
        master.setPercentage(pct);
        master.setFixAmount(fix);
        master.setPerDay(typeEnum == FineType.CUMULATIVE);
    }

    private FineType parseFineType(String fineType) {
        String value = fineType == null ? "NONE" : fineType.trim().toUpperCase(Locale.ROOT);
        return switch (value) {
            case "FIX_AMOUNT", "FIX", "FIXED" -> FineType.FIX_AMOUNT;
            case "PERCENTAGE", "PERCENT" -> FineType.PERCENTAGE;
            case "CUMULATIVE" -> FineType.CUMULATIVE;
            default -> FineType.NONE;
        };
    }

    private String normalizeSession(String sessionYear) {
        String session = sessionYear == null ? "" : sessionYear.trim();
        return session.isEmpty() ? DEFAULT_SESSION : session;
    }

    private Map<String, Object> toMap(FeeMaster row) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", row.getId());
        map.put("feeGroupId", row.getFeeGroup() != null ? row.getFeeGroup().getId() : null);
        map.put("feeGroupName", row.getFeeGroup() != null ? row.getFeeGroup().getName() : "");
        map.put("feeTypeId", row.getFeeType() != null ? row.getFeeType().getId() : null);
        map.put("feeTypeName", row.getFeeType() != null ? row.getFeeType().getName() : "");
        map.put("feesCode", row.getFeeType() != null ? row.getFeeType().getFeesCode() : "");
        map.put("sessionYear", row.getSessionYear());
        map.put("dueDate", row.getDueDate());
        map.put("amount", row.getAmount());
        map.put("fineType", row.getFineType() != null ? row.getFineType().name() : FineType.NONE.name());
        map.put("fineTypeLabel", fineTypeLabel(row.getFineType()));
        map.put("percentage", row.getPercentage());
        map.put("fixAmount", row.getFixAmount());
        map.put("perDay", row.isPerDay());
        map.put("daysFineAmount", daysFineAmount(row));
        return map;
    }

    private String fineTypeLabel(FineType fineType) {
        if (fineType == null) return "None";
        return switch (fineType) {
            case FIX_AMOUNT -> "Fix";
            case PERCENTAGE -> "Percentage";
            case CUMULATIVE -> "Cumulative";
            default -> "None";
        };
    }

    private String daysFineAmount(FeeMaster row) {
        FineType type = row.getFineType();
        if (type == null || type == FineType.NONE) {
            return "";
        }
        if (type == FineType.FIX_AMOUNT) {
            return "Fine: " + formatMoney(row.getFixAmount());
        }
        if (type == FineType.PERCENTAGE) {
            return "Fine: " + formatMoney(row.getPercentage()) + "%";
        }
        // Cumulative: percentage field stores days count for display
        int days = row.getPercentage() == null ? 0 : row.getPercentage().intValue();
        return "Days: " + days + "-Fine: $" + formatMoney(row.getFixAmount());
    }

    private String formatMoney(Double value) {
        double v = value == null ? 0.0 : value;
        return String.format(Locale.US, "%.2f", v);
    }
}
