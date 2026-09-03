package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.FrontCmsNews;
import com.kantechsolution.smart_school.repository.FrontCmsNewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LoginPageService {

    private final SchoolGeneralSettingService schoolGeneralSettingService;
    private final FrontCmsNewsRepository newsRepository;

    @Transactional(readOnly = true)
    public void populateLoginModel(org.springframework.ui.Model model) {
        String schoolName = resolveSchoolName();
        model.addAttribute("appName", schoolName);
        model.addAttribute("schoolName", schoolName);
        model.addAttribute("newsItems", listNewsItems());
    }

    private String resolveSchoolName() {
        try {
            Map<String, Object> settings = schoolGeneralSettingService.getSettings();
            Object name = settings.get("schoolName");
            if (name != null && !String.valueOf(name).isBlank()) {
                return String.valueOf(name).trim();
            }
        } catch (Exception ignored) {
            // fall through
        }
        return "Mount Carmel School";
    }

    private List<Map<String, Object>> listNewsItems() {
        List<FrontCmsNews> rows = newsRepository.findAllByOrderByNewsDateDescIdDesc();
        if (!rows.isEmpty()) {
            List<Map<String, Object>> items = new ArrayList<>();
            for (FrontCmsNews row : rows) {
                items.add(toNewsItem(row.getTitle(), row.getDescription()));
            }
            return items;
        }
        return defaultNewsItems();
    }

    private List<Map<String, Object>> defaultNewsItems() {
        return List.of(
                toNewsItem(
                        "National Level Workshop for Science Teachers Teaching in Class X to XII (Online)",
                        "A two-day capacity building programme was organised for science teachers to strengthen classroom practices..."
                ),
                toNewsItem(
                        "New Books Added to Library",
                        "The school library has added new educational and reference books for students and staff..."
                ),
                toNewsItem(
                        "Unit Test Schedule Released",
                        "The schedule for the upcoming unit test has been published. Please check the notice board for details..."
                ),
                toNewsItem(
                        "The Junior Red Cross",
                        "\"Happiness doesn't result from what we get, but from what we give.\" The Junior Red Cross continues its service activities this term..."
                ),
                toNewsItem(
                        "Parents and Guardians Teacher's Meeting",
                        "Dear parents and guardians, there will be a meeting to discuss academic progress and upcoming assessments..."
                )
        );
    }

    private Map<String, Object> toNewsItem(String title, String description) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("title", title);
        item.put("description", description);
        return item;
    }
}
