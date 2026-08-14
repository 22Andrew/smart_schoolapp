package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.DownloadCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ContentController {

    private final DownloadCenterService downloadCenterService;

    @GetMapping("/admin/content/upload")
    public String uploadContentPage() {
        return "downloadcenter-upload";
    }

    @GetMapping("/downloadcenter/upload")
    public String uploadContentLegacyRedirect() {
        return "redirect:/admin/content/upload";
    }

    @GetMapping("/admin/content/sharelist")
    public String contentShareListPage() {
        return "downloadcenter-sharelist";
    }

    @GetMapping("/admin/content/videotutorial")
    public String videoTutorialPage() {
        return "downloadcenter-videotutorial";
    }

    @GetMapping("/admin/content/type")
    public String contentTypePage() {
        return "downloadcenter-contenttype";
    }

    // ---------- Content API ----------

    @GetMapping("/api/download-center/content")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listContents() {
        return ResponseEntity.ok(downloadCenterService.listContents());
    }

    @PostMapping(value = "/api/download-center/content", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createContent(
            @RequestParam String title,
            @RequestParam String contentType,
            @RequestParam(required = false, defaultValue = "FILE") String uploadType,
            @RequestParam(required = false) String youtubeUrl,
            @RequestParam(required = false) MultipartFile file) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("title", title);
        payload.put("contentType", contentType);
        payload.put("uploadType", uploadType);
        payload.put("youtubeUrl", youtubeUrl);
        return saveResponse(() -> downloadCenterService.saveContent(payload, file), "Content uploaded successfully!");
    }

    @PutMapping(value = "/api/download-center/content/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateContent(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String contentType,
            @RequestParam(required = false, defaultValue = "FILE") String uploadType,
            @RequestParam(required = false) String youtubeUrl,
            @RequestParam(required = false) MultipartFile file) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", id);
        payload.put("title", title);
        payload.put("contentType", contentType);
        payload.put("uploadType", uploadType);
        payload.put("youtubeUrl", youtubeUrl);
        return saveResponse(() -> downloadCenterService.saveContent(payload, file), "Content updated successfully!");
    }

    @DeleteMapping("/api/download-center/content/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteContent(@PathVariable Long id) {
        return deleteResponse(() -> downloadCenterService.deleteContent(id), "Content deleted successfully!");
    }

    @PostMapping(value = "/api/download-center/content/share", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> shareContent(@RequestBody Map<String, Object> payload) {
        return saveResponse(() -> downloadCenterService.shareContent(payload), "Content shared successfully!");
    }

    // ---------- Content Type API ----------

    @GetMapping("/api/download-center/content-types")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listContentTypes() {
        return ResponseEntity.ok(downloadCenterService.listContentTypes());
    }

    @PostMapping(value = "/api/download-center/content-types", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveContentType(@RequestBody Map<String, Object> payload) {
        return saveResponse(() -> downloadCenterService.saveContentType(payload), "Content type saved successfully!");
    }

    @PutMapping(value = "/api/download-center/content-types/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateContentType(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        payload.put("id", id);
        return saveResponse(() -> downloadCenterService.saveContentType(payload), "Content type updated successfully!");
    }

    @DeleteMapping("/api/download-center/content-types/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteContentType(@PathVariable Long id) {
        return deleteResponse(() -> downloadCenterService.deleteContentType(id), "Content type deleted successfully!");
    }

    // ---------- Share Log API ----------

    @GetMapping("/api/download-center/share-logs")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listShareLogs() {
        return ResponseEntity.ok(downloadCenterService.listShareLogs());
    }

    @DeleteMapping("/api/download-center/share-logs/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteShareLog(@PathVariable Long id) {
        return deleteResponse(() -> downloadCenterService.deleteShareLog(id), "Share record deleted successfully!");
    }

    // ---------- Video Tutorial API ----------

    @GetMapping("/api/download-center/video-tutorials")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listVideoTutorials() {
        return ResponseEntity.ok(downloadCenterService.listVideoTutorials());
    }

    @PostMapping(value = "/api/download-center/video-tutorials", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createVideoTutorial(@RequestBody Map<String, Object> payload) {
        return saveResponse(() -> downloadCenterService.saveVideoTutorial(payload), "Video tutorial saved successfully!");
    }

    @PutMapping(value = "/api/download-center/video-tutorials/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateVideoTutorial(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        payload.put("id", id);
        return saveResponse(() -> downloadCenterService.saveVideoTutorial(payload), "Video tutorial updated successfully!");
    }

    @DeleteMapping("/api/download-center/video-tutorials/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteVideoTutorial(@PathVariable Long id) {
        return deleteResponse(() -> downloadCenterService.deleteVideoTutorial(id), "Video tutorial deleted successfully!");
    }

    private ResponseEntity<Map<String, Object>> saveResponse(SaveAction action, String successMessage) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = action.run();
            response.put("success", true);
            response.put("message", successMessage);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Operation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private ResponseEntity<Map<String, Object>> deleteResponse(DeleteAction action, String successMessage) {
        Map<String, Object> response = new HashMap<>();
        try {
            action.run();
            response.put("success", true);
            response.put("message", successMessage);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Operation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @FunctionalInterface
    private interface SaveAction {
        Map<String, Object> run();
    }

    @FunctionalInterface
    private interface DeleteAction {
        void run();
    }
}
