package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "inventory_issue_items")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryIssueItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private InventoryItem item;

    @Column(name = "user_type", nullable = false, length = 30)
    private String userType;

    @Column(name = "issue_to_id")
    private Long issueToId;

    @Column(name = "issue_to_name", length = 200)
    private String issueToName;

    @Column(name = "issue_to_code", length = 50)
    private String issueToCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by_id")
    private StaffMember issuedBy;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(length = 500)
    private String note;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "Issued";
}
