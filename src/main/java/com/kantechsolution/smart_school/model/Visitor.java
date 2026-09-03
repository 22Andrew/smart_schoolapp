package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Visitor entity representing visitor records
 */
@Entity
@Table(name = "visitors")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visitor extends BaseEntity {
    
    @Column(nullable = false, length = 100)
    private String purpose;
    
    @Column(name = "meeting_with", nullable = false, length = 200)
    private String meetingWith;
    
    @Column(name = "visitor_name", nullable = false, length = 100)
    private String visitorName;
    
    @Column(nullable = false, length = 20)
    private String phone;
    
    @Column(name = "id_card", nullable = false, length = 50)
    private String idCard;
    
    @Column(name = "number_of_person", nullable = false)
    private Integer numberOfPerson;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(name = "in_time", nullable = false)
    private LocalTime inTime;
    
    @Column(name = "out_time")
    private LocalTime outTime;
    
    @Column(length = 500)
    private String note;
    
    @Column(name = "attachment", length = 255)
    private String attachment;
}
