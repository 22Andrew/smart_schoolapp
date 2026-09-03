package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.Library;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LibraryRepository extends JpaRepository<Library, Long> {

    List<Library> findAllByOrderByIdDesc();
}
