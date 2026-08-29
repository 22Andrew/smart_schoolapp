package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.StaffMemberService;
import com.kantechsolution.smart_school.service.StaffSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class StaffController {

    private final StaffMemberService staffMemberService;
    private final StaffSessionService staffSessionService;

    @GetMapping("/staff")
    public String showStaffDirectoryPage(Authentication authentication, Model model) {
        bindStaffDirectoryContext(authentication, model);
        return "staff";
    }

    @GetMapping("/staff/add")
    public String showAddStaffPage(Authentication authentication, Model model) {
        if (staffSessionService.isReceptionistStaffDirectoryRestricted(authentication)) {
            return "redirect:/staff";
        }
        bindStaffDirectoryContext(authentication, model);
        return "staff";
    }

    @GetMapping("/staff/edit/{id}")
    public String showEditStaffPage(@PathVariable Long id, Authentication authentication, Model model) {
        if (staffSessionService.isReceptionistStaffDirectoryRestricted(authentication)) {
            return "redirect:/staff";
        }
        bindStaffDirectoryContext(authentication, model);
        return "staff";
    }

    @GetMapping("/staff/disablestafflist")
    public String showDisabledStaffListPage() {
        return "staff-disablestafflist";
    }

    @GetMapping("/api/staff/disabled")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchDisabledStaff(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String keyword) {
        if ((role == null || role.isBlank()) && (keyword == null || keyword.isBlank())) {
            return ResponseEntity.ok(staffMemberService.getAllDisabled());
        }
        return ResponseEntity.ok(staffMemberService.searchDisabled(role, keyword));
    }

    @PostMapping("/api/staff/{id}/enable")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> enableStaff(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> enabled = staffMemberService.enableStaff(id);
            response.put("success", true);
            response.put("message", "Staff member enabled successfully!");
            response.put("data", enabled);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to enable staff member: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/api/staff/form-options")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getFormOptions() {
        return ResponseEntity.ok(staffMemberService.formOptions());
    }

    @GetMapping({"/api/staff/session/context", "/api/staff/directory-context"})
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getStaffDirectoryContext(Authentication authentication) {
        Map<String, Object> context = new LinkedHashMap<>();
        boolean restricted = staffSessionService.isReceptionistStaffDirectoryRestricted(authentication);
        context.put("restricted", restricted);
        context.put("currentStaffMemberId",
                staffSessionService.resolveLinkedStaffMemberId(authentication).orElse(null));
        if (authentication != null && authentication.getName() != null) {
            context.put("loginEmail", authentication.getName().trim().toLowerCase(Locale.ROOT));
        }
        return ResponseEntity.ok(context);
    }

    @GetMapping("/api/staff")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchStaff(
            Authentication authentication,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String keyword) {
        List<Map<String, Object>> staff;
        if ((role == null || role.isBlank()) && (keyword == null || keyword.isBlank())) {
            staff = new ArrayList<>(staffMemberService.getAllActive());
        } else {
            staff = new ArrayList<>(staffMemberService.search(role, keyword));
        }
        try {
            staffSessionService.applyDirectoryPermissions(staff, authentication);
        } catch (RuntimeException ex) {
            // Never block the staff list from loading if permission decoration fails.
        }
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/api/staff/{id}")
    @ResponseBody
    public ResponseEntity<?> getStaffById(@PathVariable Long id, Authentication authentication) {
        if (isReceptionistViewingOtherStaff(authentication, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return staffMemberService.getById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/api/staff", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createStaff(
            Authentication authentication,
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "staffPhoto", required = false) MultipartFile staffPhoto,
            @RequestPart(value = "resume", required = false) MultipartFile resume,
            @RequestPart(value = "joiningLetter", required = false) MultipartFile joiningLetter,
            @RequestPart(value = "resignationLetter", required = false) MultipartFile resignationLetter,
            @RequestPart(value = "otherDocument", required = false) MultipartFile otherDocument) {
        if (staffSessionService.isReceptionistStaffDirectoryRestricted(authentication)) {
            return receptionistForbiddenResponse();
        }

        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, MultipartFile> documents = documentParts(resume, joiningLetter, resignationLetter, otherDocument);
            Map<String, Object> saved = staffMemberService.create(payload, staffPhoto, documents);
            response.put("success", true);
            response.put("message", "Staff member saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save staff member: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping(value = "/api/staff/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateStaff(
            Authentication authentication,
            @PathVariable Long id,
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "staffPhoto", required = false) MultipartFile staffPhoto,
            @RequestPart(value = "resume", required = false) MultipartFile resume,
            @RequestPart(value = "joiningLetter", required = false) MultipartFile joiningLetter,
            @RequestPart(value = "resignationLetter", required = false) MultipartFile resignationLetter,
            @RequestPart(value = "otherDocument", required = false) MultipartFile otherDocument) {
        if (staffSessionService.isReceptionistStaffDirectoryRestricted(authentication)) {
            return receptionistForbiddenResponse();
        }

        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, MultipartFile> documents = documentParts(resume, joiningLetter, resignationLetter, otherDocument);
            Map<String, Object> updated = staffMemberService.update(id, payload, staffPhoto, documents);
            response.put("success", true);
            response.put("message", "Staff member updated successfully!");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update staff member: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/staff/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteStaff(@PathVariable Long id, Authentication authentication) {
        if (staffSessionService.isReceptionistStaffDirectoryRestricted(authentication)) {
            return receptionistForbiddenResponse();
        }

        Map<String, Object> response = new HashMap<>();
        try {
            staffMemberService.delete(id);
            response.put("success", true);
            response.put("message", "Staff member deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete staff member: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private void bindStaffDirectoryContext(Authentication authentication, Model model) {
        boolean restricted = staffSessionService.isReceptionistStaffDirectoryRestricted(authentication);
        model.addAttribute("staffDirectoryRestricted", restricted);
        model.addAttribute("currentStaffMemberId",
                staffSessionService.resolveLinkedStaffMemberId(authentication).orElse(null));
    }

    private boolean isReceptionistViewingOtherStaff(Authentication authentication, Long staffMemberId) {
        if (!staffSessionService.isReceptionistStaffDirectoryRestricted(authentication)) {
            return false;
        }
        Optional<Long> ownId = staffSessionService.resolveLinkedStaffMemberId(authentication);
        return ownId.isEmpty() || !ownId.get().equals(staffMemberId);
    }

    private ResponseEntity<Map<String, Object>> receptionistForbiddenResponse() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "You do not have permission to perform this action.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    private Map<String, MultipartFile> documentParts(MultipartFile resume, MultipartFile joiningLetter,
                                                     MultipartFile resignationLetter, MultipartFile otherDocument) {
        Map<String, MultipartFile> documents = new HashMap<>();
        if (resume != null && !resume.isEmpty()) {
            documents.put("resume", resume);
        }
        if (joiningLetter != null && !joiningLetter.isEmpty()) {
            documents.put("joiningLetter", joiningLetter);
        }
        if (resignationLetter != null && !resignationLetter.isEmpty()) {
            documents.put("resignationLetter", resignationLetter);
        }
        if (otherDocument != null && !otherDocument.isEmpty()) {
            documents.put("otherDocument", otherDocument);
        }
        return documents;
    }
}
