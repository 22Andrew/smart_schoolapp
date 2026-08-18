package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Order(17)
public class StudentCvService implements ApplicationRunner {

    public static final List<Map<String, String>> STUDENT_FIELD_OPTIONS = List.of(
            field("studentName", "Student Name"),
            field("admissionNo", "Admission No"),
            field("rollNumber", "Roll Number"),
            field("classLabel", "Class"),
            field("gender", "Gender"),
            field("dateOfBirth", "Date Of Birth"),
            field("categoryName", "Category"),
            field("religion", "Religion"),
            field("email", "Email"),
            field("mobileNumber", "Mobile Number"),
            field("bloodGroup", "Blood Group"),
            field("height", "Height"),
            field("weight", "Weight"),
            field("fatherName", "Father Name"),
            field("motherName", "Mother Name"),
            field("guardianName", "Guardian Name"),
            field("currentAddress", "Current Address"),
            field("permanentAddress", "Permanent Address"),
            field("photo", "Photo")
    );

    private static final String DEFAULT_FIELDS = "studentName,admissionNo,rollNumber,classLabel,gender,dateOfBirth,categoryName,religion,email,mobileNumber,bloodGroup,fatherName,motherName,currentAddress,photo";

    private final StudentCvSettingRepository settingRepository;
    private final StudentCvProfileRepository profileRepository;
    private final StudentCvWorkExperienceRepository workRepository;
    private final StudentCvEducationRepository educationRepository;
    private final StudentCvSkillRepository skillRepository;
    private final StudentCvReferenceRepository referenceRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final StudentAdmissionService studentAdmissionService;
    private final SchoolGeneralSettingRepository generalSettingRepository;

