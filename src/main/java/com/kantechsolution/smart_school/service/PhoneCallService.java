package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.PhoneCall;
import com.kantechsolution.smart_school.repository.PhoneCallRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service class for PhoneCall operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PhoneCallService {
    
    private final PhoneCallRepository phoneCallRepository;
    
    /**
     * Save a new phone call record
     */
    @Transactional
    public PhoneCall savePhoneCall(PhoneCall phoneCall) {
        log.info("Saving phone call record for: {}", phoneCall.getName());
        return phoneCallRepository.save(phoneCall);
    }
    
    /**
     * Get all phone call records
     */
    @Transactional(readOnly = true)
    public List<PhoneCall> getAllPhoneCalls() {
        log.info("Retrieving all phone call records");
        return phoneCallRepository.findAllByOrderByDateDesc();
    }
    
    /**
     * Get phone call by ID
     */
    @Transactional(readOnly = true)
    public Optional<PhoneCall> getPhoneCallById(Long id) {
        log.info("Retrieving phone call record with ID: {}", id);
        return phoneCallRepository.findById(id);
    }
    
    /**
     * Update an existing phone call record
     */
    @Transactional
    public PhoneCall updatePhoneCall(Long id, PhoneCall phoneCallDetails) {
        log.info("Updating phone call record with ID: {}", id);
        
        PhoneCall phoneCall = phoneCallRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phone call record not found with ID: " + id));
        
        phoneCall.setName(phoneCallDetails.getName());
        phoneCall.setPhone(phoneCallDetails.getPhone());
        phoneCall.setCallType(phoneCallDetails.getCallType());
        phoneCall.setDate(phoneCallDetails.getDate());
        phoneCall.setFollowUpDate(phoneCallDetails.getFollowUpDate());
        phoneCall.setCallDuration(phoneCallDetails.getCallDuration());
        phoneCall.setDescription(phoneCallDetails.getDescription());
        
        return phoneCallRepository.save(phoneCall);
    }
    
    /**
     * Delete a phone call record
     */
    @Transactional
    public void deletePhoneCall(Long id) {
        log.info("Deleting phone call record with ID: {}", id);
        phoneCallRepository.deleteById(id);
    }
    
    /**
     * Get phone calls by date range
     */
    @Transactional(readOnly = true)
    public List<PhoneCall> getPhoneCallsByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Retrieving phone calls between {} and {}", startDate, endDate);
        return phoneCallRepository.findByDateBetweenOrderByDateDesc(startDate, endDate);
    }
    
    /**
     * Get phone calls by call type
     */
    @Transactional(readOnly = true)
    public List<PhoneCall> getPhoneCallsByType(String callType) {
        log.info("Retrieving phone calls of type: {}", callType);
        return phoneCallRepository.findByCallTypeOrderByDateDesc(callType);
    }
    
    /**
     * Search phone calls by name
     */
    @Transactional(readOnly = true)
    public List<PhoneCall> searchPhoneCallsByName(String name) {
        log.info("Searching phone calls by name: {}", name);
        return phoneCallRepository.findByNameContainingIgnoreCaseOrderByDateDesc(name);
    }
    
    /**
     * Search phone calls by phone number
     */
    @Transactional(readOnly = true)
    public List<PhoneCall> searchPhoneCallsByPhone(String phone) {
        log.info("Searching phone calls by phone: {}", phone);
        return phoneCallRepository.findByPhoneContainingOrderByDateDesc(phone);
    }
}
