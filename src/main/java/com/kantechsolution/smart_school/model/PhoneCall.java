package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * PhoneCall entity representing phone call log records
 */
@Entity
@Table(name = "phone_calls")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhoneCall extends BaseEntity {
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false, length = 20)
    private String phone;
    
    @Column(name = "call_type", nullable = false, length = 20)
    private String callType; // Incoming or Outgoing
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(name = "follow_up_date")
    private LocalDate followUpDate;
    
    @Column(name = "call_duration")
    private Integer callDuration; // Duration in minutes
    
    @Column(length = 1000)
    private String description;
}
