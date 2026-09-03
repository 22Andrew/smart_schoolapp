package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OnlineExamQuestionRepository extends JpaRepository<OnlineExamQuestion, Long> {

    List<OnlineExamQuestion> findByOnlineExamIdOrderByIdAsc(Long onlineExamId);

    Optional<OnlineExamQuestion> findByOnlineExamIdAndQuestionId(Long onlineExamId, Long questionId);

    void deleteByOnlineExamIdAndQuestionId(Long onlineExamId, Long questionId);

    long countByOnlineExamId(Long onlineExamId);

    long countByOnlineExamIdAndQuestionIdIn(Long onlineExamId, List<Long> questionIds);
}
