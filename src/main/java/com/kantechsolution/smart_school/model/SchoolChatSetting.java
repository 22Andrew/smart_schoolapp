package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_chat_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolChatSetting extends BaseEntity {

    @Column(name = "allow_student_delete_chat", nullable = false)
    private Boolean allowStudentDeleteChat;

    @Column(name = "allow_guardian_delete_chat", nullable = false)
    private Boolean allowGuardianDeleteChat;

    @Column(name = "allow_staff_delete_chat", nullable = false)
    private Boolean allowStaffDeleteChat;
}
