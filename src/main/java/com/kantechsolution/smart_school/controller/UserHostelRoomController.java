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
public class UserHostelRoomController {

    private final UserPanelContextService userPanelContextService;

    @GetMapping({"/hostelroom", "/hostelroom/"})
    public String hostelRooms(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "hostel", "Hostel Rooms");
        return "user-hostelroom";
    }
}
