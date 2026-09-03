package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.CalendarEvent;
import com.kantechsolution.smart_school.model.CalendarTodo;
import com.kantechsolution.smart_school.repository.CalendarEventRepository;
import com.kantechsolution.smart_school.repository.CalendarTodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CalendarService implements ApplicationRunner {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    private final CalendarEventRepository calendarEventRepository;
    private final CalendarTodoRepository calendarTodoRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (calendarEventRepository.count() == 0) {
            seedEvents();
        }
        if (calendarTodoRepository.count() == 0) {
            seedTodos();
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listEvents(LocalDate start, LocalDate end) {
        LocalDate rangeStart = start != null ? start : LocalDate.now().withDayOfMonth(1);
        LocalDate rangeEnd = end != null ? end : rangeStart.plusMonths(1).minusDays(1);
        List<Map<String, Object>> rows = new ArrayList<>();
        calendarEventRepository.findInRange(rangeStart, rangeEnd).stream()
                .map(this::eventToMap)
                .forEach(rows::add);
        calendarTodoRepository.findByDueDateBetweenOrderByDueDateAscIdAsc(rangeStart, rangeEnd).stream()
                .map(this::todoToEventMap)
                .forEach(rows::add);
        rows.sort(Comparator
                .comparing((Map<String, Object> row) -> LocalDate.parse(String.valueOf(row.get("startDate"))))
                .thenComparing(row -> row.get("startTime") == null
                        ? LocalTime.MIN
                        : LocalTime.parse(String.valueOf(row.get("startTime")))));
        return rows;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listTodos(int page, int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Page<CalendarTodo> result = calendarTodoRepository.findAllByOrderByDueDateAscIdAsc(
                PageRequest.of(safePage - 1, safeSize));
        List<Map<String, Object>> rows = result.getContent().stream().map(this::todoToMap).toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("items", rows);
        response.put("page", safePage);
        response.put("size", safeSize);
        response.put("totalItems", result.getTotalElements());
        response.put("totalPages", result.getTotalPages());
        return response;
    }

    @Transactional
    public Map<String, Object> saveTodo(Map<String, Object> payload) {
        Long id = parseLong(payload.get("id"));
        CalendarTodo todo = id != null
                ? calendarTodoRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("To-do not found"))
                : new CalendarTodo();
        todo.setTitle(required(payload.get("title"), "Title is required"));
        todo.setDueDate(parseDate(required(payload.get("dueDate"), "Due date is required")));
        todo.setCompleted(parseBoolean(payload.get("completed")));
        return todoToMap(calendarTodoRepository.save(todo));
    }

    @Transactional
    public Map<String, Object> toggleTodo(Long id, boolean completed) {
        CalendarTodo todo = calendarTodoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("To-do not found"));
        todo.setCompleted(completed);
        return todoToMap(calendarTodoRepository.save(todo));
    }

    @Transactional
    public void deleteTodo(Long id) {
        if (!calendarTodoRepository.existsById(id)) {
            throw new IllegalArgumentException("To-do not found");
        }
        calendarTodoRepository.deleteById(id);
    }

    private Map<String, Object> eventToMap(CalendarEvent event) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", event.getId());
        row.put("title", event.getTitle());
        row.put("eventType", event.getEventType());
        row.put("startDate", event.getStartDate().toString());
        row.put("endDate", event.getEndDate().toString());
        row.put("allDay", Boolean.TRUE.equals(event.getAllDay()));
        row.put("highlighted", Boolean.TRUE.equals(event.getHighlighted()));
        row.put("startTime", event.getStartTime() != null ? event.getStartTime().toString() : null);
        row.put("endTime", event.getEndTime() != null ? event.getEndTime().toString() : null);
        row.put("timeLabel", formatTimeLabel(event));
        row.put("style", resolveEventStyle(event));
        return row;
    }

    private Map<String, Object> todoToMap(CalendarTodo todo) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", todo.getId());
        row.put("title", todo.getTitle());
        row.put("dueDate", todo.getDueDate().format(US_DATE));
        row.put("completed", Boolean.TRUE.equals(todo.getCompleted()));
        return row;
    }

    private Map<String, Object> todoToEventMap(CalendarTodo todo) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", "todo-" + todo.getId());
        row.put("todoId", todo.getId());
        row.put("title", todo.getTitle());
        row.put("eventType", "Todo");
        row.put("startDate", todo.getDueDate().toString());
        row.put("endDate", todo.getDueDate().toString());
        row.put("allDay", true);
        row.put("highlighted", false);
        row.put("startTime", null);
        row.put("endTime", null);
        row.put("timeLabel", "");
        row.put("style", Boolean.TRUE.equals(todo.getCompleted()) ? "todo-completed" : "todo");
        row.put("source", "todo");
        return row;
    }

    private String formatTimeLabel(CalendarEvent event) {
        if (Boolean.TRUE.equals(event.getAllDay()) || event.getStartTime() == null) {
            return "";
        }
        int hour = event.getStartTime().getHour();
        int minute = event.getStartTime().getMinute();
        int displayHour = hour % 12;
        if (displayHour == 0) displayHour = 12;
        String suffix = hour >= 12 ? "p" : "a";
        if (minute == 0) {
            return displayHour + suffix;
        }
        return displayHour + ":" + String.format(Locale.US, "%02d", minute) + suffix;
    }

    private String resolveEventStyle(CalendarEvent event) {
        if (Boolean.TRUE.equals(event.getHighlighted())) {
            return "highlight";
        }
        if ("EVENTS".equalsIgnoreCase(event.getEventType()) && spansMultipleDays(event)) {
            return "banner";
        }
        if (Boolean.TRUE.equals(event.getAllDay())) {
            return "banner";
        }
        return "timed";
    }

    private boolean spansMultipleDays(CalendarEvent event) {
        return event.getEndDate().isAfter(event.getStartDate());
    }

    private void seedEvents() {
        List<CalendarEvent> events = new ArrayList<>();
        events.add(event("EVENTS", "EVENTS", LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7), null, true, false));
        events.add(event("New Event", "Activity", LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 3), LocalTime.of(17, 30), false, true));
        events.add(event("Student Health Check", "School Events", LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 3), LocalTime.of(0, 0), false, false));
        events.add(event("Teacher's Meeting", "School Events", LocalDate.of(2026, 8, 4), LocalDate.of(2026, 8, 4), LocalTime.of(0, 0), false, false));
        events.add(event("Parent Orientation", "School Events", LocalDate.of(2026, 8, 5), LocalDate.of(2026, 8, 5), LocalTime.of(9, 0), false, false));
        events.add(event("Sports Day Practice", "Activity", LocalDate.of(2026, 8, 6), LocalDate.of(2026, 8, 6), LocalTime.of(14, 0), false, false));
        events.add(event("Fee Collection Deadline", "School Events", LocalDate.of(2026, 8, 10), LocalDate.of(2026, 8, 10), LocalTime.of(0, 0), false, false));
        events.add(event("Staff Training", "Activity", LocalDate.of(2026, 8, 12), LocalDate.of(2026, 8, 12), LocalTime.of(10, 30), false, false));
        events.add(event("Independence Day Prep", "EVENTS", LocalDate.of(2026, 8, 14), LocalDate.of(2026, 8, 15), null, true, false));
        events.add(event("Library Week", "Activity", LocalDate.of(2026, 8, 18), LocalDate.of(2026, 8, 22), null, true, false));
        calendarEventRepository.saveAll(events);
    }

    private CalendarEvent event(String title, String type, LocalDate start, LocalDate end,
                                LocalTime time, boolean allDay, boolean highlighted) {
        return CalendarEvent.builder()
                .title(title)
                .eventType(type)
                .startDate(start)
                .endDate(end)
                .startTime(time)
                .allDay(allDay)
                .highlighted(highlighted)
                .build();
    }

    private void seedTodos() {
        List<CalendarTodo> todos = List.of(
                todo("World Environment Day", LocalDate.of(2026, 6, 5)),
                todo("Staff Meeting", LocalDate.of(2026, 6, 10)),
                todo("Prepare Exam Schedule", LocalDate.of(2026, 6, 15)),
                todo("Update Student Records", LocalDate.of(2026, 6, 20)),
                todo("Review Fee Collection", LocalDate.of(2026, 6, 25)),
                todo("Plan Annual Day Event", LocalDate.of(2026, 7, 1)),
                todo("Submit Monthly Report", LocalDate.of(2026, 7, 8)),
                todo("Organize Parent Meeting", LocalDate.of(2026, 7, 15)),
                todo("Check Transport Routes", LocalDate.of(2026, 7, 22)),
                todo("Finalize Holiday List", LocalDate.of(2026, 7, 29)),
                todo("Update Library Inventory", LocalDate.of(2026, 8, 5)),
                todo("Review Homework Submissions", LocalDate.of(2026, 8, 12))
        );
        calendarTodoRepository.saveAll(todos);
    }

    private CalendarTodo todo(String title, LocalDate dueDate) {
        return CalendarTodo.builder().title(title).dueDate(dueDate).completed(false).build();
    }

    private String required(Object value, String message) {
        if (value == null || String.valueOf(value).isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return String.valueOf(value).trim();
    }

    private LocalDate parseDate(String value) {
        try {
            if (value.contains("/")) {
                return LocalDate.parse(value, US_DATE);
            }
            return LocalDate.parse(value, ISO_DATE);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Invalid date format");
        }
    }

    private Long parseLong(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(String.valueOf(value).trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private boolean parseBoolean(Object value) {
        if (value == null) return false;
        if (value instanceof Boolean bool) return bool;
        return "true".equalsIgnoreCase(String.valueOf(value));
    }
}
