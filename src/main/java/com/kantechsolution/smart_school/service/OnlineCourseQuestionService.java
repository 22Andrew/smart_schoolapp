package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.OnlineCourseQuestion;
import com.kantechsolution.smart_school.model.OnlineCourseQuestionTag;
import com.kantechsolution.smart_school.repository.OnlineCourseQuestionRepository;
import com.kantechsolution.smart_school.repository.OnlineCourseQuestionTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class OnlineCourseQuestionService {

    @Autowired
    private OnlineCourseQuestionRepository questionRepository;

    @Autowired
    private OnlineCourseQuestionTagRepository tagRepository;

    @Autowired
    private OnlineCourseQuestionTagService tagService;

    @Transactional
    public List<Map<String, Object>> search(Long tagId, String type, String level, String createdBy, String keyword) {
        tagService.getAll();
        ensureSeed();
        List<OnlineCourseQuestion> questions = questionRepository.search(tagId, type, level, createdBy, keyword);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (OnlineCourseQuestion question : questions) {
            rows.add(toRow(question));
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getById(Long id) {
        return toRow(requireQuestion(id));
    }

    @Transactional(readOnly = true)
    public List<String> getCreatedByList() {
        return questionRepository.findDistinctCreatedBy();
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        OnlineCourseQuestion question = new OnlineCourseQuestion();
        apply(question, body, true);
        return toRow(questionRepository.save(question));
    }

    @Transactional
    public Map<String, Object> update(Long id, Map<String, Object> body) {
        OnlineCourseQuestion question = requireQuestion(id);
        apply(question, body, false);
        return toRow(questionRepository.save(question));
    }

    @Transactional
    public void delete(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new IllegalArgumentException("Question not found");
        }
        questionRepository.deleteById(id);
    }

    @Transactional
    public Map<String, Object> bulkDelete(Map<String, Object> body) {
        Object rawIds = body.get("ids");
        if (!(rawIds instanceof List<?> list) || list.isEmpty()) {
            throw new IllegalArgumentException("Select at least one question");
        }
        int deleted = 0;
        for (Object value : list) {
            try {
                Long id = Long.valueOf(String.valueOf(value));
                if (questionRepository.existsById(id)) {
                    questionRepository.deleteById(id);
                    deleted++;
                }
            } catch (NumberFormatException ignored) {
                // skip invalid ids
            }
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("deleted", deleted);
        return result;
    }

    private void ensureSeed() {
        if (questionRepository.count() > 0) return;
        List<OnlineCourseQuestionTag> tags = tagRepository.findAllByOrderByTagNameAsc();
        if (tags.isEmpty()) return;

        saveSeed(tags, "English", "Descriptive", "Low",
                "Write a short paragraph about your favourite school activity and explain why you like it.");
        saveSeed(tags, "Science", "Single Choice", "Medium",
                "Which of the following is a renewable source of energy?");
        saveSeed(tags, "Mathematics", "Single Choice", "High",
                "What is the value of 12 × 8 + 16 ÷ 4?");
        saveSeed(tags, "Robotics", "Descriptive", "Medium",
                "Explain the role of sensors in a basic robot design.");
        saveSeed(tags, "Hindi", "Descriptive", "Low",
                "अपने विद्यालय के पुस्तकालय का संक्षिप्त वर्णन कीजिए।");
        saveSeed(tags, "Communication Skills", "Single Choice", "Medium",
                "Which of these is an example of active listening?");
    }

    private void saveSeed(List<OnlineCourseQuestionTag> tags, String tagName, String type, String level, String text) {
        OnlineCourseQuestionTag tag = tags.stream()
                .filter(t -> tagName.equalsIgnoreCase(t.getTagName()))
                .findFirst()
                .orElse(tags.get(0));
        OnlineCourseQuestion question = new OnlineCourseQuestion();
        question.setTag(tag);
        question.setQuestionType(type);
        question.setLevel(level);
        question.setQuestionText(text);
        question.setCreatedBy("Joe Black (9000)");
        if ("Single Choice".equalsIgnoreCase(type)) {
            question.setOptionsJson("[{\"text\":\"Option A\",\"correct\":true},{\"text\":\"Option B\",\"correct\":false},{\"text\":\"Option C\",\"correct\":false},{\"text\":\"Option D\",\"correct\":false}]");
            question.setCorrectAnswer("Option A");
        }
        questionRepository.save(question);
    }

    private void apply(OnlineCourseQuestion question, Map<String, Object> body, boolean creating) {
        Long tagId = asLong(body.get("tagId"), "Question Tag is required");
        OnlineCourseQuestionTag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new IllegalArgumentException("Question Tag not found"));

        String type = normalizeType(text(body.get("questionType")));
        String level = normalizeLevel(text(body.get("level")));
        String questionText = text(body.get("questionText"));
        if (questionText.isBlank()) {
            throw new IllegalArgumentException("Question is required");
        }

        question.setTag(tag);
        question.setQuestionType(type);
        question.setLevel(level);
        question.setQuestionText(questionText);
        question.setOptionsJson(blankToNull(text(body.get("optionsJson"))));
        question.setCorrectAnswer(blankToNull(text(body.get("correctAnswer"))));

        String createdBy = text(body.get("createdBy"));
        if (!createdBy.isBlank()) {
            question.setCreatedBy(createdBy);
        } else if (creating || question.getCreatedBy() == null || question.getCreatedBy().isBlank()) {
            question.setCreatedBy("Joe Black (9000)");
        }
    }

    private String normalizeType(String type) {
        if (type.isBlank()) throw new IllegalArgumentException("Question Type is required");
        String value = type.trim().toLowerCase(Locale.ROOT);
        return switch (value) {
            case "single choice", "single_choice", "singlechoice" -> "Single Choice";
            case "multiple choice", "multiple_choice", "multiplechoice" -> "Multiple Choice";
            case "true/false", "true_false", "truefalse" -> "True/False";
            case "descriptive" -> "Descriptive";
            default -> type.trim();
        };
    }

    private String normalizeLevel(String level) {
        if (level.isBlank()) throw new IllegalArgumentException("Question Level is required");
        String value = level.trim().toLowerCase(Locale.ROOT);
        return switch (value) {
            case "low" -> "Low";
            case "medium" -> "Medium";
            case "high" -> "High";
            default -> level.trim();
        };
    }

    private OnlineCourseQuestion requireQuestion(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
    }

    private Map<String, Object> toRow(OnlineCourseQuestion question) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", question.getId());
        row.put("tagId", question.getTag() == null ? null : question.getTag().getId());
        row.put("questionTag", question.getTag() == null ? "" : question.getTag().getTagName());
        row.put("questionType", question.getQuestionType());
        row.put("level", question.getLevel());
        row.put("questionText", question.getQuestionText());
        row.put("optionsJson", question.getOptionsJson());
        row.put("correctAnswer", question.getCorrectAnswer());
        row.put("createdBy", question.getCreatedBy());
        return row;
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

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
