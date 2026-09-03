package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.BehaviourIncidentService;
import com.kantechsolution.smart_school.service.BehaviourReportService;
import com.kantechsolution.smart_school.service.BehaviourSettingService;
import com.kantechsolution.smart_school.service.BehaviourStudentIncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class BehaviourController {

    @Autowired
    private BehaviourSettingService behaviourSettingService;

    @Autowired
    private BehaviourStudentIncidentService behaviourStudentIncidentService;

    @Autowired
    private BehaviourIncidentService behaviourIncidentService;

    @Autowired
    private BehaviourReportService behaviourReportService;

    @GetMapping("/behaviour/behavioursetting")
    public String showBehaviourSettingPage() {
        return "behaviour-setting";
    }

    @GetMapping("/behaviour/studentincidents")
    public String showAssignIncidentPage() {
        return "behaviour-studentincidents";
    }

    @GetMapping("/behaviour/incidents")
    public String showIncidentsPage() {
        return "behaviour-incidents";
    }

    @GetMapping("/behaviour/report/studentincidentreport")
    public String showStudentIncidentReportPage(Model model) {
        return reportPage(model, "studentincidentreport", "Student Incident List",
                "/api/behaviour/reports/student-incident", true, true);
    }

    @GetMapping("/behaviour/report/studentbehaviorrankreport")
    public String showStudentBehaviourRankReportPage(Model model) {
        return reportPage(model, "studentbehaviorrankreport", "Student Behaviour Rank List",
                "/api/behaviour/reports/student-behaviour-rank", true, true);
    }

    @GetMapping("/behaviour/report/classwiserankreport")
    public String showClassWiseRankReportPage(Model model) {
        return reportPage(model, "classwiserankreport", "Class Wise Rank List",
                "/api/behaviour/reports/class-wise-rank", false, false);
    }

    @GetMapping("/behaviour/report/classsectionwiserankreport")
    public String showClassSectionWiseRankReportPage(Model model) {
        return reportPage(model, "classsectionwiserankreport", "Class Section Wise Rank List",
                "/api/behaviour/reports/class-section-wise-rank", false, false);
    }

    @GetMapping("/behaviour/report/housewiserankreport")
    public String showHouseWiseRankReportPage(Model model) {
        return reportPage(model, "housewiserankreport", "House Wise Rank List",
                "/api/behaviour/reports/house-wise-rank", false, false);
    }

    @GetMapping("/behaviour/report/incidentwisereport")
    public String showIncidentWiseReportPage(Model model) {
        return reportPage(model, "incidentwisereport", "Incident Wise List",
                "/api/behaviour/reports/incident-wise", false, false);
    }

    private String reportPage(Model model, String activeReport, String listTitle,
                              String apiUrl, boolean showClassSection, boolean showAction) {
        model.addAttribute("activeReport", activeReport);
        model.addAttribute("listTitle", listTitle);
        model.addAttribute("apiUrl", apiUrl);
        model.addAttribute("showClassSection", showClassSection);
        model.addAttribute("showAction", showAction);
        model.addAttribute("pageTitle", "Behaviour Reports - Smart School");
        return "behaviour-report";
    }

    @GetMapping("/api/behaviour/reports/student-incident")
    @ResponseBody
    public ResponseEntity<?> studentIncidentReport(
            @RequestParam Long classId,
            @RequestParam(required = false) String section
    ) {
        try {
            return ResponseEntity.ok(behaviourReportService.studentIncidentReport(classId, section));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load student incident report"));
        }
    }

    @GetMapping("/api/behaviour/reports/student-behaviour-rank")
    @ResponseBody
    public ResponseEntity<?> studentBehaviourRankReport(
            @RequestParam Long classId,
            @RequestParam(required = false) String section
    ) {
        try {
            return ResponseEntity.ok(behaviourReportService.studentBehaviourRankReport(classId, section));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load student behaviour rank report"));
        }
    }

    @GetMapping("/api/behaviour/reports/class-wise-rank")
    @ResponseBody
    public ResponseEntity<?> classWiseRankReport() {
        try {
            return ResponseEntity.ok(behaviourReportService.classWiseRankReport());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load class wise rank report"));
        }
    }

    @GetMapping("/api/behaviour/reports/class-section-wise-rank")
    @ResponseBody
    public ResponseEntity<?> classSectionWiseRankReport() {
        try {
            return ResponseEntity.ok(behaviourReportService.classSectionWiseRankReport());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load class section wise rank report"));
        }
    }

    @GetMapping("/api/behaviour/reports/house-wise-rank")
    @ResponseBody
    public ResponseEntity<?> houseWiseRankReport() {
        try {
            return ResponseEntity.ok(behaviourReportService.houseWiseRankReport());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load house wise rank report"));
        }
    }

    @GetMapping("/api/behaviour/reports/incident-wise")
    @ResponseBody
    public ResponseEntity<?> incidentWiseReport() {
        try {
            return ResponseEntity.ok(behaviourReportService.incidentWiseReport());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load incident wise report"));
        }
    }

    @GetMapping("/api/behaviour/incidents")
    @ResponseBody
    public ResponseEntity<?> listIncidents() {
        try {
            return ResponseEntity.ok(behaviourIncidentService.listActive());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load incidents"));
        }
    }

    @PostMapping("/api/behaviour/incidents")
    @ResponseBody
    public ResponseEntity<?> createIncident(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(behaviourIncidentService.create(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create incident"));
        }
    }

    @PutMapping("/api/behaviour/incidents/{id}")
    @ResponseBody
    public ResponseEntity<?> updateIncident(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(behaviourIncidentService.update(id, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update incident"));
        }
    }

    @DeleteMapping("/api/behaviour/incidents/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteMasterIncident(@PathVariable Long id) {
        try {
            behaviourIncidentService.delete(id);
            Map<String, Object> ok = new HashMap<>();
            ok.put("success", true);
            return ResponseEntity.ok(ok);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete incident"));
        }
    }

    @GetMapping("/api/behaviour/student-incidents")
    @ResponseBody
    public ResponseEntity<?> searchStudentIncidents(
            @RequestParam Long classId,
            @RequestParam(required = false) String section
    ) {
        try {
            return ResponseEntity.ok(behaviourStudentIncidentService.searchStudents(classId, section));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to search students"));
        }
    }

    @GetMapping("/api/behaviour/student-incidents/{studentId}")
    @ResponseBody
    public ResponseEntity<?> listStudentIncidents(@PathVariable Long studentId) {
        try {
            return ResponseEntity.ok(behaviourStudentIncidentService.listByStudent(studentId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load student incidents"));
        }
    }

    @PostMapping("/api/behaviour/student-incidents")
    @ResponseBody
    public ResponseEntity<?> assignIncident(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(behaviourStudentIncidentService.assignSelected(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to assign incident"));
        }
    }

    @DeleteMapping("/api/behaviour/student-incidents/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteIncident(@PathVariable Long id) {
        try {
            behaviourStudentIncidentService.delete(id);
            Map<String, Object> ok = new HashMap<>();
            ok.put("success", true);
            return ResponseEntity.ok(ok);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete incident"));
        }
    }

    @GetMapping("/api/behaviour-settings")
    @ResponseBody
    public ResponseEntity<?> getSettings() {
        try {
            return ResponseEntity.ok(behaviourSettingService.getSettings());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load behaviour settings"));
        }
    }

    @PutMapping("/api/behaviour-settings")
    @ResponseBody
    public ResponseEntity<?> saveSettings(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(behaviourSettingService.save(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save behaviour settings"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
