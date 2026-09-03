package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "thermal_print_setting")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThermalPrintSetting extends BaseEntity {

    @Column(name = "thermal_print_enabled", nullable = false)
    private Boolean thermalPrintEnabled;

    @Column(name = "school_name", nullable = false, length = 200)
    private String schoolName;

    @Lob
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Lob
    @Column(name = "footer_text", columnDefinition = "TEXT")
    private String footerText;
}
