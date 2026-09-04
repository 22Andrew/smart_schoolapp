package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.model.MobileAppMessage;
import com.kantechsolution.smart_school.model.NoticeBoard;
import com.kantechsolution.smart_school.repository.MobileAppMessageRepository;
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
    private final MobileAppMessageRepository mobileAppMessageRepository;
    private final UserPanelContextService userPanelContextService;

    public UserPanelNotificationService(NoticeBoardRepository noticeBoardRepository,
                                        MobileAppMessageRepository mobileAppMessageRepository,
                                        UserPanelContextService userPanelContextService) {
        this.noticeBoardRepository = noticeBoardRepository;
        this.mobileAppMessageRepository = mobileAppMessageRepository;
        this.userPanelContextService = userPanelContextService;
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

        AppUserAccount account = userPanelContextService.resolveAccount(authentication);
        if (account != null && account.getUserType() != null && account.getSourceId() != null) {
            for (MobileAppMessage message : mobileAppMessageRepository
                    .findByUserTypeAndSourceIdAndIsActiveTrueOrderByCreatedAtDesc(
                            account.getUserType(), account.getSourceId())) {
                notices.add(toMobileRow(message));
            }
        }

        notices.sort((left, right) -> String.valueOf(right.get("createdAt")).compareTo(String.valueOf(left.get("createdAt"))));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("notices", notices);
        return response;
    }

    private Map<String, Object> toMobileRow(MobileAppMessage message) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", "push-" + message.getId());
        row.put("title", text(message.getTitle()));
        row.put("message", text(message.getMessage()));
        row.put("noticeDate", formatDate(message.getCreatedAt() != null ? message.getCreatedAt().toLocalDate() : LocalDate.now()));
        row.put("publishOn", formatDate(message.getCreatedAt() != null ? message.getCreatedAt().toLocalDate() : LocalDate.now()));
        row.put("publishTo", "Mobile App");
        row.put("messageTo", "Mobile App");
        row.put("createdAt", message.getCreatedAt() != null ? message.getCreatedAt().toString() : "");
        row.put("source", "mobile_app");
        return row;
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
