package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.FeeDiscount;
import com.kantechsolution.smart_school.model.FeeDiscount.DiscountType;
import com.kantechsolution.smart_school.repository.FeeDiscountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class FeeDiscountService {

    @Autowired
    private FeeDiscountRepository feeDiscountRepository;

    public List<FeeDiscount> getAllDiscounts() {
        return feeDiscountRepository.findAllByOrderByIdAsc();
    }

    public Optional<FeeDiscount> getDiscountById(Long id) {
        return feeDiscountRepository.findById(id);
    }

    @Transactional
    public FeeDiscount createDiscount(String name,
                                      String discountCode,
                                      String discountType,
                                      Double percentage,
                                      Double amount,
                                      Integer numberOfUseCount,
                                      LocalDate expiryDate,
                                      String description) {
        FeeDiscount discount = new FeeDiscount();
        applyValues(discount, name, discountCode, discountType, percentage, amount,
                numberOfUseCount, expiryDate, description, null);
        return feeDiscountRepository.save(discount);
    }

    @Transactional
    public FeeDiscount updateDiscount(Long id,
                                      String name,
                                      String discountCode,
                                      String discountType,
                                      Double percentage,
                                      Double amount,
                                      Integer numberOfUseCount,
                                      LocalDate expiryDate,
                                      String description) {
        FeeDiscount existing = feeDiscountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fees discount not found"));
        applyValues(existing, name, discountCode, discountType, percentage, amount,
                numberOfUseCount, expiryDate, description, id);
        return feeDiscountRepository.save(existing);
    }

    @Transactional
    public void deleteDiscount(Long id) {
        if (!feeDiscountRepository.existsById(id)) {
            throw new IllegalArgumentException("Fees discount not found");
        }
        feeDiscountRepository.deleteById(id);
    }

    private void applyValues(FeeDiscount discount,
                             String name,
                             String discountCode,
                             String discountType,
                             Double percentage,
                             Double amount,
                             Integer numberOfUseCount,
                             LocalDate expiryDate,
                             String description,
                             Long currentId) {
        String trimmedName = required(name, "Discount name is required");
        String trimmedCode = normalizeCode(discountCode);
        DiscountType type = parseDiscountType(discountType);

        Optional<FeeDiscount> duplicateName = feeDiscountRepository.findByNameIgnoreCase(trimmedName);
        if (duplicateName.isPresent() && (currentId == null || !duplicateName.get().getId().equals(currentId))) {
            throw new IllegalArgumentException("Discount name already exists");
        }

        Optional<FeeDiscount> duplicateCode = feeDiscountRepository.findByDiscountCodeIgnoreCase(trimmedCode);
        if (duplicateCode.isPresent() && (currentId == null || !duplicateCode.get().getId().equals(currentId))) {
            throw new IllegalArgumentException("Discount code already exists");
        }

        if (numberOfUseCount == null || numberOfUseCount < 0) {
            throw new IllegalArgumentException("Number of use count is required");
        }

        if (type == DiscountType.PERCENTAGE) {
            if (percentage == null || percentage < 0 || percentage > 100) {
                throw new IllegalArgumentException("Percentage must be between 0 and 100");
            }
            discount.setPercentage(percentage);
            discount.setAmount(amount == null ? 0.0 : amount);
        } else {
            if (amount == null || amount < 0) {
                throw new IllegalArgumentException("Amount is required");
            }
            discount.setAmount(amount);
            discount.setPercentage(percentage == null ? 0.0 : percentage);
        }

        discount.setName(trimmedName);
        discount.setDiscountCode(trimmedCode);
        discount.setDiscountType(type);
        discount.setNumberOfUseCount(numberOfUseCount);
        discount.setExpiryDate(expiryDate);
        discount.setDescription(description == null ? "" : description.trim());
    }

    private DiscountType parseDiscountType(String discountType) {
        String value = discountType == null ? "" : discountType.trim().toUpperCase(Locale.ROOT);
        if ("FIXED_AMOUNT".equals(value) || "FIX_AMOUNT".equals(value) || "FIXED".equals(value)) {
            return DiscountType.FIXED_AMOUNT;
        }
        if ("PERCENTAGE".equals(value) || value.isEmpty()) {
            return DiscountType.PERCENTAGE;
        }
        throw new IllegalArgumentException("Invalid discount type");
    }

    private String required(String value, String message) {
        String trimmed = value == null ? "" : value.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return trimmed;
    }

    private String normalizeCode(String discountCode) {
        String trimmed = required(discountCode, "Discount code is required");
        return trimmed.toLowerCase(Locale.ROOT).replace(' ', '-');
    }
}
