package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.GmeetLiveMeeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GmeetLiveMeetingRepository extends JpaRepository<GmeetLiveMeeting, Long> {
    List<GmeetLiveMeeting> findAllByOrderByMeetingDateTimeDescIdDesc();
}
