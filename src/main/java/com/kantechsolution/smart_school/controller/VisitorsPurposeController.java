package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controller for Visitors Purpose Setup (Front Office Setup)
 */
@Controller
public class VisitorsPurposeController {
    
    @Autowired
    private VisitorPurposeRepository purposeRepository;
    
    @Autowired
    private ComplaintTypeRepository complaintTypeRepository;
    
    @Autowired
    private EnquirySourceRepository sourceRepository;
    
    @Autowired
    private EnquiryReferenceRepository referenceRepository;
    
    /**
     * Show visitors purpose setup page
     */
    @GetMapping("/visitorspurpose")
    public String showVisitorsPurposePage(Model model) {
        return "visitorspurpose";
    }
    
    // ========== Purpose CRUD Operations ==========
    
    @GetMapping("/api/purposes")
    @ResponseBody
    public ResponseEntity<List<VisitorPurpose>> getAllPurposes() {
        try {
            List<VisitorPurpose> purposes = purposeRepository.findAll();
            return ResponseEntity.ok(purposes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @PostMapping("/api/purposes")
    @ResponseBody
    public ResponseEntity<VisitorPurpose> createPurpose(@RequestBody VisitorPurpose purpose) {
        try {
            VisitorPurpose savedPurpose = purposeRepository.save(purpose);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPurpose);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @PutMapping("/api/purposes/{id}")
    @ResponseBody
    public ResponseEntity<VisitorPurpose> updatePurpose(@PathVariable Long id, @RequestBody VisitorPurpose purpose) {
        try {
            Optional<VisitorPurpose> existingPurpose = purposeRepository.findById(id);
            if (existingPurpose.isPresent()) {
                VisitorPurpose updatedPurpose = existingPurpose.get();
                updatedPurpose.setName(purpose.getName());
                updatedPurpose.setDescription(purpose.getDescription());
                purposeRepository.save(updatedPurpose);
                return ResponseEntity.ok(updatedPurpose);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @DeleteMapping("/api/purposes/{id}")
    @ResponseBody
    public ResponseEntity<Void> deletePurpose(@PathVariable Long id) {
        try {
            if (purposeRepository.existsById(id)) {
                purposeRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // ========== Complaint Type CRUD Operations ==========
    
    @GetMapping("/api/complaint-types")
    @ResponseBody
    public ResponseEntity<List<ComplaintType>> getAllComplaintTypes() {
        try {
            List<ComplaintType> types = complaintTypeRepository.findAll();
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @PostMapping("/api/complaint-types")
    @ResponseBody
    public ResponseEntity<ComplaintType> createComplaintType(@RequestBody ComplaintType type) {
        try {
            ComplaintType savedType = complaintTypeRepository.save(type);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedType);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @PutMapping("/api/complaint-types/{id}")
    @ResponseBody
    public ResponseEntity<ComplaintType> updateComplaintType(@PathVariable Long id, @RequestBody ComplaintType type) {
        try {
            Optional<ComplaintType> existingType = complaintTypeRepository.findById(id);
            if (existingType.isPresent()) {
                ComplaintType updatedType = existingType.get();
                updatedType.setName(type.getName());
                updatedType.setDescription(type.getDescription());
                complaintTypeRepository.save(updatedType);
                return ResponseEntity.ok(updatedType);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @DeleteMapping("/api/complaint-types/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteComplaintType(@PathVariable Long id) {
        try {
            if (complaintTypeRepository.existsById(id)) {
                complaintTypeRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // ========== Source CRUD Operations ==========
    
    @GetMapping("/api/sources")
    @ResponseBody
    public ResponseEntity<List<EnquirySource>> getAllSources() {
        try {
            List<EnquirySource> sources = sourceRepository.findAll();
            return ResponseEntity.ok(sources);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @PostMapping("/api/sources")
    @ResponseBody
    public ResponseEntity<EnquirySource> createSource(@RequestBody EnquirySource source) {
        try {
            EnquirySource savedSource = sourceRepository.save(source);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @PutMapping("/api/sources/{id}")
    @ResponseBody
    public ResponseEntity<EnquirySource> updateSource(@PathVariable Long id, @RequestBody EnquirySource source) {
        try {
            Optional<EnquirySource> existingSource = sourceRepository.findById(id);
            if (existingSource.isPresent()) {
                EnquirySource updatedSource = existingSource.get();
                updatedSource.setName(source.getName());
                updatedSource.setDescription(source.getDescription());
                sourceRepository.save(updatedSource);
                return ResponseEntity.ok(updatedSource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @DeleteMapping("/api/sources/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteSource(@PathVariable Long id) {
        try {
            if (sourceRepository.existsById(id)) {
                sourceRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // ========== Reference CRUD Operations ==========
    
    @GetMapping("/api/references")
    @ResponseBody
    public ResponseEntity<List<EnquiryReference>> getAllReferences() {
        try {
            List<EnquiryReference> references = referenceRepository.findAll();
            return ResponseEntity.ok(references);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @PostMapping("/api/references")
    @ResponseBody
    public ResponseEntity<EnquiryReference> createReference(@RequestBody EnquiryReference reference) {
        try {
            EnquiryReference savedReference = referenceRepository.save(reference);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedReference);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @PutMapping("/api/references/{id}")
    @ResponseBody
    public ResponseEntity<EnquiryReference> updateReference(@PathVariable Long id, @RequestBody EnquiryReference reference) {
        try {
            Optional<EnquiryReference> existingReference = referenceRepository.findById(id);
            if (existingReference.isPresent()) {
                EnquiryReference updatedReference = existingReference.get();
                updatedReference.setName(reference.getName());
                updatedReference.setDescription(reference.getDescription());
                referenceRepository.save(updatedReference);
                return ResponseEntity.ok(updatedReference);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @DeleteMapping("/api/references/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteReference(@PathVariable Long id) {
        try {
            if (referenceRepository.existsById(id)) {
                referenceRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
