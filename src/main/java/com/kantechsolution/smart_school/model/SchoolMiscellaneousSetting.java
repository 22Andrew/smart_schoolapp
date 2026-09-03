package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_miscellaneous_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolMiscellaneousSetting extends BaseEntity {

    public static final String SCAN_TYPE_BARCODE = "BARCODE";
    public static final String SCAN_TYPE_QR_CODE = "QR_CODE";

    @Column(name = "show_me_only_my_question", nullable = false)
    private Boolean showMeOnlyMyQuestion;

    @Column(name = "id_card_scan_type", nullable = false, length = 20)
    private String idCardScanType;

    @Column(name = "exam_result_page_in_front_site", nullable = false)
    private Boolean examResultPageInFrontSite;

    @Column(name = "download_admit_card_in_student_parent_panel", nullable = false)
    private Boolean downloadAdmitCardInStudentParentPanel;

    @Column(name = "teacher_restricted_mode", nullable = false)
    private Boolean teacherRestrictedMode;

    @Column(name = "superadmin_visibility", nullable = false)
    private Boolean superadminVisibility;

    @Column(name = "event_reminder", nullable = false)
    private Boolean eventReminder;

    @Column(name = "staff_apply_leave_notification_email", length = 255)
    private String staffApplyLeaveNotificationEmail;

    @Column(name = "enable_multi_class_selection_in_student_admission", nullable = false)
    private Boolean enableMultiClassSelectionInStudentAdmission;
}
