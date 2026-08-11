package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "marksheet_templates")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarksheetTemplate extends BaseEntity {

    @Column(name = "template_name", nullable = false, length = 200)
    private String templateName;

    @Column(name = "exam_name", length = 200)
    private String examName;

    @Column(name = "school_name", length = 200)
    private String schoolName;

    @Column(name = "exam_center", length = 200)
    private String examCenter;

    @Column(name = "body_text", length = 1000)
    private String bodyText;

    @Column(name = "footer_text", length = 500)
    private String footerText;

    @Column(name = "printing_date", length = 100)
    private String printingDate;

    @Column(name = "header_image", length = 500)
    private String headerImage;

    @Column(name = "left_logo", length = 500)
    private String leftLogo;

    @Column(name = "left_sign", length = 500)
    private String leftSign;

    @Column(name = "middle_sign", length = 500)
    private String middleSign;

    @Column(name = "right_sign", length = 500)
    private String rightSign;

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
    private boolean showMotherName = true;

    @Column(name = "show_exam_session")
    @Builder.Default
    private boolean showExamSession = true;

    @Column(name = "show_admission_no")
    @Builder.Default
    private boolean showAdmissionNo = true;

    @Column(name = "show_division")
    @Builder.Default
    private boolean showDivision = true;

    @Column(name = "show_rank")
    @Builder.Default
    private boolean showRank = true;

    @Column(name = "show_roll_number")
    @Builder.Default
    private boolean showRollNumber = true;

    @Column(name = "show_photo")
    @Builder.Default
    private boolean showPhoto = true;

    @Column(name = "show_class")
    @Builder.Default
    private boolean showClass = true;

    @Column(name = "show_section")
    @Builder.Default
    private boolean showSection = true;

    @Column(name = "show_dob")
    @Builder.Default
    private boolean showDob = true;

    @Column(name = "show_remark")
    @Builder.Default
    private boolean showRemark = true;
}
