package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.DisableReason;
import com.kantechsolution.smart_school.model.SchoolHouse;
import com.kantechsolution.smart_school.model.StudentCategory;
import com.kantechsolution.smart_school.service.DisableReasonService;
import com.kantechsolution.smart_school.service.SchoolHouseService;
import com.kantechsolution.smart_school.service.StudentCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for Student Information pages
 */
@Controller
public class StudentController {

    @Autowired
    private StudentCategoryService studentCategoryService;

    @Autowired
    private SchoolHouseService schoolHouseService;

    @Autowired
    private DisableReasonService disableReasonService;

    /**
     * Show student search / student details page
     */
    @GetMapping("/student/search")
    public String showStudentSearchPage(Model model) {
        return "student-search";
    }

    /**
     * Show student admission / create page
     */
    @GetMapping("/student/create")
    public String showStudentCreatePage(Model model) {
        return "student-create";
    }

    /**
     * Show online admission / student list page
     */
    @GetMapping("/student/onlinestudent")
    public String showOnlineStudentPage(Model model) {
        return "student-online";
    }

    /**
     * Show disabled students list page
     */
    @GetMapping("/student/disablestudentslist")
    public String showDisabledStudentsPage(Model model) {
        return "student-disabled";
    }

    /**
     * Show multi class student page
     */
    @GetMapping("/student/multiclass")
    public String showMultiClassStudentPage(Model model) {
        return "student-multiclass";
    }

    /**
     * Show bulk delete students page
     */
    @GetMapping("/student/bulkdelete")
    public String showBulkDeletePage(Model model) {
        return "student-bulkdelete";
    }

    /**
     * Show student categories page
     */
    @GetMapping("/category")
    public String showStudentCategoryPage(Model model) {
        return "category";
    }

    /**
     * Show student house / school house page
     */
    @GetMapping("/schoolhouse")
    public String showSchoolHousePage(Model model) {
        return "schoolhouse";
    }

    /**
     * Show disable reason page
     */
    @GetMapping("/disablereason")
    public String showDisableReasonPage(Model model) {
        return "disablereason";
    }

    // ========== Student Category API ==========

    @GetMapping("/api/categories")
    @ResponseBody
    public ResponseEntity<List<StudentCategory>> getAllCategories() {
        try {
            return ResponseEntity.ok(studentCategoryService.getAllCategories());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/api/categories")
    @ResponseBody
    public ResponseEntity<?> createCategory(@RequestBody Map<String, String> payload) {
        try {
            StudentCategory saved = studentCategoryService.createCategory(payload.get("categoryName"));
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create category"));
        }
    }

    @PutMapping("/api/categories/{id}")
    @ResponseBody
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            StudentCategory updated = studentCategoryService.updateCategory(id, payload.get("categoryName"));
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            String message = e.getMessage();
            if ("Category not found".equals(message)) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(message));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update category"));
        }
    }

    @DeleteMapping("/api/categories/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            studentCategoryService.deleteCategory(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete category"));
        }
    }

    // ========== School House API ==========

    @GetMapping("/api/school-houses")
    @ResponseBody
    public ResponseEntity<List<SchoolHouse>> getAllSchoolHouses() {
        try {
            return ResponseEntity.ok(schoolHouseService.getAllHouses());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/api/school-houses")
    @ResponseBody
    public ResponseEntity<?> createSchoolHouse(@RequestBody Map<String, String> payload) {
        try {
            SchoolHouse saved = schoolHouseService.createHouse(
                    payload.get("name"),
                    payload.get("description")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create school house"));
        }
    }

    @PutMapping("/api/school-houses/{id}")
    @ResponseBody
    public ResponseEntity<?> updateSchoolHouse(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            SchoolHouse updated = schoolHouseService.updateHouse(
                    id,
                    payload.get("name"),
                    payload.get("description")
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            String message = e.getMessage();
            if ("School house not found".equals(message)) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(message));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update school house"));
        }
    }

    @DeleteMapping("/api/school-houses/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteSchoolHouse(@PathVariable Long id) {
        try {
            schoolHouseService.deleteHouse(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete school house"));
        }
    }

    // ========== Disable Reason API ==========

    @GetMapping("/api/disable-reasons")
    @ResponseBody
    public ResponseEntity<List<DisableReason>> getAllDisableReasons() {
        try {
            return ResponseEntity.ok(disableReasonService.getAllReasons());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/api/disable-reasons")
    @ResponseBody
    public ResponseEntity<?> createDisableReason(@RequestBody Map<String, String> payload) {
        try {
            DisableReason saved = disableReasonService.createReason(payload.get("reason"));
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create disable reason"));
        }
    }

    @PutMapping("/api/disable-reasons/{id}")
    @ResponseBody
    public ResponseEntity<?> updateDisableReason(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            DisableReason updated = disableReasonService.updateReason(id, payload.get("reason"));
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            String message = e.getMessage();
            if ("Disable reason not found".equals(message)) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(message));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update disable reason"));
        }
    }

    @DeleteMapping("/api/disable-reasons/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteDisableReason(@PathVariable Long id) {
        try {
            disableReasonService.deleteReason(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete disable reason"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
