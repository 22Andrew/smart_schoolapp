package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "behaviour_incidents")
public class BehaviourIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false)
    private Integer points = 0;

    @Column(length = 2000)
    private String description;

    @Column(name = "negative_incident", nullable = false, columnDefinition = "BIT(1) DEFAULT 0")
    private boolean negativeIncident = false;

    @Column(nullable = false, columnDefinition = "BIT(1) DEFAULT 1")
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (points == null) {
            points = 0;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isNegativeIncident() {
        return negativeIncident;
    }

    public void setNegativeIncident(boolean negativeIncident) {
        this.negativeIncident = negativeIncident;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
