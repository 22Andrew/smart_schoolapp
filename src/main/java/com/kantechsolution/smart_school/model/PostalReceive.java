package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * PostalReceive entity representing postal receive records
 */
@Entity
@Table(name = "postal_receive")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostalReceive extends BaseEntity {
    
    @Column(name = "from_title", nullable = false, length = 200)
    private String fromTitle;
    
    @Column(name = "reference_no", nullable = false, length = 50)
    private String referenceNo;
    
    @Column(length = 500)
    private String address;
    
    @Column(length = 1000)
    private String note;
    
    @Column(name = "to_title", nullable = false, length = 200)
    private String toTitle;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(name = "document_path", length = 500)
    private String documentPath;
}
