package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "transport_vehicles")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransportVehicle extends BaseEntity {

    @Column(name = "vehicle_number", nullable = false, unique = true, length = 80)
    private String vehicleNumber;

    @Column(name = "vehicle_model", length = 120)
    private String vehicleModel;

    @Column(name = "year_made", length = 20)
    private String yearMade;

    @Column(name = "registration_number", length = 80)
    private String registrationNumber;

    @Column(name = "chassis_number", length = 80)
    private String chassisNumber;

    @Column(name = "max_seating_capacity")
    private Integer maxSeatingCapacity;

    @Column(name = "driver_name", length = 150)
    private String driverName;

    @Column(name = "driver_licence", length = 80)
    private String driverLicence;

    @Column(name = "driver_contact", length = 40)
    private String driverContact;

    @Column(name = "photo_path", length = 500)
    private String photoPath;

    @Column(length = 1000)
    private String note;
}
