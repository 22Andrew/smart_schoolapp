package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "staff_leave_types")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffLeaveType extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;
}
