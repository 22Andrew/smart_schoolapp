package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.OnlineCourseManageService;
import com.kantechsolution.smart_school.service.OnlineCourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * Online Course list page and API.
 */
@Controller
public class OnlineCourseController {

    @Autowired
    private OnlineCourseService onlineCourseService;

    @Autowired
    private OnlineCourseManageService onlineCourseManageService;

    @GetMapping({"/onlinecourse/course/index", "/onlinecourse/course"})
    public String showOnlineCoursePage() {
        return "onlinecourse";
    }

    @GetMapping("/api/online-courses")
    @ResponseBody
    public ResponseEntity<?> getAllCourses() {
        try {
            return ResponseEntity.ok(onlineCourseService.getAllCourses());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load online courses"));
        }
    }

    @PostMapping(value = "/api/online-courses", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<?> createCourse(
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "previewImage", required = false) MultipartFile previewImage
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(onlineCourseService.createCourse(payload, previewImage));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create online course"));
        }
    }

    @GetMapping("/api/online-courses/{id}/manage")
    @ResponseBody
    public ResponseEntity<?> getManageCourse(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(onlineCourseManageService.getManagePayload(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load course management data"));
        }
    }

    @PostMapping("/api/online-courses/{id}/sections")
    @ResponseBody
    public ResponseEntity<?> addSection(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(onlineCourseManageService.addSection(id, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to add section"));
        }
    }

    @PutMapping("/api/online-courses/sections/{sectionId}")
    @ResponseBody
    public ResponseEntity<?> updateSection(@PathVariable Long sectionId, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(onlineCourseManageService.updateSection(sectionId, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update section"));
        }
    }

    @DeleteMapping("/api/online-courses/sections/{sectionId}")
    @ResponseBody
    public ResponseEntity<?> deleteSection(@PathVariable Long sectionId) {
        try {
            onlineCourseManageService.deleteSection(sectionId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete section"));
        }
    }

    @PostMapping("/api/online-courses/sections/{sectionId}/contents")
    @ResponseBody
    public ResponseEntity<?> addContent(@PathVariable Long sectionId, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(onlineCourseManageService.addContent(sectionId, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to add content"));
        }
    }

    @PostMapping(value = "/api/online-courses/sections/{sectionId}/lessons", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<?> addLesson(
            @PathVariable Long sectionId,
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "previewImage", required = false) MultipartFile previewImage
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(onlineCourseManageService.addLesson(sectionId, payload, previewImage));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to add lesson"));
        }
    }

    @PutMapping("/api/online-courses/contents/{contentId}")
    @ResponseBody
    public ResponseEntity<?> updateContent(@PathVariable Long contentId, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(onlineCourseManageService.updateContent(contentId, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update content"));
        }
    }

    @DeleteMapping("/api/online-courses/contents/{contentId}")
    @ResponseBody
    public ResponseEntity<?> deleteContent(@PathVariable Long contentId) {
        try {
            onlineCourseManageService.deleteContent(contentId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete content"));
        }
    }

    @PutMapping("/api/online-courses/{id}/order")
    @ResponseBody
    public ResponseEntity<?> reorderCourse(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(onlineCourseManageService.reorderCourse(id, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to reorder course sections"));
        }
    }

    @PutMapping("/api/online-courses/{id}/publish")
    @ResponseBody
    public ResponseEntity<?> togglePublish(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(onlineCourseManageService.togglePublish(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update publish status"));
        }
    }

    @DeleteMapping("/api/online-courses/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            onlineCourseManageService.deleteCourse(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete course"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
