package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.NoticeBoard;
import com.kantechsolution.smart_school.repository.NoticeBoardRepository;
import org.springframework.security.core.Authentication;
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
public class UserPanelNotificationService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy", Locale.US);

    private final NoticeBoardRepository noticeBoardRepository;

    public UserPanelNotificationService(NoticeBoardRepository noticeBoardRepository) {
        this.noticeBoardRepository = noticeBoardRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listNotifications(Authentication authentication) {
        String audience = resolveAudience(authentication);

        List<Map<String, Object>> notices = new ArrayList<>();
        for (NoticeBoard notice : noticeBoardRepository.findAllByOrderByNoticeDateDescCreatedAtDesc()) {
            if (!isVisibleToAudience(notice, audience)) {
                continue;
            }
            notices.add(toRow(notice));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("notices", notices);
        return response;
    }

    private String resolveAudience(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return "Student";
        }
        boolean isParent = authentication.getAuthorities().stream()
                .anyMatch(auth -> "ROLE_PARENT".equalsIgnoreCase(auth.getAuthority()));
        return isParent ? "Parent" : "Student";
    }

    private boolean isVisibleToAudience(NoticeBoard notice, String audience) {
        if (Boolean.FALSE.equals(notice.getIsActive())) {
            return false;
        }
        if (Boolean.FALSE.equals(notice.getShowOnWebsite())) {
            return false;
        }

        String publishTo = text(notice.getPublishTo());
        String messageTo = text(notice.getMessageTo());
        if (publishTo.isBlank() && messageTo.isBlank()) {
            return true;
        }
        if ("Multiple".equalsIgnoreCase(publishTo)) {
            return messageTo.isBlank()
                    || containsAudience(messageTo, audience)
                    || containsAudience(messageTo, "Student")
                    || containsAudience(messageTo, "Parent");
        }
        if (publishTo.equalsIgnoreCase(audience)) {
            return true;
        }
        return containsAudience(messageTo, audience);
    }

    private boolean containsAudience(String messageTo, String audience) {
        if (messageTo.isBlank() || audience.isBlank()) {
            return false;
        }
        for (String part : messageTo.split(",")) {
            if (audience.equalsIgnoreCase(part.trim())) {
                return true;
            }
        }
        return false;
    }

    private void ensureDemoNotices() {
        if (noticeBoardRepository.count() > 0) {
            return;
        }

        LocalDate aug18 = LocalDate.of(2026, 8, 18);
        LocalDate aug6 = LocalDate.of(2026, 8, 6);
        LocalDate apr1 = LocalDate.of(2026, 4, 1);

        saveNotice("Notice for new Book collection",
                "Please collect new books from the library during school hours.",
                aug18, "Student");
        saveNotice("Fee Submission Reminder",
                "Kindly submit pending fees before the due date to avoid late charges.",
                aug6, "Student");
        saveNotice("Extra class for Std - X to XII",
                "Extra classes for standards X to XII will be held on Saturday.",
                aug6, "Student");
        saveNotice("Parent-Teacher Meeting",
                "Dear parents, the parent-teacher meeting is scheduled next week.",
                aug6, "Parent");
        saveNotice("Online Learning Notice",
                "Online learning sessions will continue as per the shared timetable.",
                aug6, "Student");
        saveNotice("Student Health Check-up",
                "Annual student health check-up camp will be organized in the school campus.",
                aug6, "Student");
        saveNotice("PTM",
                "Parent teacher meeting for all classes will be held this month.",
                apr1, "Parent");
        saveNotice("Fees Reminder",
                "This is a reminder to clear outstanding fee dues at the earliest.",
                aug6, "Student");
        saveNotice("PTM Notice - April 2026",
                "PTM for April 2026 is scheduled. Please check the notice for date and time.",
                apr1, "Parent");
    }

    private void saveNotice(String title, String message, LocalDate noticeDate, String publishTo) {
        NoticeBoard notice = NoticeBoard.builder()
                .title(title)
                .message(message)
                .noticeDate(noticeDate)
                .publishOn(noticeDate)
                .publishTo(publishTo)
                .messageTo(publishTo)
                .sendByEmail(false)
                .sendBySms(false)
                .showOnWebsite(true)
                .build();
        notice.setIsActive(true);
        noticeBoardRepository.save(notice);
    }

    private Map<String, Object> toRow(NoticeBoard notice) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", notice.getId());
        row.put("title", text(notice.getTitle()));
        row.put("message", text(notice.getMessage()));
        row.put("noticeDate", formatDate(notice.getNoticeDate()));
        row.put("publishOn", formatDate(notice.getPublishOn() != null ? notice.getPublishOn() : notice.getNoticeDate()));
        row.put("publishTo", text(notice.getPublishTo()));
        row.put("messageTo", text(notice.getMessageTo()));
        row.put("createdAt", notice.getCreatedAt() != null ? notice.getCreatedAt().toString() : "");
        return row;
    }

    private String formatDate(LocalDate date) {
        return date == null ? "" : date.format(US_DATE);
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }
}
