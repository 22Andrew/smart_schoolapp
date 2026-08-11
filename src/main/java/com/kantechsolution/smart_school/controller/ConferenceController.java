package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.ConferenceCredentialService;
import com.kantechsolution.smart_school.service.ConferenceLiveClassService;
import com.kantechsolution.smart_school.service.ConferenceLiveMeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class ConferenceController {

    @Autowired
    private ConferenceLiveMeetingService conferenceLiveMeetingService;

    @Autowired
    private ConferenceCredentialService conferenceCredentialService;

    @Autowired
    private ConferenceLiveClassService conferenceLiveClassService;

    @GetMapping("/conference")
    public String showConferenceSettingPage() {
        return "conference";
    }

    @GetMapping("/conference/classreport")
    public String showLiveClassesReportPage() {
        return "conference-classreport";
    }

    @GetMapping("/conference/timetable")
    public String showLiveClassesPage() {
        return "conference-timetable";
    }

    @GetMapping("/conference/meetingreport")
    public String showLiveMeetingReportPage() {
        return "conference-meetingreport";
    }

    @GetMapping("/conference/meeting")
    public String showLiveMeetingPage() {
        return "conference-meeting";
    }

    @GetMapping("/api/conference/live-meetings")
    @ResponseBody
    public ResponseEntity<?> listLiveMeetings() {
        return ResponseEntity.ok(conferenceLiveMeetingService.listAll());
    }

    @GetMapping("/api/conference/live-meetings/report")
    @ResponseBody
    public ResponseEntity<?> liveMeetingsReport() {
        return ResponseEntity.ok(conferenceLiveMeetingService.listReport());
    }

    @GetMapping("/api/conference/live-meetings/form-options")
    @ResponseBody
    public ResponseEntity<?> formOptions() {
        return ResponseEntity.ok(conferenceLiveMeetingService.formOptions());
    }

    @PostMapping("/api/conference/live-meetings")
    @ResponseBody
    public ResponseEntity<?> createLiveMeeting(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(conferenceLiveMeetingService.create(body));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/api/conference/live-meetings/{id}/status")
    @ResponseBody
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(conferenceLiveMeetingService.updateStatus(id, body));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/api/conference/live-meetings/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteLiveMeeting(@PathVariable Long id) {
        try {
            conferenceLiveMeetingService.delete(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping("/api/conference/credentials")
    @ResponseBody
    public ResponseEntity<?> getCredentials() {
        return ResponseEntity.ok(conferenceCredentialService.getCredentials());
    }

    @PutMapping("/api/conference/credentials")
    @ResponseBody
    public ResponseEntity<?> saveCredentials(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(conferenceCredentialService.saveCredentials(body));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/api/conference/credentials/reset")
    @ResponseBody
    public ResponseEntity<?> resetCredentials() {
        return ResponseEntity.ok(conferenceCredentialService.resetCredentials());
    }

    @PostMapping("/api/conference/credentials/access-token")
    @ResponseBody
    public ResponseEntity<?> getAccessToken() {
        try {
            return ResponseEntity.ok(conferenceCredentialService.getAccessToken());
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping("/api/conference/live-classes")
    @ResponseBody
    public ResponseEntity<?> listLiveClasses() {
        return ResponseEntity.ok(conferenceLiveClassService.listAll());
    }

    @GetMapping("/api/conference/live-classes/form-options")
    @ResponseBody
    public ResponseEntity<?> liveClassFormOptions() {
        return ResponseEntity.ok(conferenceLiveClassService.formOptions());
    }

    @GetMapping("/api/conference/live-classes/report")
    @ResponseBody
    public ResponseEntity<?> liveClassesReport(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String section) {
        try {
            return ResponseEntity.ok(conferenceLiveClassService.searchReport(className, section));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/api/conference/live-classes")
    @ResponseBody
    public ResponseEntity<?> createLiveClass(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(conferenceLiveClassService.create(body));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/api/conference/live-classes/{id}/status")
    @ResponseBody
    public ResponseEntity<?> updateLiveClassStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(conferenceLiveClassService.updateStatus(id, body));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/api/conference/live-classes/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteLiveClass(@PathVariable Long id) {
        try {
            conferenceLiveClassService.delete(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
