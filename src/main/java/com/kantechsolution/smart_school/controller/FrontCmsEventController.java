package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.FrontCmsEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class FrontCmsEventController {

    private final FrontCmsEventService frontCmsEventService;

    @GetMapping("/admin/front/events")
    public String page() {
        return "front-cms-events";
    }

    @GetMapping("/api/front/events")
    @ResponseBody
    public ResponseEntity<?> list() {
        return ResponseEntity.ok(frontCmsEventService.list());
    }

    @GetMapping("/api/front/events/{id}")
    @ResponseBody
    public ResponseEntity<?> get(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(frontCmsEventService.get(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/api/front/events")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        return save(null, body, "Event saved successfully!");
    }

    @PutMapping("/api/front/events/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return save(id, body, "Event updated successfully!");
    }

    @PostMapping("/api/front/events/{id}/image")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> uploadImage(@PathVariable Long id,
                                                           @RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = frontCmsEventService.storeImage(id, file);
            response.put("success", true);
            response.put("message", "Image uploaded successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/api/front/events/media")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> uploadMedia(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = frontCmsEventService.storeMedia(file);
            response.put("success", true);
            response.put("message", "Media uploaded successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to upload media: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/front/events/{id}/image")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteImage(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = frontCmsEventService.removeImage(id);
            response.put("success", true);
            response.put("message", "Featured image deleted successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/front/events/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            frontCmsEventService.delete(id);
            response.put("success", true);
            response.put("message", "Event deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete event: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private ResponseEntity<Map<String, Object>> save(Long id, Map<String, Object> body, String message) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = frontCmsEventService.save(id, body == null ? Map.of() : body);
            response.put("success", true);
            response.put("message", message);
            response.put("data", saved);
            return ResponseEntity.status(id == null ? HttpStatus.CREATED : HttpStatus.OK).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save event: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
