package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "transport_route_stops")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransportRouteStop extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "route_id")
    private TransportRoute route;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pickup_point_id")
    private TransportPickupPoint pickupPoint;

    @Column(precision = 10, scale = 2)
    private BigDecimal distance;

    @Column(name = "pickup_time")
    private LocalTime pickupTime;

    @Column(name = "monthly_fees", precision = 12, scale = 2)
    private BigDecimal monthlyFees;

    @Column(name = "sort_order")
    private Integer sortOrder;
}
