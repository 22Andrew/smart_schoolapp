package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.RoomType;
import com.kantechsolution.smart_school.service.RoomTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Page and API for Hostel Room Type management.
 */
@Controller
public class RoomTypeController {

    @Autowired
    private RoomTypeService roomTypeService;

    @GetMapping("/roomtype")
    public String showRoomTypePage(Model model) {
        return "roomtype";
    }

    @GetMapping("/api/room-types")
    @ResponseBody
    public ResponseEntity<List<RoomType>> getAllRoomTypes() {
        try {
            return ResponseEntity.ok(roomTypeService.getAllRoomTypes());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/api/room-types")
    @ResponseBody
    public ResponseEntity<?> createRoomType(@RequestBody Map<String, Object> payload) {
        try {
            RoomType saved = roomTypeService.createRoomType(
                    asString(payload.get("roomType")),
                    asString(payload.get("description"))
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create room type"));
        }
    }

    @PutMapping("/api/room-types/{id}")
    @ResponseBody
    public ResponseEntity<?> updateRoomType(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            RoomType updated = roomTypeService.updateRoomType(
                    id,
                    asString(payload.get("roomType")),
                    asString(payload.get("description"))
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Room type not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update room type"));
        }
    }

    @DeleteMapping("/api/room-types/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteRoomType(@PathVariable Long id) {
        try {
            roomTypeService.deleteRoomType(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete room type"));
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
}
