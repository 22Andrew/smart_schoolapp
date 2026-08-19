package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "front_cms_events")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FrontCmsEvent extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(length = 200)
    private String venue;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "show_sidebar")
    private Boolean showSidebar;

    @Column(name = "message_to_student")
    private Boolean messageToStudent;

    @Column(name = "message_to_guardian")
    private Boolean messageToGuardian;

    @Column(name = "message_to_staff")
    private Boolean messageToStaff;

    @Column(name = "meta_title", length = 255)
    private String metaTitle;

    @Column(name = "meta_keyword", length = 500)
    private String metaKeyword;

    @Column(name = "meta_description", length = 1000)
    private String metaDescription;
}
