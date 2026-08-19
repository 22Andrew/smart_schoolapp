package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Order(18)
public class CertificateService implements ApplicationRunner {

    public static final String TYPE_TRANSFER = "TRANSFER";
    public static final String TYPE_CERTIFICATE = "CERTIFICATE";
    public static final String TYPE_STUDENT_ID = "STUDENT_ID";
    public static final String TYPE_STAFF_ID = "STAFF_ID";

    private static final String DEFAULT_BODY =
            "This is to certify that [name] son/daughter of [father_name] is a bonafide student of this school. "
                    + "He/She is studying in class [class] section [section] with admission no. [admission_no]. "
                    + "Date of birth as per school record is [dob]. Issued on [created_at].";

    private final StudentCertificateTemplateRepository certificateTemplateRepository;
    private final StudentIdCardTemplateRepository studentIdCardRepository;
    private final StaffIdCardTemplateRepository staffIdCardRepository;
    private final CertificateIssueRepository issueRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final StudentAdmissionService studentAdmissionService;
    private final StaffMemberRepository staffMemberRepository;
    private final SchoolGeneralSettingRepository generalSettingRepository;
    private final UploadStorage uploadStorage;

    public CertificateService(
            StudentCertificateTemplateRepository certificateTemplateRepository,
            StudentIdCardTemplateRepository studentIdCardRepository,
            StaffIdCardTemplateRepository staffIdCardRepository,
            CertificateIssueRepository issueRepository,
            StudentAdmissionRepository studentAdmissionRepository,
            StudentAdmissionService studentAdmissionService,
            StaffMemberRepository staffMemberRepository,
            SchoolGeneralSettingRepository generalSettingRepository,
            UploadStorage uploadStorage
    ) {
        this.certificateTemplateRepository = certificateTemplateRepository;
        this.studentIdCardRepository = studentIdCardRepository;
        this.staffIdCardRepository = staffIdCardRepository;
        this.issueRepository = issueRepository;
        this.studentAdmissionRepository = studentAdmissionRepository;
        this.studentAdmissionService = studentAdmissionService;
        this.staffMemberRepository = staffMemberRepository;
        this.generalSettingRepository = generalSettingRepository;
        this.uploadStorage = uploadStorage;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (certificateTemplateRepository.count() == 0) {
            StudentCertificateTemplate template = StudentCertificateTemplate.builder()
                    .certificateName("Character Certificate")
                    .headerLeftText("Affiliation No.")
                    .headerCenterText("Character Certificate")
                    .headerRightText("School Code")
                    .bodyText(DEFAULT_BODY)
                    .footerLeftText("Class Teacher")
                    .footerCenterText("Checked By")
                    .footerRightText("Principal")
                    .headerHeight(80)
                    .footerHeight(70)
                    .bodyHeight(420)
                    .bodyWidth(800)
                    .studentPhoto(true)
                    .build();
            template.setIsActive(true);
            certificateTemplateRepository.save(template);
        }
        if (studentIdCardRepository.count() == 0) {
            StudentIdCardTemplate card = StudentIdCardTemplate.builder()
                    .idCardTitle("Student Identity Card")
                    .schoolName(schoolName())
                    .schoolAddress(schoolAddress())
                    .headerColor("#8b5cf6")
                    .designType("vertical")
                    .showAdmissionNo(true)
                    .showStudentName(true)
                    .showClass(true)
                    .showFatherName(true)
                    .showMotherName(true)
                    .showAddress(true)
                    .showPhone(true)
                    .showDob(true)
                    .showBloodGroup(true)
                    .showRollNo(true)
                    .showHouse(true)
                    .showBarcode(true)
                    .build();
            card.setIsActive(true);
            studentIdCardRepository.save(card);
        }
        if (staffIdCardRepository.count() == 0) {
            StaffIdCardTemplate card = StaffIdCardTemplate.builder()
                    .idCardTitle("Staff Identity Card")
                    .schoolName(schoolName())
                    .schoolAddress(schoolAddress())
                    .headerColor("#8b5cf6")
                    .designType("vertical")
                    .showStaffId(true)
                    .showStaffName(true)
                    .showDesignation(true)
                    .showDepartment(true)
                    .showFatherName(true)
                    .showMotherName(false)
                    .showDateOfJoining(true)
                    .showDob(true)
                    .showPhone(true)
                    .showAddress(true)
                    .showBarcode(true)
                    .build();
            card.setIsActive(true);
            staffIdCardRepository.save(card);
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchStudents(Long classId, String section) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        List<StudentAdmission> students = studentAdmissionRepository.search(classId, section, null, false, null);
        Map<Long, CertificateIssue> latestTc = new LinkedHashMap<>();
        List<Long> ids = students.stream().map(StudentAdmission::getId).toList();
        if (!ids.isEmpty()) {
            for (CertificateIssue issue : issueRepository.findByIssueTypeAndStudent_IdInOrderByIdDesc(TYPE_TRANSFER, ids)) {
                if (issue.getStudent() != null) {
                    latestTc.putIfAbsent(issue.getStudent().getId(), issue);
                }
            }
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : students) {
            Map<String, Object> map = studentAdmissionService.toMap(student);
            CertificateIssue issued = latestTc.get(student.getId());
            map.put("issued", issued != null);
            map.put("issueId", issued == null ? null : issued.getId());
            map.put("documentNumber", issued == null ? "" : issued.getDocumentNumber());
            rows.add(map);
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> verifyTransfer(String documentNumber) {
        if (documentNumber == null || documentNumber.isBlank()) {
            throw new IllegalArgumentException("Certificate number is required");
        }
        CertificateIssue issue = issueRepository.findByDocumentNumberIgnoreCase(documentNumber.trim())
                .orElseThrow(() -> new IllegalArgumentException("Transfer certificate not found"));
        return printPayload(issue);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchStaff(String role) {
        String needle = role == null ? "" : role.trim().toLowerCase(Locale.ROOT);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (StaffMember member : staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc()) {
            if (!needle.isBlank()) {
                String roles = member.getRoles() == null ? "" : member.getRoles().toLowerCase(Locale.ROOT);
                if (!roles.contains(needle)) {
                    continue;
                }
            }
            rows.add(staffMap(member));
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listCertificateTemplates() {
        return certificateTemplateRepository.findAllByOrderByIdDesc().stream().map(this::certificateMap).toList();
    }

    @Transactional
    public Map<String, Object> saveCertificateTemplate(Long id, Map<String, Object> body, MultipartFile background) {
        String name = text(body.get("certificateName"));
        String certText = text(body.get("bodyText"));
        if (name.isBlank()) throw new IllegalArgumentException("Certificate Name is required");
        if (certText.isBlank()) throw new IllegalArgumentException("Body Text is required");
        StudentCertificateTemplate template = id == null
                ? new StudentCertificateTemplate()
                : certificateTemplateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Certificate template not found"));
        template.setCertificateName(name);
        template.setHeaderLeftText(text(body.get("headerLeftText")));
        template.setHeaderCenterText(text(body.get("headerCenterText")));
        template.setHeaderRightText(text(body.get("headerRightText")));
        template.setBodyText(certText);
        template.setFooterLeftText(text(body.get("footerLeftText")));
        template.setFooterCenterText(text(body.get("footerCenterText")));
        template.setFooterRightText(text(body.get("footerRightText")));
        template.setHeaderHeight(intVal(body.get("headerHeight"), 80));
        template.setFooterHeight(intVal(body.get("footerHeight"), 70));
        template.setBodyHeight(intVal(body.get("bodyHeight"), 420));
        template.setBodyWidth(intVal(body.get("bodyWidth"), 800));
        template.setStudentPhoto(boolVal(body.get("studentPhoto")));
        if (background != null && !background.isEmpty()) {
            template.setBackgroundImageUrl(storeImage(background));
        }
        if (template.getIsActive() == null) template.setIsActive(true);
        return certificateMap(certificateTemplateRepository.save(template));
    }

    @Transactional
    public void deleteCertificateTemplate(Long id) {
        if (!certificateTemplateRepository.existsById(id)) {
            throw new IllegalArgumentException("Certificate template not found");
        }
        certificateTemplateRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listStudentIdCards() {
        return studentIdCardRepository.findAllByOrderByIdDesc().stream().map(this::studentIdMap).toList();
    }

    @Transactional
    public Map<String, Object> saveStudentIdCard(Long id, Map<String, Object> body,
                                                MultipartFile background, MultipartFile logo, MultipartFile signature) {
        String title = text(body.get("idCardTitle"));
        String school = text(body.get("schoolName"));
        String address = text(body.get("schoolAddress"));
        if (title.isBlank()) throw new IllegalArgumentException("ID Card Title is required");
        if (school.isBlank()) throw new IllegalArgumentException("School Name is required");
        if (address.isBlank()) throw new IllegalArgumentException("Address / Phone / Email is required");
        StudentIdCardTemplate card = id == null
                ? new StudentIdCardTemplate()
                : studentIdCardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student ID card not found"));
        card.setIdCardTitle(title);
        card.setSchoolName(school);
        card.setSchoolAddress(address);
        card.setHeaderColor(blankTo(text(body.get("headerColor")), "#8b5cf6"));
        card.setDesignType(blankTo(text(body.get("designType")), "vertical"));
        card.setShowAdmissionNo(boolVal(body.get("showAdmissionNo")));
        card.setShowStudentName(boolVal(body.get("showStudentName")));
        card.setShowClass(boolVal(body.get("showClass")));
        card.setShowFatherName(boolVal(body.get("showFatherName")));
        card.setShowMotherName(boolVal(body.get("showMotherName")));
        card.setShowAddress(boolVal(body.get("showAddress")));
        card.setShowPhone(boolVal(body.get("showPhone")));
        card.setShowDob(boolVal(body.get("showDob")));
        card.setShowBloodGroup(boolVal(body.get("showBloodGroup")));
        card.setShowRollNo(boolVal(body.get("showRollNo")));
        card.setShowHouse(boolVal(body.get("showHouse")));
        card.setShowBarcode(boolVal(body.get("showBarcode")));
        if (background != null && !background.isEmpty()) card.setBackgroundImageUrl(storeImage(background));
        if (logo != null && !logo.isEmpty()) card.setLogoUrl(storeImage(logo));
        if (signature != null && !signature.isEmpty()) card.setSignatureUrl(storeImage(signature));
        if (card.getIsActive() == null) card.setIsActive(true);
        return studentIdMap(studentIdCardRepository.save(card));
    }

    @Transactional
    public void deleteStudentIdCard(Long id) {
        if (!studentIdCardRepository.existsById(id)) {
            throw new IllegalArgumentException("Student ID card not found");
        }
        studentIdCardRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listStaffIdCards() {
        return staffIdCardRepository.findAllByOrderByIdDesc().stream().map(this::staffIdMap).toList();
    }

    @Transactional
    public Map<String, Object> saveStaffIdCard(Long id, Map<String, Object> body,
                                              MultipartFile background, MultipartFile logo, MultipartFile signature) {
        String title = text(body.get("idCardTitle"));
        String school = text(body.get("schoolName"));
        String address = text(body.get("schoolAddress"));
        if (title.isBlank()) throw new IllegalArgumentException("ID Card Title is required");
        if (school.isBlank()) throw new IllegalArgumentException("School Name is required");
        if (address.isBlank()) throw new IllegalArgumentException("Address / Phone / Email is required");
        StaffIdCardTemplate card = id == null
                ? new StaffIdCardTemplate()
                : staffIdCardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff ID card not found"));
        card.setIdCardTitle(title);
        card.setSchoolName(school);
        card.setSchoolAddress(address);
        card.setHeaderColor(blankTo(text(body.get("headerColor")), "#8b5cf6"));
        card.setDesignType(blankTo(text(body.get("designType")), "horizontal"));
        card.setShowStaffId(boolVal(body.get("showStaffId")));
        card.setShowStaffName(boolVal(body.get("showStaffName")));
        card.setShowDesignation(boolVal(body.get("showDesignation")));
        card.setShowDepartment(boolVal(body.get("showDepartment")));
        card.setShowFatherName(boolVal(body.get("showFatherName")));
        card.setShowMotherName(boolVal(body.get("showMotherName")));
        card.setShowDateOfJoining(boolVal(body.get("showDateOfJoining")));
        card.setShowDob(boolVal(body.get("showDob")));
        card.setShowPhone(boolVal(body.get("showPhone")));
        card.setShowAddress(boolVal(body.get("showAddress")));
        card.setShowBarcode(boolVal(body.get("showBarcode")));
        if (background != null && !background.isEmpty()) card.setBackgroundImageUrl(storeImage(background));
        if (logo != null && !logo.isEmpty()) card.setLogoUrl(storeImage(logo));
        if (signature != null && !signature.isEmpty()) card.setSignatureUrl(storeImage(signature));
        if (card.getIsActive() == null) card.setIsActive(true);
        return staffIdMap(staffIdCardRepository.save(card));
    }

    @Transactional
    public void deleteStaffIdCard(Long id) {
        if (!staffIdCardRepository.existsById(id)) {
            throw new IllegalArgumentException("Staff ID card not found");
        }
        staffIdCardRepository.deleteById(id);
    }

    @Transactional
    public Map<String, Object> issueTransfer(Long studentId, Map<String, Object> body) {
        StudentAdmission student = requireStudent(studentId);
        CertificateIssue issue = CertificateIssue.builder()
                .issueType(TYPE_TRANSFER)
                .documentNumber(nextNumber("TC"))
                .student(student)
                .issueDate(dateVal(body.get("issueDate"), LocalDate.now()))
                .leavingDate(dateVal(body.get("leavingDate"), LocalDate.now()))
                .reason(blankTo(text(body.get("reason")), "Parent request"))
                .remarks(text(body.get("remarks")))
                .lastClass(student.getSchoolClass() != null ? student.getSchoolClass().getName() : "")
                .qualified(blankTo(text(body.get("qualified")), "Yes"))
                .duesPaid(blankTo(text(body.get("duesPaid")), "Yes"))
                .conduct(blankTo(text(body.get("conduct")), "Good"))
                .build();
        issue.setIsActive(true);
        return printPayload(issueRepository.save(issue));
    }

    @Transactional
    public List<Map<String, Object>> issueCertificates(List<Long> studentIds, Long templateId) {
        if (templateId == null) throw new IllegalArgumentException("Certificate is required");
        if (studentIds == null || studentIds.isEmpty()) throw new IllegalArgumentException("Select at least one student");
        certificateTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Certificate template not found"));
        List<Map<String, Object>> issued = new ArrayList<>();
        for (Long studentId : studentIds) {
            StudentAdmission student = requireStudent(studentId);
            CertificateIssue issue = CertificateIssue.builder()
                    .issueType(TYPE_CERTIFICATE)
                    .documentNumber(nextNumber("CERT"))
                    .student(student)
                    .templateId(templateId)
                    .issueDate(LocalDate.now())
                    .build();
            issue.setIsActive(true);
            issued.add(printPayload(issueRepository.save(issue)));
        }
        return issued;
    }

    @Transactional
    public List<Map<String, Object>> issueStudentIdCards(List<Long> studentIds, Long templateId) {
        if (templateId == null) throw new IllegalArgumentException("ID Card is required");
        if (studentIds == null || studentIds.isEmpty()) throw new IllegalArgumentException("Select at least one student");
        studentIdCardRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Student ID card not found"));
        List<Map<String, Object>> issued = new ArrayList<>();
        for (Long studentId : studentIds) {
            StudentAdmission student = requireStudent(studentId);
            CertificateIssue issue = CertificateIssue.builder()
                    .issueType(TYPE_STUDENT_ID)
                    .documentNumber(nextNumber("SID"))
                    .student(student)
                    .templateId(templateId)
                    .issueDate(LocalDate.now())
                    .build();
            issue.setIsActive(true);
            issued.add(printPayload(issueRepository.save(issue)));
        }
        return issued;
    }

    @Transactional
    public List<Map<String, Object>> issueStaffIdCards(List<Long> staffIds, Long templateId) {
        if (templateId == null) throw new IllegalArgumentException("ID Card is required");
        if (staffIds == null || staffIds.isEmpty()) throw new IllegalArgumentException("Select at least one staff member");
        staffIdCardRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Staff ID card not found"));
        List<Map<String, Object>> issued = new ArrayList<>();
        for (Long staffId : staffIds) {
            StaffMember staff = staffMemberRepository.findById(staffId)
                    .orElseThrow(() -> new IllegalArgumentException("Staff not found"));
            CertificateIssue issue = CertificateIssue.builder()
                    .issueType(TYPE_STAFF_ID)
                    .documentNumber(nextNumber("FID"))
                    .staff(staff)
                    .templateId(templateId)
                    .issueDate(LocalDate.now())
                    .build();
            issue.setIsActive(true);
            issued.add(printPayload(issueRepository.save(issue)));
        }
        return issued;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPrintPayload(Long id) {
        CertificateIssue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Certificate record not found"));
        return printPayload(issue);
    }

    private Map<String, Object> printPayload(CertificateIssue issue) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", issue.getId());
        map.put("issueType", issue.getIssueType());
        map.put("documentNumber", issue.getDocumentNumber());
        map.put("issueDate", issue.getIssueDate());
        map.put("leavingDate", issue.getLeavingDate());
        map.put("reason", issue.getReason());
        map.put("remarks", issue.getRemarks());
        map.put("lastClass", issue.getLastClass());
        map.put("qualified", issue.getQualified());
        map.put("duesPaid", issue.getDuesPaid());
        map.put("conduct", issue.getConduct());
        map.put("schoolName", schoolName());
        map.put("schoolAddress", schoolAddress());
        map.put("schoolPhone", schoolPhone());
        map.put("schoolEmail", schoolEmail());
        map.put("session", schoolSession());
        if (issue.getStudent() != null) {
            map.put("student", studentAdmissionService.toMap(issue.getStudent()));
        }
        if (issue.getStaff() != null) {
            map.put("staff", staffMap(issue.getStaff()));
        }
        if (TYPE_CERTIFICATE.equals(issue.getIssueType()) && issue.getTemplateId() != null) {
            StudentCertificateTemplate template = certificateTemplateRepository.findById(issue.getTemplateId()).orElse(null);
            if (template != null) {
                Map<String, Object> templateMap = certificateMap(template);
                templateMap.put("renderedBody", renderBody(template.getBodyText(), issue));
                map.put("template", templateMap);
            }
        }
        if (TYPE_STUDENT_ID.equals(issue.getIssueType()) && issue.getTemplateId() != null) {
            studentIdCardRepository.findById(issue.getTemplateId()).ifPresent(card -> map.put("template", studentIdMap(card)));
        }
        if (TYPE_STAFF_ID.equals(issue.getIssueType()) && issue.getTemplateId() != null) {
            staffIdCardRepository.findById(issue.getTemplateId()).ifPresent(card -> map.put("template", staffIdMap(card)));
        }
        return map;
    }

    private String renderBody(String body, CertificateIssue issue) {
        Map<String, Object> student = issue.getStudent() == null
                ? Map.of()
                : studentAdmissionService.toMap(issue.getStudent());
        String text = body == null ? "" : body;
        text = replace(text, "[name]", str(student.get("studentName")));
        text = replace(text, "[dob]", str(student.get("dateOfBirth")));
        text = replace(text, "[present_address]", str(student.get("currentAddress")));
        text = replace(text, "[guardian]", str(student.get("guardianName")));
        text = replace(text, "[created_at]", issue.getIssueDate() == null ? "" : issue.getIssueDate().toString());
        text = replace(text, "[admission_no]", str(student.get("admissionNo")));
        text = replace(text, "[roll_no]", str(student.get("rollNumber")));
        text = replace(text, "[class]", str(student.get("className")));
        text = replace(text, "[section]", str(student.get("section")));
        text = replace(text, "[gender]", str(student.get("gender")));
        text = replace(text, "[admission_date]", str(student.get("admissionDate")));
        text = replace(text, "[category]", str(student.get("categoryName")));
        text = replace(text, "[cast]", str(student.get("categoryName")));
        text = replace(text, "[father_name]", str(student.get("fatherName")));
        text = replace(text, "[mother_name]", str(student.get("motherName")));
        text = replace(text, "[religion]", str(student.get("religion")));
        text = replace(text, "[email]", str(student.get("email")));
        text = replace(text, "[phone]", str(student.get("mobileNumber")));
        return text;
    }

    private Map<String, Object> certificateMap(StudentCertificateTemplate template) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", template.getId());
        map.put("certificateName", template.getCertificateName());
        map.put("headerLeftText", template.getHeaderLeftText());
        map.put("headerCenterText", template.getHeaderCenterText());
        map.put("headerRightText", template.getHeaderRightText());
        map.put("bodyText", template.getBodyText());
        map.put("footerLeftText", template.getFooterLeftText());
        map.put("footerCenterText", template.getFooterCenterText());
        map.put("footerRightText", template.getFooterRightText());
        map.put("headerHeight", template.getHeaderHeight());
        map.put("footerHeight", template.getFooterHeight());
        map.put("bodyHeight", template.getBodyHeight());
        map.put("bodyWidth", template.getBodyWidth());
        map.put("studentPhoto", template.isStudentPhoto());
        map.put("backgroundImageUrl", template.getBackgroundImageUrl());
        return map;
    }

    private Map<String, Object> studentIdMap(StudentIdCardTemplate card) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", card.getId());
        map.put("idCardTitle", card.getIdCardTitle());
        map.put("schoolName", card.getSchoolName());
        map.put("schoolAddress", card.getSchoolAddress());
        map.put("headerColor", card.getHeaderColor());
        map.put("designType", card.getDesignType());
        map.put("backgroundImageUrl", card.getBackgroundImageUrl());
        map.put("logoUrl", card.getLogoUrl());
        map.put("signatureUrl", card.getSignatureUrl());
        map.put("showAdmissionNo", card.isShowAdmissionNo());
        map.put("showStudentName", card.isShowStudentName());
        map.put("showClass", card.isShowClass());
        map.put("showFatherName", card.isShowFatherName());
        map.put("showMotherName", card.isShowMotherName());
        map.put("showAddress", card.isShowAddress());
        map.put("showPhone", card.isShowPhone());
        map.put("showDob", card.isShowDob());
        map.put("showBloodGroup", card.isShowBloodGroup());
        map.put("showRollNo", card.isShowRollNo());
        map.put("showHouse", card.isShowHouse());
        map.put("showBarcode", card.isShowBarcode());
        return map;
    }

    private Map<String, Object> staffIdMap(StaffIdCardTemplate card) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", card.getId());
        map.put("idCardTitle", card.getIdCardTitle());
        map.put("schoolName", card.getSchoolName());
        map.put("schoolAddress", card.getSchoolAddress());
        map.put("headerColor", card.getHeaderColor());
        map.put("designType", card.getDesignType());
        map.put("backgroundImageUrl", card.getBackgroundImageUrl());
        map.put("logoUrl", card.getLogoUrl());
        map.put("signatureUrl", card.getSignatureUrl());
        map.put("showStaffId", card.isShowStaffId());
        map.put("showStaffName", card.isShowStaffName());
        map.put("showDesignation", card.isShowDesignation());
        map.put("showDepartment", card.isShowDepartment());
        map.put("showFatherName", card.isShowFatherName());
        map.put("showMotherName", card.isShowMotherName());
        map.put("showDateOfJoining", card.isShowDateOfJoining());
        map.put("showDob", card.isShowDob());
        map.put("showPhone", card.isShowPhone());
        map.put("showAddress", card.isShowAddress());
        map.put("showBarcode", card.isShowBarcode());
        return map;
    }

    private Map<String, Object> staffMap(StaffMember member) {
        Map<String, Object> map = new LinkedHashMap<>();
        String first = member.getFirstName() == null ? "" : member.getFirstName().trim();
        String last = member.getLastName() == null ? "" : member.getLastName().trim();
        map.put("id", member.getId());
        map.put("staffId", member.getStaffId());
        map.put("fullName", (first + " " + last).trim());
        map.put("role", member.getRoles());
        map.put("designation", member.getDesignation());
        map.put("department", member.getDepartment());
        map.put("fatherName", member.getFatherName());
        map.put("motherName", member.getMotherName());
        map.put("email", member.getEmail());
        map.put("gender", member.getGender());
        map.put("dateOfBirth", member.getDateOfBirth());
        map.put("dateOfJoining", member.getDateOfJoining());
        map.put("phone", member.getPhone());
        map.put("address", member.getAddress());
        map.put("photoPath", member.getPhotoPath());
        return map;
    }

    private StudentAdmission requireStudent(Long studentId) {
        return studentAdmissionRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
    }

    private String nextNumber(String prefix) {
        String type = switch (prefix) {
            case "TC" -> TYPE_TRANSFER;
            case "CERT" -> TYPE_CERTIFICATE;
            case "SID" -> TYPE_STUDENT_ID;
            default -> TYPE_STAFF_ID;
        };
        long count = issueRepository.countByIssueType(type) + 1;
        return prefix + "-" + LocalDate.now().getYear() + "-" + String.format("%04d", count);
    }

    private String storeImage(MultipartFile file) {
        try {
            String original = file.getOriginalFilename() == null ? "image.jpg" : file.getOriginalFilename();
            String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
            String filename = UUID.randomUUID() + ext;
            Path target = uploadStorage.getCertificatesDir().resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/certificates/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store image: " + e.getMessage());
        }
    }

    private SchoolGeneralSetting settings() {
        return generalSettingRepository.findAll().stream().findFirst().orElse(null);
    }

    private String schoolName() {
        SchoolGeneralSetting setting = settings();
        return setting == null || setting.getSchoolName() == null ? "Smart School" : setting.getSchoolName();
    }

    private String schoolAddress() {
        SchoolGeneralSetting setting = settings();
        return setting == null || setting.getAddress() == null ? "" : setting.getAddress();
    }

    private String schoolPhone() {
        SchoolGeneralSetting setting = settings();
        return setting == null || setting.getPhone() == null ? "" : setting.getPhone();
    }

    private String schoolEmail() {
        SchoolGeneralSetting setting = settings();
        return setting == null || setting.getEmail() == null ? "" : setting.getEmail();
    }

    private String schoolSession() {
        SchoolGeneralSetting setting = settings();
        return setting == null || setting.getSession() == null ? "" : setting.getSession();
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private static String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static String str(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private static String replace(String source, String token, String value) {
        return source.replace(token, value == null ? "" : value);
    }

    private static boolean boolVal(Object value) {
        if (value instanceof Boolean bool) return bool;
        String text = text(value).toLowerCase(Locale.ROOT);
        return "true".equals(text) || "1".equals(text) || "yes".equals(text) || "on".equals(text);
    }

    private static int intVal(Object value, int fallback) {
        try {
            String text = text(value);
            return text.isBlank() ? fallback : Integer.parseInt(text);
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    private static LocalDate dateVal(Object value, LocalDate fallback) {
        String text = text(value);
        if (text.isBlank()) return fallback;
        try {
            return LocalDate.parse(text, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e) {
            return fallback;
        }
    }
}
