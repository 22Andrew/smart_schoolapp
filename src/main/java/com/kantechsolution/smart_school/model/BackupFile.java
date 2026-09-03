package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "backup_file")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupFile extends BaseEntity {

    @Column(name = "file_name", nullable = false, unique = true, length = 255)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;
}
