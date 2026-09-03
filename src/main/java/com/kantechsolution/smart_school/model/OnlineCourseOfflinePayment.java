package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "online_course_offline_payments")
public class OnlineCourseOfflinePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "course_name", nullable = false, length = 255)
    private String courseName;

    @Column(name = "student_admission_id", nullable = false)
    private Long studentAdmissionId;

    @Column(name = "student_label", nullable = false, length = 255)
    private String studentLabel;

    @Column(name = "class_id")
    private Long classId;

    @Column(name = "class_name", length = 100)
    private String className;

    @Column(name = "section_name", length = 50)
    private String sectionName;

    @Column(name = "course_provider", length = 200)
    private String courseProvider;

    @Column(name = "section_count")
    private Integer sectionCount = 0;

    @Column(name = "lesson_count")
    private Integer lessonCount = 0;

    @Column(name = "quiz_count")
    private Integer quizCount = 0;

    @Column(name = "exam_count")
    private Integer examCount = 0;

    @Column(name = "assignment_count")
    private Integer assignmentCount = 0;

    @Column(name = "price")
    private Double price = 0.0;

    @Column(name = "current_price")
    private Double currentPrice = 0.0;

    @Column(name = "payment_status", length = 50)
    private String paymentStatus = "paid";

    @Column(name = "payment_method", length = 50)
    private String paymentMethod = "Cash";

    @Column(name = "note", length = 1000)
    private String note;

    @Column(name = "purchase_id")
    private Long purchaseId;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (paidAt == null) {
            paidAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public Long getStudentAdmissionId() { return studentAdmissionId; }
    public void setStudentAdmissionId(Long studentAdmissionId) { this.studentAdmissionId = studentAdmissionId; }
    public String getStudentLabel() { return studentLabel; }
    public void setStudentLabel(String studentLabel) { this.studentLabel = studentLabel; }
    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }
    public String getCourseProvider() { return courseProvider; }
    public void setCourseProvider(String courseProvider) { this.courseProvider = courseProvider; }
    public Integer getSectionCount() { return sectionCount; }
    public void setSectionCount(Integer sectionCount) { this.sectionCount = sectionCount; }
    public Integer getLessonCount() { return lessonCount; }
    public void setLessonCount(Integer lessonCount) { this.lessonCount = lessonCount; }
    public Integer getQuizCount() { return quizCount; }
    public void setQuizCount(Integer quizCount) { this.quizCount = quizCount; }
    public Integer getExamCount() { return examCount; }
    public void setExamCount(Integer examCount) { this.examCount = examCount; }
    public Integer getAssignmentCount() { return assignmentCount; }
    public void setAssignmentCount(Integer assignmentCount) { this.assignmentCount = assignmentCount; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Double getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(Double currentPrice) { this.currentPrice = currentPrice; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Long getPurchaseId() { return purchaseId; }
    public void setPurchaseId(Long purchaseId) { this.purchaseId = purchaseId; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
