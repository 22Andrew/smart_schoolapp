package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.ThermalPrintSetting;
import com.kantechsolution.smart_school.repository.ThermalPrintSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Order(32)
public class ThermalPrintService implements ApplicationRunner {

    private static final String DEFAULT_SCHOOL_NAME = "Mount/ Carmel /School";
    private static final String DEFAULT_ADDRESS =
            "25 Kings Street, CA <br> 89562423934 <br> mountcarmelmailtest@gmail.com";
    private static final String DEFAULT_FOOTER =
            "This receipt is computer generated hence no signature is required.";

    private final ThermalPrintSettingRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        requireSetting();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSetting() {
        return toMap(requireSetting());
    }

    @Transactional
    public Map<String, Object> save(Map<String, Object> payload) {
        String schoolName = requiredText(payload.get("schoolName"), "School name");
        ThermalPrintSetting row = requireSetting();
        row.setThermalPrintEnabled(bool(payload.get("thermalPrintEnabled")));
        row.setSchoolName(schoolName);
        row.setAddress(text(payload.get("address")));
        row.setFooterText(text(payload.get("footerText")));
        return toMap(repository.save(row));
    }

    private ThermalPrintSetting requireSetting() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            ThermalPrintSetting row = ThermalPrintSetting.builder()
                    .thermalPrintEnabled(false)
                    .schoolName(DEFAULT_SCHOOL_NAME)
                    .address(DEFAULT_ADDRESS)
                    .footerText(DEFAULT_FOOTER)
                    .build();
            row.setIsActive(true);
            return repository.save(row);
        });
    }

    private Map<String, Object> toMap(ThermalPrintSetting row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("thermalPrintEnabled", Boolean.TRUE.equals(row.getThermalPrintEnabled()));
        map.put("schoolName", row.getSchoolName());
        map.put("address", row.getAddress() == null ? "" : row.getAddress());
        map.put("footerText", row.getFooterText() == null ? "" : row.getFooterText());
        return map;
    }

    private static boolean bool(Object value) {
        if (value instanceof Boolean b) {
            return b;
        }
        String text = text(value).toLowerCase();
        return "true".equals(text) || "1".equals(text) || "on".equals(text) || "yes".equals(text);
    }

    private static String requiredText(Object value, String field) {
        String text = text(value);
        if (text.isEmpty()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return text;
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
