package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
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
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Order(6)
public class StaffMemberService implements ApplicationRunner {

    private static final List<String> ROLE_OPTIONS = List.of(
            "Super Admin", "Admin", "Teacher", "Faculty", "Technical Head",
            "Principal", "Accountant", "Receptionist", "Librarian"
    );

    private static final List<String> DESIGNATIONS = List.of(
            "Principal", "Vice Principal", "Senior Teacher", "Teacher",
            "Accountant", "Receptionist", "Librarian", "Technical Head", "Admin Officer"
    );

    private static final List<String> DEPARTMENTS = List.of(
            "Admin", "Academic", "Finance", "Library", "Technical", "Reception"
    );

    private static final List<String> CONTRACT_TYPES = List.of(
            "Permanent", "Probation", "Contract", "Part Time"
    );

    private final StaffMemberRepository repository;
    private final UploadStorage uploadStorage;
    private final DepartmentService departmentService;
    private final DesignationService designationService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        seedSampleStaff();
    }

    public Map<String, Object> formOptions() {
        Map<String, Object> options = new LinkedHashMap<>();
        options.put("roles", ROLE_OPTIONS);
        options.put("designations", resolveDesignations());
        options.put("departments", resolveDepartments());
        options.put("genders", List.of("Male", "Female", "Other"));
        options.put("maritalStatuses", List.of("Single", "Married", "Divorced", "Widowed"));
        options.put("contractTypes", CONTRACT_TYPES);
        return options;
    }

    public List<Map<String, Object>> search(String role, String keyword) {
        return repository.search(normalize(role), normalize(keyword)).stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAllDisabled() {
        return repository.findByDisabledTrueOrderByFirstNameAscLastNameAsc().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> searchDisabled(String role, String keyword) {
        return repository.searchDisabled(normalize(role), normalize(keyword)).stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> enableStaff(Long id) {
        StaffMember member = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));
        if (!Boolean.TRUE.equals(member.getDisabled())) {
            throw new IllegalArgumentException("Staff member is already active");
        }
        member.setDisabled(false);
        return toMap(repository.save(member));
    }

    public List<Map<String, Object>> getAllActive() {
        return repository.findByDisabledFalseOrderByFirstNameAscLastNameAsc().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    public Optional<Map<String, Object>> getById(Long id) {
        return repository.findById(id).map(this::toMap);
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> payload, MultipartFile photo, Map<String, MultipartFile> documents) {
        StaffMember member = new StaffMember();
        applyPayload(member, payload, null);
        if (photo != null && !photo.isEmpty()) {
            member.setPhotoPath(storePhoto(photo));
        }
        applyDocuments(member, documents);
        return toMap(repository.save(member));
    }

    @Transactional
    public Map<String, Object> update(Long id, Map<String, Object> payload, MultipartFile photo, Map<String, MultipartFile> documents) {
        StaffMember member = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));
        applyPayload(member, payload, id);
        if (photo != null && !photo.isEmpty()) {
            member.setPhotoPath(storePhoto(photo));
        }
        applyDocuments(member, documents);
        return toMap(repository.save(member));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Staff member not found");
        }
        repository.deleteById(id);
    }

    private void applyPayload(StaffMember member, Map<String, Object> payload, Long currentId) {
        String staffId = requiredText(payload.get("staffId"));
        String email = requiredText(payload.get("email"));
        String role = requiredText(payload.get("role"));
        String firstName = requiredText(payload.get("firstName"));
        String gender = requiredText(payload.get("gender"));
        String panNumber = requiredText(payload.get("panNumber"));

        if (currentId == null) {
            if (repository.findByStaffId(staffId).isPresent()) {
                throw new IllegalArgumentException("Staff ID already exists");
            }
            if (repository.findByEmail(email).isPresent()) {
                throw new IllegalArgumentException("Email already exists");
            }
        } else {
            if (repository.existsByStaffIdAndIdNot(staffId, currentId)) {
                throw new IllegalArgumentException("Staff ID already exists");
            }
            if (repository.existsByEmailAndIdNot(email, currentId)) {
                throw new IllegalArgumentException("Email already exists");
            }
        }

        member.setStaffId(staffId);
        member.setEmail(email);
        member.setRoles(role);
        member.setFirstName(firstName);
        member.setGender(gender);
        member.setPanNumber(panNumber);

        member.setLastName(text(payload.get("lastName")));
        member.setDesignation(text(payload.get("designation")));
        member.setDepartment(text(payload.get("department")));
        member.setFatherName(text(payload.get("fatherName")));
        member.setMotherName(text(payload.get("motherName")));
        member.setPhone(text(payload.get("phone")));
        member.setEmergencyContact(text(payload.get("emergencyContact")));
        member.setMaritalStatus(text(payload.get("maritalStatus")));
        member.setAddress(text(payload.get("address")));
        member.setPermanentAddress(text(payload.get("permanentAddress")));
        member.setQualification(text(payload.get("qualification")));
        member.setWorkExperience(text(payload.get("workExperience")));
        member.setNote(text(payload.get("note")));
        member.setLocation(text(payload.get("location")));
        member.setDateOfBirth(parseDate(payload.get("dateOfBirth")));
        member.setDateOfJoining(parseDate(payload.get("dateOfJoining")));
        member.setEpfNo(text(payload.get("epfNo")));
        member.setBasicSalary(text(payload.get("basicSalary")));
        member.setContractType(text(payload.get("contractType")));
        member.setWorkShift(text(payload.get("workShift")));
        member.setWorkLocation(text(payload.get("workLocation")));
        member.setMedicalLeave(parseInteger(payload.get("medicalLeave")));
        member.setCasualLeave(parseInteger(payload.get("casualLeave")));
        member.setMaternityLeave(parseInteger(payload.get("maternityLeave")));
        member.setSickLeave(parseInteger(payload.get("sickLeave")));
        member.setMandatoryLeave(parseInteger(payload.get("mandatoryLeave")));
        member.setAccountTitle(text(payload.get("accountTitle")));
        member.setBankAccountNumber(text(payload.get("bankAccountNumber")));
        member.setBankName(text(payload.get("bankName")));
        member.setIfscCode(text(payload.get("ifscCode")));
        member.setBankBranchName(text(payload.get("bankBranchName")));
        member.setFacebookUrl(text(payload.get("facebookUrl")));
        member.setTwitterUrl(text(payload.get("twitterUrl")));
        member.setLinkedinUrl(text(payload.get("linkedinUrl")));
        member.setInstagramUrl(text(payload.get("instagramUrl")));
        member.setDisabled(false);
        if (member.getIsActive() == null) {
            member.setIsActive(true);
        }
    }

    private Map<String, Object> toMap(StaffMember member) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", member.getId());
        map.put("staffId", member.getStaffId());
        map.put("roles", splitRoles(member.getRoles()));
        map.put("role", primaryRole(member.getRoles()));
        map.put("designation", member.getDesignation());
        map.put("department", member.getDepartment());
        map.put("firstName", member.getFirstName());
        map.put("lastName", member.getLastName());
        map.put("fullName", fullName(member));
        map.put("fatherName", member.getFatherName());
        map.put("motherName", member.getMotherName());
        map.put("email", member.getEmail());
        map.put("gender", member.getGender());
        map.put("dateOfBirth", member.getDateOfBirth());
        map.put("dateOfJoining", member.getDateOfJoining());
        map.put("phone", member.getPhone());
        map.put("emergencyContact", member.getEmergencyContact());
        map.put("maritalStatus", member.getMaritalStatus());
        map.put("photoPath", member.getPhotoPath());
        map.put("address", member.getAddress());
        map.put("permanentAddress", member.getPermanentAddress());
        map.put("qualification", member.getQualification());
        map.put("workExperience", member.getWorkExperience());
        map.put("note", member.getNote());
        map.put("panNumber", member.getPanNumber());
        map.put("location", member.getLocation());
        map.put("epfNo", member.getEpfNo());
        map.put("basicSalary", member.getBasicSalary());
        map.put("contractType", member.getContractType());
        map.put("workShift", member.getWorkShift());
        map.put("workLocation", member.getWorkLocation());
        map.put("medicalLeave", member.getMedicalLeave());
        map.put("casualLeave", member.getCasualLeave());
        map.put("maternityLeave", member.getMaternityLeave());
        map.put("sickLeave", member.getSickLeave());
        map.put("mandatoryLeave", member.getMandatoryLeave());
        map.put("accountTitle", member.getAccountTitle());
        map.put("bankAccountNumber", member.getBankAccountNumber());
        map.put("bankName", member.getBankName());
        map.put("ifscCode", member.getIfscCode());
        map.put("bankBranchName", member.getBankBranchName());
        map.put("facebookUrl", member.getFacebookUrl());
        map.put("twitterUrl", member.getTwitterUrl());
        map.put("linkedinUrl", member.getLinkedinUrl());
        map.put("instagramUrl", member.getInstagramUrl());
        map.put("resumePath", member.getResumePath());
        map.put("joiningLetterPath", member.getJoiningLetterPath());
        map.put("resignationLetterPath", member.getResignationLetterPath());
        map.put("otherDocumentPath", member.getOtherDocumentPath());
        map.put("disabled", member.getDisabled());
        return map;
    }

    private List<String> splitRoles(String roles) {
        if (roles == null || roles.isBlank()) {
            return List.of();
        }
        return Arrays.stream(roles.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private String primaryRole(String roles) {
        List<String> list = splitRoles(roles);
        return list.isEmpty() ? "" : list.get(0);
    }

    private String fullName(StaffMember member) {
        String last = member.getLastName();
        if (last == null || last.isBlank()) {
            return member.getFirstName();
        }
        return member.getFirstName() + " " + last;
    }

    private String storePhoto(MultipartFile file) {
        return storeFile(file, uploadStorage.getStaffDir(), "/uploads/staff/");
    }

    private String storeDocument(MultipartFile file) {
        return storeFile(file, uploadStorage.getStaffDocumentsDir(), "/uploads/staff-documents/");
    }

    private String storeFile(MultipartFile file, Path directory, String publicPrefix) {
        try {
            String original = file.getOriginalFilename();
            String extension = original != null && original.contains(".")
                    ? original.substring(original.lastIndexOf('.'))
                    : "";
            String filename = UUID.randomUUID() + extension;
            Path target = directory.resolve(filename);
            Files.copy(file.getInputStream(), target);
            return publicPrefix + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store uploaded file");
        }
    }

    private void applyDocuments(StaffMember member, Map<String, MultipartFile> documents) {
        if (documents == null || documents.isEmpty()) {
            return;
        }
        MultipartFile resume = documents.get("resume");
        if (resume != null && !resume.isEmpty()) {
            member.setResumePath(storeDocument(resume));
        }
        MultipartFile joiningLetter = documents.get("joiningLetter");
        if (joiningLetter != null && !joiningLetter.isEmpty()) {
            member.setJoiningLetterPath(storeDocument(joiningLetter));
        }
        MultipartFile resignationLetter = documents.get("resignationLetter");
        if (resignationLetter != null && !resignationLetter.isEmpty()) {
            member.setResignationLetterPath(storeDocument(resignationLetter));
        }
        MultipartFile otherDocument = documents.get("otherDocument");
        if (otherDocument != null && !otherDocument.isEmpty()) {
            member.setOtherDocumentPath(storeDocument(otherDocument));
        }
    }

    private void seedSampleStaff() {
        List<StaffMember> samples = List.of(
                sample("9000", "Super Admin,Technical Head", "Technical Head", "Admin",
                        "Joe", "Black", "joe.black@school.com", "Male",
                        "9876543210", "Ground Floor, Admin", "ABCDE1234F"),
                sample("9001", "Admin,Principal", "Principal", "Admin",
                        "Emily", "Davis", "emily.davis@school.com", "Female",
                        "9876543211", "Ground Floor, Admin", "ABCDE1235F"),
                sample("9002", "Teacher,Faculty", "Senior Teacher", "Academic",
                        "Shivam", "Verma", "shivam.verma@school.com", "Male",
                        "9876543212", "1st Floor, Academic", "ABCDE1236F"),
                sample("9003", "Teacher", "Teacher", "Academic",
                        "Sarah", "Johnson", "sarah.johnson@school.com", "Female",
                        "9876543213", "1st Floor, Academic", "ABCDE1237F"),
                sample("9004", "Librarian", "Librarian", "Library",
                        "Michael", "Chen", "michael.chen@school.com", "Male",
                        "9876543214", "2nd Floor, Library", "ABCDE1238F"),
                sample("9005", "Accountant", "Accountant", "Finance",
                        "Priya", "Sharma", "priya.sharma@school.com", "Female",
                        "9876543215", "Ground Floor, Finance", "ABCDE1239F"),
                sample("9006", "Receptionist", "Receptionist", "Reception",
                        "David", "Wilson", "david.wilson@school.com", "Male",
                        "9876543216", "Ground Floor, Reception", "ABCDE1240F"),
                sample("654", "Teacher", "Teacher", "Academic",
                        "Aman", "Verma", "aman.verma@school.com", "Male",
                        "9876543217", "1st Floor, Academic", "ABCDE1241F"),
                disabledSample("54545454", "Teacher,Faculty", "Faculty", "Academic",
                        "Albert", "Thomas", "albert.thomas@school.com", "Male",
                        "9522389875", "Mumbai, Maths", "ABCDE1242F"),
                disabledSample("6332", "Teacher,Faculty", "Faculty", "Academic",
                        "Jonathan", "Wood", "jonathan.wood@school.com", "Male",
                        "", "Academic", "ABCDE1243F")
        );
        repository.saveAll(samples);
    }

    private StaffMember sample(String staffId, String roles, String designation, String department,
                               String firstName, String lastName, String email, String gender,
                               String phone, String location, String pan) {
        StaffMember member = StaffMember.builder()
                .staffId(staffId)
                .roles(roles)
                .designation(designation)
                .department(department)
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .gender(gender)
                .phone(phone)
                .location(location)
                .panNumber(pan)
                .dateOfJoining(LocalDate.of(2020, 6, 1))
                .disabled(false)
                .build();
        member.setIsActive(true);
        return member;
    }

    private StaffMember disabledSample(String staffId, String roles, String designation, String department,
                                       String firstName, String lastName, String email, String gender,
                                       String phone, String location, String pan) {
        StaffMember member = sample(staffId, roles, designation, department,
                firstName, lastName, email, gender, phone, location, pan);
        member.setDisabled(true);
        return member;
    }

    private String requiredText(Object value) {
        String text = text(value);
        if (text.isBlank()) {
            throw new IllegalArgumentException("Required field is missing");
        }
        return text;
    }

    private String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private List<String> resolveDepartments() {
        List<String> names = departmentService.getDepartmentNames();
        return names.isEmpty() ? DEPARTMENTS : names;
    }

    private List<String> resolveDesignations() {
        List<String> names = designationService.getDesignationNames();
        return names.isEmpty() ? DESIGNATIONS : names;
    }

    private LocalDate parseDate(Object value) {
        String text = text(value);
        if (text.isBlank()) {
            return null;
        }
        return LocalDate.parse(text);
    }

    private Integer parseInteger(Object value) {
        String text = text(value);
        if (text.isBlank()) {
            return null;
        }
        return Integer.parseInt(text);
    }
}
