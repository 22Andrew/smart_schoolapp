package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "app_file_type_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppFileTypeSetting extends BaseEntity {

    @Column(name = "file_allowed_extension", nullable = false, columnDefinition = "TEXT")
    private String fileAllowedExtension;

    @Column(name = "file_allowed_mime_type", nullable = false, columnDefinition = "TEXT")
    private String fileAllowedMimeType;

    @Column(name = "file_upload_size", nullable = false)
    private Long fileUploadSize;

    @Column(name = "image_allowed_extension", nullable = false, columnDefinition = "TEXT")
    private String imageAllowedExtension;

    @Column(name = "image_allowed_mime_type", nullable = false, columnDefinition = "TEXT")
    private String imageAllowedMimeType;

    @Column(name = "image_upload_size", nullable = false)
    private Long imageUploadSize;
}
