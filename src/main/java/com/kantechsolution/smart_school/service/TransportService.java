package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@Order(16)
public class TransportService implements ApplicationRunner {

    private static final String[] MONTHS = {
            "April", "May", "June", "July", "August", "September",
            "October", "November", "December", "January", "February", "March"
    };
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter US = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final TransportRouteRepository routeRepository;
    private final TransportPickupPointRepository pickupPointRepository;
    private final TransportVehicleRepository vehicleRepository;
    private final TransportRouteVehicleRepository routeVehicleRepository;
    private final TransportRouteStopRepository routeStopRepository;
    private final TransportFeeMonthRepository feeMonthRepository;
    private final TransportStudentFeeRepository studentFeeRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final UploadStorage uploadStorage;

    public TransportService(
            TransportRouteRepository routeRepository,
            TransportPickupPointRepository pickupPointRepository,
            TransportVehicleRepository vehicleRepository,
            TransportRouteVehicleRepository routeVehicleRepository,
            TransportRouteStopRepository routeStopRepository,
            TransportFeeMonthRepository feeMonthRepository,
            TransportStudentFeeRepository studentFeeRepository,
            StudentAdmissionRepository studentAdmissionRepository,
            UploadStorage uploadStorage
    ) {
        this.routeRepository = routeRepository;
        this.pickupPointRepository = pickupPointRepository;
        this.vehicleRepository = vehicleRepository;
        this.routeVehicleRepository = routeVehicleRepository;
        this.routeStopRepository = routeStopRepository;
        this.feeMonthRepository = feeMonthRepository;
        this.studentFeeRepository = studentFeeRepository;
        this.studentAdmissionRepository = studentAdmissionRepository;
        this.uploadStorage = uploadStorage;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (int i = 0; i < MONTHS.length; i++) {
            final int index = i + 1;
            final String monthName = MONTHS[i];
            feeMonthRepository.findByMonthNameIgnoreCase(monthName).orElseGet(() -> {
                TransportFeeMonth month = TransportFeeMonth.builder()
                        .monthName(monthName)
                        .monthIndex(index)
                        .fineType(TransportFeeMonth.FineType.NONE)
                        .build();
                month.setIsActive(true);
                return feeMonthRepository.save(month);
            });
        }
        if (routeRepository.count() == 0) {
            saveRoute("Airport");
            saveRoute("Ganga Nagar");
        }
        if (pickupPointRepository.count() == 0) {
            savePickup("School Gate", "26.9124", "75.7873");
            savePickup("City Mall", "26.9050", "75.8100");
        }
        if (vehicleRepository.count() == 0) {
            TransportVehicle vehicle = TransportVehicle.builder()
                    .vehicleNumber("RJ14 CA 5544")
                    .vehicleModel("Tata Starbus")
                    .yearMade("2022")
                    .registrationNumber("RJ14CA5544")
                    .chassisNumber("CHS5544")
                    .maxSeatingCapacity(40)
                    .driverName("Ramesh Kumar")
                    .driverLicence("RJ-14-2018-1234567")
                    .driverContact("9876543210")
                    .note("Morning and afternoon shift")
                    .build();
            vehicle.setIsActive(true);
            vehicleRepository.save(vehicle);
        }
    }

    public Map<String, Object> formOptions() {
        Map<String, Object> options = new LinkedHashMap<>();
        options.put("routes", listRoutes());
        options.put("pickupPoints", listPickupPoints());
        options.put("vehicles", listVehicles());
        return options;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listRoutes() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (TransportRoute route : routeRepository.findAllByOrderByTitleAsc()) {
            rows.add(routeMap(route));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> createRoute(Map<String, Object> payload) {
        TransportRoute route = applyRoute(new TransportRoute(), payload, null);
        route.setIsActive(true);
        return routeMap(routeRepository.save(route));
    }

    @Transactional
    public Map<String, Object> updateRoute(Long id, Map<String, Object> payload) {
        TransportRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));
        return routeMap(routeRepository.save(applyRoute(route, payload, id)));
    }

