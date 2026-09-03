/**
 * Smart School Application - Entity Model Package
 * 
 * This package contains all the JPA entity classes representing the database schema
 * for the Smart School Application. The schema is designed to manage all aspects
 * of a modern school management system.
 * 
 * <h2>Main Entity Categories:</h2>
 * 
 * <h3>1. User Management</h3>
 * <ul>
 *   <li>{@link com.kantechsolution.smart_school.model.User} - Base user entity for all system users</li>
 *   <li>{@link com.kantechsolution.smart_school.model.Teacher} - Teaching staff with subject associations</li>
 *   <li>{@link com.kantechsolution.smart_school.model.Student} - Student records with enrollment details</li>
 *   <li>{@link com.kantechsolution.smart_school.model.Parent} - Parent/Guardian information linked to students</li>
 * </ul>
 * 
 * <h3>2. Academic Structure</h3>
 * <ul>
 *   <li>{@link com.kantechsolution.smart_school.model.AcademicYear} - School academic year configuration</li>
 *   <li>{@link com.kantechsolution.smart_school.model.Grade} - Grade levels (Grade 1, Grade 2, etc.)</li>
 *   <li>{@link com.kantechsolution.smart_school.model.Section} - Class sections within grades</li>
 *   <li>{@link com.kantechsolution.smart_school.model.Subject} - Academic subjects</li>
 *   <li>{@link com.kantechsolution.smart_school.model.Course} - Specific course offerings</li>
 * </ul>
 * 
 * <h3>3. Attendance & Assessment</h3>
 * <ul>
 *   <li>{@link com.kantechsolution.smart_school.model.Attendance} - Daily student attendance tracking</li>
 *   <li>{@link com.kantechsolution.smart_school.model.Assignment} - Course assignments</li>
 *   <li>{@link com.kantechsolution.smart_school.model.AssignmentSubmission} - Student assignment submissions</li>
 *   <li>{@link com.kantechsolution.smart_school.model.Exam} - Scheduled examinations</li>
 *   <li>{@link com.kantechsolution.smart_school.model.ExamResult} - Student exam results</li>
 * </ul>
 * 
 * <h3>4. Administrative</h3>
 * <ul>
 *   <li>{@link com.kantechsolution.smart_school.model.Timetable} - Class scheduling and timetables</li>
 *   <li>{@link com.kantechsolution.smart_school.model.Fee} - Student fee management</li>
 *   <li>{@link com.kantechsolution.smart_school.model.Announcement} - School announcements and notices</li>
 *   <li>{@link com.kantechsolution.smart_school.model.Event} - School events and activities</li>
 *   <li>{@link com.kantechsolution.smart_school.model.AdmissionEnquiry} - Admission enquiry tracking</li>
 * </ul>
 * 
 * <h3>5. Library Management</h3>
 * <ul>
 *   <li>{@link com.kantechsolution.smart_school.model.Library} - Library book inventory</li>
 *   <li>{@link com.kantechsolution.smart_school.model.LibraryTransaction} - Book borrowing transactions</li>
 * </ul>
 * 
 * <h2>Key Features:</h2>
 * <ul>
 *   <li>All entities extend {@link com.kantechsolution.smart_school.model.BaseEntity} for common fields</li>
 *   <li>Automatic timestamp management (created_at, updated_at)</li>
 *   <li>Soft delete capability via isActive flag</li>
 *   <li>Proper relationship mappings (OneToOne, OneToMany, ManyToMany)</li>
 *   <li>Comprehensive enumerations for type safety</li>
 *   <li>Lombok annotations for reduced boilerplate</li>
 *   <li>JPA annotations for ORM mapping</li>
 * </ul>
 * 
 * @author Smart School Development Team
 * @version 1.0
 * @since 2026-01-29
 */
package com.kantechsolution.smart_school.model;
