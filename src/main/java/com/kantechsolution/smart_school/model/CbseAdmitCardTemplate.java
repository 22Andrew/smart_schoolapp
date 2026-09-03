package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "cbse_admit_card_templates")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseAdmitCardTemplate extends BaseEntity {

    @Column(name = "template_name", nullable = false, length = 200)
    private String templateName;

    @Column(length = 200)
    private String heading;

    @Column(length = 200)
    private String title;

    @Column(name = "exam_name", length = 200)
    private String examName;

    @Column(name = "school_name", length = 200)
    private String schoolName;

    @Column(name = "exam_center", length = 200)
    private String examCenter;

    @Column(name = "footer_text", length = 500)
    private String footerText;

    @Column(name = "left_logo", length = 500)
    private String leftLogo;

    @Column(name = "right_logo", length = 500)
    private String rightLogo;

    @Column(name = "sign_image", length = 500)
    private String signImage;

    @Column(name = "background_image", length = 500)
    private String backgroundImage;

    @Column(name = "show_name")
    @Builder.Default
    private boolean showName = true;

    @Column(name = "show_father_name")
    @Builder.Default
    private boolean showFatherName = true;

    @Column(name = "show_mother_name")
    @Builder.Default
    private boolean showMotherName = false;

    @Column(name = "show_dob")
    @Builder.Default
    private boolean showDob = true;

    @Column(name = "show_admission_no")
    @Builder.Default
    private boolean showAdmissionNo = true;

    @Column(name = "show_roll_number")
    @Builder.Default
    private boolean showRollNumber = true;

    @Column(name = "show_address")
    @Builder.Default
    private boolean showAddress = false;

    @Column(name = "show_gender")
    @Builder.Default
    private boolean showGender = true;

    @Column(name = "show_photo")
    @Builder.Default
    private boolean showPhoto = true;

    @Column(name = "show_class")
    @Builder.Default
    private boolean showClass = true;

    @Column(name = "show_section")
    @Builder.Default
    private boolean showSection = true;

    @Column(name = "is_default")
    @Builder.Default
    private boolean defaultTemplate = false;
}
