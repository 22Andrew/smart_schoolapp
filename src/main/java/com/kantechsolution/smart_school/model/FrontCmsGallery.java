package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "front_cms_galleries")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FrontCmsGallery extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Lob
    @Column(name = "gallery_images", columnDefinition = "TEXT")
    private String galleryImages;

    @Column(name = "show_sidebar")
    private Boolean showSidebar;

    @Column(name = "meta_title", length = 255)
    private String metaTitle;

    @Column(name = "meta_keyword", length = 500)
    private String metaKeyword;

    @Column(name = "meta_description", length = 1000)
    private String metaDescription;
}
