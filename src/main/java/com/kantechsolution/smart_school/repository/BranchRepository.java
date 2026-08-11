package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {

    List<Branch> findAllByOrderByIdAsc();
}
