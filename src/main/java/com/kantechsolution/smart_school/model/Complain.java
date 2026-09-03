package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Complain entity representing complaint records
 */
@Entity
@Table(name = "complains")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complain extends BaseEntity {
    
    @Column(name = "complain_type", nullable = false, length = 50)
    private String complainType; // Transport, Sports, Teacher, Study, Fees, etc.
    
    @Column(nullable = false, length = 20)
    private String source; // Email, Phone, In Person, etc.
    
    @Column(name = "complain_by", nullable = false, length = 100)
    private String complainBy;
    
    @Column(nullable = false, length = 20)
    private String phone;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(length = 2000)
    private String description;
    
    @Column(name = "action_taken", length = 2000)
    private String actionTaken;
    
    @Column(length = 100)
    private String assigned;
    
    @Column(length = 2000)
    private String note;
    
    @Column(name = "document_path", length = 500)
    private String documentPath;
}
