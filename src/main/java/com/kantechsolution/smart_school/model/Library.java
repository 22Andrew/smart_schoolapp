package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Library entity for managing library books
 */
@Entity
@Table(name = "library_books")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Library extends BaseEntity {
    
    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "book_number", length = 50)
    private String bookNumber;
    
    @Column(length = 100)
    private String author;
    
    @Column(name = "isbn", length = 50)
    private String isbn;
    
    @Column(length = 100)
    private String publisher;

    @Column(length = 100)
    private String subject;
    
    @Column(name = "publication_year")
    private Integer publicationYear;
    
    @Column(length = 100)
    private String category;
    
    @Column(name = "total_copies")
    private Integer totalCopies;
    
    @Column(name = "available_copies")
    private Integer availableCopies;
    
    @Column(name = "rack_number", length = 50)
    private String rackNumber;

    @Column(name = "book_price", precision = 12, scale = 2)
    private BigDecimal bookPrice;

    @Column(name = "post_date")
    private LocalDate postDate;
    
    @Column(length = 2000)
    private String description;
    
    @Column(length = 50)
    private String language;
    
    @Column(name = "book_image_url", length = 500)
    private String bookImageUrl;
}
