package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AdmissionEnquiryFollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdmissionEnquiryFollowUpRepository extends JpaRepository<AdmissionEnquiryFollowUp, Long> {

    List<AdmissionEnquiryFollowUp> findByEnquiryIdOrderByFollowUpDateDescCreatedAtDesc(Long enquiryId);
}
