package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_general_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolGeneralSetting extends BaseEntity {

    @Column(name = "school_name", nullable = false, length = 200)
    private String schoolName;

    @Column(name = "school_code", length = 50)
    private String schoolCode;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(nullable = false, length = 20)
    private String session;

    @Column(name = "session_start_month", nullable = false, length = 20)
    private String sessionStartMonth;

    @Column(name = "date_format", nullable = false, length = 30)
    private String dateFormat;

    @Column(nullable = false, length = 100)
    private String timezone;

    @Column(name = "start_day_of_week", nullable = false, length = 20)
    private String startDayOfWeek;

    @Column(name = "currency_format", nullable = false, length = 50)
    private String currencyFormat;

    @Column(name = "base_url", nullable = false, length = 300)
    private String baseUrl;

    @Column(name = "file_upload_path", nullable = false, length = 500)
    private String fileUploadPath;
}
