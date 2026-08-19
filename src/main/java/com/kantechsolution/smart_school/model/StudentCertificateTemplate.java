package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "student_certificate_templates")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentCertificateTemplate extends BaseEntity {

    @Column(name = "certificate_name", nullable = false, length = 200)
    private String certificateName;

    @Column(name = "header_left_text", length = 255)
    private String headerLeftText;

    @Column(name = "header_center_text", length = 255)
    private String headerCenterText;

    @Column(name = "header_right_text", length = 255)
    private String headerRightText;

    @Column(name = "body_text", nullable = false, columnDefinition = "TEXT")
    private String bodyText;

    @Column(name = "footer_left_text", length = 255)
    private String footerLeftText;

    @Column(name = "footer_center_text", length = 255)
    private String footerCenterText;

    @Column(name = "footer_right_text", length = 255)
    private String footerRightText;

    @Column(name = "header_height")
    private Integer headerHeight;

    @Column(name = "footer_height")
    private Integer footerHeight;

    @Column(name = "body_height")
    private Integer bodyHeight;

    @Column(name = "body_width")
    private Integer bodyWidth;

    @Column(name = "student_photo", nullable = false)
    private boolean studentPhoto;

    @Column(name = "background_image_url", length = 500)
    private String backgroundImageUrl;
}
