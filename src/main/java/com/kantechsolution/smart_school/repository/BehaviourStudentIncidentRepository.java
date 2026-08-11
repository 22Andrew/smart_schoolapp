package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.BehaviourStudentIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface BehaviourStudentIncidentRepository extends JpaRepository<BehaviourStudentIncident, Long> {

    List<BehaviourStudentIncident> findByStudentAdmissionIdOrderByIncidentDateDescIdDesc(Long studentAdmissionId);

    @Query("select i.studentAdmissionId, coalesce(sum(i.points), 0) from BehaviourStudentIncident i "
            + "where i.studentAdmissionId in :ids group by i.studentAdmissionId")
    List<Object[]> sumPointsByStudentIds(@Param("ids") Collection<Long> ids);

    @Query("select i.studentAdmissionId, count(i), coalesce(sum(i.points), 0) from BehaviourStudentIncident i "
            + "where i.studentAdmissionId in :ids group by i.studentAdmissionId")
    List<Object[]> countAndSumPointsByStudentIds(@Param("ids") Collection<Long> ids);
}
