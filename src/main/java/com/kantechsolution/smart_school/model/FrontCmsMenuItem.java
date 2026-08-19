package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "front_cms_menu_items")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FrontCmsMenuItem extends BaseEntity {

    @Column(name = "menu_id", nullable = false)
    private Long menuId;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "page_id")
    private Long pageId;

    @Column(name = "external_url", length = 500)
    private String externalUrl;

    @Column(name = "open_new_tab")
    private Boolean openNewTab;

    @Column(name = "sort_order")
    private Integer sortOrder;
}
