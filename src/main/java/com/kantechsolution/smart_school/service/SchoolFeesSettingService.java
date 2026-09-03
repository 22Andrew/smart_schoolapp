package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolFeesSetting;
import com.kantechsolution.smart_school.repository.SchoolFeesSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SchoolFeesSettingService implements ApplicationRunner {

    private final SchoolFeesSettingRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        seedDefaults();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings() {
        return toMap(requireSettings());
    }

    @Transactional
    public Map<String, Object> saveSettings(Map<String, Object> payload) {
        SchoolFeesSetting settings = requireSettings();
        settings.setOfflineBankPaymentInStudentPanel(boolValue(payload.get("offlineBankPaymentInStudentPanel"), true));
        settings.setOfflineBankPaymentInstruction(text(payload.get("offlineBankPaymentInstruction")));
        settings.setLockStudentPanelIfFeesRemaining(boolValue(payload.get("lockStudentPanelIfFeesRemaining"), false));
        settings.setPrintFeesReceiptOfficeCopy(boolValue(payload.get("printFeesReceiptOfficeCopy"), true));
        settings.setPrintFeesReceiptStudentCopy(boolValue(payload.get("printFeesReceiptStudentCopy"), true));
        settings.setPrintFeesReceiptBankCopy(boolValue(payload.get("printFeesReceiptBankCopy"), true));
        settings.setCarryForwardFeesDueDays(intValue(payload.get("carryForwardFeesDueDays"), 60));
        settings.setSinglePageFeesPrint(boolValue(payload.get("singlePageFeesPrint"), true));
        settings.setCollectFeesInBackDate(boolValue(payload.get("collectFeesInBackDate"), true));
        settings.setStudentGuardianPanelFeesDiscount(boolValue(payload.get("studentGuardianPanelFeesDiscount"), true));
        settings.setDisplayPreviousFees(boolValue(payload.get("displayPreviousFees"), true));
        settings.setAllowStudentPartialPayment(boolValue(payload.get("allowStudentPartialPayment"), true));
        return toMap(repository.save(settings));
    }

    private void seedDefaults() {
        SchoolFeesSetting settings = SchoolFeesSetting.builder()
                .offlineBankPaymentInStudentPanel(true)
                .offlineBankPaymentInstruction("Offline mode of payment are Cash, DD, Online and Cheques")
                .lockStudentPanelIfFeesRemaining(false)
                .printFeesReceiptOfficeCopy(true)
                .printFeesReceiptStudentCopy(true)
                .printFeesReceiptBankCopy(true)
                .carryForwardFeesDueDays(60)
                .singlePageFeesPrint(true)
                .collectFeesInBackDate(true)
                .studentGuardianPanelFeesDiscount(true)
                .displayPreviousFees(true)
                .allowStudentPartialPayment(true)
                .build();
        settings.setIsActive(true);
        repository.save(settings);
    }

    private SchoolFeesSetting requireSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            seedDefaults();
            return repository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private Map<String, Object> toMap(SchoolFeesSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", settings.getId());
        map.put("offlineBankPaymentInStudentPanel", settings.getOfflineBankPaymentInStudentPanel());
        map.put("offlineBankPaymentInstruction", blank(settings.getOfflineBankPaymentInstruction()));
        map.put("lockStudentPanelIfFeesRemaining", settings.getLockStudentPanelIfFeesRemaining());
        map.put("printFeesReceiptOfficeCopy", settings.getPrintFeesReceiptOfficeCopy());
        map.put("printFeesReceiptStudentCopy", settings.getPrintFeesReceiptStudentCopy());
        map.put("printFeesReceiptBankCopy", settings.getPrintFeesReceiptBankCopy());
        map.put("carryForwardFeesDueDays", settings.getCarryForwardFeesDueDays());
        map.put("singlePageFeesPrint", settings.getSinglePageFeesPrint());
        map.put("collectFeesInBackDate", settings.getCollectFeesInBackDate());
        map.put("studentGuardianPanelFeesDiscount", settings.getStudentGuardianPanelFeesDiscount());
        map.put("displayPreviousFees", settings.getDisplayPreviousFees());
        map.put("allowStudentPartialPayment", settings.getAllowStudentPartialPayment());
        return map;
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

    private int intValue(Object value, int defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.toString().trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Carry Forward Fees Due Days must be a valid number");
        }
    }

    private String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private String blank(String value) {
        return value == null ? "" : value;
    }
}
