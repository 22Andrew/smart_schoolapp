package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.DownloadContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DownloadContentRepository extends JpaRepository<DownloadContent, Long> {
    List<DownloadContent> findAllByOrderByCreatedAtDesc();
}
