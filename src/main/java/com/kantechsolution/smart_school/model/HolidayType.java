package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "holiday_types")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HolidayType extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;
}
