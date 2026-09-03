package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "communicate_sms_templates")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunicateSmsTemplate extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "template_body", nullable = false, columnDefinition = "TEXT")
    private String templateBody;
}
