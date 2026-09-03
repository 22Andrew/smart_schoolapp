package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.TransportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Controller
public class TransportController {

    private final TransportService transportService;

    public TransportController(TransportService transportService) {
        this.transportService = transportService;
    }

    @GetMapping("/dailyassignment/admin/transport/feemaster")
    public String feesMasterPage() {
        return "transport-feemaster";
    }

    @GetMapping("/dailyassignment/admin/transport/pickuppoint")
    public String pickupPointPage() {
        return "transport-pickuppoint";
    }

    @GetMapping("/dailyassignment/admin/transport/route")
    public String routePage() {
        return "transport-route";
    }

    @GetMapping("/dailyassignment/admin/transport/vehicle")
    public String vehiclePage() {
        return "transport-vehicle";
    }

    @GetMapping("/dailyassignment/admin/transport/vehroute")
    public String assignVehiclePage() {
        return "transport-vehroute";
    }

    @GetMapping("/dailyassignment/admin/transport/pickuppointassign")
    public String routePickupPointPage() {
        return "transport-pickuppointassign";
    }

    @GetMapping("/dailyassignment/admin/transport/studenttransportfees")
    public String studentFeesPage() {
        return "transport-studentfees";
    }

    @GetMapping("/api/transport/options")
    @ResponseBody
    public ResponseEntity<?> options() {
        return ResponseEntity.ok(transportService.formOptions());
    }

    @GetMapping("/api/transport/routes")
    @ResponseBody
    public ResponseEntity<?> listRoutes() {
        return ResponseEntity.ok(transportService.listRoutes());
    }

    @PostMapping("/api/transport/routes")
    @ResponseBody
    public ResponseEntity<?> createRoute(@RequestBody Map<String, Object> payload) {
        return created(transportService.createRoute(payload), "Route saved successfully!");
    }

    @PutMapping("/api/transport/routes/{id}")
    @ResponseBody
    public ResponseEntity<?> updateRoute(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return ok(transportService.updateRoute(id, payload), "Route updated successfully!");
    }

    @DeleteMapping("/api/transport/routes/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteRoute(@PathVariable Long id) {
        transportService.deleteRoute(id);
        return okMessage("Route deleted successfully!");
    }

    @GetMapping("/api/transport/pickup-points")
    @ResponseBody
    public ResponseEntity<?> listPickupPoints() {
        return ResponseEntity.ok(transportService.listPickupPoints());
    }

    @PostMapping("/api/transport/pickup-points")
    @ResponseBody
    public ResponseEntity<?> createPickup(@RequestBody Map<String, Object> payload) {
        return created(transportService.createPickupPoint(payload), "Pickup point saved successfully!");
    }

    @PutMapping("/api/transport/pickup-points/{id}")
    @ResponseBody
    public ResponseEntity<?> updatePickup(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return ok(transportService.updatePickupPoint(id, payload), "Pickup point updated successfully!");
    }

    @DeleteMapping("/api/transport/pickup-points/{id}")
    @ResponseBody
    public ResponseEntity<?> deletePickup(@PathVariable Long id) {
        transportService.deletePickupPoint(id);
        return okMessage("Pickup point deleted successfully!");
    }

    @GetMapping("/api/transport/vehicles")
    @ResponseBody
    public ResponseEntity<?> listVehicles() {
        return ResponseEntity.ok(transportService.listVehicles());
    }

