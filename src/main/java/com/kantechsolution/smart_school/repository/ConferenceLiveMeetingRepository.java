package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ConferenceLiveMeeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConferenceLiveMeetingRepository extends JpaRepository<ConferenceLiveMeeting, Long> {
    List<ConferenceLiveMeeting> findAllByOrderByMeetingDateTimeDescIdDesc();
}
