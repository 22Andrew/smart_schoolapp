package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "front_cms_banners")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FrontCmsBanner extends BaseEntity {

    @Column(name = "media_id")
    private Long mediaId;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "file_name", length = 255)
    private String fileName;
}
