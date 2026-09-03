package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "library_members")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryMember extends BaseEntity {

    @Column(name = "library_card_no", nullable = false, unique = true, length = 50)
    private String libraryCardNo;

    @Column(name = "member_type", nullable = false, length = 30)
    @Builder.Default
    private String memberType = "Student";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_admission_id", unique = true)
    private StudentAdmission studentAdmission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_member_id", unique = true)
    private StaffMember staffMember;
}