    public StudentCvService(
            StudentCvSettingRepository settingRepository,
            StudentCvProfileRepository profileRepository,
            StudentCvWorkExperienceRepository workRepository,
            StudentCvEducationRepository educationRepository,
            StudentCvSkillRepository skillRepository,
            StudentCvReferenceRepository referenceRepository,
            StudentAdmissionRepository studentAdmissionRepository,
            StudentAdmissionService studentAdmissionService,
            SchoolGeneralSettingRepository generalSettingRepository
    ) {
        this.settingRepository = settingRepository;
        this.profileRepository = profileRepository;
        this.workRepository = workRepository;
        this.educationRepository = educationRepository;
        this.skillRepository = skillRepository;
        this.referenceRepository = referenceRepository;
        this.studentAdmissionRepository = studentAdmissionRepository;
        this.studentAdmissionService = studentAdmissionService;
        this.generalSettingRepository = generalSettingRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (settingRepository.count() == 0) {
            StudentCvSetting setting = StudentCvSetting.builder()
                    .enabledStudentFields(DEFAULT_FIELDS)
                    .workExperienceEnabled(true)
                    .educationEnabled(true)
                    .skillsEnabled(true)
                    .referencesEnabled(true)
                    .otherDetailsEnabled(true)
                    .studentPanelDownload(false)
                    .build();
            setting.setIsActive(true);
            settingRepository.save(setting);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings() {
        StudentCvSetting setting = currentSetting();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("studentFields", STUDENT_FIELD_OPTIONS);
        map.put("enabledStudentFields", enabledFieldSet(setting));
        map.put("workExperienceEnabled", setting.isWorkExperienceEnabled());
        map.put("educationEnabled", setting.isEducationEnabled());
        map.put("skillsEnabled", setting.isSkillsEnabled());
        map.put("referencesEnabled", setting.isReferencesEnabled());
        map.put("otherDetailsEnabled", setting.isOtherDetailsEnabled());
        map.put("studentPanelDownload", setting.isStudentPanelDownload());
        return map;
    }

    @Transactional
    public Map<String, Object> saveSettings(Map<String, Object> payload) {
        StudentCvSetting setting = currentSetting();
        List<String> fields = asStringList(payload.get("enabledStudentFields"));
        if (fields.isEmpty()) {
            fields = new ArrayList<>(List.of("studentName", "admissionNo", "classLabel"));
        }
        setting.setEnabledStudentFields(String.join(",", fields));
        setting.setWorkExperienceEnabled(asBoolean(payload.get("workExperienceEnabled"), true));
        setting.setEducationEnabled(asBoolean(payload.get("educationEnabled"), true));
        setting.setSkillsEnabled(asBoolean(payload.get("skillsEnabled"), true));
        setting.setReferencesEnabled(asBoolean(payload.get("referencesEnabled"), true));
        setting.setOtherDetailsEnabled(asBoolean(payload.get("otherDetailsEnabled"), true));
        setting.setStudentPanelDownload(asBoolean(payload.get("studentPanelDownload"), false));
        settingRepository.save(setting);
        return getSettings();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchStudents(Long classId, String section) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : studentAdmissionRepository.search(classId, section, null, false, null)) {
            Map<String, Object> map = studentAdmissionService.toMap(student);
            map.put("hasResume", profileRepository.findByStudent_Id(student.getId()).isPresent()
                    || !workRepository.findByStudent_IdOrderBySortOrderAscIdAsc(student.getId()).isEmpty()
                    || !educationRepository.findByStudent_IdOrderBySortOrderAscIdAsc(student.getId()).isEmpty());
            rows.add(map);
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getResume(Long studentId) {
        StudentAdmission student = studentAdmissionRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("student", studentAdmissionService.toMap(student));
        map.put("settings", getSettings());
        map.put("schoolName", schoolName());
        StudentCvProfile profile = profileRepository.findByStudent_Id(studentId).orElse(null);
        map.put("designation", profile == null || profile.getDesignation() == null ? "" : profile.getDesignation());
        map.put("about", profile == null || profile.getAbout() == null ? "" : profile.getAbout());
        map.put("workExperiences", workRepository.findByStudent_IdOrderBySortOrderAscIdAsc(studentId).stream().map(this::workMap).toList());
        map.put("educations", educationRepository.findByStudent_IdOrderBySortOrderAscIdAsc(studentId).stream().map(this::educationMap).toList());
        map.put("skills", skillRepository.findByStudent_IdOrderBySortOrderAscIdAsc(studentId).stream().map(this::skillMap).toList());
        map.put("references", referenceRepository.findByStudent_IdOrderBySortOrderAscIdAsc(studentId).stream().map(this::referenceMap).toList());
        return map;
    }

    @Transactional
    public Map<String, Object> saveWork(Long studentId, Map<String, Object> payload) {
        StudentAdmission student = requireStudent(studentId);
        workRepository.deleteByStudent_Id(studentId);
        workRepository.flush();
        int order = 1;
        for (Map<String, Object> item : asMapList(payload.get("items"))) {
            StudentCvWorkExperience row = StudentCvWorkExperience.builder()
                    .student(student)
                    .institution(blankToNull(text(item.get("institution"))))
                    .designation(blankToNull(text(item.get("designation"))))
                    .years(blankToNull(text(item.get("years"))))
                    .location(blankToNull(text(item.get("location"))))
                    .details(blankToNull(text(item.get("details"))))
                    .sortOrder(order++)
                    .build();
            row.setIsActive(true);
            workRepository.save(row);
        }
        return getResume(studentId);
    }

    @Transactional
    public Map<String, Object> saveEducation(Long studentId, Map<String, Object> payload) {
        StudentAdmission student = requireStudent(studentId);
        educationRepository.deleteByStudent_Id(studentId);
        educationRepository.flush();
        int order = 1;
        for (Map<String, Object> item : asMapList(payload.get("items"))) {
            StudentCvEducation row = StudentCvEducation.builder()
                    .student(student)
                    .qualification(blankToNull(text(item.get("qualification"))))
                    .schoolName(blankToNull(text(item.get("schoolName"))))
                    .year(blankToNull(text(item.get("year"))))
                    .marks(blankToNull(text(item.get("marks"))))
                    .details(blankToNull(text(item.get("details"))))
                    .sortOrder(order++)
                    .build();
            row.setIsActive(true);
            educationRepository.save(row);
        }
        return getResume(studentId);
    }

    @Transactional
    public Map<String, Object> saveSkills(Long studentId, Map<String, Object> payload) {
        StudentAdmission student = requireStudent(studentId);
        skillRepository.deleteByStudent_Id(studentId);
        skillRepository.flush();
        int order = 1;
        for (Map<String, Object> item : asMapList(payload.get("items"))) {
            StudentCvSkill row = StudentCvSkill.builder()
                    .student(student)
                    .skillCategory(blankToNull(text(item.get("skillCategory"))))
                    .details(blankToNull(text(item.get("details"))))
                    .sortOrder(order++)
                    .build();
            row.setIsActive(true);
            skillRepository.save(row);
        }
        return getResume(studentId);
    }

    @Transactional
    public Map<String, Object> saveReferences(Long studentId, Map<String, Object> payload) {
        StudentAdmission student = requireStudent(studentId);
        referenceRepository.deleteByStudent_Id(studentId);
        referenceRepository.flush();
        int order = 1;
        for (Map<String, Object> item : asMapList(payload.get("items"))) {
            StudentCvReference row = StudentCvReference.builder()
                    .student(student)
                    .name(blankToNull(text(item.get("name"))))
                    .relation(blankToNull(text(item.get("relation"))))
                    .contact(blankToNull(text(item.get("contact"))))
                    .designation(blankToNull(text(item.get("designation"))))
                    .details(blankToNull(text(item.get("details"))))
                    .sortOrder(order++)
                    .build();
            row.setIsActive(true);
            referenceRepository.save(row);
        }
        return getResume(studentId);
    }

    @Transactional
    public Map<String, Object> saveOther(Long studentId, Map<String, Object> payload) {
        StudentAdmission student = requireStudent(studentId);
        StudentCvProfile profile = profileRepository.findByStudent_Id(studentId).orElseGet(() -> {
            StudentCvProfile created = StudentCvProfile.builder().student(student).build();
            created.setIsActive(true);
            return created;
        });
        profile.setDesignation(blankToNull(text(payload.get("designation"))));
        profile.setAbout(blankToNull(text(payload.get("about"))));
        profileRepository.save(profile);
        return getResume(studentId);
    }

    private StudentCvSetting currentSetting() {
        List<StudentCvSetting> all = settingRepository.findAll();
        if (!all.isEmpty()) {
            return all.get(0);
        }
        StudentCvSetting setting = StudentCvSetting.builder()
                .enabledStudentFields(DEFAULT_FIELDS)
                .workExperienceEnabled(true)
                .educationEnabled(true)
                .skillsEnabled(true)
                .referencesEnabled(true)
                .otherDetailsEnabled(true)
                .studentPanelDownload(false)
                .build();
        setting.setIsActive(true);
        return settingRepository.save(setting);
    }

    private Set<String> enabledFieldSet(StudentCvSetting setting) {
        Set<String> fields = new LinkedHashSet<>();
        String raw = setting.getEnabledStudentFields() == null ? DEFAULT_FIELDS : setting.getEnabledStudentFields();
        for (String part : raw.split(",")) {
            if (!part.isBlank()) {
                fields.add(part.trim());
            }
        }
        return fields;
    }

    private StudentAdmission requireStudent(Long studentId) {
        return studentAdmissionRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
    }

    private String schoolName() {
        return generalSettingRepository.findAll().stream()
                .findFirst()
                .map(SchoolGeneralSetting::getSchoolName)
                .orElse("Smart School");
    }

    private Map<String, Object> workMap(StudentCvWorkExperience row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("institution", nz(row.getInstitution()));
        map.put("designation", nz(row.getDesignation()));
        map.put("years", nz(row.getYears()));
        map.put("location", nz(row.getLocation()));
        map.put("details", nz(row.getDetails()));
        return map;
    }

    private Map<String, Object> educationMap(StudentCvEducation row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("qualification", nz(row.getQualification()));
        map.put("schoolName", nz(row.getSchoolName()));
        map.put("year", nz(row.getYear()));
        map.put("marks", nz(row.getMarks()));
        map.put("details", nz(row.getDetails()));
        return map;
    }

    private Map<String, Object> skillMap(StudentCvSkill row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("skillCategory", nz(row.getSkillCategory()));
        map.put("details", nz(row.getDetails()));
        return map;
    }

    private Map<String, Object> referenceMap(StudentCvReference row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("name", nz(row.getName()));
        map.put("relation", nz(row.getRelation()));
        map.put("contact", nz(row.getContact()));
        map.put("designation", nz(row.getDesignation()));
        map.put("details", nz(row.getDetails()));
        return map;
    }

    private static Map<String, String> field(String key, String label) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("key", key);
        map.put("label", label);
        return map;
    }

    private String nz(String value) {
        return value == null ? "" : value;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private boolean asBoolean(Object value, boolean defaultValue) {
        if (value == null) return defaultValue;
        if (value instanceof Boolean bool) return bool;
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) return defaultValue;
        return "true".equalsIgnoreCase(text) || "1".equals(text) || "yes".equalsIgnoreCase(text);
    }

    private List<String> asStringList(Object value) {
        List<String> values = new ArrayList<>();
        if (value instanceof Collection<?> collection) {
            for (Object item : collection) {
                String text = text(item);
                if (!text.isBlank()) {
                    values.add(text);
                }
            }
        }
        return values;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> asMapList(Object value) {
        if (value instanceof List<?> list) {
            List<Map<String, Object>> rows = new ArrayList<>();
            for (Object item : list) {
                if (item instanceof Map<?, ?> map) {
                    rows.add((Map<String, Object>) map);
                }
            }
            return rows;
        }
        return List.of();
    }
}
