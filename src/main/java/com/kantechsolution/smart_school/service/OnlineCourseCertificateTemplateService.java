package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.OnlineCourseCertificateTemplate;
import com.kantechsolution.smart_school.repository.OnlineCourseCertificateTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OnlineCourseCertificateTemplateService {

    private static final String DEFAULT_TEXT =
            "This is to certify that Mr./Ms. [student_name] has successfully completed the [course_name] under [assign_teacher]. "
                    + "The course ran from [start_date] to [completion_date] for Class [class_name], Section [section_name]. "
                    + "Issued on [current_date].";

    @Autowired
    private OnlineCourseCertificateTemplateRepository templateRepository;

    @Autowired
    private UploadStorage uploadStorage;

    @Transactional
    public List<Map<String, Object>> getAll() {
        List<OnlineCourseCertificateTemplate> templates = templateRepository.findAllByOrderByIdAsc();
        if (templates.isEmpty()) {
            templates = seedDefaults();
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (OnlineCourseCertificateTemplate template : templates) {
            rows.add(toRow(template));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body, MultipartFile backgroundImage) {
        String name = text(body.get("certificateName"));
        String certText = text(body.get("certificateText"));
        if (name.isBlank()) {
            throw new IllegalArgumentException("Certificate Name is required");
        }
        if (certText.isBlank()) {
            throw new IllegalArgumentException("Body Text is required");
        }
        if (backgroundImage == null || backgroundImage.isEmpty()) {
            throw new IllegalArgumentException("Background Image is required");
        }

        OnlineCourseCertificateTemplate template = new OnlineCourseCertificateTemplate();
        applyCommonFields(template, body);
        template.setBackgroundImageUrl(storeCertificateImage(backgroundImage));
        return toRow(templateRepository.save(template));
    }

    @Transactional
    public Map<String, Object> update(Long id, Map<String, Object> body, MultipartFile backgroundImage) {
        OnlineCourseCertificateTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Certificate template not found"));
        String name = text(body.get("certificateName"));
        String certText = text(body.get("certificateText"));
        if (name.isBlank()) {
            throw new IllegalArgumentException("Certificate Name is required");
        }
        if (certText.isBlank()) {
            throw new IllegalArgumentException("Body Text is required");
        }
        applyCommonFields(template, body);
        if (backgroundImage != null && !backgroundImage.isEmpty()) {
            template.setBackgroundImageUrl(storeCertificateImage(backgroundImage));
        }
        return toRow(templateRepository.save(template));
    }

    @Transactional
    public void delete(Long id) {
        if (!templateRepository.existsById(id)) {
            throw new IllegalArgumentException("Certificate template not found");
        }
        templateRepository.deleteById(id);
    }

    private void applyCommonFields(OnlineCourseCertificateTemplate template, Map<String, Object> body) {
        template.setCertificateName(text(body.get("certificateName")));
        template.setCertificateText(text(body.get("certificateText")));
        template.setDesignFont(blankTo(text(body.get("designFont")), "Arial"));
        template.setDesignFontSize(blankTo(text(body.get("designFontSize")), "16"));
        template.setDesignTextColor(blankTo(text(body.get("designTextColor")), "#000000"));
        template.setDesignTitleColor(blankTo(text(body.get("designTitleColor")), "#000000"));
        template.setDesignLayout(blankTo(text(body.get("designLayout")), "Portrait"));
    }

    private String storeCertificateImage(MultipartFile file) {
        try {
            String original = file.getOriginalFilename() == null ? "certificate.jpg" : file.getOriginalFilename();
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot >= 0) {
                ext = original.substring(dot);
            }
            String filename = UUID.randomUUID() + ext;
            Path target = uploadStorage.getCertificatesDir().resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/certificates/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store certificate image: " + e.getMessage());
        }
    }

    private List<OnlineCourseCertificateTemplate> seedDefaults() {
        List<OnlineCourseCertificateTemplate> defaults = new ArrayList<>();
        for (int i = 1; i <= 4; i++) {
            OnlineCourseCertificateTemplate template = new OnlineCourseCertificateTemplate();
            template.setCertificateName("Sample Transfer Certificate " + i);
            template.setCertificateText(DEFAULT_TEXT);
            template.setDesignFont("Arial");
            template.setDesignFontSize("16");
            template.setDesignTextColor("#000000");
            template.setDesignTitleColor("#000000");
            template.setDesignLayout("Portrait");
            defaults.add(template);
        }
        return templateRepository.saveAll(defaults);
    }

    private Map<String, Object> toRow(OnlineCourseCertificateTemplate template) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", template.getId());
        row.put("certificateName", template.getCertificateName());
        row.put("certificateText", template.getCertificateText());
        row.put("backgroundImageUrl", template.getBackgroundImageUrl());
        row.put("designFont", blankTo(template.getDesignFont(), "Arial"));
        row.put("designFontSize", blankTo(template.getDesignFontSize(), "16"));
        row.put("designTextColor", blankTo(template.getDesignTextColor(), "#000000"));
        row.put("designTitleColor", blankTo(template.getDesignTitleColor(), "#000000"));
        row.put("designLayout", blankTo(template.getDesignLayout(), "Portrait"));
        return row;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
