package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "communicate_email_templates")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunicateEmailTemplate extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "template_body", nullable = false, columnDefinition = "TEXT")
    private String templateBody;

    @Column(name = "attachment_path", length = 500)
    private String attachmentPath;
}
