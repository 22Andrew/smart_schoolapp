package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FrontCmsGallery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FrontCmsGalleryRepository extends JpaRepository<FrontCmsGallery, Long> {
    List<FrontCmsGallery> findAllByOrderByIdDesc();
}
