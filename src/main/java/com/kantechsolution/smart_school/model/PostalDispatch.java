package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * PostalDispatch entity representing postal dispatch records
 */
@Entity
@Table(name = "postal_dispatch")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostalDispatch extends BaseEntity {
    
    @Column(name = "to_title", nullable = false, length = 200)
    private String toTitle;
    
    @Column(name = "reference_no", nullable = false, length = 50)
    private String referenceNo;
    
    @Column(length = 500)
    private String address;
    
    @Column(length = 1000)
    private String note;
    
    @Column(name = "from_title", nullable = false, length = 200)
    private String fromTitle;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(name = "document_path", length = 500)
    private String documentPath;
}
