package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.OnlineCourseQuestionTag;
import com.kantechsolution.smart_school.repository.OnlineCourseQuestionRepository;
import com.kantechsolution.smart_school.repository.OnlineCourseQuestionTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OnlineCourseQuestionTagService {

    private static final String[] DEFAULTS = {
            "English", "Robotics", "Hindi", "Science", "Mathematics", "Communication Skills"
    };

    @Autowired
    private OnlineCourseQuestionTagRepository tagRepository;

    @Autowired
    private OnlineCourseQuestionRepository questionRepository;

    @Transactional
    public List<Map<String, Object>> getAll() {
        List<OnlineCourseQuestionTag> tags = tagRepository.findAllByOrderByTagNameAsc();
        if (tags.isEmpty()) {
            tags = seedDefaults();
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (OnlineCourseQuestionTag tag : tags) {
            rows.add(toRow(tag));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        String name = text(body.get("tagName"));
        if (name.isBlank()) {
            throw new IllegalArgumentException("Tag name is required");
        }
        if (tagRepository.existsByTagNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Tag already exists");
        }
        OnlineCourseQuestionTag tag = new OnlineCourseQuestionTag();
        tag.setTagName(name);
        return toRow(tagRepository.save(tag));
    }

    @Transactional
    public Map<String, Object> update(Long id, Map<String, Object> body) {
        OnlineCourseQuestionTag tag = tagRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tag not found"));
        String name = text(body.get("tagName"));
        if (name.isBlank()) {
            throw new IllegalArgumentException("Tag name is required");
        }
        tagRepository.findByTagNameIgnoreCase(name).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Tag already exists");
            }
        });
        tag.setTagName(name);
        return toRow(tagRepository.save(tag));
    }

    @Transactional
    public void delete(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new IllegalArgumentException("Tag not found");
        }
        if (questionRepository.countByTagId(id) > 0) {
            throw new IllegalArgumentException("Tag is used by questions and cannot be deleted");
        }
        tagRepository.deleteById(id);
    }

    private List<OnlineCourseQuestionTag> seedDefaults() {
        List<OnlineCourseQuestionTag> defaults = new ArrayList<>();
        for (String name : DEFAULTS) {
            OnlineCourseQuestionTag tag = new OnlineCourseQuestionTag();
            tag.setTagName(name);
            defaults.add(tag);
        }
        return tagRepository.saveAll(defaults);
    }

    private Map<String, Object> toRow(OnlineCourseQuestionTag tag) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", tag.getId());
        row.put("tagName", tag.getTagName());
        return row;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
