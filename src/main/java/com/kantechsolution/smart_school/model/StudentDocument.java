package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_documents")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDocument extends BaseEntity {

    @Column(name = "student_admission_id", nullable = false)
    private Long studentAdmissionId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "file_name", nullable = false, length = 300)
    private String fileName;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String source = "LOCAL";

    @Column(name = "google_drive_file_id", length = 200)
    private String googleDriveFileId;

    @Column(name = "google_drive_url", length = 1000)
    private String googleDriveUrl;

    @Column(name = "mime_type", length = 150)
    private String mimeType;

    @Column(name = "file_size")
    private Long fileSize;
}
