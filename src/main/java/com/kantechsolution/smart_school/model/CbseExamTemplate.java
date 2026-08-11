package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "cbse_exam_templates")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseExamTemplate extends BaseEntity {

    @Column(name = "template_name", nullable = false, length = 300)
    private String templateName;

    @Column(name = "class_id")
    private Long classId;

    @Column(name = "class_name", length = 100)
    private String className;

    @Column(name = "sections_json", columnDefinition = "TEXT")
    private String sectionsJson;

    @Column(name = "class_sections_label", columnDefinition = "TEXT")
    private String classSectionsLabel;

    @Column(name = "marksheet_type", length = 20)
    @Builder.Default
    private String marksheetType = "portrait";

    @Column(name = "school_name", length = 200)
    private String schoolName;

    @Column(name = "exam_center", length = 200)
    private String examCenter;

    @Column(name = "printing_date", length = 50)
    private String printingDate;

    @Column(name = "header_image", length = 500)
    private String headerImage;

    @Column(name = "footer_text", columnDefinition = "TEXT")
    private String footerText;

    @Column(name = "left_sign", length = 500)
    private String leftSign;

    @Column(name = "middle_sign", length = 500)
    private String middleSign;

    @Column(name = "right_sign", length = 500)
    private String rightSign;

    @Column(name = "background_image", length = 500)
    private String backgroundImage;

    @Column(name = "template_description", columnDefinition = "TEXT")
    private String templateDescription;

    @Column(name = "marksheet_link_type", length = 100)
    private String marksheetLinkType;

    @Column(name = "linked_exam_id")
    private Long linkedExamId;

    @Column(name = "rank_generated")
    @Builder.Default
    private boolean rankGenerated = false;

    @Column(name = "show_student_name")
    @Builder.Default
    private boolean showStudentName = true;

    @Column(name = "show_father_name")
    @Builder.Default
    private boolean showFatherName = true;

    @Column(name = "show_mother_name")
    @Builder.Default
    private boolean showMotherName = true;

    @Column(name = "show_academic_session")
    @Builder.Default
    private boolean showAcademicSession = true;

    @Column(name = "show_admission_no")
    @Builder.Default
    private boolean showAdmissionNo = true;

    @Column(name = "show_roll_no")
    @Builder.Default
    private boolean showRollNo = true;

    @Column(name = "show_photo")
    @Builder.Default
    private boolean showPhoto = true;

    @Column(name = "show_class")
    @Builder.Default
    private boolean showClass = false;

    @Column(name = "show_section")
    @Builder.Default
    private boolean showSection = false;

    @Column(name = "show_dob")
    @Builder.Default
    private boolean showDob = true;

    @Column(name = "show_teacher_remark")
    @Builder.Default
    private boolean showTeacherRemark = true;

    @Column(name = "show_subject_note")
    @Builder.Default
    private boolean showSubjectNote = true;
}
