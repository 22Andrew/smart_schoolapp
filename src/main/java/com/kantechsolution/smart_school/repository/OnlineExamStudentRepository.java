package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineExamStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OnlineExamStudentRepository extends JpaRepository<OnlineExamStudent, Long> {

    List<OnlineExamStudent> findByOnlineExamId(Long onlineExamId);

    List<OnlineExamStudent> findByStudentAdmissionId(Long studentAdmissionId);

    void deleteByOnlineExamId(Long onlineExamId);

    boolean existsByOnlineExamIdAndStudentAdmissionId(Long onlineExamId, Long studentAdmissionId);
}
