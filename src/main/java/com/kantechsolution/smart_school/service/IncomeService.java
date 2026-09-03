package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Income;
import com.kantechsolution.smart_school.model.IncomeHead;
import com.kantechsolution.smart_school.repository.IncomeHeadRepository;
import com.kantechsolution.smart_school.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IncomeService implements ApplicationRunner {

    private final IncomeRepository incomeRepository;
    private final IncomeHeadRepository incomeHeadRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedIncomeHeads();
        if (incomeRepository.count() == 0) {
            seedSampleIncomes();
        }
    }

    @Transactional(readOnly = true)
    public List<IncomeHead> getAllIncomeHeads() {
        return incomeHeadRepository.findAllByOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public Optional<IncomeHead> getIncomeHeadById(Long id) {
        return incomeHeadRepository.findById(id);
    }

    @Transactional
    public IncomeHead saveIncomeHead(IncomeHead incomeHead) {
        validateIncomeHead(incomeHead, null);
        return incomeHeadRepository.save(incomeHead);
    }

    @Transactional
    public IncomeHead updateIncomeHead(Long id, IncomeHead details) {
        IncomeHead incomeHead = incomeHeadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income head not found with ID: " + id));
        validateIncomeHead(details, id);
        incomeHead.setName(details.getName());
        incomeHead.setDescription(details.getDescription());
        return incomeHeadRepository.save(incomeHead);
    }

    @Transactional
    public void deleteIncomeHead(Long id) {
        if (!incomeHeadRepository.existsById(id)) {
            throw new RuntimeException("Income head not found with ID: " + id);
        }
        incomeHeadRepository.deleteById(id);
    }

    private void validateIncomeHead(IncomeHead incomeHead, Long excludeId) {
        if (incomeHead.getName() == null || incomeHead.getName().isBlank()) {
            throw new IllegalArgumentException("Income head is required");
        }
        String name = incomeHead.getName().trim();
        incomeHead.setName(name);
        boolean duplicate = incomeHeadRepository.findByNameIgnoreCase(name)
                .filter(existing -> excludeId == null || !existing.getId().equals(excludeId))
                .isPresent();
        if (duplicate) {
            throw new IllegalArgumentException("Income head already exists");
        }
    }

    @Transactional(readOnly = true)
    public List<Income> getAllIncomes() {
        return incomeRepository.findAllByOrderByDateDescIdDesc();
    }

    @Transactional(readOnly = true)
    public List<Income> searchIncomes(String searchType, String keyword) {
        List<Income> rows = filterBySearchType(searchType);
        if (keyword != null && !keyword.isBlank()) {
            String term = keyword.trim().toLowerCase(Locale.ROOT);
            rows = rows.stream()
                    .filter(income -> matchesKeyword(income, term))
                    .toList();
        }
        return rows;
    }

    private List<Income> filterBySearchType(String searchType) {
        LocalDate today = LocalDate.now();
        String type = searchType == null ? "this_year" : searchType.trim().toLowerCase(Locale.ROOT);

        return switch (type) {
            case "today" -> incomeRepository.findByDateBetweenOrderByDateDescIdDesc(today, today);
            case "this_week" -> {
                LocalDate start = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
                LocalDate end = today.with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));
                yield incomeRepository.findByDateBetweenOrderByDateDescIdDesc(start, end);
            }
            case "this_month" -> incomeRepository.findByDateBetweenOrderByDateDescIdDesc(
                    today.withDayOfMonth(1),
                    today.with(TemporalAdjusters.lastDayOfMonth())
            );
            case "all" -> incomeRepository.findAllByOrderByDateDescIdDesc();
            default -> incomeRepository.findByDateBetweenOrderByDateDescIdDesc(
                    today.with(TemporalAdjusters.firstDayOfYear()),
                    today.with(TemporalAdjusters.lastDayOfYear())
            );
        };
    }

    private boolean matchesKeyword(Income income, String term) {
        return contains(income.getName(), term)
                || contains(income.getDescription(), term)
                || contains(income.getInvoiceNumber(), term)
                || contains(income.getIncomeHead(), term)
                || (income.getAmount() != null && income.getAmount().toPlainString().contains(term));
    }

    private boolean contains(String value, String term) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(term);
    }

    @Transactional(readOnly = true)
    public Optional<Income> getIncomeById(Long id) {
        return incomeRepository.findById(id);
    }

    @Transactional
    public Income saveIncome(Income income) {
        validateIncome(income);
        return incomeRepository.save(income);
    }

    @Transactional
    public Income updateIncome(Long id, Income details) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income record not found with ID: " + id));
        validateIncome(details);
        income.setIncomeHead(details.getIncomeHead());
        income.setName(details.getName());
        income.setInvoiceNumber(details.getInvoiceNumber());
        income.setDate(details.getDate());
        income.setAmount(details.getAmount());
        income.setDescription(details.getDescription());
        income.setDocumentPath(details.getDocumentPath());
        return incomeRepository.save(income);
    }

    @Transactional
    public void deleteIncome(Long id) {
        incomeRepository.deleteById(id);
    }

    private void validateIncome(Income income) {
        if (income.getIncomeHead() == null || income.getIncomeHead().isBlank()) {
            throw new IllegalArgumentException("Income head is required");
        }
        if (income.getName() == null || income.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (income.getDate() == null) {
            throw new IllegalArgumentException("Date is required");
        }
        if (income.getAmount() == null || income.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount is required");
        }
    }

    private void seedIncomeHeads() {
        if (incomeHeadRepository.count() > 0) {
            return;
        }
        List.of("Rent", "Miscellaneous1", "Donation", "Transport", "Fees", "Miscellaneous",
                        "Uniform Sale", "Book Sale")
                .forEach(name -> incomeHeadRepository.save(IncomeHead.builder().name(name).build()));
    }

    private void seedSampleIncomes() {
        saveSeed("Student Uniform", "Student uniform sales", "63542",
                LocalDate.of(2026, 1, 3), new BigDecimal("250.00"), "Uniform Sale");
        saveSeed("School Donation", "General school donation", "88678",
                LocalDate.of(2026, 1, 6), new BigDecimal("200.00"), "Donation");
        saveSeed("Monthly Bus Rent", "Monthly bus rent collection", "5234",
                LocalDate.of(2026, 1, 22), new BigDecimal("150.00"), "Rent");
        saveSeed("NCRT NEW Books Publisher", "Book publisher payment", "",
                LocalDate.of(2026, 2, 11), new BigDecimal("200.00"), "Book Sale");
        saveSeed("Fees Donation", "Donation received for student fees", "6747680",
                LocalDate.of(2026, 8, 30), new BigDecimal("250.00"), "Donation");
        saveSeed("Hall Rent", "School hall rental income", "6747691",
                LocalDate.of(2026, 8, 28), new BigDecimal("150.00"), "Miscellaneous");
    }

    private void saveSeed(String name, String description, String invoiceNumber,
                          LocalDate date, BigDecimal amount, String incomeHead) {
        Income income = Income.builder()
                .name(name)
                .description(description)
                .invoiceNumber(invoiceNumber)
                .date(date)
                .amount(amount)
                .incomeHead(incomeHead)
                .build();
        incomeRepository.save(income);
    }
}
