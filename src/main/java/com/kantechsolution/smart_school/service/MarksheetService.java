package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.MarksheetTemplate;
import com.kantechsolution.smart_school.repository.MarksheetTemplateRepository;
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
public class MarksheetService implements ApplicationRunner {

    private final MarksheetTemplateRepository templateRepository;
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
                                              MultipartFile headerImage,
                                              MultipartFile leftLogo,
                                              MultipartFile leftSign,
                                              MultipartFile middleSign,
                                              MultipartFile rightSign,
                                              MultipartFile backgroundImage) {
        if (body == null || body.isEmpty()) {
            throw new IllegalArgumentException("Template data is required");
        }
        MarksheetTemplate template = mapTemplate(new MarksheetTemplate(), body);
        applyImages(template, headerImage, leftLogo, leftSign, middleSign, rightSign, backgroundImage);
        validateTemplate(template, null);
        return toResponse(templateRepository.save(template));
    }

    @Transactional
    public Map<String, Object> updateTemplate(Long id,
                                              Map<String, Object> body,
                                              MultipartFile headerImage,
                                              MultipartFile leftLogo,
                                              MultipartFile leftSign,
                                              MultipartFile middleSign,
                                              MultipartFile rightSign,
                                              MultipartFile backgroundImage) {
        if (body == null || body.isEmpty()) {
            throw new IllegalArgumentException("Template data is required");
        }
        MarksheetTemplate template = requireTemplate(id);
        mapTemplate(template, body);
        applyImages(template, headerImage, leftLogo, leftSign, middleSign, rightSign, backgroundImage);
        validateTemplate(template, id);
        return toResponse(templateRepository.save(template));
    }

    @Transactional
    public void deleteTemplate(Long id) {
        if (!templateRepository.existsById(id)) {
            throw new RuntimeException("Marksheet template not found with ID: " + id);
        }
        templateRepository.deleteById(id);
    }

    private void applyImages(MarksheetTemplate template,
                             MultipartFile headerImage,
                             MultipartFile leftLogo,
                             MultipartFile leftSign,
                             MultipartFile middleSign,
                             MultipartFile rightSign,
                             MultipartFile backgroundImage) {
        if (headerImage != null && !headerImage.isEmpty()) {
            template.setHeaderImage(storeImage(headerImage));
        }
        if (leftLogo != null && !leftLogo.isEmpty()) {
            template.setLeftLogo(storeImage(leftLogo));
        }
        if (leftSign != null && !leftSign.isEmpty()) {
            template.setLeftSign(storeImage(leftSign));
        }
        if (middleSign != null && !middleSign.isEmpty()) {
            template.setMiddleSign(storeImage(middleSign));
        }
        if (rightSign != null && !rightSign.isEmpty()) {
            template.setRightSign(storeImage(rightSign));
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
            Path target = uploadStorage.getMarksheetsDir().resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/marksheets/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store image: " + e.getMessage());
        }
    }

    private MarksheetTemplate requireTemplate(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marksheet template not found with ID: " + id));
    }

    private void validateTemplate(MarksheetTemplate template, Long id) {
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

    private MarksheetTemplate mapTemplate(MarksheetTemplate template, Map<String, Object> body) {
        template.setTemplateName(text(body.get("templateName")));
        template.setExamName(text(body.get("examName")));
        template.setSchoolName(text(body.get("schoolName")));
        template.setExamCenter(text(body.get("examCenter")));
        template.setBodyText(text(body.get("bodyText")));
        template.setFooterText(text(body.get("footerText")));
        template.setPrintingDate(text(body.get("printingDate")));
        template.setShowName(bool(body.get("showName"), true));
        template.setShowFatherName(bool(body.get("showFatherName"), true));
        template.setShowMotherName(bool(body.get("showMotherName"), true));
        template.setShowExamSession(bool(body.get("showExamSession"), true));
        template.setShowAdmissionNo(bool(body.get("showAdmissionNo"), true));
        template.setShowDivision(bool(body.get("showDivision"), true));
        template.setShowRank(bool(body.get("showRank"), true));
        template.setShowRollNumber(bool(body.get("showRollNumber"), true));
        template.setShowPhoto(bool(body.get("showPhoto"), true));
        template.setShowClass(bool(body.get("showClass"), true));
        template.setShowSection(bool(body.get("showSection"), true));
        template.setShowDob(bool(body.get("showDob"), true));
        template.setShowRemark(bool(body.get("showRemark"), true));
        return template;
    }

    private Map<String, Object> toResponse(MarksheetTemplate template) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", template.getId());
        map.put("templateName", template.getTemplateName());
        map.put("examName", template.getExamName());
        map.put("schoolName", template.getSchoolName());
        map.put("examCenter", template.getExamCenter());
        map.put("bodyText", template.getBodyText());
        map.put("footerText", template.getFooterText());
        map.put("printingDate", template.getPrintingDate());
        map.put("headerImage", template.getHeaderImage());
        map.put("leftLogo", template.getLeftLogo());
        map.put("leftSign", template.getLeftSign());
        map.put("middleSign", template.getMiddleSign());
        map.put("rightSign", template.getRightSign());
        map.put("backgroundImage", template.getBackgroundImage());
        map.put("showName", template.isShowName());
        map.put("showFatherName", template.isShowFatherName());
        map.put("showMotherName", template.isShowMotherName());
        map.put("showExamSession", template.isShowExamSession());
        map.put("showAdmissionNo", template.isShowAdmissionNo());
        map.put("showDivision", template.isShowDivision());
        map.put("showRank", template.isShowRank());
        map.put("showRollNumber", template.isShowRollNumber());
        map.put("showPhoto", template.isShowPhoto());
        map.put("showClass", template.isShowClass());
        map.put("showSection", template.isShowSection());
        map.put("showDob", template.isShowDob());
        map.put("showRemark", template.isShowRemark());
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
        MarksheetTemplate school = MarksheetTemplate.builder()
                .templateName("school marksheet")
                .examName("HALF YEARLY EXAM")
                .schoolName("MOUNT CARMEL SCHOOL")
                .examCenter("GOVT GIRLS H S SCHOOL")
                .bodyText("CERTIFICATED THAT")
                .footerText("PASS IN SECOND DIVISION")
                .printingDate("2021")
                .showName(true)
                .showFatherName(true)
                .showMotherName(true)
                .showExamSession(true)
                .showAdmissionNo(true)
                .showDivision(true)
                .showRank(true)
                .showRollNumber(true)
                .showPhoto(true)
                .showClass(true)
                .showSection(true)
                .showDob(true)
                .showRemark(true)
                .build();

        MarksheetTemplate marksheet = MarksheetTemplate.builder()
                .templateName("Marksheet")
                .examName("ANNUAL EXAMINATION")
                .schoolName("Smart School")
                .examCenter("Main Campus")
                .bodyText("CERTIFICATED THAT")
                .footerText("PASS")
                .printingDate("2023-24")
                .showName(true)
                .showFatherName(true)
                .showMotherName(true)
                .showExamSession(true)
                .showAdmissionNo(true)
                .showDivision(true)
                .showRank(false)
                .showRollNumber(true)
                .showPhoto(true)
                .showClass(true)
                .showSection(true)
                .showDob(true)
                .showRemark(true)
                .build();

        templateRepository.save(school);
        templateRepository.save(marksheet);
    }
}
