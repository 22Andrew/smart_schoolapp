package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.MultiBranchOverview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MultiBranchOverviewRepository extends JpaRepository<MultiBranchOverview, Long> {

    List<MultiBranchOverview> findBySectionTypeOrderByDisplayOrderAscIdAsc(String sectionType);
}
