package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelDocumentService;
import com.kantechsolution.smart_school.service.UserPanelDocumentService.DownloadPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/user/documents")
@RequiredArgsConstructor
public class UserPanelDocumentController {

    private final UserPanelDocumentService userPanelDocumentService;

    @GetMapping
    public ResponseEntity<?> getDocuments(Authentication authentication) {
        try {
            return ResponseEntity.ok(userPanelDocumentService.getDocuments(authentication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load documents"));
        }
    }

    @GetMapping("/google-drive-config")
    public ResponseEntity<?> getGoogleDriveConfig() {
        return ResponseEntity.ok(userPanelDocumentService.getGoogleDriveConfig());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(userPanelDocumentService.uploadDocument(authentication, file, title));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to upload document"));
        }
    }

    @PostMapping("/google-drive")
    public ResponseEntity<?> uploadGoogleDriveDocument(
            Authentication authentication,
            @RequestBody Map<String, Object> body
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(userPanelDocumentService.uploadGoogleDriveDocument(authentication, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save Google Drive document"));
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadDocument(
            Authentication authentication,
            @PathVariable Long id
    ) {
        try {
            DownloadPayload payload = userPanelDocumentService.getDownloadPayload(authentication, id);
            if (payload.external()) {
                return ResponseEntity.status(HttpStatus.FOUND)
                        .location(URI.create(payload.externalUrl()))
                        .build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + payload.fileName().replace("\"", "") + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, payload.contentType())
                    .body(payload.resource());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to download document"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
