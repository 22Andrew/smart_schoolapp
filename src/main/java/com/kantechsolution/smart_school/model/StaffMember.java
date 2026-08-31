package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "staff_members")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffMember extends BaseEntity {

    @Column(name = "staff_id", nullable = false, unique = true, length = 50)
    private String staffId;

    @Column(nullable = false, length = 500)
    private String roles;

    @Column(length = 100)
    private String designation;

    @Column(length = 100)
    private String department;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "father_name", length = 100)
    private String fatherName;

    @Column(name = "mother_name", length = 100)
    private String motherName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 20)
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "date_of_joining")
    private LocalDate dateOfJoining;

    @Column(length = 20)
    private String phone;

    @Column(name = "emergency_contact", length = 20)
    private String emergencyContact;

    @Column(name = "marital_status", length = 30)
    private String maritalStatus;

    @Column(name = "photo_path", length = 500)
    private String photoPath;

    @Column(length = 500)
    private String address;

    @Column(name = "permanent_address", length = 500)
    private String permanentAddress;

    @Column(length = 300)
    private String qualification;

    @Column(name = "work_experience", length = 300)
    private String workExperience;

    @Column(length = 500)
    private String note;

    @Column(name = "pan_number", nullable = false, length = 20)
    private String panNumber;

    @Column(length = 200)
    private String location;

    @Column(name = "is_disabled")
    @Builder.Default
    private Boolean disabled = false;

    @Column(name = "disable_reason", length = 300)
    private String disableReason;

    @Column(name = "epf_no", length = 50)
    private String epfNo;

    @Column(name = "basic_salary", length = 50)
    private String basicSalary;

    @Column(name = "contract_type", length = 50)
    private String contractType;

    @Column(name = "work_shift", length = 100)
    private String workShift;

    @Column(name = "work_location", length = 200)
    private String workLocation;

    @Column(name = "medical_leave")
    private Integer medicalLeave;

    @Column(name = "casual_leave")
    private Integer casualLeave;

    @Column(name = "maternity_leave")
    private Integer maternityLeave;

    @Column(name = "sick_leave")
    private Integer sickLeave;

    @Column(name = "mandatory_leave")
    private Integer mandatoryLeave;

    @Column(name = "account_title", length = 150)
    private String accountTitle;

    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;

    @Column(name = "bank_name", length = 150)
    private String bankName;

    @Column(name = "ifsc_code", length = 20)
    private String ifscCode;

    @Column(name = "bank_branch_name", length = 150)
    private String bankBranchName;

    @Column(name = "facebook_url", length = 300)
    private String facebookUrl;

    @Column(name = "twitter_url", length = 300)
    private String twitterUrl;

    @Column(name = "linkedin_url", length = 300)
    private String linkedinUrl;

    @Column(name = "instagram_url", length = 300)
    private String instagramUrl;

    @Column(name = "resume_path", length = 500)
    private String resumePath;

    @Column(name = "joining_letter_path", length = 500)
    private String joiningLetterPath;

    @Column(name = "resignation_letter_path", length = 500)
    private String resignationLetterPath;

    @Column(name = "other_document_path", length = 500)
    private String otherDocumentPath;
}
