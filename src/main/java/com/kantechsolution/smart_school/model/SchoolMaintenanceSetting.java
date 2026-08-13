package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_maintenance_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolMaintenanceSetting extends BaseEntity {

    @Column(name = "maintenance_mode", nullable = false)
    private Boolean maintenanceMode;
}
