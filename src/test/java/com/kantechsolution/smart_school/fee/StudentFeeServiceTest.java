package com.kantechsolution.smart_school.fee;

import com.kantechsolution.smart_school.repository.FeeGroupAssignmentRepository;
import com.kantechsolution.smart_school.repository.FeeMasterRepository;
import com.kantechsolution.smart_school.repository.FeePaymentRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import com.kantechsolution.smart_school.service.StudentFeeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentFeeServiceTest {

    @Mock
    private StudentAdmissionRepository studentAdmissionRepository;

    @Mock
    private FeeGroupAssignmentRepository assignmentRepository;

    @Mock
    private FeeMasterRepository feeMasterRepository;

    @Mock
    private FeePaymentRepository feePaymentRepository;

    @InjectMocks
    private StudentFeeService studentFeeService;

    @Test
    void searchPaymentsRequiresPaymentId() {
        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> studentFeeService.searchPayments("  "));

        assertEquals("Payment ID is required", error.getMessage());
        verify(feePaymentRepository, never()).findByPaymentRefContainingIgnoreCaseOrderByIdDesc("  ");
    }

    @Test
    void getStudentFeePageRequiresExistingStudent() {
        when(studentAdmissionRepository.findById(999_999L)).thenReturn(Optional.empty());

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> studentFeeService.getStudentFeePage(999_999L, null));

        assertEquals("Student not found", error.getMessage());
    }
}
