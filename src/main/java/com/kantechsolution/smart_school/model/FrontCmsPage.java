package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "front_cms_pages")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FrontCmsPage extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 200)
    private String slug;

    @Column(name = "page_type", length = 40)
    private String pageType;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "show_sidebar")
    private Boolean showSidebar;

    @Column(name = "system_page")
    private Boolean systemPage;

    @Column(name = "meta_title", length = 255)
    private String metaTitle;

    @Column(name = "meta_keyword", length = 500)
    private String metaKeyword;

    @Column(name = "meta_description", length = 1000)
    private String metaDescription;
}
