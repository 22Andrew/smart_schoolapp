-- Smart School database backup
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `academic_sessions`;
CREATE TABLE `academic_sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `is_current` bit(1) NOT NULL,
  `session_name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKgojgud9p3015pvgj202tkss8r` (`session_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `academic_sessions` VALUES (1,'2026-08-11 15:09:42',1,'2026-08-13 14:31:12',1,'2025-26');
INSERT INTO `academic_sessions` VALUES (2,'2026-08-11 15:09:43',1,'2026-08-13 14:31:03',0,'2024-25');
INSERT INTO `academic_sessions` VALUES (3,'2026-08-11 15:09:43',1,'2026-08-13 14:31:13',0,'2023-24');
INSERT INTO `academic_sessions` VALUES (4,'2026-08-11 15:09:43',1,'2026-08-11 15:09:43',0,'2022-23');
INSERT INTO `academic_sessions` VALUES (5,'2026-08-13 14:32:14',1,'2026-08-13 14:32:14',0,'2026-27');
INSERT INTO `academic_sessions` VALUES (6,'2026-08-13 18:02:32',1,'2026-08-13 18:02:32',0,'2027-28');

DROP TABLE IF EXISTS `academic_years`;
CREATE TABLE `academic_years` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `end_date` date NOT NULL,
  `is_current` bit(1) DEFAULT NULL,
  `start_date` date NOT NULL,
  `year` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKhoxaidjaabmvfm0ugpwi40mjm` (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `admission_enquiries`;
CREATE TABLE `admission_enquiries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `assigned` varchar(100) DEFAULT NULL,
  `child_count` int DEFAULT NULL,
  `class_name` varchar(50) DEFAULT NULL,
  `enquiry_date` date NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `follow_up_date` date NOT NULL,
  `name` varchar(100) NOT NULL,
  `note` varchar(500) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `source` varchar(100) NOT NULL,
  `status` varchar(20) NOT NULL,
  `last_follow_up_date` date DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `admission_enquiries` VALUES (2,'2026-02-02 16:31:21',1,'2026-02-02 16:55:06','12 Yoni Campus','admin1',2,'1','2026-02-02','Admission','parent1@gmail.com','2026-02-05','Enquiry','Enquiry','+23276806789',NULL,'advertisement','ACTIVE','2026-02-04',NULL);
INSERT INTO `admission_enquiries` VALUES (3,'2026-02-02 16:44:49',1,'2026-02-02 16:49:59','10 Koya Street Makeni','admin1',2,'2','2026-02-02','Admission','alhajimohamedkanu@gmail.com','2026-02-11','Alhaji Mohamed Kanu','testing','077150549','Partner School','frontoffice','INACTIVE',NULL,NULL);
INSERT INTO `admission_enquiries` VALUES (4,'2026-06-02 08:51:19',1,'2026-06-02 08:51:19','10 Koya Street Makeni ','admin1',1,'1','2026-06-02','Admission ','hawamariatu@gmail.com','2026-06-09','Hawa Mariatu Kanu','Enquiry','+23277150549','Staff','advertisement','ACTIVE',NULL,NULL);
INSERT INTO `admission_enquiries` VALUES (5,'2026-06-02 13:07:42',1,'2026-08-17 12:42:56','10 Koya Street Makeni','admin1',2,'5','2026-06-02','Admission','alhajimohamedkanu@gmail.com','2026-06-02','Alhaji Mohamed Kanu','Enquiry','077150549','Parent','google','INACTIVE','2026-08-17',NULL);

DROP TABLE IF EXISTS `admission_enquiry_follow_ups`;
CREATE TABLE `admission_enquiry_follow_ups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `enquiry_id` bigint NOT NULL,
  `follow_up_date` date NOT NULL,
  `next_follow_up_date` date NOT NULL,
  `note` varchar(2000) DEFAULT NULL,
  `response` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `admission_enquiry_follow_ups` VALUES (1,'2026-08-17 12:42:55',1,'2026-08-17 12:42:55','Joe Black (9000)',5,'2026-08-17','2026-06-02','','Testing the Phone call functionality');
INSERT INTO `admission_enquiry_follow_ups` VALUES (2,'2026-08-17 12:43:10',1,'2026-08-17 12:43:10','Joe Black (9000)',5,'2026-08-17','2026-06-02','','Testing the Phone call functionality');
INSERT INTO `admission_enquiry_follow_ups` VALUES (3,'2026-08-17 12:43:28',1,'2026-08-17 12:43:28','Joe Black (9000)',5,'2026-08-17','2026-06-02','','Testing the Phone call functionality');

DROP TABLE IF EXISTS `admit_card_templates`;
CREATE TABLE `admit_card_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `background_image` varchar(500) DEFAULT NULL,
  `is_default` bit(1) DEFAULT NULL,
  `exam_center` varchar(200) DEFAULT NULL,
  `exam_name` varchar(200) DEFAULT NULL,
  `footer_text` varchar(500) DEFAULT NULL,
  `heading` varchar(200) DEFAULT NULL,
  `left_logo` varchar(500) DEFAULT NULL,
  `right_logo` varchar(500) DEFAULT NULL,
  `school_name` varchar(200) DEFAULT NULL,
  `show_address` bit(1) DEFAULT NULL,
  `show_admission_no` bit(1) DEFAULT NULL,
  `show_class` bit(1) DEFAULT NULL,
  `show_dob` bit(1) DEFAULT NULL,
  `show_father_name` bit(1) DEFAULT NULL,
  `show_gender` bit(1) DEFAULT NULL,
  `show_mother_name` bit(1) DEFAULT NULL,
  `show_name` bit(1) DEFAULT NULL,
  `show_photo` bit(1) DEFAULT NULL,
  `show_roll_number` bit(1) DEFAULT NULL,
  `show_section` bit(1) DEFAULT NULL,
  `sign_image` varchar(500) DEFAULT NULL,
  `template_name` varchar(200) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `admit_card_templates` VALUES (1,'2026-08-10 14:56:58',1,'2026-08-10 15:24:16',NULL,0,'Main Campus','Half Yearly Test','Best of luck!','Admit Card',NULL,NULL,'Smart School',0,1,1,1,1,1,0,1,1,1,1,NULL,'Sample Admit Card','Annual Examination');
INSERT INTO `admit_card_templates` VALUES (2,'2026-08-10 14:56:58',1,'2026-08-10 14:56:58',NULL,0,'Main Campus','Term Examination','Carry this admit card to the exam hall.','Admit Card',NULL,NULL,'Smart School',1,1,1,1,1,1,1,1,1,1,1,NULL,'Admit Card','Half Yearly Examination');
INSERT INTO `admit_card_templates` VALUES (3,'2026-08-10 14:56:58',1,'2026-08-10 14:56:58',NULL,0,'Block A','Monthly Test','Report 30 minutes before exam time.','Exam Card',NULL,NULL,'Smart School',0,1,1,1,1,1,0,1,1,1,1,NULL,'exam card','Unit Test');
INSERT INTO `admit_card_templates` VALUES (4,'2026-08-10 15:08:38',1,'2026-08-10 15:25:04','/uploads/admitcards/d1ff0148-cf2f-455d-b8d3-5490277b1598.png',0,'Makeni','Term Name','','Transportation Pass Card','/uploads/admitcards/65ab7c3f-20ab-493c-8286-ccf5b22bf1d1.png',NULL,'Saint Francis',0,1,1,1,1,1,0,1,1,1,1,NULL,'Transportation','Transportation Pass Card');

DROP TABLE IF EXISTS `alumni_events`;
CREATE TABLE `alumni_events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `class_id` bigint DEFAULT NULL,
  `class_name` varchar(100) DEFAULT NULL,
  `event_for` varchar(20) NOT NULL,
  `from_date` date NOT NULL,
  `note` text,
  `notification_message` text,
  `notify_email` bit(1) DEFAULT NULL,
  `notify_sms` bit(1) DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `section_name` varchar(20) DEFAULT NULL,
  `session_id` bigint DEFAULT NULL,
  `session_name` varchar(20) DEFAULT NULL,
  `sms_template_id` varchar(100) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `to_date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `alumni_events` VALUES (1,'2026-08-19 15:10:53',1,'2026-08-19 15:27:27',NULL,'All','ALL','2025-12-22','The programs related to the birth of Jesus Christ are prepared and presented by the students and teachers.','The programs related to the birth of Jesus Christ are prepared and presented by the students and teachers.',0,0,NULL,NULL,NULL,NULL,NULL,'Christmas Celebration','2025-12-26');
INSERT INTO `alumni_events` VALUES (2,'2026-08-19 15:10:54',1,'2026-08-19 15:10:54',NULL,'All','ALL','2025-04-01',NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'New Academic admission start (2025-26)','2025-04-15');
INSERT INTO `alumni_events` VALUES (3,'2026-08-19 15:10:54',1,'2026-08-19 15:10:54',NULL,'All','ALL','2024-10-14',NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'Government scholarship exam, 2024','2024-10-20');
INSERT INTO `alumni_events` VALUES (4,'2026-08-19 15:29:42',1,'2026-08-19 15:29:42',NULL,'All','ALL','2026-08-28','Testing','Testing message Notification',1,1,'/uploads/alumni/events/08d31052f2424a2081b668766622a95e.png',NULL,NULL,NULL,'','End of year Celebration','2026-08-28');

DROP TABLE IF EXISTS `alumni_students`;
CREATE TABLE `alumni_students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `admission_number` varchar(50) NOT NULL,
  `class_id` bigint DEFAULT NULL,
  `class_name` varchar(100) DEFAULT NULL,
  `current_email` varchar(150) DEFAULT NULL,
  `current_phone` varchar(30) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `occupation` varchar(150) DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `section_name` varchar(20) DEFAULT NULL,
  `session_id` bigint DEFAULT NULL,
  `session_name` varchar(20) DEFAULT NULL,
  `student_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `alumni_students` VALUES (1,'2026-08-19 14:47:02',1,'2026-08-19 14:47:02','Mr Road 40, Delhi','7663',2,'Class 1','paul22@gmail.com','890879789','Male','pg',NULL,'BLUE',2,'2024-25','Paul S. Bealer');

DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `announcement_type` enum('ACADEMIC','CULTURAL','EMERGENCY','EVENT','EXAMINATION','GENERAL','HOLIDAY','SPORTS') DEFAULT NULL,
  `attachment_url` varchar(500) DEFAULT NULL,
  `content` varchar(5000) NOT NULL,
  `expiry_date` datetime(6) DEFAULT NULL,
  `is_published` bit(1) DEFAULT NULL,
  `priority` enum('HIGH','LOW','NORMAL','URGENT') DEFAULT NULL,
  `publish_date` datetime(6) NOT NULL,
  `target_audience` enum('ALL','PARENTS','SPECIFIC_GRADE','STAFF','STUDENTS','TEACHERS') DEFAULT NULL,
  `title` varchar(300) NOT NULL,
  `created_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKht7cvemps7a8tjylacwtyyckj` (`created_by`),
  CONSTRAINT `FKht7cvemps7a8tjylacwtyyckj` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `annual_holidays`;
