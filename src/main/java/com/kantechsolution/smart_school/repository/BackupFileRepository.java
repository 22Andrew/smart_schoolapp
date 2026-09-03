package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.BackupFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BackupFileRepository extends JpaRepository<BackupFile, Long> {

    List<BackupFile> findAllByOrderByCreatedAtDesc();

    Optional<BackupFile> findByFileName(String fileName);

    boolean existsByFileName(String fileName);
}
