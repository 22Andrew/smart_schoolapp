package com.kantechsolution.smart_school.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class InventoryReportController {

    @GetMapping("/admin/report/inventorystock")
    public String stockReport(Model model) {
        return reportPage(model, "stock", "inventorystock", "Stock Report");
    }

    @GetMapping("/report/additem")
    public String addItemReport(Model model) {
        return reportPage(model, "additem", "additem", "Add Item Report");
    }

    @GetMapping("/report/issueinventory")
    public String issueItemReport(Model model) {
        return reportPage(model, "issue", "issueinventory", "Issue Item Report");
    }

    @GetMapping("/report/inventory")
    public RedirectView redirectInventoryLanding() {
        return new RedirectView("/admin/report/inventorystock");
    }

    @GetMapping("/report/inventory/{reportKey}")
    public RedirectView redirectLegacyInventoryReport(@PathVariable String reportKey) {
        return switch (reportKey.toLowerCase()) {
            case "additem", "itemreport" -> new RedirectView("/report/additem");
            case "issueinventory", "issuereport" -> new RedirectView("/report/issueinventory");
            case "inventorystock", "stockreport" -> new RedirectView("/admin/report/inventorystock");
            default -> new RedirectView("/admin/report/inventorystock");
        };
    }

    private String reportPage(Model model, String activeNav, String reportKey, String listTitle) {
        model.addAttribute("pageTitle", "Inventory Report - Smart School");
        model.addAttribute("activeNav", activeNav);
        model.addAttribute("reportKey", reportKey);
        model.addAttribute("listTitle", listTitle);
        model.addAttribute("apiUrl", "/api/reports/inventory/" + reportKey);
        return "inventory-report";
    }
}
