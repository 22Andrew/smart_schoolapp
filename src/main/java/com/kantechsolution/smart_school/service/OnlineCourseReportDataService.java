package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.OnlineCourseGuest;
import com.kantechsolution.smart_school.model.OnlineCourseRatingReview;
import com.kantechsolution.smart_school.model.OnlineCourseStudentProgress;
import com.kantechsolution.smart_school.repository.OnlineCourseGuestRepository;
import com.kantechsolution.smart_school.repository.OnlineCourseRatingReviewRepository;
import com.kantechsolution.smart_school.repository.OnlineCourseStudentProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OnlineCourseReportDataService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final Map<String, int[]> DEMO_RATINGS = demoRatings();
    private static final List<DemoCourse> DEMO_COURSES = demoCourses();

    private final OnlineCourseService onlineCourseService;
    private final OnlineCourseGuestRepository guestRepository;
    private final OnlineCourseStudentProgressRepository progressRepository;
    private final OnlineCourseRatingReviewRepository ratingReviewRepository;

    @Transactional
    public Map<String, Object> getRatingReport() {
        List<Map<String, Object>> courses = onlineCourseService.getAllCourses();
        Map<String, Map<String, Object>> byTitle = new LinkedHashMap<>();
        for (Map<String, Object> course : courses) {
            byTitle.put(normalizeTitle(text(course.get("title"))), course);
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (DemoCourse demo : DEMO_COURSES) {
            Map<String, Object> course = byTitle.remove(normalizeTitle(demo.title()));
            if (course != null) {
                rows.add(toRatingRow(course, demo.stars(), demo.reviews()));
            } else {
                rows.add(syntheticRatingRow(demo));
            }
        }
        for (Map<String, Object> course : byTitle.values()) {
            rows.add(toRatingRow(course, 0, 0));
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("rows", rows);
        payload.put("total", rows.size());
        return payload;
    }

    @Transactional
    public Map<String, Object> getGuestReport() {
        seedGuestsIfEmpty();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (OnlineCourseGuest guest : guestRepository.findAllByOrderByAdmissionNoAsc()) {
            rows.add(toGuestRow(guest));
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("rows", rows);
        payload.put("total", rows.size());
        return payload;
    }

    @Transactional
    public Map<String, Object> getRatingDetails(Long courseId, String title) {
        List<OnlineCourseRatingReview> reviews = loadOrSeedReviews(courseId, title);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (OnlineCourseRatingReview review : reviews) {
            rows.add(toReviewRow(review));
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("rows", rows);
        payload.put("total", rows.size());
        payload.put("title", text(title));
        return payload;
    }

    @Transactional
    public void deleteRatingReview(Long id) {
        if (id == null || !ratingReviewRepository.existsById(id)) {
            throw new IllegalArgumentException("Rating review not found");
        }
        ratingReviewRepository.deleteById(id);
    }

    @Transactional
    public void deleteGuest(Long id) {
        if (id == null || !guestRepository.existsById(id)) {
            throw new IllegalArgumentException("Guest not found");
        }
        guestRepository.deleteById(id);
    }

    private Map<String, Object> toRatingRow(Map<String, Object> course, int demoStars, int demoReviews) {
        Long courseId = asLong(course.get("id"));
        List<OnlineCourseStudentProgress> progress = courseId == null
                ? List.of()
                : progressRepository.findByCourseId(courseId);
        int reviewCount = (int) progress.stream()
                .filter(item -> item.getRatingCount() != null && item.getRatingCount() > 0)
                .count();
        int avgStars = (int) Math.round(progress.stream()
                .filter(item -> item.getRatingCount() != null && item.getRatingCount() > 0)
                .mapToInt(OnlineCourseStudentProgress::getRatingCount)
                .average()
                .orElse(0));
        if (reviewCount == 0) {
            reviewCount = demoReviews > 0 ? demoReviews : defaultReviewCount(text(course.get("title")));
        }
        if (avgStars <= 0) {
            avgStars = demoStars > 0 ? demoStars : defaultStars(text(course.get("title")));
        }
        avgStars = Math.max(1, Math.min(5, avgStars));

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", courseId);
        row.put("title", text(course.get("title")));
        row.put("classLabel", classDisplay(text(course.get("classLabel")), text(course.get("sectionLabels"))));
        row.put("rating", avgStars);
        row.put("reviewCount", reviewCount);
        return row;
    }

    private Map<String, Object> syntheticRatingRow(DemoCourse demo) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", null);
        row.put("title", demo.title());
        row.put("classLabel", demo.classLabel());
        row.put("rating", demo.stars());
        row.put("reviewCount", demo.reviews());
        return row;
    }

    private Map<String, Object> toGuestRow(OnlineCourseGuest guest) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", guest.getId());
        row.put("fullName", guest.getFullName());
        row.put("admissionNo", guest.getAdmissionNo());
        row.put("email", blankToEmpty(guest.getEmail()));
        row.put("mobileNumber", blankToEmpty(guest.getMobileNumber()));
        row.put("dateOfBirth", guest.getDateOfBirth() == null ? "" : DATE_FMT.format(guest.getDateOfBirth()));
        row.put("gender", blankToEmpty(guest.getGender()));
        row.put("address", blankToEmpty(guest.getAddress()));
        row.put("imageUrl", blankToEmpty(guest.getImageUrl()));
        return row;
    }

    private List<OnlineCourseRatingReview> loadOrSeedReviews(Long courseId, String title) {
        List<OnlineCourseRatingReview> existing = courseId != null
                ? ratingReviewRepository.findByCourseIdOrderByIdAsc(courseId)
                : List.of();
        if (existing.isEmpty() && title != null && !title.isBlank()) {
            existing = ratingReviewRepository.findByCourseTitleIgnoreCaseOrderByIdAsc(title.trim());
        }
        if (!existing.isEmpty()) {
            return existing;
        }
        return List.of(saveReview(courseId, title, "Edward Thomas", "1800011", 4, "NICE"));
    }

    private OnlineCourseRatingReview saveReview(Long courseId, String title, String studentName,
                                                String admissionNo, int rating, String reviewText) {
        OnlineCourseRatingReview review = new OnlineCourseRatingReview();
        review.setCourseId(courseId);
        review.setCourseTitle(text(title));
        review.setStudentName(studentName);
        review.setAdmissionNo(admissionNo);
        review.setRating(rating);
        review.setReviewText(reviewText);
        review.setIsActive(true);
        return ratingReviewRepository.save(review);
    }

    private Map<String, Object> toReviewRow(OnlineCourseRatingReview review) {
        String admissionNo = blankToEmpty(review.getAdmissionNo());
        String displayName = text(review.getStudentName());
        if (!admissionNo.isBlank()) {
            displayName = displayName + " (Student -" + admissionNo + ")";
        }
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", review.getId());
        row.put("studentName", displayName);
        row.put("rating", review.getRating() == null ? 4 : review.getRating());
        row.put("review", blankToEmpty(review.getReviewText()));
        return row;
    }

    private void seedGuestsIfEmpty() {
        if (guestRepository.count() > 0) {
            return;
        }
        List<OnlineCourseGuest> guests = new ArrayList<>();
        guests.add(guest("Arvind Sinha", "Guest100", "arvind@gmail.com", "980878768", LocalDate.of(1999, 6, 18), "Male"));
        guests.add(guest("Vinay Patel", "Guest101", "vinay@gmail.com", null, LocalDate.of(2010, 3, 19), "Male"));
        guests.add(guest("Mitchel Thomas", "Guest102", "mitchel@gmail.com", null, LocalDate.of(2013, 7, 25), "Male"));
        guests.add(guest("arvind Khanna", "Guest103", "arvind67@gmail.com", "908768678", LocalDate.of(2009, 7, 17), "Male"));
        guests.add(guest("Elisabeth Thomas", "Guest104", "elisabeth@gmail.com", null, LocalDate.of(2019, 5, 13), "Female"));
        guests.add(guest("Alberto Wood", "Guest105", "alberto@gmail.com", null, LocalDate.of(2009, 6, 18), "Male"));
        guests.add(guest("Garry hook", "Guest106", "Garry45@gmail.com", null, null, null));
        guests.add(guest("Emma Watson", "Guest107", "emm45@gmail.com", null, null, null));
        guests.add(guest("Faran Shah", "Guest108", "faran@gmail.com", "898706908", LocalDate.of(2009, 7, 24), "Male"));
        guests.add(guest("rahul", "Guest109", "rahularawal@gmail.com", null, null, null));
        guests.add(guest("Saurabh Patel", "Guest110", "saurabh20@gmail.com", null, null, null));
        guests.add(guest("Gaurav Khanna", "Guest111", "Gaurav7B@gmail.com", null, LocalDate.of(2014, 7, 19), "Male"));
        guests.add(guest("nakul", "Guest112", "guest12@gmail.com", null, null, null));
        guestRepository.saveAll(guests);
    }

    private OnlineCourseGuest guest(String name, String admissionNo, String email, String mobile,
                                    LocalDate dob, String gender) {
        OnlineCourseGuest row = new OnlineCourseGuest();
        row.setFullName(name);
        row.setAdmissionNo(admissionNo);
        row.setEmail(email);
        row.setMobileNumber(mobile);
        row.setDateOfBirth(dob);
        row.setGender(gender);
        row.setAddress("");
        row.setImageUrl("https://i.pravatar.cc/64?u=" + admissionNo);
        row.setIsActive(true);
        return row;
    }

    private String classDisplay(String classLabel, String sectionLabels) {
        String className = classLabel == null || classLabel.isBlank() ? "Class 1" : classLabel.trim();
        if (className.contains("(")) {
            return className;
        }
        String section = "A";
        if (sectionLabels != null && !sectionLabels.isBlank()) {
            section = sectionLabels.split("[,/]")[0].trim();
            if (section.isBlank()) {
                section = "A";
            }
        }
        return className + " (" + section + ")";
    }

    private int defaultStars(String title) {
        int[] demo = DEMO_RATINGS.get(normalizeTitle(title));
        if (demo != null) {
            return demo[0];
        }
        return 4;
    }

    private int defaultReviewCount(String title) {
        int[] demo = DEMO_RATINGS.get(normalizeTitle(title));
        if (demo != null) {
            return demo[1];
        }
        return 1;
    }

    private String normalizeTitle(String title) {
        return title == null ? "" : title.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blankToEmpty(String value) {
        return value == null ? "" : value;
    }

    private Long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value == null) {
            return null;
        }
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static Map<String, int[]> demoRatings() {
        Map<String, int[]> map = new LinkedHashMap<>();
        map.put("online course", new int[]{4, 1});
        map.put("basic computer course for beginners", new int[]{5, 1});
        map.put("english course for beginners", new int[]{2, 1});
        map.put("hindi language course", new int[]{3, 2});
        map.put("math fundamentals", new int[]{3, 2});
        map.put("environmental science course", new int[]{3, 3});
        map.put("environmental science basics", new int[]{3, 3});
        map.put("mathematics a graphical course", new int[]{4, 1});
        map.put("physics - energy course", new int[]{4, 3});
        map.put("physics-energy course", new int[]{4, 3});
        map.put("communication skills", new int[]{3, 3});
        map.put("the life of plants", new int[]{4, 3});
        map.put("basic drawing skills course", new int[]{4, 2});
        map.put("yoga for kids", new int[]{4, 2});
        map.put("chemistry course", new int[]{3, 1});
        map.put("basic science course", new int[]{4, 3});
        return map;
    }

    private static List<DemoCourse> demoCourses() {
        return List.of(
                new DemoCourse("online course", "Class 1 (A)", 4, 1),
                new DemoCourse("Basic Computer Course for Beginners", "Class 1 (A)", 5, 1),
                new DemoCourse("English Course for Beginners", "Class 1 (A)", 2, 1),
                new DemoCourse("Hindi language Course", "Class 1 (A)", 3, 2),
                new DemoCourse("Math Fundamentals", "Class 1 (A)", 3, 2),
                new DemoCourse("ENVIRONMENTAL SCIENCE COURSE", "Class 1 (A)", 3, 3),
                new DemoCourse("Mathematics a Graphical Course", "Class 2 (A)", 4, 1),
                new DemoCourse("Physics - Energy Course", "Class 1 (A)", 4, 3),
                new DemoCourse("COMMUNICATION SKILLS", "Class 5 (A)", 3, 3),
                new DemoCourse("The Life of Plants", "Class 1 (A)", 4, 3),
                new DemoCourse("Basic Drawing Skills course", "Class 5 (A)", 4, 2),
                new DemoCourse("Yoga for Kids", "Class 5 (A)", 4, 2),
                new DemoCourse("Chemistry Course", "Class 4 (A)", 3, 1),
                new DemoCourse("Basic Science Course", "Class 1 (A)", 4, 3)
        );
    }

    private record DemoCourse(String title, String classLabel, int stars, int reviews) {
    }
}
