package com.kantechsolution.smart_school.student;

import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.HostelRepository;
import com.kantechsolution.smart_school.repository.HostelRoomRepository;
import com.kantechsolution.smart_school.repository.SchoolClassRepository;
import com.kantechsolution.smart_school.repository.SchoolHouseRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import com.kantechsolution.smart_school.repository.StudentCategoryRepository;
import com.kantechsolution.smart_school.repository.StudentClassAssignmentRepository;
import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.service.SchoolIdAutoGenerationSettingService;
import com.kantechsolution.smart_school.service.StudentAdmissionService;
import com.kantechsolution.smart_school.service.StudentSiblingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentAdmissionServiceTest {

    @Mock
    private StudentAdmissionRepository studentAdmissionRepository;

    @Mock
    private SchoolClassRepository schoolClassRepository;

    @Mock
    private StudentCategoryRepository studentCategoryRepository;

    @Mock
    private SchoolHouseRepository schoolHouseRepository;

    @Mock
    private UploadStorage uploadStorage;

    @Mock
    private HostelRepository hostelRepository;

    @Mock
    private HostelRoomRepository hostelRoomRepository;

    @Mock
    private StudentClassAssignmentRepository studentClassAssignmentRepository;

    @Mock
    private SchoolIdAutoGenerationSettingService idAutoGenerationSettingService;

    @Mock
    private StudentSiblingService studentSiblingService;

    @InjectMocks
    private StudentAdmissionService studentAdmissionService;

    @Test
    void getByIdReturnsEmptyWhenMissing() {
        when(studentAdmissionRepository.findById(999L)).thenReturn(Optional.empty());

        assertTrue(studentAdmissionService.getById(999L).isEmpty());
    }

    @Test
    void disableStudentRequiresReason() {
        when(studentAdmissionRepository.findById(1L)).thenReturn(Optional.of(new StudentAdmission()));

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> studentAdmissionService.setDisabledStatus(1L, true, "  "));

        assertEquals("Disable reason is required", error.getMessage());
    }
}