CREATE TABLE `annual_holidays` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `created_by_name` varchar(120) DEFAULT NULL,
  `created_by_staff_id` varchar(30) DEFAULT NULL,
  `description` varchar(500) NOT NULL,
  `from_date` date NOT NULL,
  `front_site` bit(1) NOT NULL,
  `holiday_type` varchar(50) NOT NULL,
  `to_date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `annual_holidays` VALUES (1,'2026-08-11 12:35:51',1,'2026-08-11 12:35:51','Joe Black','9000','Parent-Teacher Meeting (PTM)','2026-08-31',1,'School Events','2026-08-31');
INSERT INTO `annual_holidays` VALUES (2,'2026-08-11 12:35:51',1,'2026-08-11 12:35:51','Joe Black','9000','Ambedkar Jayanti — National Holiday','2026-06-16',1,'Holiday','2026-06-17');
INSERT INTO `annual_holidays` VALUES (3,'2026-08-11 12:35:51',1,'2026-08-11 12:35:51','Joe Black','9000','Winter Break','2026-12-24',1,'Vacation','2027-01-02');
INSERT INTO `annual_holidays` VALUES (4,'2026-08-11 12:35:51',1,'2026-08-11 12:35:51','Joe Black','9000','Science Exhibition','2026-03-15',0,'Activity','2026-03-15');
INSERT INTO `annual_holidays` VALUES (5,'2026-08-11 12:35:51',1,'2026-08-11 12:35:51','Joe Black','9000','Republic Day Celebration','2026-01-26',1,'EVENTS','2026-01-26');
INSERT INTO `annual_holidays` VALUES (6,'2026-08-11 12:41:35',1,'2026-08-11 12:41:35','Joe Black','9000','Worker Day','2026-08-03',1,'Holiday','2026-08-11');

DROP TABLE IF EXISTS `app_roles`;
CREATE TABLE `app_roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `role_type` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKfvrw9klein793jl7h2qug4a5t` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `app_roles` VALUES (1,'2026-08-21 11:46:38',1,'2026-08-21 11:46:38','Admin','System');
INSERT INTO `app_roles` VALUES (2,'2026-08-21 11:46:38',1,'2026-08-21 11:46:38','Teacher','System');
INSERT INTO `app_roles` VALUES (3,'2026-08-21 11:46:38',1,'2026-08-21 11:46:38','Accountant','System');
INSERT INTO `app_roles` VALUES (4,'2026-08-21 11:46:38',1,'2026-08-21 11:46:38','Librarian','System');
INSERT INTO `app_roles` VALUES (5,'2026-08-21 11:46:38',1,'2026-08-21 11:46:38','Receptionist','System');
INSERT INTO `app_roles` VALUES (6,'2026-08-21 11:46:38',1,'2026-08-21 11:46:38','Super Admin','System');

DROP TABLE IF EXISTS `assignment_submissions`;
CREATE TABLE `assignment_submissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `attachment_url` varchar(500) DEFAULT NULL,
  `content` varchar(2000) DEFAULT NULL,
  `feedback` varchar(1000) DEFAULT NULL,
  `graded_date` datetime(6) DEFAULT NULL,
  `marks_obtained` double DEFAULT NULL,
  `status` enum('GRADED','LATE_SUBMISSION','RESUBMISSION_REQUIRED','RETURNED','SUBMITTED') DEFAULT NULL,
  `submission_date` datetime(6) NOT NULL,
  `assignment_id` bigint NOT NULL,
  `graded_by` bigint DEFAULT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKjpaoiqlq2bm3rv52lcri47g4s` (`assignment_id`,`student_id`),
  KEY `FK9s7gdu98ubpp17yq9jfqqup9h` (`graded_by`),
  KEY `FKix5j5yhosm3rle137aqkm6wgn` (`student_id`),
  CONSTRAINT `FK9s7gdu98ubpp17yq9jfqqup9h` FOREIGN KEY (`graded_by`) REFERENCES `teachers` (`id`),
  CONSTRAINT `FKix5j5yhosm3rle137aqkm6wgn` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKm7i7ubgh7y2n6mvg8muw62oax` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `assigned_date` date NOT NULL,
  `assignment_type` enum('CLASSWORK','HOMEWORK','OTHER','PROJECT','QUIZ') DEFAULT NULL,
  `attachment_url` varchar(500) DEFAULT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `due_date` date NOT NULL,
  `title` varchar(200) NOT NULL,
  `total_marks` double DEFAULT NULL,
  `course_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6p1m72jobsvmrrn4bpj4168mg` (`course_id`),
  CONSTRAINT `FK6p1m72jobsvmrrn4bpj4168mg` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `date` date NOT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `status` enum('ABSENT','EXCUSED','HALF_DAY','LATE','PRESENT','SICK_LEAVE') NOT NULL,
  `marked_by` bigint DEFAULT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKfh0r5sfdt16udyw5quf5syvwh` (`student_id`,`date`),
  KEY `FK7k86x0jyfhe1kvte7ed7kf860` (`marked_by`),
  CONSTRAINT `FK7121lveuhtmu9wa6m90ayd5yg` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FK7k86x0jyfhe1kvte7ed7kf860` FOREIGN KEY (`marked_by`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `backup_file`;
CREATE TABLE `backup_file` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKewv8tvjc4pdovm972hxacklss` (`file_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `backup_setting`;
CREATE TABLE `backup_setting` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `cron_secret_key` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `backup_setting` VALUES (1,'2026-08-21 12:23:58',1,'2026-08-21 12:23:58','C55F4FB5C00D4BE4A2E274E8CE5B1D2E');

DROP TABLE IF EXISTS `behaviour_incidents`;
CREATE TABLE `behaviour_incidents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL DEFAULT b'1',
  `created_at` datetime(6) NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `points` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `negative_incident` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `behaviour_incidents` VALUES (1,1,'2026-08-07 18:27:21','Respect others/property.',10,'Respect others/property',0);
INSERT INTO `behaviour_incidents` VALUES (2,1,'2026-08-07 18:27:21','Smile & have a good attitude and good behaviour.',20,'Student Good Behaviour',0);
INSERT INTO `behaviour_incidents` VALUES (3,1,'2026-08-07 18:27:21','It''s important to report cases of theft on campus so that the university or school can increase security where needed. They could also consider other options to combat incidents of theft, such as lockers.',-15,'Theft',0);
INSERT INTO `behaviour_incidents` VALUES (4,1,'2026-08-07 18:27:21','Improper behaviour could be observed in a staff member or another student. If the behaviour is threatening, concerning or inappropriate, the university or school will need to monitor the individual to ensure that the behaviour is not repetitive.',-10,'Improper behaviour',0);
INSERT INTO `behaviour_incidents` VALUES (5,1,'2026-08-07 18:27:21','If students report this type of behaviour, institutions will be able to monitor the individuals involved. They can then try to resolve the situation.',-10,'Harassment and bullying',0);
INSERT INTO `behaviour_incidents` VALUES (6,1,'2026-08-07 18:54:05','bad habit for children',-18,'Gambling',1);

DROP TABLE IF EXISTS `behaviour_settings`;
CREATE TABLE `behaviour_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `parent_comment_enabled` bit(1) NOT NULL DEFAULT b'1',
  `student_comment_enabled` bit(1) NOT NULL DEFAULT b'1',
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `behaviour_settings` VALUES (1,1,1,'2026-08-07 17:26:43');

DROP TABLE IF EXISTS `behaviour_student_incidents`;
CREATE TABLE `behaviour_student_incidents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `incident_date` date DEFAULT NULL,
  `points` int NOT NULL,
  `student_admission_id` bigint NOT NULL,
  `title` varchar(200) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `assigned_by` varchar(150) DEFAULT NULL,
  `incident_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `behaviour_student_incidents` VALUES (1,'2026-08-07 18:28:51','Respect others/property.','2026-08-07',10,4,'Respect others/property.','2026-08-07 18:28:51','Joe Black (9000)',1);
INSERT INTO `behaviour_student_incidents` VALUES (2,'2026-08-07 18:28:51','Smile & have a good attitude and good behaviour.','2026-08-07',20,4,'Student Good Behaviour','2026-08-07 18:28:51','Joe Black (9000)',2);
INSERT INTO `behaviour_student_incidents` VALUES (3,'2026-08-07 18:28:51','Improper behaviour could be observed in a staff member or another student. If the behaviour is threatening, concerning or inappropriate, the university or school will need to monitor the individual to ensure that the behaviour is not repetitive.','2026-08-07',-10,4,'Improper behaviour','2026-08-07 18:28:51','Joe Black (9000)',4);
INSERT INTO `behaviour_student_incidents` VALUES (4,'2026-08-07 18:52:30','It''s important to report cases of theft on campus so that the university or school can increase security where needed. They could also consider other options to combat incidents of theft, such as lockers.','2026-08-07',-15,3,'Theft','2026-08-07 18:52:30','Joe Black (9000)',3);

DROP TABLE IF EXISTS `branches`;
CREATE TABLE `branches` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `name` varchar(200) NOT NULL,
  `url` varchar(500) NOT NULL,
  `database_name` varchar(200) DEFAULT NULL,
  `db_password` varchar(500) DEFAULT NULL,
  `db_username` varchar(200) DEFAULT NULL,
  `envato_purchase_code` varchar(200) DEFAULT NULL,
  `hostname` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `branches` VALUES (1,'2026-08-08 12:53:01','Mount Carmel School 1','https://demo.smart-school.in/branch1/',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `branches` VALUES (2,'2026-08-08 12:53:02','Mount Carmel School 2','https://demo.smart-school.in/branch2/',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `branches` VALUES (3,'2026-08-08 13:06:23','Kantech','https://Kantech/','Kantech','Kantech1','Kantech','Kantech','Kantech');

DROP TABLE IF EXISTS `cbse_admit_card_templates`;
CREATE TABLE `cbse_admit_card_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `background_image` varchar(500) DEFAULT NULL,
  `is_default` bit(1) DEFAULT NULL,
  `exam_center` varchar(200) DEFAULT NULL,
  `exam_name` varchar(200) DEFAULT NULL,
  `footer_text` varchar(500) DEFAULT NULL,
  `heading` varchar(200) DEFAULT NULL,
  `left_logo` varchar(500) DEFAULT NULL,
  `right_logo` varchar(500) DEFAULT NULL,
  `school_name` varchar(200) DEFAULT NULL,
  `show_address` bit(1) DEFAULT NULL,
  `show_admission_no` bit(1) DEFAULT NULL,
  `show_class` bit(1) DEFAULT NULL,
  `show_dob` bit(1) DEFAULT NULL,
  `show_father_name` bit(1) DEFAULT NULL,
  `show_gender` bit(1) DEFAULT NULL,
  `show_mother_name` bit(1) DEFAULT NULL,
  `show_name` bit(1) DEFAULT NULL,
  `show_photo` bit(1) DEFAULT NULL,
  `show_roll_number` bit(1) DEFAULT NULL,
  `show_section` bit(1) DEFAULT NULL,
  `sign_image` varchar(500) DEFAULT NULL,
  `template_name` varchar(200) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_admit_card_templates` VALUES (1,'2026-08-10 11:49:06',1,'2026-08-10 11:49:06',NULL,1,'Main Campus','CBSE Periodic Test','Best of luck!','Admit Card',NULL,NULL,'Smart School',0,1,1,1,1,1,0,1,1,1,1,NULL,'Sample Admit Card','Annual Examination');
INSERT INTO `cbse_admit_card_templates` VALUES (2,'2026-08-10 11:49:06',1,'2026-08-10 11:49:06',NULL,0,'Main Campus','CBSE Half Yearly','Carry this admit card to the exam hall.','Admit Card',NULL,NULL,'Smart School',1,1,1,1,1,1,1,1,1,1,1,NULL,'Admit Card','Half Yearly Examination');
INSERT INTO `cbse_admit_card_templates` VALUES (3,'2026-08-10 11:52:48',1,'2026-08-10 11:52:48','build.png',0,'','','','','AD.png','auth.png','',0,1,1,1,1,1,0,1,1,1,1,'cvb.png','Excellence Certificate Template','Excellence Certificate');

DROP TABLE IF EXISTS `cbse_exam_assessment_details`;
CREATE TABLE `cbse_exam_assessment_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `assessment_type` varchar(150) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text,
  `maximum_marks` int NOT NULL,
  `pass_percentage` int NOT NULL,
  `sort_order` int NOT NULL,
  `cbse_exam_assessment_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKstx0q7brx2a1jkh4c6hixmijm` (`cbse_exam_assessment_id`),
  CONSTRAINT `FKstx0q7brx2a1jkh4c6hixmijm` FOREIGN KEY (`cbse_exam_assessment_id`) REFERENCES `cbse_exam_assessments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_exam_assessment_details` VALUES (3,'2026-08-10 10:37:49',1,'2026-08-10 10:37:49','Theory (TH02)','TH02','Written examination',80,33,0,2);
INSERT INTO `cbse_exam_assessment_details` VALUES (4,'2026-08-10 10:37:49',1,'2026-08-10 10:37:49','Assignment (AS01)','AS01','Assignment work',20,33,1,2);
INSERT INTO `cbse_exam_assessment_details` VALUES (5,'2026-08-10 10:43:06',1,'2026-08-10 10:43:06','Assignment','ASS101','Submit in person',100,45,0,3);

DROP TABLE IF EXISTS `cbse_exam_assessments`;
CREATE TABLE `cbse_exam_assessments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `assessment_description` text,
  `assessment_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_exam_assessments` VALUES (2,'2026-08-10 10:37:49',1,'2026-08-10 10:37:49','Half yearly examination','Half Yearly');
INSERT INTO `cbse_exam_assessments` VALUES (3,'2026-08-10 10:43:06',1,'2026-08-10 10:43:06','This is the Assignment Assessment','Assignment Assessment');

DROP TABLE IF EXISTS `cbse_exam_categories`;
CREATE TABLE `cbse_exam_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `category_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKcaxx64damwkndghdmpj1r5xkn` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_exam_categories` VALUES (1,'2026-08-10 09:47:54',1,'2026-08-10 09:47:54','Main Subjects');
INSERT INTO `cbse_exam_categories` VALUES (2,'2026-08-10 09:47:54',1,'2026-08-10 09:47:54','Internal Assessment');
INSERT INTO `cbse_exam_categories` VALUES (3,'2026-08-10 09:50:54',1,'2026-08-10 09:50:54','Practial Subject');

DROP TABLE IF EXISTS `cbse_exam_grade_details`;
CREATE TABLE `cbse_exam_grade_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `grade_name` varchar(20) NOT NULL,
  `max_percentage` int NOT NULL,
  `min_percentage` int NOT NULL,
  `remark` varchar(200) DEFAULT NULL,
  `sort_order` int NOT NULL,
  `cbse_exam_grade_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKk3c0jd1s5ipa8frlb7n3ve6fn` (`cbse_exam_grade_id`),
  CONSTRAINT `FKk3c0jd1s5ipa8frlb7n3ve6fn` FOREIGN KEY (`cbse_exam_grade_id`) REFERENCES `cbse_exam_grades` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_exam_grade_details` VALUES (1,'2026-08-10 09:58:45',1,'2026-08-10 09:58:45','A+',100,90,'Excellent',0,1);
INSERT INTO `cbse_exam_grade_details` VALUES (2,'2026-08-10 09:58:45',1,'2026-08-10 09:58:45','A',90,80,'Very Good',1,1);
INSERT INTO `cbse_exam_grade_details` VALUES (3,'2026-08-10 09:58:45',1,'2026-08-10 09:58:45','B+',80,70,'Good',2,1);
INSERT INTO `cbse_exam_grade_details` VALUES (4,'2026-08-10 09:58:45',1,'2026-08-10 09:58:45','B',70,60,'Better',3,1);
INSERT INTO `cbse_exam_grade_details` VALUES (5,'2026-08-10 09:58:45',1,'2026-08-10 09:58:45','C',60,50,'Keep Hard Working',4,1);
INSERT INTO `cbse_exam_grade_details` VALUES (6,'2026-08-10 09:58:45',1,'2026-08-10 09:58:45','D',50,40,'',5,1);
INSERT INTO `cbse_exam_grade_details` VALUES (7,'2026-08-10 09:58:45',1,'2026-08-10 09:58:45','E',40,0,'',6,1);
INSERT INTO `cbse_exam_grade_details` VALUES (16,'2026-08-10 10:28:15',1,'2026-08-10 10:28:15','A+',100,90,'Excellent',0,3);
INSERT INTO `cbse_exam_grade_details` VALUES (17,'2026-08-10 10:28:15',1,'2026-08-10 10:28:15','A',89,85,'Very Good',1,3);
INSERT INTO `cbse_exam_grade_details` VALUES (18,'2026-08-10 10:28:15',1,'2026-08-10 10:28:15','B+',74,65,'Good',2,3);
INSERT INTO `cbse_exam_grade_details` VALUES (19,'2026-08-10 10:28:15',1,'2026-08-10 10:28:15','C',54,50,'Better',3,3);
INSERT INTO `cbse_exam_grade_details` VALUES (20,'2026-08-10 10:28:15',1,'2026-08-10 10:28:15','D',49,35,'Better',4,3);
INSERT INTO `cbse_exam_grade_details` VALUES (21,'2026-08-10 10:28:15',1,'2026-08-10 10:28:15','F',34,0,'Fail',5,3);

DROP TABLE IF EXISTS `cbse_exam_grades`;
CREATE TABLE `cbse_exam_grades` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` text,
  `grade_title` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_exam_grades` VALUES (1,'2026-08-10 09:58:45',1,'2026-08-10 09:58:45','Default exam grading scale','Exam Grade');
INSERT INTO `cbse_exam_grades` VALUES (3,'2026-08-10 10:21:23',1,'2026-08-10 10:28:15','Practical Grading system','Practical Exam');

DROP TABLE IF EXISTS `cbse_exam_ranks`;
CREATE TABLE `cbse_exam_ranks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `student_admission_id` bigint NOT NULL,
  `student_rank` int NOT NULL,
  `cbse_exam_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKtqqeesnna5tjvff3jlbvgecfq` (`cbse_exam_id`,`student_admission_id`),
  CONSTRAINT `FKdhu1xuax7724gwprtlf2vjtq3` FOREIGN KEY (`cbse_exam_id`) REFERENCES `cbse_exams` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `cbse_exam_students`;
CREATE TABLE `cbse_exam_students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `assigned` bit(1) NOT NULL,
  `student_admission_id` bigint NOT NULL,
  `cbse_exam_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKq6bsebs306bimvguui88cyrjm` (`cbse_exam_id`,`student_admission_id`),
  CONSTRAINT `FK7tp78srtjxmf4tyhsg8oy4k9i` FOREIGN KEY (`cbse_exam_id`) REFERENCES `cbse_exams` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_exam_students` VALUES (1,'2026-08-09 20:22:19',1,'2026-08-09 20:22:19',1,1,4);

DROP TABLE IF EXISTS `cbse_exam_subjects`;
CREATE TABLE `cbse_exam_subjects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `assessments` varchar(500) NOT NULL,
  `duration_minutes` int DEFAULT NULL,
  `exam_date` date DEFAULT NULL,
  `room_no` varchar(50) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `subject_name` varchar(200) NOT NULL,
  `cbse_exam_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdgpvgp983cbs7p531fjmmhmpp` (`cbse_exam_id`),
  CONSTRAINT `FKdgpvgp983cbs7p531fjmmhmpp` FOREIGN KEY (`cbse_exam_id`) REFERENCES `cbse_exams` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_exam_subjects` VALUES (1,'2026-08-09 19:43:56',1,'2026-08-09 19:43:56','Theory (TH02), Practical (PC03)',60,'2026-08-06','101','16:27:11','English (210)',1);
INSERT INTO `cbse_exam_subjects` VALUES (2,'2026-08-09 19:43:56',1,'2026-08-09 19:43:56','Theory (TH02), Practical (PC03)',60,'2026-08-06','101','16:27:11','Mathematics (110)',1);
INSERT INTO `cbse_exam_subjects` VALUES (3,'2026-08-09 19:43:56',1,'2026-08-09 19:43:56','Theory (TH02), Practical (PC03)',60,'2026-08-06','101','16:27:11','Science (111)',1);
INSERT INTO `cbse_exam_subjects` VALUES (4,'2026-08-09 19:43:56',1,'2026-08-09 19:43:56','Theory (TH02), Practical (PC03)',60,'2026-08-06','101','16:27:11','English (210)',2);
INSERT INTO `cbse_exam_subjects` VALUES (5,'2026-08-09 19:43:56',1,'2026-08-09 19:43:56','Theory (TH02), Practical (PC03)',60,'2026-08-06','101','16:27:11','Mathematics (110)',2);
INSERT INTO `cbse_exam_subjects` VALUES (9,'2026-08-09 19:46:03',1,'2026-08-09 19:46:03','Theory (TH02), Practical (PC03), Assignment (AS01)',60,'2026-08-06','101','16:27:11','English (210)',3);
INSERT INTO `cbse_exam_subjects` VALUES (10,'2026-08-09 19:46:03',1,'2026-08-09 19:46:03','Theory (TH02), Practical (PC03)',60,'2026-08-06','101','16:27:11','Mathematics (110)',3);
INSERT INTO `cbse_exam_subjects` VALUES (11,'2026-08-09 19:46:03',1,'2026-08-09 19:46:03','Theory (TH02), Practical (PC03)',60,'2026-08-06','101','16:27:11','Science (111)',3);
INSERT INTO `cbse_exam_subjects` VALUES (12,'2026-08-09 20:23:47',1,'2026-08-09 20:23:47','Theory (TH02), Practical (PC03), Assignment (AS01)',60,'2026-08-09','67','20:23:29','Computer (114)',4);

DROP TABLE IF EXISTS `cbse_exam_template_ranks`;
CREATE TABLE `cbse_exam_template_ranks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `rank_value` int DEFAULT NULL,
  `student_admission_id` bigint NOT NULL,
  `template_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_exam_template_ranks` VALUES (1,'2026-08-10 13:23:00',1,'2026-08-10 13:23:00',1,1,3);
INSERT INTO `cbse_exam_template_ranks` VALUES (2,'2026-08-10 13:23:00',1,'2026-08-10 13:23:00',2,3,3);
INSERT INTO `cbse_exam_template_ranks` VALUES (3,'2026-08-10 13:23:00',1,'2026-08-10 13:23:00',3,4,3);

DROP TABLE IF EXISTS `cbse_exam_templates`;
CREATE TABLE `cbse_exam_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `background_image` varchar(500) DEFAULT NULL,
  `class_id` bigint DEFAULT NULL,
  `class_name` varchar(100) DEFAULT NULL,
  `class_sections_label` text,
  `exam_center` varchar(200) DEFAULT NULL,
  `footer_text` text,
  `header_image` varchar(500) DEFAULT NULL,
  `left_sign` varchar(500) DEFAULT NULL,
  `linked_exam_id` bigint DEFAULT NULL,
  `marksheet_link_type` varchar(100) DEFAULT NULL,
  `marksheet_type` varchar(20) DEFAULT NULL,
  `middle_sign` varchar(500) DEFAULT NULL,
  `printing_date` varchar(50) DEFAULT NULL,
  `rank_generated` bit(1) DEFAULT NULL,
  `right_sign` varchar(500) DEFAULT NULL,
  `school_name` varchar(200) DEFAULT NULL,
  `sections_json` text,
  `show_academic_session` bit(1) DEFAULT NULL,
  `show_admission_no` bit(1) DEFAULT NULL,
  `show_class` bit(1) DEFAULT NULL,
  `show_dob` bit(1) DEFAULT NULL,
  `show_father_name` bit(1) DEFAULT NULL,
  `show_mother_name` bit(1) DEFAULT NULL,
  `show_photo` bit(1) DEFAULT NULL,
  `show_roll_no` bit(1) DEFAULT NULL,
  `show_section` bit(1) DEFAULT NULL,
  `show_student_name` bit(1) DEFAULT NULL,
  `show_subject_note` bit(1) DEFAULT NULL,
  `show_teacher_remark` bit(1) DEFAULT NULL,
  `template_description` text,
  `template_name` varchar(300) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_exam_templates` VALUES (1,'2026-08-10 13:05:54',1,'2026-08-10 13:05:54',NULL,NULL,'Class 1','Class 1: A, A, B, C, D','Main Campus',NULL,NULL,NULL,NULL,'single_exam_without_term','landscape',NULL,'04/01/2026',0,NULL,'School Name','["A","A","B","C","D"]',1,1,0,1,1,1,1,1,0,1,1,1,'Monthly CBSE examination report card template','CBSE Report Card Template - 2026');
INSERT INTO `cbse_exam_templates` VALUES (2,'2026-08-10 13:05:54',1,'2026-08-10 13:05:54',NULL,NULL,'Class 2','Class 2: A, B',NULL,NULL,NULL,NULL,NULL,NULL,'portrait',NULL,NULL,0,NULL,NULL,'["A","B"]',1,1,0,1,1,1,1,1,0,1,1,1,'Student progress report template','Student Progress Report');
INSERT INTO `cbse_exam_templates` VALUES (3,'2026-08-10 13:21:55',1,'2026-08-10 13:26:33','',2,'Class 1','Class 1: BLUE, WHITE, GREEN, YELLOW, RED','Makeni','Test Certificate','bnm.png','',4,'single_exam_without_term','landscape','','09/08/2026',1,'','Saint Francis','["BLUE","WHITE","GREEN","YELLOW","RED"]',1,1,0,1,1,1,1,1,0,1,1,1,'Testing template','CBSE Exam Template');

DROP TABLE IF EXISTS `cbse_exam_terms`;
CREATE TABLE `cbse_exam_terms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` text,
  `term_code` varchar(50) NOT NULL,
  `term_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK8biod3yq4cuh6h0ioemenqaso` (`term_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_exam_terms` VALUES (1,'2026-08-10 10:51:09',1,'2026-08-10 10:51:09','An examination is a formal test that assesses a person''s knowledge, skills, or abilities in a particular subject or field.','T021','Term 1');
INSERT INTO `cbse_exam_terms` VALUES (2,'2026-08-10 10:51:09',1,'2026-08-10 10:51:09','An examination is a formal test that assesses a person''s knowledge, skills, or abilities in a particular subject or field.','T015','Term 2');
INSERT INTO `cbse_exam_terms` VALUES (3,'2026-08-10 11:02:46',1,'2026-08-10 11:02:46','Term 3','T03','Term 3');

DROP TABLE IF EXISTS `cbse_exams`;
CREATE TABLE `cbse_exams` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `admit_card_roll_type` varchar(30) DEFAULT NULL,
  `assessment` varchar(100) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `class_name` varchar(100) NOT NULL,
  `description` text,
  `exam_name` varchar(300) NOT NULL,
  `grade` varchar(100) NOT NULL,
  `mail_template` varchar(150) DEFAULT NULL,
  `publish_result` bit(1) NOT NULL,
  `published` bit(1) NOT NULL,
  `rank_generated` bit(1) NOT NULL,
  `sections` varchar(100) NOT NULL,
  `term` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_exams` VALUES (1,'2026-08-09 19:43:56',1,'2026-08-09 19:43:56','PROFILE','Periodic Assessment','Main Subjects','Class 1','CBSE All Term Examination (August 2026)','CBSE All Term Examination (August 2026)','Exam Grade',NULL,1,1,0,'A,B,C,D','Term 1 (T021)');
INSERT INTO `cbse_exams` VALUES (2,'2026-08-09 19:43:56',1,'2026-08-09 19:43:56','PROFILE','Periodic Assessment','Internal Assessment','Class 1','CBSE All Term Examination (August 2026)','CBSE All Term Examination (August 2026)','Exam Grade',NULL,1,1,0,'A,B,C,D','Term 1 (T021)');
INSERT INTO `cbse_exams` VALUES (3,'2026-08-09 19:43:56',1,'2026-08-09 19:43:56','PROFILE','Half Yearly','Main Subjects','Class 2','CBSE Half Yearly Examination (August 2026)','CBSE Half Yearly Examination (August 2026)','Exam Grade',NULL,0,1,0,'A,B','Term 2 (T022)');
INSERT INTO `cbse_exams` VALUES (4,'2026-08-09 20:21:22',1,'2026-08-09 20:21:22','PROFILE','Periodic Assessment','Internal Assessment','Class 1','testing','module exam','Exam Grade','',0,1,0,'BLUE','Term 1 (T021)');

DROP TABLE IF EXISTS `cbse_observation_assigns`;
CREATE TABLE `cbse_observation_assigns` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` text NOT NULL,
  `cbse_exam_term_id` bigint NOT NULL,
  `cbse_observation_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKad3stacn6tvge33uoyh2amnlu` (`cbse_exam_term_id`),
  KEY `FKlq5vc561awwk8nwmnt42b7skw` (`cbse_observation_id`),
  CONSTRAINT `FKad3stacn6tvge33uoyh2amnlu` FOREIGN KEY (`cbse_exam_term_id`) REFERENCES `cbse_exam_terms` (`id`),
  CONSTRAINT `FKlq5vc561awwk8nwmnt42b7skw` FOREIGN KEY (`cbse_observation_id`) REFERENCES `cbse_observations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_observation_assigns` VALUES (1,'2026-08-10 12:18:31',1,'2026-08-10 12:18:31','This is Term 3 Observation',3,1);

DROP TABLE IF EXISTS `cbse_observation_details`;
CREATE TABLE `cbse_observation_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `max_marks` int NOT NULL,
  `sort_order` int DEFAULT NULL,
  `cbse_observation_id` bigint NOT NULL,
  `parameter_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK26stv1frmq98jj2ainhbu9wdn` (`cbse_observation_id`),
  KEY `FK7a7mbp5509tia0t3k86icp36a` (`parameter_id`),
  CONSTRAINT `FK26stv1frmq98jj2ainhbu9wdn` FOREIGN KEY (`cbse_observation_id`) REFERENCES `cbse_observations` (`id`),
  CONSTRAINT `FK7a7mbp5509tia0t3k86icp36a` FOREIGN KEY (`parameter_id`) REFERENCES `cbse_observation_parameters` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_observation_details` VALUES (1,'2026-08-10 12:15:18',1,'2026-08-10 12:15:18',20,0,1,3);
INSERT INTO `cbse_observation_details` VALUES (2,'2026-08-10 12:15:18',1,'2026-08-10 12:15:18',25,1,1,2);
INSERT INTO `cbse_observation_details` VALUES (3,'2026-08-10 12:15:18',1,'2026-08-10 12:15:18',30,0,2,1);
INSERT INTO `cbse_observation_details` VALUES (4,'2026-08-10 12:15:18',1,'2026-08-10 12:15:18',20,0,3,4);
INSERT INTO `cbse_observation_details` VALUES (5,'2026-08-10 12:21:12',1,'2026-08-10 12:21:12',50,0,4,5);

DROP TABLE IF EXISTS `cbse_observation_parameters`;
CREATE TABLE `cbse_observation_parameters` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `parameter_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKr2toh0562eakmw1nwnutvtumm` (`parameter_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_observation_parameters` VALUES (1,'2026-08-10 12:15:18',1,'2026-08-10 12:15:18','Behaviour');
INSERT INTO `cbse_observation_parameters` VALUES (2,'2026-08-10 12:15:18',1,'2026-08-10 12:15:18','Game');
INSERT INTO `cbse_observation_parameters` VALUES (3,'2026-08-10 12:15:18',1,'2026-08-10 12:15:18','Art & Culture');
INSERT INTO `cbse_observation_parameters` VALUES (4,'2026-08-10 12:15:18',1,'2026-08-10 12:15:18','Painting');
INSERT INTO `cbse_observation_parameters` VALUES (5,'2026-08-10 12:19:17',1,'2026-08-10 12:19:17','Coding');

DROP TABLE IF EXISTS `cbse_observations`;
CREATE TABLE `cbse_observations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `observation_description` text,
  `observation_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cbse_observations` VALUES (1,'2026-08-10 12:15:18',1,'2026-08-10 12:15:18','In an observational study, researchers study how participants perform certain behaviours or activities in real-life settings without manipulating variables.','Cbse Exam Observation 1');
INSERT INTO `cbse_observations` VALUES (2,'2026-08-10 12:15:18',1,'2026-08-10 12:15:18','In an observational study, researchers study how participants perform certain behaviours or activities in real-life settings without manipulating variables.','Cbse Exam Observation 2');
INSERT INTO `cbse_observations` VALUES (3,'2026-08-10 12:15:18',1,'2026-08-10 12:15:18','In an observational study, researchers study how participants perform certain behaviours or activities in real-life settings without manipulating variables.','Cbse Exam Observation 3');
INSERT INTO `cbse_observations` VALUES (4,'2026-08-10 12:21:12',1,'2026-08-10 12:21:12','Term 3 Observation','Term 3 Observation');

DROP TABLE IF EXISTS `certificate_issues`;
CREATE TABLE `certificate_issues` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `conduct` varchar(100) DEFAULT NULL,
  `document_number` varchar(50) DEFAULT NULL,
  `dues_paid` varchar(50) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `issue_type` varchar(40) NOT NULL,
  `last_class` varchar(100) DEFAULT NULL,
  `leaving_date` date DEFAULT NULL,
  `qualified` varchar(100) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `template_id` bigint DEFAULT NULL,
  `staff_id` bigint DEFAULT NULL,
  `student_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKo09ga7sogkemjb9ph5ptfhwpa` (`staff_id`),
  KEY `FKk78ul0tk1ibu0i3rdpbqnvbmh` (`student_id`),
  CONSTRAINT `FKk78ul0tk1ibu0i3rdpbqnvbmh` FOREIGN KEY (`student_id`) REFERENCES `student_admissions` (`id`),
  CONSTRAINT `FKo09ga7sogkemjb9ph5ptfhwpa` FOREIGN KEY (`staff_id`) REFERENCES `staff_members` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `certificate_issues` VALUES (1,'2026-08-19 10:26:07',1,'2026-08-19 10:26:07',NULL,'CERT-2026-0001',NULL,'2026-08-19','CERTIFICATE',NULL,NULL,NULL,NULL,NULL,1,NULL,1);
INSERT INTO `certificate_issues` VALUES (2,'2026-08-19 11:24:49',1,'2026-08-19 11:24:49',NULL,'CERT-2026-0002',NULL,'2026-08-19','CERTIFICATE',NULL,NULL,NULL,NULL,NULL,1,NULL,1);
INSERT INTO `certificate_issues` VALUES (3,'2026-08-19 11:32:10',1,'2026-08-19 11:32:10',NULL,'SID-2026-0001',NULL,'2026-08-19','STUDENT_ID',NULL,NULL,NULL,NULL,NULL,2,NULL,1);
INSERT INTO `certificate_issues` VALUES (4,'2026-08-19 11:54:49',1,'2026-08-19 11:54:49',NULL,'SID-2026-0002',NULL,'2026-08-19','STUDENT_ID',NULL,NULL,NULL,NULL,NULL,2,NULL,1);
INSERT INTO `certificate_issues` VALUES (5,'2026-08-19 12:01:37',1,'2026-08-19 12:01:37',NULL,'FID-2026-0001',NULL,'2026-08-19','STAFF_ID',NULL,NULL,NULL,NULL,NULL,1,2,NULL);
INSERT INTO `certificate_issues` VALUES (6,'2026-08-19 12:01:51',1,'2026-08-19 12:01:51',NULL,'FID-2026-0002',NULL,'2026-08-19','STAFF_ID',NULL,NULL,NULL,NULL,NULL,1,9,NULL);

DROP TABLE IF EXISTS `class_teacher_assignments`;
CREATE TABLE `class_teacher_assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `section_name` varchar(20) NOT NULL,
  `teacher_code` varchar(50) NOT NULL,
  `teacher_name` varchar(150) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `school_class_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_class_section_teacher` (`school_class_id`,`section_name`),
  CONSTRAINT `FK31xjwy23o3xe6fjsr9nffbk2t` FOREIGN KEY (`school_class_id`) REFERENCES `school_classes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `class_teacher_assignments` VALUES (1,'2026-08-05 15:00:47','BLUE','9002','Shivam Verma','2026-08-05 15:00:47',2);
INSERT INTO `class_teacher_assignments` VALUES (2,'2026-08-05 15:01:09','WHITE','90006','Jason Sharlton','2026-08-05 15:01:09',3);
INSERT INTO `class_teacher_assignments` VALUES (3,'2026-08-05 15:01:21','GREEN','1002','Nishant Khare','2026-08-05 15:01:21',4);
INSERT INTO `class_teacher_assignments` VALUES (4,'2026-08-05 15:01:42','YELLOW','654','Aman Verma','2026-08-05 15:01:42',5);
INSERT INTO `class_teacher_assignments` VALUES (5,'2026-08-05 15:02:00','RED','6789','Albert Thomas','2026-08-05 15:02:00',7);

DROP TABLE IF EXISTS `class_timetables`;
CREATE TABLE `class_timetables` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `day_of_week` varchar(20) NOT NULL,
  `end_time` time NOT NULL,
  `period_number` int DEFAULT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `section_name` varchar(20) NOT NULL,
  `start_time` time NOT NULL,
  `teacher_code` varchar(50) DEFAULT NULL,
  `teacher_name` varchar(150) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `school_class_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  `subject_group_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_class_timetable_class_section` (`school_class_id`,`section_name`),
  KEY `idx_class_timetable_day` (`day_of_week`),
  KEY `FKicqqeqw6jw6qvmo2rwophu775` (`subject_id`),
  KEY `FK7t1v3vy3ejaemd3gikvxpgkdj` (`subject_group_id`),
  CONSTRAINT `FK7t1v3vy3ejaemd3gikvxpgkdj` FOREIGN KEY (`subject_group_id`) REFERENCES `subject_groups` (`id`),
  CONSTRAINT `FK9khspjq21md91bxr7bfi68prf` FOREIGN KEY (`school_class_id`) REFERENCES `school_classes` (`id`),
  CONSTRAINT `FKicqqeqw6jw6qvmo2rwophu775` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `class_timetables` VALUES (2,'2026-08-05 14:51:04','Monday','08:45:00',1,'Room 01','BLUE','08:00:00','9002','Shivam Verma (9002)','2026-08-05 14:51:04',2,4,1);
INSERT INTO `class_timetables` VALUES (3,'2026-08-05 14:51:04','Tuesday','09:45:00',1,'Room 2','BLUE','09:00:00','9002','Shivam Verma (9002)','2026-08-05 14:51:04',2,1,1);
INSERT INTO `class_timetables` VALUES (4,'2026-08-05 14:51:04','Tuesday','11:35:00',2,'Room 3','BLUE','10:50:00','90005','Jason Sharpu (90005)','2026-08-05 14:51:04',2,3,1);

DROP TABLE IF EXISTS `communicate_email_templates`;
CREATE TABLE `communicate_email_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `template_body` text NOT NULL,
  `title` varchar(255) NOT NULL,
  `attachment_path` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `communicate_email_templates` VALUES (1,'2026-08-14 13:07:54',1,'2026-08-14 13:09:04','<p>Testing the sport day event</p>','Sport Day Event','/uploads/emails/16f68e593d074473b78724e3dae6baea.png');

DROP TABLE IF EXISTS `communicate_message_logs`;
CREATE TABLE `communicate_message_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `message` text NOT NULL,
  `message_type` varchar(10) NOT NULL,
  `recipient_details` text,
  `recipient_type` varchar(50) NOT NULL,
  `scheduled_at` datetime(6) DEFAULT NULL,
  `sent_at` datetime(6) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `attachment_path` varchar(500) DEFAULT NULL,
  `compose_tab` varchar(30) DEFAULT NULL,
  `email_template_id` bigint DEFAULT NULL,
  `send_mode` varchar(20) DEFAULT NULL,
  `sms_template_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `communicate_sms_templates`;
CREATE TABLE `communicate_sms_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `template_body` text NOT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `communicate_sms_templates` VALUES (1,'2026-08-14 13:21:00',1,'2026-08-14 13:21:00','Be very punctual in log in time, screen off time, activity time table etc. Be ready with necessary text books, note books, pen, pencil and other accessories before class begins. Make sure the device is sufficiently charged before the beginning of the class.','Online Classes');
INSERT INTO `communicate_sms_templates` VALUES (2,'2026-08-14 13:21:30',1,'2026-08-14 13:21:30','All the students of our school are hereby informed that our school is going to celebrate the Independence Day like previous years in the school premises. Students are requested to note that on the 15th August they will be assembled on the school ground at 7:30 a.m. positively.','Independence Day Celebration!!!!!!');
INSERT INTO `communicate_sms_templates` VALUES (3,'2026-08-14 13:21:59',1,'2026-08-14 13:21:59','Republic Day is the day when the Republic of India marks and celebrates the date on which the Constitution of India came into effect on 26 January 1950.','Republic Day Celebration');
INSERT INTO `communicate_sms_templates` VALUES (4,'2026-08-14 13:23:05',1,'2026-08-14 13:23:05','The Central Board of Secondary Education (CBSE) will begin the new academic session of 2026-27  from April 1, 2023.','New Academic Session(2026-27)');

DROP TABLE IF EXISTS `complains`;
CREATE TABLE `complains` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `action_taken` varchar(2000) DEFAULT NULL,
  `assigned` varchar(100) DEFAULT NULL,
  `complain_by` varchar(100) NOT NULL,
  `complain_type` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `document_path` varchar(500) DEFAULT NULL,
  `note` varchar(2000) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `source` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `complains` VALUES (1,'2026-02-03 16:01:58',1,'2026-02-03 16:01:58','No action has been taken','Admin','Mannie Sesay','Fees','2026-02-03','Fee Payment',NULL,'No action has be taken','+23276806789','In Person');
INSERT INTO `complains` VALUES (2,'2026-02-03 16:04:03',1,'2026-02-03 16:05:45','Action has been taken ','Admin and Finance','Alhaji Mohamed Kanu','Sports','2026-02-03','I have paid my transportation fee in full',NULL,'Sport fee','+23277150549','Online');
INSERT INTO `complains` VALUES (3,'2026-02-03 16:26:53',1,'2026-02-03 16:26:53','Action has been taken','Admin','Mr Moore','Teacher','2026-02-03','Submission of Exams score sheets',NULL,'Submission ','+23299878765','Phone');

DROP TABLE IF EXISTS `complaint_types`;
CREATE TABLE `complaint_types` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `name` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `complaint_types` VALUES (1,'2026-02-04 11:02:59','Testing','Exam  malpracties','2026-02-04 11:02:59');
INSERT INTO `complaint_types` VALUES (2,'2026-02-04 11:02:59','Testing','Exam  malpracties','2026-02-04 11:02:59');

DROP TABLE IF EXISTS `conference_credentials`;
CREATE TABLE `conference_credentials` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `access_token` text,
  `api_key` varchar(500) DEFAULT NULL,
  `api_secret` varchar(500) DEFAULT NULL,
  `redirect_url` varchar(500) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `parent_live_class` bit(1) NOT NULL DEFAULT b'0',
  `staff_zoom_client` varchar(20) DEFAULT NULL,
  `student_zoom_client` varchar(20) DEFAULT NULL,
  `teacher_api_credential` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `conference_credentials` VALUES (1,'','','','http://localhost:8080/admin/conference/stafftoken','2026-08-09 11:23:48',0,NULL,NULL,0);

DROP TABLE IF EXISTS `conference_live_classes`;
CREATE TABLE `conference_live_classes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `api_used` varchar(100) DEFAULT NULL,
  `class_date_time` datetime(6) NOT NULL,
  `class_name` varchar(100) DEFAULT NULL,
  `class_sections` text,
  `class_title` varchar(300) NOT NULL,
  `client_video` bit(1) NOT NULL DEFAULT b'0',
  `created_at` datetime(6) NOT NULL,
  `created_by_label` varchar(100) DEFAULT NULL,
  `created_for_id` varchar(50) DEFAULT NULL,
  `created_for_name` varchar(200) DEFAULT NULL,
  `created_for_role` varchar(100) DEFAULT NULL,
  `description` text,
  `duration_minutes` int NOT NULL,
  `host_video` bit(1) NOT NULL DEFAULT b'0',
  `meeting_url` varchar(500) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `section` varchar(50) DEFAULT NULL,
  `staff_id` varchar(50) DEFAULT NULL,
  `staff_name` varchar(200) DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `join_list` text,
  `total_join` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `conference_live_classes` VALUES (1,'Global','2026-08-31 17:28:00',NULL,'Class 1 (A)||Class 1 (B)||Class 1 (C)||Class 1 (D)||Class 1 (E)','Doubt Question Answer',0,'2026-08-09 11:45:19','Self','9002','Shivam Verma','Teacher','Doubt Question Answer',45,0,'https://zoom.us/j/demo--1524253676','Teacher',NULL,'9002','Shivam Verma','Awaited',NULL,0);
INSERT INTO `conference_live_classes` VALUES (2,'Global','2026-08-30 15:00:00',NULL,'Class 2 (A)||Class 2 (B)','Extra Class Social Studies',0,'2026-08-09 11:45:19','Self','9002','Shivam Verma','Teacher','Extra Class Social Studies',60,0,'https://zoom.us/j/demo--1529184148','Teacher',NULL,'9002','Shivam Verma','Awaited',NULL,0);
INSERT INTO `conference_live_classes` VALUES (3,'Global','2026-08-29 10:15:00',NULL,'Class 3 (A)','Computer Studies Classes',0,'2026-08-09 11:45:19','Self','9002','Shivam Verma','Teacher','Computer Studies Classes',45,0,'https://zoom.us/j/demo--1056086520','Teacher',NULL,'9002','Shivam Verma','Awaited',NULL,0);
INSERT INTO `conference_live_classes` VALUES (4,'Global','2026-08-09 11:46:00','Class 1','Class 1 (BLUE)','Java',1,'2026-08-09 11:47:42','Self','9002','Shivam Verma','Teacher','testing',45,1,'https://zoom.us/j/demo-class-1786276062006','Teacher','BLUE','9002','Shivam Verma','Awaited',NULL,0);

DROP TABLE IF EXISTS `conference_live_meetings`;
CREATE TABLE `conference_live_meetings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `api_used` varchar(100) DEFAULT NULL,
  `client_video` bit(1) NOT NULL DEFAULT b'0',
  `created_at` datetime(6) NOT NULL,
  `created_by_label` varchar(100) DEFAULT NULL,
  `description` text,
  `duration_minutes` int NOT NULL,
  `host_video` bit(1) NOT NULL DEFAULT b'0',
  `meeting_date_time` datetime(6) NOT NULL,
  `meeting_title` varchar(300) NOT NULL,
  `meeting_url` varchar(500) DEFAULT NULL,
  `staff_ids` varchar(500) DEFAULT NULL,
  `staff_members` text,
  `status` varchar(50) NOT NULL,
  `join_list` text,
  `total_join` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `conference_live_meetings` VALUES (1,'Self',0,'2026-08-09 10:35:40','Self','Faculty Meeting – Teaching Strategy Discussion',45,0,'2026-08-25 10:26:00','Faculty Meeting – Teaching Strategy Discussion',NULL,'9002,9003','Shivam Verma (Teacher : 9002)||Sarah Johnson (Teacher : 9003)','Awaited',NULL,NULL);
INSERT INTO `conference_live_meetings` VALUES (2,'Self',0,'2026-08-09 10:35:40','Self','Department Review Meeting',60,1,'2026-08-24 14:00:00','Department Review Meeting',NULL,'9004,9001','Michael Chen (Teacher : 9004)||Emily Davis (Admin : 9001)','Awaited',NULL,NULL);
INSERT INTO `conference_live_meetings` VALUES (4,'Self',1,'2026-08-09 11:22:50','Self','testing',65,1,'2026-08-09 11:22:00','testing meeting','https://zoom.us/j/demo-1786274570091','9006','Brandon Heart (Librarian : 9006)','Completed',NULL,NULL);

DROP TABLE IF EXISTS `content_share_logs`;
CREATE TABLE `content_share_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `content_ids` text NOT NULL,
  `content_titles` text,
  `description` text,
  `recipient_roles` text,
  `send_to_details` text,
  `send_to_type` varchar(50) NOT NULL,
  `share_date` date NOT NULL,
  `title` varchar(255) NOT NULL,
  `valid_until` date NOT NULL,
  `shared_by` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `content_type_settings`;
CREATE TABLE `content_type_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` text,
  `name` varchar(120) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `content_type_settings` VALUES (1,'2026-08-14 13:55:56',1,'2026-08-14 13:55:56','Documents content','Documents');
INSERT INTO `content_type_settings` VALUES (2,'2026-08-14 13:55:56',1,'2026-08-14 13:55:56','Images content','Images');
INSERT INTO `content_type_settings` VALUES (3,'2026-08-14 13:55:56',1,'2026-08-14 13:55:56','Video content','Video');
INSERT INTO `content_type_settings` VALUES (4,'2026-08-14 13:55:56',1,'2026-08-14 13:55:56','Audio content','Audio');
INSERT INTO `content_type_settings` VALUES (5,'2026-08-14 13:55:56',1,'2026-08-14 13:55:56','Other content','Other');

DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `classes_held` int DEFAULT NULL,
  `course_code` varchar(50) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `total_classes` int DEFAULT NULL,
  `academic_year_id` bigint NOT NULL,
  `section_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  `teacher_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKirkqufe5mclvajgwpnlakw5g4` (`subject_id`,`section_id`,`academic_year_id`),
  UNIQUE KEY `UKp02ts69sh53ptd62m3c67v0` (`course_code`),
  KEY `FKa63nunxcqvk58hdljurae1xxf` (`academic_year_id`),
  KEY `FK824yr6aj54smmwytf88lvjoti` (`section_id`),
  KEY `FK468oyt88pgk2a0cxrvxygadqg` (`teacher_id`),
  CONSTRAINT `FK468oyt88pgk2a0cxrvxygadqg` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`),
  CONSTRAINT `FK5tckdihu5akp5nkxiacx1gfhi` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `FK824yr6aj54smmwytf88lvjoti` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`),
  CONSTRAINT `FKa63nunxcqvk58hdljurae1xxf` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `daily_assignments`;
CREATE TABLE `daily_assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `assignment_date` date NOT NULL,
  `class_id` bigint DEFAULT NULL,
  `class_name` varchar(100) NOT NULL,
  `evaluated_by` varchar(150) DEFAULT NULL,
  `evaluation_date` date DEFAULT NULL,
  `section` varchar(20) NOT NULL,
  `student_admission_id` bigint DEFAULT NULL,
  `student_name` varchar(200) NOT NULL,
  `subject_group_id` bigint DEFAULT NULL,
  `subject_group_name` varchar(150) NOT NULL,
  `subject_id` bigint DEFAULT NULL,
  `subject_name` varchar(100) NOT NULL,
  `submission_date` date DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKj6cwks7xecs5jov19ro8ge3qk` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `departments` VALUES (1,'2026-08-12 14:51:03',1,'2026-08-12 14:51:03','Academic');
INSERT INTO `departments` VALUES (2,'2026-08-12 14:51:03',1,'2026-08-12 14:51:03','Library');
INSERT INTO `departments` VALUES (3,'2026-08-12 14:51:03',1,'2026-08-12 14:51:03','Sports');
INSERT INTO `departments` VALUES (4,'2026-08-12 14:51:03',1,'2026-08-12 14:51:03','Science');
INSERT INTO `departments` VALUES (5,'2026-08-12 14:51:03',1,'2026-08-12 14:51:03','Commerce');
INSERT INTO `departments` VALUES (6,'2026-08-12 14:51:03',1,'2026-08-12 14:51:03','Arts');
INSERT INTO `departments` VALUES (7,'2026-08-12 14:51:03',1,'2026-08-12 14:51:03','Exam');
INSERT INTO `departments` VALUES (8,'2026-08-12 14:51:03',1,'2026-08-12 14:51:03','Admin');
INSERT INTO `departments` VALUES (9,'2026-08-12 14:51:03',1,'2026-08-12 14:51:03','Finance');
INSERT INTO `departments` VALUES (10,'2026-08-12 14:51:03',1,'2026-08-12 14:51:03','Maths');

DROP TABLE IF EXISTS `designations`;
CREATE TABLE `designations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK9okejkx50y6e3udkhdib9xr70` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `designations` VALUES (1,'2026-08-12 15:15:32',1,'2026-08-12 15:15:32','Faculty');
INSERT INTO `designations` VALUES (2,'2026-08-12 15:15:32',1,'2026-08-12 15:15:32','Accountant');
INSERT INTO `designations` VALUES (3,'2026-08-12 15:15:32',1,'2026-08-12 15:15:32','Admin');
INSERT INTO `designations` VALUES (4,'2026-08-12 15:15:32',1,'2026-08-12 15:15:32','Receptionist');
INSERT INTO `designations` VALUES (5,'2026-08-12 15:15:32',1,'2026-08-12 15:15:32','Principal');
INSERT INTO `designations` VALUES (6,'2026-08-12 15:15:32',1,'2026-08-12 15:15:32','Director');
INSERT INTO `designations` VALUES (7,'2026-08-12 15:15:32',1,'2026-08-12 15:15:32','Librarian');
INSERT INTO `designations` VALUES (8,'2026-08-12 15:15:32',1,'2026-08-12 15:15:32','Technical Head');
INSERT INTO `designations` VALUES (9,'2026-08-12 15:15:32',1,'2026-08-12 15:15:32','Vice Principal');
INSERT INTO `designations` VALUES (10,'2026-08-12 15:29:49',1,'2026-08-12 15:29:49','Science');

DROP TABLE IF EXISTS `disable_reasons`;
CREATE TABLE `disable_reasons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKrltn62bvmgonrctba8rw5kbqp` (`reason`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `disable_reasons` VALUES (1,'2026-08-05 11:10:20','Two Fighting','2026-08-05 11:10:20');
INSERT INTO `disable_reasons` VALUES (2,'2026-08-05 11:10:54','Examination Fruad','2026-08-05 11:10:54');
INSERT INTO `disable_reasons` VALUES (3,'2026-08-05 11:11:13','Not Paying Tution Fee','2026-08-05 11:11:13');

DROP TABLE IF EXISTS `download_contents`;
CREATE TABLE `download_contents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `content_type` varchar(120) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `upload_type` varchar(20) NOT NULL,
  `youtube_url` varchar(500) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `uploaded_by` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `download_contents` VALUES (1,'2026-08-14 13:58:11',1,'2026-08-14 13:58:11','Images','ab1.png','/uploads/contents/c5016178b6f54cc5bcf4c3ab717ccc71.png','bfbfbfdfdvdvdv','FILE',NULL,NULL,NULL);
INSERT INTO `download_contents` VALUES (2,'2026-08-14 14:19:23',1,'2026-08-14 14:19:23','Images','ad1.png','/uploads/contents/0ceb16eb631e49f09daac3ee2691b11e.png','sfwfwfwfw','FILE',NULL,20399,'Joe Black (9000)');
INSERT INTO `download_contents` VALUES (3,'2026-08-18 12:58:48',1,'2026-08-18 12:58:48','Video',NULL,NULL,'bfbfbfdfdvdvdv','YOUTUBE','https://yyyuuyuyuyu.com',NULL,'Joe Black (9000)');

DROP TABLE IF EXISTS `email_config`;
CREATE TABLE `email_config` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `email_engine` varchar(30) NOT NULL,
  `from_email` varchar(150) DEFAULT NULL,
  `smtp_auth` varchar(10) DEFAULT NULL,
  `smtp_password` text,
  `smtp_port` varchar(10) DEFAULT NULL,
  `smtp_security` varchar(20) DEFAULT NULL,
  `smtp_server` varchar(150) DEFAULT NULL,
  `smtp_username` varchar(150) DEFAULT NULL,
  `aws_access_key_id` varchar(100) DEFAULT NULL,
  `aws_region` varchar(40) DEFAULT NULL,
  `aws_secret_access_key` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `email_config` VALUES (1,'2026-08-19 16:53:11',1,'2026-08-19 16:53:11','smtp',NULL,'on',NULL,'587','tls',NULL,NULL,NULL,NULL,NULL);

DROP TABLE IF EXISTS `enquiry_references`;
CREATE TABLE `enquiry_references` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `name` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `enquiry_references` VALUES (1,'2026-02-04 10:59:30','Meeting description','Meeting','2026-02-04 10:59:30');
INSERT INTO `enquiry_references` VALUES (2,'2026-08-04 14:36:34','End of year meeting','End of Year Meeting','2026-08-04 14:36:34');

DROP TABLE IF EXISTS `enquiry_sources`;
CREATE TABLE `enquiry_sources` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `name` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `enquiry_sources` VALUES (1,'2026-02-04 10:58:48','LinkedIn Profile','LinkedIn','2026-02-04 10:58:48');
INSERT INTO `enquiry_sources` VALUES (2,'2026-08-04 14:35:51','Social MEdia','Facebook','2026-08-04 14:35:51');

DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `end_date_time` datetime(6) NOT NULL,
  `event_image_url` varchar(500) DEFAULT NULL,
  `event_type` enum('ACADEMIC','CELEBRATION','COMPETITION','CULTURAL','FIELD_TRIP','OTHER','PARENT_TEACHER_MEETING','SEMINAR','SPORTS','WORKSHOP') DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `max_participants` int DEFAULT NULL,
  `registration_required` bit(1) DEFAULT NULL,
  `start_date_time` datetime(6) NOT NULL,
  `status` enum('CANCELLED','COMPLETED','ONGOING','POSTPONED','SCHEDULED') DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `organizer_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdocju8m76a3f8o6ljh2jrn2ra` (`organizer_id`),
  CONSTRAINT `FKdocju8m76a3f8o6ljh2jrn2ra` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `exam_group_exam_students`;
CREATE TABLE `exam_group_exam_students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `assigned` bit(1) NOT NULL,
  `student_admission_id` bigint NOT NULL,
  `exam_group_exam_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKdnbk177wv78320da2t85jjel8` (`exam_group_exam_id`,`student_admission_id`),
  CONSTRAINT `FKr1lxt39bg40c08kqcf148e0x7` FOREIGN KEY (`exam_group_exam_id`) REFERENCES `exam_group_exams` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `exam_group_exam_students` VALUES (2,'2026-08-17 15:27:28',1,'2026-08-17 15:27:28',1,4,23);

DROP TABLE IF EXISTS `exam_group_exam_teacher_remarks`;
CREATE TABLE `exam_group_exam_teacher_remarks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `remark` varchar(1000) DEFAULT NULL,
  `student_admission_id` bigint NOT NULL,
  `exam_group_exam_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKmgnoxoo5f8f9oxb6k28cgwq5p` (`exam_group_exam_id`,`student_admission_id`),
  CONSTRAINT `FKr4n9au41io9utx71bbbng1j5q` FOREIGN KEY (`exam_group_exam_id`) REFERENCES `exam_group_exams` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `exam_group_exam_teacher_remarks` VALUES (1,'2026-08-17 15:55:11',1,'2026-08-17 15:55:11','Testing',4,23);

DROP TABLE IF EXISTS `exam_group_exams`;
CREATE TABLE `exam_group_exams` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `exam_group_id` bigint NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `marksheet_template_id` bigint DEFAULT NULL,
  `publish_exam` bit(1) DEFAULT NULL,
  `publish_result` bit(1) DEFAULT NULL,
  `rank_generated` bit(1) DEFAULT NULL,
  `roll_type` varchar(30) DEFAULT NULL,
  `session_year` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4nucnatcda97q5apx6p6q2ge9` (`exam_group_id`),
  CONSTRAINT `FK4nucnatcda97q5apx6p6q2ge9` FOREIGN KEY (`exam_group_id`) REFERENCES `exam_groups` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `exam_group_exams` VALUES (1,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 1',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (2,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 2',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (3,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 3',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (4,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 4',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (5,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 5',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (6,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 6',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (7,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 7',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (8,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 1',2,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (9,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 2',2,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (10,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 3',2,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (11,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 4',2,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (12,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 1',3,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (13,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 2',3,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (14,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 3',3,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (15,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 4',3,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (16,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 5',3,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (17,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 1',4,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (18,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 2',4,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (19,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 3',4,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (20,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 4',4,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (21,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 5',4,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (22,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 6',4,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (23,'2026-08-09 17:02:59',1,'2026-08-17 16:21:36','Exam 1',5,'Exam 1',2,1,1,1,'ADMIT_CARD','2026-27');
INSERT INTO `exam_group_exams` VALUES (24,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 2',5,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (25,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 3',5,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (26,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 4',5,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (27,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 5',5,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (28,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 6',5,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (29,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','Exam 7',5,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (30,'2026-08-10 14:15:11',1,'2026-08-10 14:15:11','CBSE Monthly Test-May',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `exam_group_exams` VALUES (31,'2026-08-17 15:14:55',1,'2026-08-17 15:14:55','Module Exam',5,NULL,NULL,NULL,NULL,NULL,NULL,NULL);

DROP TABLE IF EXISTS `exam_groups`;
CREATE TABLE `exam_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` text,
  `exam_type` varchar(100) NOT NULL,
  `name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `exam_groups` VALUES (1,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','','General Purpose (Pass/Fail)','General Exam (Pass / Fail)');
INSERT INTO `exam_groups` VALUES (2,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','','School Based Grading System','Grading System (School Based Grading System)');
INSERT INTO `exam_groups` VALUES (3,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','','College Based Grading System','CGPA (College Based Grading System)');
INSERT INTO `exam_groups` VALUES (4,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','','GPA Grading System','GPA Exam Grading System');
INSERT INTO `exam_groups` VALUES (5,'2026-08-09 17:02:59',1,'2026-08-09 17:02:59','','Average Passing','Average Passing Exam');
INSERT INTO `exam_groups` VALUES (6,'2026-08-09 17:05:02',1,'2026-08-09 17:05:02',NULL,'General Purpose (Pass/Fail)','first term exam');

DROP TABLE IF EXISTS `exam_result_records`;
CREATE TABLE `exam_result_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `grand_total` decimal(10,2) DEFAULT NULL,
  `percent` decimal(6,2) DEFAULT NULL,
  `result_status` varchar(20) DEFAULT NULL,
  `session_year` varchar(20) NOT NULL,
  `student_rank` int DEFAULT NULL,
  `exam_group_exam_id` bigint NOT NULL,
  `student_admission_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKprrf8x7lcxvjsnglte1uvpfan` (`exam_group_exam_id`),
  KEY `FK7owmi2t7tv2o0xve13582tmcc` (`student_admission_id`),
  CONSTRAINT `FK7owmi2t7tv2o0xve13582tmcc` FOREIGN KEY (`student_admission_id`) REFERENCES `student_admissions` (`id`),
  CONSTRAINT `FKprrf8x7lcxvjsnglte1uvpfan` FOREIGN KEY (`exam_group_exam_id`) REFERENCES `exam_group_exams` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `exam_result_records` VALUES (1,'2026-08-17 15:53:59',1,'2026-08-17 15:54:10',180.00,45.00,NULL,'2026-27',1,23,4);

DROP TABLE IF EXISTS `exam_result_subject_marks`;
CREATE TABLE `exam_result_subject_marks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `marks_max` decimal(8,2) DEFAULT NULL,
  `marks_obtained` decimal(8,2) DEFAULT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `subject_name` varchar(100) NOT NULL,
  `exam_result_record_id` bigint NOT NULL,
  `is_absent` bit(1) DEFAULT NULL,
  `note` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKq212a0dm3r785ipvnpe2rau89` (`exam_result_record_id`),
  CONSTRAINT `FKq212a0dm3r785ipvnpe2rau89` FOREIGN KEY (`exam_result_record_id`) REFERENCES `exam_result_records` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `exam_result_subject_marks` VALUES (1,'2026-08-17 15:53:59',1,'2026-08-17 15:53:59',100.00,80.00,'MA002','Mathematics',1,NULL,NULL);
INSERT INTO `exam_result_subject_marks` VALUES (2,'2026-08-17 15:54:10',1,'2026-08-17 15:54:10',100.00,100.00,'E001','English Language',1,NULL,NULL);
INSERT INTO `exam_result_subject_marks` VALUES (3,'2026-08-17 15:54:29',1,'2026-08-17 15:54:29',100.00,0.00,'P011','Physics',1,NULL,NULL);

DROP TABLE IF EXISTS `exam_results`;
CREATE TABLE `exam_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `grade` varchar(10) DEFAULT NULL,
  `is_absent` bit(1) DEFAULT NULL,
  `marks_obtained` double NOT NULL,
  `remarks` varchar(1000) DEFAULT NULL,
  `status` enum('ABSENT','FAIL','PASS','UNDER_REVIEW') DEFAULT NULL,
  `exam_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKcp4yqe1ma0h9n1r353q0kmbvb` (`exam_id`,`student_id`),
  KEY `FKr7qgl670f47u65kkdm8ex5119` (`student_id`),
  CONSTRAINT `FKr7qgl670f47u65kkdm8ex5119` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKtf85ht7yquiorwjx2xbdx3fxw` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `exam_schedule_entries`;
CREATE TABLE `exam_schedule_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `date_from` date DEFAULT NULL,
  `duration_minutes` int DEFAULT NULL,
  `marks_max` decimal(8,2) DEFAULT NULL,
  `marks_min` decimal(8,2) DEFAULT NULL,
  `room_no` varchar(50) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `subject_name` varchar(200) NOT NULL,
  `exam_group_exam_id` bigint NOT NULL,
  `credit_hours` decimal(6,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5mx9jscisf20op8cy55tor9ni` (`exam_group_exam_id`),
  CONSTRAINT `FK5mx9jscisf20op8cy55tor9ni` FOREIGN KEY (`exam_group_exam_id`) REFERENCES `exam_group_exams` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `exam_schedule_entries` VALUES (1,'2026-08-10 14:15:11',1,'2026-08-10 14:15:11','2026-05-04',60,100.00,33.00,'100','09:00:00','English (210)',30,NULL);
INSERT INTO `exam_schedule_entries` VALUES (2,'2026-08-10 14:15:11',1,'2026-08-10 14:15:11','2026-05-04',60,100.00,33.00,'100','09:00:00','Hindi (230)',30,NULL);
INSERT INTO `exam_schedule_entries` VALUES (3,'2026-08-10 14:15:11',1,'2026-08-10 14:15:11','2026-05-04',60,100.00,33.00,'100','09:00:00','Mathematics (110)',30,NULL);
INSERT INTO `exam_schedule_entries` VALUES (4,'2026-08-10 14:15:11',1,'2026-08-10 14:15:11','2026-05-04',60,100.00,33.00,'100','09:00:00','Science (111)',30,NULL);
INSERT INTO `exam_schedule_entries` VALUES (5,'2026-08-10 14:15:11',1,'2026-08-10 14:15:11','2026-05-04',60,100.00,33.00,'100','09:00:00','Social Science (113)',30,NULL);
INSERT INTO `exam_schedule_entries` VALUES (6,'2026-08-10 14:15:11',1,'2026-08-10 14:15:11','2026-05-04',60,100.00,33.00,'100','09:00:00','Computer (114)',30,NULL);
INSERT INTO `exam_schedule_entries` VALUES (11,'2026-08-17 15:53:39',1,'2026-08-17 15:53:39','2026-08-17',60,100.00,33.00,'Room 1','03:51:55','Mathematics (MA002)',23,1.00);
INSERT INTO `exam_schedule_entries` VALUES (12,'2026-08-17 15:53:39',1,'2026-08-17 15:53:39','2026-08-17',60,100.00,33.00,'Room 2','03:52:07','English Language (E001)',23,1.00);
INSERT INTO `exam_schedule_entries` VALUES (13,'2026-08-17 15:53:39',1,'2026-08-17 15:53:39','2026-08-17',60,100.00,33.00,'Room 3','18:52:14','Computer (C005)',23,1.00);
INSERT INTO `exam_schedule_entries` VALUES (14,'2026-08-17 15:53:39',1,'2026-08-17 15:53:39','2026-08-17',60,100.00,33.00,'Room 4','15:52:24','Physics (P011)',23,1.00);

DROP TABLE IF EXISTS `exams`;
CREATE TABLE `exams` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `exam_date` date NOT NULL,
  `exam_type` enum('ANNUAL','ENTRANCE','FINAL_TERM','HALF_YEARLY','MID_TERM','OTHER','QUARTERLY','UNIT_TEST') DEFAULT NULL,
  `instructions` varchar(500) DEFAULT NULL,
  `passing_marks` double DEFAULT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `total_marks` double NOT NULL,
  `course_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKr1qm93flajdaclug2fg8i7bcg` (`course_id`),
  CONSTRAINT `FKr1qm93flajdaclug2fg8i7bcg` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `expense_heads`;
CREATE TABLE `expense_heads` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` text,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKbxhub8ljuxsxk0qq6srwpkihj` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `expense_heads` VALUES (1,'2026-08-09 14:45:33',1,'2026-08-09 14:45:33',NULL,'Stationery Purchase');
INSERT INTO `expense_heads` VALUES (2,'2026-08-09 14:45:33',1,'2026-08-09 14:45:33',NULL,'Telephone Bill');
INSERT INTO `expense_heads` VALUES (3,'2026-08-09 14:45:33',1,'2026-08-09 14:45:33',NULL,'Miscellaneous');
INSERT INTO `expense_heads` VALUES (4,'2026-08-09 14:45:33',1,'2026-08-09 14:45:33',NULL,'Flower');
INSERT INTO `expense_heads` VALUES (5,'2026-08-09 14:45:33',1,'2026-08-09 14:45:33',NULL,'Electricity Bill');
INSERT INTO `expense_heads` VALUES (6,'2026-08-09 14:45:33',1,'2026-08-09 14:45:33',NULL,'Transport');
INSERT INTO `expense_heads` VALUES (7,'2026-08-09 15:49:31',1,'2026-08-09 15:49:31','tcvhv','bbjhbjhj');
INSERT INTO `expense_heads` VALUES (8,'2026-08-09 15:50:10',1,'2026-08-09 15:50:10',NULL,'test');

DROP TABLE IF EXISTS `expenses`;
CREATE TABLE `expenses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `date` date NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `document_path` varchar(500) DEFAULT NULL,
  `expense_head` varchar(100) NOT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `expenses` VALUES (2,'2026-08-09 14:45:33',1,'2026-08-09 14:45:33',150.00,'2026-01-12','School telephone bill',NULL,'Telephone Bill','78456','Telephone Payment');
INSERT INTO `expenses` VALUES (3,'2026-08-09 14:45:33',1,'2026-08-09 14:45:33',200.00,'2026-02-03','Flowers for school event',NULL,'Flower','91234','Event Flowers');
INSERT INTO `expenses` VALUES (4,'2026-08-09 14:45:33',1,'2026-08-09 14:45:33',200.00,'2026-02-18','Miscellaneous school expense',NULL,'Miscellaneous','33102','General Expense');
INSERT INTO `expenses` VALUES (5,'2026-08-09 14:48:28',1,'2026-08-09 14:48:28',150.00,'2026-07-09','testing expenses',NULL,'Telephone Bill','ADP101','Admin Telephone Bill');

DROP TABLE IF EXISTS `fee_discounts`;
CREATE TABLE `fee_discounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` double DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `discount_code` varchar(100) NOT NULL,
  `discount_type` enum('FIXED_AMOUNT','PERCENTAGE') NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `number_of_use_count` int NOT NULL,
  `percentage` double DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK68dq1gkajto94ukiu4lrbd5ja` (`discount_code`),
  UNIQUE KEY `UKo7svmmufv4lftd8s0yx5937j` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `fee_discounts` VALUES (1,100.0,'2026-08-06 13:54:58','','sdf','FIXED_AMOUNT',NULL,'Sibling Discount Fee',1,2.0,'2026-08-06 13:54:58');
INSERT INTO `fee_discounts` VALUES (2,100.0,'2026-08-06 13:56:42','','tfd','PERCENTAGE','2026-08-06','Tution Fee Discount',2,5.0,'2026-08-06 13:56:42');

DROP TABLE IF EXISTS `fee_group_assignments`;
CREATE TABLE `fee_group_assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `fee_group_id` bigint NOT NULL,
  `session_year` varchar(20) NOT NULL,
  `student_admission_id` bigint NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fee_group_student_session` (`fee_group_id`,`student_admission_id`,`session_year`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `fee_group_assignments` VALUES (1,'2026-08-06 15:12:59',1,'2026-27',1,'2026-08-06 15:12:59');
INSERT INTO `fee_group_assignments` VALUES (2,'2026-08-06 15:12:59',1,'2026-27',4,'2026-08-06 15:12:59');

DROP TABLE IF EXISTS `fee_groups`;
CREATE TABLE `fee_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `name` varchar(150) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKovwyb3481hlb2wuxmh081abbk` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `fee_groups` VALUES (1,'2026-08-06 13:28:39','Development fee for primary and secondary','Development Fee','2026-08-06 13:28:39');
INSERT INTO `fee_groups` VALUES (2,'2026-08-06 13:29:34','Tution Fee for secondary and primary','Tution Fee','2026-08-06 13:29:34');
INSERT INTO `fee_groups` VALUES (3,'2026-08-06 13:31:02','','Computer Fee','2026-08-06 13:31:02');
INSERT INTO `fee_groups` VALUES (4,'2026-08-06 13:31:45','Exam Fee for Nusary, primary and secondary','Examination Fee','2026-08-06 13:31:45');
INSERT INTO `fee_groups` VALUES (5,'2026-08-06 13:32:00','','ID Card Fee','2026-08-06 13:32:00');
INSERT INTO `fee_groups` VALUES (6,'2026-08-06 13:32:33','','Uniform and Sport atairs Fee','2026-08-06 13:32:33');

DROP TABLE IF EXISTS `fee_masters`;
CREATE TABLE `fee_masters` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` double NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `fine_type` enum('CUMULATIVE','FIX_AMOUNT','NONE','PERCENTAGE') NOT NULL,
  `fix_amount` double DEFAULT NULL,
  `per_day` bit(1) NOT NULL,
  `percentage` double DEFAULT NULL,
  `session_year` varchar(20) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `fee_group_id` bigint NOT NULL,
  `fee_type_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5bb51f2w6lckbv44d5q542ynh` (`fee_group_id`),
  KEY `FK68kd3cs8fm1vf7xghjc9y4osc` (`fee_type_id`),
  CONSTRAINT `FK5bb51f2w6lckbv44d5q542ynh` FOREIGN KEY (`fee_group_id`) REFERENCES `fee_groups` (`id`),
  CONSTRAINT `FK68kd3cs8fm1vf7xghjc9y4osc` FOREIGN KEY (`fee_type_id`) REFERENCES `fee_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `fee_masters` VALUES (1,20.0,'2026-08-06 14:35:15','2026-08-06','FIX_AMOUNT',0.78,0,0.03,'2026-27','2026-08-06 15:09:08',1,1);

DROP TABLE IF EXISTS `fee_payments`;
CREATE TABLE `fee_payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `discount_amount` double DEFAULT NULL,
  `fee_master_id` bigint NOT NULL,
  `fine_amount` double DEFAULT NULL,
  `paid_amount` double NOT NULL,
  `payment_date` date NOT NULL,
  `payment_mode` varchar(30) DEFAULT NULL,
  `payment_ref` varchar(50) NOT NULL,
  `session_year` varchar(20) NOT NULL,
  `student_admission_id` bigint NOT NULL,
  `note` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK81vblcsf6n0otxb43wbbtfyk4` (`payment_ref`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `fee_payments` VALUES (2,'2026-08-06 15:45:08',0.0,1,0.78,70.0,'2026-08-06','Cash','TRX1786031108666','2026-27',1,'');
INSERT INTO `fee_payments` VALUES (3,'2026-08-06 15:57:19',0.0,1,0.0,0.78,'2026-08-06','Cash','TRX1786031839261','2026-27',4,'');
INSERT INTO `fee_payments` VALUES (4,'2026-08-06 15:58:15',0.0,1,0.78,98.0,'2026-08-06','Cash','TRX1786031895214','2026-27',4,'');

DROP TABLE IF EXISTS `fee_reminders`;
CREATE TABLE `fee_reminders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `days` int NOT NULL,
  `reminder_type` enum('AFTER','BEFORE') NOT NULL,
  `sort_order` int NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `fee_reminders` VALUES (1,0,'2026-08-06 14:20:17',2,'BEFORE',1,'2026-08-06 14:20:39');
INSERT INTO `fee_reminders` VALUES (2,0,'2026-08-06 14:20:17',5,'BEFORE',2,'2026-08-06 14:20:39');
INSERT INTO `fee_reminders` VALUES (3,0,'2026-08-06 14:20:17',2,'AFTER',3,'2026-08-06 14:20:39');
INSERT INTO `fee_reminders` VALUES (4,1,'2026-08-06 14:20:17',5,'AFTER',4,'2026-08-06 14:20:17');

DROP TABLE IF EXISTS `fee_types`;
CREATE TABLE `fee_types` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `fees_code` varchar(100) NOT NULL,
  `name` varchar(150) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKokrwp4i70vq4xbniu33n9qv41` (`fees_code`),
  UNIQUE KEY `UKrg9o35t6f7axedfyqyjuat71u` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `fee_types` VALUES (1,'2026-08-06 13:44:28','','adf','Admission Fee','2026-08-06 13:44:28');
INSERT INTO `fee_types` VALUES (2,'2026-08-06 13:45:01','','ftf','First Term Fee','2026-08-06 13:45:01');
INSERT INTO `fee_types` VALUES (3,'2026-08-06 13:45:21','','stf','Second Term Fee','2026-08-06 13:45:21');
INSERT INTO `fee_types` VALUES (4,'2026-08-06 13:45:40','','ttf','Third Term Fee','2026-08-06 13:45:40');
INSERT INTO `fee_types` VALUES (5,'2026-08-06 13:46:04','','rf','Registration Fee','2026-08-06 13:46:04');
INSERT INTO `fee_types` VALUES (6,'2026-08-06 13:46:45','','df','Discounts Fee','2026-08-06 13:46:45');
INSERT INTO `fee_types` VALUES (7,'2026-08-06 13:47:01','','cf','Curtion Fee','2026-08-06 13:47:01');

DROP TABLE IF EXISTS `fees`;
CREATE TABLE `fees` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `amount` double NOT NULL,
  `discount_amount` double DEFAULT NULL,
  `due_date` date NOT NULL,
  `fee_type` enum('ADMISSION_FEE','EXAM_FEE','LABORATORY_FEE','LIBRARY_FEE','OTHER','SPORTS_FEE','TRANSPORT_FEE','TUITION_FEE') NOT NULL,
  `late_fee` double DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_method` enum('BANK_TRANSFER','CASH','CHEQUE','CREDIT_CARD','DEBIT_CARD','ONLINE_PAYMENT') DEFAULT NULL,
  `payment_status` enum('OVERDUE','PAID','PARTIALLY_PAID','PENDING','REFUNDED','WAIVED') NOT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKh56p3es1h1lt6ge4cl3by4oko` (`student_id`),
  CONSTRAINT `FKh56p3es1h1lt6ge4cl3by4oko` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `fees_forward`;
CREATE TABLE `fees_forward` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `balance` double NOT NULL,
  `class_id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `section` varchar(20) NOT NULL,
  `status` varchar(30) NOT NULL,
  `student_admission_id` bigint NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fees_forward_student` (`student_admission_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `fees_forward` VALUES (1,2.08,2,'2026-08-06 14:09:19','2026-10-06','BLUE','Assigned',1,'2026-08-06 14:09:19');
INSERT INTO `fees_forward` VALUES (2,5.0,2,'2026-08-06 14:09:38','2026-10-06','WHITE','Assigned',3,'2026-08-06 14:09:38');

DROP TABLE IF EXISTS `front_cms_banners`;
CREATE TABLE `front_cms_banners` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `media_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `front_cms_banners` VALUES (1,'2026-08-19 14:13:29',1,'2026-08-19 14:13:29','ab1.png','/uploads/media/e3b3a692087d46e99d7bae28d13df8a7.png',1);
INSERT INTO `front_cms_banners` VALUES (3,'2026-08-19 14:13:44',1,'2026-08-19 14:13:44','Academics.png','/uploads/media/40b49150663246f59ab76c6644d31417.png',3);
INSERT INTO `front_cms_banners` VALUES (4,'2026-08-19 14:15:49',1,'2026-08-19 14:15:49','Addcourse.png','/uploads/media/be1de29fce964158b50de56767f921f3.png',4);

DROP TABLE IF EXISTS `front_cms_events`;
CREATE TABLE `front_cms_events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` text,
  `end_date` date DEFAULT NULL,
  `start_date` date NOT NULL,
  `title` varchar(200) NOT NULL,
  `venue` varchar(200) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `message_to_guardian` bit(1) DEFAULT NULL,
  `message_to_staff` bit(1) DEFAULT NULL,
  `message_to_student` bit(1) DEFAULT NULL,
  `meta_description` varchar(1000) DEFAULT NULL,
  `meta_keyword` varchar(500) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `show_sidebar` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `front_cms_events` VALUES (1,'2026-08-19 12:15:21',1,'2026-08-19 12:15:21',NULL,'2026-03-20','2026-03-18','Math Exhibition Model','school hall',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `front_cms_events` VALUES (2,'2026-08-19 12:15:21',1,'2026-08-19 12:15:21',NULL,NULL,'2026-02-13','Science Exhibition','school campus',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `front_cms_events` VALUES (3,'2026-08-19 12:15:21',1,'2026-08-19 12:15:21',NULL,'2026-04-06','2026-04-05','Annual Cultural Program','Class Room',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `front_cms_events` VALUES (4,'2026-08-19 12:17:06',1,'2026-08-19 12:17:06','testing','2026-08-30','2026-08-29','End of year Celebration','Makeni',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `front_cms_events` VALUES (5,'2026-08-19 12:26:09',1,'2026-08-19 12:26:09','Testing','2026-08-19','2026-08-19','Term Celebration','Makeni','/uploads/events/a5121306fdb94983ae4d5dad0a95f64e.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL);

DROP TABLE IF EXISTS `front_cms_galleries`;
CREATE TABLE `front_cms_galleries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` text,
  `gallery_images` text,
  `image_url` varchar(500) DEFAULT NULL,
  `meta_description` varchar(1000) DEFAULT NULL,
  `meta_keyword` varchar(500) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `show_sidebar` bit(1) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `front_cms_galleries` VALUES (1,'2026-08-19 13:22:26',1,'2026-08-19 13:22:26','Photos from the school annual day celebration.',NULL,NULL,NULL,NULL,NULL,1,'Annual Day Gallery');
INSERT INTO `front_cms_galleries` VALUES (2,'2026-08-19 13:24:42',1,'2026-08-19 13:24:42','testing','','/uploads/media/cb1053c0182c4544880c77cee304204b.png','','','',1,'Celebration Picture');
INSERT INTO `front_cms_galleries` VALUES (3,'2026-08-19 14:14:50',1,'2026-08-19 14:14:50','','','/uploads/media/9ea5b9f342d84f5a9ef306be9530e63f.png','','','',1,'fvdeveveverv');

DROP TABLE IF EXISTS `front_cms_media`;
CREATE TABLE `front_cms_media` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(40) DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `youtube_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `front_cms_media` VALUES (1,'2026-08-19 13:26:37',1,'2026-08-19 13:26:37','ab1.png','image','/uploads/media/e3b3a692087d46e99d7bae28d13df8a7.png',NULL);
INSERT INTO `front_cms_media` VALUES (2,'2026-08-19 13:38:20',1,'2026-08-19 13:38:20','ab1.png','image','/uploads/media/37b003dbefe0438a8fee678b497070a0.png',NULL);
INSERT INTO `front_cms_media` VALUES (3,'2026-08-19 13:47:17',1,'2026-08-19 13:47:17','Academics.png','image','/uploads/media/40b49150663246f59ab76c6644d31417.png',NULL);
INSERT INTO `front_cms_media` VALUES (4,'2026-08-19 14:15:31',1,'2026-08-19 14:15:31','Addcourse.png','image','/uploads/media/be1de29fce964158b50de56767f921f3.png',NULL);

DROP TABLE IF EXISTS `front_cms_menu_items`;
CREATE TABLE `front_cms_menu_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `external_url` varchar(500) DEFAULT NULL,
  `menu_id` bigint NOT NULL,
  `open_new_tab` bit(1) DEFAULT NULL,
  `page_id` bigint DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `front_cms_menu_items` VALUES (1,'2026-08-19 13:41:41',1,'2026-08-19 13:59:56','',1,1,NULL,1,'Testing',NULL);
INSERT INTO `front_cms_menu_items` VALUES (2,'2026-08-19 13:59:47',1,'2026-08-19 13:59:56',NULL,1,0,NULL,2,'Sport',NULL);
INSERT INTO `front_cms_menu_items` VALUES (3,'2026-08-19 14:00:15',1,'2026-08-19 14:00:15',NULL,2,0,NULL,1,'Testing',NULL);

DROP TABLE IF EXISTS `front_cms_menus`;
CREATE TABLE `front_cms_menus` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `system_menu` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `front_cms_menus` VALUES (1,'2026-08-19 13:22:26',1,'2026-08-19 13:22:26','Primary website menu','Main Menu',1);
INSERT INTO `front_cms_menus` VALUES (2,'2026-08-19 13:22:26',1,'2026-08-19 13:22:26','Footer website menu','Bottom Menu',1);

DROP TABLE IF EXISTS `front_cms_news`;
CREATE TABLE `front_cms_news` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `meta_description` varchar(1000) DEFAULT NULL,
  `meta_keyword` varchar(500) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `news_date` date NOT NULL,
  `show_sidebar` bit(1) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `front_cms_news` VALUES (1,'2026-08-19 13:22:27',1,'2026-08-19 13:22:27','The school library has added new educational and reference books.',NULL,NULL,NULL,NULL,'2026-03-18',1,'New Books Added to Library');
INSERT INTO `front_cms_news` VALUES (2,'2026-08-19 13:22:27',1,'2026-08-19 13:22:27','The schedule for the upcoming unit test has been published.',NULL,NULL,NULL,NULL,'2026-03-05',1,'Unit Test Schedule Released');
INSERT INTO `front_cms_news` VALUES (3,'2026-08-19 13:25:39',1,'2026-08-19 13:25:39','',NULL,'','','','2026-08-20',0,'Testing');

DROP TABLE IF EXISTS `front_cms_pages`;
CREATE TABLE `front_cms_pages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `meta_description` varchar(1000) DEFAULT NULL,
  `meta_keyword` varchar(500) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `page_type` varchar(40) DEFAULT NULL,
  `show_sidebar` bit(1) DEFAULT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `system_page` bit(1) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `front_cms_pages` VALUES (1,'2026-08-19 13:22:26',1,'2026-08-19 13:22:26',NULL,NULL,NULL,NULL,NULL,'STANDARD',1,'home',1,'Home');
INSERT INTO `front_cms_pages` VALUES (2,'2026-08-19 13:22:26',1,'2026-08-19 13:22:26',NULL,NULL,NULL,NULL,NULL,'STANDARD',1,'complain',1,'Complain');
INSERT INTO `front_cms_pages` VALUES (3,'2026-08-19 13:22:26',1,'2026-08-19 13:35:32','',NULL,'','','','STANDARD',1,'contact-us',1,'Contact Us');
INSERT INTO `front_cms_pages` VALUES (4,'2026-08-19 13:22:26',1,'2026-08-19 13:22:26',NULL,NULL,NULL,NULL,NULL,'STANDARD',1,'404',1,'404 Page');
INSERT INTO `front_cms_pages` VALUES (5,'2026-08-19 13:35:18',1,'2026-08-19 13:35:18','',NULL,'','','','STANDARD',1,'front-office',0,'Front office');

DROP TABLE IF EXISTS `front_cms_setting`;
CREATE TABLE `front_cms_setting` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `cookie_consent` text,
  `current_theme` varchar(40) NOT NULL,
  `facebook_url` varchar(400) DEFAULT NULL,
  `favicon_path` varchar(400) DEFAULT NULL,
  `footer_text` varchar(400) DEFAULT NULL,
  `front_cms_enabled` bit(1) NOT NULL,
  `google_analytics` text,
  `google_plus_url` varchar(400) DEFAULT NULL,
  `instagram_url` varchar(400) DEFAULT NULL,
  `language` varchar(40) NOT NULL,
  `language_rtl` bit(1) NOT NULL,
  `linkedin_url` varchar(400) DEFAULT NULL,
  `logo_path` varchar(400) DEFAULT NULL,
  `pinterest_url` varchar(400) DEFAULT NULL,
  `sidebar_complain` bit(1) NOT NULL,
  `sidebar_enabled` bit(1) NOT NULL,
  `sidebar_news` bit(1) NOT NULL,
  `twitter_url` varchar(400) DEFAULT NULL,
  `whatsapp_url` varchar(400) DEFAULT NULL,
  `youtube_url` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `front_cms_setting` VALUES (1,'2026-08-21 10:45:38',1,'2026-08-21 11:35:53','','shadow_white','https://www.facebook.com/a','/uploads/front-cms/favicon-22028c72-02f7-471a-a140-9e31bfc7ca0b.png','© Kan tech solution school 2026 All rights reserve',1,'<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
 window.dataLayer = window.dataLayer || [];
 function gtag(){dataLayer.push(arguments);}
 gtag(''js'', new Date());

 gtag(''config'', ''GA_TRACKING_ID'');
</script>','https://plus.google.com/a','https://www.instagram.com/a','English',0,'https://www.linkedin.com/a','/uploads/front-cms/logo-5a863e28-d506-481c-8dbe-a61105ea3134.jpg','https://in.pinterest.com/a',1,1,1,'https://twitter.com/a','https://www.whatsapp.com/a','https://www.youtube.com/a');

DROP TABLE IF EXISTS `gmeet_live_classes`;
CREATE TABLE `gmeet_live_classes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `class_date_time` datetime(6) NOT NULL,
  `class_name` varchar(100) DEFAULT NULL,
  `class_sections` text,
  `class_title` varchar(300) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by_id` varchar(50) DEFAULT NULL,
  `created_by_name` varchar(200) DEFAULT NULL,
  `created_by_role` varchar(100) DEFAULT NULL,
  `created_for_id` varchar(50) DEFAULT NULL,
  `created_for_name` varchar(200) DEFAULT NULL,
  `created_for_role` varchar(100) DEFAULT NULL,
  `description` text,
  `duration_minutes` int NOT NULL,
  `gmeet_url` varchar(500) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `section` varchar(50) DEFAULT NULL,
  `staff_id` varchar(50) DEFAULT NULL,
  `staff_name` varchar(200) DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `gmeet_live_classes` VALUES (1,'2026-08-31 17:28:00',NULL,'Class 1 (A)||Class 1 (B)||Class 1 (C)||Class 1 (D)||Class 1 (E)','GK Combined Online Classes','2026-08-08 16:14:26','9000','Joe Black','Super Admin','9002','Shivam Verma','Teacher','GK Combined Online Classes',25,'https://meet.google.com/demo-gk-class','Teacher',NULL,'9002','Shivam Verma','Awaited');
INSERT INTO `gmeet_live_classes` VALUES (2,'2026-08-30 15:00:00',NULL,'Class 2 (A)||Class 2 (B)','Extra Practice Class','2026-08-08 16:14:26','9000','Joe Black','Super Admin','9003','Sarah Johnson','Teacher','Extra Practice Class',30,'https://meet.google.com/demo-practice-class','Teacher',NULL,'9003','Sarah Johnson','Awaited');

DROP TABLE IF EXISTS `gmeet_live_meetings`;
CREATE TABLE `gmeet_live_meetings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `created_by_label` varchar(100) DEFAULT NULL,
  `description` text,
  `duration_minutes` int NOT NULL,
  `gmeet_url` varchar(500) DEFAULT NULL,
  `meeting_date_time` datetime(6) NOT NULL,
  `meeting_title` varchar(300) NOT NULL,
  `staff_ids` varchar(500) DEFAULT NULL,
  `staff_members` text,
  `status` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `gmeet_live_meetings` VALUES (1,'2026-08-08 17:22:08','Self','Online Teacher Training Meeting',36,'https://meet.google.com/demo-teacher-training','2026-08-31 17:33:00','Online Teacher Training Meeting','9002,9003,9004','Shivam Verma (Teacher : 9002)||Sarah Johnson (Teacher : 9003)||Michael Chen (Teacher : 9004)','Awaited');
INSERT INTO `gmeet_live_meetings` VALUES (2,'2026-08-08 17:22:08','Self','Monthly staff meeting',25,'https://meet.google.com/demo-staff-meeting','2026-08-30 14:00:00','Monthly staff meeting','9000,9001,9008','Joe Black (Super Admin : 9000)||Emily Davis (Admin : 9001)||David Wilson (Accountant : 9008)','Awaited');
INSERT INTO `gmeet_live_meetings` VALUES (3,'2026-08-08 17:22:08','Self','Parent Orientation Session',34,'https://meet.google.com/demo-parent-orientation','2026-08-29 11:15:00','Parent Orientation Session','9005,9007','James Anderson (Teacher : 9005)||Maria Lopez (Librarian : 9007)','Awaited');
INSERT INTO `gmeet_live_meetings` VALUES (4,'2026-08-08 17:24:09','Self','Please Attend the metting',45,'http://hdfhhhfh-meet.comjj','2026-08-09 05:23:00','Examination Meeting','9002,9003,9004','Shivam Verma (Teacher : 9002)||Sarah Johnson (Teacher : 9003)||Michael Chen (Teacher : 9004)','Awaited');
INSERT INTO `gmeet_live_meetings` VALUES (5,'2026-08-09 08:26:48','Self','testinf',40,'http://hdfhhhfh-meet.com','2026-08-09 08:26:00','Admin Meeting','9002,9003','Shivam Verma (Teacher : 9002)||William Abbot (Admin : 9003)','Awaited');
INSERT INTO `gmeet_live_meetings` VALUES (6,'2026-08-09 08:37:33','Self','testion',45,'https://meeting4358jkh','2026-08-09 08:36:00','fee Meetings','9003,9004,654','William Abbot (Admin : 9003)||Michael Chen (Teacher : 9004)||Aman Verma (Teacher : 654)','Awaited');

DROP TABLE IF EXISTS `gmeet_settings`;
CREATE TABLE `gmeet_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `api_key` varchar(500) DEFAULT NULL,
  `api_secret` varchar(500) DEFAULT NULL,
  `parent_live_class` bit(1) NOT NULL DEFAULT b'0',
  `updated_at` datetime(6) DEFAULT NULL,
  `use_google_calendar_api` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `gmeet_settings` VALUES (1,'988720996993-ctjb5ibg56b45fu505l3lv310bv55d79.apps.googleusercontent.com','XkSqRpcFacU2Gg6QqCZP8kVP',0,'2026-08-09 09:53:04',0);

DROP TABLE IF EXISTS `grades`;
CREATE TABLE `grades` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `grade_level` int NOT NULL,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKiy0ymcq1if9inn1kptglyvqp` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `holiday_types`;
CREATE TABLE `holiday_types` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKcjqhjl4wvi4gqer8f6pcov2ml` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `holiday_types` VALUES (1,'2026-08-11 12:52:30',1,'2026-08-11 12:52:30','Holiday');
INSERT INTO `holiday_types` VALUES (2,'2026-08-11 12:52:31',1,'2026-08-11 12:52:31','Vacation');
INSERT INTO `holiday_types` VALUES (3,'2026-08-11 12:52:31',1,'2026-08-11 12:52:31','Activity');
INSERT INTO `holiday_types` VALUES (4,'2026-08-11 12:52:31',1,'2026-08-11 12:52:31','EVENTS');
INSERT INTO `holiday_types` VALUES (5,'2026-08-11 12:52:31',1,'2026-08-11 12:52:31','School Events');
INSERT INTO `holiday_types` VALUES (6,'2026-08-11 12:54:08',1,'2026-08-11 12:54:08','Sport');

DROP TABLE IF EXISTS `homework_student_evaluations`;
CREATE TABLE `homework_student_evaluations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `document_name` varchar(255) DEFAULT NULL,
  `document_path` varchar(500) DEFAULT NULL,
  `homework_id` bigint NOT NULL,
  `marks` double DEFAULT NULL,
  `message` text,
  `student_admission_id` bigint NOT NULL,
  `student_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `homework_student_evaluations` VALUES (1,'2026-08-15 14:36:43',1,'2026-08-15 14:36:43','','',1,20.0,'',1,'Alhaji Mohamed Kanu');
INSERT INTO `homework_student_evaluations` VALUES (2,'2026-08-18 13:01:42',1,'2026-08-18 13:01:42','','',2,20.0,'',1,'Alhaji Mohamed Kanu');

DROP TABLE IF EXISTS `homeworks`;
CREATE TABLE `homeworks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `class_id` bigint DEFAULT NULL,
  `class_name` varchar(100) NOT NULL,
  `created_by` varchar(150) DEFAULT NULL,
  `description` text,
  `document_name` varchar(255) DEFAULT NULL,
  `document_path` varchar(500) DEFAULT NULL,
  `evaluation_date` date DEFAULT NULL,
  `homework_date` date NOT NULL,
  `max_marks` int DEFAULT NULL,
  `section` varchar(20) NOT NULL,
  `subject_group_id` bigint DEFAULT NULL,
  `subject_group_name` varchar(150) NOT NULL,
  `subject_id` bigint DEFAULT NULL,
  `subject_name` varchar(100) NOT NULL,
  `submission_date` date NOT NULL,
  `evaluated_by` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `homeworks` VALUES (1,'2026-08-15 14:09:16',1,'2026-08-15 15:18:44',2,'Class 1','Joe Black (9000)','This is a testing work',NULL,NULL,'2026-08-15','2026-08-14',30,'BLUE',1,'Class 1 Subject',3,'Science (SC003)','2026-08-17','Alhaji Mohamed Kanu');
INSERT INTO `homeworks` VALUES (2,'2026-08-18 13:01:09',1,'2026-08-18 13:01:42',2,'Class 1','Joe Black (9000)','What is Living thing',NULL,NULL,'2026-08-18','2026-08-17',20,'BLUE',1,'Class 1 Subject',3,'Science (SC003)','2026-08-18','Alhaji Mohamed Kanu');

DROP TABLE IF EXISTS `hostel_rooms`;
CREATE TABLE `hostel_rooms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cost_per_bed` decimal(12,2) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `number_of_bed` int NOT NULL,
  `room_number` varchar(100) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `hostel_id` bigint NOT NULL,
  `room_type_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_hostel_room_number` (`hostel_id`,`room_number`),
  KEY `FKt0rffik7y4hmtahhasvkcv0g3` (`room_type_id`),
  CONSTRAINT `FKd76d846uncn586lu8xauaq1` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`),
  CONSTRAINT `FKt0rffik7y4hmtahhasvkcv0g3` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `hostel_rooms` VALUES (1,500.00,'2026-08-05 15:57:08','',4,'B1','2026-08-05 15:57:08',1,1);
INSERT INTO `hostel_rooms` VALUES (2,500.00,'2026-08-05 15:58:04','',4,'A1','2026-08-05 15:58:04',2,2);
INSERT INTO `hostel_rooms` VALUES (3,250.00,'2026-08-05 15:58:48','',10,'G1','2026-08-05 15:58:48',3,3);

DROP TABLE IF EXISTS `hostels`;
CREATE TABLE `hostels` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `hostel_name` varchar(150) NOT NULL,
  `intake` int DEFAULT NULL,
  `hostel_type` varchar(50) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKmirkbsomf5n3r6l8oh8i6g1qb` (`hostel_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `hostels` VALUES (1,'Makeni','2026-08-05 15:35:22','only for boys','Kanu Hostel',50,'Boys','2026-08-05 15:35:22');
INSERT INTO `hostels` VALUES (2,'Makeni','2026-08-05 15:36:29','only for Girls','Andrews Hostel',50,'Girls','2026-08-05 15:36:29');
INSERT INTO `hostels` VALUES (3,'Makeni','2026-08-05 15:36:59','General','General Hostel',100,'Combine','2026-08-05 15:36:59');

DROP TABLE IF EXISTS `income_heads`;
CREATE TABLE `income_heads` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKfoofba6laen4465bq2pmmf4ng` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `income_heads` VALUES (1,'2026-08-09 13:28:09',1,'2026-08-09 13:28:09','Rent',NULL);
INSERT INTO `income_heads` VALUES (3,'2026-08-09 13:28:09',1,'2026-08-09 13:28:09','Donation',NULL);
INSERT INTO `income_heads` VALUES (4,'2026-08-09 13:28:09',1,'2026-08-09 13:28:09','Transport',NULL);
INSERT INTO `income_heads` VALUES (5,'2026-08-09 13:28:09',1,'2026-08-09 13:28:09','Fees',NULL);
INSERT INTO `income_heads` VALUES (6,'2026-08-09 13:28:09',1,'2026-08-09 13:28:09','Miscellaneous',NULL);
INSERT INTO `income_heads` VALUES (7,'2026-08-09 14:28:51',1,'2026-08-09 14:28:51','Sport Fee Income','The sport Fee income test');

DROP TABLE IF EXISTS `incomes`;
CREATE TABLE `incomes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `date` date NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `document_path` varchar(500) DEFAULT NULL,
  `income_head` varchar(100) NOT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `incomes` VALUES (1,'2026-08-09 13:28:09',1,'2026-08-09 13:28:09',400.00,'2026-08-31','Monthly bus rent collection',NULL,'Rent','6747676','Monthly Bus Rent');
INSERT INTO `incomes` VALUES (2,'2026-08-09 13:28:09',1,'2026-08-09 13:28:09',250.00,'2026-08-30','Donation received for student fees',NULL,'Donation','6747680','Fees Donation');
INSERT INTO `incomes` VALUES (4,'2026-08-09 13:33:13',1,'2026-08-09 13:33:13',150.00,'2026-08-09','testing',NULL,'Fees','00076','Sport Fee');

DROP TABLE IF EXISTS `inventory_issue_items`;
CREATE TABLE `inventory_issue_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `issue_date` date NOT NULL,
  `issue_to_code` varchar(50) DEFAULT NULL,
  `issue_to_id` bigint DEFAULT NULL,
  `issue_to_name` varchar(200) DEFAULT NULL,
  `note` varchar(500) DEFAULT NULL,
  `quantity` int NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `user_type` varchar(30) NOT NULL,
  `issued_by_id` bigint DEFAULT NULL,
  `item_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKodf12t707ityh8m84wfcephry` (`issued_by_id`),
  KEY `FKapsmfduvtr0p92vqnf8l1yrd6` (`item_id`),
  CONSTRAINT `FKapsmfduvtr0p92vqnf8l1yrd6` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`),
  CONSTRAINT `FKodf12t707ityh8m84wfcephry` FOREIGN KEY (`issued_by_id`) REFERENCES `staff_members` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `inventory_issue_items` VALUES (1,'2026-08-18 14:36:17',1,'2026-08-18 14:36:29','2026-08-10','003',4,'Gifty Hemans',NULL,1,'2026-08-18','Returned','Student',8,1);

DROP TABLE IF EXISTS `inventory_item_categories`;
CREATE TABLE `inventory_item_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKlh94sb6iqakw79t2i5nht5947` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `inventory_item_categories` VALUES (1,'2026-08-18 14:33:22',1,'2026-08-18 14:33:22','Books Stationery',NULL);
INSERT INTO `inventory_item_categories` VALUES (2,'2026-08-18 14:33:22',1,'2026-08-18 14:33:22','Staff Dress',NULL);
INSERT INTO `inventory_item_categories` VALUES (3,'2026-08-18 14:33:22',1,'2026-08-18 14:33:22','Furniture',NULL);
INSERT INTO `inventory_item_categories` VALUES (4,'2026-08-18 14:33:22',1,'2026-08-18 14:33:22','Sports',NULL);
INSERT INTO `inventory_item_categories` VALUES (5,'2026-08-18 14:33:22',1,'2026-08-18 14:33:22','Chemistry Lab Apparatus',NULL);
INSERT INTO `inventory_item_categories` VALUES (6,'2026-08-18 15:22:25',1,'2026-08-18 15:22:25','Programming',NULL);

DROP TABLE IF EXISTS `inventory_item_stock`;
CREATE TABLE `inventory_item_stock` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `document_name` varchar(255) DEFAULT NULL,
  `document_path` varchar(500) DEFAULT NULL,
  `purchase_price` decimal(12,2) DEFAULT NULL,
  `quantity` int NOT NULL,
  `quantity_symbol` varchar(1) NOT NULL,
  `stock_date` date NOT NULL,
  `item_id` bigint NOT NULL,
  `store_id` bigint DEFAULT NULL,
  `supplier_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4tu6lnulifaqlgha4xb53cvwu` (`item_id`),
  KEY `FKkaw06yw9feip2v53wmla0tgnn` (`store_id`),
  KEY `FKnp2gunq7ufg1fe00ntdsjlq2a` (`supplier_id`),
  CONSTRAINT `FK4tu6lnulifaqlgha4xb53cvwu` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`),
  CONSTRAINT `FKkaw06yw9feip2v53wmla0tgnn` FOREIGN KEY (`store_id`) REFERENCES `inventory_item_stores` (`id`),
  CONSTRAINT `FKnp2gunq7ufg1fe00ntdsjlq2a` FOREIGN KEY (`supplier_id`) REFERENCES `inventory_item_suppliers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `inventory_item_stock` VALUES (1,'2026-08-18 14:48:36',1,'2026-08-18 14:48:36','Testing',NULL,NULL,100.00,2,'+','2026-08-18',1,1,2);

DROP TABLE IF EXISTS `inventory_item_stores`;
CREATE TABLE `inventory_item_stores` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKg0iofmm7h0n85kfbe6ty8l2k5` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `inventory_item_stores` VALUES (1,'2026-08-18 14:46:21',1,'2026-08-18 15:21:16','Ch201','Chemistry Equipment','The basic idea about the proper and necessary chemistry lab apparatus should be cleared among the students.');
INSERT INTO `inventory_item_stores` VALUES (2,'2026-08-18 14:46:21',1,'2026-08-18 14:46:21','UND23','Uniform Dress Store',NULL);
INSERT INTO `inventory_item_stores` VALUES (3,'2026-08-18 15:21:16',1,'2026-08-18 15:21:16','LB2','Libraray Store',NULL);
INSERT INTO `inventory_item_stores` VALUES (4,'2026-08-18 15:21:16',1,'2026-08-18 15:21:16','SC2','Science Store',NULL);
INSERT INTO `inventory_item_stores` VALUES (5,'2026-08-18 15:21:16',1,'2026-08-18 15:21:16','FS342','Furniture Store',NULL);
INSERT INTO `inventory_item_stores` VALUES (6,'2026-08-18 15:21:16',1,'2026-08-18 15:21:16','sp55','Sports Store',NULL);

DROP TABLE IF EXISTS `inventory_item_suppliers`;
CREATE TABLE `inventory_item_suppliers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `address` varchar(400) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `phone` varchar(80) DEFAULT NULL,
  `contact_person_email` varchar(150) DEFAULT NULL,
  `contact_person_name` varchar(200) DEFAULT NULL,
  `contact_person_phone` varchar(80) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKkiu15dsc11qb854k2n14uk9lg` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `inventory_item_suppliers` VALUES (1,'2026-08-18 14:46:21',1,'2026-08-18 14:46:21',NULL,NULL,'Jhon smith Supplier',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `inventory_item_suppliers` VALUES (2,'2026-08-18 14:46:21',1,'2026-08-18 15:21:16',NULL,NULL,'Camlin Stationers',NULL,NULL,'Bruce Stark',NULL,NULL);
INSERT INTO `inventory_item_suppliers` VALUES (3,'2026-08-18 15:21:16',1,'2026-08-18 15:21:16',NULL,NULL,'David Furniture',NULL,NULL,'Peter',NULL,NULL);
INSERT INTO `inventory_item_suppliers` VALUES (4,'2026-08-18 15:26:01',1,'2026-08-18 15:26:01','Lunsar','mannie@gmail.com','Mannie Kanu','+23277242401','isatu@gmail.com','Isatu Jalloh','+23276806797','Testing');

DROP TABLE IF EXISTS `inventory_items`;
CREATE TABLE `inventory_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `available_quantity` int DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `category_id` bigint NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbxqjr70cs4li1ajv5emedadpd` (`category_id`),
  CONSTRAINT `FKbxqjr70cs4li1ajv5emedadpd` FOREIGN KEY (`category_id`) REFERENCES `inventory_item_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `inventory_items` VALUES (1,'2026-08-18 14:33:22',1,'2026-08-18 14:56:43',82,'Notebooks',1,NULL,'Piece');
INSERT INTO `inventory_items` VALUES (2,'2026-08-18 14:33:22',1,'2026-08-18 14:56:43',40,'Uniform',2,NULL,'Piece');
INSERT INTO `inventory_items` VALUES (3,'2026-08-18 14:33:22',1,'2026-08-18 14:56:43',15,'Class Board',3,NULL,'Piece');
INSERT INTO `inventory_items` VALUES (4,'2026-08-18 14:33:22',1,'2026-08-18 14:56:43',25,'Table chair',3,NULL,'Piece');
INSERT INTO `inventory_items` VALUES (5,'2026-08-18 14:33:22',1,'2026-08-18 14:56:43',12,'Cricket Bat',4,NULL,'Piece');
INSERT INTO `inventory_items` VALUES (6,'2026-08-18 14:33:22',1,'2026-08-18 14:56:43',8,'Projectors',5,NULL,'Piece');
INSERT INTO `inventory_items` VALUES (7,'2026-08-18 14:46:21',1,'2026-08-18 14:56:43',10,'Lab Equipment',5,NULL,'Piece');

DROP TABLE IF EXISTS `lesson_plan_comments`;
CREATE TABLE `lesson_plan_comments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `comment_text` text NOT NULL,
  `schedule_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `lesson_plan_comments` VALUES (1,'2026-08-11 14:56:55',1,'2026-08-11 14:56:55','Testing Comment',7);

DROP TABLE IF EXISTS `lesson_plan_details`;
CREATE TABLE `lesson_plan_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `comprehensive_questions` text,
  `general_objectives` text,
  `lesson_name` varchar(200) DEFAULT NULL,
  `presentation` text,
  `previous_knowledge` text,
  `schedule_id` bigint NOT NULL,
  `sub_topic` varchar(500) DEFAULT NULL,
  `teaching_method` text,
  `topic_name` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKee80dmtns9fnh90lx69trj59t` (`schedule_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `lesson_plan_details` VALUES (1,'2026-08-11 14:53:42',1,'2026-08-11 14:53:42',NULL,NULL,'The Grasshopper and the Ant',NULL,NULL,1,NULL,NULL,'The Ant');
INSERT INTO `lesson_plan_details` VALUES (2,'2026-08-11 14:53:42',1,'2026-08-11 14:53:42',NULL,NULL,'The Grasshopper and the Ant',NULL,NULL,2,NULL,NULL,'The Ant');
INSERT INTO `lesson_plan_details` VALUES (3,'2026-08-11 14:53:42',1,'2026-08-11 14:53:42',NULL,NULL,'The Grasshopper and the Ant',NULL,NULL,3,NULL,NULL,'The Ant');
INSERT INTO `lesson_plan_details` VALUES (4,'2026-08-11 14:53:42',1,'2026-08-11 14:53:42',NULL,NULL,'The Grasshopper and the Ant',NULL,NULL,4,NULL,NULL,'The Ant');
INSERT INTO `lesson_plan_details` VALUES (5,'2026-08-11 14:53:42',1,'2026-08-11 14:53:42',NULL,NULL,'The Grasshopper and the Ant',NULL,NULL,5,NULL,NULL,'The Ant');
INSERT INTO `lesson_plan_details` VALUES (6,'2026-08-11 14:53:42',1,'2026-08-11 14:53:42',NULL,NULL,'',NULL,NULL,6,NULL,NULL,'');
INSERT INTO `lesson_plan_details` VALUES (7,'2026-08-11 14:53:42',1,'2026-08-11 14:53:42',NULL,NULL,'',NULL,NULL,7,NULL,NULL,'');

DROP TABLE IF EXISTS `lesson_plan_lessons`;
CREATE TABLE `lesson_plan_lessons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `class_id` bigint DEFAULT NULL,
  `class_name` varchar(100) NOT NULL,
  `lesson_name` varchar(200) NOT NULL,
  `section` varchar(20) NOT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `subject_group_id` bigint DEFAULT NULL,
  `subject_group_name` varchar(150) NOT NULL,
  `subject_id` bigint DEFAULT NULL,
  `subject_name` varchar(100) NOT NULL,
  `academic_session` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `lesson_plan_lessons` VALUES (1,'2026-08-11 13:06:04',1,'2026-08-11 15:09:43',2,'Class 1','Chapter 1','A','210',1,'Class 1 Subject',21,'English','2023-24');
INSERT INTO `lesson_plan_lessons` VALUES (2,'2026-08-11 13:06:04',1,'2026-08-11 15:09:43',3,'Class 2','Size and Shape','A','230',2,'Class 2 Subject',22,'Hindi','2024-25');
INSERT INTO `lesson_plan_lessons` VALUES (3,'2026-08-11 13:06:04',1,'2026-08-11 15:09:43',4,'Class 3','First Day at School','A','MA002',3,'Class 3 Subject',2,'Mathematics','2023-24');
INSERT INTO `lesson_plan_lessons` VALUES (4,'2026-08-11 13:39:44',1,'2026-08-11 15:09:43',2,'Class 1','First Day at School','A','210',1,'Class 1 Subject',21,'English','2024-25');
INSERT INTO `lesson_plan_lessons` VALUES (5,'2026-08-11 13:39:44',1,'2026-08-11 15:09:43',2,'Class 1','The Wind and the Sun','A','210',1,'Class 1 Subject',21,'English','2023-24');
INSERT INTO `lesson_plan_lessons` VALUES (6,'2026-08-11 13:39:44',1,'2026-08-11 15:09:43',2,'Class 1','Storm in the Garden','A','210',1,'Class 1 Subject',21,'English','2023-24');
INSERT INTO `lesson_plan_lessons` VALUES (7,'2026-08-11 13:39:44',1,'2026-08-11 15:09:43',2,'Class 1','The Grasshopper and the Ant','A','210',1,'Class 1 Subject',21,'English','2024-25');
INSERT INTO `lesson_plan_lessons` VALUES (8,'2026-08-11 14:13:46',1,'2026-08-11 15:09:43',2,'Class 1','Class of Living Thing','BLUE','SC003',1,'Class 1 Subject',3,'Science','2023-24');
INSERT INTO `lesson_plan_lessons` VALUES (9,'2026-08-11 14:15:21',1,'2026-08-11 15:09:43',2,'Class 1','Fraction','BLUE','MA002',1,'Class 1 Subject',2,'Mathematics','2023-24');
INSERT INTO `lesson_plan_lessons` VALUES (10,'2026-08-11 14:15:21',1,'2026-08-11 15:09:43',2,'Class 1','Addition','BLUE','MA002',1,'Class 1 Subject',2,'Mathematics','2024-25');
INSERT INTO `lesson_plan_lessons` VALUES (11,'2026-08-11 14:15:21',1,'2026-08-11 15:09:43',2,'Class 1','Multiplication','BLUE','MA002',1,'Class 1 Subject',2,'Mathematics','2024-25');
INSERT INTO `lesson_plan_lessons` VALUES (12,'2026-08-11 14:15:21',1,'2026-08-11 15:09:43',2,'Class 1','Subtraction','BLUE','MA002',1,'Class 1 Subject',2,'Mathematics','2023-24');
INSERT INTO `lesson_plan_lessons` VALUES (13,'2026-08-11 14:15:21',1,'2026-08-11 15:09:43',2,'Class 1','Division','BLUE','MA002',1,'Class 1 Subject',2,'Mathematics','2024-25');

DROP TABLE IF EXISTS `lesson_plan_schedules`;
CREATE TABLE `lesson_plan_schedules` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `class_id` bigint DEFAULT NULL,
  `class_name` varchar(100) NOT NULL,
  `day_of_week` varchar(20) NOT NULL,
  `plan_date` date NOT NULL,
  `room_no` varchar(50) DEFAULT NULL,
  `section` varchar(20) NOT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `subject_id` bigint DEFAULT NULL,
  `subject_name` varchar(100) NOT NULL,
  `teacher_code` varchar(50) NOT NULL,
  `teacher_name` varchar(150) NOT NULL,
  `time_from` time NOT NULL,
  `time_to` time NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `lesson_plan_schedules` VALUES (1,'2026-08-11 14:25:17',1,'2026-08-11 14:25:17',NULL,'Class 1','Monday','2026-08-10','100','A','210',NULL,'English','9002','Shivam Verma','08:00:00','08:45:00');
INSERT INTO `lesson_plan_schedules` VALUES (2,'2026-08-11 14:25:17',1,'2026-08-11 14:25:17',NULL,'Class 1','Tuesday','2026-08-11','100','A','210',NULL,'English','9002','Shivam Verma','08:00:00','08:45:00');
INSERT INTO `lesson_plan_schedules` VALUES (3,'2026-08-11 14:25:17',1,'2026-08-11 14:25:17',NULL,'Class 1','Wednesday','2026-08-12','100','A','210',NULL,'English','9002','Shivam Verma','08:00:00','08:45:00');
INSERT INTO `lesson_plan_schedules` VALUES (4,'2026-08-11 14:25:17',1,'2026-08-11 14:25:17',NULL,'Class 1','Thursday','2026-08-13','100','A','210',NULL,'English','9002','Shivam Verma','08:00:00','08:45:00');
INSERT INTO `lesson_plan_schedules` VALUES (5,'2026-08-11 14:25:17',1,'2026-08-11 14:25:17',NULL,'Class 1','Friday','2026-08-14','100','A','210',NULL,'English','9002','Shivam Verma','08:00:00','08:45:00');
INSERT INTO `lesson_plan_schedules` VALUES (6,'2026-08-11 14:25:17',1,'2026-08-11 14:25:17',NULL,'Class 1','Saturday','2026-08-15','100','A','111',NULL,'Science','9002','Shivam Verma','08:00:00','08:45:00');
INSERT INTO `lesson_plan_schedules` VALUES (7,'2026-08-11 14:45:57',1,'2026-08-11 14:45:57',2,'Class 1','Monday','2026-08-10','Room1','BLUE','CSS01',NULL,'CSS','9002','Shivam Verma','08:00:00','08:45:00');

DROP TABLE IF EXISTS `lesson_plan_syllabus_status`;
CREATE TABLE `lesson_plan_syllabus_status` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `completed` bit(1) NOT NULL,
  `completion_date` date DEFAULT NULL,
  `topic_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKk618mwh1p5r32uc5jh0wkquti` (`topic_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `lesson_plan_syllabus_status` VALUES (1,'2026-08-11 13:39:44',1,'2026-08-11 13:39:44',1,'2026-04-01',13);
INSERT INTO `lesson_plan_syllabus_status` VALUES (2,'2026-08-11 13:39:44',1,'2026-08-11 13:39:44',1,'2026-04-03',14);
INSERT INTO `lesson_plan_syllabus_status` VALUES (3,'2026-08-11 13:39:44',1,'2026-08-11 13:39:44',1,'2026-04-14',15);
INSERT INTO `lesson_plan_syllabus_status` VALUES (4,'2026-08-11 13:39:44',1,'2026-08-11 13:39:44',1,'2026-04-17',16);
INSERT INTO `lesson_plan_syllabus_status` VALUES (5,'2026-08-11 13:39:44',1,'2026-08-11 13:39:44',1,'2026-04-30',17);
INSERT INTO `lesson_plan_syllabus_status` VALUES (6,'2026-08-11 13:39:44',1,'2026-08-11 13:39:44',1,'2026-04-24',18);

DROP TABLE IF EXISTS `lesson_plan_topics`;
CREATE TABLE `lesson_plan_topics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `topic_name` varchar(200) NOT NULL,
  `lesson_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKpj6dhi1oh8mjwx6yc717s182g` (`lesson_id`),
  CONSTRAINT `FKpj6dhi1oh8mjwx6yc717s182g` FOREIGN KEY (`lesson_id`) REFERENCES `lesson_plan_lessons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `lesson_plan_topics` VALUES (1,'2026-08-11 13:06:04',1,'2026-08-11 13:06:04','Alphabet',1);
INSERT INTO `lesson_plan_topics` VALUES (2,'2026-08-11 13:06:04',1,'2026-08-11 13:06:04','Vowels',1);
INSERT INTO `lesson_plan_topics` VALUES (3,'2026-08-11 13:06:04',1,'2026-08-11 13:06:04','Consonants',1);
INSERT INTO `lesson_plan_topics` VALUES (4,'2026-08-11 13:06:04',1,'2026-08-11 13:06:04','Big and Small',2);
INSERT INTO `lesson_plan_topics` VALUES (5,'2026-08-11 13:06:04',1,'2026-08-11 13:06:04','Circle',2);
INSERT INTO `lesson_plan_topics` VALUES (6,'2026-08-11 13:06:04',1,'2026-08-11 13:06:04','Square',2);
INSERT INTO `lesson_plan_topics` VALUES (7,'2026-08-11 13:06:04',1,'2026-08-11 13:06:04','Numbers 1-10',3);
INSERT INTO `lesson_plan_topics` VALUES (8,'2026-08-11 13:06:04',1,'2026-08-11 13:06:04','Counting Objects',3);
INSERT INTO `lesson_plan_topics` VALUES (13,'2026-08-11 13:39:44',1,'2026-08-11 13:39:44','1.1 Noun',1);
INSERT INTO `lesson_plan_topics` VALUES (14,'2026-08-11 13:39:44',1,'2026-08-11 13:39:44','2.1 School Life',4);
INSERT INTO `lesson_plan_topics` VALUES (15,'2026-08-11 13:39:44',1,'2026-08-11 13:39:44','3.1 The Wind',5);
INSERT INTO `lesson_plan_topics` VALUES (16,'2026-08-11 13:39:44',1,'2026-08-11 13:39:44','4.1 My Garden',6);
INSERT INTO `lesson_plan_topics` VALUES (17,'2026-08-11 13:39:44',1,'2026-08-11 13:39:44','5.1 The Ant',7);
INSERT INTO `lesson_plan_topics` VALUES (18,'2026-08-11 13:39:44',1,'2026-08-11 13:39:44','6.1 School Life',4);

DROP TABLE IF EXISTS `library_book_issues`;
CREATE TABLE `library_book_issues` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `due_date` date NOT NULL,
  `issue_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `book_id` bigint NOT NULL,
  `member_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6im4h2pprkrrsyhtlv76g3yls` (`book_id`),
  KEY `FKff0mxtiev174pusgdoa4550m8` (`member_id`),
  CONSTRAINT `FK6im4h2pprkrrsyhtlv76g3yls` FOREIGN KEY (`book_id`) REFERENCES `library_books` (`id`),
  CONSTRAINT `FKff0mxtiev174pusgdoa4550m8` FOREIGN KEY (`member_id`) REFERENCES `library_members` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `library_book_issues` VALUES (1,'2026-08-18 13:57:18',1,'2026-08-18 13:57:18','2026-08-18','2026-08-18',NULL,1,3);

DROP TABLE IF EXISTS `library_books`;
CREATE TABLE `library_books` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `available_copies` int DEFAULT NULL,
  `book_image_url` varchar(500) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `isbn` varchar(50) DEFAULT NULL,
  `language` varchar(50) DEFAULT NULL,
  `publication_year` int DEFAULT NULL,
  `publisher` varchar(100) DEFAULT NULL,
  `rack_number` varchar(50) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `total_copies` int DEFAULT NULL,
  `book_number` varchar(50) DEFAULT NULL,
  `book_price` decimal(12,2) DEFAULT NULL,
  `post_date` date DEFAULT NULL,
  `subject` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKed9rs17ag7secg821h9vdmauw` (`isbn`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `library_books` VALUES (1,'2026-08-18 13:27:24',1,'2026-08-18 13:57:18','Mohamed Kanu',99,NULL,'Financial Management','Limited Copies','ISBN01',NULL,NULL,'Kan Publishing House','010','Kan Financial Management',100,'KAN01',100.00,'2026-08-18','Financial Management');

DROP TABLE IF EXISTS `library_members`;
CREATE TABLE `library_members` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `library_card_no` varchar(50) NOT NULL,
  `member_type` varchar(30) NOT NULL,
  `student_admission_id` bigint DEFAULT NULL,
  `staff_member_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK9uiy9gxvkost2pqmqva6sx0ta` (`library_card_no`),
  UNIQUE KEY `UKaclmcf8ap6mjgdixie6rorhyu` (`student_admission_id`),
  UNIQUE KEY `UKcij587knpenngx3d8tg2chu65` (`staff_member_id`),
  CONSTRAINT `FK2l3ddxrs9snjhfyjoy3p1em34` FOREIGN KEY (`student_admission_id`) REFERENCES `student_admissions` (`id`),
  CONSTRAINT `FK5d4kdl9v4d51ip8sqi2dwxmp3` FOREIGN KEY (`staff_member_id`) REFERENCES `staff_members` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `library_members` VALUES (1,'2026-08-18 13:56:26',1,'2026-08-18 13:56:26','01L1','Student',4,NULL);
INSERT INTO `library_members` VALUES (2,'2026-08-18 13:56:26',1,'2026-08-18 13:56:26','02L2','Student',3,NULL);
INSERT INTO `library_members` VALUES (3,'2026-08-18 13:56:26',1,'2026-08-18 14:12:24','03L3','Student',1,NULL);
INSERT INTO `library_members` VALUES (4,'2026-08-18 14:19:16',1,'2026-08-18 14:19:17','04L4','Teacher',NULL,8);
INSERT INTO `library_members` VALUES (5,'2026-08-18 14:19:21',1,'2026-08-18 14:19:21','05L5','Teacher',NULL,7);
INSERT INTO `library_members` VALUES (6,'2026-08-18 14:19:26',1,'2026-08-18 14:19:26','06L6','Teacher',NULL,1);
INSERT INTO `library_members` VALUES (7,'2026-08-18 14:19:28',1,'2026-08-18 14:19:28','07L7','Teacher',NULL,5);
INSERT INTO `library_members` VALUES (8,'2026-08-18 14:19:35',1,'2026-08-18 14:19:35','08L8','Teacher',NULL,9);
INSERT INTO `library_members` VALUES (9,'2026-08-18 14:19:39',1,'2026-08-18 14:19:39','09L9','Teacher',NULL,6);

DROP TABLE IF EXISTS `library_transactions`;
CREATE TABLE `library_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `due_date` date NOT NULL,
  `fine_amount` double DEFAULT NULL,
  `issue_date` date NOT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('DAMAGED','ISSUED','LOST','OVERDUE','RETURNED') NOT NULL,
  `book_id` bigint NOT NULL,
  `issued_by` bigint DEFAULT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKco5gwv32tc6pkll0d0huot8sr` (`book_id`),
  KEY `FKo095tldr0pg9qt91hkjdjkku3` (`issued_by`),
  KEY `FKthllmavignfhyc6fqfl8m9tly` (`student_id`),
  CONSTRAINT `FKco5gwv32tc6pkll0d0huot8sr` FOREIGN KEY (`book_id`) REFERENCES `library_books` (`id`),
  CONSTRAINT `FKo095tldr0pg9qt91hkjdjkku3` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKthllmavignfhyc6fqfl8m9tly` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `login_credential_send_logs`;
CREATE TABLE `login_credential_send_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `recipient_details` text,
  `recipient_type` varchar(50) NOT NULL,
  `send_via` varchar(20) NOT NULL,
  `sent_at` datetime(6) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `user_type` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `login_credential_send_logs` VALUES (1,'2026-08-14 12:52:49',1,'2026-08-14 12:52:49','Class 1(BLUE), 1 student(s): 001 - Alhaji Mohamed Kanu','Class','Email','2026-08-14 12:52:49','SENT','Student');
INSERT INTO `login_credential_send_logs` VALUES (2,'2026-08-18 12:50:39',1,'2026-08-18 12:50:39','Class 1(BLUE), 1 student(s): 001 - Alhaji Mohamed Kanu','Class','Both','2026-08-18 12:50:39','SENT','Student');
INSERT INTO `login_credential_send_logs` VALUES (3,'2026-08-18 12:57:18',1,'2026-08-18 12:57:18','Class 1(BLUE), 1 student(s): 001 - Alhaji Mohamed Kanu','Class','Both','2026-08-18 12:57:18','SENT','Student');

DROP TABLE IF EXISTS `marks_divisions`;
CREATE TABLE `marks_divisions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `division_name` varchar(100) NOT NULL,
  `percent_from` double NOT NULL,
  `percent_upto` double NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `marks_divisions` VALUES (1,'2026-08-10 16:54:25',1,'2026-08-10 16:54:25','First',100.0,60.0);
INSERT INTO `marks_divisions` VALUES (2,'2026-08-10 16:54:25',1,'2026-08-10 16:54:25','Second',60.0,40.0);
INSERT INTO `marks_divisions` VALUES (3,'2026-08-10 16:54:25',1,'2026-08-10 16:54:25','Third',40.0,0.0);
INSERT INTO `marks_divisions` VALUES (4,'2026-08-10 16:55:27',1,'2026-08-10 16:55:27','Better',70.0,30.0);

DROP TABLE IF EXISTS `marks_grades`;
CREATE TABLE `marks_grades` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `exam_type` varchar(200) NOT NULL,
  `grade_name` varchar(50) NOT NULL,
  `grade_point` double NOT NULL,
  `percent_from` double NOT NULL,
  `percent_upto` double NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `marks_grades` VALUES (1,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','General Purpose (Pass/Fail)','Fail',0.0,0.0,40.0);
INSERT INTO `marks_grades` VALUES (2,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','General Purpose (Pass/Fail)','Pass',1.0,40.01,100.0);
INSERT INTO `marks_grades` VALUES (3,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','School Based Grading System','E',0.0,0.0,32.0);
INSERT INTO `marks_grades` VALUES (4,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','School Based Grading System','D',1.0,33.0,40.0);
INSERT INTO `marks_grades` VALUES (5,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','School Based Grading System','C2',2.0,41.0,50.0);
INSERT INTO `marks_grades` VALUES (6,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','School Based Grading System','C1',3.0,51.0,60.0);
INSERT INTO `marks_grades` VALUES (7,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','School Based Grading System','B2',4.0,61.0,70.0);
INSERT INTO `marks_grades` VALUES (8,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','School Based Grading System','B1',5.0,71.0,80.0);
INSERT INTO `marks_grades` VALUES (9,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','School Based Grading System','A2',6.0,81.0,90.0);
INSERT INTO `marks_grades` VALUES (10,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','School Based Grading System','A1',7.0,91.0,100.0);
INSERT INTO `marks_grades` VALUES (11,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','College Based Grading System','F',0.0,0.0,40.0);
INSERT INTO `marks_grades` VALUES (12,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','College Based Grading System','D',2.0,41.0,50.0);
INSERT INTO `marks_grades` VALUES (13,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','College Based Grading System','C',3.0,51.0,60.0);
INSERT INTO `marks_grades` VALUES (14,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','College Based Grading System','B-',4.0,61.0,70.0);
INSERT INTO `marks_grades` VALUES (15,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','College Based Grading System','B',5.0,71.0,80.0);
INSERT INTO `marks_grades` VALUES (16,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','College Based Grading System','B+',6.0,81.0,85.0);
INSERT INTO `marks_grades` VALUES (17,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','College Based Grading System','A',7.0,86.0,90.0);
INSERT INTO `marks_grades` VALUES (18,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','College Based Grading System','A+',8.0,91.0,95.0);
INSERT INTO `marks_grades` VALUES (19,'2026-08-10 16:19:23',1,'2026-08-10 16:19:23','','College Based Grading System','A++',9.0,96.0,100.0);
INSERT INTO `marks_grades` VALUES (20,'2026-08-10 16:22:16',1,'2026-08-10 16:22:16','testing','General Purpose (Pass/Fail)','A',4.5,0.03,0.1);
INSERT INTO `marks_grades` VALUES (21,'2026-08-10 16:23:14',1,'2026-08-10 16:23:14','','General Purpose (Pass/Fail)','B',4.0,0.0,2.0);

DROP TABLE IF EXISTS `marksheet_templates`;
CREATE TABLE `marksheet_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `background_image` varchar(500) DEFAULT NULL,
  `body_text` varchar(1000) DEFAULT NULL,
  `exam_center` varchar(200) DEFAULT NULL,
  `exam_name` varchar(200) DEFAULT NULL,
  `footer_text` varchar(500) DEFAULT NULL,
  `header_image` varchar(500) DEFAULT NULL,
  `left_logo` varchar(500) DEFAULT NULL,
  `left_sign` varchar(500) DEFAULT NULL,
  `middle_sign` varchar(500) DEFAULT NULL,
  `printing_date` varchar(100) DEFAULT NULL,
  `right_sign` varchar(500) DEFAULT NULL,
  `school_name` varchar(200) DEFAULT NULL,
  `show_admission_no` bit(1) DEFAULT NULL,
  `show_class` bit(1) DEFAULT NULL,
  `show_division` bit(1) DEFAULT NULL,
  `show_dob` bit(1) DEFAULT NULL,
  `show_exam_session` bit(1) DEFAULT NULL,
  `show_father_name` bit(1) DEFAULT NULL,
  `show_mother_name` bit(1) DEFAULT NULL,
  `show_name` bit(1) DEFAULT NULL,
  `show_photo` bit(1) DEFAULT NULL,
  `show_rank` bit(1) DEFAULT NULL,
  `show_remark` bit(1) DEFAULT NULL,
  `show_roll_number` bit(1) DEFAULT NULL,
  `show_section` bit(1) DEFAULT NULL,
  `template_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `marksheet_templates` VALUES (1,'2026-08-10 15:53:49',1,'2026-08-10 15:53:49',NULL,'CERTIFICATED THAT','GOVT GIRLS H S SCHOOL','HALF YEARLY EXAM','PASS IN SECOND DIVISION',NULL,NULL,NULL,NULL,'2021',NULL,'MOUNT CARMEL SCHOOL',1,1,1,1,1,1,1,1,1,1,1,1,1,'school marksheet');
INSERT INTO `marksheet_templates` VALUES (2,'2026-08-10 15:53:49',1,'2026-08-10 15:53:49',NULL,'CERTIFICATED THAT','Main Campus','ANNUAL EXAMINATION','PASS',NULL,NULL,NULL,NULL,'2023-24',NULL,'Smart School',1,1,1,1,1,1,1,1,1,0,1,1,1,'Marksheet');
INSERT INTO `marksheet_templates` VALUES (3,'2026-08-10 15:57:29',1,'2026-08-10 15:57:29',NULL,'','Makeni','Term Name','','/uploads/marksheets/e4bdc5f2-03ab-48ea-9604-1fae6445b2ea.png','/uploads/marksheets/9f4b7544-ffb4-4032-854a-efaacd95da74.png','/uploads/marksheets/af7410db-60de-42da-a16d-6a2bcb19b33d.png',NULL,'09/08/2026',NULL,'Saint Francis',1,1,1,1,1,1,1,1,1,1,1,1,1,'Transportation');

DROP TABLE IF EXISTS `multibranch_overview`;
CREATE TABLE `multibranch_overview` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `books_issued` int DEFAULT NULL,
  `branch_name` varchar(200) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `current_session` varchar(50) DEFAULT NULL,
  `display_order` int NOT NULL,
  `members` int DEFAULT NULL,
  `offline_admission` int DEFAULT NULL,
  `online_admission` int DEFAULT NULL,
  `section_type` varchar(50) NOT NULL,
  `total_balance_fees` double DEFAULT NULL,
  `total_books` int DEFAULT NULL,
  `total_fees` double DEFAULT NULL,
  `total_paid_fees` double DEFAULT NULL,
  `total_students` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `multibranch_overview` VALUES (1,NULL,'Home Branch','2026-08-08 14:35:00','2026-27',1,NULL,NULL,NULL,'fees',8939205.71,NULL,8984485.71,45280.0,89);
INSERT INTO `multibranch_overview` VALUES (2,NULL,'Mount Carmel School 1','2026-08-08 14:35:01','2026-27',2,NULL,NULL,NULL,'fees',100.0,NULL,1000.0,900.0,4);
INSERT INTO `multibranch_overview` VALUES (3,NULL,'Mount Carmel School 2','2026-08-08 14:35:01','2026-27',3,NULL,NULL,NULL,'fees',18225.0,NULL,24000.0,5775.0,6);
INSERT INTO `multibranch_overview` VALUES (4,NULL,'Home Branch','2026-08-08 14:35:01','2026-27',1,NULL,NULL,NULL,'transport-fees',53755.0,NULL,62600.0,8845.0,NULL);
INSERT INTO `multibranch_overview` VALUES (5,NULL,'Mount Carmel School 1','2026-08-08 14:35:01','2026-27',2,NULL,NULL,NULL,'transport-fees',10650.0,NULL,13750.0,3100.0,NULL);
INSERT INTO `multibranch_overview` VALUES (6,NULL,'Mount Carmel School 2','2026-08-08 14:35:01','2026-27',3,NULL,NULL,NULL,'transport-fees',28350.0,NULL,29950.0,1600.0,NULL);
INSERT INTO `multibranch_overview` VALUES (7,NULL,'Home Branch','2026-08-08 14:35:01','2026-27',1,NULL,7,0,'student-admission',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `multibranch_overview` VALUES (8,NULL,'Mount Carmel School 1','2026-08-08 14:35:01','2026-27',2,NULL,2,0,'student-admission',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `multibranch_overview` VALUES (9,NULL,'Mount Carmel School 2','2026-08-08 14:35:01','2026-27',3,NULL,2,0,'student-admission',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `multibranch_overview` VALUES (10,216,'Home Branch','2026-08-08 14:35:01',NULL,1,58,NULL,NULL,'library',NULL,29,NULL,NULL,NULL);
INSERT INTO `multibranch_overview` VALUES (11,40,'Mount Carmel School 1','2026-08-08 14:35:01',NULL,2,16,NULL,NULL,'library',NULL,12,NULL,NULL,NULL);
INSERT INTO `multibranch_overview` VALUES (12,40,'Mount Carmel School 2','2026-08-08 14:35:01',NULL,3,16,NULL,NULL,'library',NULL,11,NULL,NULL,NULL);

DROP TABLE IF EXISTS `multibranch_report_entries`;
CREATE TABLE `multibranch_report_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(100) DEFAULT NULL,
  `adjustment` double DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `branch` varchar(200) DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `category` varchar(200) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `detail` varchar(200) DEFAULT NULL,
  `handled_by` varchar(200) DEFAULT NULL,
  `ip_address` varchar(100) DEFAULT NULL,
  `login_time` varchar(50) DEFAULT NULL,
  `logout_time` varchar(50) DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `payment_id` varchar(100) DEFAULT NULL,
  `payment_mode` varchar(100) DEFAULT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `report_date` date NOT NULL,
  `report_type` varchar(50) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `user_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `multibranch_report_entries` VALUES (1,NULL,0.0,500.0,'Home Branch',NULL,'Grade 1 (A)','2026-08-08 13:47:33','Thomas','Joe Black(9000)',NULL,NULL,NULL,'Edward Thomas','101','Cash','1800011','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (2,NULL,0.0,750.0,'Home Branch',NULL,'Grade 2 (B)','2026-08-08 13:47:33','Johnson','Joe Black(9000)',NULL,NULL,NULL,'Sarah Johnson','102','Cash','1800012','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (3,NULL,25.0,1000.0,'Home Branch',NULL,'Grade 3 (A)','2026-08-08 13:47:33','Brown','Joe Black(9000)',NULL,NULL,NULL,'Michael Brown','103','Cheque','1800013','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (4,NULL,0.0,850.0,'Home Branch',NULL,'Grade 4 (C)','2026-08-08 13:47:33','Davis','Joe Black(9000)',NULL,NULL,NULL,'Emily Davis','104','Cash','1800014','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (5,NULL,0.0,1200.0,'Home Branch',NULL,'Grade 5 (B)','2026-08-08 13:47:33','Wilson','Joe Black(9000)',NULL,NULL,NULL,'Daniel Wilson','105','Online','1800015','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (6,NULL,0.0,600.0,'Mount Carmel School 1',NULL,'Grade 1 (B)','2026-08-08 13:47:33','Martinez','Joe Black(9000)',NULL,NULL,NULL,'Olivia Martinez','106','Cash','1800016','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (7,NULL,0.0,900.0,'Mount Carmel School 1',NULL,'Grade 2 (A)','2026-08-08 13:47:33','Anderson','Joe Black(9000)',NULL,NULL,NULL,'James Anderson','107','Cash','1800017','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (8,NULL,15.0,1100.0,'Mount Carmel School 1',NULL,'Grade 3 (C)','2026-08-08 13:47:33','Taylor','Joe Black(9000)',NULL,NULL,NULL,'Sophia Taylor','108','Cheque','1800018','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (9,NULL,0.0,950.0,'Mount Carmel School 2',NULL,'Grade 4 (A)','2026-08-08 13:47:33','Thomas','Joe Black(9000)',NULL,NULL,NULL,'William Thomas','109','Cash','1800019','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (10,NULL,0.0,1300.0,'Mount Carmel School 2',NULL,'Grade 5 (A)','2026-08-08 13:47:33','Jackson','Joe Black(9000)',NULL,NULL,NULL,'Ava Jackson','110','Online','1800020','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (11,NULL,0.0,700.0,'Home Branch',NULL,'Grade 6 (B)','2026-08-08 13:47:33','White','Joe Black(9000)',NULL,NULL,NULL,'Ethan White','111','Cash','1800021','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (12,NULL,0.0,800.0,'Home Branch',NULL,'Grade 7 (A)','2026-08-08 13:47:33','Harris','Joe Black(9000)',NULL,NULL,NULL,'Isabella Harris','112','Cash','1800022','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (13,NULL,10.0,1050.0,'Mount Carmel School 1',NULL,'Grade 8 (C)','2026-08-08 13:47:33','Clark','Joe Black(9000)',NULL,NULL,NULL,'Mason Clark','113','Cheque','1800023','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (14,NULL,0.0,1150.0,'Mount Carmel School 2',NULL,'Grade 9 (B)','2026-08-08 13:47:33','Lewis','Joe Black(9000)',NULL,NULL,NULL,'Mia Lewis','114','Cash','1800024','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (15,NULL,0.0,1400.0,'Home Branch',NULL,'Grade 10 (A)','2026-08-08 13:47:33','Walker','Joe Black(9000)',NULL,NULL,NULL,'Lucas Walker','115','Online','1800025','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (16,NULL,0.0,645.0,'Home Branch',NULL,'Grade 11 (B)','2026-08-08 13:47:33','Hall','Joe Black(9000)',NULL,NULL,NULL,'Charlotte Hall','116','Cash','1800026','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (17,NULL,0.0,1250.0,'Mount Carmel School 1',NULL,'Grade 12 (A)','2026-08-08 13:47:33','Allen','Joe Black(9000)',NULL,NULL,NULL,'Benjamin Allen','117','Cash','1800027','2026-03-08','daily-collection',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (18,NULL,50.0,2500.0,'Home Branch',NULL,'Bank Transfer','2026-08-08 13:47:33','Accountant','Admin(9000)',NULL,NULL,NULL,'Joe Black','PAY201','Bank Transfer','STF1001','2026-03-08','payroll',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (19,NULL,0.0,1800.0,'Home Branch',NULL,'Cash','2026-08-08 13:47:33','Teacher','Admin(9000)',NULL,NULL,NULL,'Mary Smith','PAY202','Cash','STF1002','2026-03-08','payroll',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (20,NULL,100.0,3200.0,'Mount Carmel School 1',NULL,'Cheque','2026-08-08 13:47:33','Principal','Admin(9000)',NULL,NULL,NULL,'John Carter','PAY203','Cheque','STF1003','2026-03-08','payroll',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (21,NULL,0.0,1600.0,'Mount Carmel School 1',NULL,'Bank Transfer','2026-08-08 13:47:33','Librarian','Admin(9000)',NULL,NULL,NULL,'Lisa Wong','PAY204','Bank Transfer','STF1004','2026-03-08','payroll',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (22,NULL,25.0,1750.0,'Mount Carmel School 2',NULL,'Cash','2026-08-08 13:47:33','Teacher','Admin(9000)',NULL,NULL,NULL,'Robert Lee','PAY205','Cash','STF1005','2026-03-08','payroll',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (23,NULL,0.0,2000.0,'Home Branch',NULL,'Cash','2026-08-08 13:47:33','General Fund','Joe Black(9000)',NULL,NULL,NULL,'Donation','IN101','Cash','INC001','2026-03-08','income',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (24,NULL,0.0,850.0,'Home Branch',NULL,'Online','2026-08-08 13:47:33','Library','Joe Black(9000)',NULL,NULL,NULL,'Book Sale','IN102','Online','INC002','2026-03-08','income',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (25,NULL,0.0,1500.0,'Mount Carmel School 1',NULL,'Cheque','2026-08-08 13:47:33','Annual Day','Joe Black(9000)',NULL,NULL,NULL,'Event Fee','IN103','Cheque','INC003','2026-03-08','income',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (26,NULL,0.0,1200.0,'Mount Carmel School 2',NULL,'Cash','2026-08-08 13:47:33','Transport','Joe Black(9000)',NULL,NULL,NULL,'Transport Fee','IN104','Cash','INC004','2026-03-08','income',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (27,NULL,0.0,450.0,'Home Branch',NULL,'Cash','2026-08-08 13:47:33','Utilities','Joe Black(9000)',NULL,NULL,NULL,'Electricity Bill','EX101','Cash','EXP001','2026-03-08','expense',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (28,NULL,0.0,320.0,'Home Branch',NULL,'Cheque','2026-08-08 13:47:33','Office','Joe Black(9000)',NULL,NULL,NULL,'Stationery','EX102','Cheque','EXP002','2026-03-08','expense',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (29,NULL,0.0,980.0,'Mount Carmel School 1',NULL,'Bank Transfer','2026-08-08 13:47:33','Building','Joe Black(9000)',NULL,NULL,NULL,'Maintenance','EX103','Bank Transfer','EXP003','2026-03-08','expense',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (30,NULL,0.0,210.0,'Mount Carmel School 1',NULL,'Online','2026-08-08 13:47:33','Utilities','Joe Black(9000)',NULL,NULL,NULL,'Internet Bill','EX104','Online','EXP004','2026-03-08','expense',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (31,NULL,0.0,540.0,'Mount Carmel School 2',NULL,'Cash','2026-08-08 13:47:33','Transport','Joe Black(9000)',NULL,NULL,NULL,'Transport Fuel','EX105','Cash','EXP005','2026-03-08','expense',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (32,NULL,0.0,275.0,'Mount Carmel School 2',NULL,'Cash','2026-08-08 13:47:33','Services','Joe Black(9000)',NULL,NULL,NULL,'Cleaning Service','EX106','Cash','EXP006','2026-03-08','expense',NULL,NULL);
INSERT INTO `multibranch_report_entries` VALUES (33,'Login',0.0,0.0,'Home Branch','Chrome',NULL,'2026-08-08 13:47:33',NULL,NULL,'192.168.1.10','08:15 AM','06:30 PM','Joe Black',NULL,NULL,NULL,'2026-03-08','user-log','Super Admin','USR9000');
INSERT INTO `multibranch_report_entries` VALUES (34,'Login',0.0,0.0,'Home Branch','Firefox',NULL,'2026-08-08 13:47:33',NULL,NULL,'192.168.1.11','08:45 AM','05:15 PM','Mary Smith',NULL,NULL,NULL,'2026-03-08','user-log','Accountant','USR9001');
INSERT INTO `multibranch_report_entries` VALUES (35,'Login',0.0,0.0,'Mount Carmel School 1','Chrome',NULL,'2026-08-08 13:47:33',NULL,NULL,'192.168.2.20','09:00 AM','05:45 PM','John Carter',NULL,NULL,NULL,'2026-03-08','user-log','Admin','USR9002');
INSERT INTO `multibranch_report_entries` VALUES (36,'Login',0.0,0.0,'Mount Carmel School 1','Edge',NULL,'2026-08-08 13:47:33',NULL,NULL,'192.168.2.21','07:55 AM','04:30 PM','Lisa Wong',NULL,NULL,NULL,'2026-03-08','user-log','Teacher','USR9003');
INSERT INTO `multibranch_report_entries` VALUES (37,'Login',0.0,0.0,'Mount Carmel School 2','Chrome',NULL,'2026-08-08 13:47:33',NULL,NULL,'192.168.3.30','08:10 AM','04:50 PM','Robert Lee',NULL,NULL,NULL,'2026-03-08','user-log','Teacher','USR9004');
INSERT INTO `multibranch_report_entries` VALUES (38,'Login',0.0,0.0,'Home Branch','Safari',NULL,'2026-08-08 13:47:33',NULL,NULL,'192.168.1.12','08:30 AM','05:00 PM','Emily Davis',NULL,NULL,NULL,'2026-03-08','user-log','Receptionist','USR9005');
INSERT INTO `multibranch_report_entries` VALUES (39,'Login',0.0,0.0,'Mount Carmel School 1','Chrome',NULL,'2026-08-08 13:47:33',NULL,NULL,'192.168.2.22','08:05 AM','04:40 PM','James Anderson',NULL,NULL,NULL,'2026-03-08','user-log','Teacher','USR9006');
INSERT INTO `multibranch_report_entries` VALUES (40,'Login',0.0,0.0,'Mount Carmel School 2','Firefox',NULL,'2026-08-08 13:47:33',NULL,NULL,'192.168.3.31','08:20 AM','05:10 PM','Sophia Taylor',NULL,NULL,NULL,'2026-03-08','user-log','Librarian','USR9007');
INSERT INTO `multibranch_report_entries` VALUES (41,'Login',0.0,0.0,'Home Branch','Chrome',NULL,'2026-08-08 13:47:33',NULL,NULL,'192.168.1.13','09:15 AM','06:00 PM','Daniel Wilson',NULL,NULL,NULL,'2026-03-08','user-log','Admin','USR9008');
INSERT INTO `multibranch_report_entries` VALUES (42,'Login',0.0,0.0,'Mount Carmel School 2','Edge',NULL,'2026-08-08 13:47:33',NULL,NULL,'192.168.3.32','07:50 AM','04:20 PM','Olivia Martinez',NULL,NULL,NULL,'2026-03-08','user-log','Teacher','USR9009');

DROP TABLE IF EXISTS `notice_boards`;
CREATE TABLE `notice_boards` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `message` text NOT NULL,
  `notice_date` date NOT NULL,
  `publish_to` varchar(50) NOT NULL,
  `show_on_website` bit(1) NOT NULL,
  `title` varchar(255) NOT NULL,
  `attachment_path` varchar(500) DEFAULT NULL,
  `message_to` text,
  `publish_on` date DEFAULT NULL,
  `send_by_email` bit(1) NOT NULL,
  `send_by_sms` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `notice_boards` VALUES (1,'2026-08-14 09:24:03',1,'2026-08-14 09:44:26','<p>My Message</p>','2026-08-14','Multiple',1,'Fee submission Reminder',NULL,'Student, Parent, Receptionist, Super Admin','2026-08-21',0,0);
INSERT INTO `notice_boards` VALUES (2,'2026-08-14 09:57:47',1,'2026-08-14 09:57:47','<p>Please Make sure you return your Book Collection</p>','2026-08-14','Multiple',1,'Notice for New Book Collection',NULL,'Student, Admin, Teacher, Accountant, Librarian, Receptionist, Super Admin','2026-08-30',1,1);

DROP TABLE IF EXISTS `notification_settings`;
CREATE TABLE `notification_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `event_key` varchar(100) NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `notify_email` bit(1) NOT NULL,
  `notify_mobile_app` bit(1) NOT NULL,
  `notify_sms` bit(1) NOT NULL,
  `notify_whatsapp` bit(1) NOT NULL,
  `recipient_guardian` bit(1) NOT NULL,
  `recipient_staff` bit(1) NOT NULL,
  `recipient_student` bit(1) NOT NULL,
  `sample_message` text,
  `sms_template_id` varchar(100) DEFAULT NULL,
  `sort_order` int NOT NULL,
  `whatsapp_template_id` varchar(100) DEFAULT NULL,
  `message_subject` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKm41lr7yq9l09mo7n3fia9lgr7` (`event_key`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `notification_settings` VALUES (1,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','online_admission_fees_submission','Online Admission Fees Submission',1,0,1,1,1,0,1,'Dear {guardian_name}, admission fee of {amount} for {student_name} has been received on {date}. Receipt No: {receipt_no}. - {school_name}','',1,'admission_fee_receipt','');
INSERT INTO `notification_settings` VALUES (2,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','fee_processing','Fee Processing',1,1,1,0,1,0,1,'Dear {guardian_name}, fee payment of {amount} for {student_name} is being processed. - {school_name}','',10,'','');
INSERT INTO `notification_settings` VALUES (3,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','fee_submission','Fee Submission',1,1,1,1,1,0,1,'Dear {guardian_name}, fee of {amount} has been submitted for {student_name} on {date}. - {school_name}','fee_submit',19,'fee_submit','');
INSERT INTO `notification_settings` VALUES (4,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','fee_reminder','Fees Reminder',1,1,1,1,1,0,1,'Dear {guardian_name}, this is a reminder that {amount} fee is due for {student_name}. Due date: {due_date}. - {school_name}','fee_reminder',22,'fee_reminder','');
INSERT INTO `notification_settings` VALUES (5,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','cbse_exam_result','CBSE Exam Result',1,1,1,1,1,0,1,'Dear {guardian_name}, CBSE exam result for {student_name} is now available. Exam: {exam_name}. - {school_name}','',3,'','');
INSERT INTO `notification_settings` VALUES (6,'2026-08-13 14:54:22',0,'2026-08-13 15:30:24','cbse_marksheet_pdf','CBSE Marksheet PDF',1,1,0,0,1,0,1,'Dear {guardian_name}, CBSE marksheet PDF for {student_name} is ready to download. - {school_name}','',6,'',NULL);
INSERT INTO `notification_settings` VALUES (7,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','exam_result','Exam Result',1,1,1,1,1,0,1,'Dear {guardian_name}, exam result for {student_name} has been published. Exam: {exam_name}, Roll No: {exam_roll_no}. - {school_name}','exam_result',18,'','');
INSERT INTO `notification_settings` VALUES (8,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','online_examination_publish_exam','Online Examination Publish Exam',1,1,1,0,1,0,1,'Dear {student_name}, online exam {exam_name} has been published. Start: {start_date} {start_time}. - {school_name}','',25,'','');
INSERT INTO `notification_settings` VALUES (9,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','homework','Homework',1,1,1,0,1,0,1,'Dear {guardian_name}, new homework has been assigned to {student_name} for {subject}. Due date: {due_date}. - {school_name}','',21,'','');
INSERT INTO `notification_settings` VALUES (10,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','homework_evaluation','Homework Evaluation',1,1,1,0,1,0,1,'Dear {guardian_name}, homework for {student_name} in {subject} has been evaluated. Remarks: {remarks}. - {school_name}','',35,'','');
INSERT INTO `notification_settings` VALUES (11,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','student_absent_attendance','Student Absent Attendance',1,1,1,1,1,0,1,'Dear {guardian_name}, {student_name} was absent on {date}. Class: {class} {section}. - {school_name}','student_absent',20,'student_absent','');
INSERT INTO `notification_settings` VALUES (12,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','student_present_attendance','Student Present Attendance',0,1,1,0,1,0,1,'Dear {guardian_name}, {student_name} was marked present on {date}. - {school_name}','',34,'','');
INSERT INTO `notification_settings` VALUES (13,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','staff_absent_attendance','Staff Absent Attendance',1,0,1,0,0,1,0,'Dear {staff_name}, you were marked absent on {date}. - {school_name}','staff_absent',37,'','');
INSERT INTO `notification_settings` VALUES (14,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','staff_present_attendance','Staff Present Attendance',0,0,1,0,0,1,0,'Dear {staff_name}, you were marked present on {date}. - {school_name}','',36,'','');
INSERT INTO `notification_settings` VALUES (15,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','zoom_live_classes','Zoom Live Classes',1,1,1,1,1,0,1,'Dear {student_name}, Zoom live class {class_name} starts on {date} at {time}. Join link: {join_url}. - {school_name}','zoom_class',27,'zoom_class','');
INSERT INTO `notification_settings` VALUES (16,'2026-08-13 14:54:22',1,'2026-08-13 17:28:31','zoom_live_meetings','Zoom Live Meetings',1,1,1,1,0,1,0,'Dear {staff_name}, Zoom meeting {meeting_title} starts on {date} at {time}. - {school_name}','zoom_meeting',28,'zoom_meeting','');
INSERT INTO `notification_settings` VALUES (17,'2026-08-13 14:54:23',1,'2026-08-13 17:28:31','gmeet_live_classes','Gmeet Live Classes',1,1,1,1,1,0,1,'Dear {student_name}, Google Meet class {class_name} starts on {date} at {time}. Join link: {join_url}. - {school_name}','gmeet_class',30,'gmeet_class','');
INSERT INTO `notification_settings` VALUES (18,'2026-08-13 14:54:23',0,'2026-08-13 15:30:24','gmeet_live_meetings','Gmeet Live Meetings',1,1,1,1,0,1,0,'Dear {staff_name}, Google Meet {meeting_title} starts on {date} at {time}. - {school_name}','gmeet_meeting',18,'gmeet_meeting',NULL);
INSERT INTO `notification_settings` VALUES (19,'2026-08-13 14:54:23',1,'2026-08-13 17:28:31','student_login_credential','Student Login Credential',1,0,1,0,1,0,1,'Dear {guardian_name}, login credentials for {student_name}. Username: {username}, Password: {password}. - {school_name}','student_login',12,'','');
INSERT INTO `notification_settings` VALUES (20,'2026-08-13 14:54:23',1,'2026-08-13 17:28:31','staff_login_credential','Staff Login Credential',1,0,1,0,0,1,0,'Dear {staff_name}, your login credentials. Username: {username}, Password: {password}. - {school_name}','staff_login',11,'','');
INSERT INTO `notification_settings` VALUES (21,'2026-08-13 14:54:23',1,'2026-08-13 17:28:31','forgot_password','Forgot Password',1,0,0,0,1,1,1,'Dear {name}, use this link to reset your password: {reset_link}. - {school_name}','',17,'','');
INSERT INTO `notification_settings` VALUES (22,'2026-08-13 14:54:23',1,'2026-08-13 17:28:31','student_apply_leave','Student Apply Leave',1,1,1,0,1,1,1,'Leave request submitted by {student_name} from {from_date} to {to_date}. Reason: {reason}. - {school_name}','',8,'','');
INSERT INTO `notification_settings` VALUES (23,'2026-08-13 14:54:23',0,'2026-08-13 15:30:24','staff_apply_leave','Staff Apply Leave',1,0,1,0,0,1,0,'Leave request submitted by {staff_name} from {from_date} to {to_date}. Reason: {reason}. - {school_name}','',23,'',NULL);
INSERT INTO `notification_settings` VALUES (24,'2026-08-13 14:54:23',0,'2026-08-13 15:30:24','online_admission_submission','Online Admission Submission',1,1,1,1,1,0,1,'Dear {guardian_name}, online admission application for {student_name} has been submitted successfully. Application No: {application_no}. - {school_name}','',24,'online_admission',NULL);
INSERT INTO `notification_settings` VALUES (25,'2026-08-13 14:54:23',0,'2026-08-13 15:30:24','behaviour_incident','Behaviour Incident',1,1,1,0,1,1,1,'Dear {guardian_name}, a behaviour incident has been recorded for {student_name} on {date}. Incident: {incident_title}. - {school_name}','',25,'',NULL);
INSERT INTO `notification_settings` VALUES (26,'2026-08-13 15:03:04',1,'2026-08-13 17:28:31','online_course_purchase','Online Course Purchase',1,1,1,1,1,0,1,'Dear {student_name}, your online course purchase for {course_name} is confirmed. Amount: {amount}, Reference: {reference_no}. - {school_name}','course_purchase',13,'course_purchase','');
INSERT INTO `notification_settings` VALUES (27,'2026-08-13 15:03:04',0,'2026-08-13 15:30:24','online_course_offline_payment','Online Course Offline Payment',1,1,1,0,1,0,1,'Dear {student_name}, offline payment for {course_name} has been submitted and is pending approval. - {school_name}','',27,'',NULL);
INSERT INTO `notification_settings` VALUES (28,'2026-08-13 15:03:04',0,'2026-08-13 15:30:24','online_exam_result','Online Exam Result',1,1,1,1,1,0,1,'Dear {student_name}, your online exam result for {exam_name} is published. Score: {marks_obtained}/{total_marks}. - {school_name}','online_exam_result',28,'',NULL);
INSERT INTO `notification_settings` VALUES (29,'2026-08-13 15:03:04',0,'2026-08-13 15:30:24','approve_leave','Approve Leave',1,1,1,0,1,1,1,'Dear {name}, your leave request from {from_date} to {to_date} has been approved. - {school_name}','',29,'',NULL);
INSERT INTO `notification_settings` VALUES (30,'2026-08-13 15:03:04',0,'2026-08-13 15:30:24','reject_leave','Reject Leave',1,1,1,0,1,1,1,'Dear {name}, your leave request from {from_date} to {to_date} has been rejected. Reason: {reason}. - {school_name}','',30,'',NULL);
INSERT INTO `notification_settings` VALUES (31,'2026-08-13 15:03:04',1,'2026-08-13 17:28:31','student_admission','Student Admission',1,1,1,1,1,0,1,'Dear {guardian_name}, {student_name} has been admitted to {class} {section}. Admission No: {admission_no}. - {school_name}','student_admission',15,'student_admission','');
INSERT INTO `notification_settings` VALUES (32,'2026-08-13 15:03:04',0,'2026-08-13 15:30:24','notice_board','Notice Board',1,1,1,1,1,1,1,'New notice published: {notice_title}. Date: {date}. Please check the portal. - {school_name}','notice_board',32,'notice_board',NULL);
INSERT INTO `notification_settings` VALUES (33,'2026-08-13 15:03:04',0,'2026-08-13 15:30:24','library_book_issue','Library Book Issue',1,1,1,0,1,1,1,'Dear {student_name}, book {book_title} has been issued. Due date: {due_date}. - {school_name}','',33,'',NULL);
INSERT INTO `notification_settings` VALUES (34,'2026-08-13 15:03:04',0,'2026-08-13 15:30:24','library_book_return','Library Book Return',1,1,0,0,1,1,1,'Dear {student_name}, book {book_title} has been returned on {date}. - {school_name}','',34,'',NULL);
INSERT INTO `notification_settings` VALUES (35,'2026-08-13 15:03:04',0,'2026-08-13 15:30:24','transport_fee','Transport Fee',1,1,1,1,1,0,1,'Dear {guardian_name}, transport fee of {amount} is due for {student_name}. Route: {route_name}. - {school_name}','transport_fee',35,'',NULL);
INSERT INTO `notification_settings` VALUES (36,'2026-08-13 15:03:04',0,'2026-08-13 15:30:24','email_sms_schedule','Email / SMS Schedule',1,0,1,0,1,1,1,'Scheduled message: {message}. - {school_name}','',36,'',NULL);
INSERT INTO `notification_settings` VALUES (37,'2026-08-13 15:03:04',0,'2026-08-13 15:30:24','login_credential_send','Login Credential Send',1,0,1,0,1,1,1,'Dear {name}, your login credentials have been sent. Username: {username}. - {school_name}','login_credential',37,'',NULL);
INSERT INTO `notification_settings` VALUES (38,'2026-08-13 15:03:04',1,'2026-08-13 17:28:31','online_admission_fees_processing','Online Admission Fees Processing',1,1,1,0,1,0,1,'Dear {guardian_name}, admission fee payment for {student_name} is being processed. Reference: {reference_no}. - {school_name}','',9,'','');
INSERT INTO `notification_settings` VALUES (39,'2026-08-13 15:03:05',0,'2026-08-13 15:30:24','cbse_exam_schedule','CBSE Exam Schedule',1,1,1,1,1,0,1,'Dear {student_name}, CBSE exam schedule for {exam_name} is published. Date: {date}, Time: {time}. - {school_name}','',39,'',NULL);
INSERT INTO `notification_settings` VALUES (40,'2026-08-13 15:03:05',0,'2026-08-13 15:30:24','daily_assignment','Daily Assignment',1,1,1,0,1,0,1,'Dear {student_name}, daily assignment for {subject} has been posted. Due date: {due_date}. - {school_name}','',40,'',NULL);
INSERT INTO `notification_settings` VALUES (41,'2026-08-13 15:03:05',0,'2026-08-13 15:30:24','event_reminder','Event Reminder',1,1,1,1,1,1,1,'Reminder: {event_title} on {date} at {time}. Venue: {venue}. - {school_name}','event_reminder',41,'event_reminder',NULL);
INSERT INTO `notification_settings` VALUES (42,'2026-08-13 15:03:05',0,'2026-08-13 15:30:24','staff_rating','Staff Rating',1,1,1,0,0,1,0,'Dear {staff_name}, a new rating has been submitted. Rating: {rating}. - {school_name}','',42,'',NULL);
INSERT INTO `notification_settings` VALUES (43,'2026-08-13 15:03:05',0,'2026-08-13 15:30:24','visitor_book','Visitor Book',1,0,1,0,0,1,0,'Visitor {visitor_name} checked in on {date} at {time}. Purpose: {purpose}. - {school_name}','',43,'',NULL);
INSERT INTO `notification_settings` VALUES (44,'2026-08-13 15:30:23',0,'2026-08-13 17:27:29','payment_received','Payment Received',1,1,1,1,1,0,1,'Dear {guardian_name}, payment of {amount} has been received for {student_name} on {date}. Reference: {reference_no}. - {school_name}','payment_received',38,'payment_received',NULL);
INSERT INTO `notification_settings` VALUES (45,'2026-08-13 15:30:24',0,'2026-08-13 17:27:29','fees_submit','Fees Submit',1,1,1,1,1,0,1,'Dear {guardian_name}, fee of {amount} has been submitted for {student_name} on {date}. - {school_name}','fee_submit',39,'fee_submit',NULL);
INSERT INTO `notification_settings` VALUES (46,'2026-08-13 15:30:24',0,'2026-08-13 17:27:29','fees_add_detail','Fees Add Detail',1,1,1,0,1,0,1,'Dear {guardian_name}, fee details have been added for {student_name}. Amount: {amount}. - {school_name}','',40,'',NULL);
INSERT INTO `notification_settings` VALUES (47,'2026-08-13 15:30:24',1,'2026-08-13 17:28:31','online_admission_start','Online Admission Start',1,1,1,1,1,0,1,'Dear {guardian_name}, online admission for {student_name} has started. Application No: {application_no}. - {school_name}','',23,'online_admission_start','');
INSERT INTO `notification_settings` VALUES (48,'2026-08-13 15:30:24',0,'2026-08-13 17:27:29','online_admission_receipt_admin','Online Admission Receipt Admin',1,0,1,0,0,1,0,'Online admission receipt generated for {student_name}. Application No: {application_no}. Amount: {amount}. - {school_name}','',41,'',NULL);
INSERT INTO `notification_settings` VALUES (49,'2026-08-13 15:30:24',0,'2026-08-13 17:27:29','online_admission_fees_admin','Online Admission Fees Admin',1,0,1,0,0,1,0,'Online admission fee received for {student_name}. Amount: {amount}. Transaction ID: {transaction_id}. - {school_name}','',42,'',NULL);
INSERT INTO `notification_settings` VALUES (50,'2026-08-13 15:30:24',0,'2026-08-13 17:27:29','book_issue','Book Issue',1,1,1,0,1,0,1,'Dear {student_name}, book {book_title} has been issued. Due date: {due_date}. - {school_name}','',43,'',NULL);
INSERT INTO `notification_settings` VALUES (51,'2026-08-13 15:30:24',0,'2026-08-13 17:27:29','issue_return','Issue Return',1,1,0,0,1,1,1,'Dear {student_name}, book {book_title} has been returned on {date}. - {school_name}','',44,'',NULL);
INSERT INTO `notification_settings` VALUES (52,'2026-08-13 15:30:24',0,'2026-08-13 17:27:29','issue_item','Issue Item',1,0,1,0,0,1,0,'Item {item_name} has been issued to {staff_name} on {date}. - {school_name}','',45,'',NULL);
INSERT INTO `notification_settings` VALUES (53,'2026-08-13 15:30:24',0,'2026-08-13 17:27:29','collect_fees','Collect Fees',1,1,1,1,1,0,1,'Dear {guardian_name}, fees of {amount} collected for {student_name}. Receipt No: {receipt_no}. - {school_name}','collect_fees',46,'collect_fees',NULL);
INSERT INTO `notification_settings` VALUES (54,'2026-08-13 15:30:24',0,'2026-08-13 17:27:29','exam_results','Exam Results',1,0,1,0,1,0,1,'Dear parents, the results for the recent exam have been published. Please check the student portal for {student_name}''s performance. Thank you.','exam_results',47,'',NULL);
INSERT INTO `notification_settings` VALUES (55,'2026-08-13 15:30:24',0,'2026-08-13 17:27:29','lesson_plan','Lesson Plan',1,1,1,0,1,1,1,'Dear {staff_name}, lesson plan for {subject} class {class} {section} has been updated. - {school_name}','',48,'',NULL);
INSERT INTO `notification_settings` VALUES (56,'2026-08-13 15:56:35',1,'2026-08-13 17:28:31','behaviour_incident_assigned','Behaviour Incident Assigned',1,0,0,0,1,0,1,'A new {{incident_title}} behaviour incident with {{incident_point}} point is assigned on you. {{student_name}} {{class}} {{section}} {{admission_no}} {{mobileno}} {{email}} {{guardian_name}} {{guardian_phone}} {{guardian_email}}','',2,'HXd7195c2d239676124c4e08f58232f04a','');
INSERT INTO `notification_settings` VALUES (57,'2026-08-13 15:56:35',1,'2026-08-13 17:28:31','cbse_exam_marksheet_pdf','CBSE Exam Markseet Pdf',1,0,0,0,1,0,1,'Dear {{student_name}} ({{admission_no}}) {{class}} Section {{section}}. We have mailed you the marksheet with Roll no.{{roll_no}}','',4,'','');
INSERT INTO `notification_settings` VALUES (58,'2026-08-13 15:56:35',1,'2026-08-13 17:28:31','online_course_guest_user_sign_up','Online Course Guest User Sign Up',1,0,0,0,0,0,1,'Dear {{guest_user_name}} you have successfully sign up with Email: {{email}} Url {{url}}','',5,'','');
INSERT INTO `notification_settings` VALUES (59,'2026-08-13 16:04:03',1,'2026-08-13 17:28:31','online_course_purchase_for_guest_user','Online Course Purchase For Guest User',1,0,0,0,0,0,1,'Thanks for purchasing course {{title}} discount {{discount}} amount {{price}} purchase date {{purchase_date}}','',6,'','');
INSERT INTO `notification_settings` VALUES (60,'2026-08-13 16:04:03',1,'2026-08-13 17:28:31','email_pdf_exam_marksheet','Email PDF Exam Marksheet',1,0,0,0,1,0,1,'Dear {{student_name}} ({{admission_no}}) {{class}} Section {{section}}. We have mailed you the marksheet of Exam {{exam}} Roll no.{{roll_no}}','',7,'','');
INSERT INTO `notification_settings` VALUES (61,'2026-08-13 16:25:38',1,'2026-08-13 17:28:31','online_course_publish','Online Course Publish',1,0,0,0,1,0,1,'Dear student, a new online course {{title}} and price {{price}} with discount {{discount}} for {{class}} {{section}} is {{paid_free}} now available and assign to {{assign_teacher}}.','',14,'HXd7195c2d239676124c4e08f58232f04a','');
INSERT INTO `notification_settings` VALUES (62,'2026-08-13 16:34:31',1,'2026-08-13 17:28:31','online_admission_form_submission','Online Admission Form Submission',1,0,0,0,1,0,1,'Dear {{firstname}} {{lastname}} your online admission form has been submitted successfully on date {{date}}. Your Reference number is {{reference_no}}. Please remember your reference number for further process.','',16,'','');
INSERT INTO `notification_settings` VALUES (63,'2026-08-13 16:42:04',1,'2026-08-13 17:28:31','zoom_live_meetings_start','Zoom Live Meetings Start',0,0,0,0,0,1,0,'Dear {{name}}, your live meeting {{title}} has been started for the duration of {{duration}} minute.','',24,'','');
INSERT INTO `notification_settings` VALUES (64,'2026-08-13 16:51:40',1,'2026-08-13 17:28:31','online_examination_publish_result','Online Examination Publish Result',1,0,0,0,1,0,1,'Dear {{student_name}} ({{admission_no}}), online exam {{exam_title}} result has been published.','',26,'','');
INSERT INTO `notification_settings` VALUES (65,'2026-08-13 16:51:40',1,'2026-08-13 17:28:31','gmeet_live_meeting','Gmeet Live Meeting',1,0,0,0,0,1,0,'Dear staff, your live meeting {{title}} has been scheduled on {{date}} for the duration of {{duration}} minute, please do not share the link to any body.','',29,'HX6feef977fb43981e9e9a6ada5cb9a54f','');
INSERT INTO `notification_settings` VALUES (66,'2026-08-13 16:51:40',1,'2026-08-13 17:28:31','gmeet_live_meeting_start','Gmeet Live Meeting Start',1,0,0,0,0,1,0,'Dear {{name}}, your live meeting {{title}} has been started for the duration of {{duration}} minute.','',31,'HX6feef977fb43981e9e9a6ada5cb9a54f','');
INSERT INTO `notification_settings` VALUES (67,'2026-08-13 16:59:16',1,'2026-08-13 17:28:31','gmeet_live_classes_start','Gmeet Live Classes Start',1,0,0,0,1,0,1,'Dear student, your live class {{title}} has been started for the duration of {{duration}} minute.','',32,'HX6feef977fb43981e9e9a6ada5cb9a54f','');
INSERT INTO `notification_settings` VALUES (68,'2026-08-13 16:59:16',1,'2026-08-13 17:28:31','zoom_live_classes_start','Zoom Live Classes Start',1,0,0,0,1,0,1,'Dear student, your live class {{title}} has been started for the duration of {{duration}} minute.','',33,'HX6feef977fb43981e9e9a6ada5cb9a54f','');

DROP TABLE IF EXISTS `offline_bank_payments`;
CREATE TABLE `offline_bank_payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admission_no` varchar(50) DEFAULT NULL,
  `amount` double NOT NULL,
  `class_label` varchar(100) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `note` text,
  `payment_date` date NOT NULL,
  `payment_id` varchar(50) DEFAULT NULL,
  `status` enum('APPROVED','PENDING') NOT NULL,
  `status_date` datetime(6) DEFAULT NULL,
  `student_admission_id` bigint DEFAULT NULL,
  `student_name` varchar(200) NOT NULL,
  `submit_date` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `online_course_categories`;
CREATE TABLE `online_course_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_name` varchar(150) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6tvwwus2dmcte256k0evybmqb` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `online_course_categories` VALUES (1,'Personal Development','2026-08-07 14:57:25','2026-08-07 14:57:25');
INSERT INTO `online_course_categories` VALUES (2,'Health & Fitness Courses','2026-08-07 14:57:25','2026-08-07 14:57:25');
INSERT INTO `online_course_categories` VALUES (3,'Network & Security Course','2026-08-07 14:57:25','2026-08-07 14:57:25');
INSERT INTO `online_course_categories` VALUES (4,'Lifestyle course','2026-08-07 14:57:25','2026-08-07 14:57:25');
INSERT INTO `online_course_categories` VALUES (5,'UPGRADE SKILL','2026-08-07 14:57:25','2026-08-07 14:57:25');
INSERT INTO `online_course_categories` VALUES (7,'PRogramming Java','2026-08-07 14:57:55','2026-08-07 14:57:55');

DROP TABLE IF EXISTS `online_course_certificate_templates`;
CREATE TABLE `online_course_certificate_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `certificate_name` varchar(255) NOT NULL,
  `certificate_text` text NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `background_image_url` varchar(500) DEFAULT NULL,
  `design_font` varchar(100) DEFAULT NULL,
  `design_font_size` varchar(20) DEFAULT NULL,
  `design_layout` varchar(50) DEFAULT NULL,
  `design_text_color` varchar(30) DEFAULT NULL,
  `design_title_color` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `online_course_certificate_templates` VALUES (1,'Sample Transfer Certificate 1','This is to certify that Mr./Ms. [student_name] has successfully completed the [course_name] under [assign_teacher]. The course ran from [start_date] to [completion_date] for Class [class_name], Section [section_name]. Issued on [current_date].','2026-08-07 14:21:54','2026-08-07 14:21:54',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `online_course_certificate_templates` VALUES (2,'Sample Transfer Certificate 2','This is to certify that Mr./Ms. [student_name] has successfully completed the [course_name] under [assign_teacher]. The course ran from [start_date] to [completion_date] for Class [class_name], Section [section_name]. Issued on [current_date].','2026-08-07 14:21:54','2026-08-07 14:21:54',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `online_course_certificate_templates` VALUES (3,'Sample Transfer Certificate 3','This is to certify that Mr./Ms. [student_name] has successfully completed the [course_name] under [assign_teacher]. The course ran from [start_date] to [completion_date] for Class [class_name], Section [section_name]. Issued on [current_date].','2026-08-07 14:21:54','2026-08-07 14:21:54',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `online_course_certificate_templates` VALUES (5,'Training Certificate','This is to certify that Mr./Ms. [student_name] has successfully completed the [course_name] under [assign_teacher]. The course ran from [start_date] to [completion_date] for Class [class_name], Section [section_name]. Issued on [current_date].','2026-08-07 14:29:51','2026-08-07 14:29:51','/uploads/certificates/81445c2f-0f7e-4746-9071-c3c2047cb4bd.png',NULL,NULL,NULL,NULL,NULL);

DROP TABLE IF EXISTS `online_course_contents`;
CREATE TABLE `online_course_contents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_date` date DEFAULT NULL,
  `content_type` enum('ASSIGNMENT','EXAM','LESSON','QUIZ') NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `exam_duration` varchar(50) DEFAULT NULL,
  `exam_from` date DEFAULT NULL,
  `exam_to` date DEFAULT NULL,
  `max_marks` double DEFAULT NULL,
  `passing_percentage` int DEFAULT NULL,
  `sort_order` int NOT NULL,
  `submission_date` date DEFAULT NULL,
  `summary` text,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `section_id` bigint NOT NULL,
  `lesson_type` varchar(50) DEFAULT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKf1y7ia0wh62q6x5m5muxasqxx` (`section_id`),
  CONSTRAINT `FKf1y7ia0wh62q6x5m5muxasqxx` FOREIGN KEY (`section_id`) REFERENCES `online_course_sections` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `online_course_contents` VALUES (1,NULL,'LESSON','2026-08-07 12:28:54','00:55:51',NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'Lesson 1: Body Parts','2026-08-07 12:28:54','https://www.youtube.com/watch?v=dQw4w9WgXcQ',1,NULL,NULL);
INSERT INTO `online_course_contents` VALUES (9,NULL,'LESSON','2026-08-07 12:44:17','',NULL,NULL,NULL,NULL,NULL,1,NULL,'','Stop Fighting','2026-08-07 12:44:17','',2,'Youtube','/uploads/lessons/b67a6758-a55d-4c67-b962-2f5808bd2a4a.png');
INSERT INTO `online_course_contents` VALUES (10,NULL,'LESSON','2026-08-07 12:46:27','',NULL,NULL,NULL,NULL,NULL,1,NULL,'','Introduction','2026-08-07 12:46:27','',3,'Youtube','/uploads/lessons/f4e9152b-d9f8-4a7d-b844-99143f804e2a.png');

DROP TABLE IF EXISTS `online_course_offline_payments`;
CREATE TABLE `online_course_offline_payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_count` int DEFAULT NULL,
  `class_id` bigint DEFAULT NULL,
  `class_name` varchar(100) DEFAULT NULL,
  `course_id` bigint NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `course_provider` varchar(200) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `current_price` double DEFAULT NULL,
  `exam_count` int DEFAULT NULL,
  `lesson_count` int DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `purchase_id` bigint DEFAULT NULL,
  `quiz_count` int DEFAULT NULL,
  `section_count` int DEFAULT NULL,
  `section_name` varchar(50) DEFAULT NULL,
  `student_admission_id` bigint NOT NULL,
  `student_label` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `note` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `online_course_offline_payments` VALUES (1,0,2,'Class 1',10,'Forex Trading','Youtube','2026-08-07 15:11:21',100.0,0,0,'2026-08-07 15:11:21','Cash','reverted',100.0,2,0,0,'BLUE',1,'Alhaji Mohamed Kanu (001)','2026-08-07 15:11:30',NULL);
INSERT INTO `online_course_offline_payments` VALUES (2,0,2,'Class 1',10,'Forex Trading','Youtube','2026-08-07 15:20:52',100.0,0,0,'2026-08-07 00:00:00','Cash','paid',100.0,3,0,0,'BLUE',1,'Alhaji Mohamed Kanu (001)','2026-08-07 15:20:52',NULL);
INSERT INTO `online_course_offline_payments` VALUES (3,0,2,'Class 1',10,'Forex Trading','Youtube','2026-08-07 15:24:12',100.0,0,0,'2026-08-07 00:00:00','Cash','paid',100.0,4,0,0,'WHITE',3,'Marie Smith (002)','2026-08-07 15:24:12',NULL);

DROP TABLE IF EXISTS `online_course_purchases`;
CREATE TABLE `online_course_purchases` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_name` varchar(255) NOT NULL,
  `course_provider` varchar(200) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT NULL,
  `payment_type` varchar(50) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `purchase_date` date NOT NULL,
  `student_or_guest` varchar(200) NOT NULL,
  `users_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `online_course_purchases` VALUES (1,'Basic Computer Course for Beginners','Shivam Verma','2026-08-07 14:39:56','Cash','success','offline',200.0,'2026-08-07','Guest User 101','guest');
INSERT INTO `online_course_purchases` VALUES (2,'Forex Trading','Youtube','2026-08-07 15:11:20','Cash','reverted','offline',100.0,'2026-08-07','Alhaji Mohamed Kanu (001)','student');
INSERT INTO `online_course_purchases` VALUES (3,'Forex Trading','Youtube','2026-08-07 15:20:52','Cash','success','offline',100.0,'2026-08-07','Alhaji Mohamed Kanu (001)','student');
INSERT INTO `online_course_purchases` VALUES (4,'Forex Trading','Youtube','2026-08-07 15:24:12','Cash','success','offline',100.0,'2026-08-07','Marie Smith (002)','student');

DROP TABLE IF EXISTS `online_course_question_tags`;
CREATE TABLE `online_course_question_tags` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `tag_name` varchar(150) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKhbavbm28gts8nfmb0uxvpkjx4` (`tag_name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `online_course_question_tags` VALUES (1,'2026-08-07 15:24:20','English','2026-08-07 15:24:20');
INSERT INTO `online_course_question_tags` VALUES (3,'2026-08-07 15:24:20','Robotics','2026-08-07 15:24:20');
INSERT INTO `online_course_question_tags` VALUES (4,'2026-08-07 15:24:20','Hindi','2026-08-07 15:24:20');
INSERT INTO `online_course_question_tags` VALUES (5,'2026-08-07 15:24:20','Science','2026-08-07 15:24:20');
INSERT INTO `online_course_question_tags` VALUES (6,'2026-08-07 15:24:20','Mathematics','2026-08-07 15:24:20');
INSERT INTO `online_course_question_tags` VALUES (7,'2026-08-07 15:24:20','Communication Skills','2026-08-07 15:24:20');
INSERT INTO `online_course_question_tags` VALUES (8,'2026-08-07 16:47:41','Andular','2026-08-07 16:47:41');
INSERT INTO `online_course_question_tags` VALUES (9,'2026-08-07 16:47:54','JAVA','2026-08-07 16:47:54');
INSERT INTO `online_course_question_tags` VALUES (10,'2026-08-07 16:48:07','Spring Boot','2026-08-07 16:48:07');
INSERT INTO `online_course_question_tags` VALUES (11,'2026-08-07 16:48:15','Gradle','2026-08-07 16:48:15');
INSERT INTO `online_course_question_tags` VALUES (12,'2026-08-07 16:48:26','AI/ML','2026-08-07 16:48:26');
INSERT INTO `online_course_question_tags` VALUES (13,'2026-08-11 11:49:23','Angular','2026-08-11 11:49:23');

DROP TABLE IF EXISTS `online_course_questions`;
CREATE TABLE `online_course_questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `correct_answer` text,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(150) DEFAULT NULL,
  `question_level` varchar(50) NOT NULL,
  `options_json` text,
  `question_text` text NOT NULL,
  `question_type` varchar(50) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `tag_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK35hfrwn8m8j85fvmt2paei7ov` (`tag_id`),
  CONSTRAINT `FK35hfrwn8m8j85fvmt2paei7ov` FOREIGN KEY (`tag_id`) REFERENCES `online_course_question_tags` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `online_course_questions` VALUES (1,NULL,'2026-08-07 15:24:38','Joe Black (9000)','Low',NULL,'Write a short paragraph about your favourite school activity and explain why you like it.','Descriptive','2026-08-07 15:24:38',1);
INSERT INTO `online_course_questions` VALUES (2,'Option A','2026-08-07 15:24:38','Joe Black (9000)','Medium','[{"text":"Option A","correct":true},{"text":"Option B","correct":false},{"text":"Option C","correct":false},{"text":"Option D","correct":false}]','Which of the following is a renewable source of energy?','Single Choice','2026-08-07 15:24:38',5);
INSERT INTO `online_course_questions` VALUES (3,'Option A','2026-08-07 15:24:38','Joe Black (9000)','High','[{"text":"Option A","correct":true},{"text":"Option B","correct":false},{"text":"Option C","correct":false},{"text":"Option D","correct":false}]','What is the value of 12 × 8 + 16 ÷ 4?','Single Choice','2026-08-07 15:24:38',6);
INSERT INTO `online_course_questions` VALUES (4,NULL,'2026-08-07 15:24:38','Joe Black (9000)','Medium',NULL,'Explain the role of sensors in a basic robot design.','Descriptive','2026-08-07 15:24:38',3);
INSERT INTO `online_course_questions` VALUES (5,NULL,'2026-08-07 15:24:38','Joe Black (9000)','Low',NULL,'अपने विद्यालय के पुस्तकालय का संक्षिप्त वर्णन कीजिए।','Descriptive','2026-08-07 15:24:38',4);
INSERT INTO `online_course_questions` VALUES (6,'Option A','2026-08-07 15:24:38','Joe Black (9000)','Medium','[{"text":"Option A","correct":true},{"text":"Option B","correct":false},{"text":"Option C","correct":false},{"text":"Option D","correct":false}]','Which of these is an example of active listening?','Single Choice','2026-08-07 15:24:38',7);
INSERT INTO `online_course_questions` VALUES (7,NULL,'2026-08-07 17:08:10','Joe Black (9000)','Medium',NULL,'Who is the founder of the name JAVA','Descriptive','2026-08-07 17:08:10',9);
INSERT INTO `online_course_questions` VALUES (8,NULL,'2026-08-11 11:53:12','Joe Black (9000)','High',NULL,'<font face="Verdana"><b>What is data binding in Angular, and what are the different types?</b></font>','Descriptive','2026-08-11 11:53:12',8);

DROP TABLE IF EXISTS `online_course_sections`;
CREATE TABLE `online_course_sections` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `sort_order` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `course_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKod98dwqugilhu6hb1hlbqfrwd` (`course_id`),
  CONSTRAINT `FKod98dwqugilhu6hb1hlbqfrwd` FOREIGN KEY (`course_id`) REFERENCES `online_courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `online_course_sections` VALUES (1,'2026-08-07 12:28:54',1,'Introduction to Math Fundamentals','2026-08-07 12:28:54',6);
INSERT INTO `online_course_sections` VALUES (2,'2026-08-07 12:43:06',2,'Fighting in school','2026-08-07 12:43:06',6);
INSERT INTO `online_course_sections` VALUES (3,'2026-08-07 12:45:32',1,'Introduction to Computer Testing','2026-08-07 12:45:32',9);
INSERT INTO `online_course_sections` VALUES (4,'2026-08-07 13:02:45',2,'Production','2026-08-07 13:02:45',9);

DROP TABLE IF EXISTS `online_course_settings`;
CREATE TABLE `online_course_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `aws_access_key` varchar(255) DEFAULT NULL,
  `aws_bucket_name` varchar(255) DEFAULT NULL,
  `aws_region` varchar(100) DEFAULT NULL,
  `aws_secret_key` varchar(500) DEFAULT NULL,
  `enable_assignment` bit(1) NOT NULL DEFAULT b'1',
  `enable_exam` bit(1) NOT NULL DEFAULT b'1',
  `enable_quiz` bit(1) NOT NULL DEFAULT b'1',
  `guest_id_start` int DEFAULT NULL,
  `guest_login_enabled` bit(1) NOT NULL DEFAULT b'1',
  `guest_prefix` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `online_course_settings` VALUES (1,'','','','',1,1,1,100,1,'Guest','2026-08-07 13:47:12');

DROP TABLE IF EXISTS `online_courses`;
CREATE TABLE `online_courses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_count` int DEFAULT NULL,
  `category` varchar(150) DEFAULT NULL,
  `class_label` varchar(100) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `discount_price` double DEFAULT NULL,
  `exam_count` int DEFAULT NULL,
  `instructor_code` varchar(50) DEFAULT NULL,
  `instructor_name` varchar(150) DEFAULT NULL,
  `last_updated` date DEFAULT NULL,
  `lesson_count` int DEFAULT NULL,
  `lesson_duration` varchar(50) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `quiz_count` int DEFAULT NULL,
  `theme_color` varchar(30) DEFAULT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `certificate` varchar(150) DEFAULT NULL,
  `discount_percent` double DEFAULT NULL,
  `free_course` bit(1) NOT NULL DEFAULT b'0',
  `front_visibility` varchar(20) DEFAULT NULL,
  `outcomes` text,
  `preview_platform` varchar(50) DEFAULT NULL,
  `preview_url` varchar(500) DEFAULT NULL,
  `section_labels` varchar(255) DEFAULT NULL,
  `created_by_code` varchar(50) DEFAULT NULL,
  `created_by_name` varchar(150) DEFAULT NULL,
  `published` bit(1) NOT NULL DEFAULT b'1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `online_courses` VALUES (1,1,'Personal Development','Class 1','2026-08-07 11:44:50','Learn the fundamentals of computers, operating systems, typing, and essential office tools.',NULL,1,'9002','Shivam Verma','2026-05-04',2,'12:47:46 H',200.0,2,'#2563eb',NULL,'Basic Computer Course for Beginners','2026-08-07 11:44:50',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1);
INSERT INTO `online_courses` VALUES (2,2,'Personal Development','Class 1','2026-08-07 11:44:50','A flexible self-paced course covering digital literacy and classroom enrichment topics.',194.0,0,'90006','Jason Sharlton','2026-05-04',3,'08:20:10 H',200.0,1,'#7c3aed',NULL,'Online Course','2026-08-07 11:44:50',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1);
INSERT INTO `online_courses` VALUES (3,2,'Personal Development','Class 2','2026-08-07 11:44:50','Improve spoken English with practical conversations, vocabulary, and pronunciation drills.',NULL,1,'9002','Shivam Verma','2026-04-18',5,'10:15:00 H',180.0,3,'#059669',NULL,'Basic English Speaking Course','2026-08-07 11:44:50',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1);
INSERT INTO `online_courses` VALUES (4,3,'Business Marketing','Class 2','2026-08-07 11:44:50','Beginner-friendly English lessons for reading, writing, listening, and speaking skills.',200.0,2,'90006','Jason Sharlton','2026-03-22',8,'15:40:25 H',220.0,4,'#dc2626',NULL,'English Course for Beginners','2026-08-07 11:44:50',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1);
INSERT INTO `online_courses` VALUES (5,1,'Lifestyle course','Class 1','2026-08-07 11:44:50','Learn Hindi alphabets, grammar basics, and everyday conversation for school students.',NULL,1,'9002','Shivam Verma','2026-02-11',4,'09:05:12 H',150.0,2,'#ea580c',NULL,'Hindi Language Course','2026-08-07 11:44:50',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1);
INSERT INTO `online_courses` VALUES (6,0,'UPGRADE SKILL','Class 3','2026-08-07 11:44:50','Strengthen core mathematics concepts including numbers, operations, and problem solving.',NULL,0,'90006','Jason Sharlton','2026-08-07',2,'18:30:00 H',250.0,0,'#0891b2',NULL,'Math Fundamentals','2026-08-07 13:04:31',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1);
INSERT INTO `online_courses` VALUES (7,2,'Lifestyle course','Class 2','2026-08-07 11:44:50','Explore ecosystems, climate, conservation, and practical science activities for learners.',NULL,1,'9002','Shivam Verma','2026-05-01',6,'11:22:45 H',175.0,2,'#16a34a',NULL,'Environmental Science Basics','2026-08-07 11:44:50',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1);
INSERT INTO `online_courses` VALUES (8,3,'UPGRADE SKILL','Class 3','2026-08-07 11:44:50','Visual approach to graphs, charts, geometry, and mathematical modeling for students.',210.0,2,'90006','Jason Sharlton','2026-04-09',9,'14:10:33 H',230.0,3,'#4f46e5',NULL,'Mathematics a Graphical Course','2026-08-07 11:44:50',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1);
INSERT INTO `online_courses` VALUES (9,0,'Personal Development','Class 1','2026-08-07 12:08:49','<h1 data-purpose="course-header-title" class="header--course-title--wcu2l" style="font-size: inherit; font-weight: 300; max-inline-size: 60rem; color: oklch(1 0 0); font-family: &quot;Udemy Sans&quot;, &quot;Noto Sans JP&quot;, Vazirmatn, &quot;SF Pro Text&quot;, -apple-system, BlinkMacSystemFont, Roboto, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; background-color: oklch(0.2035 0.0139 285.09);"><a class="ud-text-md header--header-text--zBvgT header--header-link--X0YLd truncate-with-tooltip--ellipsis--YJw4N ud-text-md header--header-text--zBvgT header--header-link--X0YLd" href="https://ubuntuafrika.udemy.com/course/ai-coder-from-vibe-coder-to-agentic-engineer/" style="color: oklch(1 0 0); text-decoration: none; line-height: 1.6; font-size: 1.4rem; -webkit-line-clamp: 1; -webkit-box-orient: block-axis; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 0.4rem;">AI Coder: Complete Claude Code &amp; Coding Agents Course</a><div><br></div></h1>',NULL,0,'9002','Shivam Verma','2026-08-07',1,'00:00:00 H',100.0,0,'#8b5cf6','/uploads/courses/8e503a2c-e775-4c76-8a13-713303c64d80.png','AI Tools','2026-08-07 12:46:27','Completion Certificate',NULL,0,'Yes','','Youtube','','BLUE, WHITE, GREEN, YELLOW, RED',NULL,NULL,1);
INSERT INTO `online_courses` VALUES (10,0,'Personal Development','Class 1','2026-08-07 13:30:12','Testing',NULL,0,'90006','Jason Sharlton','2026-08-07',0,'00:00:00 H',100.0,0,'#8b5cf6','/uploads/courses/c1cc562d-e423-4c4c-91c4-eddaf98e0b40.png','Forex Trading','2026-08-07 13:30:12','Completion Certificate',NULL,0,'Yes','','Youtube','https://www.youtube.com/watch?v=4ft152pRd1o','BLUE, WHITE, GREEN, YELLOW, RED','9000','Joe Black',1);

DROP TABLE IF EXISTS `online_exam_questions`;
CREATE TABLE `online_exam_questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `marks` double NOT NULL,
  `negative_marks` double NOT NULL,
  `online_exam_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  `subject_name` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK47lacfqm59xql2c16yn2endxc` (`online_exam_id`,`question_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `online_exam_questions` VALUES (1,'2026-08-11 11:15:16',1,'2026-08-11 11:15:16',1.0,0.25,2,7,'JAVA');
INSERT INTO `online_exam_questions` VALUES (2,'2026-08-11 11:18:22',1,'2026-08-11 11:18:22',1.0,0.25,2,6,'Communication Skills');
INSERT INTO `online_exam_questions` VALUES (3,'2026-08-11 11:18:22',1,'2026-08-11 11:18:22',1.0,0.25,2,4,'Robotics');
INSERT INTO `online_exam_questions` VALUES (4,'2026-08-11 11:18:22',1,'2026-08-11 11:18:22',1.0,0.25,2,3,'Mathematics');
INSERT INTO `online_exam_questions` VALUES (5,'2026-08-11 11:18:22',1,'2026-08-11 11:18:22',1.0,0.25,2,2,'Science');

DROP TABLE IF EXISTS `online_exam_students`;
CREATE TABLE `online_exam_students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `online_exam_id` bigint NOT NULL,
  `student_admission_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKrv1veu6cwy9ie6jht7qn9r55d` (`online_exam_id`,`student_admission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `online_exams`;
CREATE TABLE `online_exams` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `answer_word_limit` int NOT NULL,
  `attempt` int NOT NULL,
  `auto_result_publish_date` datetime(6) DEFAULT NULL,
  `description` text,
  `display_marks_in_exam` bit(1) NOT NULL,
  `exam_from` datetime(6) NOT NULL,
  `exam_to` datetime(6) NOT NULL,
  `negative_marking` bit(1) NOT NULL,
  `passing_percentage` double NOT NULL,
  `publish_exam` bit(1) NOT NULL,
  `publish_result` bit(1) NOT NULL,
  `quiz` bit(1) NOT NULL,
  `random_question_order` bit(1) NOT NULL,
  `time_duration` varchar(20) NOT NULL,
  `title` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `online_exams` VALUES (1,'2026-08-11 10:31:02',1,'2026-08-11 10:31:02',-1,1,NULL,'General Test',0,'2026-08-25 16:39:02','2026-08-25 18:39:02',0,40.0,1,0,0,0,'01:00:00','General Test');
INSERT INTO `online_exams` VALUES (2,'2026-08-11 10:31:02',1,'2026-08-11 10:31:02',-1,1,NULL,'Online Test - August 2026',0,'2026-08-24 16:39:00','2026-08-24 18:39:00',0,40.0,1,0,0,0,'01:00:00','Online Test - August 2026');
INSERT INTO `online_exams` VALUES (3,'2026-08-11 10:31:02',1,'2026-08-11 10:31:02',-1,4,NULL,'Quiz - May 2026',0,'2026-05-10 10:00:00','2026-05-10 11:00:00',0,50.0,1,1,1,0,'01:00:00','Quiz - May 2026');
INSERT INTO `online_exams` VALUES (4,'2026-08-11 10:31:02',1,'2026-08-11 10:31:02',-1,5,NULL,'Online Test - April 2026',0,'2026-04-15 14:00:00','2026-04-15 16:00:00',0,45.0,1,1,0,0,'01:00:00','Online Test - April 2026');

DROP TABLE IF EXISTS `parent_students`;
CREATE TABLE `parent_students` (
  `parent_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`parent_id`,`student_id`),
  KEY `FKjajcco9ifsue0aejy2hulyf9y` (`student_id`),
  CONSTRAINT `FKgarkq0aw212e2noi8mfoitij4` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`),
  CONSTRAINT `FKjajcco9ifsue0aejy2hulyf9y` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `parents`;
CREATE TABLE `parents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `annual_income` double DEFAULT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `office_address` varchar(500) DEFAULT NULL,
  `relationship` enum('FATHER','GUARDIAN','MOTHER','OTHER') DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKc1t2v6wf187l8w0yew9sph3l4` (`user_id`),
  CONSTRAINT `FKchh8tf8w072tapgqoijrahojk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `payment_config`;
CREATE TABLE `payment_config` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `active_gateway` varchar(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `payment_config` VALUES (1,'2026-08-20 10:02:53',1,'2026-08-20 10:09:55','paypal');

DROP TABLE IF EXISTS `payment_gateway_settings`;
CREATE TABLE `payment_gateway_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `gateway` varchar(40) NOT NULL,
  `settings_json` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKktuuasx7q0golhngc6o6qm9qh` (`gateway`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `payment_gateway_settings` VALUES (1,'2026-08-20 10:02:52',1,'2026-08-20 10:02:52','paypal','{}');
INSERT INTO `payment_gateway_settings` VALUES (2,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','stripe','{}');
INSERT INTO `payment_gateway_settings` VALUES (3,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','payu','{}');
INSERT INTO `payment_gateway_settings` VALUES (4,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','ccavenue','{}');
INSERT INTO `payment_gateway_settings` VALUES (5,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','instamojo','{}');
INSERT INTO `payment_gateway_settings` VALUES (6,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','paystack','{}');
INSERT INTO `payment_gateway_settings` VALUES (7,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','razorpay','{}');
INSERT INTO `payment_gateway_settings` VALUES (8,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','paytm','{}');
INSERT INTO `payment_gateway_settings` VALUES (9,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','midtrans','{}');
INSERT INTO `payment_gateway_settings` VALUES (10,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','pesapal','{}');
INSERT INTO `payment_gateway_settings` VALUES (11,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','flutterwave','{}');
INSERT INTO `payment_gateway_settings` VALUES (12,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','ipayafrica','{}');
INSERT INTO `payment_gateway_settings` VALUES (13,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','jazzcash','{}');
INSERT INTO `payment_gateway_settings` VALUES (14,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','billplz','{}');
INSERT INTO `payment_gateway_settings` VALUES (15,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','sslcommerz','{}');
INSERT INTO `payment_gateway_settings` VALUES (16,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','walkingm','{}');
INSERT INTO `payment_gateway_settings` VALUES (17,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','mollie','{}');
INSERT INTO `payment_gateway_settings` VALUES (18,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','cashfree','{}');
INSERT INTO `payment_gateway_settings` VALUES (19,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','payfast','{}');
INSERT INTO `payment_gateway_settings` VALUES (20,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','toyyibpay','{}');
INSERT INTO `payment_gateway_settings` VALUES (21,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','twocheckout','{}');
INSERT INTO `payment_gateway_settings` VALUES (22,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','skrill','{}');
INSERT INTO `payment_gateway_settings` VALUES (23,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','payhere','{}');
INSERT INTO `payment_gateway_settings` VALUES (24,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','onepay','{}');
INSERT INTO `payment_gateway_settings` VALUES (25,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','dpopay','{}');
INSERT INTO `payment_gateway_settings` VALUES (26,'2026-08-20 10:02:53',1,'2026-08-20 10:02:53','momopay','{}');

DROP TABLE IF EXISTS `phone_calls`;
CREATE TABLE `phone_calls` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `call_duration` int DEFAULT NULL,
  `call_type` varchar(20) NOT NULL,
  `date` date NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `follow_up_date` date DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `note` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `phone_calls` VALUES (1,'2026-02-03 12:45:12',1,'2026-02-03 12:49:02',12,'Incoming','2026-02-03','Administration enquiry','2026-02-06','Fatmata Nata Thronka','+23276806797',NULL);
INSERT INTO `phone_calls` VALUES (2,'2026-02-03 13:08:29',1,'2026-02-03 13:08:29',3,'Outgoing','2026-02-04','sfererve','2026-02-11','Mariatu Kan','23277150549',NULL);

DROP TABLE IF EXISTS `postal_dispatch`;
CREATE TABLE `postal_dispatch` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `date` date NOT NULL,
  `document_path` varchar(500) DEFAULT NULL,
  `from_title` varchar(200) NOT NULL,
  `note` varchar(1000) DEFAULT NULL,
  `reference_no` varchar(50) NOT NULL,
  `to_title` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `postal_dispatch` VALUES (1,'2026-02-03 14:23:53',1,'2026-02-03 14:23:53','12 Crab Town Freetown','2026-02-03',NULL,'Enquiry','Enquiry note','6453','Enquiry');
INSERT INTO `postal_dispatch` VALUES (2,'2026-02-03 14:32:45',1,'2026-02-03 14:32:45','Freetown','2026-02-03',NULL,'Enquiry','','ER1234','Mr. Smith');

DROP TABLE IF EXISTS `postal_receive`;
CREATE TABLE `postal_receive` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `date` date NOT NULL,
  `document_path` varchar(500) DEFAULT NULL,
  `from_title` varchar(200) NOT NULL,
  `note` varchar(1000) DEFAULT NULL,
  `reference_no` varchar(50) NOT NULL,
  `to_title` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `postal_receive` VALUES (1,'2026-02-03 15:20:49',1,'2026-02-03 15:21:43','23 Freetown Road','2026-02-03',NULL,'Pis Document','Enquiry','PD123','Pis Dooc Note');
INSERT INTO `postal_receive` VALUES (2,'2026-02-03 15:22:43',1,'2026-02-03 15:22:43','23 Kenema Road','2026-02-03',NULL,'Exam Office','Exam','23213','Principal');

DROP TABLE IF EXISTS `print_header_footer`;
CREATE TABLE `print_header_footer` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `document_type` varchar(40) NOT NULL,
  `footer_content` text,
  `header_image_path` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKk04q33tcgju9w7j688kh9fq9w` (`document_type`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `print_header_footer` VALUES (1,'2026-08-21 09:45:17',1,'2026-08-21 09:45:17','fees_receipt','This receipt is computer generated hence no signature is required.',NULL);
INSERT INTO `print_header_footer` VALUES (2,'2026-08-21 09:45:17',1,'2026-08-21 10:12:56','payslip','This payslip is computer generated hence no signature is required.',NULL);
INSERT INTO `print_header_footer` VALUES (3,'2026-08-21 09:45:17',1,'2026-08-21 10:13:39','online_admission','This receipt is for online admission  computer receipt generated hence no signature is required.',NULL);
INSERT INTO `print_header_footer` VALUES (4,'2026-08-21 09:45:17',1,'2026-08-21 10:14:03','online_exam','This receipt is for online exam computer  generated hence no signature is required.',NULL);
INSERT INTO `print_header_footer` VALUES (5,'2026-08-21 09:45:17',1,'2026-08-21 10:15:39','email','Note: This email was sent from an email address that can''t receive emails. Please don''t reply to this email',NULL);
INSERT INTO `print_header_footer` VALUES (6,'2026-08-21 09:45:17',1,'2026-08-21 10:17:17','general','Smart School Application',NULL);

DROP TABLE IF EXISTS `qr_attendance_settings`;
CREATE TABLE `qr_attendance_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `auto_attendance` bit(1) NOT NULL,
  `camera_device_enabled` bit(1) NOT NULL,
  `selected_camera` varchar(20) NOT NULL,
  `sensor_device_enabled` bit(1) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `qr_attendance_settings` VALUES (1,1,1,'secondary',1,'2026-08-09 16:38:06');

DROP TABLE IF EXISTS `room_types`;
CREATE TABLE `room_types` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `room_type` varchar(100) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKfo3na823i4vrbxwp6gix99hwu` (`room_type`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `room_types` VALUES (1,'2026-08-05 15:44:50','','Kan 001','2026-08-05 15:44:50');
INSERT INTO `room_types` VALUES (2,'2026-08-05 15:45:02','','And 001','2026-08-05 15:45:02');
INSERT INTO `room_types` VALUES (3,'2026-08-05 15:45:15','','Gen 001','2026-08-05 15:45:15');

DROP TABLE IF EXISTS `school_attendance_rules`;
CREATE TABLE `school_attendance_rules` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `audience` varchar(20) NOT NULL,
  `entry_from` varchar(12) DEFAULT NULL,
  `entry_upto` varchar(12) DEFAULT NULL,
  `role_name` varchar(50) NOT NULL,
  `rule_type` varchar(5) NOT NULL,
  `total_hour` varchar(12) DEFAULT NULL,
  `class_id` bigint DEFAULT NULL,
  `section` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_attendance_rule` (`audience`,`role_name`,`class_id`,`section`,`rule_type`)
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_attendance_rules` VALUES (1,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:00:00','09:15:00','Admin','P','08:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (2,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:16:00','09:30:00','Admin','L','08:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (3,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:31:00','11:59:00','Admin','F','04:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (4,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','12:00:00','14:00:00','Admin','SH','04:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (5,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:00:00','09:15:00','Teacher','P','08:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (6,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:16:00','09:30:00','Teacher','L','08:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (7,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:31:00','11:59:00','Teacher','F','04:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (8,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','12:00:00','14:00:00','Teacher','SH','04:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (9,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:00:00','09:15:00','Accountant','P','08:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (10,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:16:00','09:30:00','Accountant','L','08:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (11,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:31:00','11:59:00','Accountant','F','04:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (12,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','12:00:00','14:00:00','Accountant','SH','04:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (13,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:00:00','09:15:00','Librarian','P','08:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (14,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:16:00','09:30:00','Librarian','L','08:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (15,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:31:00','11:59:00','Librarian','F','04:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (16,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','12:00:00','14:00:00','Librarian','SH','04:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (17,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:00:00','09:15:00','Receptionist','P','08:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (18,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:16:00','09:30:00','Receptionist','L','08:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (19,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:31:00','11:59:00','Receptionist','F','04:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (20,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','12:00:00','14:00:00','Receptionist','SH','04:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (21,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:00:00','09:15:00','Super Admin','P','08:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (22,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:16:00','09:30:00','Super Admin','L','08:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (23,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','09:31:00','11:59:00','Super Admin','F','04:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (24,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','staff','12:00:00','14:00:00','Super Admin','SH','04:00:00',0,'');
INSERT INTO `school_attendance_rules` VALUES (41,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',2,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (42,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',2,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (43,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',2,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (44,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',2,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (45,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',2,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (46,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',2,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (47,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',2,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (48,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',2,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (49,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',2,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (50,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',2,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (51,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',2,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (52,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',2,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (53,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',2,'RED');
INSERT INTO `school_attendance_rules` VALUES (54,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',2,'RED');
INSERT INTO `school_attendance_rules` VALUES (55,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',2,'RED');
INSERT INTO `school_attendance_rules` VALUES (56,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',2,'A');
INSERT INTO `school_attendance_rules` VALUES (57,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',2,'A');
INSERT INTO `school_attendance_rules` VALUES (58,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',2,'A');
INSERT INTO `school_attendance_rules` VALUES (59,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',3,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (60,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',3,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (61,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',3,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (62,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',3,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (63,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',3,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (64,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',3,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (65,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',3,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (66,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',3,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (67,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',3,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (68,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',3,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (69,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',3,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (70,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',3,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (71,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',3,'RED');
INSERT INTO `school_attendance_rules` VALUES (72,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',3,'RED');
INSERT INTO `school_attendance_rules` VALUES (73,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',3,'RED');
INSERT INTO `school_attendance_rules` VALUES (74,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',3,'A');
INSERT INTO `school_attendance_rules` VALUES (75,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',3,'A');
INSERT INTO `school_attendance_rules` VALUES (76,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',3,'A');
INSERT INTO `school_attendance_rules` VALUES (77,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',4,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (78,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',4,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (79,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',4,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (80,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',4,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (81,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',4,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (82,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',4,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (83,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',4,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (84,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',4,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (85,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',4,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (86,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',4,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (87,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',4,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (88,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',4,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (89,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',4,'RED');
INSERT INTO `school_attendance_rules` VALUES (90,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',4,'RED');
INSERT INTO `school_attendance_rules` VALUES (91,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',4,'RED');
INSERT INTO `school_attendance_rules` VALUES (92,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',4,'A');
INSERT INTO `school_attendance_rules` VALUES (93,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',4,'A');
INSERT INTO `school_attendance_rules` VALUES (94,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',4,'A');
INSERT INTO `school_attendance_rules` VALUES (95,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',5,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (96,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',5,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (97,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',5,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (98,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',5,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (99,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',5,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (100,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',5,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (101,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',5,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (102,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',5,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (103,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',5,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (104,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',5,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (105,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',5,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (106,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',5,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (107,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',5,'RED');
INSERT INTO `school_attendance_rules` VALUES (108,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',5,'RED');
INSERT INTO `school_attendance_rules` VALUES (109,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',5,'RED');
INSERT INTO `school_attendance_rules` VALUES (110,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',6,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (111,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',6,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (112,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',6,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (113,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',6,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (114,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',6,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (115,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',6,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (116,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',6,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (117,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',6,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (118,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',6,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (119,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',6,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (120,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',6,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (121,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',6,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (122,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',6,'RED');
INSERT INTO `school_attendance_rules` VALUES (123,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',6,'RED');
INSERT INTO `school_attendance_rules` VALUES (124,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',6,'RED');
INSERT INTO `school_attendance_rules` VALUES (125,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',7,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (126,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',7,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (127,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',7,'BLUE');
INSERT INTO `school_attendance_rules` VALUES (128,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',7,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (129,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',7,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (130,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',7,'WHITE');
INSERT INTO `school_attendance_rules` VALUES (131,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',7,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (132,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',7,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (133,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',7,'GREEN');
INSERT INTO `school_attendance_rules` VALUES (134,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',7,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (135,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',7,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (136,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',7,'YELLOW');
INSERT INTO `school_attendance_rules` VALUES (137,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','08:45:00','09:00:00','','P','07:00:00',7,'RED');
INSERT INTO `school_attendance_rules` VALUES (138,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:15:00','09:30:00','','L','07:00:00',7,'RED');
INSERT INTO `school_attendance_rules` VALUES (139,'2026-08-13 13:09:35',1,'2026-08-13 13:09:35','student','09:30:00','10:00:00','','F','04:00:00',7,'RED');

DROP TABLE IF EXISTS `school_attendance_type_settings`;
CREATE TABLE `school_attendance_type_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `attendance_mode` varchar(20) NOT NULL,
  `devices` varchar(500) DEFAULT NULL,
  `low_attendance_limit` double DEFAULT NULL,
  `qr_barcode_biometric_enabled` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_attendance_type_settings` VALUES (1,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46','day_wise','1231643032787',75.0,1);

DROP TABLE IF EXISTS `school_backend_theme_settings`;
CREATE TABLE `school_backend_theme_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `box_content` varchar(20) NOT NULL,
  `primary_color` varchar(20) NOT NULL,
  `side_menu_style` varchar(20) NOT NULL,
  `skin` varchar(20) NOT NULL,
  `theme_mode` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_backend_theme_settings` VALUES (1,'2026-08-13 09:08:02',1,'2026-08-21 11:35:53','compact','#64748b','default','shadow','light');

DROP TABLE IF EXISTS `school_chat_settings`;
CREATE TABLE `school_chat_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `allow_guardian_delete_chat` bit(1) NOT NULL,
  `allow_staff_delete_chat` bit(1) NOT NULL,
  `allow_student_delete_chat` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_chat_settings` VALUES (1,'2026-08-13 13:55:17',1,'2026-08-13 13:55:17',1,1,1);

DROP TABLE IF EXISTS `school_class_attendance_times`;
CREATE TABLE `school_class_attendance_times` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `class_id` bigint NOT NULL,
  `section` varchar(20) NOT NULL,
  `submit_time` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKhcoqcthaap5dn8q6139xcg2hi` (`class_id`,`section`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_class_attendance_times` VALUES (1,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46',2,'BLUE','');
INSERT INTO `school_class_attendance_times` VALUES (2,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46',2,'WHITE','');
INSERT INTO `school_class_attendance_times` VALUES (3,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46',2,'GREEN','');
INSERT INTO `school_class_attendance_times` VALUES (4,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46',2,'YELLOW','');
INSERT INTO `school_class_attendance_times` VALUES (5,'2026-08-13 12:42:46',1,'2026-08-13 12:42:46',2,'RED','');
INSERT INTO `school_class_attendance_times` VALUES (6,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',2,'A','');
INSERT INTO `school_class_attendance_times` VALUES (7,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',3,'BLUE','');
INSERT INTO `school_class_attendance_times` VALUES (8,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',3,'WHITE','');
INSERT INTO `school_class_attendance_times` VALUES (9,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',3,'GREEN','');
INSERT INTO `school_class_attendance_times` VALUES (10,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',3,'YELLOW','');
INSERT INTO `school_class_attendance_times` VALUES (11,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',3,'RED','');
INSERT INTO `school_class_attendance_times` VALUES (12,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',3,'A','');
INSERT INTO `school_class_attendance_times` VALUES (13,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',4,'BLUE','');
INSERT INTO `school_class_attendance_times` VALUES (14,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',4,'WHITE','');
INSERT INTO `school_class_attendance_times` VALUES (15,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',4,'GREEN','');
INSERT INTO `school_class_attendance_times` VALUES (16,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',4,'YELLOW','');
INSERT INTO `school_class_attendance_times` VALUES (17,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',4,'RED','');
INSERT INTO `school_class_attendance_times` VALUES (18,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',4,'A','');
INSERT INTO `school_class_attendance_times` VALUES (19,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',5,'BLUE','');
INSERT INTO `school_class_attendance_times` VALUES (20,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',5,'WHITE','');
INSERT INTO `school_class_attendance_times` VALUES (21,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',5,'GREEN','');
INSERT INTO `school_class_attendance_times` VALUES (22,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',5,'YELLOW','');
INSERT INTO `school_class_attendance_times` VALUES (23,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',5,'RED','');
INSERT INTO `school_class_attendance_times` VALUES (24,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',6,'BLUE','');
INSERT INTO `school_class_attendance_times` VALUES (25,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',6,'WHITE','');
INSERT INTO `school_class_attendance_times` VALUES (26,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',6,'GREEN','');
INSERT INTO `school_class_attendance_times` VALUES (27,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',6,'YELLOW','');
INSERT INTO `school_class_attendance_times` VALUES (28,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',6,'RED','');
INSERT INTO `school_class_attendance_times` VALUES (29,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',7,'BLUE','');
INSERT INTO `school_class_attendance_times` VALUES (30,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',7,'WHITE','');
INSERT INTO `school_class_attendance_times` VALUES (31,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',7,'GREEN','');
INSERT INTO `school_class_attendance_times` VALUES (32,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',7,'YELLOW','');
INSERT INTO `school_class_attendance_times` VALUES (33,'2026-08-13 12:42:47',1,'2026-08-13 12:42:47',7,'RED','');

DROP TABLE IF EXISTS `school_class_sections`;
CREATE TABLE `school_class_sections` (
  `school_class_id` bigint NOT NULL,
  `section_name` varchar(20) DEFAULT NULL,
  `section_order` int NOT NULL,
  PRIMARY KEY (`school_class_id`,`section_order`),
  CONSTRAINT `FK2d2beb1ffrj9r7xfcb4fu99no` FOREIGN KEY (`school_class_id`) REFERENCES `school_classes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_class_sections` VALUES (2,'BLUE',0);
INSERT INTO `school_class_sections` VALUES (2,'WHITE',1);
INSERT INTO `school_class_sections` VALUES (2,'GREEN',2);
INSERT INTO `school_class_sections` VALUES (2,'YELLOW',3);
INSERT INTO `school_class_sections` VALUES (2,'RED',4);
INSERT INTO `school_class_sections` VALUES (2,'A',5);
INSERT INTO `school_class_sections` VALUES (3,'BLUE',0);
INSERT INTO `school_class_sections` VALUES (3,'WHITE',1);
INSERT INTO `school_class_sections` VALUES (3,'GREEN',2);
INSERT INTO `school_class_sections` VALUES (3,'YELLOW',3);
INSERT INTO `school_class_sections` VALUES (3,'RED',4);
INSERT INTO `school_class_sections` VALUES (3,'A',5);
INSERT INTO `school_class_sections` VALUES (4,'BLUE',0);
INSERT INTO `school_class_sections` VALUES (4,'WHITE',1);
INSERT INTO `school_class_sections` VALUES (4,'GREEN',2);
INSERT INTO `school_class_sections` VALUES (4,'YELLOW',3);
INSERT INTO `school_class_sections` VALUES (4,'RED',4);
INSERT INTO `school_class_sections` VALUES (4,'A',5);
INSERT INTO `school_class_sections` VALUES (5,'BLUE',0);
INSERT INTO `school_class_sections` VALUES (5,'WHITE',1);
INSERT INTO `school_class_sections` VALUES (5,'GREEN',2);
INSERT INTO `school_class_sections` VALUES (5,'YELLOW',3);
INSERT INTO `school_class_sections` VALUES (5,'RED',4);
INSERT INTO `school_class_sections` VALUES (6,'BLUE',0);
INSERT INTO `school_class_sections` VALUES (6,'WHITE',1);
INSERT INTO `school_class_sections` VALUES (6,'GREEN',2);
INSERT INTO `school_class_sections` VALUES (6,'YELLOW',3);
INSERT INTO `school_class_sections` VALUES (6,'RED',4);
INSERT INTO `school_class_sections` VALUES (7,'BLUE',0);
INSERT INTO `school_class_sections` VALUES (7,'WHITE',1);
INSERT INTO `school_class_sections` VALUES (7,'GREEN',2);
INSERT INTO `school_class_sections` VALUES (7,'YELLOW',3);
INSERT INTO `school_class_sections` VALUES (7,'RED',4);

DROP TABLE IF EXISTS `school_classes`;
CREATE TABLE `school_classes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKntlllqt16r2xht5p17d4wal1t` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_classes` VALUES (2,'2026-08-05 11:32:35','Class 1','2026-08-11 13:06:03');
INSERT INTO `school_classes` VALUES (3,'2026-08-05 11:34:16','Class 2','2026-08-11 13:06:03');
INSERT INTO `school_classes` VALUES (4,'2026-08-05 11:35:56','Class 3','2026-08-11 13:06:04');
INSERT INTO `school_classes` VALUES (5,'2026-08-05 11:36:12','Class 4','2026-08-05 12:45:13');
INSERT INTO `school_classes` VALUES (6,'2026-08-05 11:36:27','Class 5','2026-08-05 12:45:23');
INSERT INTO `school_classes` VALUES (7,'2026-08-05 11:37:01','Class 6','2026-08-05 12:45:36');

DROP TABLE IF EXISTS `school_fees_settings`;
CREATE TABLE `school_fees_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `allow_student_partial_payment` bit(1) NOT NULL,
  `carry_forward_fees_due_days` int NOT NULL,
  `collect_fees_in_back_date` bit(1) NOT NULL,
  `display_previous_fees` bit(1) NOT NULL,
  `lock_student_panel_if_fees_remaining` bit(1) NOT NULL,
  `offline_bank_payment_in_student_panel` bit(1) NOT NULL,
  `offline_bank_payment_instruction` text,
  `print_fees_receipt_bank_copy` bit(1) NOT NULL,
  `print_fees_receipt_office_copy` bit(1) NOT NULL,
  `print_fees_receipt_student_copy` bit(1) NOT NULL,
  `single_page_fees_print` bit(1) NOT NULL,
  `student_guardian_panel_fees_discount` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_fees_settings` VALUES (1,'2026-08-13 11:03:05',1,'2026-08-13 11:03:05',1,60,1,1,0,1,'Offline mode of payment are Cash, DD, Online and Cheques',1,1,1,1,1);

DROP TABLE IF EXISTS `school_general_settings`;
CREATE TABLE `school_general_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `address` varchar(500) NOT NULL,
  `base_url` varchar(300) NOT NULL,
  `currency_format` varchar(50) NOT NULL,
  `date_format` varchar(30) NOT NULL,
  `email` varchar(150) NOT NULL,
  `file_upload_path` varchar(500) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `school_code` varchar(50) DEFAULT NULL,
  `school_name` varchar(200) NOT NULL,
  `session` varchar(20) NOT NULL,
  `session_start_month` varchar(20) NOT NULL,
  `start_day_of_week` varchar(20) NOT NULL,
  `timezone` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_general_settings` VALUES (1,'2026-08-12 16:22:19',1,'2026-08-12 16:34:45','10 Koya Street Water Works','https://kantech.solution','1,23,45,678.00','mm/dd/yyyy','kanualhaji@gmail.com','/var/www/demo.smart-school.in/public_html/uploads/','+23276897908','KTSS-487438','Kan Tech Solution School','2026-27','April','Monday','(GMT+01:00) Europe, London');

DROP TABLE IF EXISTS `school_google_drive_settings`;
CREATE TABLE `school_google_drive_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `allow_guardian_upload` bit(1) NOT NULL,
  `allow_staff_upload` bit(1) NOT NULL,
  `allow_student_upload` bit(1) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `client_id` varchar(500) NOT NULL,
  `project_number_app_id` varchar(100) NOT NULL,
  `status` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_google_drive_settings` VALUES (1,'2026-08-13 13:30:37',1,'2026-08-13 13:30:37',1,1,1,'AlzaSyClXdi9Qotn1yBacouZ8Z6KxrFbvOzdC9w','98759700250-jm559g6drk93nhlgjvdboqa0t3aafnpa.apps.googleusercontent.com','98759700250',1);

DROP TABLE IF EXISTS `school_houses`;
CREATE TABLE `school_houses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `name` varchar(100) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK93y6ola9xi70oqpoyi03es0j6` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_houses` VALUES (1,'2026-08-05 11:02:06','','Blue','2026-08-05 11:02:06');
INSERT INTO `school_houses` VALUES (2,'2026-08-05 11:02:20','','Green','2026-08-05 11:02:20');
INSERT INTO `school_houses` VALUES (3,'2026-08-05 11:02:29','','Yellow','2026-08-05 11:02:29');
INSERT INTO `school_houses` VALUES (4,'2026-08-05 11:02:38','','Red','2026-08-05 11:02:38');
INSERT INTO `school_houses` VALUES (5,'2026-08-05 11:02:49','','Pink','2026-08-05 11:02:49');

DROP TABLE IF EXISTS `school_id_auto_generation_settings`;
CREATE TABLE `school_id_auto_generation_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `admission_no_digit` int DEFAULT NULL,
  `admission_no_prefix` varchar(50) DEFAULT NULL,
  `admission_start_from` varchar(50) DEFAULT NULL,
  `auto_admission_no` bit(1) NOT NULL,
  `auto_staff_id` bit(1) NOT NULL,
  `staff_id_prefix` varchar(50) DEFAULT NULL,
  `staff_id_start_from` varchar(50) DEFAULT NULL,
  `staff_no_digit` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_id_auto_generation_settings` VALUES (1,'2026-08-13 11:19:21',1,'2026-08-13 11:19:21',NULL,'','',0,0,'','',NULL);

DROP TABLE IF EXISTS `school_login_background_settings`;
CREATE TABLE `school_login_background_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `admin_panel_background_path` varchar(500) DEFAULT NULL,
  `user_panel_background_path` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_login_background_settings` VALUES (1,'2026-08-13 08:45:36',1,'2026-08-13 08:56:19','/uploads/login-backgrounds/5d98da6f-dc93-4ad6-a7cb-c92e57d1608c.png','/uploads/login-backgrounds/3aff5713-5923-4933-a7a8-9f0fccf76b40.png');

DROP TABLE IF EXISTS `school_logo_settings`;
CREATE TABLE `school_logo_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `admin_logo_path` varchar(500) DEFAULT NULL,
  `admin_small_logo_path` varchar(500) DEFAULT NULL,
  `app_logo_path` varchar(500) DEFAULT NULL,
  `print_logo_path` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_logo_settings` VALUES (1,'2026-08-12 16:45:00',1,'2026-08-18 09:59:05','/uploads/logos/2debbed1-3d67-4960-8a62-2475e1bc2384.png','/uploads/logos/12844d51-783e-4696-9dca-17a59cfff963.png','/uploads/logos/f169a63b-e51e-4862-9751-f8a1a245407f.png','/uploads/logos/938f4077-e724-44e5-be9c-d1bc2773bde8.png');

DROP TABLE IF EXISTS `school_maintenance_settings`;
CREATE TABLE `school_maintenance_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `maintenance_mode` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_maintenance_settings` VALUES (1,'2026-08-13 14:05:30',1,'2026-08-13 14:05:30',0);

DROP TABLE IF EXISTS `school_miscellaneous_settings`;
CREATE TABLE `school_miscellaneous_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `download_admit_card_in_student_parent_panel` bit(1) NOT NULL,
  `enable_multi_class_selection_in_student_admission` bit(1) NOT NULL,
  `event_reminder` bit(1) NOT NULL,
  `exam_result_page_in_front_site` bit(1) NOT NULL,
  `id_card_scan_type` varchar(20) NOT NULL,
  `show_me_only_my_question` bit(1) NOT NULL,
  `staff_apply_leave_notification_email` varchar(255) DEFAULT NULL,
  `superadmin_visibility` bit(1) NOT NULL,
  `teacher_restricted_mode` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_miscellaneous_settings` VALUES (1,'2026-08-13 14:15:27',1,'2026-08-13 14:15:27',0,0,0,1,'BARCODE',0,'',0,0);

DROP TABLE IF EXISTS `school_mobile_app_settings`;
CREATE TABLE `school_mobile_app_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `api_url` varchar(500) NOT NULL,
  `primary_color` varchar(20) NOT NULL,
  `secondary_color` varchar(20) NOT NULL,
  `envato_email` varchar(255) DEFAULT NULL,
  `envato_purchase_code` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_mobile_app_settings` VALUES (1,'2026-08-13 09:34:27',1,'2026-08-13 09:34:27','https://demo.smart-school.in/api/','#424242','#E7F1EE',NULL,NULL);

DROP TABLE IF EXISTS `school_sections`;
CREATE TABLE `school_sections` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `section_name` varchar(50) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKntrff4lmmbjigl7i3eugmfi1n` (`section_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_sections` VALUES (1,'2026-08-05 12:23:36','Blue','2026-08-05 12:23:36');
INSERT INTO `school_sections` VALUES (2,'2026-08-05 12:23:43','White','2026-08-05 12:23:43');
INSERT INTO `school_sections` VALUES (3,'2026-08-05 12:23:51','Green','2026-08-05 12:23:51');
INSERT INTO `school_sections` VALUES (4,'2026-08-05 12:24:00','Yellow','2026-08-05 12:24:00');
INSERT INTO `school_sections` VALUES (5,'2026-08-05 12:24:10','Red','2026-08-05 12:24:10');

DROP TABLE IF EXISTS `school_student_guardian_panel_settings`;
CREATE TABLE `school_student_guardian_panel_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `allow_student_add_timeline` bit(1) NOT NULL,
  `parent_login_email` bit(1) NOT NULL,
  `parent_login_enabled` bit(1) NOT NULL,
  `parent_login_mobile_number` bit(1) NOT NULL,
  `student_login_admission_no` bit(1) NOT NULL,
  `student_login_email` bit(1) NOT NULL,
  `student_login_enabled` bit(1) NOT NULL,
  `student_login_mobile_number` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_student_guardian_panel_settings` VALUES (1,'2026-08-13 10:54:42',1,'2026-08-13 10:54:42',0,1,1,1,1,1,1,1);

DROP TABLE IF EXISTS `school_whatsapp_settings`;
CREATE TABLE `school_whatsapp_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `admin_panel_mobile_no` varchar(20) DEFAULT NULL,
  `admin_panel_time_from` varchar(20) DEFAULT NULL,
  `admin_panel_time_to` varchar(20) DEFAULT NULL,
  `admin_panel_whatsapp_link_enabled` bit(1) NOT NULL,
  `front_site_mobile_no` varchar(20) DEFAULT NULL,
  `front_site_time_from` varchar(20) DEFAULT NULL,
  `front_site_time_to` varchar(20) DEFAULT NULL,
  `front_site_whatsapp_link_enabled` bit(1) NOT NULL,
  `student_guardian_panel_mobile_no` varchar(20) DEFAULT NULL,
  `student_guardian_panel_time_from` varchar(20) DEFAULT NULL,
  `student_guardian_panel_time_to` varchar(20) DEFAULT NULL,
  `student_guardian_panel_whatsapp_link_enabled` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `school_whatsapp_settings` VALUES (1,'2026-08-13 13:43:58',1,'2026-08-13 13:47:03','+23277150549','','',1,'+23277150549','','',1,'+23277150549','','',1);

DROP TABLE IF EXISTS `sections`;
CREATE TABLE `sections` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `max_students` int DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `room_number` varchar(20) DEFAULT NULL,
  `class_teacher_id` bigint DEFAULT NULL,
  `grade_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK85wmloqq0ao4ss447k89uoimr` (`grade_id`,`name`),
  KEY `FK3hidjl0kpso4cfrde6jh3h0nk` (`class_teacher_id`),
  CONSTRAINT `FK19900ynxu4ssf4n3t8v6nwgoh` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
  CONSTRAINT `FK3hidjl0kpso4cfrde6jh3h0nk` FOREIGN KEY (`class_teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `sms_gateway_settings`;
CREATE TABLE `sms_gateway_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `gateway` varchar(40) NOT NULL,
  `settings_json` text,
  `status` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKa2otoy5i65cl4om692261sljf` (`gateway`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `sms_gateway_settings` VALUES (1,'2026-08-19 16:08:05',1,'2026-08-19 16:54:06','clickatell','{}','Disabled');
INSERT INTO `sms_gateway_settings` VALUES (2,'2026-08-19 16:08:05',1,'2026-08-19 16:54:06','twilio','{}','Disabled');
INSERT INTO `sms_gateway_settings` VALUES (3,'2026-08-19 16:08:05',1,'2026-08-19 16:54:06','msg91','{}','Disabled');
INSERT INTO `sms_gateway_settings` VALUES (4,'2026-08-19 16:08:05',1,'2026-08-19 16:54:06','textlocal','{}','Disabled');
INSERT INTO `sms_gateway_settings` VALUES (5,'2026-08-19 16:08:05',1,'2026-08-19 16:54:06','smscountry','{}','Disabled');
INSERT INTO `sms_gateway_settings` VALUES (6,'2026-08-19 16:08:05',1,'2026-08-19 16:54:06','bulksms','{}','Disabled');
INSERT INTO `sms_gateway_settings` VALUES (7,'2026-08-19 16:08:05',1,'2026-08-19 16:54:06','mobireach','{}','Disabled');
INSERT INTO `sms_gateway_settings` VALUES (8,'2026-08-19 16:08:05',1,'2026-08-19 16:54:06','nexmo','{}','Disabled');
INSERT INTO `sms_gateway_settings` VALUES (9,'2026-08-19 16:08:05',1,'2026-08-19 16:54:06','africastalking','{}','Disabled');
INSERT INTO `sms_gateway_settings` VALUES (10,'2026-08-19 16:08:05',1,'2026-08-19 16:54:06','smsegypt','{}','Disabled');
INSERT INTO `sms_gateway_settings` VALUES (11,'2026-08-19 16:08:05',1,'2026-08-19 16:54:06','smsgatewayhub','{}','Disabled');
INSERT INTO `sms_gateway_settings` VALUES (12,'2026-08-19 16:08:05',1,'2026-08-19 16:54:06','custom','{"gatewayName":"fgdgrdferer"}','Enabled');

DROP TABLE IF EXISTS `staff_attendance_entries`;
CREATE TABLE `staff_attendance_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `attendance_date` date NOT NULL,
  `entry_time` varchar(20) DEFAULT NULL,
  `exit_time` varchar(20) DEFAULT NULL,
  `note` varchar(500) DEFAULT NULL,
  `source` varchar(50) DEFAULT NULL,
  `staff_member_id` bigint NOT NULL,
  `status` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKhkyii313vgxb3uj813j86hiax` (`staff_member_id`,`attendance_date`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `staff_attendance_entries` VALUES (1,'2026-08-12 12:12:57',1,'2026-08-12 12:12:57','2026-08-12','','','','N/A',8,'Present');
INSERT INTO `staff_attendance_entries` VALUES (2,'2026-08-12 12:12:57',1,'2026-08-12 12:12:57','2026-08-12','','','','N/A',7,'Present');
INSERT INTO `staff_attendance_entries` VALUES (3,'2026-08-12 12:12:57',1,'2026-08-12 12:12:57','2026-08-12','','','','N/A',2,'Present');
INSERT INTO `staff_attendance_entries` VALUES (4,'2026-08-12 12:12:57',1,'2026-08-12 12:12:57','2026-08-12','','','','N/A',1,'Present');
INSERT INTO `staff_attendance_entries` VALUES (5,'2026-08-12 12:12:57',1,'2026-08-12 12:12:57','2026-08-12','','','','N/A',5,'Present');
INSERT INTO `staff_attendance_entries` VALUES (6,'2026-08-12 12:12:57',1,'2026-08-12 12:12:57','2026-08-12','','','','N/A',9,'Present');
INSERT INTO `staff_attendance_entries` VALUES (7,'2026-08-12 12:12:57',1,'2026-08-12 12:12:57','2026-08-12','','','','N/A',6,'Present');
INSERT INTO `staff_attendance_entries` VALUES (8,'2026-08-12 12:12:57',1,'2026-08-12 12:12:57','2026-08-12','','','','N/A',4,'Present');
INSERT INTO `staff_attendance_entries` VALUES (9,'2026-08-12 12:12:57',1,'2026-08-12 12:12:57','2026-08-12','','','','N/A',3,'Present');

DROP TABLE IF EXISTS `staff_id_card_templates`;
CREATE TABLE `staff_id_card_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `background_image_url` varchar(500) DEFAULT NULL,
  `design_type` varchar(30) DEFAULT NULL,
  `header_color` varchar(30) DEFAULT NULL,
  `id_card_title` varchar(200) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `school_address` varchar(500) DEFAULT NULL,
  `school_name` varchar(200) DEFAULT NULL,
  `show_address` bit(1) NOT NULL,
  `show_barcode` bit(1) NOT NULL,
  `show_department` bit(1) NOT NULL,
  `show_designation` bit(1) NOT NULL,
  `show_dob` bit(1) NOT NULL,
  `show_father_name` bit(1) NOT NULL,
  `show_mother_name` bit(1) NOT NULL,
  `show_phone` bit(1) NOT NULL,
  `show_staff_id` bit(1) NOT NULL,
  `show_staff_name` bit(1) NOT NULL,
  `signature_url` varchar(500) DEFAULT NULL,
  `show_date_of_joining` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `staff_id_card_templates` VALUES (1,'2026-08-19 09:29:32',1,'2026-08-19 09:29:32',NULL,'vertical','#8b5cf6','Staff Identity Card',NULL,'10 Koya Street Water Works','Kan Tech Solution School',1,1,1,1,1,1,0,1,1,1,NULL,0);

DROP TABLE IF EXISTS `staff_leave_requests`;
CREATE TABLE `staff_leave_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `apply_date` date NOT NULL,
  `days` decimal(6,2) NOT NULL,
  `document_path` varchar(500) DEFAULT NULL,
  `from_date` date NOT NULL,
  `half_day` varchar(30) DEFAULT NULL,
  `leave_type` varchar(100) NOT NULL,
  `note` varchar(2000) DEFAULT NULL,
  `reason` varchar(2000) DEFAULT NULL,
  `role` varchar(100) NOT NULL,
  `staff_id_code` varchar(50) NOT NULL,
  `staff_member_id` bigint NOT NULL,
  `staff_name` varchar(200) NOT NULL,
  `status` varchar(20) NOT NULL,
  `submitted_by_name` varchar(100) DEFAULT NULL,
  `submitted_by_staff_id` varchar(50) DEFAULT NULL,
  `to_date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `staff_leave_requests` VALUES (1,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-08-08',5.00,NULL,'2026-08-26',NULL,'Medical Leave','','Sample leave request','Teacher','654',8,'Aman Verma','Disapproved','Joe Black','9000','2026-08-30');
INSERT INTO `staff_leave_requests` VALUES (3,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-08-09',2.00,NULL,'2026-08-15',NULL,'Casual Leave','','Sample leave request','Admin','9001',2,'Emily Davis','Approved','Joe Black','9000','2026-08-16');
INSERT INTO `staff_leave_requests` VALUES (4,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-08-07',3.00,NULL,'2026-08-20',NULL,'Medical Leave','','Sample leave request','Super Admin','9000',1,'Joe Black','Pending','Joe Black','9000','2026-08-22');
INSERT INTO `staff_leave_requests` VALUES (5,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-08-06',0.50,NULL,'2026-08-18','First Half','Casual Leave','','Sample leave request','Librarian','9004',5,'Michael Chen','Approved','Joe Black','9000','2026-08-18');
INSERT INTO `staff_leave_requests` VALUES (6,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-08-05',3.00,NULL,'2026-09-01',NULL,'Sick Leave','','Sample leave request','Teacher','654',8,'Aman Verma','Pending','Joe Black','9000','2026-09-03');
INSERT INTO `staff_leave_requests` VALUES (7,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-08-04',3.00,NULL,'2026-09-10',NULL,'Medical Leave','','Sample leave request','Receptionist','9006',7,'David Wilson','Disapproved','Joe Black','9000','2026-09-12');
INSERT INTO `staff_leave_requests` VALUES (8,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-08-03',3.00,NULL,'2026-08-25',NULL,'Casual Leave','','Sample leave request','Admin','9001',2,'Emily Davis','Approved','Joe Black','9000','2026-08-27');
INSERT INTO `staff_leave_requests` VALUES (9,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-08-02',0.50,NULL,'2026-08-14','Second Half','Sick Leave','','Sample leave request','Super Admin','9000',1,'Joe Black','Pending','Joe Black','9000','2026-08-14');
INSERT INTO `staff_leave_requests` VALUES (10,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-08-01',3.00,NULL,'2026-08-05',NULL,'Medical Leave','','Sample leave request','Librarian','9004',5,'Michael Chen','Approved','Joe Black','9000','2026-08-07');
INSERT INTO `staff_leave_requests` VALUES (11,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-07-30',2.00,NULL,'2026-08-28',NULL,'Casual Leave','','Sample leave request','Teacher','654',8,'Aman Verma','Pending','Joe Black','9000','2026-08-29');
INSERT INTO `staff_leave_requests` VALUES (12,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-07-29',3.00,NULL,'2026-08-21',NULL,'Sick Leave','','Sample leave request','Receptionist','9006',7,'David Wilson','Disapproved','Joe Black','9000','2026-08-23');
INSERT INTO `staff_leave_requests` VALUES (13,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-07-28',0.50,NULL,'2026-08-11','First Half','Medical Leave','','Sample leave request','Admin','9001',2,'Emily Davis','Approved','Joe Black','9000','2026-08-11');
INSERT INTO `staff_leave_requests` VALUES (14,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-07-27',2.00,NULL,'2026-08-19',NULL,'Casual Leave','','Sample leave request','Super Admin','9000',1,'Joe Black','Pending','Joe Black','9000','2026-08-20');
INSERT INTO `staff_leave_requests` VALUES (15,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-07-26',3.00,NULL,'2026-08-06',NULL,'Sick Leave','','Sample leave request','Librarian','9004',5,'Michael Chen','Approved','Joe Black','9000','2026-08-08');
INSERT INTO `staff_leave_requests` VALUES (16,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-07-25',2.00,NULL,'2026-08-13',NULL,'Medical Leave','','Sample leave request','Teacher','654',8,'Aman Verma','Pending','Joe Black','9000','2026-08-14');
INSERT INTO `staff_leave_requests` VALUES (17,'2026-08-12 13:50:32',1,'2026-08-12 13:50:32','2026-07-24',0.50,NULL,'2026-08-17','Second Half','Casual Leave','','Sample leave request','Receptionist','9006',7,'David Wilson','Disapproved','Joe Black','9000','2026-08-17');
INSERT INTO `staff_leave_requests` VALUES (18,'2026-08-12 13:52:58',1,'2026-08-12 13:52:58','2026-08-12',5.00,'/uploads/leaves/7eb486b1a5cc452b94b8d163cbf0f6b6.png','2026-08-10',NULL,'Medical Leave','Testing','Sick','Admin','AD001',9,'Mohamed Kanu','Approved','Joe Black','9000','2026-08-14');
INSERT INTO `staff_leave_requests` VALUES (19,'2026-08-12 14:04:50',1,'2026-08-12 14:04:50','2026-08-12',5.00,NULL,'2026-08-10',NULL,'Medical Leave',NULL,'','Super Admin','9000',1,'Joe Black','Pending','Joe Black','9000','2026-08-14');
INSERT INTO `staff_leave_requests` VALUES (20,'2026-08-12 14:04:50',1,'2026-08-12 14:04:50','2026-08-12',5.00,NULL,'2026-08-10',NULL,'Medical Leave',NULL,'','Super Admin','9000',1,'Joe Black','Pending','Joe Black','9000','2026-08-14');

DROP TABLE IF EXISTS `staff_leave_types`;
CREATE TABLE `staff_leave_types` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKs2d4r11aklt8geylyaqldnse7` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `staff_leave_types` VALUES (1,'2026-08-12 14:24:40',1,'2026-08-12 14:24:40','Medical Leave');
INSERT INTO `staff_leave_types` VALUES (2,'2026-08-12 14:24:40',1,'2026-08-12 14:24:40','Casual Leave');
INSERT INTO `staff_leave_types` VALUES (3,'2026-08-12 14:24:40',1,'2026-08-12 14:24:40','Maternity Leave');
INSERT INTO `staff_leave_types` VALUES (4,'2026-08-12 14:24:40',1,'2026-08-12 14:24:40','Sick Leave');
INSERT INTO `staff_leave_types` VALUES (5,'2026-08-12 14:24:40',1,'2026-08-12 14:24:40','mandatory leave');
INSERT INTO `staff_leave_types` VALUES (6,'2026-08-12 14:26:51',1,'2026-08-12 14:26:51','Quick Leave');

DROP TABLE IF EXISTS `staff_members`;
CREATE TABLE `staff_members` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `is_disabled` bit(1) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `gender` varchar(20) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `marital_status` varchar(30) DEFAULT NULL,
  `mother_name` varchar(100) DEFAULT NULL,
  `note` varchar(500) DEFAULT NULL,
  `pan_number` varchar(20) NOT NULL,
  `permanent_address` varchar(500) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `photo_path` varchar(500) DEFAULT NULL,
  `qualification` varchar(300) DEFAULT NULL,
  `roles` varchar(500) NOT NULL,
  `staff_id` varchar(50) NOT NULL,
  `work_experience` varchar(300) DEFAULT NULL,
  `account_title` varchar(150) DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `bank_branch_name` varchar(150) DEFAULT NULL,
  `bank_name` varchar(150) DEFAULT NULL,
  `basic_salary` varchar(50) DEFAULT NULL,
  `casual_leave` int DEFAULT NULL,
  `contract_type` varchar(50) DEFAULT NULL,
  `epf_no` varchar(50) DEFAULT NULL,
  `facebook_url` varchar(300) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `instagram_url` varchar(300) DEFAULT NULL,
  `joining_letter_path` varchar(500) DEFAULT NULL,
  `linkedin_url` varchar(300) DEFAULT NULL,
  `mandatory_leave` int DEFAULT NULL,
  `maternity_leave` int DEFAULT NULL,
  `medical_leave` int DEFAULT NULL,
  `other_document_path` varchar(500) DEFAULT NULL,
  `resignation_letter_path` varchar(500) DEFAULT NULL,
  `resume_path` varchar(500) DEFAULT NULL,
  `sick_leave` int DEFAULT NULL,
  `twitter_url` varchar(300) DEFAULT NULL,
  `work_location` varchar(200) DEFAULT NULL,
  `work_shift` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKn0rxf263af3eth14fusxobb1p` (`email`),
  UNIQUE KEY `UKt092lr8lqo8k89i04mukd37pk` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `staff_members` VALUES (1,'2026-08-11 15:30:16',1,'2026-08-11 15:30:16',NULL,NULL,'2020-06-01','Admin','Technical Head',0,'joe.black@school.com',NULL,NULL,'Joe','Male','Black','Ground Floor, Admin',NULL,NULL,NULL,'ABCDE1234F',NULL,'9876543210',NULL,NULL,'Super Admin,Technical Head','9000',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `staff_members` VALUES (2,'2026-08-11 15:30:16',1,'2026-08-11 15:30:16',NULL,NULL,'2020-06-01','Admin','Principal',0,'emily.davis@school.com',NULL,NULL,'Emily','Female','Davis','Ground Floor, Admin',NULL,NULL,NULL,'ABCDE1235F',NULL,'9876543211',NULL,NULL,'Admin,Principal','9001',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `staff_members` VALUES (3,'2026-08-11 15:30:16',1,'2026-08-11 15:30:16',NULL,NULL,'2020-06-01','Academic','Senior Teacher',0,'shivam.verma@school.com',NULL,NULL,'Shivam','Male','Verma','1st Floor, Academic',NULL,NULL,NULL,'ABCDE1236F',NULL,'9876543212',NULL,NULL,'Teacher,Faculty','9002',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `staff_members` VALUES (4,'2026-08-11 15:30:16',1,'2026-08-11 15:30:16',NULL,NULL,'2020-06-01','Academic','Teacher',0,'sarah.johnson@school.com',NULL,NULL,'Sarah','Female','Johnson','1st Floor, Academic',NULL,NULL,NULL,'ABCDE1237F',NULL,'9876543213',NULL,NULL,'Teacher','9003',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `staff_members` VALUES (5,'2026-08-11 15:30:16',1,'2026-08-11 15:30:16',NULL,NULL,'2020-06-01','Library','Librarian',0,'michael.chen@school.com',NULL,NULL,'Michael','Male','Chen','2nd Floor, Library',NULL,NULL,NULL,'ABCDE1238F',NULL,'9876543214',NULL,NULL,'Librarian','9004',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `staff_members` VALUES (6,'2026-08-11 15:30:16',1,'2026-08-11 15:30:16',NULL,NULL,'2020-06-01','Finance','Accountant',0,'priya.sharma@school.com',NULL,NULL,'Priya','Female','Sharma','Ground Floor, Finance',NULL,NULL,NULL,'ABCDE1239F',NULL,'9876543215',NULL,NULL,'Accountant','9005',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `staff_members` VALUES (7,'2026-08-11 15:30:16',1,'2026-08-11 15:30:16',NULL,NULL,'2020-06-01','Reception','Receptionist',0,'david.wilson@school.com',NULL,NULL,'David','Male','Wilson','Ground Floor, Reception',NULL,NULL,NULL,'ABCDE1240F',NULL,'9876543216',NULL,NULL,'Receptionist','9006',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `staff_members` VALUES (8,'2026-08-11 15:30:16',1,'2026-08-11 15:30:16',NULL,NULL,'2020-06-01','Academic','Teacher',0,'aman.verma@school.com',NULL,NULL,'Aman','Male','Verma','1st Floor, Academic',NULL,NULL,NULL,'ABCDE1241F',NULL,'9876543217',NULL,NULL,'Teacher','654',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `staff_members` VALUES (9,'2026-08-11 15:38:42',1,'2026-08-12 10:07:47','10 Koya Street Makeni','1990-07-12','2026-08-11','Admin','Admin Officer',0,'mohamed@gmail.com','+23276897654','Abdul Kanu','Mohamed','Male','Kanu','Makeni','Married','Isatu Kamara','','EMP001','10 Koya Street Makeni','+23276806797','/uploads/staff/739d7727-2717-45d5-9741-ee9bdc071706.jpg','Masters in Computer Application (MCA)
Bachelor of Science in Information Technology (BSc)','Admin','AD001','9 years working Experience','Salary','0987654678398','Makeni','UBA','75000',2,'Permanent','EF01','https://mohamedkanu','IFSC1010','https://mohamedkanu',NULL,'https://mohamedkanu',1,1,1,NULL,'/uploads/staff-documents/df2f2a94-0e64-4cbe-8fe8-1d48d52ad28d.png','/uploads/staff-documents/9e8392bf-48c4-4d5b-af83-e94893a9b146.png',1,'https://mohamedkanu','Makeni','Early');

DROP TABLE IF EXISTS `staff_payroll_records`;
CREATE TABLE `staff_payroll_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `basic_salary` double DEFAULT NULL,
  `deductions_json` text,
  `earnings_json` text,
  `gross_salary` double DEFAULT NULL,
  `net_salary` double DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_mode` varchar(50) DEFAULT NULL,
  `payroll_month` int NOT NULL,
  `payroll_year` int NOT NULL,
  `payslip_no` varchar(50) DEFAULT NULL,
  `staff_member_id` bigint NOT NULL,
  `status` varchar(20) NOT NULL,
  `tax` double DEFAULT NULL,
  `total_deduction` double DEFAULT NULL,
  `total_earning` double DEFAULT NULL,
  `is_reverted` bit(1) DEFAULT NULL,
  `payment_note` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKrl7qoddnaq28if7d8dc70hei` (`staff_member_id`,`payroll_month`,`payroll_year`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `staff_payroll_records` VALUES (1,'2026-08-12 12:41:17',1,'2026-08-12 12:41:17',45000.0,'[{"type":"","amount":0.0}]','[{"type":"45000","amount":0.0}]',45000.0,45000.0,'2026-08-12','Cash',8,2026,'508',8,'Paid',0.0,0.0,0.0,NULL,NULL);
INSERT INTO `staff_payroll_records` VALUES (2,'2026-08-12 12:41:17',1,'2026-08-12 12:41:17',45000.0,'[{"type":"","amount":0.0}]','[{"type":"45000","amount":0.0}]',45000.0,45000.0,'2026-08-12','Cash',8,2026,'507',7,'Paid',0.0,0.0,0.0,NULL,NULL);
INSERT INTO `staff_payroll_records` VALUES (3,'2026-08-12 12:41:17',1,'2026-08-12 12:41:17',45000.0,'[{"type":"","amount":0.0}]','[{"type":"45000","amount":0.0}]',45000.0,45000.0,'2026-08-12','Cash',8,2026,'502',2,'Paid',0.0,0.0,0.0,NULL,NULL);
INSERT INTO `staff_payroll_records` VALUES (4,'2026-08-12 12:41:17',1,'2026-08-12 12:41:17',45000.0,'[{"type":"","amount":0.0}]','[{"type":"45000","amount":0.0}]',45000.0,45000.0,'2026-08-12','Cash',8,2026,'501',1,'Paid',0.0,0.0,0.0,NULL,NULL);
INSERT INTO `staff_payroll_records` VALUES (5,'2026-08-12 12:41:17',1,'2026-08-12 12:41:17',45000.0,'[{"type":"","amount":0.0}]','[{"type":"45000","amount":0.0}]',45000.0,45000.0,'2026-08-12','Cash',8,2026,'505',5,'Paid',0.0,0.0,0.0,NULL,NULL);
INSERT INTO `staff_payroll_records` VALUES (6,'2026-08-12 12:41:17',1,'2026-08-12 13:10:01',75000.0,'[{"type":"","amount":0.0}]','[{"type":"75000","amount":0.0}]',75000.0,75000.0,'2026-08-12','Cash',8,2026,'509',9,'Generated',0.0,0.0,0.0,1,NULL);
INSERT INTO `staff_payroll_records` VALUES (7,'2026-08-12 12:41:17',1,'2026-08-12 12:41:17',45000.0,'[{"type":"","amount":0.0}]','[{"type":"45000","amount":0.0}]',45000.0,45000.0,'2026-08-12','Cash',8,2026,'506',6,'Paid',0.0,0.0,0.0,NULL,NULL);
INSERT INTO `staff_payroll_records` VALUES (8,'2026-08-12 12:41:17',1,'2026-08-12 12:41:17',45000.0,'[{"type":"","amount":0.0}]','[{"type":"45000","amount":0.0}]',45000.0,45000.0,'2026-08-12','Cash',8,2026,'504',4,'Paid',0.0,0.0,0.0,NULL,NULL);
INSERT INTO `staff_payroll_records` VALUES (9,'2026-08-12 12:41:17',1,'2026-08-12 13:26:37',45000.0,'[{"type":"","amount":0.0}]','[{"type":"45000","amount":0.0}]',45000.0,45000.0,'2026-08-12','Cheque',8,2026,'503',3,'Paid',0.0,0.0,0.0,0,'test');

DROP TABLE IF EXISTS `staff_teacher_ratings`;
CREATE TABLE `staff_teacher_ratings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `comment` varchar(2000) DEFAULT NULL,
  `rating` int NOT NULL,
  `staff_id_code` varchar(50) NOT NULL,
  `staff_member_id` bigint NOT NULL,
  `staff_name` varchar(200) NOT NULL,
  `status` varchar(20) NOT NULL,
  `student_admission_no` varchar(50) DEFAULT NULL,
  `student_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `staff_teacher_ratings` VALUES (1,'2026-08-12 14:39:55',1,'2026-08-12 14:41:44','Motivates students to progress',5,'9006',7,'David Wilson','Approved','908875','Saurabh Shah');
INSERT INTO `staff_teacher_ratings` VALUES (2,'2026-08-12 14:39:55',1,'2026-08-12 14:39:55','Excellent',5,'9001',2,'Emily Davis','Approved','908901','Rahul Kumar');
INSERT INTO `staff_teacher_ratings` VALUES (3,'2026-08-12 14:39:55',1,'2026-08-12 14:39:55','good teaching and learning',4,'654',8,'Aman Verma','Approved','908912','Priya Singh');
INSERT INTO `staff_teacher_ratings` VALUES (4,'2026-08-12 14:39:55',1,'2026-08-12 14:39:55','Very helpful and patient',5,'9000',1,'Joe Black','Pending','908923','Amit Patel');
INSERT INTO `staff_teacher_ratings` VALUES (5,'2026-08-12 14:39:55',1,'2026-08-12 14:39:55','Needs improvement in communication',3,'9006',7,'David Wilson','Pending','908934','Neha Gupta');
INSERT INTO `staff_teacher_ratings` VALUES (6,'2026-08-12 14:39:55',1,'2026-08-12 14:39:55','Great classroom management',5,'9001',2,'Emily Davis','Approved','908945','Vikram Mehta');
INSERT INTO `staff_teacher_ratings` VALUES (7,'2026-08-12 14:39:55',1,'2026-08-12 14:39:55','Explains concepts clearly',4,'654',8,'Aman Verma','Approved','908956','Ananya Reddy');
INSERT INTO `staff_teacher_ratings` VALUES (8,'2026-08-12 14:39:55',1,'2026-08-12 14:39:55','Outstanding mentor',5,'9004',5,'Michael Chen','Approved','908967','Karan Joshi');
INSERT INTO `staff_teacher_ratings` VALUES (9,'2026-08-12 14:39:55',1,'2026-08-12 14:39:55','Good subject knowledge',4,'9000',1,'Joe Black','Pending','908978','Divya Nair');
INSERT INTO `staff_teacher_ratings` VALUES (10,'2026-08-12 14:39:55',1,'2026-08-12 14:39:55','Encourages participation',5,'9006',7,'David Wilson','Approved','908989','Rohan Das');
INSERT INTO `staff_teacher_ratings` VALUES (11,'2026-08-12 14:39:55',1,'2026-08-12 14:39:55','Friendly and approachable',4,'9001',2,'Emily Davis','Approved','908990','Sneha Iyer');
INSERT INTO `staff_teacher_ratings` VALUES (12,'2026-08-12 14:39:55',1,'2026-08-12 14:39:55','Best teacher in the school',5,'654',8,'Aman Verma','Approved','908991','Arjun Malhotra');
INSERT INTO `staff_teacher_ratings` VALUES (13,'2026-08-12 14:39:55',1,'2026-08-12 14:39:55','Average performance',3,'9000',1,'Joe Black','Pending','908992','Meera Kapoor');
INSERT INTO `staff_teacher_ratings` VALUES (14,'2026-08-12 14:39:55',1,'2026-08-12 14:39:55','Highly recommended',5,'9004',5,'Michael Chen','Approved','908993','Sanjay Verma');

DROP TABLE IF EXISTS `student_admissions`;
CREATE TABLE `student_admissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admission_date` date DEFAULT NULL,
  `admission_no` varchar(50) NOT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `bank_name` varchar(150) DEFAULT NULL,
  `blood_group` varchar(20) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `current_address` text,
  `date_of_birth` date NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `father_name` varchar(150) DEFAULT NULL,
  `father_occupation` varchar(150) DEFAULT NULL,
  `father_phone` varchar(30) DEFAULT NULL,
  `fees_month` varchar(50) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `gender` varchar(20) NOT NULL,
  `guardian_address` varchar(500) DEFAULT NULL,
  `guardian_email` varchar(150) DEFAULT NULL,
  `guardian_is` varchar(30) DEFAULT NULL,
  `guardian_name` varchar(150) DEFAULT NULL,
  `guardian_occupation` varchar(150) DEFAULT NULL,
  `guardian_phone` varchar(30) DEFAULT NULL,
  `guardian_relation` varchar(100) DEFAULT NULL,
  `height` varchar(30) DEFAULT NULL,
  `ifsc_code` varchar(50) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `local_id` varchar(100) DEFAULT NULL,
  `measurement_date` date DEFAULT NULL,
  `medical_history` varchar(500) DEFAULT NULL,
  `mobile_number` varchar(30) DEFAULT NULL,
  `mother_name` varchar(150) DEFAULT NULL,
  `mother_occupation` varchar(150) DEFAULT NULL,
  `mother_phone` varchar(30) DEFAULT NULL,
  `national_id` varchar(100) DEFAULT NULL,
  `note` text,
  `permanent_address` text,
  `pickup_point` varchar(100) DEFAULT NULL,
  `previous_school_details` text,
  `religion` varchar(100) DEFAULT NULL,
  `roll_number` varchar(50) DEFAULT NULL,
  `route_list` varchar(100) DEFAULT NULL,
  `rte` varchar(10) DEFAULT NULL,
  `section_name` varchar(20) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `weight` varchar(30) DEFAULT NULL,
  `category_id` bigint DEFAULT NULL,
  `hostel_id` bigint DEFAULT NULL,
  `hostel_room_id` bigint DEFAULT NULL,
  `house_id` bigint DEFAULT NULL,
  `school_class_id` bigint NOT NULL,
  `photo_path` varchar(500) DEFAULT NULL,
  `disable_reason` varchar(255) DEFAULT NULL,
  `disabled` bit(1) NOT NULL DEFAULT b'0',
  `enrolled` bit(1) NOT NULL DEFAULT b'1',
  `form_status` varchar(50) DEFAULT NULL,
  `online_admission` bit(1) NOT NULL DEFAULT b'0',
  `payment_status` varchar(50) DEFAULT NULL,
  `reference_no` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKkc93vl0jnjx07bmkh2v4ahndp` (`admission_no`),
  KEY `FK54b99weyfn5gp9a262cuightr` (`category_id`),
  KEY `FKgr8x4ip0miv69ptepkf0kduqh` (`hostel_id`),
  KEY `FKgmu6y90sm0u0oqu42lm8x31y1` (`hostel_room_id`),
  KEY `FKf43xrlqpudkk3ef2epv0xfung` (`house_id`),
  KEY `FKerkdi0b6f3q4yp4t22k4pxs47` (`school_class_id`),
  CONSTRAINT `FK54b99weyfn5gp9a262cuightr` FOREIGN KEY (`category_id`) REFERENCES `student_categories` (`id`),
  CONSTRAINT `FKerkdi0b6f3q4yp4t22k4pxs47` FOREIGN KEY (`school_class_id`) REFERENCES `school_classes` (`id`),
  CONSTRAINT `FKf43xrlqpudkk3ef2epv0xfung` FOREIGN KEY (`house_id`) REFERENCES `school_houses` (`id`),
  CONSTRAINT `FKgmu6y90sm0u0oqu42lm8x31y1` FOREIGN KEY (`hostel_room_id`) REFERENCES `hostel_rooms` (`id`),
  CONSTRAINT `FKgr8x4ip0miv69ptepkf0kduqh` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `student_admissions` VALUES (1,'2026-08-05','001','0000091232897588','UBA','B+','2026-08-05 16:23:43','10 Koya Street Makeni','1989-09-22','alhajimohamedkanu@gmail.com','Alhaji Andrew Kanu','Teacher','077150549','','Alhaji Mohamed','Male','10 Koya Street Makeni','andrew@gmail.com','Father','Andrew','Teacher','0771505493','Father','5.4','232213','Kanu','121231231e13132','2026-08-05','','077150549','Marie Andrew Kanu','House wife','0771505495','3223424234435','Good Testing','','','Good','Islam','001','','No','BLUE','2026-08-05 16:23:43','95',1,1,1,1,2,NULL,NULL,0,1,NULL,0,NULL,NULL);
INSERT INTO `student_admissions` VALUES (3,'2026-08-06','002','0000091232897588','UBA','O+','2026-08-06 12:47:19','10 Koya Street Makeni','1991-08-23','mariatu@gmail.com','James True','Teacher','0771505497','August','Marie','Female','10 Koya Street Makeni','moe@gmail.com','Mother','Moe Deen','House wife','077150549','Mother','6.7','232213','Smith','121231231e13132','2026-08-06','Good','076897890','Mae Deen','House wife','077150549','3223424234435','Good','10 Koya Street Makeni','','Good Details','Islam','002','','Yes','WHITE','2026-08-06 12:47:19','95',1,2,2,3,2,NULL,NULL,0,1,NULL,0,NULL,NULL);
INSERT INTO `student_admissions` VALUES (4,'2026-08-06','003','0000091232897588','UBA','B+','2026-08-06 13:11:27','10 Koya Street Makeni','2002-09-09','gifty@gmail.com','Alhaji Andrew Kanu','Teacher','077150549','','Gifty','Female','10 Koya Street Makeni','alhajimohamedkanu@gmail.com','Mother','Andrew','House wife','077150549','Father','5.4','232212','Hemans','121231231e13132','2026-08-06','','088765489','Marie Andrew Kanu','House wife','077150549','3223424234435','Testing','10 Koya Street Makeni','','Testing','Christian','003','','Yes','RED','2026-08-06 13:11:27','95',5,NULL,NULL,2,2,'/uploads/students/d1826ed8649b4b6ca07af9d9febb162e.jpg',NULL,0,1,NULL,0,NULL,NULL);

DROP TABLE IF EXISTS `student_attendance_entries`;
CREATE TABLE `student_attendance_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `attendance_date` date NOT NULL,
  `entry_time` varchar(20) DEFAULT NULL,
  `exit_time` varchar(20) DEFAULT NULL,
  `note` varchar(500) DEFAULT NULL,
  `source` varchar(50) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `student_admission_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKosw5oe3u0fidwt95bfjlar9u4` (`student_admission_id`,`attendance_date`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `student_attendance_entries` VALUES (1,'2026-08-11 09:16:32',1,'2026-08-11 09:16:32','2026-08-11','8:45 AM','9:00 AM','','Manual','Half Day',1);

DROP TABLE IF EXISTS `student_categories`;
CREATE TABLE `student_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK4yukq28k24bood8f7xmflqx7a` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `student_categories` VALUES (1,'Science','2026-08-05 10:50:32','2026-08-05 10:50:32');
INSERT INTO `student_categories` VALUES (2,'Art','2026-08-05 10:50:41','2026-08-05 10:50:41');
INSERT INTO `student_categories` VALUES (3,'Commercial','2026-08-05 10:50:54','2026-08-05 10:50:54');
INSERT INTO `student_categories` VALUES (4,'Physically Challenged','2026-08-05 10:51:52','2026-08-05 10:51:52');
INSERT INTO `student_categories` VALUES (5,'General','2026-08-05 10:52:05','2026-08-05 10:52:05');

DROP TABLE IF EXISTS `student_certificate_templates`;
CREATE TABLE `student_certificate_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `background_image_url` varchar(500) DEFAULT NULL,
  `body_height` int DEFAULT NULL,
  `body_text` text NOT NULL,
  `body_width` int DEFAULT NULL,
  `certificate_name` varchar(200) NOT NULL,
  `footer_center_text` varchar(255) DEFAULT NULL,
  `footer_height` int DEFAULT NULL,
  `footer_left_text` varchar(255) DEFAULT NULL,
  `footer_right_text` varchar(255) DEFAULT NULL,
  `header_center_text` varchar(255) DEFAULT NULL,
  `header_height` int DEFAULT NULL,
  `header_left_text` varchar(255) DEFAULT NULL,
  `header_right_text` varchar(255) DEFAULT NULL,
  `student_photo` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `student_certificate_templates` VALUES (1,'2026-08-19 09:29:32',1,'2026-08-19 10:50:19','/uploads/certificates/e5bc6278-2322-40ae-9928-f2d97a9a2112.png',420,'This is to certify that [name] son/daughter of [father_name] is a bonafide student of this school. He/She is studying in class [class] section [section] with admission no. [admission_no]. Date of birth as per school record is [dob]. Issued on [created_at].',800,'Character Certificate','Checked By',70,'Class Teacher','Principal','Character Certificate',80,'Affiliation No.','School Code',1);

DROP TABLE IF EXISTS `student_class_assignments`;
CREATE TABLE `student_class_assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `section_name` varchar(20) NOT NULL,
  `student_admission_id` bigint NOT NULL,
  `school_class_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKk7ib753qxkb1jka5torvywthp` (`school_class_id`),
  CONSTRAINT `FKk7ib753qxkb1jka5torvywthp` FOREIGN KEY (`school_class_id`) REFERENCES `school_classes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `student_class_assignments` VALUES (3,'2026-08-17 08:53:33','BLUE',1,2);
INSERT INTO `student_class_assignments` VALUES (4,'2026-08-17 08:53:33','WHITE',1,2);

DROP TABLE IF EXISTS `student_cv_educations`;
CREATE TABLE `student_cv_educations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `details` text,
  `marks` varchar(50) DEFAULT NULL,
  `qualification` varchar(100) DEFAULT NULL,
  `school_name` varchar(200) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `year` varchar(20) DEFAULT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK937byeqhi9bn0eqaxumbwkt80` (`student_id`),
  CONSTRAINT `FK937byeqhi9bn0eqaxumbwkt80` FOREIGN KEY (`student_id`) REFERENCES `student_admissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `student_cv_profiles`;
CREATE TABLE `student_cv_profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `about` text,
  `designation` varchar(150) DEFAULT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKabfl6q8h5x4tn3qi8pmeybsmo` (`student_id`),
  CONSTRAINT `FKesb9yu3f6s0lrcawaxxycbc4u` FOREIGN KEY (`student_id`) REFERENCES `student_admissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `student_cv_references`;
CREATE TABLE `student_cv_references` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `contact` varchar(50) DEFAULT NULL,
  `designation` varchar(150) DEFAULT NULL,
  `details` text,
  `name` varchar(150) DEFAULT NULL,
  `relation` varchar(100) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKtlei8b8lvyp8pegauwybnaid1` (`student_id`),
  CONSTRAINT `FKtlei8b8lvyp8pegauwybnaid1` FOREIGN KEY (`student_id`) REFERENCES `student_admissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `student_cv_settings`;
CREATE TABLE `student_cv_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `education_enabled` bit(1) NOT NULL,
  `enabled_student_fields` text,
  `other_details_enabled` bit(1) NOT NULL,
  `references_enabled` bit(1) NOT NULL,
  `skills_enabled` bit(1) NOT NULL,
  `student_panel_download` bit(1) NOT NULL,
  `work_experience_enabled` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `student_cv_settings` VALUES (1,'2026-08-18 16:43:37',1,'2026-08-18 16:43:37',1,'studentName,admissionNo,rollNumber,classLabel,gender,dateOfBirth,categoryName,religion,email,mobileNumber,bloodGroup,fatherName,motherName,currentAddress,photo',1,1,1,0,1);

DROP TABLE IF EXISTS `student_cv_skills`;
CREATE TABLE `student_cv_skills` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `details` text,
  `skill_category` varchar(150) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK33x1xqmiovbrhhca8x1lehkmk` (`student_id`),
  CONSTRAINT `FK33x1xqmiovbrhhca8x1lehkmk` FOREIGN KEY (`student_id`) REFERENCES `student_admissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `student_cv_work_experiences`;
CREATE TABLE `student_cv_work_experiences` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `designation` varchar(150) DEFAULT NULL,
  `details` text,
  `institution` varchar(200) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `years` varchar(50) DEFAULT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKoamvi8aoiavilwegjr857narg` (`student_id`),
  CONSTRAINT `FKoamvi8aoiavilwegjr857narg` FOREIGN KEY (`student_id`) REFERENCES `student_admissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `student_id_card_templates`;
CREATE TABLE `student_id_card_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `background_image_url` varchar(500) DEFAULT NULL,
  `design_type` varchar(30) DEFAULT NULL,
  `header_color` varchar(30) DEFAULT NULL,
  `id_card_title` varchar(200) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `school_address` varchar(500) DEFAULT NULL,
  `school_name` varchar(200) DEFAULT NULL,
  `show_address` bit(1) NOT NULL,
  `show_admission_no` bit(1) NOT NULL,
  `show_barcode` bit(1) NOT NULL,
  `show_blood_group` bit(1) NOT NULL,
  `show_class` bit(1) NOT NULL,
  `show_dob` bit(1) NOT NULL,
  `show_father_name` bit(1) NOT NULL,
  `show_house` bit(1) NOT NULL,
  `show_mother_name` bit(1) NOT NULL,
  `show_phone` bit(1) NOT NULL,
  `show_roll_no` bit(1) NOT NULL,
  `show_student_name` bit(1) NOT NULL,
  `signature_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `student_id_card_templates` VALUES (1,'2026-08-19 09:29:32',1,'2026-08-19 10:53:45','/uploads/certificates/cb4e878a-cf90-4932-9049-49c3f5682105.png','vertical','#8b5cf6','Student Identity Card','/uploads/certificates/1bd48216-e1e2-4ab5-bd25-0e9ef666764e.png','10 Koya Street Water Works','Kan Tech Solution School',1,1,1,1,1,1,1,1,1,1,1,1,'/uploads/certificates/d8f5c6bc-44ba-483e-8bd4-8a03b6a644ba.jpg');
INSERT INTO `student_id_card_templates` VALUES (2,'2026-08-19 10:56:05',1,'2026-08-19 11:24:03','/uploads/certificates/7da114ab-7909-4595-b5a3-940d3e9ad99d.png','horizontal','#000000','Student Class Card','/uploads/certificates/c7f0becc-fb71-488a-b089-3f93fbd3f658.png','10 Koya Street Water Works','Kan Tech Solution School',1,1,1,1,1,1,1,1,1,1,1,1,'/uploads/certificates/28b3d40c-d2fc-41b3-a0d1-57ffc5c44d3d.jpg');

DROP TABLE IF EXISTS `student_leave_requests`;
CREATE TABLE `student_leave_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `action_date` date DEFAULT NULL,
  `admission_no` varchar(50) DEFAULT NULL,
  `apply_date` date NOT NULL,
  `approved_by_name` varchar(100) DEFAULT NULL,
  `approved_by_staff_id` varchar(50) DEFAULT NULL,
  `class_id` bigint NOT NULL,
  `class_name` varchar(100) NOT NULL,
  `document_path` varchar(500) DEFAULT NULL,
  `from_date` date NOT NULL,
  `reason` varchar(2000) DEFAULT NULL,
  `section_name` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `student_admission_id` bigint NOT NULL,
  `student_name` varchar(200) NOT NULL,
  `to_date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `student_leave_requests` VALUES (1,'2026-08-11 09:35:38',1,'2026-08-11 09:35:38','2026-08-11','001','2026-08-11','Joe Black','9000',2,'Class 1','/uploads/leaves/85079324ae4b4c70bf6865a429e8ed41.png','2026-08-17','Sick','BLUE','Approve',1,'Alhaji Mohamed Kanu','2026-08-21');

DROP TABLE IF EXISTS `student_siblings`;
CREATE TABLE `student_siblings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `draft_token` varchar(64) DEFAULT NULL,
  `sibling_admission_id` bigint NOT NULL,
  `student_admission_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_sibling_pair` (`student_admission_id`,`sibling_admission_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `student_siblings` VALUES (1,'2026-08-14 11:48:53',NULL,1,4);
INSERT INTO `student_siblings` VALUES (2,'2026-08-14 11:48:53',NULL,4,1);

DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `admission_date` date NOT NULL,
  `admission_number` varchar(50) NOT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `date_of_birth` date NOT NULL,
  `enrollment_status` enum('ACTIVE','GRADUATED','INACTIVE','TRANSFERRED','WITHDRAWN') DEFAULT NULL,
  `gender` enum('FEMALE','MALE','OTHER') NOT NULL,
  `medical_conditions` varchar(500) DEFAULT NULL,
  `previous_school` varchar(200) DEFAULT NULL,
  `roll_number` varchar(20) DEFAULT NULL,
  `academic_year_id` bigint DEFAULT NULL,
  `section_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK4ijilwehsq4n3vhrdlq722lnc` (`admission_number`),
  UNIQUE KEY `UKg4fwvutq09fjdlb4bb0byp7t` (`user_id`),
  KEY `FKg2mn7xulrj0msca8k41gelyg` (`academic_year_id`),
  KEY `FKbu72kq4xd8qjcemytgfxel71l` (`section_id`),
  CONSTRAINT `FKbu72kq4xd8qjcemytgfxel71l` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`),
  CONSTRAINT `FKdt1cjx5ve5bdabmuuf3ibrwaq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKg2mn7xulrj0msca8k41gelyg` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `subject_group_sections`;
CREATE TABLE `subject_group_sections` (
  `subject_group_id` bigint NOT NULL,
  `section_name` varchar(20) DEFAULT NULL,
  `section_order` int NOT NULL,
  PRIMARY KEY (`subject_group_id`,`section_order`),
  CONSTRAINT `FKc7uu16b3k5gtnh7usdriie7y7` FOREIGN KEY (`subject_group_id`) REFERENCES `subject_groups` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `subject_group_sections` VALUES (1,'A',0);
INSERT INTO `subject_group_sections` VALUES (1,'B',1);
INSERT INTO `subject_group_sections` VALUES (1,'C',2);
INSERT INTO `subject_group_sections` VALUES (1,'D',3);
INSERT INTO `subject_group_sections` VALUES (1,'E',4);
INSERT INTO `subject_group_sections` VALUES (2,'A',0);
INSERT INTO `subject_group_sections` VALUES (2,'B',1);
INSERT INTO `subject_group_sections` VALUES (2,'C',2);
INSERT INTO `subject_group_sections` VALUES (2,'D',3);
INSERT INTO `subject_group_sections` VALUES (2,'E',4);
INSERT INTO `subject_group_sections` VALUES (3,'A',0);
INSERT INTO `subject_group_sections` VALUES (3,'B',1);
INSERT INTO `subject_group_sections` VALUES (3,'C',2);
INSERT INTO `subject_group_sections` VALUES (3,'D',3);
INSERT INTO `subject_group_sections` VALUES (3,'E',4);
INSERT INTO `subject_group_sections` VALUES (4,'A',0);
INSERT INTO `subject_group_sections` VALUES (4,'B',1);
INSERT INTO `subject_group_sections` VALUES (4,'C',2);
INSERT INTO `subject_group_sections` VALUES (4,'D',3);
INSERT INTO `subject_group_sections` VALUES (4,'E',4);
INSERT INTO `subject_group_sections` VALUES (5,'A',0);
INSERT INTO `subject_group_sections` VALUES (5,'B',1);
INSERT INTO `subject_group_sections` VALUES (5,'C',2);
INSERT INTO `subject_group_sections` VALUES (5,'D',3);
INSERT INTO `subject_group_sections` VALUES (5,'E',4);
INSERT INTO `subject_group_sections` VALUES (6,'A',0);
INSERT INTO `subject_group_sections` VALUES (6,'B',1);
INSERT INTO `subject_group_sections` VALUES (6,'C',2);
INSERT INTO `subject_group_sections` VALUES (6,'D',3);
INSERT INTO `subject_group_sections` VALUES (6,'E',4);

DROP TABLE IF EXISTS `subject_group_subjects`;
CREATE TABLE `subject_group_subjects` (
  `subject_group_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  PRIMARY KEY (`subject_group_id`,`subject_id`),
  KEY `FKq5f24xj97vqfyh062gfo1cfh7` (`subject_id`),
  CONSTRAINT `FKdtw07ur57bv1l52mu5tn9yiye` FOREIGN KEY (`subject_group_id`) REFERENCES `subject_groups` (`id`),
  CONSTRAINT `FKq5f24xj97vqfyh062gfo1cfh7` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `subject_group_subjects` VALUES (1,1);
INSERT INTO `subject_group_subjects` VALUES (2,1);
INSERT INTO `subject_group_subjects` VALUES (4,1);
INSERT INTO `subject_group_subjects` VALUES (5,1);
INSERT INTO `subject_group_subjects` VALUES (1,2);
INSERT INTO `subject_group_subjects` VALUES (2,2);
INSERT INTO `subject_group_subjects` VALUES (4,2);
INSERT INTO `subject_group_subjects` VALUES (5,2);
INSERT INTO `subject_group_subjects` VALUES (1,3);
INSERT INTO `subject_group_subjects` VALUES (2,3);
INSERT INTO `subject_group_subjects` VALUES (4,3);
INSERT INTO `subject_group_subjects` VALUES (5,3);
INSERT INTO `subject_group_subjects` VALUES (1,4);
INSERT INTO `subject_group_subjects` VALUES (2,4);
INSERT INTO `subject_group_subjects` VALUES (4,4);
INSERT INTO `subject_group_subjects` VALUES (5,4);
INSERT INTO `subject_group_subjects` VALUES (6,4);
INSERT INTO `subject_group_subjects` VALUES (2,5);
INSERT INTO `subject_group_subjects` VALUES (4,5);
INSERT INTO `subject_group_subjects` VALUES (5,5);
INSERT INTO `subject_group_subjects` VALUES (6,5);
INSERT INTO `subject_group_subjects` VALUES (1,6);
INSERT INTO `subject_group_subjects` VALUES (2,6);
INSERT INTO `subject_group_subjects` VALUES (4,6);
INSERT INTO `subject_group_subjects` VALUES (5,6);
INSERT INTO `subject_group_subjects` VALUES (6,6);
INSERT INTO `subject_group_subjects` VALUES (4,7);
INSERT INTO `subject_group_subjects` VALUES (6,7);
INSERT INTO `subject_group_subjects` VALUES (4,8);
INSERT INTO `subject_group_subjects` VALUES (6,8);
INSERT INTO `subject_group_subjects` VALUES (4,9);
INSERT INTO `subject_group_subjects` VALUES (5,9);
INSERT INTO `subject_group_subjects` VALUES (6,9);
INSERT INTO `subject_group_subjects` VALUES (6,10);
INSERT INTO `subject_group_subjects` VALUES (6,11);
INSERT INTO `subject_group_subjects` VALUES (3,12);
INSERT INTO `subject_group_subjects` VALUES (6,12);
INSERT INTO `subject_group_subjects` VALUES (6,13);
INSERT INTO `subject_group_subjects` VALUES (6,14);
INSERT INTO `subject_group_subjects` VALUES (6,15);
INSERT INTO `subject_group_subjects` VALUES (3,16);
INSERT INTO `subject_group_subjects` VALUES (6,16);
INSERT INTO `subject_group_subjects` VALUES (3,17);
INSERT INTO `subject_group_subjects` VALUES (6,17);
INSERT INTO `subject_group_subjects` VALUES (3,18);
INSERT INTO `subject_group_subjects` VALUES (6,18);
INSERT INTO `subject_group_subjects` VALUES (3,19);
INSERT INTO `subject_group_subjects` VALUES (6,19);
INSERT INTO `subject_group_subjects` VALUES (3,20);
INSERT INTO `subject_group_subjects` VALUES (6,20);

DROP TABLE IF EXISTS `subject_groups`;
CREATE TABLE `subject_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `name` varchar(150) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `school_class_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKkx5x9a2635b1t4chsb2qc4rq7` (`school_class_id`),
  CONSTRAINT `FKkx5x9a2635b1t4chsb2qc4rq7` FOREIGN KEY (`school_class_id`) REFERENCES `school_classes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `subject_groups` VALUES (1,'2026-08-05 12:10:07','This are the subject for class 1','Class 1 Subject','2026-08-05 12:10:07',2);
INSERT INTO `subject_groups` VALUES (2,'2026-08-05 12:12:19','','Class 2 Subject','2026-08-05 12:12:19',3);
INSERT INTO `subject_groups` VALUES (3,'2026-08-05 12:12:56','','Class 3 Subject','2026-08-05 12:12:56',4);
INSERT INTO `subject_groups` VALUES (4,'2026-08-05 12:13:47','','Class 4 Subject','2026-08-05 12:13:47',5);
INSERT INTO `subject_groups` VALUES (5,'2026-08-05 12:14:32','','Class 5 Subject','2026-08-05 12:14:32',6);
INSERT INTO `subject_groups` VALUES (6,'2026-08-05 12:15:30','','Class 6 Subject','2026-08-05 12:16:09',7);

DROP TABLE IF EXISTS `subjects`;
CREATE TABLE `subjects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `credit_hours` int DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `subject_type` enum('PRACTICAL','THEORY') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKaodt3utnw0lsov4k9ta88dbpr` (`name`),
  UNIQUE KEY `UKqt734ivq9gq4yo4p1j1lhhk8l` (`subject_code`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `subjects` VALUES (1,'2026-08-05 11:47:33',1,'2026-08-05 11:47:33',NULL,NULL,'English Language','E001','THEORY');
INSERT INTO `subjects` VALUES (2,'2026-08-05 11:48:30',1,'2026-08-05 11:48:30',NULL,NULL,'Mathematics','MA002','THEORY');
INSERT INTO `subjects` VALUES (3,'2026-08-05 11:48:50',1,'2026-08-05 11:48:50',NULL,NULL,'Science','SC003','THEORY');
INSERT INTO `subjects` VALUES (4,'2026-08-05 11:49:29',1,'2026-08-05 11:49:29',NULL,NULL,'Social Studies','SS004','THEORY');
INSERT INTO `subjects` VALUES (5,'2026-08-05 11:50:14',1,'2026-08-05 11:50:14',NULL,NULL,'Computer','C005','PRACTICAL');
INSERT INTO `subjects` VALUES (6,'2026-08-05 11:50:51',1,'2026-08-05 11:50:51',NULL,NULL,'Drawing','D006','PRACTICAL');
INSERT INTO `subjects` VALUES (7,'2026-08-05 11:51:20',1,'2026-08-05 11:51:20',NULL,NULL,'Religious Moral Education','RM007','THEORY');
INSERT INTO `subjects` VALUES (8,'2026-08-05 11:51:41',1,'2026-08-05 11:51:41',NULL,NULL,'Business Studies','BS008','THEORY');
INSERT INTO `subjects` VALUES (9,'2026-08-05 11:52:19',1,'2026-08-05 11:52:19',NULL,NULL,'Economics','EC009','THEORY');
INSERT INTO `subjects` VALUES (10,'2026-08-05 11:52:55',1,'2026-08-05 11:52:55',NULL,NULL,'Home Management','HM010','PRACTICAL');
INSERT INTO `subjects` VALUES (11,'2026-08-05 11:53:28',1,'2026-08-05 11:53:28',NULL,NULL,'Physics','P011','PRACTICAL');
INSERT INTO `subjects` VALUES (12,'2026-08-05 11:53:45',1,'2026-08-05 11:53:57',NULL,NULL,'Chmestry','C013','PRACTICAL');
INSERT INTO `subjects` VALUES (13,'2026-08-05 11:54:24',1,'2026-08-05 11:54:24',NULL,NULL,'Health Science','HS014','THEORY');
INSERT INTO `subjects` VALUES (14,'2026-08-05 11:54:59',1,'2026-08-05 11:55:51',NULL,NULL,'Financial Accounting','FA015','PRACTICAL');
INSERT INTO `subjects` VALUES (15,'2026-08-05 11:55:31',1,'2026-08-05 11:55:31',NULL,NULL,'Cost Accounting','CA016','THEORY');
INSERT INTO `subjects` VALUES (16,'2026-08-05 11:56:20',1,'2026-08-05 11:56:20',NULL,NULL,'Geography','G017','PRACTICAL');
INSERT INTO `subjects` VALUES (17,'2026-08-05 11:57:09',1,'2026-08-05 11:57:09',NULL,NULL,'Further Mathematics','FM018','THEORY');
INSERT INTO `subjects` VALUES (18,'2026-08-05 11:57:37',1,'2026-08-05 11:57:37',NULL,NULL,'History','H019','THEORY');
INSERT INTO `subjects` VALUES (19,'2026-08-05 11:58:03',1,'2026-08-05 11:58:03',NULL,NULL,'Govenment','GO020','THEORY');
INSERT INTO `subjects` VALUES (20,'2026-08-05 11:58:44',1,'2026-08-05 11:58:44',NULL,NULL,'Literature in English','LE021','THEORY');
INSERT INTO `subjects` VALUES (21,'2026-08-11 13:06:04',1,'2026-08-11 13:06:04',NULL,NULL,'English','210',NULL);
INSERT INTO `subjects` VALUES (22,'2026-08-11 13:06:04',1,'2026-08-11 13:06:04',NULL,NULL,'Hindi','230',NULL);

DROP TABLE IF EXISTS `teacher_subjects`;
CREATE TABLE `teacher_subjects` (
  `teacher_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  PRIMARY KEY (`teacher_id`,`subject_id`),
  KEY `FKdweqkwxroox2u7pbmksehx04i` (`subject_id`),
  CONSTRAINT `FK6dcl3ihufp4v0j1fuxlw4ksoj` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`),
  CONSTRAINT `FKdweqkwxroox2u7pbmksehx04i` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `teachers`;
CREATE TABLE `teachers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `experience_years` int DEFAULT NULL,
  `gender` enum('FEMALE','MALE','OTHER') DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `qualification` varchar(200) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKcd1k6xwg9jqtiwx9ybnxpmoh9` (`user_id`),
  UNIQUE KEY `UK8xdh0jsitskwq83arwxvyihhc` (`employee_id`),
  CONSTRAINT `FKb8dct7w2j1vl1r2bpstw5isc0` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `thermal_print_setting`;
CREATE TABLE `thermal_print_setting` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `address` text,
  `footer_text` text,
  `school_name` varchar(200) NOT NULL,
  `thermal_print_enabled` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `thermal_print_setting` VALUES (1,'2026-08-21 10:28:58',1,'2026-08-21 10:30:28','10 Koya Street Makeni','This receipt is computer generated hence no signature is required.','Kan Tech Solution School',0);

DROP TABLE IF EXISTS `timetable`;
CREATE TABLE `timetable` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `day_of_week` enum('FRIDAY','MONDAY','SATURDAY','SUNDAY','THURSDAY','TUESDAY','WEDNESDAY') NOT NULL,
  `end_time` time NOT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `period_number` int DEFAULT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `start_time` time NOT NULL,
  `course_id` bigint DEFAULT NULL,
  `section_id` bigint NOT NULL,
  `teacher_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK4vt1li1h959xak8464e071ndv` (`section_id`,`day_of_week`,`start_time`),
  KEY `FKjajnt6yd487y0tbyuoouiry85` (`course_id`),
  KEY `FK5fvd6wo7htj2gcfwblr8anh24` (`teacher_id`),
  CONSTRAINT `FK5fvd6wo7htj2gcfwblr8anh24` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`),
  CONSTRAINT `FKbap5wm9bxsyswh25l62n031k8` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`),
  CONSTRAINT `FKjajnt6yd487y0tbyuoouiry85` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `transport_fee_months`;
CREATE TABLE `transport_fee_months` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `fine_type` enum('FIX','NONE','PERCENTAGE') DEFAULT NULL,
  `fixed_amount` decimal(12,2) DEFAULT NULL,
  `month_index` int NOT NULL,
  `month_name` varchar(20) NOT NULL,
  `percentage` decimal(8,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKpbtqepsjjvd74rjn2hq5q94im` (`month_name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `transport_fee_months` VALUES (1,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18',NULL,'NONE',NULL,1,'April',NULL);
INSERT INTO `transport_fee_months` VALUES (2,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18',NULL,'NONE',NULL,2,'May',NULL);
INSERT INTO `transport_fee_months` VALUES (3,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18',NULL,'NONE',NULL,3,'June',NULL);
INSERT INTO `transport_fee_months` VALUES (4,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18',NULL,'NONE',NULL,4,'July',NULL);
INSERT INTO `transport_fee_months` VALUES (5,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18',NULL,'NONE',NULL,5,'August',NULL);
INSERT INTO `transport_fee_months` VALUES (6,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18',NULL,'NONE',NULL,6,'September',NULL);
INSERT INTO `transport_fee_months` VALUES (7,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18',NULL,'NONE',NULL,7,'October',NULL);
INSERT INTO `transport_fee_months` VALUES (8,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18',NULL,'NONE',NULL,8,'November',NULL);
INSERT INTO `transport_fee_months` VALUES (9,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18',NULL,'NONE',NULL,9,'December',NULL);
INSERT INTO `transport_fee_months` VALUES (10,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18',NULL,'NONE',NULL,10,'January',NULL);
INSERT INTO `transport_fee_months` VALUES (11,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18',NULL,'NONE',NULL,11,'February',NULL);
INSERT INTO `transport_fee_months` VALUES (12,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18',NULL,'NONE',NULL,12,'March',NULL);

DROP TABLE IF EXISTS `transport_pickup_points`;
CREATE TABLE `transport_pickup_points` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `latitude` varchar(50) DEFAULT NULL,
  `longitude` varchar(50) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK8n3nb30axgpxvmmysd03xortg` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `transport_pickup_points` VALUES (1,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18','26.9124','75.7873','School Gate');
INSERT INTO `transport_pickup_points` VALUES (2,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18','26.9050','75.8100','City Mall');
INSERT INTO `transport_pickup_points` VALUES (3,'2026-08-18 15:57:56',1,'2026-08-18 15:57:56',NULL,NULL,'Makeni NP');

DROP TABLE IF EXISTS `transport_route_stops`;
CREATE TABLE `transport_route_stops` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `distance` decimal(10,2) DEFAULT NULL,
  `monthly_fees` decimal(12,2) DEFAULT NULL,
  `pickup_time` time DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `pickup_point_id` bigint NOT NULL,
  `route_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKjuvn5dkn6sdavy3jai430aund` (`pickup_point_id`),
  KEY `FK3g7nxemyga5l4k2u6pn0e6ut0` (`route_id`),
  CONSTRAINT `FK3g7nxemyga5l4k2u6pn0e6ut0` FOREIGN KEY (`route_id`) REFERENCES `transport_routes` (`id`),
  CONSTRAINT `FKjuvn5dkn6sdavy3jai430aund` FOREIGN KEY (`pickup_point_id`) REFERENCES `transport_pickup_points` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `transport_route_stops` VALUES (1,'2026-08-18 16:08:35',1,'2026-08-18 16:08:35',NULL,NULL,NULL,1,3,3);

DROP TABLE IF EXISTS `transport_route_vehicles`;
CREATE TABLE `transport_route_vehicles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `route_id` bigint NOT NULL,
  `vehicle_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKkmie53y3pseotsnrwvht6cgjw` (`route_id`,`vehicle_id`),
  KEY `FK21sj3p215a6708tc7l8ru4vaf` (`vehicle_id`),
  CONSTRAINT `FK21sj3p215a6708tc7l8ru4vaf` FOREIGN KEY (`vehicle_id`) REFERENCES `transport_vehicles` (`id`),
  CONSTRAINT `FK2v6ojmvgtosn63sh0lbnbhoqo` FOREIGN KEY (`route_id`) REFERENCES `transport_routes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `transport_route_vehicles` VALUES (1,'2026-08-18 16:01:59',1,'2026-08-18 16:01:59',3,1);
INSERT INTO `transport_route_vehicles` VALUES (2,'2026-08-18 16:02:10',1,'2026-08-18 16:02:10',1,1);

DROP TABLE IF EXISTS `transport_routes`;
CREATE TABLE `transport_routes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKbknt74kmm4gcdwu8ws6ixcroy` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `transport_routes` VALUES (1,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18','Airport');
INSERT INTO `transport_routes` VALUES (2,'2026-08-18 15:54:18',1,'2026-08-18 15:54:18','Ganga Nagar');
INSERT INTO `transport_routes` VALUES (3,'2026-08-18 15:58:47',1,'2026-08-18 15:58:47','NP Part Makeni');

DROP TABLE IF EXISTS `transport_student_fees`;
CREATE TABLE `transport_student_fees` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `month_name` varchar(20) NOT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKcsjggu3kph9v0vrd170kb6dx2` (`student_id`,`month_name`),
  CONSTRAINT `FK1qxay5eatv8bhe9gn81r05pl` FOREIGN KEY (`student_id`) REFERENCES `student_admissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `transport_vehicles`;
CREATE TABLE `transport_vehicles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `chassis_number` varchar(80) DEFAULT NULL,
  `driver_contact` varchar(40) DEFAULT NULL,
  `driver_licence` varchar(80) DEFAULT NULL,
  `driver_name` varchar(150) DEFAULT NULL,
  `max_seating_capacity` int DEFAULT NULL,
  `note` varchar(1000) DEFAULT NULL,
  `photo_path` varchar(500) DEFAULT NULL,
  `registration_number` varchar(80) DEFAULT NULL,
  `vehicle_model` varchar(120) DEFAULT NULL,
  `vehicle_number` varchar(80) NOT NULL,
  `year_made` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK4u0itefn33whl8v95nbk4g4gm` (`vehicle_number`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `transport_vehicles` VALUES (1,'2026-08-18 15:54:19',1,'2026-08-18 15:54:19','CHS5544','9876543210','RJ-14-2018-1234567','Ramesh Kumar',40,'Morning and afternoon shift',NULL,'RJ14CA5544','Tata Starbus','RJ14 CA 5544','2022');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `is_verified` bit(1) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `profile_image_url` varchar(500) DEFAULT NULL,
  `role` enum('ADMIN','PARENT','STUDENT','SUPER_ADMIN','TEACHER') NOT NULL,
  `username` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `video_tutorials`;
CREATE TABLE `video_tutorials` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `class_name` varchar(120) NOT NULL,
  `created_by` varchar(120) DEFAULT NULL,
  `description` text,
  `section` varchar(80) NOT NULL,
  `title` varchar(255) NOT NULL,
  `video_link` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `video_tutorials` VALUES (1,'2026-08-14 14:22:49',1,'2026-08-14 14:22:49','Class 1','Admin','gbrthrtr','BLUE','gngnggnfngnghn','https://youtube.com');

DROP TABLE IF EXISTS `visitor_purposes`;
CREATE TABLE `visitor_purposes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `name` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `visitor_purposes` VALUES (1,'2026-02-04 10:58:11','Maketing description','Maketing','2026-02-04 10:58:11');

DROP TABLE IF EXISTS `visitors`;
CREATE TABLE `visitors` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `date` date NOT NULL,
  `id_card` varchar(50) NOT NULL,
  `in_time` time NOT NULL,
  `meeting_with` varchar(200) NOT NULL,
  `note` varchar(500) DEFAULT NULL,
  `number_of_person` int NOT NULL,
  `out_time` time DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `purpose` varchar(100) NOT NULL,
  `visitor_name` varchar(100) NOT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `visitors` VALUES (1,'2026-02-03 11:25:29',1,'2026-02-03 11:41:43','2026-02-03','12345','11:24:00','Admin Staff','',2,'01:25:00','+23276806789','Student Meeting','David Wood',NULL);
INSERT INTO `visitors` VALUES (2,'2026-02-03 11:41:14',1,'2026-02-03 11:41:14','2026-02-03','34235','11:39:00','Principal','This is a testing',2,'13:42:00','23276806797','Parent Teacher Meeting','Isatu Kamara',NULL);

DROP TABLE IF EXISTS `whatsapp_config`;
CREATE TABLE `whatsapp_config` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `active_provider` varchar(20) NOT NULL,
  `meta_access_token` text,
  `meta_language` varchar(20) DEFAULT NULL,
  `meta_phone_number` varchar(50) DEFAULT NULL,
  `meta_status` varchar(20) DEFAULT NULL,
  `twilio_account_sid` varchar(120) DEFAULT NULL,
  `twilio_auth_token` text,
  `twilio_from_number` varchar(50) DEFAULT NULL,
  `twilio_status` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `whatsapp_config` VALUES (1,'2026-08-19 15:50:17',1,'2026-08-19 15:54:22','META','ghgmhgmhgghgghh657676','en','+2327715049','Enabled',NULL,NULL,NULL,'Disabled');

SET FOREIGN_KEY_CHECKS=1;
