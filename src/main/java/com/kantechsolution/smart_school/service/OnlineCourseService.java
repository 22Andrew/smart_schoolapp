package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.OnlineCourse;
import com.kantechsolution.smart_school.repository.OnlineCourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OnlineCourseService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    @Autowired
    private OnlineCourseRepository onlineCourseRepository;

    @Autowired
    private UploadStorage uploadStorage;

    @Transactional
    public List<Map<String, Object>> getAllCourses() {
        List<OnlineCourse> courses = onlineCourseRepository.findAllByOrderByIdDesc();
        if (courses.isEmpty()) {
            courses = seedDefaults();
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (OnlineCourse course : courses) {
            rows.add(toRow(course));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> createCourse(Map<String, Object> payload, MultipartFile previewImage) {
        OnlineCourse course = new OnlineCourse();
        applyCourseFields(course, payload, true);
        course.setThemeColor("#8b5cf6");
        course.setLessonCount(0);
        course.setLessonDuration("00:00:00 H");
        course.setExamCount(0);
        course.setQuizCount(0);
        course.setAssignmentCount(0);
        course.setLastUpdated(LocalDate.now());
        course.setPublished(true);
        course.setCreatedByName("Joe Black");
        course.setCreatedByCode("9000");

        if (previewImage != null && !previewImage.isEmpty()) {
            course.setThumbnailUrl(storeCourseImage(previewImage));
        } else {
            throw new IllegalArgumentException("Inline Preview Image is required");
        }

        return toRow(onlineCourseRepository.save(course));
    }

    @Transactional
    public Map<String, Object> updateCourse(Long id, Map<String, Object> payload, MultipartFile previewImage) {
        OnlineCourse course = onlineCourseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        applyCourseFields(course, payload, false);
        if (previewImage != null && !previewImage.isEmpty()) {
            course.setThumbnailUrl(storeCourseImage(previewImage));
        }
        course.setLastUpdated(LocalDate.now());
        return toRow(onlineCourseRepository.save(course));
    }

    private void applyCourseFields(OnlineCourse course, Map<String, Object> payload, boolean creating) {
        String title = text(payload.get("title"));
        if (title.isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        String description = text(payload.get("description"));
        if (description.isBlank()) {
            throw new IllegalArgumentException("Description is required");
        }
        String classLabel = text(payload.get("classLabel"));
        if (classLabel.isBlank()) {
            throw new IllegalArgumentException("Class is required");
        }
        String sectionLabels = text(payload.get("sectionLabels"));
        if (sectionLabels.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }
        String instructorName = text(payload.get("instructorName"));
        if (instructorName.isBlank()) {
            throw new IllegalArgumentException("Assign Teacher is required");
        }
        String category = text(payload.get("category"));
        if (category.isBlank()) {
            throw new IllegalArgumentException("Course Category is required");
        }

        boolean freeCourse = asBoolean(payload.get("freeCourse"));
        Double price = asDouble(payload.get("price"));
        if (!freeCourse && (price == null || price < 0)) {
            throw new IllegalArgumentException("Price is required");
        }

        course.setTitle(title);
        course.setDescription(description);
        course.setOutcomes(text(payload.get("outcomes")));
        course.setCategory(category);
        course.setClassLabel(classLabel);
        course.setSectionLabels(sectionLabels);
        course.setInstructorName(instructorName);
        course.setInstructorCode(text(payload.get("instructorCode")));
        course.setPreviewPlatform(blankTo(text(payload.get("previewPlatform")), "Youtube"));
        course.setPreviewUrl(text(payload.get("previewUrl")));
        course.setFreeCourse(freeCourse);
        course.setPrice(freeCourse ? 0.0 : price);
        course.setDiscountPercent(asDouble(payload.get("discountPercent")));
        if (!freeCourse && course.getDiscountPercent() != null && course.getDiscountPercent() > 0 && price != null) {
            double discounted = price - (price * course.getDiscountPercent() / 100.0);
            course.setDiscountPrice(Math.max(0, Math.round(discounted * 100.0) / 100.0));
        } else if (freeCourse) {
            course.setDiscountPrice(null);
        }
        course.setFrontVisibility(blankTo(text(payload.get("frontVisibility")), "Yes"));
        course.setCertificate(text(payload.get("certificate")));
        if (creating && course.getThemeColor() == null) {
            course.setThemeColor("#8b5cf6");
        }
    }

    private Map<String, Object> toRow(OnlineCourse course) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", course.getId());
        row.put("title", course.getTitle());
        row.put("description", course.getDescription());
        row.put("outcomes", course.getOutcomes());
        row.put("category", course.getCategory());
        row.put("classLabel", course.getClassLabel());
        row.put("sectionLabels", course.getSectionLabels());
        row.put("instructorName", course.getInstructorName());
        row.put("instructorCode", course.getInstructorCode());
        row.put("thumbnailUrl", course.getThumbnailUrl());
        row.put("themeColor", course.getThemeColor());
        row.put("lastUpdated", course.getLastUpdated());
        row.put("lastUpdatedDisplay",
                course.getLastUpdated() == null ? "" : DATE_FMT.format(course.getLastUpdated()));
        row.put("lessonCount", course.getLessonCount() == null ? 0 : course.getLessonCount());
        row.put("lessonDuration", course.getLessonDuration());
        row.put("examCount", course.getExamCount() == null ? 0 : course.getExamCount());
        row.put("quizCount", course.getQuizCount() == null ? 0 : course.getQuizCount());
        row.put("assignmentCount", course.getAssignmentCount() == null ? 0 : course.getAssignmentCount());
        row.put("price", course.getPrice() == null ? 0.0 : course.getPrice());
        row.put("discountPrice", course.getDiscountPrice());
        row.put("discountPercent", course.getDiscountPercent());
        row.put("previewPlatform", course.getPreviewPlatform());
        row.put("previewUrl", course.getPreviewUrl());
        row.put("freeCourse", course.isFreeCourse());
        row.put("frontVisibility", course.getFrontVisibility());
        row.put("certificate", course.getCertificate());
        row.put("createdByName", course.getCreatedByName() == null || course.getCreatedByName().isBlank()
                ? "Joe Black" : course.getCreatedByName());
        row.put("createdByCode", course.getCreatedByCode() == null || course.getCreatedByCode().isBlank()
                ? "9000" : course.getCreatedByCode());
        row.put("published", course.isPublished());
        return row;
    }

    private String storeCourseImage(MultipartFile file) {
        try {
            String original = file.getOriginalFilename() == null ? "course.jpg" : file.getOriginalFilename();
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot >= 0) {
                ext = original.substring(dot);
            }
            String filename = UUID.randomUUID() + ext;
            Path target = uploadStorage.getCoursesDir().resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/courses/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store course image: " + e.getMessage());
        }
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private Double asDouble(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        try {
            return Double.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid number value");
        }
    }

    private boolean asBoolean(Object value) {
        if (value == null) return false;
        if (value instanceof Boolean bool) return bool;
        String text = String.valueOf(value).trim();
        return "true".equalsIgnoreCase(text) || "1".equals(text) || "on".equalsIgnoreCase(text) || "yes".equalsIgnoreCase(text);
    }

    private List<OnlineCourse> seedDefaults() {
        List<OnlineCourse> defaults = new ArrayList<>();
        defaults.add(course(
                "Basic Computer Course for Beginners",
                "Learn the fundamentals of computers, operating systems, typing, and essential office tools.",
                "Personal Development", "Class 1", "Shivam Verma", "9002",
                "#2563eb", LocalDate.of(2026, 5, 4), 2, "12:47:46 H",
                1, 2, 1, 200.0, null));
        defaults.add(course(
                "Online Course",
                "A flexible self-paced course covering digital literacy and classroom enrichment topics.",
                "Personal Development", "Class 1", "Jason Sharlton", "90006",
                "#7c3aed", LocalDate.of(2026, 5, 4), 3, "08:20:10 H",
                0, 1, 2, 200.0, 194.0));
        defaults.add(course(
                "Basic English Speaking Course",
                "Improve spoken English with practical conversations, vocabulary, and pronunciation drills.",
                "Personal Development", "Class 2", "Shivam Verma", "9002",
                "#059669", LocalDate.of(2026, 4, 18), 5, "10:15:00 H",
                1, 3, 2, 180.0, null));
        defaults.add(course(
                "English Course for Beginners",
                "Beginner-friendly English lessons for reading, writing, listening, and speaking skills.",
                "Business Marketing", "Class 2", "Jason Sharlton", "90006",
                "#dc2626", LocalDate.of(2026, 3, 22), 8, "15:40:25 H",
                2, 4, 3, 220.0, 200.0));
        defaults.add(course(
                "Hindi Language Course",
                "Learn Hindi alphabets, grammar basics, and everyday conversation for school students.",
                "Lifestyle course", "Class 1", "Shivam Verma", "9002",
                "#ea580c", LocalDate.of(2026, 2, 11), 4, "09:05:12 H",
                1, 2, 1, 150.0, null));
        defaults.add(course(
                "Math Fundamentals",
                "Strengthen core mathematics concepts including numbers, operations, and problem solving.",
                "UPGRADE SKILL", "Class 3", "Jason Sharlton", "90006",
                "#0891b2", LocalDate.of(2026, 1, 30), 12, "18:30:00 H",
                3, 5, 4, 250.0, null));
        defaults.add(course(
                "Environmental Science Basics",
                "Explore ecosystems, climate, conservation, and practical science activities for learners.",
                "Lifestyle course", "Class 2", "Shivam Verma", "9002",
                "#16a34a", LocalDate.of(2026, 5, 1), 6, "11:22:45 H",
                1, 2, 2, 175.0, null));
        defaults.add(course(
                "Mathematics a Graphical Course",
                "Visual approach to graphs, charts, geometry, and mathematical modeling for students.",
                "UPGRADE SKILL", "Class 3", "Jason Sharlton", "90006",
                "#4f46e5", LocalDate.of(2026, 4, 9), 9, "14:10:33 H",
                2, 3, 3, 230.0, 210.0));
        return onlineCourseRepository.saveAll(defaults);
    }

    private OnlineCourse course(String title,
                                String description,
                                String category,
                                String classLabel,
                                String instructorName,
                                String instructorCode,
                                String themeColor,
                                LocalDate lastUpdated,
                                int lessonCount,
                                String lessonDuration,
                                int examCount,
                                int quizCount,
                                int assignmentCount,
                                double price,
                                Double discountPrice) {
        OnlineCourse course = new OnlineCourse();
        course.setTitle(title);
        course.setDescription(description);
        course.setCategory(category);
        course.setClassLabel(classLabel);
        course.setInstructorName(instructorName);
        course.setInstructorCode(instructorCode);
        course.setThemeColor(themeColor);
        course.setLastUpdated(lastUpdated);
        course.setLessonCount(lessonCount);
        course.setLessonDuration(lessonDuration);
        course.setExamCount(examCount);
        course.setQuizCount(quizCount);
        course.setAssignmentCount(assignmentCount);
        course.setPrice(price);
        course.setDiscountPrice(discountPrice);
        course.setSectionLabels("A, B, C, D");
        course.setCreatedByName("Joe Black");
        course.setCreatedByCode("9000");
        course.setPublished(true);
        return course;
    }
}
