package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.OnlineCourse;
import com.kantechsolution.smart_school.model.OnlineCourseOfflinePayment;
import com.kantechsolution.smart_school.model.OnlineCoursePurchase;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.OnlineCourseOfflinePaymentRepository;
import com.kantechsolution.smart_school.repository.OnlineCoursePurchaseRepository;
import com.kantechsolution.smart_school.repository.OnlineCourseRepository;
import com.kantechsolution.smart_school.repository.OnlineCourseSectionRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class OnlineCourseOfflinePaymentService {

    @Autowired
    private OnlineCourseRepository onlineCourseRepository;

    @Autowired
    private OnlineCourseSectionRepository sectionRepository;

    @Autowired
    private OnlineCourseOfflinePaymentRepository offlinePaymentRepository;

    @Autowired
    private OnlineCoursePurchaseRepository purchaseRepository;

    @Autowired
    private StudentAdmissionRepository studentAdmissionRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchForStudent(Long studentAdmissionId) {
        StudentAdmission student = studentAdmissionRepository.findById(studentAdmissionId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        String className = student.getSchoolClass() != null ? student.getSchoolClass().getName() : "";
        List<OnlineCourse> courses = onlineCourseRepository.findAllByOrderByIdDesc();
        Map<Long, OnlineCourseOfflinePayment> paidMap = new HashMap<>();
        for (OnlineCourseOfflinePayment payment : offlinePaymentRepository
                .findByStudentAdmissionIdAndPaymentStatusIgnoreCase(studentAdmissionId, "paid")) {
            paidMap.put(payment.getCourseId(), payment);
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (OnlineCourse course : courses) {
            if (!course.isPublished()) continue;
            if (!matchesClass(course.getClassLabel(), className)) continue;

            OnlineCourseOfflinePayment paid = paidMap.get(course.getId());
            rows.add(toCourseRow(course, paid));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> pay(Map<String, Object> body) {
        Long courseId = asLong(body.get("courseId"), "Course is required");
        Long studentId = asLong(body.get("studentAdmissionId"), "Student is required");

        OnlineCourse course = onlineCourseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        StudentAdmission student = studentAdmissionRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        offlinePaymentRepository
                .findByStudentAdmissionIdAndCourseIdAndPaymentStatusIgnoreCase(studentId, courseId, "paid")
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("This course is already paid for the selected student");
                });

        String studentLabel = studentDisplay(student);
        Double price = course.getPrice() == null ? 0.0 : course.getPrice();
        Double currentPrice = resolveCurrentPrice(course);
        LocalDate paymentDate = parseDate(body.get("paymentDate"));
        String paymentMethod = blankTo(text(body.get("paymentMethod")), "Cash");
        String note = text(body.get("note"));

        OnlineCoursePurchase purchase = new OnlineCoursePurchase();
        purchase.setStudentOrGuest(studentLabel);
        purchase.setPurchaseDate(paymentDate);
        purchase.setCourseName(course.getTitle());
        purchase.setCourseProvider(blankTo(course.getPreviewPlatform(), "Youtube"));
        purchase.setPaymentType("offline");
        purchase.setPaymentMethod(paymentMethod);
        purchase.setPaymentStatus("success");
        purchase.setUsersType("student");
        purchase.setPrice(currentPrice);
        purchase = purchaseRepository.save(purchase);

        OnlineCourseOfflinePayment payment = new OnlineCourseOfflinePayment();
        payment.setCourseId(course.getId());
        payment.setCourseName(course.getTitle());
        payment.setStudentAdmissionId(student.getId());
        payment.setStudentLabel(studentLabel);
        payment.setClassId(student.getSchoolClass() != null ? student.getSchoolClass().getId() : null);
        payment.setClassName(student.getSchoolClass() != null ? student.getSchoolClass().getName() : "");
        payment.setSectionName(student.getSection());
        payment.setCourseProvider(blankTo(course.getPreviewPlatform(), "Youtube"));
        payment.setSectionCount((int) sectionRepository.countByCourseId(course.getId()));
        payment.setLessonCount(course.getLessonCount() == null ? 0 : course.getLessonCount());
        payment.setQuizCount(course.getQuizCount() == null ? 0 : course.getQuizCount());
        payment.setExamCount(course.getExamCount() == null ? 0 : course.getExamCount());
        payment.setAssignmentCount(course.getAssignmentCount() == null ? 0 : course.getAssignmentCount());
        payment.setPrice(price);
        payment.setCurrentPrice(currentPrice);
        payment.setPaymentStatus("paid");
        payment.setPaymentMethod(paymentMethod);
        payment.setNote(note.isBlank() ? null : note);
        payment.setPurchaseId(purchase.getId());
        payment.setPaidAt(paymentDate.atStartOfDay());
        payment = offlinePaymentRepository.save(payment);

        return toCourseRow(course, payment);
    }

    @Transactional
    public Map<String, Object> revert(Long paymentId) {
        OnlineCourseOfflinePayment payment = offlinePaymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        if (!"paid".equalsIgnoreCase(payment.getPaymentStatus())) {
            throw new IllegalArgumentException("Only paid payments can be reverted");
        }

        payment.setPaymentStatus("reverted");
        offlinePaymentRepository.save(payment);

        if (payment.getPurchaseId() != null) {
            purchaseRepository.findById(payment.getPurchaseId()).ifPresent(purchase -> {
                purchase.setPaymentStatus("reverted");
                purchaseRepository.save(purchase);
            });
        }

        OnlineCourse course = onlineCourseRepository.findById(payment.getCourseId()).orElse(null);
        Map<String, Object> row = new LinkedHashMap<>();
        if (course != null) {
            row.putAll(toCourseRow(course, null));
        } else {
            row.put("courseId", payment.getCourseId());
            row.put("course", payment.getCourseName());
            row.put("paid", false);
            row.put("paymentId", null);
        }
        return row;
    }

    private Map<String, Object> toCourseRow(OnlineCourse course, OnlineCourseOfflinePayment paid) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("courseId", course.getId());
        row.put("course", course.getTitle());
        row.put("sectionCount", (int) sectionRepository.countByCourseId(course.getId()));
        row.put("lessonCount", course.getLessonCount() == null ? 0 : course.getLessonCount());
        row.put("quizCount", course.getQuizCount() == null ? 0 : course.getQuizCount());
        row.put("examCount", course.getExamCount() == null ? 0 : course.getExamCount());
        row.put("assignmentCount", course.getAssignmentCount() == null ? 0 : course.getAssignmentCount());
        row.put("courseProvider", blankTo(course.getPreviewPlatform(), "Youtube"));
        double price = course.getPrice() == null ? 0.0 : course.getPrice();
        double current = resolveCurrentPrice(course);
        row.put("price", price);
        row.put("currentPrice", current);
        row.put("paid", paid != null);
        row.put("paymentId", paid == null ? null : paid.getId());
        row.put("paymentMethod", paid == null ? null : paid.getPaymentMethod());
        row.put("studentLabel", paid == null ? null : paid.getStudentLabel());
        row.put("paidAt", paid == null || paid.getPaidAt() == null ? null : paid.getPaidAt().toString());
        return row;
    }

    private boolean matchesClass(String courseClassLabel, String studentClassName) {
        if (courseClassLabel == null || courseClassLabel.isBlank()) {
            return true;
        }
        if (studentClassName == null || studentClassName.isBlank()) {
            return true;
        }
        String left = courseClassLabel.trim().toLowerCase(Locale.ROOT);
        String right = studentClassName.trim().toLowerCase(Locale.ROOT);
        return left.equals(right) || left.contains(right) || right.contains(left);
    }

    private Double resolveCurrentPrice(OnlineCourse course) {
        if (course.isFreeCourse()) return 0.0;
        if (course.getDiscountPrice() != null) return course.getDiscountPrice();
        double price = course.getPrice() == null ? 0.0 : course.getPrice();
        Double percent = course.getDiscountPercent();
        if (percent != null && percent > 0) {
            return Math.round(price * (100.0 - percent)) / 100.0;
        }
        return price;
    }

    private String studentDisplay(StudentAdmission student) {
        String name = ((student.getFirstName() == null ? "" : student.getFirstName()) + " "
                + (student.getLastName() == null ? "" : student.getLastName())).trim();
        String admissionNo = student.getAdmissionNo() == null ? "" : student.getAdmissionNo();
        if (admissionNo.isBlank()) return name;
        return name + " (" + admissionNo + ")";
    }

    private LocalDate parseDate(Object value) {
        String text = text(value);
        if (text.isBlank()) {
            return LocalDate.now();
        }
        try {
            return LocalDate.parse(text);
        } catch (Exception e) {
            throw new IllegalArgumentException("Date is required");
        }
    }

    private Long asLong(Object value, String message) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        try {
            return Long.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(message);
        }
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
