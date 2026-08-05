package com.kantechsolution.smart_school.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller for Academics Promote Students page
 */
@Controller
public class PromoteTransferController {

    @GetMapping("/promotetransfer")
    public String showPromoteTransferPage(Model model) {
        return "promotetransfer";
    }
}
