package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "student_id_card_templates")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentIdCardTemplate extends BaseEntity {

    @Column(name = "id_card_title", nullable = false, length = 200)
    private String idCardTitle;

    @Column(name = "school_name", length = 200)
    private String schoolName;

    @Column(name = "school_address", length = 500)
    private String schoolAddress;

    @Column(name = "header_color", length = 30)
    private String headerColor;

    @Column(name = "design_type", length = 30)
    private String designType;

    @Column(name = "background_image_url", length = 500)
    private String backgroundImageUrl;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "signature_url", length = 500)
    private String signatureUrl;

    @Column(name = "show_admission_no", nullable = false)
    private boolean showAdmissionNo;

    @Column(name = "show_student_name", nullable = false)
    private boolean showStudentName;

    @Column(name = "show_class", nullable = false)
    private boolean showClass;

    @Column(name = "show_father_name", nullable = false)
    private boolean showFatherName;

    @Column(name = "show_mother_name", nullable = false)
    private boolean showMotherName;

    @Column(name = "show_address", nullable = false)
    private boolean showAddress;

    @Column(name = "show_phone", nullable = false)
    private boolean showPhone;

    @Column(name = "show_dob", nullable = false)
    private boolean showDob;

    @Column(name = "show_blood_group", nullable = false)
    private boolean showBloodGroup;

    @Column(name = "show_roll_no", nullable = false)
    private boolean showRollNo;

    @Column(name = "show_house", nullable = false)
    private boolean showHouse;

    @Column(name = "show_barcode", nullable = false)
    private boolean showBarcode;
}
