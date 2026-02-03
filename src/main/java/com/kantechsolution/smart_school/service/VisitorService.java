package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Visitor;
import com.kantechsolution.smart_school.repository.VisitorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Visitor operations
 */
@Service
@RequiredArgsConstructor
@Transactional
public class VisitorService {
    
    private final VisitorRepository repository;
    
    /**
     * Save a new visitor
     */
    public Visitor saveVisitor(Visitor visitor) {
        return repository.save(visitor);
    }
    
    /**
     * Get all visitors
     */
    public List<Visitor> getAllVisitors() {
        return repository.findAllByOrderByDateDescInTimeDesc();
    }
    
    /**
     * Get visitor by ID
     */
    public Optional<Visitor> getVisitorById(Long id) {
        return repository.findById(id);
    }
    
    /**
     * Update visitor
     */
    public Visitor updateVisitor(Long id, Visitor visitorDetails) {
        Visitor visitor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visitor not found with id: " + id));
        
        visitor.setPurpose(visitorDetails.getPurpose());
        visitor.setMeetingWith(visitorDetails.getMeetingWith());
        visitor.setVisitorName(visitorDetails.getVisitorName());
        visitor.setPhone(visitorDetails.getPhone());
        visitor.setIdCard(visitorDetails.getIdCard());
        visitor.setNumberOfPerson(visitorDetails.getNumberOfPerson());
        visitor.setDate(visitorDetails.getDate());
        visitor.setInTime(visitorDetails.getInTime());
        visitor.setOutTime(visitorDetails.getOutTime());
        visitor.setNote(visitorDetails.getNote());
        visitor.setAttachment(visitorDetails.getAttachment());
        
        return repository.save(visitor);
    }
    
    /**
     * Delete visitor
     */
    public void deleteVisitor(Long id) {
        repository.deleteById(id);
    }
    
    /**
     * Get visitors by date
     */
    public List<Visitor> getVisitorsByDate(LocalDate date) {
        return repository.findByDate(date);
    }
    
    /**
     * Get visitors by date range
     */
    public List<Visitor> getVisitorsByDateRange(LocalDate startDate, LocalDate endDate) {
        return repository.findByDateBetween(startDate, endDate);
    }
    
    /**
     * Search visitors by name
     */
    public List<Visitor> searchByName(String name) {
        return repository.findByVisitorNameContainingIgnoreCase(name);
    }
}
