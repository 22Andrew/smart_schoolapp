package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.DueFeesSearchService;
import com.kantechsolution.smart_school.service.FeeMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Search Due Fees page and API.
 */
@Controller
public class FeesearchrController {

    @Autowired
    private DueFeesSearchService dueFeesSearchService;

    @GetMapping("/feesearchr")
    public String showSearchDueFeesPage(Model model) {
        model.addAttribute("sessionYear", FeeMasterService.DEFAULT_SESSION);
        return "feesearchr";
    }

    @GetMapping("/api/due-fees")
    @ResponseBody
    public ResponseEntity<?> searchDueFees(
            @RequestParam Long feeGroupId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String sessionYear
    ) {
        try {
            List<Map<String, Object>> rows = dueFeesSearchService.searchDueFees(
                    feeGroupId, classId, section, sessionYear);
            return ResponseEntity.ok(rows);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to search due fees"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
