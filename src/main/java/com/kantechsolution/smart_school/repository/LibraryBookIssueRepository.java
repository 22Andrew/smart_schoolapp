package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.LibraryBookIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LibraryBookIssueRepository extends JpaRepository<LibraryBookIssue, Long> {

    List<LibraryBookIssue> findByMember_IdOrderByIdDesc(Long memberId);

    @Query("""
            SELECT i FROM LibraryBookIssue i
            JOIN FETCH i.book
            JOIN FETCH i.member m
            LEFT JOIN FETCH m.studentAdmission
            LEFT JOIN FETCH m.staffMember
            WHERE i.isActive = true
            ORDER BY i.issueDate DESC, i.id DESC
            """)
    List<LibraryBookIssue> findAllActiveWithDetails();

    @Query("SELECT i FROM LibraryBookIssue i JOIN FETCH i.book WHERE i.member.id = :memberId ORDER BY i.id DESC")
    List<LibraryBookIssue> findIssuedWithBook(@Param("memberId") Long memberId);
}
