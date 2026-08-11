package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Expense;
import com.kantechsolution.smart_school.model.ExpenseHead;
import com.kantechsolution.smart_school.repository.ExpenseHeadRepository;
import com.kantechsolution.smart_school.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExpenseService implements ApplicationRunner {

    private final ExpenseRepository expenseRepository;
    private final ExpenseHeadRepository expenseHeadRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedExpenseHeads();
        if (expenseRepository.count() == 0) {
            seedSampleExpenses();
        }
    }

    @Transactional(readOnly = true)
    public List<ExpenseHead> getAllExpenseHeads() {
        return expenseHeadRepository.findAllByOrderByNameAsc();
    }

    @Transactional
    public ExpenseHead saveExpenseHead(ExpenseHead expenseHead) {
        validateExpenseHead(expenseHead, null);
        return expenseHeadRepository.save(expenseHead);
    }

    @Transactional
    public ExpenseHead updateExpenseHead(Long id, ExpenseHead details) {
        ExpenseHead expenseHead = expenseHeadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense head not found with ID: " + id));
        validateExpenseHead(details, id);
        expenseHead.setName(details.getName());
        expenseHead.setDescription(details.getDescription());
        return expenseHeadRepository.save(expenseHead);
    }

    @Transactional
    public void deleteExpenseHead(Long id) {
        if (!expenseHeadRepository.existsById(id)) {
            throw new RuntimeException("Expense head not found with ID: " + id);
        }
        expenseHeadRepository.deleteById(id);
    }

    private void validateExpenseHead(ExpenseHead expenseHead, Long excludeId) {
        if (expenseHead.getName() == null || expenseHead.getName().isBlank()) {
            throw new IllegalArgumentException("Expense head is required");
        }
        String name = expenseHead.getName().trim();
        expenseHead.setName(name);
        boolean duplicate = expenseHeadRepository.findByNameIgnoreCase(name)
                .filter(existing -> excludeId == null || !existing.getId().equals(excludeId))
                .isPresent();
        if (duplicate) {
            throw new IllegalArgumentException("Expense head already exists");
        }
    }

    @Transactional(readOnly = true)
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAllByOrderByDateDescIdDesc();
    }

    @Transactional(readOnly = true)
    public List<Expense> searchExpenses(String searchType, String keyword) {
        List<Expense> rows = filterBySearchType(searchType);
        if (keyword != null && !keyword.isBlank()) {
            String term = keyword.trim().toLowerCase(Locale.ROOT);
            rows = rows.stream()
                    .filter(expense -> matchesKeyword(expense, term))
                    .toList();
        }
        return rows;
    }

    private List<Expense> filterBySearchType(String searchType) {
        LocalDate today = LocalDate.now();
        String type = searchType == null ? "this_year" : searchType.trim().toLowerCase(Locale.ROOT);

        return switch (type) {
            case "today" -> expenseRepository.findByDateBetweenOrderByDateDescIdDesc(today, today);
            case "this_week" -> {
                LocalDate start = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
                LocalDate end = today.with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));
                yield expenseRepository.findByDateBetweenOrderByDateDescIdDesc(start, end);
            }
            case "this_month" -> expenseRepository.findByDateBetweenOrderByDateDescIdDesc(
                    today.withDayOfMonth(1),
                    today.with(TemporalAdjusters.lastDayOfMonth())
            );
            case "all" -> expenseRepository.findAllByOrderByDateDescIdDesc();
            default -> expenseRepository.findByDateBetweenOrderByDateDescIdDesc(
                    today.with(TemporalAdjusters.firstDayOfYear()),
                    today.with(TemporalAdjusters.lastDayOfYear())
            );
        };
    }

    private boolean matchesKeyword(Expense expense, String term) {
        return contains(expense.getName(), term)
                || contains(expense.getDescription(), term)
                || contains(expense.getInvoiceNumber(), term)
                || contains(expense.getExpenseHead(), term)
                || (expense.getAmount() != null && expense.getAmount().toPlainString().contains(term));
    }

    private boolean contains(String value, String term) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(term);
    }

    @Transactional(readOnly = true)
    public Optional<Expense> getExpenseById(Long id) {
        return expenseRepository.findById(id);
    }

    @Transactional
    public Expense saveExpense(Expense expense) {
        validateExpense(expense);
        return expenseRepository.save(expense);
    }

    @Transactional
    public Expense updateExpense(Long id, Expense details) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense record not found with ID: " + id));
        validateExpense(details);
        expense.setExpenseHead(details.getExpenseHead());
        expense.setName(details.getName());
        expense.setInvoiceNumber(details.getInvoiceNumber());
        expense.setDate(details.getDate());
        expense.setAmount(details.getAmount());
        expense.setDescription(details.getDescription());
        expense.setDocumentPath(details.getDocumentPath());
        return expenseRepository.save(expense);
    }

    @Transactional
    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }

    private void validateExpense(Expense expense) {
        if (expense.getExpenseHead() == null || expense.getExpenseHead().isBlank()) {
            throw new IllegalArgumentException("Expense head is required");
        }
        if (expense.getName() == null || expense.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (expense.getDate() == null) {
            throw new IllegalArgumentException("Date is required");
        }
        if (expense.getAmount() == null || expense.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount is required");
        }
    }

    private void seedExpenseHeads() {
        if (expenseHeadRepository.count() > 0) {
            return;
        }
        List.of("Stationery Purchase", "Electricity Bill", "Telephone Bill", "Miscellaneous", "Flower",
                        "Transport")
                .forEach(name -> expenseHeadRepository.save(ExpenseHead.builder().name(name).build()));
    }

    private void seedSampleExpenses() {
        saveSeed("Online Course Classes", "Online course platform expense", "5342",
                LocalDate.of(2026, 1, 8), new BigDecimal("150.00"), "Miscellaneous");
        saveSeed("The Power Center", "Electricity payment for power center", "345345",
                LocalDate.of(2026, 1, 15), new BigDecimal("200.00"), "Electricity Bill");
        saveSeed("Office Stationery", "Monthly stationery supplies", "45231",
                LocalDate.of(2026, 2, 5), new BigDecimal("200.00"), "Stationery Purchase");
        saveSeed("Telephone Payment", "School telephone bill", "78456",
                LocalDate.of(2026, 2, 12), new BigDecimal("150.00"), "Telephone Bill");
        saveSeed("Event Flowers", "Flowers for school event", "91234",
                LocalDate.of(2026, 3, 3), new BigDecimal("200.00"), "Flower");
        saveSeed("General Expense", "Miscellaneous school expense", "33102",
                LocalDate.of(2026, 3, 18), new BigDecimal("200.00"), "Miscellaneous");
    }

    private void saveSeed(String name, String description, String invoiceNumber,
                          LocalDate date, BigDecimal amount, String expenseHead) {
        Expense expense = Expense.builder()
                .name(name)
                .description(description)
                .invoiceNumber(invoiceNumber)
                .date(date)
                .amount(amount)
                .expenseHead(expenseHead)
                .build();
        expenseRepository.save(expense);
    }
}
