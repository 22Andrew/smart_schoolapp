package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FeeReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeReminderRepository extends JpaRepository<FeeReminder, Long> {
    List<FeeReminder> findAllByOrderBySortOrderAscIdAsc();
}
