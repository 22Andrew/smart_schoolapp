package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.service.StudentCvService;
import com.kantechsolution.smart_school.service.UserPanelContextService;
import com.kantechsolution.smart_school.service.UserPanelPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/user/user")
@RequiredArgsConstructor
public class UserPanelController {

    private final UserPanelPageService userPanelPageService;
    private final UserPanelContextService userPanelContextService;
    private final StudentCvService studentCvService;

    @GetMapping("/profile")
    public String profile(Model model, Authentication authentication) {
        userPanelPageService.populateProfile(model, authentication);
        return "user-profile";
    }

    @GetMapping("/resume/print")
    public String printResume(Authentication authentication, Model model) {
        if (!studentCvService.isStudentPanelDownloadEnabled()) {
            return "redirect:/user/user/profile?resume=disabled";
        }
        StudentAdmission student = userPanelContextService.resolveStudent(authentication);
        if (student == null || student.getId() == null) {
            return "redirect:/user/user/profile?resume=unavailable";
        }
        model.addAttribute("studentId", student.getId());
        return "user-student-cv-print";
    }

    @GetMapping("/getfees")
    public String getFees(Model model, Authentication authentication) {
        userPanelPageService.populateGetFees(model, authentication);
        return "user-getfees";
    }

    @GetMapping("/fees")
    public String fees() {
        return "redirect:/user/user/getfees";
    }

    @GetMapping("/online-course")
    public String onlineCourse() {
        return "redirect:/user/studentcourse";
    }

    @GetMapping("/gmeet")
    public String gmeet() {
        return "redirect:/user/gmeet";
    }

    @GetMapping("/zoom")
    public String zoom() {
        return "redirect:/user/conference";
    }

    @GetMapping("/timetable")
    public String timetable() {
        return "redirect:/user/timetable";
    }

    @GetMapping("/lesson-plan")
    public String lessonPlan() {
        return "redirect:/user/syllabus";
    }

    @GetMapping("/syllabus")
    public String syllabus() {
        return "redirect:/user/syllabus/status";
    }

    @GetMapping("/homework")
    public String homework() {
        return "redirect:/user/homework";
    }

    @GetMapping("/dailyassignment")
    public String dailyAssignment() {
        return "redirect:/user/dailyassignment";
    }

    @GetMapping("/online-exam")
    public String onlineExam() {
        return "redirect:/user/onlineexam/view/405";
    }

    @GetMapping("/apply-leave")
    public String applyLeave() {
        return "redirect:/user/applyleav";
    }

    @GetMapping("/visitor-book")
    public String visitorBook(Model model, Authentication authentication) {
        userPanelPageService.populateVisitorBook(model, authentication);
        return "user-panel-table";
    }

    @GetMapping("/download-center/contents")
    public String downloadContents(Model model, Authentication authentication) {
        userPanelPageService.populateDownloadContents(model, authentication);
        return "user-panel-table";
    }

    @GetMapping("/download-center/video-tutorial")
    public String downloadVideo(Model model, Authentication authentication) {
        userPanelPageService.populateDownloadVideo(model, authentication);
        return "user-panel-table";
    }

    @GetMapping("/attendance")
    public String attendance(Model model, Authentication authentication) {
        userPanelPageService.populateAttendance(model, authentication);
        return "user-panel-table";
    }

    @GetMapping("/cbse-exam/schedule")
    public String cbseSchedule(Model model, Authentication authentication) {
        userPanelPageService.populateCbseSchedule(model, authentication);
        return "user-panel-table";
    }

    @GetMapping("/cbse-exam/result")
    public String cbseResult(Model model, Authentication authentication) {
        userPanelPageService.populateCbseResult(model, authentication);
        return "user-panel-table";
    }

    @GetMapping("/examinations/schedule")
    public String examSchedule(Model model, Authentication authentication) {
        userPanelPageService.populateExamSchedule(model, authentication);
        return "user-panel-table";
    }

    @GetMapping("/examinations/result")
    public String examResult(Model model, Authentication authentication) {
        userPanelPageService.populateExamResult(model, authentication);
        return "user-panel-table";
    }

    @GetMapping("/notice-board")
    public String noticeBoard(Model model, Authentication authentication) {
        userPanelPageService.populateNoticeBoard(model, authentication);
        return "user-notice-board";
    }

    @GetMapping("/teacher-review")
    public String teacherReview(Model model, Authentication authentication) {
        userPanelPageService.populateTeacherReview(model, authentication);
        return "user-panel-table";
    }

    @GetMapping("/library/books")
    public String libraryBooks(Model model, Authentication authentication) {
        userPanelPageService.populateLibraryBooks(model, authentication);
        return "user-panel-table";
    }

    @GetMapping("/library/issued")
    public String libraryIssued(Model model, Authentication authentication) {
        userPanelPageService.populateLibraryIssued(model, authentication);
        return "user-panel-table";
    }

    @GetMapping("/transport")
    public String transport(Model model, Authentication authentication) {
        userPanelPageService.populateTransport(model, authentication);
        return "user-panel-table";
    }

    @GetMapping("/hostel")
    public String hostel(Model model, Authentication authentication) {
        userPanelPageService.populateHostel(model, authentication);
        return "user-panel-table";
    }
}