    @Transactional
    public void deleteRoute(Long id) {
        TransportRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));
        if (routeVehicleRepository.existsByRoute_Id(id) || routeStopRepository.existsByRoute_Id(id)) {
            throw new IllegalArgumentException("This route is in use and cannot be deleted");
        }
        routeRepository.delete(route);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listPickupPoints() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (TransportPickupPoint point : pickupPointRepository.findAllByOrderByNameAsc()) {
            rows.add(pickupMap(point));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> createPickupPoint(Map<String, Object> payload) {
        TransportPickupPoint point = applyPickup(new TransportPickupPoint(), payload, null);
        point.setIsActive(true);
        return pickupMap(pickupPointRepository.save(point));
    }

    @Transactional
    public Map<String, Object> updatePickupPoint(Long id, Map<String, Object> payload) {
        TransportPickupPoint point = pickupPointRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pickup point not found"));
        return pickupMap(pickupPointRepository.save(applyPickup(point, payload, id)));
    }

    @Transactional
    public void deletePickupPoint(Long id) {
        TransportPickupPoint point = pickupPointRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pickup point not found"));
        if (routeStopRepository.existsByPickupPoint_Id(id)) {
            throw new IllegalArgumentException("This pickup point is used on a route and cannot be deleted");
        }
        pickupPointRepository.delete(point);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listVehicles() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (TransportVehicle vehicle : vehicleRepository.findAllByOrderByVehicleNumberAsc()) {
            rows.add(vehicleMap(vehicle));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> saveVehicle(Long id, Map<String, String> payload, MultipartFile photo) {
        TransportVehicle vehicle = id == null
                ? new TransportVehicle()
                : vehicleRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
        applyVehicle(vehicle, payload, id);
        if (id == null) {
            vehicle.setIsActive(true);
        }
        applyPhoto(vehicle, photo);
        return vehicleMap(vehicleRepository.save(vehicle));
    }

    @Transactional
    public void deleteVehicle(Long id) {
        TransportVehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
        if (routeVehicleRepository.existsByVehicle_Id(id)) {
            throw new IllegalArgumentException("This vehicle is assigned to a route and cannot be deleted");
        }
        vehicleRepository.delete(vehicle);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listRouteVehicles() {
        Map<Long, Map<String, Object>> grouped = new LinkedHashMap<>();
        for (TransportRouteVehicle row : routeVehicleRepository.findAllWithDetails()) {
            TransportRoute route = row.getRoute();
            Map<String, Object> item = grouped.computeIfAbsent(route.getId(), key -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", route.getId());
                map.put("routeId", route.getId());
                map.put("routeTitle", route.getTitle());
                map.put("vehicleIds", new ArrayList<Long>());
                map.put("vehicleNumbers", new ArrayList<String>());
                return map;
            });
            @SuppressWarnings("unchecked")
            List<Long> ids = (List<Long>) item.get("vehicleIds");
            @SuppressWarnings("unchecked")
            List<String> numbers = (List<String>) item.get("vehicleNumbers");
            ids.add(row.getVehicle().getId());
            numbers.add(row.getVehicle().getVehicleNumber());
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map<String, Object> item : grouped.values()) {
            @SuppressWarnings("unchecked")
            List<String> numbers = (List<String>) item.get("vehicleNumbers");
            item.put("vehicles", String.join(", ", numbers));
            rows.add(item);
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> saveRouteVehicles(Map<String, Object> payload) {
        Long routeId = asLong(payload.get("routeId"));
        if (routeId == null) {
            throw new IllegalArgumentException("Route is required");
        }
        TransportRoute route = routeRepository.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));
        List<Long> vehicleIds = asLongList(payload.get("vehicleIds"));
        if (vehicleIds.isEmpty()) {
            throw new IllegalArgumentException("Select at least one vehicle");
        }
        routeVehicleRepository.deleteByRoute_Id(routeId);
        routeVehicleRepository.flush();
        for (Long vehicleId : vehicleIds) {
            TransportVehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
            TransportRouteVehicle row = TransportRouteVehicle.builder().route(route).vehicle(vehicle).build();
            row.setIsActive(true);
            routeVehicleRepository.save(row);
        }
        return Map.of("success", true);
    }

    @Transactional
    public void deleteRouteVehicles(Long routeId) {
        if (!routeRepository.existsById(routeId)) {
            throw new IllegalArgumentException("Route assignment not found");
        }
        routeVehicleRepository.deleteByRoute_Id(routeId);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listRouteStops() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (TransportRouteStop stop : routeStopRepository.findAllWithDetails()) {
            rows.add(stopMap(stop));
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getRouteStops(Long routeId) {
        TransportRoute route = routeRepository.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));
        List<Map<String, Object>> stops = new ArrayList<>();
        for (TransportRouteStop stop : routeStopRepository.findByRoute_IdOrderBySortOrderAscIdAsc(routeId)) {
            stops.add(stopMap(stop));
        }
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("routeId", route.getId());
        map.put("routeTitle", route.getTitle());
        map.put("stops", stops);
        return map;
    }

    @Transactional
    public void saveRouteStops(Map<String, Object> payload) {
        Long routeId = asLong(payload.get("routeId"));
        if (routeId == null) {
            throw new IllegalArgumentException("Route is required");
        }
        TransportRoute route = routeRepository.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> stops = payload.get("stops") instanceof List<?> list
                ? (List<Map<String, Object>>) (List<?>) list
                : List.of();
        if (stops.isEmpty()) {
            throw new IllegalArgumentException("Add at least one pickup point");
        }
        routeStopRepository.deleteByRoute_Id(routeId);
        routeStopRepository.flush();
        int order = 1;
        for (Map<String, Object> item : stops) {
            Long pickupId = asLong(item.get("pickupPointId"));
            if (pickupId == null) {
                throw new IllegalArgumentException("Pickup point is required");
            }
            TransportPickupPoint pickup = pickupPointRepository.findById(pickupId)
                    .orElseThrow(() -> new IllegalArgumentException("Pickup point not found"));
            TransportRouteStop stop = TransportRouteStop.builder()
                    .route(route)
                    .pickupPoint(pickup)
                    .distance(asDecimal(item.get("distance")))
                    .pickupTime(asTime(item.get("pickupTime")))
                    .monthlyFees(asDecimal(item.get("monthlyFees")))
                    .sortOrder(order++)
                    .build();
            stop.setIsActive(true);
            routeStopRepository.save(stop);
        }
    }

    @Transactional
    public void deleteRouteStop(Long id) {
        TransportRouteStop stop = routeStopRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Route pickup point not found"));
        routeStopRepository.delete(stop);
    }

    @Transactional
    public void reorderRouteStops(Map<String, Object> payload) {
        List<Long> ids = asLongList(payload.get("ids"));
        int order = 1;
        for (Long id : ids) {
            TransportRouteStop stop = routeStopRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Route pickup point not found"));
            stop.setSortOrder(order++);
            routeStopRepository.save(stop);
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listFeeMonths() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (TransportFeeMonth month : feeMonthRepository.findAllByOrderByMonthIndexAsc()) {
            rows.add(feeMonthMap(month));
        }
        return rows;
    }

    @Transactional
    public void saveFeeMonths(Map<String, Object> payload) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> months = payload.get("months") instanceof List<?> list
                ? (List<Map<String, Object>>) (List<?>) list
                : List.of();
        for (Map<String, Object> item : months) {
            Long id = asLong(item.get("id"));
            if (id == null) {
                continue;
            }
            TransportFeeMonth month = feeMonthRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Fee month not found"));
            month.setDueDate(asDate(item.get("dueDate")));
            TransportFeeMonth.FineType fineType = asFineType(item.get("fineType"));
            month.setFineType(fineType);
            month.setPercentage(fineType == TransportFeeMonth.FineType.PERCENTAGE ? asDecimal(item.get("percentage")) : null);
            month.setFixedAmount(fineType == TransportFeeMonth.FineType.FIX ? asDecimal(item.get("fixedAmount")) : null);
            feeMonthRepository.save(month);
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchStudents(Long classId, String section) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : studentAdmissionRepository.search(classId, section, null, false, null)) {
            rows.add(studentTransportMap(student));
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> assignFeesForm(Long studentId) {
        StudentAdmission student = studentAdmissionRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        Map<String, Object> map = studentTransportMap(student);
        BigDecimal monthlyFees = monthlyFeesForStudent(student);
        List<Map<String, Object>> months = new ArrayList<>();
        Set<String> assigned = new HashSet<>();
        for (TransportStudentFee fee : studentFeeRepository.findByStudent_IdOrderByIdAsc(studentId)) {
            assigned.add(fee.getMonthName().toLowerCase(Locale.ROOT));
        }
        for (TransportFeeMonth month : feeMonthRepository.findAllByOrderByMonthIndexAsc()) {
            Map<String, Object> row = feeMonthMap(month);
            row.put("amount", monthlyFees);
            row.put("assigned", assigned.contains(month.getMonthName().toLowerCase(Locale.ROOT)));
            months.add(row);
        }
        map.put("months", months);
        return map;
    }

    @Transactional
    public void assignFees(Map<String, Object> payload) {
        Long studentId = asLong(payload.get("studentId"));
        if (studentId == null) {
            throw new IllegalArgumentException("Student is required");
        }
        StudentAdmission student = studentAdmissionRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        List<String> months = asStringList(payload.get("months"));
        if (months.isEmpty()) {
            throw new IllegalArgumentException("Select at least one month");
        }
        BigDecimal amount = monthlyFeesForStudent(student);
        for (String monthName : months) {
            TransportFeeMonth feeMonth = feeMonthRepository.findByMonthNameIgnoreCase(monthName)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid month"));
            if (studentFeeRepository.existsByStudent_IdAndMonthNameIgnoreCase(studentId, feeMonth.getMonthName())) {
                continue;
            }
            TransportStudentFee fee = TransportStudentFee.builder()
                    .student(student)
                    .monthName(feeMonth.getMonthName())
                    .amount(amount)
                    .dueDate(feeMonth.getDueDate())
                    .build();
            fee.setIsActive(true);
            studentFeeRepository.save(fee);
        }
    }

    private TransportRoute applyRoute(TransportRoute route, Map<String, Object> payload, Long currentId) {
        String title = text(payload.get("title"));
        if (title.isBlank()) {
            throw new IllegalArgumentException("Route Title is required");
        }
        boolean duplicate = currentId == null
                ? routeRepository.findByTitleIgnoreCase(title).isPresent()
                : routeRepository.existsByTitleIgnoreCaseAndIdNot(title, currentId);
        if (duplicate) {
            throw new IllegalArgumentException("This route already exists");
        }
        route.setTitle(title);
        return route;
    }

    private TransportPickupPoint applyPickup(TransportPickupPoint point, Map<String, Object> payload, Long currentId) {
        String name = text(payload.get("name"));
        if (name.isBlank()) {
            throw new IllegalArgumentException("Pickup Point is required");
        }
        boolean duplicate = currentId == null
                ? pickupPointRepository.findByNameIgnoreCase(name).isPresent()
                : pickupPointRepository.existsByNameIgnoreCaseAndIdNot(name, currentId);
        if (duplicate) {
            throw new IllegalArgumentException("This pickup point already exists");
        }
        point.setName(name);
        point.setLatitude(blankToNull(text(payload.get("latitude"))));
        point.setLongitude(blankToNull(text(payload.get("longitude"))));
        return point;
    }

    private void applyVehicle(TransportVehicle vehicle, Map<String, String> payload, Long currentId) {
        String number = text(payload.get("vehicleNumber"));
        if (number.isBlank()) {
            throw new IllegalArgumentException("Vehicle Number is required");
        }
        boolean duplicate = currentId == null
                ? vehicleRepository.findByVehicleNumberIgnoreCase(number).isPresent()
                : vehicleRepository.existsByVehicleNumberIgnoreCaseAndIdNot(number, currentId);
        if (duplicate) {
            throw new IllegalArgumentException("This vehicle number already exists");
        }
        vehicle.setVehicleNumber(number);
        vehicle.setVehicleModel(blankToNull(text(payload.get("vehicleModel"))));
        vehicle.setYearMade(blankToNull(text(payload.get("yearMade"))));
        vehicle.setRegistrationNumber(blankToNull(text(payload.get("registrationNumber"))));
        vehicle.setChassisNumber(blankToNull(text(payload.get("chassisNumber"))));
        vehicle.setMaxSeatingCapacity(asInteger(payload.get("maxSeatingCapacity")));
        vehicle.setDriverName(blankToNull(text(payload.get("driverName"))));
        vehicle.setDriverLicence(blankToNull(text(payload.get("driverLicence"))));
        vehicle.setDriverContact(blankToNull(text(payload.get("driverContact"))));
        vehicle.setNote(blankToNull(text(payload.get("note"))));
    }

    private void applyPhoto(TransportVehicle vehicle, MultipartFile photo) {
        if (photo == null || photo.isEmpty()) {
            return;
        }
        String originalName = photo.getOriginalFilename() != null ? photo.getOriginalFilename() : "vehicle";
        String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT)
                : "";
        try {
            Path uploadDir = uploadStorage.getVehiclesDir();
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Files.copy(photo.getInputStream(), uploadDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            vehicle.setPhotoPath("/uploads/vehicles/" + filename);
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store vehicle photo");
        }
    }

    private Map<String, Object> studentTransportMap(StudentAdmission student) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", student.getId());
        map.put("admissionNo", student.getAdmissionNo());
        map.put("studentName", studentName(student));
        map.put("className", student.getSchoolClass() == null ? "" : student.getSchoolClass().getName());
        map.put("section", student.getSection());
        map.put("fatherName", student.getFatherName() == null ? "" : student.getFatherName());
        map.put("dateOfBirth", student.getDateOfBirth() == null ? "" : student.getDateOfBirth().toString());
        map.put("mobileNumber", student.getMobileNumber() == null ? "" : student.getMobileNumber());
        map.put("rollNumber", student.getRollNumber() == null ? "" : student.getRollNumber());
        map.put("routeTitle", student.getRouteList() == null ? "" : student.getRouteList());
        map.put("pickupPoint", student.getPickupPoint() == null ? "" : student.getPickupPoint());
        map.put("vehicleNumber", vehiclesForRouteTitle(student.getRouteList()));
        Map<String, Object> stop = stopForStudent(student);
        map.put("pickupTime", stop.getOrDefault("pickupTime", ""));
        map.put("fees", stop.getOrDefault("monthlyFees", ""));
        map.put("distance", stop.getOrDefault("distance", ""));
        map.put("assignedMonths", studentFeeRepository.findByStudent_IdOrderByIdAsc(student.getId()).size());
        return map;
    }

    private BigDecimal monthlyFeesForStudent(StudentAdmission student) {
        Object fees = stopForStudent(student).get("monthlyFees");
        return fees instanceof BigDecimal amount ? amount : BigDecimal.ZERO;
    }

    private Map<String, Object> stopForStudent(StudentAdmission student) {
        String routeTitle = student.getRouteList();
        String pickupName = student.getPickupPoint();
        if (routeTitle == null || routeTitle.isBlank() || pickupName == null || pickupName.isBlank()) {
            return Map.of();
        }
        for (TransportRouteStop stop : routeStopRepository.findAllWithDetails()) {
            if (routeTitle.equalsIgnoreCase(stop.getRoute().getTitle())
                    && pickupName.equalsIgnoreCase(stop.getPickupPoint().getName())) {
                return stopMap(stop);
            }
        }
        return Map.of();
    }

    private String vehiclesForRouteTitle(String routeTitle) {
        if (routeTitle == null || routeTitle.isBlank()) {
            return "";
        }
        List<String> numbers = new ArrayList<>();
        for (TransportRouteVehicle row : routeVehicleRepository.findAllWithDetails()) {
            if (routeTitle.equalsIgnoreCase(row.getRoute().getTitle())) {
                numbers.add(row.getVehicle().getVehicleNumber());
            }
        }
        return String.join(", ", numbers);
    }

    private Map<String, Object> routeMap(TransportRoute route) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", route.getId());
        map.put("title", route.getTitle());
        return map;
    }

    private Map<String, Object> pickupMap(TransportPickupPoint point) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", point.getId());
        map.put("name", point.getName());
        map.put("latitude", point.getLatitude() == null ? "" : point.getLatitude());
        map.put("longitude", point.getLongitude() == null ? "" : point.getLongitude());
        return map;
    }

    private Map<String, Object> vehicleMap(TransportVehicle vehicle) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", vehicle.getId());
        map.put("vehicleNumber", vehicle.getVehicleNumber());
        map.put("vehicleModel", vehicle.getVehicleModel() == null ? "" : vehicle.getVehicleModel());
        map.put("yearMade", vehicle.getYearMade() == null ? "" : vehicle.getYearMade());
        map.put("registrationNumber", vehicle.getRegistrationNumber() == null ? "" : vehicle.getRegistrationNumber());
        map.put("chassisNumber", vehicle.getChassisNumber() == null ? "" : vehicle.getChassisNumber());
        map.put("maxSeatingCapacity", vehicle.getMaxSeatingCapacity());
        map.put("driverName", vehicle.getDriverName() == null ? "" : vehicle.getDriverName());
        map.put("driverLicence", vehicle.getDriverLicence() == null ? "" : vehicle.getDriverLicence());
        map.put("driverContact", vehicle.getDriverContact() == null ? "" : vehicle.getDriverContact());
        map.put("photoPath", vehicle.getPhotoPath() == null ? "" : vehicle.getPhotoPath());
        map.put("note", vehicle.getNote() == null ? "" : vehicle.getNote());
        return map;
    }

    private Map<String, Object> stopMap(TransportRouteStop stop) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", stop.getId());
        map.put("routeId", stop.getRoute().getId());
        map.put("routeTitle", stop.getRoute().getTitle());
        map.put("pickupPointId", stop.getPickupPoint().getId());
        map.put("pickupPoint", stop.getPickupPoint().getName());
        map.put("distance", stop.getDistance());
        map.put("pickupTime", stop.getPickupTime() == null ? "" : stop.getPickupTime().toString());
        map.put("monthlyFees", stop.getMonthlyFees());
        return map;
    }

    private Map<String, Object> feeMonthMap(TransportFeeMonth month) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", month.getId());
        map.put("monthName", month.getMonthName());
        map.put("monthIndex", month.getMonthIndex());
        map.put("dueDate", month.getDueDate() == null ? "" : month.getDueDate().toString());
        map.put("fineType", month.getFineType() == null ? "NONE" : month.getFineType().name());
        map.put("percentage", month.getPercentage());
        map.put("fixedAmount", month.getFixedAmount());
        return map;
    }

    private void saveRoute(String title) {
        TransportRoute route = TransportRoute.builder().title(title).build();
        route.setIsActive(true);
        routeRepository.save(route);
    }

    private void savePickup(String name, String latitude, String longitude) {
        TransportPickupPoint point = TransportPickupPoint.builder()
                .name(name)
                .latitude(latitude)
                .longitude(longitude)
                .build();
        point.setIsActive(true);
        pickupPointRepository.save(point);
    }

    private String studentName(StudentAdmission student) {
        String first = student.getFirstName() == null ? "" : student.getFirstName();
        String last = student.getLastName() == null ? "" : student.getLastName();
        return (first + " " + last).trim();
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private Long asLong(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Integer asInteger(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        try {
            return Integer.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private BigDecimal asDecimal(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDate asDate(Object value) {
        String text = text(value);
        if (text.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(text, ISO);
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalDate.parse(text, US);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private LocalTime asTime(Object value) {
        String text = text(value);
        if (text.isBlank()) {
            return null;
        }
        try {
            return LocalTime.parse(text);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private TransportFeeMonth.FineType asFineType(Object value) {
        String text = text(value).toUpperCase(Locale.ROOT);
        if ("PERCENTAGE".equals(text)) {
            return TransportFeeMonth.FineType.PERCENTAGE;
        }
        if ("FIX".equals(text) || "FIXED".equals(text)) {
            return TransportFeeMonth.FineType.FIX;
        }
        return TransportFeeMonth.FineType.NONE;
    }

    private List<Long> asLongList(Object value) {
        List<Long> ids = new ArrayList<>();
        if (value instanceof Collection<?> collection) {
            for (Object item : collection) {
                Long id = asLong(item);
                if (id != null) {
                    ids.add(id);
                }
            }
        }
        return ids;
    }

    private List<String> asStringList(Object value) {
        List<String> values = new ArrayList<>();
        if (value instanceof Collection<?> collection) {
            for (Object item : collection) {
                String text = text(item);
                if (!text.isBlank()) {
                    values.add(text);
                }
            }
        }
        return values;
    }
}