    @PostMapping(value = "/api/transport/vehicles", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<?> createVehicle(
            @RequestParam Map<String, String> payload,
            @RequestParam(value = "photo", required = false) MultipartFile photo
    ) {
        return created(transportService.saveVehicle(null, payload, photo), "Vehicle saved successfully!");
    }

    @PutMapping(value = "/api/transport/vehicles/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<?> updateVehicle(
            @PathVariable Long id,
            @RequestParam Map<String, String> payload,
            @RequestParam(value = "photo", required = false) MultipartFile photo
    ) {
        return ok(transportService.saveVehicle(id, payload, photo), "Vehicle updated successfully!");
    }

    @DeleteMapping("/api/transport/vehicles/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        transportService.deleteVehicle(id);
        return okMessage("Vehicle deleted successfully!");
    }

    @GetMapping("/api/transport/route-vehicles")
    @ResponseBody
    public ResponseEntity<?> listRouteVehicles() {
        return ResponseEntity.ok(transportService.listRouteVehicles());
    }

    @PostMapping("/api/transport/route-vehicles")
    @ResponseBody
    public ResponseEntity<?> saveRouteVehicles(@RequestBody Map<String, Object> payload) {
        transportService.saveRouteVehicles(payload);
        return okMessage("Vehicle assigned successfully!");
    }

    @DeleteMapping("/api/transport/route-vehicles/{routeId}")
    @ResponseBody
    public ResponseEntity<?> deleteRouteVehicles(@PathVariable Long routeId) {
        transportService.deleteRouteVehicles(routeId);
        return okMessage("Assigned vehicle deleted successfully!");
    }

    @GetMapping("/api/transport/route-stops")
    @ResponseBody
    public ResponseEntity<?> listRouteStops() {
        return ResponseEntity.ok(transportService.listRouteStops());
    }

    @GetMapping("/api/transport/route-stops/route/{routeId}")
    @ResponseBody
    public ResponseEntity<?> getRouteStops(@PathVariable Long routeId) {
        return ResponseEntity.ok(transportService.getRouteStops(routeId));
    }

    @PostMapping("/api/transport/route-stops")
    @ResponseBody
    public ResponseEntity<?> saveRouteStops(@RequestBody Map<String, Object> payload) {
        transportService.saveRouteStops(payload);
        return okMessage("Route pickup point saved successfully!");
    }

    @DeleteMapping("/api/transport/route-stops/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteRouteStop(@PathVariable Long id) {
        transportService.deleteRouteStop(id);
        return okMessage("Route pickup point deleted successfully!");
    }

    @PutMapping("/api/transport/route-stops/reorder")
    @ResponseBody
    public ResponseEntity<?> reorderStops(@RequestBody Map<String, Object> payload) {
        transportService.reorderRouteStops(payload);
        return okMessage("Pickup points reordered successfully!");
    }

    @GetMapping("/api/transport/fee-months")
    @ResponseBody
    public ResponseEntity<?> listFeeMonths() {
        return ResponseEntity.ok(transportService.listFeeMonths());
    }

    @PostMapping("/api/transport/fee-months")
    @ResponseBody
    public ResponseEntity<?> saveFeeMonths(@RequestBody Map<String, Object> payload) {
        transportService.saveFeeMonths(payload);
        return okMessage("Transport fees master saved successfully!");
    }

    @GetMapping("/api/transport/student-fees")
    @ResponseBody
    public ResponseEntity<?> searchStudents(
            @RequestParam Long classId,
            @RequestParam(required = false) String section
    ) {
        return ResponseEntity.ok(transportService.searchStudents(classId, section));
    }

    @GetMapping("/api/transport/student-fees/{studentId}")
    @ResponseBody
    public ResponseEntity<?> assignForm(@PathVariable Long studentId) {
        return ResponseEntity.ok(transportService.assignFeesForm(studentId));
    }

    @PostMapping("/api/transport/student-fees")
    @ResponseBody
    public ResponseEntity<?> assignFees(@RequestBody Map<String, Object> payload) {
        transportService.assignFees(payload);
        return okMessage("Transport fees assigned successfully!");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseBody
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    @ResponseBody
    public ResponseEntity<?> handleException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorBody("Failed to process transport request"));
    }

    private ResponseEntity<?> created(Map<String, Object> data, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private ResponseEntity<?> ok(Map<String, Object> data, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<?> okMessage(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return body;
    }
}
