package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "download_contents")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DownloadContent extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "content_type", nullable = false, length = 120)
    private String contentType;

    @Column(name = "upload_type", nullable = false, length = 20)
    private String uploadType;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "youtube_url", length = 500)
    private String youtubeUrl;

    @Column(name = "uploaded_by", length = 120)
    private String uploadedBy;

    @Column(name = "file_size")
    private Long fileSize;
}
