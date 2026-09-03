package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Keeps demo staff directory records aligned with demo login accounts.
 */
@Service
@RequiredArgsConstructor
@Order(8)
public class DemoStaffLoginSyncService implements ApplicationRunner {

    private static final String RECEPTIONIST_LOGIN_EMAIL = "receptionist@gmail.com";
    private static final String RECEPTIONIST_STAFF_ID = "9006";

    private final StaffMemberRepository staffMemberRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        syncReceptionistLogin();
    }

    private void syncReceptionistLogin() {
        StaffMember target = resolveReceptionistStaffMember()
                .orElseGet(this::createReceptionistStaffMember);

        releaseConflictingEmail(target);
        applyReceptionistProfile(target);
        staffMemberRepository.save(target);
    }

    private Optional<StaffMember> resolveReceptionistStaffMember() {
        Optional<StaffMember> byStaffId = staffMemberRepository.findByStaffId(RECEPTIONIST_STAFF_ID);
        if (byStaffId.isPresent()) {
            return byStaffId;
        }

        Optional<StaffMember> byLoginEmail = staffMemberRepository.findByEmail(RECEPTIONIST_LOGIN_EMAIL);
        if (byLoginEmail.isPresent()) {
            return byLoginEmail;
        }

        List<StaffMember> receptionists = staffMemberRepository.search("Receptionist", null);
        if (receptionists.size() == 1) {
            return Optional.of(receptionists.get(0));
        }

        return receptionists.stream()
                .filter(member -> "Receptionist".equalsIgnoreCase(member.getFirstName())
                        && "User".equalsIgnoreCase(member.getLastName()))
                .findFirst()
                .or(() -> receptionists.stream().findFirst());
    }

    private void releaseConflictingEmail(StaffMember target) {
        staffMemberRepository.findByEmail(RECEPTIONIST_LOGIN_EMAIL).ifPresent(existing -> {
            if (!existing.getId().equals(target.getId())) {
                existing.setEmail("legacy.receptionist." + existing.getId() + "@school.com");
                staffMemberRepository.save(existing);
            }
        });
    }

    private void applyReceptionistProfile(StaffMember member) {
        member.setStaffId(RECEPTIONIST_STAFF_ID);
        member.setEmail(RECEPTIONIST_LOGIN_EMAIL);
        member.setFirstName("Receptionist");
        member.setLastName("User");
        member.setRoles("Receptionist");
        member.setDesignation("Receptionist");
        member.setDepartment("Reception");
        member.setGender("Female");
        member.setPhone("9876543216");
        member.setLocation("Ground Floor, Reception");
        member.setPanNumber("ABCDE1240F");
        member.setDisabled(false);
        if (member.getDateOfJoining() == null) {
            member.setDateOfJoining(LocalDate.of(2020, 6, 1));
        }
    }

    private StaffMember createReceptionistStaffMember() {
        StaffMember member = StaffMember.builder()
                .staffId(RECEPTIONIST_STAFF_ID)
                .roles("Receptionist")
                .designation("Receptionist")
                .department("Reception")
                .firstName("Receptionist")
                .lastName("User")
                .email(RECEPTIONIST_LOGIN_EMAIL)
                .gender("Female")
                .phone("9876543216")
                .location("Ground Floor, Reception")
                .panNumber("ABCDE1240F")
                .dateOfJoining(LocalDate.of(2020, 6, 1))
                .disabled(false)
                .build();
        member.setIsActive(true);
        return member;
    }
}
