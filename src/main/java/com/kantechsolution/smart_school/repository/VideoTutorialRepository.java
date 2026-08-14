package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.VideoTutorial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoTutorialRepository extends JpaRepository<VideoTutorial, Long> {
    List<VideoTutorial> findAllByOrderByCreatedAtDesc();
}
