package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.CertificateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @GetMapping({"/admin/transfercertificate/download", "/admin/transfercertificate"})
    public String transferCertificatePage() {
        return "transfer-certificate";
    }

    @GetMapping("/admin/certificate/index")
    public String studentCertificatePage() {
        return "student-certificate";
    }

    @GetMapping("/admin/generatecertificate")
    public String generateCertificatePage() {
        return "generate-certificate";
    }

    @GetMapping("/admin/studentidcard")
    public String studentIdCardPage() {
        return "student-id-card";
    }

    @GetMapping("/admin/generateidcard")
    public String generateIdCardPage() {
        return "generate-id-card";
    }

    @GetMapping("/admin/staffidcard")
    public String staffIdCardPage() {
        return "staff-id-card";
    }

    @GetMapping("/admin/generatestaffidcard")
    public String generateStaffIdCardPage() {
        return "generate-staff-id-card";
    }

    @GetMapping("/admin/certificate/print/{id}")
    public String printPage() {
        return "certificate-print";
    }

    @GetMapping("/api/certificates/students")
    @ResponseBody
    public ResponseEntity<?> searchStudents(
            @RequestParam Long classId,
            @RequestParam(required = false) String section
    ) {
        return ResponseEntity.ok(certificateService.searchStudents(classId, section));
    }

    @GetMapping("/api/certificates/transfer/verify")
    @ResponseBody
    public ResponseEntity<?> verifyTransfer(@RequestParam String certificateNo) {
        return ResponseEntity.ok(certificateService.verifyTransfer(certificateNo));
    }

    @GetMapping("/api/certificates/staff")
    @ResponseBody
    public ResponseEntity<?> searchStaff(@RequestParam(required = false) String role) {
        return ResponseEntity.ok(certificateService.searchStaff(role));
    }

    @GetMapping("/api/certificates/templates")
    @ResponseBody
    public ResponseEntity<?> listTemplates() {
        return ResponseEntity.ok(certificateService.listCertificateTemplates());
    }

    @PostMapping(value = "/api/certificates/templates", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE })
    @ResponseBody
    public ResponseEntity<?> createTemplate(
            @RequestParam Map<String, String> body,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage
    ) {
        return created(certificateService.saveCertificateTemplate(null, asObjectMap(body), backgroundImage), "Certificate saved successfully!");
    }

    @PostMapping(value = "/api/certificates/templates/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE })
    @ResponseBody
    public ResponseEntity<?> updateTemplatePost(
            @PathVariable Long id,
            @RequestParam Map<String, String> body,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage
    ) {
        return updateTemplate(id, body, backgroundImage);
    }

    @PutMapping(value = "/api/certificates/templates/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE })
    @ResponseBody
    public ResponseEntity<?> updateTemplate(
            @PathVariable Long id,
            @RequestParam Map<String, String> body,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage
    ) {
        return ok(certificateService.saveCertificateTemplate(id, asObjectMap(body), backgroundImage), "Certificate updated successfully!");
    }

    @DeleteMapping("/api/certificates/templates/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteTemplate(@PathVariable Long id) {
        certificateService.deleteCertificateTemplate(id);
        return ok(null, "Certificate deleted successfully!");
    }

    @GetMapping("/api/certificates/student-id-cards")
    @ResponseBody
    public ResponseEntity<?> listStudentIdCards() {
        return ResponseEntity.ok(certificateService.listStudentIdCards());
    }

    @PostMapping(value = "/api/certificates/student-id-cards", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE })
    @ResponseBody
    public ResponseEntity<?> createStudentIdCard(
            @RequestParam Map<String, String> body,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage,
            @RequestParam(value = "logo", required = false) MultipartFile logo,
            @RequestParam(value = "signature", required = false) MultipartFile signature
    ) {
        return created(certificateService.saveStudentIdCard(null, asObjectMap(body), backgroundImage, logo, signature), "Student ID card saved successfully!");
    }

    @PostMapping(value = "/api/certificates/student-id-cards/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE })
    @ResponseBody
    public ResponseEntity<?> updateStudentIdCardPost(
            @PathVariable Long id,
            @RequestParam Map<String, String> body,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage,
            @RequestParam(value = "logo", required = false) MultipartFile logo,
            @RequestParam(value = "signature", required = false) MultipartFile signature
    ) {
        return updateStudentIdCard(id, body, backgroundImage, logo, signature);
    }

    @PutMapping(value = "/api/certificates/student-id-cards/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE })
    @ResponseBody
    public ResponseEntity<?> updateStudentIdCard(
            @PathVariable Long id,
            @RequestParam Map<String, String> body,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage,
            @RequestParam(value = "logo", required = false) MultipartFile logo,
            @RequestParam(value = "signature", required = false) MultipartFile signature
    ) {
        return ok(certificateService.saveStudentIdCard(id, asObjectMap(body), backgroundImage, logo, signature), "Student ID card updated successfully!");
    }

    @DeleteMapping("/api/certificates/student-id-cards/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteStudentIdCard(@PathVariable Long id) {
        certificateService.deleteStudentIdCard(id);
        return ok(null, "Student ID card deleted successfully!");
    }

    @GetMapping("/api/certificates/staff-id-cards")
    @ResponseBody
    public ResponseEntity<?> listStaffIdCards() {
        return ResponseEntity.ok(certificateService.listStaffIdCards());
    }

    @PostMapping(value = "/api/certificates/staff-id-cards", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE })
    @ResponseBody
    public ResponseEntity<?> createStaffIdCard(
            @RequestParam Map<String, String> body,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage,
            @RequestParam(value = "logo", required = false) MultipartFile logo,
            @RequestParam(value = "signature", required = false) MultipartFile signature
    ) {
        return created(certificateService.saveStaffIdCard(null, asObjectMap(body), backgroundImage, logo, signature), "Staff ID card saved successfully!");
    }

    @PostMapping(value = "/api/certificates/staff-id-cards/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE })
    @ResponseBody
    public ResponseEntity<?> updateStaffIdCardPost(
            @PathVariable Long id,
            @RequestParam Map<String, String> body,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage,
            @RequestParam(value = "logo", required = false) MultipartFile logo,
            @RequestParam(value = "signature", required = false) MultipartFile signature
    ) {
        return updateStaffIdCard(id, body, backgroundImage, logo, signature);
    }

    @PutMapping(value = "/api/certificates/staff-id-cards/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE })
    @ResponseBody
    public ResponseEntity<?> updateStaffIdCard(
            @PathVariable Long id,
            @RequestParam Map<String, String> body,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage,
            @RequestParam(value = "logo", required = false) MultipartFile logo,
            @RequestParam(value = "signature", required = false) MultipartFile signature
    ) {
        return ok(certificateService.saveStaffIdCard(id, asObjectMap(body), backgroundImage, logo, signature), "Staff ID card updated successfully!");
    }

    @DeleteMapping("/api/certificates/staff-id-cards/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteStaffIdCard(@PathVariable Long id) {
        certificateService.deleteStaffIdCard(id);
        return ok(null, "Staff ID card deleted successfully!");
    }

    @PostMapping("/api/certificates/transfer/{studentId}")
    @ResponseBody
    public ResponseEntity<?> issueTransfer(@PathVariable Long studentId, @RequestBody(required = false) Map<String, Object> body) {
        return created(certificateService.issueTransfer(studentId, body == null ? Map.of() : body), "Transfer certificate saved successfully!");
    }

    @PostMapping("/api/certificates/generate")
    @ResponseBody
    public ResponseEntity<?> generateCertificates(@RequestBody Map<String, Object> body) {
        return created(certificateService.issueCertificates(asLongList(body.get("studentIds")), asLong(body.get("templateId"))),
                "Certificates generated successfully!");
    }

    @PostMapping("/api/certificates/generate-id-cards")
    @ResponseBody
    public ResponseEntity<?> generateIdCards(@RequestBody Map<String, Object> body) {
        return created(certificateService.issueStudentIdCards(asLongList(body.get("studentIds")), asLong(body.get("templateId"))),
                "ID cards generated successfully!");
    }

    @PostMapping("/api/certificates/generate-staff-id-cards")
    @ResponseBody
    public ResponseEntity<?> generateStaffIdCards(@RequestBody Map<String, Object> body) {
        return created(certificateService.issueStaffIdCards(asLongList(body.get("staffIds")), asLong(body.get("templateId"))),
                "Staff ID cards generated successfully!");
    }

    @GetMapping("/api/certificates/print/{id}")
    @ResponseBody
    public ResponseEntity<?> printPayload(@PathVariable Long id) {
        return ResponseEntity.ok(certificateService.getPrintPayload(id));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(body(false, e.getMessage(), null));
    }

    @ExceptionHandler(Exception.class)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(body(false, e.getMessage() == null ? "Save failed" : e.getMessage(), null));
    }

    private ResponseEntity<Map<String, Object>> created(Object data, String message) {
        return ResponseEntity.status(HttpStatus.CREATED).body(body(true, message, data));
    }

    private ResponseEntity<Map<String, Object>> ok(Object data, String message) {
        return ResponseEntity.ok(body(true, message, data));
    }

    private Map<String, Object> body(boolean success, String message, Object data) {
        Map<String, Object> map = new HashMap<>();
        map.put("success", success);
        map.put("message", message);
        if (data != null) map.put("data", data);
        return map;
    }

    private Map<String, Object> asObjectMap(Map<String, String> source) {
        Map<String, Object> map = new HashMap<>();
        if (source != null) {
            source.forEach(map::put);
        }
        return map;
    }

    @SuppressWarnings("unchecked")
    private List<Long> asLongList(Object value) {
        if (value instanceof List<?> list) {
            return list.stream().map(this::asLong).filter(item -> item != null).toList();
        }
        return List.of();
    }

    private Long asLong(Object value) {
        if (value == null || String.valueOf(value).isBlank()) return null;
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
