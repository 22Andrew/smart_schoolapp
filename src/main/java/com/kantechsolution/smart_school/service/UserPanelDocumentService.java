package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.SchoolGoogleDriveSetting;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.StudentDocument;
import com.kantechsolution.smart_school.repository.SchoolGoogleDriveSettingRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import com.kantechsolution.smart_school.repository.StudentDocumentRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@Service
@Order(30)
public class UserPanelDocumentService implements ApplicationRunner {

    private static final String LOCAL_SOURCE = "LOCAL";
    private static final String GOOGLE_DRIVE_SOURCE = "GOOGLE_DRIVE";
    private static final String SAMPLE_FILE_NAME = "School_Admission_Form_Sample_Template (1).pdf";

    private final UserPanelContextService userPanelContextService;
    private final StudentDocumentRepository studentDocumentRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final SchoolGoogleDriveSettingRepository googleDriveSettingRepository;
    private final UploadStorage uploadStorage;

    public UserPanelDocumentService(
            UserPanelContextService userPanelContextService,
            StudentDocumentRepository studentDocumentRepository,
            StudentAdmissionRepository studentAdmissionRepository,
            SchoolGoogleDriveSettingRepository googleDriveSettingRepository,
            UploadStorage uploadStorage
    ) {
        this.userPanelContextService = userPanelContextService;
        this.studentDocumentRepository = studentDocumentRepository;
        this.studentAdmissionRepository = studentAdmissionRepository;
        this.googleDriveSettingRepository = googleDriveSettingRepository;
        this.uploadStorage = uploadStorage;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        try {
            seedSampleDocuments();
        } catch (IOException ignored) {
            // Sample file seeding is best-effort on startup.
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDocuments(Authentication authentication) {
        StudentAdmission student = requireStudent(authentication);
        List<Map<String, Object>> documents = studentDocumentRepository
                .findByStudentAdmissionIdOrderByCreatedAtDescIdDesc(student.getId())
                .stream()
                .map(this::toResponse)
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("studentId", student.getId());
        response.put("documents", documents);
        response.put("googleDrive", getGoogleDriveConfig());
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getGoogleDriveConfig() {
        SchoolGoogleDriveSetting settings = googleDriveSettingRepository.findAll().stream()
                .findFirst()
                .orElse(null);

        Map<String, Object> config = new LinkedHashMap<>();
        if (settings == null) {
            config.put("enabled", false);
            config.put("allowStudentUpload", false);
            config.put("clientId", "");
            config.put("apiKey", "");
            config.put("projectNumberAppId", "");
            return config;
        }

        boolean enabled = Boolean.TRUE.equals(settings.getStatus())
                && Boolean.TRUE.equals(settings.getAllowStudentUpload())
                && !blank(settings.getClientId()).isBlank()
                && !blank(settings.getApiKey()).isBlank();

        config.put("enabled", enabled);
        config.put("allowStudentUpload", Boolean.TRUE.equals(settings.getAllowStudentUpload()));
        config.put("clientId", blank(settings.getClientId()));
        config.put("apiKey", blank(settings.getApiKey()));
        config.put("projectNumberAppId", blank(settings.getProjectNumberAppId()));
        return config;
    }

    @Transactional
    public Map<String, Object> uploadDocument(Authentication authentication, MultipartFile file, String title) {
        StudentAdmission student = requireStudent(authentication);
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please choose a file to upload");
        }

        String originalName = Optional.ofNullable(file.getOriginalFilename())
                .map(String::trim)
                .filter(name -> !name.isBlank())
                .orElse("document");
        String storedPath = storeFile(file);
        String resolvedTitle = resolveTitle(title, originalName);

        StudentDocument document = StudentDocument.builder()
                .studentAdmissionId(student.getId())
                .title(resolvedTitle)
                .fileName(originalName)
                .filePath(storedPath)
                .source(LOCAL_SOURCE)
                .mimeType(Optional.ofNullable(file.getContentType()).orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE))
                .fileSize(file.getSize())
                .build();

        return toResponse(studentDocumentRepository.save(document));
    }

    @Transactional
    public Map<String, Object> uploadGoogleDriveDocument(Authentication authentication, Map<String, Object> body) {
        StudentAdmission student = requireStudent(authentication);
        Map<String, Object> config = getGoogleDriveConfig();
        if (!Boolean.TRUE.equals(config.get("enabled"))) {
            throw new IllegalArgumentException("Google Drive upload is not enabled. Please contact the school administrator.");
        }

        String fileId = text(body.get("fileId"));
        String fileName = text(body.get("fileName"));
        if (fileId.isBlank() || fileName.isBlank()) {
            throw new IllegalArgumentException("Selected Google Drive file is invalid");
        }

        String title = resolveTitle(text(body.get("title")), fileName);
        String driveUrl = text(body.get("url"));
        if (driveUrl.isBlank()) {
            driveUrl = "https://drive.google.com/file/d/" + fileId + "/view";
        }

        StudentDocument document = StudentDocument.builder()
                .studentAdmissionId(student.getId())
                .title(title)
                .fileName(fileName)
                .source(GOOGLE_DRIVE_SOURCE)
                .googleDriveFileId(fileId)
                .googleDriveUrl(driveUrl)
                .mimeType(text(body.get("mimeType")))
                .fileSize(parseLong(body.get("fileSize")))
                .build();

        return toResponse(studentDocumentRepository.save(document));
    }

    @Transactional(readOnly = true)
    public DownloadPayload getDownloadPayload(Authentication authentication, Long documentId) {
        StudentAdmission student = requireStudent(authentication);
        StudentDocument document = requireOwnedDocument(student.getId(), documentId);

        if (GOOGLE_DRIVE_SOURCE.equalsIgnoreCase(document.getSource())) {
            String downloadUrl = document.getGoogleDriveUrl();
            if (downloadUrl == null || downloadUrl.isBlank()) {
                downloadUrl = "https://drive.google.com/uc?export=download&id=" + document.getGoogleDriveFileId();
            } else if (downloadUrl.contains("/file/d/")) {
                String fileId = document.getGoogleDriveFileId();
                if (fileId != null && !fileId.isBlank()) {
                    downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;
                }
            }
            return DownloadPayload.external(downloadUrl, document.getFileName());
        }

        if (document.getFilePath() == null || document.getFilePath().isBlank()) {
            throw new IllegalArgumentException("Document file is not available");
        }

        Path filePath = resolveLocalPath(document.getFilePath());
        if (!Files.exists(filePath)) {
            throw new IllegalArgumentException("Document file was not found");
        }

        Resource resource = new FileSystemResource(filePath);
        String contentType = document.getMimeType();
        if (contentType == null || contentType.isBlank()) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        return DownloadPayload.local(resource, document.getFileName(), contentType);
    }

    private void seedSampleDocuments() throws IOException {
        List<StudentAdmission> students = studentAdmissionRepository.findAllByOrderByIdDesc();
        if (students.isEmpty()) {
            return;
        }

        Path documentsDir = uploadStorage.getStudentDocumentsDir();
        Files.createDirectories(documentsDir);
        Path samplePath = documentsDir.resolve("sample-admission-form.pdf");
        if (!Files.exists(samplePath)) {
            Files.writeString(samplePath, buildSamplePdfContent(), StandardCharsets.US_ASCII);
        }

        String publicPath = "/uploads/student-documents/sample-admission-form.pdf";
        long fileSize = Files.size(samplePath);
        for (StudentAdmission student : students) {
            if (studentDocumentRepository.countByStudentAdmissionId(student.getId()) > 0) {
                continue;
            }
            studentDocumentRepository.save(StudentDocument.builder()
                    .studentAdmissionId(student.getId())
                    .title("Document")
                    .fileName(SAMPLE_FILE_NAME)
                    .filePath(publicPath)
                    .source(LOCAL_SOURCE)
                    .mimeType(MediaType.APPLICATION_PDF_VALUE)
                    .fileSize(fileSize)
                    .build());
        }
    }

    private String buildSamplePdfContent() {
        return """
                %PDF-1.4
                1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
                2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
                3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
                4 0 obj << /Length 68 >> stream
                BT /F1 18 Tf 72 720 Td (School Admission Form Sample Template) Tj ET
                endstream endobj
                5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
                xref
                0 6
                0000000000 65535 f
                0000000009 00000 n
                0000000058 00000 n
                0000000115 00000 n
                0000000262 00000 n
                0000000380 00000 n
                trailer << /Size 6 /Root 1 0 R >>
                startxref
                459
                %%EOF
                """;
    }

    private StudentDocument requireOwnedDocument(Long studentId, Long documentId) {
        StudentDocument document = studentDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        if (!studentId.equals(document.getStudentAdmissionId())) {
            throw new IllegalArgumentException("Document not found");
        }
        return document;
    }

    private StudentAdmission requireStudent(Authentication authentication) {
        StudentAdmission student = userPanelContextService.resolveStudent(authentication);
        if (student == null) {
            throw new IllegalArgumentException("Student profile not found");
        }
        return student;
    }

    private String storeFile(MultipartFile file) {
        try {
            String original = file.getOriginalFilename();
            String extension = original != null && original.contains(".")
                    ? original.substring(original.lastIndexOf('.'))
                    : "";
            String filename = UUID.randomUUID() + extension;
            Path target = uploadStorage.getStudentDocumentsDir().resolve(filename);
            Files.copy(file.getInputStream(), target);
            return "/uploads/student-documents/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store uploaded file");
        }
    }

