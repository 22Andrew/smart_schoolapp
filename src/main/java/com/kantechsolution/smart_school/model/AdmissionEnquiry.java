package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * AdmissionEnquiry entity representing admission enquiries
 */
@Entity
@Table(name = "admission_enquiries")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdmissionEnquiry extends BaseEntity {
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false, length = 20)
    private String phone;
    
    @Column(length = 100)
    private String email;
    
    @Column(length = 500)
    private String address;
    
    @Column(length = 500)
    private String description;
    
    @Column(length = 500)
    private String note;
    
    @Column(name = "enquiry_date", nullable = false)
    private LocalDate date;
    
    @Column(name = "follow_up_date", nullable = false)
    private LocalDate followUpDate;

    @Column(name = "last_follow_up_date")
    private LocalDate lastFollowUpDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "VARCHAR(20) NOT NULL", nullable = false)
    @Builder.Default
    private EnquiryStatus status = EnquiryStatus.ACTIVE;
    
    @Column(length = 100)
    private String assigned;
    
    @Column(length = 100)
    private String reference;
    
    @Column(nullable = false, length = 100)
    private String source;
    
    @Column(name = "class_name", length = 50)
    private String className;
    
    @Column(name = "child_count")
    private Integer childCount;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    public enum EnquiryStatus {
        ACTIVE,
        WON,
        PASSIVE,
        LOST,
        DEAD,
        /** @deprecated use PASSIVE */
        INACTIVE
    }
}
