package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.OnlineCourseCategoryService;
import com.kantechsolution.smart_school.service.OnlineCourseCertificateTemplateService;
import com.kantechsolution.smart_school.service.OnlineCourseManageService;
import com.kantechsolution.smart_school.service.OnlineCourseOfflinePaymentService;
import com.kantechsolution.smart_school.service.OnlineCoursePurchaseService;
import com.kantechsolution.smart_school.service.OnlineCourseQuestionService;
import com.kantechsolution.smart_school.service.OnlineCourseQuestionTagService;
import com.kantechsolution.smart_school.service.OnlineCourseService;
import com.kantechsolution.smart_school.service.OnlineCourseSettingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
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

    @Autowired
    private OnlineCourseSettingService onlineCourseSettingService;

    @Autowired
    private OnlineCourseCertificateTemplateService certificateTemplateService;

    @Autowired
    private OnlineCoursePurchaseService onlineCoursePurchaseService;

    @Autowired
    private OnlineCourseCategoryService onlineCourseCategoryService;

    @Autowired
    private OnlineCourseOfflinePaymentService onlineCourseOfflinePaymentService;

    @Autowired
    private OnlineCourseQuestionTagService onlineCourseQuestionTagService;

    @Autowired
    private OnlineCourseQuestionService onlineCourseQuestionService;

    @GetMapping({"/onlinecourse/course/index", "/onlinecourse/course"})
    public String showOnlineCoursePage() {
        return "onlinecourse";
    }

    @GetMapping("/onlinecourse/courseexamquestion/index")
    public String showQuestionBankPage() {
        return "onlinecourse-questionbank";
    }

    @GetMapping("/onlinecourse/offlinepayment/payment")
    public String showOfflinePaymentPage() {
        return "onlinecourse-offlinepayment";
    }

    @GetMapping("/onlinecourse/coursecategory/categoryadd")
    public String showCourseCategoryPage() {
        return "onlinecourse-category";
    }

    @GetMapping("/onlinecourse/coursecertificate/templatelist")
    public String showCertificateTemplateListPage() {
        return "onlinecourse-certificate";
    }

    @GetMapping("/onlinecourse/course/setting")
    public String showOnlineCourseSettingPage() {
        return "onlinecourse-setting";
    }

    @GetMapping({
            "/onlinecourse/coursereport/coursepurchase",
            "/onlinecourse/coursereport/coursecomplete",
            "/onlinecourse/coursereport/courseassignment",
            "/onlinecourse/coursereport/courseexamattempt",
            "/onlinecourse/coursereport/coursesellcount",
            "/onlinecourse/coursereport/courserating",
            "/onlinecourse/coursereport/courseexamresult",
            "/onlinecourse/coursereport/coursetrending",
            "/onlinecourse/coursereport/guestreport",
            "/onlinecourse/coursereport/courseexam"
    })
    public String showCourseReportPage(HttpServletRequest request, Model model) {
        String path = request.getRequestURI();
        String reportKey = path.substring(path.lastIndexOf('/') + 1);
        model.addAttribute("reportKey", reportKey);
        model.addAttribute("reportTitle", resolveReportTitle(reportKey));
        return "onlinecourse-coursepurchase";
    }

    private String resolveReportTitle(String reportKey) {
        return switch (reportKey == null ? "" : reportKey) {
            case "coursecomplete" -> "Course Complete Report";
            case "courseassignment" -> "Course Assignment Report";
            case "courseexamattempt" -> "Course Exam Attempt Report";
            case "coursesellcount" -> "Course Sell Count Report";
            case "courserating" -> "Course Rating Report";
            case "courseexamresult" -> "Course Exam Result Report";
            case "coursetrending" -> "Course Trending Report";
            case "guestreport" -> "Guest Report";
            case "courseexam" -> "Course Exam Report";
            default -> "Student Course Purchase Report";
        };
    }

    @GetMapping("/api/online-course-reports/purchase")
    @ResponseBody
    public ResponseEntity<?> getCoursePurchaseReport(
            @RequestParam(required = false) String reportType,
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String paymentType,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String usersType
    ) {
        try {
            // Other report types share the same filter UI; purchase data is used for coursepurchase.
            if (reportType != null && !reportType.isBlank() && !"coursepurchase".equalsIgnoreCase(reportType)) {
                Map<String, Object> empty = new HashMap<>();
                empty.put("rows", java.util.List.of());
                empty.put("total", 0);
                empty.put("reportType", reportType);
                return ResponseEntity.ok(empty);
            }
            return ResponseEntity.ok(onlineCoursePurchaseService.search(
                    searchType, paymentType, paymentStatus, usersType));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load course purchase report"));
        }
    }

    @PostMapping("/api/online-course-reports/purchase")
    @ResponseBody
    public ResponseEntity<?> createCoursePurchase(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(onlineCoursePurchaseService.create(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save course purchase"));
        }
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

    @PutMapping(value = "/api/online-courses/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<?> updateCourse(
            @PathVariable Long id,
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "previewImage", required = false) MultipartFile previewImage
    ) {
        try {
            return ResponseEntity.ok(onlineCourseService.updateCourse(id, payload, previewImage));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update online course"));
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

    @GetMapping("/api/online-course-settings")
    @ResponseBody
    public ResponseEntity<?> getSettings() {
        try {
            return ResponseEntity.ok(onlineCourseSettingService.getSettings());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load online course settings"));
        }
    }

    @PutMapping("/api/online-course-settings/curriculum")
    @ResponseBody
    public ResponseEntity<?> saveCurriculum(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(onlineCourseSettingService.saveCurriculum(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save curriculum settings"));
        }
    }

    @PutMapping("/api/online-course-settings/aws")
    @ResponseBody
    public ResponseEntity<?> saveAws(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(onlineCourseSettingService.saveAws(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save AWS settings"));
        }
    }

    @PutMapping("/api/online-course-settings/guest")
    @ResponseBody
    public ResponseEntity<?> saveGuest(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(onlineCourseSettingService.saveGuest(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save guest user settings"));
        }
    }

    @GetMapping("/api/online-course-certificates")
    @ResponseBody
    public ResponseEntity<?> getCertificateTemplates() {
        try {
            return ResponseEntity.ok(certificateTemplateService.getAll());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load certificate templates"));
        }
    }

    @PostMapping(value = "/api/online-course-certificates", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<?> createCertificateTemplate(
            @RequestPart("data") Map<String, Object> body,
            @RequestPart(value = "backgroundImage", required = false) MultipartFile backgroundImage
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(certificateTemplateService.create(body, backgroundImage));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create certificate template"));
        }
    }

    @PutMapping(value = "/api/online-course-certificates/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<?> updateCertificateTemplate(
            @PathVariable Long id,
            @RequestPart("data") Map<String, Object> body,
            @RequestPart(value = "backgroundImage", required = false) MultipartFile backgroundImage
    ) {
        try {
            return ResponseEntity.ok(certificateTemplateService.update(id, body, backgroundImage));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update certificate template"));
        }
    }

    @DeleteMapping("/api/online-course-certificates/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteCertificateTemplate(@PathVariable Long id) {
        try {
            certificateTemplateService.delete(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete certificate template"));
        }
    }

    @GetMapping("/api/online-course-question-tags")
    @ResponseBody
    public ResponseEntity<?> listQuestionTags() {
        return ResponseEntity.ok(onlineCourseQuestionTagService.getAll());
    }

    @PostMapping("/api/online-course-question-tags")
    @ResponseBody
    public ResponseEntity<?> createQuestionTag(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(onlineCourseQuestionTagService.create(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create question tag"));
        }
    }

    @PutMapping("/api/online-course-question-tags/{id}")
    @ResponseBody
    public ResponseEntity<?> updateQuestionTag(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(onlineCourseQuestionTagService.update(id, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update question tag"));
        }
    }

    @DeleteMapping("/api/online-course-question-tags/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteQuestionTag(@PathVariable Long id) {
        try {
            onlineCourseQuestionTagService.delete(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete question tag"));
        }
    }

    @GetMapping("/api/online-course-questions")
    @ResponseBody
    public ResponseEntity<?> listQuestions(
            @RequestParam(required = false) Long tagId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String createdBy,
            @RequestParam(required = false) String q
    ) {
        try {
            return ResponseEntity.ok(onlineCourseQuestionService.search(tagId, type, level, createdBy, q));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load questions"));
        }
    }

    @GetMapping("/api/online-course-questions/created-by")
    @ResponseBody
    public ResponseEntity<?> listQuestionCreatedBy() {
        return ResponseEntity.ok(onlineCourseQuestionService.getCreatedByList());
    }

    @GetMapping("/api/online-course-questions/{id}")
    @ResponseBody
    public ResponseEntity<?> getQuestion(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(onlineCourseQuestionService.getById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load question"));
        }
    }

    @PostMapping("/api/online-course-questions")
    @ResponseBody
    public ResponseEntity<?> createQuestion(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(onlineCourseQuestionService.create(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create question"));
        }
    }

    @PutMapping("/api/online-course-questions/{id}")
    @ResponseBody
    public ResponseEntity<?> updateQuestion(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(onlineCourseQuestionService.update(id, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update question"));
        }
    }

    @DeleteMapping("/api/online-course-questions/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        try {
            onlineCourseQuestionService.delete(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete question"));
        }
    }

    @PostMapping("/api/online-course-questions/bulk-delete")
    @ResponseBody
    public ResponseEntity<?> bulkDeleteQuestions(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(onlineCourseQuestionService.bulkDelete(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete questions"));
        }
    }

    @PostMapping("/api/online-course-questions/import")
    @ResponseBody
    public ResponseEntity<?> importQuestions(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(onlineCourseQuestionService.importQuestions(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to import questions"));
        }
    }

    @GetMapping("/api/online-course-offline-payments")
    @ResponseBody
    public ResponseEntity<?> searchOfflinePayments(@RequestParam Long studentAdmissionId) {
        try {
            return ResponseEntity.ok(onlineCourseOfflinePaymentService.searchForStudent(studentAdmissionId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load offline payment courses"));
        }
    }

    @PostMapping("/api/online-course-offline-payments/pay")
    @ResponseBody
    public ResponseEntity<?> payOfflineCourse(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(onlineCourseOfflinePaymentService.pay(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save offline payment"));
        }
    }

    @PostMapping("/api/online-course-offline-payments/{id}/revert")
    @ResponseBody
    public ResponseEntity<?> revertOfflinePayment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(onlineCourseOfflinePaymentService.revert(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to revert offline payment"));
        }
    }

    @GetMapping("/api/online-course-categories")
    @ResponseBody
    public ResponseEntity<?> listCategories() {
        return ResponseEntity.ok(onlineCourseCategoryService.getAll());
    }

    @PostMapping("/api/online-course-categories")
    @ResponseBody
    public ResponseEntity<?> createCategory(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(onlineCourseCategoryService.create(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create category"));
        }
    }

    @PutMapping("/api/online-course-categories/{id}")
    @ResponseBody
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(onlineCourseCategoryService.update(id, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update category"));
        }
    }

    @DeleteMapping("/api/online-course-categories/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            onlineCourseCategoryService.delete(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete category"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
