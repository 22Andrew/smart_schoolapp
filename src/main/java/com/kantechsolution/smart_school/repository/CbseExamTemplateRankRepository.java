package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseExamTemplateRank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CbseExamTemplateRankRepository extends JpaRepository<CbseExamTemplateRank, Long> {

    List<CbseExamTemplateRank> findByTemplateIdOrderByRankValueAscIdAsc(Long templateId);

    void deleteByTemplateId(Long templateId);
}
