package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory_item_suppliers")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemSupplier extends BaseEntity {

    @Column(nullable = false, unique = true, length = 200)
    private String name;

    @Column(length = 80)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(length = 400)
    private String address;

    @Column(name = "contact_person_name", length = 200)
    private String contactPersonName;

    @Column(name = "contact_person_phone", length = 80)
    private String contactPersonPhone;

    @Column(name = "contact_person_email", length = 150)
    private String contactPersonEmail;

    @Column(length = 1000)
    private String description;
}
