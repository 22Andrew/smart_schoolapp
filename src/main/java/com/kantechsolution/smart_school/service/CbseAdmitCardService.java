package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.CbseAdmitCardTemplate;
import com.kantechsolution.smart_school.model.CbseExam;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.CbseAdmitCardTemplateRepository;
import com.kantechsolution.smart_school.repository.CbseExamRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CbseAdmitCardService implements ApplicationRunner {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final CbseAdmitCardTemplateRepository templateRepository;
    private final CbseExamRepository cbseExamRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (templateRepository.count() > 0) {
            return;
        }
        seedTemplates();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExamOptions() {
        return cbseExamRepository.findAllByOrderByCreatedAtDescIdDesc().stream()
                .map(exam -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", exam.getId());
                    map.put("examName", exam.getExamName());
                    return map;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllTemplates() {
        return templateRepository.findAllByOrderByTemplateNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTemplateById(Long id) {
        return toResponse(requireTemplate(id));
    }

    @Transactional
    public Map<String, Object> createTemplate(Map<String, Object> body) {
        CbseAdmitCardTemplate template = mapTemplate(new CbseAdmitCardTemplate(), body);
        validateTemplate(template, null);
        if (template.isDefaultTemplate()) {
            clearDefaultTemplate(null);
        }
        return toResponse(templateRepository.save(template));
    }

    @Transactional
    public Map<String, Object> updateTemplate(Long id, Map<String, Object> body) {
        CbseAdmitCardTemplate template = requireTemplate(id);
        mapTemplate(template, body);
        validateTemplate(template, id);
        if (template.isDefaultTemplate()) {
            clearDefaultTemplate(id);
        }
        return toResponse(templateRepository.save(template));
    }

    @Transactional
    public void deleteTemplate(Long id) {
        if (!templateRepository.existsById(id)) {
            throw new RuntimeException("Admit card template not found with ID: " + id);
        }
        templateRepository.deleteById(id);
    }

    @Transactional
    public Map<String, Object> setDefaultTemplate(Long id) {
        CbseAdmitCardTemplate template = requireTemplate(id);
        clearDefaultTemplate(id);
        template.setDefaultTemplate(true);
        return toResponse(templateRepository.save(template));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchStudents(Long classId, String section, Long examId) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        if (section == null || section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }
        if (examId == null) {
            throw new IllegalArgumentException("Exam is required");
        }
        requireExam(examId);

        String normalizedSection = section.trim();
        List<StudentAdmission> students = studentAdmissionRepository.search(
                classId, normalizedSection, null, false, null);

        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : students) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", student.getId());
            row.put("admissionNo", student.getAdmissionNo());
            row.put("studentName", fullName(student));
            row.put("fatherName", student.getFatherName() != null ? student.getFatherName() : "");
            row.put("dateOfBirth", student.getDateOfBirth() != null
                    ? student.getDateOfBirth().format(US_DATE) : "");
            row.put("gender", student.getGender());
            row.put("category", student.getCategory() != null
                    ? student.getCategory().getCategoryName() : "");
            row.put("mobileNumber", student.getMobileNumber() != null ? student.getMobileNumber() : "");
            rows.add(row);
        }
        return rows;
    }

    private CbseExam requireExam(Long examId) {
        return cbseExamRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
    }

    private CbseAdmitCardTemplate requireTemplate(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admit card template not found with ID: " + id));
    }

    private void clearDefaultTemplate(Long exceptId) {
        templateRepository.findAll().forEach(item -> {
            if ((exceptId == null || !exceptId.equals(item.getId())) && item.isDefaultTemplate()) {
                item.setDefaultTemplate(false);
                templateRepository.save(item);
            }
        });
    }

    private void validateTemplate(CbseAdmitCardTemplate template, Long id) {
        if (template.getTemplateName() == null || template.getTemplateName().isBlank()) {
            throw new IllegalArgumentException("Template name is required");
        }
        boolean exists = id == null
                ? templateRepository.existsByTemplateNameIgnoreCase(template.getTemplateName())
                : templateRepository.existsByTemplateNameIgnoreCaseAndIdNot(template.getTemplateName(), id);
        if (exists) {
            throw new IllegalArgumentException("Template name already exists");
        }
    }

    private CbseAdmitCardTemplate mapTemplate(CbseAdmitCardTemplate template, Map<String, Object> body) {
        template.setTemplateName(text(body.get("templateName")));
        template.setHeading(text(body.get("heading")));
        template.setTitle(text(body.get("title")));
        template.setExamName(text(body.get("examName")));
        template.setSchoolName(text(body.get("schoolName")));
        template.setExamCenter(text(body.get("examCenter")));
        template.setFooterText(text(body.get("footerText")));
        template.setLeftLogo(text(body.get("leftLogo")));
        template.setRightLogo(text(body.get("rightLogo")));
        template.setSignImage(text(body.get("signImage")));
        template.setBackgroundImage(text(body.get("backgroundImage")));
        template.setShowName(bool(body.get("showName"), true));
        template.setShowFatherName(bool(body.get("showFatherName"), true));
        template.setShowMotherName(bool(body.get("showMotherName"), false));
        template.setShowDob(bool(body.get("showDob"), true));
        template.setShowAdmissionNo(bool(body.get("showAdmissionNo"), true));
        template.setShowRollNumber(bool(body.get("showRollNumber"), true));
        template.setShowAddress(bool(body.get("showAddress"), false));
        template.setShowGender(bool(body.get("showGender"), true));
        template.setShowPhoto(bool(body.get("showPhoto"), true));
        template.setShowClass(bool(body.get("showClass"), true));
        template.setShowSection(bool(body.get("showSection"), true));
        template.setDefaultTemplate(bool(body.get("defaultTemplate"), false));
        return template;
    }

    private Map<String, Object> toResponse(CbseAdmitCardTemplate template) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", template.getId());
        map.put("templateName", template.getTemplateName());
        map.put("heading", template.getHeading());
        map.put("title", template.getTitle());
        map.put("examName", template.getExamName());
        map.put("schoolName", template.getSchoolName());
        map.put("examCenter", template.getExamCenter());
        map.put("footerText", template.getFooterText());
        map.put("leftLogo", template.getLeftLogo());
        map.put("rightLogo", template.getRightLogo());
        map.put("signImage", template.getSignImage());
        map.put("backgroundImage", template.getBackgroundImage());
        map.put("showName", template.isShowName());
        map.put("showFatherName", template.isShowFatherName());
        map.put("showMotherName", template.isShowMotherName());
        map.put("showDob", template.isShowDob());
        map.put("showAdmissionNo", template.isShowAdmissionNo());
        map.put("showRollNumber", template.isShowRollNumber());
        map.put("showAddress", template.isShowAddress());
        map.put("showGender", template.isShowGender());
        map.put("showPhoto", template.isShowPhoto());
        map.put("showClass", template.isShowClass());
        map.put("showSection", template.isShowSection());
        map.put("defaultTemplate", template.isDefaultTemplate());
        return map;
    }

    private String fullName(StudentAdmission student) {
        String first = student.getFirstName() != null ? student.getFirstName().trim() : "";
        String last = student.getLastName() != null ? student.getLastName().trim() : "";
        return (first + " " + last).trim();
    }

    private String text(Object value) {
        if (value == null) {
            return "";
        }
        return String.valueOf(value).trim();
    }

    private boolean bool(Object value, boolean defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Boolean boolValue) {
            return boolValue;
        }
        return Boolean.parseBoolean(String.valueOf(value));
    }

    private void seedTemplates() {
        CbseAdmitCardTemplate sample = CbseAdmitCardTemplate.builder()
                .templateName("Sample Admit Card")
                .heading("Admit Card")
                .title("Annual Examination")
                .examName("CBSE Periodic Test")
                .schoolName("Smart School")
                .examCenter("Main Campus")
                .footerText("Best of luck!")
                .showName(true)
                .showFatherName(true)
                .showMotherName(false)
                .showDob(true)
                .showAdmissionNo(true)
                .showRollNumber(true)
                .showAddress(false)
                .showGender(true)
                .showPhoto(true)
                .showClass(true)
                .showSection(true)
                .defaultTemplate(true)
                .build();

        CbseAdmitCardTemplate admit = CbseAdmitCardTemplate.builder()
                .templateName("Admit Card")
                .heading("Admit Card")
                .title("Half Yearly Examination")
                .examName("CBSE Half Yearly")
                .schoolName("Smart School")
                .examCenter("Main Campus")
                .footerText("Carry this admit card to the exam hall.")
                .showName(true)
                .showFatherName(true)
                .showMotherName(true)
                .showDob(true)
                .showAdmissionNo(true)
                .showRollNumber(true)
                .showAddress(true)
                .showGender(true)
                .showPhoto(true)
                .showClass(true)
                .showSection(true)
                .defaultTemplate(false)
                .build();

        templateRepository.save(sample);
        templateRepository.save(admit);
    }
}
