package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.VideoTutorial;
import com.kantechsolution.smart_school.repository.VideoTutorialRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class UserPanelVideoTutorialService {

    private static final Pattern YOUTUBE_ID = Pattern.compile(
            "(?:youtube\\.com/(?:watch\\?v=|embed/|shorts/)|youtu\\.be/)([A-Za-z0-9_-]{11})"
    );

    private static final List<DemoVideo> DEMO_VIDEOS = List.of(
            new DemoVideo("Motivational Speech", "https://www.youtube.com/watch?v=mgmVOuLgFB0"),
            new DemoVideo("ENVIRONMENTAL SCIENCE", "https://www.youtube.com/watch?v=xFPoIU5iiYQ"),
            new DemoVideo("The world of birds", "https://www.youtube.com/watch?v=yeYV4UjsdxM"),
            new DemoVideo("GK Quiz", "https://www.youtube.com/watch?v=kXTz-2TmKjE"),
            new DemoVideo("Telling Time For Children", "https://www.youtube.com/watch?v=EDnbUNKxsM8")
    );

    private final VideoTutorialRepository videoTutorialRepository;
    private final UserPanelContextService contextService;

    public UserPanelVideoTutorialService(VideoTutorialRepository videoTutorialRepository,
                                         UserPanelContextService contextService) {
        this.videoTutorialRepository = videoTutorialRepository;
        this.contextService = contextService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listTutorials(Authentication authentication) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        String className = resolveClassName(student);
        String section = resolveSection(student);

        List<VideoTutorial> all = videoTutorialRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> matching = new ArrayList<>();
        for (VideoTutorial tutorial : all) {
            if (Boolean.FALSE.equals(tutorial.getIsActive())) {
                continue;
            }
            Map<String, Object> row = toRow(tutorial);
            if (matchesClass(tutorial, className, section)) {
                matching.add(row);
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("rows", matching);
        return response;
    }

    private void ensureDemoVideos(String className, String section) {
        if (videoTutorialRepository.count() > 0) {
            return;
        }
        for (DemoVideo demo : DEMO_VIDEOS) {
            VideoTutorial tutorial = VideoTutorial.builder()
                    .className(className)
                    .section(section)
                    .title(demo.title())
                    .videoLink(demo.videoLink())
                    .description("")
                    .createdBy("Admin")
                    .build();
            tutorial.setIsActive(true);
            videoTutorialRepository.save(tutorial);
        }
    }

    private boolean matchesClass(VideoTutorial tutorial, String className, String section) {
        return text(tutorial.getClassName()).equalsIgnoreCase(className)
                && text(tutorial.getSection()).equalsIgnoreCase(section);
    }

    private Map<String, Object> toRow(VideoTutorial tutorial) {
        String videoLink = text(tutorial.getVideoLink());
        String youtubeId = extractYoutubeId(videoLink);
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", tutorial.getId());
        row.put("title", text(tutorial.getTitle()));
        row.put("videoLink", videoLink);
        row.put("youtubeId", youtubeId);
        row.put("thumbnailUrl", youtubeId.isBlank()
                ? ""
                : "https://img.youtube.com/vi/" + youtubeId + "/hqdefault.jpg");
        row.put("embedUrl", youtubeId.isBlank()
                ? videoLink
                : "https://www.youtube.com/embed/" + youtubeId);
        return row;
    }

    private String extractYoutubeId(String url) {
        if (url.isBlank()) {
            return "";
        }
        Matcher matcher = YOUTUBE_ID.matcher(url);
        return matcher.find() ? matcher.group(1) : "";
    }

    private String resolveClassName(StudentAdmission student) {
        if (student != null && student.getSchoolClass() != null
                && student.getSchoolClass().getName() != null
                && !student.getSchoolClass().getName().isBlank()) {
            return student.getSchoolClass().getName().trim();
        }
        return "Class 1";
    }

    private String resolveSection(StudentAdmission student) {
        if (student != null && student.getSection() != null && !student.getSection().isBlank()) {
            return student.getSection().trim();
        }
        return "A";
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }

    private record DemoVideo(String title, String videoLink) {
    }
}
