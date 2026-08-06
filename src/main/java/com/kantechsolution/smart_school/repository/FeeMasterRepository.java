package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FeeMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeMasterRepository extends JpaRepository<FeeMaster, Long> {
    List<FeeMaster> findAllByOrderByIdAsc();

    List<FeeMaster> findBySessionYearOrderByIdAsc(String sessionYear);

    List<FeeMaster> findByFeeGroupIdOrderByIdAsc(Long feeGroupId);

    boolean existsByFeeGroupIdAndFeeTypeIdAndSessionYear(Long feeGroupId, Long feeTypeId, String sessionYear);

    void deleteByFeeGroupIdAndSessionYear(Long feeGroupId, String sessionYear);
}
