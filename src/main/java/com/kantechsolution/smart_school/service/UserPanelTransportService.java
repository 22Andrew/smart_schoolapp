package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.TransportRoute;
import com.kantechsolution.smart_school.model.TransportRouteStop;
import com.kantechsolution.smart_school.model.TransportRouteVehicle;
import com.kantechsolution.smart_school.model.TransportVehicle;
import com.kantechsolution.smart_school.repository.TransportRouteRepository;
import com.kantechsolution.smart_school.repository.TransportRouteStopRepository;
import com.kantechsolution.smart_school.repository.TransportRouteVehicleRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class UserPanelTransportService {

    private static final DateTimeFormatter US_TIME = DateTimeFormatter.ofPattern("h:mm a", Locale.US);

    private final UserPanelContextService contextService;
    private final TransportRouteRepository routeRepository;
    private final TransportRouteVehicleRepository routeVehicleRepository;
    private final TransportRouteStopRepository routeStopRepository;

    public UserPanelTransportService(UserPanelContextService contextService,
                                     TransportRouteRepository routeRepository,
                                     TransportRouteVehicleRepository routeVehicleRepository,
                                     TransportRouteStopRepository routeStopRepository) {
        this.contextService = contextService;
        this.routeRepository = routeRepository;
        this.routeVehicleRepository = routeVehicleRepository;
        this.routeStopRepository = routeStopRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentRoute(Authentication authentication) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        if (student == null) {
            throw new IllegalArgumentException("Student profile not found");
        }

        String routeTitle = text(student.getRouteList());
        if (routeTitle.isBlank()) {
            throw new IllegalArgumentException("No transport route assigned to this student");
        }

        TransportRoute route = routeRepository.findByTitleIgnoreCase(routeTitle)
                .orElseThrow(() -> new IllegalArgumentException("Transport route not found: " + routeTitle));

        TransportVehicle vehicle = resolveVehicle(route);
        String studentPickupPoint = text(student.getPickupPoint());

        List<Map<String, Object>> pickupPoints = new ArrayList<>();
        List<TransportRouteStop> stops = routeStopRepository
                .findByRoute_IdOrderBySortOrderAscIdAsc(route.getId());
        for (int index = 0; index < stops.size(); index++) {
            TransportRouteStop stop = stops.get(index);
            String pointName = stop.getPickupPoint() != null ? text(stop.getPickupPoint().getName()) : "";
            boolean active = !studentPickupPoint.isBlank()
                    ? pointName.equalsIgnoreCase(studentPickupPoint)
                    : index == 0;
            pickupPoints.add(toPickupPointRow(stop, index, active));
        }

        if (pickupPoints.stream().noneMatch(row -> Boolean.TRUE.equals(row.get("active")))) {
            if (!pickupPoints.isEmpty()) {
                pickupPoints.get(0).put("active", true);
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("routeTitle", route.getTitle());
        response.put("vehicleNumber", vehicle != null ? text(vehicle.getVehicleNumber()) : "");
        response.put("vehicleModel", vehicle != null ? text(vehicle.getVehicleModel()) : "");
        response.put("yearMade", vehicle != null ? text(vehicle.getYearMade()) : "");
        response.put("driverName", vehicle != null ? text(vehicle.getDriverName()) : "");
        response.put("driverLicence", vehicle != null ? text(vehicle.getDriverLicence()) : "");
        response.put("driverContact", vehicle != null ? text(vehicle.getDriverContact()) : "");
        response.put("driverPhotoUrl", resolveDriverPhoto(vehicle));
        response.put("studentPickupPoint", studentPickupPoint);
        response.put("pickupPoints", pickupPoints);
        return response;
    }

    private TransportVehicle resolveVehicle(TransportRoute route) {
        List<TransportRouteVehicle> assignments = routeVehicleRepository.findByRoute_IdWithVehicle(route.getId());
        if (assignments.isEmpty()) {
            return null;
        }
        return assignments.get(0).getVehicle();
    }

    private String resolveDriverPhoto(TransportVehicle vehicle) {
        if (vehicle == null || text(vehicle.getPhotoPath()).isBlank()) {
            return "";
        }
        String path = vehicle.getPhotoPath().trim();
        if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
            return path;
        }
        return "/uploads/transport/" + path;
    }

    private Map<String, Object> toPickupPointRow(TransportRouteStop stop, int index, boolean active) {
        Map<String, Object> row = new LinkedHashMap<>();
        String name = stop.getPickupPoint() != null ? text(stop.getPickupPoint().getName()) : "";
        row.put("name", name);
        row.put("distance", stop.getDistance() != null
                ? stop.getDistance().stripTrailingZeros().toPlainString()
                : "");
        row.put("pickupTime", formatTime(stop.getPickupTime()));
        row.put("active", active);
        row.put("position", index % 2 == 0 ? "above" : "below");
        row.put("sortOrder", stop.getSortOrder() != null ? stop.getSortOrder() : index + 1);
        return row;
    }

    private String formatTime(LocalTime time) {
        return time == null ? "" : US_TIME.format(time);
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }
}
