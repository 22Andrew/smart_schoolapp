package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.HostelRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Page and API for Hostel Rooms management.
 */
@Controller
public class HostelRoomController {

    @Autowired
    private HostelRoomService hostelRoomService;

    @GetMapping("/hostelroom")
    public String showHostelRoomPage(Model model) {
        return "hostelroom";
    }

    @GetMapping("/api/hostel-rooms")
    @ResponseBody
    public ResponseEntity<?> getAllRooms() {
        try {
            return ResponseEntity.ok(hostelRoomService.getAllRooms());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load hostel rooms"));
        }
    }

    @PostMapping("/api/hostel-rooms")
    @ResponseBody
    public ResponseEntity<?> createRoom(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = hostelRoomService.createRoom(
                    asString(payload.get("roomNumber")),
                    asLong(payload.get("hostelId")),
                    asLong(payload.get("roomTypeId")),
                    asString(payload.get("numberOfBed")),
                    asString(payload.get("costPerBed")),
                    asString(payload.get("description"))
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create hostel room"));
        }
    }

    @PutMapping("/api/hostel-rooms/{id}")
    @ResponseBody
    public ResponseEntity<?> updateRoom(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> updated = hostelRoomService.updateRoom(
                    id,
                    asString(payload.get("roomNumber")),
                    asLong(payload.get("hostelId")),
                    asLong(payload.get("roomTypeId")),
                    asString(payload.get("numberOfBed")),
                    asString(payload.get("costPerBed")),
                    asString(payload.get("description"))
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Hostel room not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update hostel room"));
        }
    }

    @DeleteMapping("/api/hostel-rooms/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        try {
            hostelRoomService.deleteRoom(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete hostel room"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Long asLong(Object value) {
        if (value == null || "".equals(String.valueOf(value).trim())) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