    private Path resolveLocalPath(String publicPath) {
        String relative = publicPath.startsWith("/uploads/")
                ? publicPath.substring("/uploads/".length())
                : publicPath;
        return uploadStorage.getRoot().resolve(relative).normalize();
    }

    private String resolveTitle(String title, String fileName) {
        if (title != null && !title.isBlank()) {
            return title.trim();
        }
        int dot = fileName.lastIndexOf('.');
        if (dot > 0) {
            return fileName.substring(0, dot);
        }
        return fileName;
    }

    private Map<String, Object> toResponse(StudentDocument document) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", document.getId());
        map.put("title", document.getTitle());
        map.put("fileName", document.getFileName());
        map.put("source", document.getSource());
        map.put("downloadUrl", "/api/user/user/documents/" + document.getId() + "/download");
        map.put("googleDriveUrl", blank(document.getGoogleDriveUrl()));
        map.put("createdAt", document.getCreatedAt());
        return map;
    }

    private Long parseLong(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Long.parseLong(String.valueOf(value).trim());
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blank(String value) {
        return value == null ? "" : value;
    }

    public record DownloadPayload(
            boolean external,
            String externalUrl,
            Resource resource,
            String fileName,
            String contentType
    ) {
        public static DownloadPayload external(String url, String fileName) {
            return new DownloadPayload(true, url, null, fileName, null);
        }

        public static DownloadPayload local(Resource resource, String fileName, String contentType) {
            return new DownloadPayload(false, null, resource, fileName, contentType);
        }
    }
}
