package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "print_header_footer")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrintHeaderFooter extends BaseEntity {

    @Column(name = "document_type", nullable = false, unique = true, length = 40)
    private String documentType;

    @Column(name = "header_image_path", length = 400)
    private String headerImagePath;

    @Lob
    @Column(name = "footer_content", columnDefinition = "TEXT")
    private String footerContent;
}
