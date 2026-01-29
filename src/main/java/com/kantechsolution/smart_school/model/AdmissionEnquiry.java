package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * AdmissionEnquiry entity for tracking admission enquiries
 */
@Entity
@Table(name = "admission_enquiries")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdmissionEnquiry extends BaseEntity {
    
    @Column(name = "student_name", nullable = false, length = 100)
    private String studentName;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;
    
    @Column(name = "parent_name", nullable = false, length = 100)
    private String parentName;
    
    @Column(nullable = false, unique = true, length = 150)
    private String email;
    
    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;
    
    @Column(length = 500)
    private String address;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_id")
    private Grade interestedGrade;
    
    @Column(name = "previous_school", length = 200)
    private String previousSchool;
    
    @Column(length = 1000)
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EnquiryStatus status = EnquiryStatus.NEW;
    
    @Column(name = "enquiry_date", nullable = false)
    private LocalDate enquiryDate;
    
    @Column(name = "follow_up_date")
    private LocalDate followUpDate;
    
    @Column(name = "admin_notes", length = 1000)
    private String adminNotes;
    
    public enum Gender {
        MALE,
        FEMALE,
        OTHER
    }
    
    public enum EnquiryStatus {
        NEW,
        CONTACTED,
        VISITED,
        ENROLLED,
        REJECTED,
        NOT_INTERESTED,
        FOLLOW_UP_REQUIRED
    }
}
