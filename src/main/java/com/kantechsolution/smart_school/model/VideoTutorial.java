package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "video_tutorials")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoTutorial extends BaseEntity {

    @Column(name = "class_name", nullable = false, length = 120)
    private String className;

    @Column(nullable = false, length = 80)
    private String section;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "video_link", nullable = false, length = 500)
    private String videoLink;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_by", length = 120)
    private String createdBy;
}
