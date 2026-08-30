package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolClass;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.SchoolClassRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Ensures four sample student admission records exist for the student directory.
 */
@Service
@RequiredArgsConstructor
@Order(18)
public class StudentAdmissionSeedService implements ApplicationRunner {

    private final StudentAdmissionRepository studentAdmissionRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final UserLoginAuthService userLoginAuthService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedIfMissing("STD2026001", "Rahul", "Sharma", "Male", "Class 1", "A", "1",
                "rahul.sharma@school.com", "9876500001", "Rajesh Sharma", "9876500101");
        seedIfMissing("STD2026002", "Priya", "Patel", "Female", "Class 1", "B", "2",
                "priya.patel@school.com", "9876500002", "Vikram Patel", "9876500102");
        seedIfMissing("STD2026003", "Amit", "Singh", "Male", "Class 1", "C", "3",
                "amit.singh@school.com", "9876500003", "Harpreet Singh", "9876500103");
        seedIfMissing("STD2026004", "Sneha", "Gupta", "Female", "Class 1", "D", "4",
                "sneha.gupta@school.com", "9876500004", "Anil Gupta", "9876500104");
    }

    private void seedIfMissing(String admissionNo,
                               String firstName,
                               String lastName,
                               String gender,
                               String className,
                               String section,
                               String rollNumber,
                               String email,
                               String mobile,
                               String fatherName,
                               String fatherPhone) {
        if (studentAdmissionRepository.existsByAdmissionNoIgnoreCase(admissionNo)) {
            return;
        }

        SchoolClass schoolClass = ensureClass(className, section);
        StudentAdmission admission = new StudentAdmission();
        admission.setAdmissionNo(admissionNo);
        admission.setRollNumber(rollNumber);
        admission.setSchoolClass(schoolClass);
        admission.setSection(section.toUpperCase(Locale.ROOT));
        admission.setFirstName(firstName);
        admission.setLastName(lastName);
        admission.setGender(gender);
        admission.setDateOfBirth(LocalDate.of(2015, 4, 12));
        admission.setEmail(email);
        admission.setMobileNumber(mobile);
        admission.setAdmissionDate(LocalDate.of(2024, 4, 1));
        admission.setBloodGroup("O+");
        admission.setFatherName(fatherName);
        admission.setFatherPhone(fatherPhone);
        admission.setCurrentAddress("Demo City");
        admission.setDisabled(false);
        admission.setOnlineAdmission(false);
        admission.setEnrolled(true);
        admission.setFormStatus("Submitted");
        admission.setPaymentStatus("Unpaid");

        StudentAdmission saved = studentAdmissionRepository.save(admission);
        userLoginAuthService.ensureStudentAccount(saved);
        userLoginAuthService.ensureParentAccount(saved);
    }

    private SchoolClass ensureClass(String name, String section) {
        String normalizedSection = section.toUpperCase(Locale.ROOT);
        SchoolClass schoolClass = schoolClassRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> schoolClassRepository.save(new SchoolClass(name, List.of(normalizedSection))));

        if (schoolClass.getSections() == null
                || schoolClass.getSections().stream().noneMatch(value -> value.equalsIgnoreCase(normalizedSection))) {
            List<String> sections = new ArrayList<>(
                    schoolClass.getSections() == null ? List.of() : schoolClass.getSections());
            sections.add(normalizedSection);
            schoolClass.setSections(sections);
            schoolClass = schoolClassRepository.save(schoolClass);
        }
        return schoolClass;
    }
}
