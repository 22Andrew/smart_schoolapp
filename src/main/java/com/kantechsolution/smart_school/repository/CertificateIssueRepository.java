package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CertificateIssue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CertificateIssueRepository extends JpaRepository<CertificateIssue, Long> {
    List<CertificateIssue> findByIssueTypeOrderByIdDesc(String issueType);

    List<CertificateIssue> findByIssueTypeAndStudent_IdInOrderByIdDesc(String issueType, Collection<Long> studentIds);

    Optional<CertificateIssue> findByDocumentNumberIgnoreCase(String documentNumber);

    long countByIssueType(String issueType);
}
