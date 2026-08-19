package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "front_cms_news")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FrontCmsNews extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "news_date", nullable = false)
    private LocalDate newsDate;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "show_sidebar")
    private Boolean showSidebar;

    @Column(name = "meta_title", length = 255)
    private String metaTitle;

    @Column(name = "meta_keyword", length = 500)
    private String metaKeyword;

    @Column(name = "meta_description", length = 1000)
    private String metaDescription;
}
