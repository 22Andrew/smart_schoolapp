package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

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
    
    @Column(length = 100)
    private String author;
    
    @Column(name = "isbn", unique = true, length = 20)
    private String isbn;
    
    @Column(length = 100)
    private String publisher;
    
    @Column(name = "publication_year")
    private Integer publicationYear;
    
    @Column(length = 100)
    private String category;
    
    @Column(name = "total_copies")
    private Integer totalCopies;
    
    @Column(name = "available_copies")
    private Integer availableCopies;
    
    @Column(name = "rack_number", length = 20)
    private String rackNumber;
    
    @Column(length = 1000)
    private String description;
    
    @Column(length = 50)
    private String language;
    
    @Column(name = "book_image_url", length = 500)
    private String bookImageUrl;
}
