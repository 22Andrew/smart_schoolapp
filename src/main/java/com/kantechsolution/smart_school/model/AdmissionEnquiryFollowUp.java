package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Follow-up record for an admission enquiry
 */
@Entity
@Table(name = "admission_enquiry_follow_ups")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdmissionEnquiryFollowUp extends BaseEntity {

    @Column(name = "enquiry_id", nullable = false)
    private Long enquiryId;

    @Column(name = "follow_up_date", nullable = false)
    private LocalDate followUpDate;

    @Column(name = "next_follow_up_date", nullable = false)
    private LocalDate nextFollowUpDate;

    @Column(nullable = false, length = 500)
    private String response;

    @Column(length = 2000)
    private String note;

    @Column(name = "created_by", length = 100)
    private String createdBy;
}
