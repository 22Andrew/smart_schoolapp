package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "inventory_item_stock")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemStock extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private InventoryItem item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private InventoryItemSupplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private InventoryItemStore store;

    @Column(name = "quantity_symbol", nullable = false, length = 1)
    @Builder.Default
    private String quantitySymbol = "+";

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "purchase_price", precision = 12, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "stock_date", nullable = false)
    private LocalDate stockDate;

    @Column(name = "document_path", length = 500)
    private String documentPath;

    @Column(name = "document_name", length = 255)
    private String documentName;

    @Column(length = 1000)
    private String description;
}
