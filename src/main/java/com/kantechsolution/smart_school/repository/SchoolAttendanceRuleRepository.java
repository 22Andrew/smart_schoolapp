package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.SchoolAttendanceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface SchoolAttendanceRuleRepository extends JpaRepository<SchoolAttendanceRule, Long> {

    List<SchoolAttendanceRule> findByAudienceAndClassIdOrderByRoleNameAscRuleTypeAsc(String audience, Long classId);

    List<SchoolAttendanceRule> findByAudienceAndClassIdOrderBySectionAscRuleTypeAsc(String audience, Long classId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("DELETE FROM SchoolAttendanceRule r WHERE r.audience = :audience AND r.roleName = :roleName AND r.classId = :classId")
    void deleteStaffRules(@Param("audience") String audience,
                          @Param("roleName") String roleName,
                          @Param("classId") Long classId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("DELETE FROM SchoolAttendanceRule r WHERE r.audience = :audience AND r.classId = :classId")
    void deleteByAudienceAndClassId(@Param("audience") String audience, @Param("classId") Long classId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE SchoolAttendanceRule r SET r.classId = 0 WHERE r.classId IS NULL")
    int normalizeNullClassIds();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE SchoolAttendanceRule r SET r.section = '' WHERE r.section IS NULL")
    int normalizeNullSections();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("DELETE FROM SchoolAttendanceRule r WHERE r.audience = 'student' AND r.roleName = 'Student'")
    void deleteLegacyStudentRules();
}
