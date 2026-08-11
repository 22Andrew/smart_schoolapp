package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.AdmitCardTemplate;
import com.kantechsolution.smart_school.repository.AdmitCardTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdmitCardService implements ApplicationRunner {

    private final AdmitCardTemplateRepository templateRepository;
    private final UploadStorage uploadStorage;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (templateRepository.count() > 0) {
            return;
        }
        seedTemplates();
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
    public Map<String, Object> createTemplate(Map<String, Object> body,
                                              MultipartFile leftLogo,
                                              MultipartFile rightLogo,
                                              MultipartFile signImage,
                                              MultipartFile backgroundImage) {
        if (body == null || body.isEmpty()) {
            throw new IllegalArgumentException("Template data is required");
        }
        AdmitCardTemplate template = mapTemplate(new AdmitCardTemplate(), body);
        applyImages(template, leftLogo, rightLogo, signImage, backgroundImage);
        validateTemplate(template, null);
        if (template.isDefaultTemplate()) {
            clearDefaultTemplate(null);
        }
        return toResponse(templateRepository.save(template));
    }

    @Transactional
    public Map<String, Object> updateTemplate(Long id,
                                              Map<String, Object> body,
                                              MultipartFile leftLogo,
                                              MultipartFile rightLogo,
                                              MultipartFile signImage,
                                              MultipartFile backgroundImage) {
        if (body == null || body.isEmpty()) {
            throw new IllegalArgumentException("Template data is required");
        }
        AdmitCardTemplate template = requireTemplate(id);
        mapTemplate(template, body);
        applyImages(template, leftLogo, rightLogo, signImage, backgroundImage);
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
        AdmitCardTemplate template = requireTemplate(id);
        clearDefaultTemplate(id);
        template.setDefaultTemplate(true);
        return toResponse(templateRepository.save(template));
    }

    private void applyImages(AdmitCardTemplate template,
                             MultipartFile leftLogo,
                             MultipartFile rightLogo,
                             MultipartFile signImage,
                             MultipartFile backgroundImage) {
        if (leftLogo != null && !leftLogo.isEmpty()) {
            template.setLeftLogo(storeImage(leftLogo));
        }
        if (rightLogo != null && !rightLogo.isEmpty()) {
            template.setRightLogo(storeImage(rightLogo));
        }
        if (signImage != null && !signImage.isEmpty()) {
            template.setSignImage(storeImage(signImage));
        }
        if (backgroundImage != null && !backgroundImage.isEmpty()) {
            template.setBackgroundImage(storeImage(backgroundImage));
        }
    }

    private String storeImage(MultipartFile file) {
        try {
            String original = file.getOriginalFilename() == null ? "image.jpg" : file.getOriginalFilename();
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot >= 0) {
                ext = original.substring(dot);
            }
            String filename = UUID.randomUUID() + ext;
            Path target = uploadStorage.getAdmitCardsDir().resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/admitcards/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store image: " + e.getMessage());
        }
    }

    private AdmitCardTemplate requireTemplate(Long id) {
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

    private void validateTemplate(AdmitCardTemplate template, Long id) {
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

    private AdmitCardTemplate mapTemplate(AdmitCardTemplate template, Map<String, Object> body) {
        template.setTemplateName(text(body.get("templateName")));
        template.setHeading(text(body.get("heading")));
        template.setTitle(text(body.get("title")));
        template.setExamName(text(body.get("examName")));
        template.setSchoolName(text(body.get("schoolName")));
        template.setExamCenter(text(body.get("examCenter")));
        template.setFooterText(text(body.get("footerText")));
        if (body.containsKey("leftLogo") && text(body.get("leftLogo")).isEmpty()) {
            template.setLeftLogo("");
        }
        if (body.containsKey("rightLogo") && text(body.get("rightLogo")).isEmpty()) {
            template.setRightLogo("");
        }
        if (body.containsKey("signImage") && text(body.get("signImage")).isEmpty()) {
            template.setSignImage("");
        }
        if (body.containsKey("backgroundImage") && text(body.get("backgroundImage")).isEmpty()) {
            template.setBackgroundImage("");
        }
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

    private Map<String, Object> toResponse(AdmitCardTemplate template) {
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
        AdmitCardTemplate sample = AdmitCardTemplate.builder()
                .templateName("Sample Admit Card")
                .heading("Admit Card")
                .title("Annual Examination")
                .examName("Half Yearly Test")
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

        AdmitCardTemplate admit = AdmitCardTemplate.builder()
                .templateName("Admit Card")
                .heading("Admit Card")
                .title("Half Yearly Examination")
                .examName("Term Examination")
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

        AdmitCardTemplate examCard = AdmitCardTemplate.builder()
                .templateName("exam card")
                .heading("Exam Card")
                .title("Unit Test")
                .examName("Monthly Test")
                .schoolName("Smart School")
                .examCenter("Block A")
                .footerText("Report 30 minutes before exam time.")
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
                .defaultTemplate(false)
                .build();

        templateRepository.save(sample);
        templateRepository.save(admit);
        templateRepository.save(examCard);
    }
}
