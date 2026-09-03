package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.GmeetLiveClassService;
import com.kantechsolution.smart_school.service.GmeetLiveMeetingService;
import com.kantechsolution.smart_school.service.GmeetSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class GmeetController {

    @Autowired
    private GmeetLiveClassService gmeetLiveClassService;

    @Autowired
    private GmeetLiveMeetingService gmeetLiveMeetingService;

    @Autowired
    private GmeetSettingService gmeetSettingService;

    @GetMapping("/gmeet/timetable")
    public String showLiveClassesPage() {
        return "gmeet-timetable";
    }

    @GetMapping("/gmeet/meeting")
    public String showLiveMeetingPage() {
        return "gmeet-meeting";
    }

    @GetMapping("/gmeet/classreport")
    public String showLiveClassesReportPage() {
        return "gmeet-classreport";
    }

    @GetMapping("/gmeet/meetingreport")
    public String showLiveMeetingReportPage() {
        return "gmeet-meetingreport";
    }

    @GetMapping("/gmeet/index")
    public String showGmeetSettingPage() {
        return "gmeet-index";
    }

    @GetMapping("/api/gmeet/settings")
    @ResponseBody
    public ResponseEntity<?> getGmeetSettings() {
        return ResponseEntity.ok(gmeetSettingService.getSettings());
    }

    @PutMapping("/api/gmeet/settings")
    @ResponseBody
    public ResponseEntity<?> saveGmeetSettings(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(gmeetSettingService.saveSettings(body));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping("/api/gmeet/live-classes")
    @ResponseBody
    public ResponseEntity<?> listLiveClasses() {
        return ResponseEntity.ok(gmeetLiveClassService.listAll());
    }

    @GetMapping("/api/gmeet/live-classes/form-options")
    @ResponseBody
    public ResponseEntity<?> formOptions() {
        return ResponseEntity.ok(gmeetLiveClassService.formOptions());
    }

    @GetMapping("/api/gmeet/live-classes/report")
    @ResponseBody
    public ResponseEntity<?> liveClassesReport(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String section) {
        try {
            return ResponseEntity.ok(gmeetLiveClassService.searchReport(className, section));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/api/gmeet/live-classes")
    @ResponseBody
    public ResponseEntity<?> createLiveClass(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(gmeetLiveClassService.create(body));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/api/gmeet/live-classes/{id}/status")
    @ResponseBody
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(gmeetLiveClassService.updateStatus(id, body));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/api/gmeet/live-classes/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteLiveClass(@PathVariable Long id) {
        try {
            gmeetLiveClassService.delete(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping("/api/gmeet/live-meetings")
    @ResponseBody
    public ResponseEntity<?> listLiveMeetings() {
        return ResponseEntity.ok(gmeetLiveMeetingService.listAll());
    }

    @GetMapping("/api/gmeet/live-meetings/report")
    @ResponseBody
    public ResponseEntity<?> liveMeetingsReport() {
        return ResponseEntity.ok(gmeetLiveMeetingService.listReport());
    }

    @GetMapping("/api/gmeet/live-meetings/form-options")
    @ResponseBody
    public ResponseEntity<?> meetingFormOptions() {
        return ResponseEntity.ok(gmeetLiveMeetingService.formOptions());
    }

    @PostMapping("/api/gmeet/live-meetings")
    @ResponseBody
    public ResponseEntity<?> createLiveMeeting(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(gmeetLiveMeetingService.create(body));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/api/gmeet/live-meetings/{id}/status")
    @ResponseBody
    public ResponseEntity<?> updateMeetingStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(gmeetLiveMeetingService.updateStatus(id, body));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/api/gmeet/live-meetings/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteLiveMeeting(@PathVariable Long id) {
        try {
            gmeetLiveMeetingService.delete(id);
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
