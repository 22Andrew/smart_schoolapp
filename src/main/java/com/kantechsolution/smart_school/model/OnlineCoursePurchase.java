package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "online_course_purchases")
public class OnlineCoursePurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_or_guest", nullable = false, length = 200)
    private String studentOrGuest;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(name = "course_name", nullable = false, length = 255)
    private String courseName;

    @Column(name = "course_provider", length = 200)
    private String courseProvider;

    @Column(name = "payment_type", length = 50)
    private String paymentType;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_status", length = 50)
    private String paymentStatus;

    @Column(name = "users_type", length = 50)
    private String usersType;

    @Column(name = "price")
    private Double price = 0.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (purchaseDate == null) {
            purchaseDate = LocalDate.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStudentOrGuest() { return studentOrGuest; }
    public void setStudentOrGuest(String studentOrGuest) { this.studentOrGuest = studentOrGuest; }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public String getCourseProvider() { return courseProvider; }
    public void setCourseProvider(String courseProvider) { this.courseProvider = courseProvider; }
    public String getPaymentType() { return paymentType; }
    public void setPaymentType(String paymentType) { this.paymentType = paymentType; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getUsersType() { return usersType; }
    public void setUsersType(String usersType) { this.usersType = usersType; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
