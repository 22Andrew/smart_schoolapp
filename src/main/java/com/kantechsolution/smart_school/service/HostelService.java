package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Hostel;
import com.kantechsolution.smart_school.repository.HostelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class HostelService {

    private static final Set<String> ALLOWED_TYPES = Set.of("Boys", "Girls", "Combine");

    @Autowired
    private HostelRepository hostelRepository;

    public List<Hostel> getAllHostels() {
        return hostelRepository.findAllByOrderByIdDesc();
    }

    public Optional<Hostel> getHostelById(Long id) {
        return hostelRepository.findById(id);
    }

    @Transactional
    public Hostel createHostel(String hostelName, String type, String address, String intake, String description) {
        Hostel hostel = new Hostel();
        applyFields(hostel, hostelName, type, address, intake, description, null);
        return hostelRepository.save(hostel);
    }

    @Transactional
    public Hostel updateHostel(Long id, String hostelName, String type, String address, String intake, String description) {
        Hostel existing = hostelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hostel not found"));
        applyFields(existing, hostelName, type, address, intake, description, id);
        return hostelRepository.save(existing);
    }

    @Transactional
    public void deleteHostel(Long id) {
        if (!hostelRepository.existsById(id)) {
            throw new IllegalArgumentException("Hostel not found");
        }
        hostelRepository.deleteById(id);
    }

    private void applyFields(Hostel hostel, String hostelName, String type, String address,
                             String intake, String description, Long currentId) {
        String name = hostelName == null ? "" : hostelName.trim();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Hostel name is required");
        }

        String rawType = type == null ? "" : type.trim();
        if (rawType.isEmpty()) {
            throw new IllegalArgumentException("Type is required");
        }
        // Accept common variants
        final String normalizedType = "Combined".equalsIgnoreCase(rawType) ? "Combine" : rawType;
        String matchedType = ALLOWED_TYPES.stream()
                .filter(t -> t.equalsIgnoreCase(normalizedType))
                .findFirst()
                .orElse(null);
        if (matchedType == null) {
            throw new IllegalArgumentException("Type must be Boys, Girls, or Combine");
        }

        Optional<Hostel> duplicate = hostelRepository.findByHostelNameIgnoreCase(name);
        if (duplicate.isPresent() && (currentId == null || !duplicate.get().getId().equals(currentId))) {
            throw new IllegalArgumentException("Hostel name already exists");
        }

        Integer intakeValue = null;
        if (intake != null && !intake.trim().isEmpty()) {
            try {
                intakeValue = Integer.valueOf(intake.trim());
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Intake must be a valid number");
            }
            if (intakeValue < 0) {
                throw new IllegalArgumentException("Intake cannot be negative");
            }
        }

        hostel.setHostelName(name);
        hostel.setType(matchedType);
        hostel.setAddress(address == null ? "" : address.trim());
        hostel.setIntake(intakeValue);
        hostel.setDescription(description == null ? "" : description.trim());
    }
}
