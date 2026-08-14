package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.NoticeBoard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeBoardRepository extends JpaRepository<NoticeBoard, Long> {
    List<NoticeBoard> findAllByOrderByNoticeDateDescCreatedAtDesc();
}
