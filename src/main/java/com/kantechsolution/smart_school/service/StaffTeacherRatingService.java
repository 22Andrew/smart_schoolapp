package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.model.StaffTeacherRating;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StaffTeacherRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Order(8)
public class StaffTeacherRatingService implements ApplicationRunner {

    private final StaffTeacherRatingRepository ratingRepository;
    private final StaffMemberRepository staffMemberRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (ratingRepository.count() > 0) {
            return;
        }
        seedSampleRatings();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAll() {
        return ratingRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::toMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> approveRating(Long id) {
        StaffTeacherRating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rating not found"));
        rating.setStatus("Approved");
        return toMap(ratingRepository.save(rating));
    }

    @Transactional
    public void deleteRating(Long id) {
        if (!ratingRepository.existsById(id)) {
            throw new IllegalArgumentException("Rating not found");
        }
        ratingRepository.deleteById(id);
    }

    private void seedSampleRatings() {
        List<StaffMember> staffMembers = staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc();
        if (staffMembers.isEmpty()) {
            return;
        }

        List<SeedRating> seeds = List.of(
                seed(1, 5, "Motivates students to progress", "Pending", "Saurabh Shah", "908875"),
                seed(2, 5, "Excellent", "Approved", "Rahul Kumar", "908901"),
                seed(0, 4, "good teaching and learning", "Approved", "Priya Singh", "908912"),
                seed(3, 5, "Very helpful and patient", "Pending", "Amit Patel", "908923"),
                seed(1, 3, "Needs improvement in communication", "Pending", "Neha Gupta", "908934"),
                seed(2, 5, "Great classroom management", "Approved", "Vikram Mehta", "908945"),
                seed(0, 4, "Explains concepts clearly", "Approved", "Ananya Reddy", "908956"),
                seed(4, 5, "Outstanding mentor", "Approved", "Karan Joshi", "908967"),
                seed(3, 4, "Good subject knowledge", "Pending", "Divya Nair", "908978"),
                seed(1, 5, "Encourages participation", "Approved", "Rohan Das", "908989"),
                seed(2, 4, "Friendly and approachable", "Approved", "Sneha Iyer", "908990"),
                seed(0, 5, "Best teacher in the school", "Approved", "Arjun Malhotra", "908991"),
                seed(3, 3, "Average performance", "Pending", "Meera Kapoor", "908992"),
                seed(4, 5, "Highly recommended", "Approved", "Sanjay Verma", "908993")
        );

        for (SeedRating seed : seeds) {
            StaffMember staff = staffMembers.get(seed.staffIndex() % staffMembers.size());
            StaffTeacherRating rating = StaffTeacherRating.builder()
                    .staffMemberId(staff.getId())
                    .staffIdCode(staff.getStaffId())
                    .staffName(fullName(staff))
                    .rating(seed.rating())
                    .comment(seed.comment())
                    .status(seed.status())
                    .studentName(seed.studentName())
                    .studentAdmissionNo(seed.admissionNo())
                    .build();
            rating.setIsActive(true);
            ratingRepository.save(rating);
        }
    }

    private Map<String, Object> toMap(StaffTeacherRating rating) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", rating.getId());
        row.put("staffId", rating.getStaffIdCode());
        row.put("staffName", rating.getStaffName());
        row.put("staffDisplay", rating.getStaffName() + " ( " + rating.getStaffIdCode() + " )");
        row.put("rating", rating.getRating());
        row.put("comment", rating.getComment() != null ? rating.getComment() : "");
        row.put("status", rating.getStatus());
        row.put("studentName", rating.getStudentName());
        row.put("studentAdmissionNo", rating.getStudentAdmissionNo() != null ? rating.getStudentAdmissionNo() : "");
        row.put("studentDisplay", formatStudentDisplay(rating));
        return row;
    }

    private String formatStudentDisplay(StaffTeacherRating rating) {
        if (rating.getStudentAdmissionNo() != null && !rating.getStudentAdmissionNo().isBlank()) {
            return rating.getStudentName() + " ( " + rating.getStudentAdmissionNo() + " )";
        }
        return rating.getStudentName();
    }

    private String fullName(StaffMember staff) {
        String first = staff.getFirstName() != null ? staff.getFirstName().trim() : "";
        String last = staff.getLastName() != null ? staff.getLastName().trim() : "";
        return (first + " " + last).trim();
    }

    private SeedRating seed(int staffIndex, int rating, String comment, String status,
                            String studentName, String admissionNo) {
        return new SeedRating(staffIndex, rating, comment, status, studentName, admissionNo);
    }

    private record SeedRating(
            int staffIndex,
            int rating,
            String comment,
            String status,
            String studentName,
            String admissionNo
    ) {
    }
}
