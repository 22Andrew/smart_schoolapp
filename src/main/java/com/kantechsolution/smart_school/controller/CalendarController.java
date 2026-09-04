package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/admin/calendar/events")
    public String calendarEventsPage() {
        return "calendar-events";
    }

    @GetMapping("/api/calendar/events")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(calendarService.listEvents(start, end));
    }

    @GetMapping("/api/calendar/todos")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> listTodos(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(calendarService.listTodos(page, size));
    }

    @GetMapping("/api/calendar/todos/pending-count")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> pendingTodoCount() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("count", calendarService.countPendingTasksForToday());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/calendar/todos")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveTodo(@RequestBody Map<String, Object> payload) {
        return saveTodoResponse(() -> calendarService.saveTodo(payload));
    }

    @PutMapping("/api/calendar/todos/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateTodo(@PathVariable Long id,
                                                          @RequestBody Map<String, Object> payload) {
        payload.put("id", id);
        return saveTodoResponse(() -> calendarService.saveTodo(payload));
    }

    @PutMapping("/api/calendar/todos/{id}/status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> toggleTodo(@PathVariable Long id,
                                                          @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean completed = Boolean.TRUE.equals(payload.get("completed"));
            Map<String, Object> saved = calendarService.toggleTodo(id, completed);
            response.put("success", true);
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            response.put("success", false);
            response.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/api/calendar/todos/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteTodo(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            calendarService.deleteTodo(id);
            response.put("success", true);
            response.put("message", "To-do deleted successfully.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            response.put("success", false);
            response.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private ResponseEntity<Map<String, Object>> saveTodoResponse(java.util.function.Supplier<Map<String, Object>> action) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = action.get();
            response.put("success", true);
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            response.put("success", false);
            response.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
