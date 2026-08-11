package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "annual_holidays")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnualHoliday extends BaseEntity {

    @Column(name = "holiday_type", nullable = false, length = 50)
    private String holidayType;

    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "front_site", nullable = false)
    private Boolean frontSite = false;

    @Column(name = "created_by_name", length = 120)
    private String createdByName;

    @Column(name = "created_by_staff_id", length = 30)
    private String createdByStaffId;
}
