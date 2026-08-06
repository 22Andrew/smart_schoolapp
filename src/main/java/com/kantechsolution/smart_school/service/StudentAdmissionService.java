package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.Hostel;
import com.kantechsolution.smart_school.model.HostelRoom;
import com.kantechsolution.smart_school.model.SchoolClass;
import com.kantechsolution.smart_school.model.SchoolHouse;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.StudentCategory;
import com.kantechsolution.smart_school.repository.HostelRepository;
import com.kantechsolution.smart_school.repository.HostelRoomRepository;
import com.kantechsolution.smart_school.repository.SchoolClassRepository;
import com.kantechsolution.smart_school.repository.SchoolHouseRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import com.kantechsolution.smart_school.repository.StudentCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class StudentAdmissionService {

    @Autowired
    private StudentAdmissionRepository studentAdmissionRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private StudentCategoryRepository studentCategoryRepository;

    @Autowired
    private SchoolHouseRepository schoolHouseRepository;

    @Autowired
    private UploadStorage uploadStorage;

    @Autowired
    private HostelRepository hostelRepository;

    @Autowired
    private HostelRoomRepository hostelRoomRepository;

    public List<Map<String, Object>> getAllAdmissions() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (StudentAdmission row : studentAdmissionRepository.findAllByOrderByIdDesc()) {
            result.add(toMap(row));
        }
        return result;
    }

    public List<Map<String, Object>> searchAdmissions(Long classId, String section, String keyword) {
        String normalizedSection = section == null ? null : section.trim();
        String normalizedKeyword = keyword == null ? null : keyword.trim();
        if (normalizedSection != null && normalizedSection.isEmpty()) {
            normalizedSection = null;
        }
        if (normalizedKeyword != null && normalizedKeyword.isEmpty()) {
            normalizedKeyword = null;
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (StudentAdmission row : studentAdmissionRepository.search(classId, normalizedSection, normalizedKeyword)) {
            result.add(toMap(row));
        }
        return result;
    }

    public Optional<Map<String, Object>> getById(Long id) {
        return studentAdmissionRepository.findById(id).map(this::toMap);
    }

    @Transactional
    public Map<String, Object> createAdmission(Map<String, Object> payload) {
        return createAdmission(payload, null);
    }

    @Transactional
    public Map<String, Object> createAdmission(Map<String, Object> payload, MultipartFile studentPhoto) {
        StudentAdmission admission = new StudentAdmission();
        applyFields(admission, payload, null);
        if (studentPhoto != null && !studentPhoto.isEmpty()) {
            admission.setPhotoPath(storeStudentPhoto(studentPhoto));
        }
        return toMap(studentAdmissionRepository.save(admission));
    }

    @Transactional
    public Map<String, Object> updateAdmission(Long id, Map<String, Object> payload) {
        return updateAdmission(id, payload, null);
    }

    @Transactional
    public Map<String, Object> updateAdmission(Long id, Map<String, Object> payload, MultipartFile studentPhoto) {
        StudentAdmission existing = studentAdmissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student admission not found"));
        applyFields(existing, payload, id);
        if (studentPhoto != null && !studentPhoto.isEmpty()) {
            existing.setPhotoPath(storeStudentPhoto(studentPhoto));
        }
        return toMap(studentAdmissionRepository.save(existing));
    }

    @Transactional
    public void deleteAdmission(Long id) {
        if (!studentAdmissionRepository.existsById(id)) {
            throw new IllegalArgumentException("Student admission not found");
        }
        studentAdmissionRepository.deleteById(id);
    }

    private void applyFields(StudentAdmission admission, Map<String, Object> payload, Long currentId) {
        String admissionNo = requiredText(payload.get("admissionNo"), "Admission No");
        Optional<StudentAdmission> duplicate = studentAdmissionRepository.findByAdmissionNoIgnoreCase(admissionNo);
        if (duplicate.isPresent() && (currentId == null || !duplicate.get().getId().equals(currentId))) {
            throw new IllegalArgumentException("Admission No already exists");
        }

        Long classId = asLong(payload.get("classId"));
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Selected class was not found"));

        String section = requiredText(payload.get("section"), "Section").toUpperCase(Locale.ROOT);
        boolean sectionAllowed = schoolClass.getSections() != null && schoolClass.getSections().stream()
                .anyMatch(s -> s != null && s.equalsIgnoreCase(section));
        if (!sectionAllowed) {
            throw new IllegalArgumentException("Section " + section + " is not available for the selected class");
        }

        String firstName = requiredText(payload.get("firstName"), "First Name");
        String gender = requiredText(payload.get("gender"), "Gender");
        LocalDate dateOfBirth = requiredDate(payload.get("dateOfBirth"), "Date Of Birth");

        admission.setAdmissionNo(admissionNo);
        admission.setRollNumber(optionalText(payload.get("rollNumber")));
        admission.setSchoolClass(schoolClass);
        admission.setSection(section);
        admission.setFirstName(firstName);
        admission.setLastName(optionalText(payload.get("lastName")));
        admission.setGender(gender);
        admission.setDateOfBirth(dateOfBirth);
        admission.setCategory(resolveCategory(asLong(payload.get("categoryId"))));
        admission.setReligion(optionalText(payload.get("religion")));
        admission.setMobileNumber(optionalText(payload.get("mobileNumber")));
        admission.setEmail(optionalText(payload.get("email")));
        admission.setAdmissionDate(optionalDate(payload.get("admissionDate")));
        admission.setBloodGroup(optionalText(payload.get("bloodGroup")));
        admission.setHouse(resolveHouse(asLong(payload.get("houseId"))));
        admission.setHeight(optionalText(payload.get("height")));
        admission.setWeight(optionalText(payload.get("weight")));
        admission.setMeasurementDate(optionalDate(payload.get("measurementDate")));
        admission.setMedicalHistory(optionalText(payload.get("medicalHistory")));
        admission.setRouteList(optionalText(payload.get("routeList")));
        admission.setPickupPoint(optionalText(payload.get("pickupPoint")));
        admission.setFeesMonth(optionalText(payload.get("feesMonth")));

        Hostel hostel = resolveHostel(asLong(payload.get("hostelId")));
        HostelRoom room = resolveRoom(asLong(payload.get("roomId")));
        if (room != null && hostel != null && room.getHostel() != null
                && !room.getHostel().getId().equals(hostel.getId())) {
            throw new IllegalArgumentException("Selected room does not belong to the selected hostel");
        }
        admission.setHostel(hostel);
        admission.setHostelRoom(room);

        admission.setFatherName(optionalText(payload.get("fatherName")));
        admission.setFatherPhone(optionalText(payload.get("fatherPhone")));
        admission.setFatherOccupation(optionalText(payload.get("fatherOccupation")));
        admission.setMotherName(optionalText(payload.get("motherName")));
        admission.setMotherPhone(optionalText(payload.get("motherPhone")));
        admission.setMotherOccupation(optionalText(payload.get("motherOccupation")));
        admission.setGuardianIs(optionalText(payload.get("guardianIs")));
        admission.setGuardianName(optionalText(payload.get("guardianName")));
        admission.setGuardianRelation(optionalText(payload.get("guardianRelation")));
        admission.setGuardianEmail(optionalText(payload.get("guardianEmail")));
        admission.setGuardianPhone(optionalText(payload.get("guardianPhone")));
        admission.setGuardianOccupation(optionalText(payload.get("guardianOccupation")));
        admission.setGuardianAddress(optionalText(payload.get("guardianAddress")));
        admission.setCurrentAddress(optionalText(payload.get("currentAddress")));
        admission.setPermanentAddress(optionalText(payload.get("permanentAddress")));
        admission.setBankAccountNumber(optionalText(payload.get("bankAccountNumber")));
        admission.setBankName(optionalText(payload.get("bankName")));
        admission.setIfscCode(optionalText(payload.get("ifscCode")));
        admission.setNationalId(optionalText(payload.get("nationalId")));
        admission.setLocalId(optionalText(payload.get("localId")));
        admission.setRte(optionalText(payload.get("rte")));
        admission.setPreviousSchoolDetails(optionalText(payload.get("previousSchoolDetails")));
        admission.setNote(optionalText(payload.get("note")));
        if (payload.containsKey("photoPath")) {
            admission.setPhotoPath(optionalText(payload.get("photoPath")));
        }
    }

    private String storeStudentPhoto(MultipartFile studentPhoto) {
        String originalName = studentPhoto.getOriginalFilename();
        String contentType = studentPhoto.getContentType() == null ? "" : studentPhoto.getContentType().toLowerCase(Locale.ROOT);
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        }
        if (extension.isBlank()) {
            if (contentType.contains("png")) extension = ".png";
            else if (contentType.contains("gif")) extension = ".gif";
            else if (contentType.contains("webp")) extension = ".webp";
            else extension = ".jpg";
        }

        boolean allowedExtension = extension.equals(".jpg") || extension.equals(".jpeg")
                || extension.equals(".png") || extension.equals(".gif") || extension.equals(".webp");
        boolean allowedContentType = contentType.startsWith("image/");
        if (!allowedExtension && !allowedContentType) {
            throw new IllegalArgumentException("Student photo must be an image (jpg, png, gif, or webp)");
        }
        if (!allowedExtension) {
            extension = ".jpg";
        }

        try {
            Path uploadDir = uploadStorage.getStudentsDir();
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Path target = uploadDir.resolve(filename);
            Files.copy(studentPhoto.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            if (!Files.exists(target) || Files.size(target) == 0) {
                throw new IllegalArgumentException("Failed to store student photo");
            }
            return "/uploads/students/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store student photo: " + e.getMessage());
        }
    }

    private Map<String, Object> toMap(StudentAdmission row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("admissionNo", row.getAdmissionNo());
        map.put("rollNumber", row.getRollNumber());
        map.put("classId", row.getSchoolClass() != null ? row.getSchoolClass().getId() : null);
        map.put("className", row.getSchoolClass() != null ? row.getSchoolClass().getName() : null);
        map.put("section", row.getSection());
        map.put("firstName", row.getFirstName());
        map.put("lastName", row.getLastName());
        map.put("gender", row.getGender());
        map.put("dateOfBirth", row.getDateOfBirth() != null ? row.getDateOfBirth().toString() : null);
        map.put("categoryId", row.getCategory() != null ? row.getCategory().getId() : null);
        map.put("categoryName", row.getCategory() != null ? row.getCategory().getCategoryName() : null);
        map.put("religion", row.getReligion());
        map.put("mobileNumber", row.getMobileNumber());
        map.put("email", row.getEmail());
        map.put("admissionDate", row.getAdmissionDate() != null ? row.getAdmissionDate().toString() : null);
        map.put("bloodGroup", row.getBloodGroup());
        map.put("houseId", row.getHouse() != null ? row.getHouse().getId() : null);
        map.put("houseName", row.getHouse() != null ? row.getHouse().getName() : null);
        map.put("height", row.getHeight());
        map.put("weight", row.getWeight());
        map.put("measurementDate", row.getMeasurementDate() != null ? row.getMeasurementDate().toString() : null);
        map.put("medicalHistory", row.getMedicalHistory());
        map.put("routeList", row.getRouteList());
        map.put("pickupPoint", row.getPickupPoint());
        map.put("feesMonth", row.getFeesMonth());
        map.put("hostelId", row.getHostel() != null ? row.getHostel().getId() : null);
        map.put("hostelName", row.getHostel() != null ? row.getHostel().getHostelName() : null);
        map.put("roomId", row.getHostelRoom() != null ? row.getHostelRoom().getId() : null);
        map.put("roomNo", row.getHostelRoom() != null ? row.getHostelRoom().getRoomNumber() : null);
        map.put("fatherName", row.getFatherName());
        map.put("fatherPhone", row.getFatherPhone());
        map.put("fatherOccupation", row.getFatherOccupation());
        map.put("motherName", row.getMotherName());
        map.put("motherPhone", row.getMotherPhone());
        map.put("motherOccupation", row.getMotherOccupation());
        map.put("guardianIs", row.getGuardianIs());
        map.put("guardianName", row.getGuardianName());
        map.put("guardianRelation", row.getGuardianRelation());
        map.put("guardianEmail", row.getGuardianEmail());
        map.put("guardianPhone", row.getGuardianPhone());
        map.put("guardianOccupation", row.getGuardianOccupation());
        map.put("guardianAddress", row.getGuardianAddress());
        map.put("currentAddress", row.getCurrentAddress());
        map.put("permanentAddress", row.getPermanentAddress());
        map.put("bankAccountNumber", row.getBankAccountNumber());
        map.put("bankName", row.getBankName());
        map.put("ifscCode", row.getIfscCode());
        map.put("nationalId", row.getNationalId());
        map.put("localId", row.getLocalId());
        map.put("rte", row.getRte());
        map.put("previousSchoolDetails", row.getPreviousSchoolDetails());
        map.put("note", row.getNote());
        map.put("photoPath", row.getPhotoPath());
        map.put("photoUrl", row.getPhotoPath());
        return map;
    }

    private StudentCategory resolveCategory(Long id) {
        if (id == null) return null;
        return studentCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Selected category was not found"));
    }

    private SchoolHouse resolveHouse(Long id) {
        if (id == null) return null;
        return schoolHouseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Selected house was not found"));
    }

    private Hostel resolveHostel(Long id) {
        if (id == null) return null;
        return hostelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Selected hostel was not found"));
    }

    private HostelRoom resolveRoom(Long id) {
        if (id == null) return null;
        return hostelRoomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Selected room was not found"));
    }

    private String requiredText(Object value, String fieldName) {
        String text = optionalText(value);
        if (text == null || text.isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        return text;
    }

    private String optionalText(Object value) {
        if (value == null) return "";
        return String.valueOf(value).trim();
    }

    private LocalDate requiredDate(Object value, String fieldName) {
        LocalDate date = optionalDate(value);
        if (date == null) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        return date;
    }

    private LocalDate optionalDate(Object value) {
        String text = optionalText(value);
        if (text == null || text.isEmpty()) return null;
        try {
            return LocalDate.parse(text);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date value: " + text);
        }
    }

    private Long asLong(Object value) {
        if (value == null || "".equals(String.valueOf(value).trim())) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
