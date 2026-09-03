package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.AcademicSession;
import com.kantechsolution.smart_school.model.Alumni;
import com.kantechsolution.smart_school.model.SchoolClass;
import com.kantechsolution.smart_school.repository.AcademicSessionRepository;
import com.kantechsolution.smart_school.repository.AlumniRepository;
import com.kantechsolution.smart_school.repository.SchoolClassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
@RequiredArgsConstructor
@Order(25)
public class AlumniService implements ApplicationRunner {

    private final AlumniRepository alumniRepository;
    private final AcademicSessionRepository sessionRepository;
    private final SchoolClassRepository classRepository;
    private final UploadStorage uploadStorage;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (alumniRepository.count() == 0) {
            seedSample();
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> search(Long sessionId, Long classId, String section, String admissionNumber) {
        String admission = text(admissionNumber);
        String sectionName = text(section);
        String selectedSessionName = sessionId == null ? "" : sessionRepository.findById(sessionId)
                .map(AcademicSession::getSessionName).orElse("");
        String selectedClassName = classId == null ? "" : classRepository.findById(classId)
                .map(SchoolClass::getName).orElse("");
        return alumniRepository.findAllByOrderByStudentNameAsc().stream()
                .filter(row -> admission.isBlank() || text(row.getAdmissionNumber()).toLowerCase(Locale.ROOT)
                        .contains(admission.toLowerCase(Locale.ROOT)))
                .filter(row -> sessionId == null
                        || Objects.equals(row.getSessionId(), sessionId)
                        || selectedSessionName.equalsIgnoreCase(text(row.getSessionName())))
                .filter(row -> classId == null
                        || Objects.equals(row.getClassId(), classId)
                        || selectedClassName.equalsIgnoreCase(text(row.getClassName())))
                .filter(row -> sectionName.isBlank() || sectionName.equalsIgnoreCase(text(row.getSectionName())))
                .map(this::toMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getById(Long id) {
        return toMap(require(id));
    }

    @Transactional
    public Map<String, Object> update(Long id, String currentPhone, String currentEmail, String occupation,
                                      String address, MultipartFile photo, boolean removePhoto) {
        Alumni row = require(id);
        if (text(currentPhone).isBlank()) {
            throw new IllegalArgumentException("Current Phone is required");
        }
        row.setCurrentPhone(text(currentPhone));
        row.setCurrentEmail(text(currentEmail));
        row.setOccupation(text(occupation));
        row.setAddress(text(address));
        if (removePhoto) {
            row.setPhotoUrl(null);
        }
        if (photo != null && !photo.isEmpty()) {
            row.setPhotoUrl(storePhoto(photo));
        }
        return toMap(alumniRepository.save(row));
    }

    @Transactional
    public void delete(Long id) {
        alumniRepository.delete(require(id));
    }

    private void seedSample() {
        AcademicSession session = sessionRepository.findBySessionNameIgnoreCase("2024-25")
                .or(() -> sessionRepository.findByCurrentTrue())
                .orElseGet(() -> sessionRepository.findAllByOrderBySessionNameDesc().stream().findFirst().orElse(null));
        SchoolClass schoolClass = classRepository.findByNameIgnoreCase("Class 1")
                .orElseGet(() -> classRepository.findAllByOrderByIdAsc().stream().findFirst().orElse(null));
        String section = "A";
        if (schoolClass != null && schoolClass.getSections() != null && !schoolClass.getSections().isEmpty()) {
            section = schoolClass.getSections().get(0);
        }

        Alumni alumni = Alumni.builder()
                .sessionId(session == null ? null : session.getId())
                .sessionName(session == null ? "2024-25" : session.getSessionName())
                .classId(schoolClass == null ? null : schoolClass.getId())
                .className(schoolClass == null ? "Class 1" : schoolClass.getName())
                .sectionName(section)
                .admissionNumber("7663")
                .studentName("Paul S. Bealer")
                .gender("Male")
                .currentEmail("paul22@gmail.com")
                .currentPhone("890879789")
                .occupation("pg")
                .address("Mr Road 40, Delhi")
                .build();
        alumni.setIsActive(true);
        alumniRepository.save(alumni);
    }

    private Alumni require(Long id) {
        return alumniRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Alumni not found"));
    }

    private Map<String, Object> toMap(Alumni row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("sessionId", row.getSessionId());
        map.put("sessionName", row.getSessionName());
        map.put("classId", row.getClassId());
        map.put("className", row.getClassName());
        map.put("sectionName", row.getSectionName());
        map.put("classLabel", classLabel(row));
        map.put("admissionNumber", row.getAdmissionNumber());
        map.put("studentName", row.getStudentName());
        map.put("gender", row.getGender());
        map.put("currentEmail", row.getCurrentEmail());
        map.put("currentPhone", row.getCurrentPhone());
        map.put("occupation", row.getOccupation());
        map.put("address", row.getAddress());
        map.put("photoUrl", row.getPhotoUrl());
        return map;
    }

    private static String classLabel(Alumni row) {
        String className = text(row.getClassName());
        String section = text(row.getSectionName());
        if (!className.isBlank() && !section.isBlank()) return className + "(" + section + ")";
        return className.isBlank() ? section : className;
    }

    private String storePhoto(MultipartFile file) {
        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo";
        String extension = original.contains(".") ? original.substring(original.lastIndexOf('.')).toLowerCase(Locale.ROOT) : "";
        try {
            Path dir = uploadStorage.getAlumniDir();
            Files.createDirectories(dir);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/alumni/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store photo: " + e.getMessage());
        }
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
