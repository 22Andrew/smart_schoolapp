package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AdmissionEnquiry;
import com.kantechsolution.smart_school.repository.AdmissionEnquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Seeds admission enquiries to match the Smart School demo receptionist dashboard.
 */
@Service
@RequiredArgsConstructor
@Order(55)
public class AdmissionEnquirySeedService implements ApplicationRunner {

    private final AdmissionEnquiryRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }

        LocalDate today = LocalDate.now();
        seed("Rahul Sharma", "+919876543210", "Class 1", AdmissionEnquiry.EnquiryStatus.ACTIVE, today.minusDays(12));
        seed("Priya Patel", "+919876543211", "Class 2", AdmissionEnquiry.EnquiryStatus.ACTIVE, today.minusDays(10));
        seed("Amit Singh", "+919876543212", "Class 3", AdmissionEnquiry.EnquiryStatus.ACTIVE, today.minusDays(8));
        seed("Sneha Gupta", "+919876543213", "Class 4", AdmissionEnquiry.EnquiryStatus.ACTIVE, today.minusDays(6));
        seed("Vikram Rao", "+919876543214", "Class 5", AdmissionEnquiry.EnquiryStatus.ACTIVE, today.minusDays(4));
        seed("Ananya Desai", "+919876543215", "Class 1", AdmissionEnquiry.EnquiryStatus.WON, today.minusDays(20));
        seed("Karan Mehta", "+919876543216", "Class 2", AdmissionEnquiry.EnquiryStatus.PASSIVE, today.minusDays(15));
    }

    private void seed(String name,
                      String phone,
                      String className,
                      AdmissionEnquiry.EnquiryStatus status,
                      LocalDate enquiryDate) {
        AdmissionEnquiry enquiry = AdmissionEnquiry.builder()
                .name(name)
                .phone(phone)
                .email(name.toLowerCase().replace(' ', '.') + "@example.com")
                .address("Demo Address")
                .description("Admission enquiry")
                .note("Demo seed data")
                .date(enquiryDate)
                .followUpDate(enquiryDate.plusDays(7))
                .status(status)
                .assigned("Joe Black (9000)")
                .reference("Staff")
                .source("Advertisement")
                .className(className)
                .childCount(1)
                .createdBy("Joe Black (9000)")
                .build();
        enquiry.setIsActive(true);
        repository.save(enquiry);
    }
}
