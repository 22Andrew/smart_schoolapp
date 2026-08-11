package com.kantechsolution.smart_school.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PrintMarksheetService {

    private final PrintAdmitCardService printAdmitCardService;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchStudents(Long groupId,
                                                    Long examId,
                                                    String sessionYear,
                                                    Long classId,
                                                    String section,
                                                    Long templateId) {
        if (templateId == null) {
            throw new IllegalArgumentException("Marksheet template is required");
        }
        return printAdmitCardService.searchStudents(groupId, examId, sessionYear, classId, section);
    }
}
