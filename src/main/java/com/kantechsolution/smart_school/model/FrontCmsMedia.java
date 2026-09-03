package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "front_cms_media")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FrontCmsMedia extends BaseEntity {

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "file_type", length = 40)
    private String fileType;

    @Column(name = "youtube_url", length = 500)
    private String youtubeUrl;
}
