package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.LibraryMemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class MemberController {

    private final LibraryMemberService libraryMemberService;

    public MemberController(LibraryMemberService libraryMemberService) {
        this.libraryMemberService = libraryMemberService;
    }

    @GetMapping("/dailyassignment/admin/member")
    public String showMembersPage() {
        return "library-members";
    }

    @GetMapping("/dailyassignment/admin/member/student")
    public String showStudentMembersPage() {
        return "library-student-members";
    }

    @GetMapping("/dailyassignment/admin/member/teacher")
    public String showStaffMembersPage() {
        return "library-staff-members";
    }

    @GetMapping("/dailyassignment/admin/member/issue/{id}")
    public String showIssueReturnPage(@PathVariable Long id, Model model) {
        model.addAttribute("memberId", id);
        return "library-member-issue";
    }

    @GetMapping("/api/library/members")
    @ResponseBody
    public ResponseEntity<?> listMembers() {
        try {
            return ResponseEntity.ok(libraryMemberService.listMembers());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load members"));
        }
    }

    @GetMapping("/api/library/student-members")
    @ResponseBody
    public ResponseEntity<?> searchStudentMembers(
            @RequestParam Long classId,
            @RequestParam(required = false) String section
    ) {
        try {
            return ResponseEntity.ok(libraryMemberService.searchStudentMembers(classId, section));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load student members"));
        }
    }

    @PostMapping("/api/library/student-members")
    @ResponseBody
    public ResponseEntity<?> addStudentMember(@RequestBody Map<String, Object> payload) {
        try {
            Object rawId = payload.get("studentId");
            Long studentId = rawId == null || String.valueOf(rawId).isBlank()
                    ? null
                    : Long.parseLong(String.valueOf(rawId).trim());
            if (studentId == null) {
                return ResponseEntity.badRequest().body(errorBody("Student is required"));
            }
            Map<String, Object> saved = libraryMemberService.addStudentMember(studentId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Student added as library member");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to add student member"));
        }
    }

    @PostMapping("/api/library/student-members/{studentId}/surrender")
    @ResponseBody
    public ResponseEntity<?> surrenderStudentMember(@PathVariable Long studentId) {
        try {
            Map<String, Object> saved = libraryMemberService.surrenderStudentMember(studentId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Membership surrendered successfully");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to surrender membership"));
        }
    }

    @GetMapping("/api/library/staff-members")
    @ResponseBody
    public ResponseEntity<?> searchStaffMembers(@RequestParam(required = false) String keyword) {
        try {
            return ResponseEntity.ok(libraryMemberService.searchStaffMembers(keyword));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load staff members"));
        }
    }

    @PostMapping("/api/library/staff-members")
    @ResponseBody
    public ResponseEntity<?> addStaffLibraryMember(@RequestBody Map<String, Object> payload) {
        try {
            Object rawId = payload.get("staffMemberId");
            Long staffMemberId = rawId == null || String.valueOf(rawId).isBlank()
                    ? null
                    : Long.parseLong(String.valueOf(rawId).trim());
            if (staffMemberId == null) {
                return ResponseEntity.badRequest().body(errorBody("Staff member is required"));
            }
            Map<String, Object> saved = libraryMemberService.addStaffMember(staffMemberId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Staff added as library member");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to add staff member"));
        }
    }

    @PostMapping("/api/library/staff-members/{staffMemberId}/surrender")
    @ResponseBody
    public ResponseEntity<?> surrenderStaffMember(@PathVariable Long staffMemberId) {
        try {
            Map<String, Object> saved = libraryMemberService.surrenderStaffMember(staffMemberId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Membership surrendered successfully");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to surrender membership"));
        }
    }

    @GetMapping("/api/library/members/{id}")
    @ResponseBody
    public ResponseEntity<?> getMember(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(libraryMemberService.getMember(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load member"));
        }
    }

    @GetMapping("/api/library/members/{id}/issues")
    @ResponseBody
    public ResponseEntity<?> listIssues(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(libraryMemberService.listIssues(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load issued books"));
        }
    }

    @GetMapping("/api/library/issue-books")
    @ResponseBody
    public ResponseEntity<?> listBooks() {
        try {
            return ResponseEntity.ok(libraryMemberService.listAvailableBooks());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load books"));
        }
    }

    @PostMapping("/api/library/members/{id}/issues")
    @ResponseBody
    public ResponseEntity<?> issueBook(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = libraryMemberService.issueBook(id, payload);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Book issued successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to issue book"));
        }
    }

    @PostMapping("/api/library/issues/{issueId}/return")
    @ResponseBody
    public ResponseEntity<?> returnBook(@PathVariable Long issueId) {
        try {
            Map<String, Object> saved = libraryMemberService.returnBook(issueId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Book returned successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to return book"));
        }
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return body;
    }
}
