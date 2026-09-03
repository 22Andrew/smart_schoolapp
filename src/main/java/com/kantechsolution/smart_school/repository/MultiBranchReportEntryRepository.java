package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.MultiBranchReportEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MultiBranchReportEntryRepository extends JpaRepository<MultiBranchReportEntry, Long> {

    List<MultiBranchReportEntry> findByReportTypeAndReportDateOrderByIdAsc(String reportType, LocalDate reportDate);

    long countByReportTypeAndReportDate(String reportType, LocalDate reportDate);

    @Query("""
            SELECT COALESCE(SUM(COALESCE(e.adjustment, 0) + COALESCE(e.amount, 0)), 0)
            FROM MultiBranchReportEntry e
            WHERE e.reportType = :reportType AND e.reportDate = :reportDate
            """)
    Double sumTotalByReportTypeAndReportDate(
            @Param("reportType") String reportType,
            @Param("reportDate") LocalDate reportDate);

    @Query("""
            SELECT e.reportDate, COUNT(e), COALESCE(SUM(COALESCE(e.adjustment, 0) + COALESCE(e.amount, 0)), 0)
            FROM MultiBranchReportEntry e
            WHERE e.reportType = :reportType
              AND e.reportDate BETWEEN :dateFrom AND :dateTo
            GROUP BY e.reportDate
            """)
    List<Object[]> aggregateByReportTypeAndDateRange(
            @Param("reportType") String reportType,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo);
}
