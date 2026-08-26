package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.AppUserAccountRepository;
import com.kantechsolution.smart_school.repository.NoticeBoardRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;

import java.util.Optional;

@Service
public class UserPanelContextService {

    private final LoginPageService loginPageService;
    private final AcademicSessionService academicSessionService;
    private final AppUserAccountRepository appUserAccountRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final NoticeBoardRepository noticeBoardRepository;

    public UserPanelContextService(LoginPageService loginPageService,
                                   AcademicSessionService academicSessionService,
                                   AppUserAccountRepository appUserAccountRepository,
                                   StudentAdmissionRepository studentAdmissionRepository,
                                   NoticeBoardRepository noticeBoardRepository) {
        this.loginPageService = loginPageService;
        this.academicSessionService = academicSessionService;
        this.appUserAccountRepository = appUserAccountRepository;
        this.studentAdmissionRepository = studentAdmissionRepository;
        this.noticeBoardRepository = noticeBoardRepository;
    }

    @Transactional(readOnly = true)
    public AppUserAccount resolveAccount(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        return appUserAccountRepository.findByUsernameIgnoreCase(authentication.getName()).orElse(null);
    }

    @Transactional(readOnly = true)
    public StudentAdmission resolveStudent(Authentication authentication) {
        return resolveStudent(resolveAccount(authentication));
    }

    @Transactional(readOnly = true)
    public StudentAdmission resolveStudent(AppUserAccount account) {
        if (account == null || account.getSourceId() == null) {
            return studentAdmissionRepository.findById(1L).orElse(null);
        }
        return studentAdmissionRepository.findById(account.getSourceId()).orElse(null);
    }

    @Transactional(readOnly = true)
    public void populateLayoutModel(Model model, Authentication authentication, String activeMenu, String pageTitle) {
        populateLayoutModel(model, authentication, activeMenu, pageTitle, null);
    }

    @Transactional(readOnly = true)
    public void populateLayoutModel(Model model, Authentication authentication, String activeMenu,
                                    String pageTitle, String activeSubmenu) {
        loginPageService.populateLoginModel(model);

        AppUserAccount account = resolveAccount(authentication);
        StudentAdmission student = resolveStudent(account);
        String studentName = resolveStudentName(student);

        model.addAttribute("pageTitle", pageTitle);
        model.addAttribute("activeMenu", activeMenu);
        model.addAttribute("activeSubmenu", activeSubmenu);
        model.addAttribute("userRole", account != null ? account.getUserType() : "STUDENT");
        model.addAttribute("username", authentication != null ? authentication.getName() : "");
        model.addAttribute("studentName", studentName);
        model.addAttribute("admissionNo", resolveAdmissionNo(student));
        model.addAttribute("classLabel", resolveClassLabel(student));
        model.addAttribute("currentSession", resolveCurrentSession());
        model.addAttribute("noticeCount", resolveNoticeCount());
        model.addAttribute("profileImageUrl", resolveProfileImage(studentName));
        model.addAttribute("student", student);
    }

    public String resolveStudentName(StudentAdmission student) {
        if (student == null) {
            return "Edward Thomas";
        }
        String first = Optional.ofNullable(student.getFirstName()).orElse("").trim();
        String last = Optional.ofNullable(student.getLastName()).orElse("").trim();
        String full = (first + " " + last).trim();
        return full.isBlank() ? "Edward Thomas" : full;
    }

    public String resolveAdmissionNo(StudentAdmission student) {
        if (student != null && student.getAdmissionNo() != null && !student.getAdmissionNo().isBlank()) {
            return student.getAdmissionNo().trim();
        }
        return "1000011";
    }

    public String resolveClassLabel(StudentAdmission student) {
        if (student == null || student.getSchoolClass() == null) {
            return "Class 1 (A)";
        }
        String className = student.getSchoolClass().getName();
        String section = student.getSection() == null ? "" : student.getSection().trim();
        if (section.isBlank()) {
            return className;
        }
        return className + " (" + section + ")";
    }

    public String resolveCurrentSession() {
        Object name = academicSessionService.getCurrentSession().get("sessionName");
        return name != null ? String.valueOf(name) : "2026-27";
    }

    public long resolveNoticeCount() {
        long count = noticeBoardRepository.count();
        return count > 0 ? count : 26L;
    }

    public String resolveProfileImage(String studentName) {
        String encoded = studentName.replace(" ", "+");
        return "https://ui-avatars.com/api/?name=" + encoded + "&background=e2e8f0&color=64748b&size=128";
    }
}
