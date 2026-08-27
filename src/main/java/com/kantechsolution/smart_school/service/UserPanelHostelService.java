package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.HostelRoom;
import com.kantechsolution.smart_school.repository.HostelRoomRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class UserPanelHostelService {

    private final HostelRoomRepository hostelRoomRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;

    public UserPanelHostelService(HostelRoomRepository hostelRoomRepository,
                                  StudentAdmissionRepository studentAdmissionRepository) {
        this.hostelRoomRepository = hostelRoomRepository;
        this.studentAdmissionRepository = studentAdmissionRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listHostelRooms(Authentication authentication) {
        List<HostelRoom> rooms = new ArrayList<>(hostelRoomRepository.findAllByOrderByIdDesc());
        rooms.sort(Comparator
                .comparing((HostelRoom room) -> room.getHostel() != null
                        ? text(room.getHostel().getHostelName()) : "")
                .thenComparing(room -> text(room.getRoomNumber())));

        List<Map<String, Object>> rows = new ArrayList<>();
        for (HostelRoom room : rooms) {
            rows.add(toRow(room));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("rows", rows);
        return response;
    }

    private Map<String, Object> toRow(HostelRoom room) {
        boolean assigned = studentAdmissionRepository.existsByHostelRoom_Id(room.getId());
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", room.getId());
        row.put("hostel", room.getHostel() != null ? text(room.getHostel().getHostelName()) : "");
        row.put("roomType", room.getRoomType() != null ? text(room.getRoomType().getRoomType()) : "");
        row.put("roomNumber", text(room.getRoomNumber()));
        row.put("numberOfBed", room.getNumberOfBed() != null ? room.getNumberOfBed() : 0);
        row.put("status", assigned ? "Assigned" : "");
        row.put("costPerBed", room.getCostPerBed());
        row.put("costPerBedDisplay", formatPrice(room.getCostPerBed()));
        return row;
    }

    private String formatPrice(BigDecimal price) {
        if (price == null) {
            return "";
        }
        NumberFormat formatter = NumberFormat.getCurrencyInstance(Locale.US);
        formatter.setRoundingMode(RoundingMode.HALF_UP);
        return formatter.format(price);
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }
}
