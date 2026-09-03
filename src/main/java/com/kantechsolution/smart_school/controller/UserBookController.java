package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserBookController {

    private final UserPanelContextService userPanelContextService;

    @GetMapping({"/book", "/book/"})
    public String bookList(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "library", "Book", "books");
        return "user-book";
    }

    @GetMapping({"/book/issue", "/book/issue/"})
    public String bookIssued(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "library", "Book Issued", "issued");
        return "user-book-issue";
    }
}
