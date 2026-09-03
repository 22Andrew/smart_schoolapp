package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "transport_pickup_points")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransportPickupPoint extends BaseEntity {

    @Column(nullable = false, unique = true, length = 200)
    private String name;

    @Column(length = 50)
    private String latitude;

    @Column(length = 50)
    private String longitude;
}
