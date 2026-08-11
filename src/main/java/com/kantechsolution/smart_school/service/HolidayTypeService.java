package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.HolidayType;
import com.kantechsolution.smart_school.repository.AnnualHolidayRepository;
import com.kantechsolution.smart_school.repository.HolidayTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Order(1)
public class HolidayTypeService implements ApplicationRunner {

    private final HolidayTypeRepository holidayTypeRepository;
    private final AnnualHolidayRepository annualHolidayRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (holidayTypeRepository.count() == 0) {
            seedHolidayTypes();
        }
    }

    @Transactional(readOnly = true)
    public List<HolidayType> getAllHolidayTypes() {
        return holidayTypeRepository.findAllByOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public List<String> getTypeNames() {
        return holidayTypeRepository.findAllByOrderByNameAsc().stream()
                .map(HolidayType::getName)
                .toList();
    }

    @Transactional(readOnly = true)
    public HolidayType getHolidayTypeById(Long id) {
        return holidayTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Holiday type not found"));
    }

    @Transactional
    public HolidayType createHolidayType(HolidayType holidayType) {
        validateName(holidayType.getName(), null);
        HolidayType entity = HolidayType.builder()
                .name(holidayType.getName().trim())
                .build();
        return holidayTypeRepository.save(entity);
    }

    @Transactional
    public HolidayType updateHolidayType(Long id, HolidayType details) {
        HolidayType holidayType = getHolidayTypeById(id);
        validateName(details.getName(), id);
        holidayType.setName(details.getName().trim());
        return holidayTypeRepository.save(holidayType);
    }

    @Transactional
    public void deleteHolidayType(Long id) {
        HolidayType holidayType = getHolidayTypeById(id);
        long usageCount = annualHolidayRepository.findAllByOrderByFromDateDescIdDesc().stream()
                .filter(h -> h.getHolidayType() != null
                        && h.getHolidayType().equalsIgnoreCase(holidayType.getName()))
                .count();
        if (usageCount > 0) {
            throw new IllegalArgumentException("Holiday type is in use and cannot be deleted");
        }
        holidayTypeRepository.delete(holidayType);
    }

    private void validateName(String name, Long excludeId) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        String trimmed = name.trim();
        holidayTypeRepository.findByNameIgnoreCase(trimmed).ifPresent(existing -> {
            if (excludeId == null || !existing.getId().equals(excludeId)) {
                throw new IllegalArgumentException("Holiday type already exists");
            }
        });
    }

    private void seedHolidayTypes() {
        List<String> defaults = List.of(
                "Holiday", "Vacation", "Activity", "EVENTS", "School Events"
        );
        List<HolidayType> rows = defaults.stream()
                .map(name -> HolidayType.builder().name(name).build())
                .toList();
        holidayTypeRepository.saveAll(rows);
    }
}
