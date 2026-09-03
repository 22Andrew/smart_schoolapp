package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.MultiBranchReportEntry;
import com.kantechsolution.smart_school.repository.MultiBranchReportEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MultiBranchReportService implements ApplicationRunner {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DISPLAY = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final LocalDate SAMPLE_DATE = LocalDate.of(2026, 3, 8);

    @Autowired
    private MultiBranchReportEntryRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        seedAllReports();
    }

    public List<Map<String, Object>> summary(String reportType, String dateFrom, String dateTo) {
        String type = normalizeType(reportType);
        LocalDate from = parseDate(dateFrom, LocalDate.of(2026, 3, 8));
        LocalDate to = parseDate(dateTo, LocalDate.of(2026, 8, 23));
        if (to.isBefore(from)) {
            LocalDate temp = from;
            from = to;
            to = temp;
        }

        Map<LocalDate, double[]> aggregates = loadAggregates(type, from, to);

        List<Map<String, Object>> rows = new ArrayList<>();
        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", date.format(ISO));
            row.put("displayDate", date.format(DISPLAY));

            double[] values = aggregates.getOrDefault(date, new double[] {0.0, 0.0});
            row.put("totalTransactions", (long) values[0]);
            row.put("amount", values[1]);
            rows.add(row);
        }
        return rows;
    }

    public Map<String, Object> details(String reportType, String date) {
        String type = normalizeType(reportType);
        LocalDate reportDate = parseDate(date, SAMPLE_DATE);
        List<MultiBranchReportEntry> entries = repository.findByReportTypeAndReportDateOrderByIdAsc(type, reportDate);

        List<Map<String, Object>> transactions = new ArrayList<>();
        double grandTotal = 0.0;
        for (MultiBranchReportEntry entry : entries) {
            transactions.add(toMap(entry, type));
            grandTotal += entry.getTotal();
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("reportType", type);
        result.put("reportDate", reportDate.format(DISPLAY));
        result.put("transactions", transactions);
        result.put("grandTotal", grandTotal);
        return result;
    }

    public List<Map<String, Object>> dailyCollectionSummary(String dateFrom, String dateTo) {
        return summary("daily-collection", dateFrom, dateTo);
    }

    public Map<String, Object> dailyCollectionDetails(String date) {
        return details("daily-collection", date);
    }

    private Map<LocalDate, double[]> loadAggregates(String reportType, LocalDate from, LocalDate to) {
        Map<LocalDate, double[]> aggregates = new HashMap<>();
        for (Object[] row : repository.aggregateByReportTypeAndDateRange(reportType, from, to)) {
            LocalDate date = (LocalDate) row[0];
            double count = row[1] instanceof Number number ? number.doubleValue() : 0.0;
            double amount = row[2] instanceof Number number ? number.doubleValue() : 0.0;
            aggregates.put(date, new double[] {count, amount});
        }
        return aggregates;
    }

    private Map<String, Object> toMap(MultiBranchReportEntry entry, String reportType) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("branch", entry.getBranch());
        row.put("referenceNo", entry.getReferenceNo());
        row.put("name", entry.getName());
        row.put("detail", entry.getDetail());
        row.put("category", entry.getCategory());
        row.put("paymentMode", entry.getPaymentMode());
        row.put("paymentId", entry.getPaymentId());
        row.put("handledBy", entry.getHandledBy());
        row.put("adjustment", entry.getAdjustment() == null ? 0.0 : entry.getAdjustment());
        row.put("amount", entry.getAmount() == null ? 0.0 : entry.getAmount());
        row.put("total", entry.getTotal());

        if ("user-log".equals(reportType)) {
            row.put("userId", entry.getUserId());
            row.put("role", entry.getRole());
            row.put("loginTime", entry.getLoginTime());
            row.put("logoutTime", entry.getLogoutTime());
            row.put("ipAddress", entry.getIpAddress());
            row.put("browser", entry.getBrowser());
            row.put("action", entry.getAction());
        }
        return row;
    }

    private String normalizeType(String reportType) {
        if (reportType == null || reportType.isBlank()) {
            return "daily-collection";
        }
        return reportType.trim().toLowerCase().replace('_', '-');
    }

    private LocalDate parseDate(String value, LocalDate fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        String text = value.trim();
        try {
            if (text.contains("/")) {
                return LocalDate.parse(text, DISPLAY);
            }
            return LocalDate.parse(text, ISO);
        } catch (DateTimeParseException ex) {
            return fallback;
        }
    }

    private void seedAllReports() {
        seedCollectionEntries();
        seedPayrollEntries();
        seedIncomeEntries();
        seedExpenseEntries();
        seedUserLogEntries();
    }

    private void seedCollectionEntries() {
        Object[][] samples = {
                {"Home Branch", "1800011", "Edward Thomas", "Thomas", "Grade 1 (A)", "Cash", "101", "Joe Black(9000)", 0.0, 500.0},
                {"Home Branch", "1800012", "Sarah Johnson", "Johnson", "Grade 2 (B)", "Cash", "102", "Joe Black(9000)", 0.0, 750.0},
                {"Home Branch", "1800013", "Michael Brown", "Brown", "Grade 3 (A)", "Cheque", "103", "Joe Black(9000)", 25.0, 1000.0},
                {"Home Branch", "1800014", "Emily Davis", "Davis", "Grade 4 (C)", "Cash", "104", "Joe Black(9000)", 0.0, 850.0},
                {"Home Branch", "1800015", "Daniel Wilson", "Wilson", "Grade 5 (B)", "Online", "105", "Joe Black(9000)", 0.0, 1200.0},
                {"Mount Carmel School 1", "1800016", "Olivia Martinez", "Martinez", "Grade 1 (B)", "Cash", "106", "Joe Black(9000)", 0.0, 600.0},
                {"Mount Carmel School 1", "1800017", "James Anderson", "Anderson", "Grade 2 (A)", "Cash", "107", "Joe Black(9000)", 0.0, 900.0},
                {"Mount Carmel School 1", "1800018", "Sophia Taylor", "Taylor", "Grade 3 (C)", "Cheque", "108", "Joe Black(9000)", 15.0, 1100.0},
                {"Mount Carmel School 2", "1800019", "William Thomas", "Thomas", "Grade 4 (A)", "Cash", "109", "Joe Black(9000)", 0.0, 950.0},
                {"Mount Carmel School 2", "1800020", "Ava Jackson", "Jackson", "Grade 5 (A)", "Online", "110", "Joe Black(9000)", 0.0, 1300.0},
                {"Home Branch", "1800021", "Ethan White", "White", "Grade 6 (B)", "Cash", "111", "Joe Black(9000)", 0.0, 700.0},
                {"Home Branch", "1800022", "Isabella Harris", "Harris", "Grade 7 (A)", "Cash", "112", "Joe Black(9000)", 0.0, 800.0},
                {"Mount Carmel School 1", "1800023", "Mason Clark", "Clark", "Grade 8 (C)", "Cheque", "113", "Joe Black(9000)", 10.0, 1050.0},
                {"Mount Carmel School 2", "1800024", "Mia Lewis", "Lewis", "Grade 9 (B)", "Cash", "114", "Joe Black(9000)", 0.0, 1150.0},
                {"Home Branch", "1800025", "Lucas Walker", "Walker", "Grade 10 (A)", "Online", "115", "Joe Black(9000)", 0.0, 1400.0},
                {"Home Branch", "1800026", "Charlotte Hall", "Hall", "Grade 11 (B)", "Cash", "116", "Joe Black(9000)", 0.0, 645.0},
                {"Mount Carmel School 1", "1800027", "Benjamin Allen", "Allen", "Grade 12 (A)", "Cash", "117", "Joe Black(9000)", 0.0, 1250.0}
        };
        for (Object[] sample : samples) {
            saveMoneyEntry("daily-collection", SAMPLE_DATE, sample);
        }
    }

    private void seedPayrollEntries() {
        Object[][] samples = {
                {"Home Branch", "STF1001", "Joe Black", "Accountant", "Bank Transfer", "PAY201", "Admin(9000)", 50.0, 2500.0},
                {"Home Branch", "STF1002", "Mary Smith", "Teacher", "Cash", "PAY202", "Admin(9000)", 0.0, 1800.0},
                {"Mount Carmel School 1", "STF1003", "John Carter", "Principal", "Cheque", "PAY203", "Admin(9000)", 100.0, 3200.0},
                {"Mount Carmel School 1", "STF1004", "Lisa Wong", "Librarian", "Bank Transfer", "PAY204", "Admin(9000)", 0.0, 1600.0},
                {"Mount Carmel School 2", "STF1005", "Robert Lee", "Teacher", "Cash", "PAY205", "Admin(9000)", 25.0, 1750.0}
        };
        for (Object[] sample : samples) {
            saveMoneyEntry("payroll", SAMPLE_DATE, sample);
        }
    }

    private void seedIncomeEntries() {
        Object[][] samples = {
                {"Home Branch", "INC001", "Donation", "General Fund", "Cash", "IN101", "Joe Black(9000)", 0.0, 2000.0},
                {"Home Branch", "INC002", "Book Sale", "Library", "Online", "IN102", "Joe Black(9000)", 0.0, 850.0},
                {"Mount Carmel School 1", "INC003", "Event Fee", "Annual Day", "Cheque", "IN103", "Joe Black(9000)", 0.0, 1500.0},
                {"Mount Carmel School 2", "INC004", "Transport Fee", "Transport", "Cash", "IN104", "Joe Black(9000)", 0.0, 1200.0}
        };
        for (Object[] sample : samples) {
            saveMoneyEntry("income", SAMPLE_DATE, sample);
        }
    }

    private void seedExpenseEntries() {
        Object[][] samples = {
                {"Home Branch", "EXP001", "Electricity Bill", "Utilities", "Cash", "EX101", "Joe Black(9000)", 0.0, 450.0},
                {"Home Branch", "EXP002", "Stationery", "Office", "Cheque", "EX102", "Joe Black(9000)", 0.0, 320.0},
                {"Mount Carmel School 1", "EXP003", "Maintenance", "Building", "Bank Transfer", "EX103", "Joe Black(9000)", 0.0, 980.0},
                {"Mount Carmel School 1", "EXP004", "Internet Bill", "Utilities", "Online", "EX104", "Joe Black(9000)", 0.0, 210.0},
                {"Mount Carmel School 2", "EXP005", "Transport Fuel", "Transport", "Cash", "EX105", "Joe Black(9000)", 0.0, 540.0},
                {"Mount Carmel School 2", "EXP006", "Cleaning Service", "Services", "Cash", "EX106", "Joe Black(9000)", 0.0, 275.0}
        };
        for (Object[] sample : samples) {
            saveMoneyEntry("expense", SAMPLE_DATE, sample);
        }
    }

    private void seedUserLogEntries() {
        Object[][] samples = {
                {"Home Branch", "USR9000", "Joe Black", "Super Admin", "08:15 AM", "06:30 PM", "192.168.1.10", "Chrome", "Login"},
                {"Home Branch", "USR9001", "Mary Smith", "Accountant", "08:45 AM", "05:15 PM", "192.168.1.11", "Firefox", "Login"},
                {"Mount Carmel School 1", "USR9002", "John Carter", "Admin", "09:00 AM", "05:45 PM", "192.168.2.20", "Chrome", "Login"},
                {"Mount Carmel School 1", "USR9003", "Lisa Wong", "Teacher", "07:55 AM", "04:30 PM", "192.168.2.21", "Edge", "Login"},
                {"Mount Carmel School 2", "USR9004", "Robert Lee", "Teacher", "08:10 AM", "04:50 PM", "192.168.3.30", "Chrome", "Login"},
                {"Home Branch", "USR9005", "Emily Davis", "Receptionist", "08:30 AM", "05:00 PM", "192.168.1.12", "Safari", "Login"},
                {"Mount Carmel School 1", "USR9006", "James Anderson", "Teacher", "08:05 AM", "04:40 PM", "192.168.2.22", "Chrome", "Login"},
                {"Mount Carmel School 2", "USR9007", "Sophia Taylor", "Librarian", "08:20 AM", "05:10 PM", "192.168.3.31", "Firefox", "Login"},
                {"Home Branch", "USR9008", "Daniel Wilson", "Admin", "09:15 AM", "06:00 PM", "192.168.1.13", "Chrome", "Login"},
                {"Mount Carmel School 2", "USR9009", "Olivia Martinez", "Teacher", "07:50 AM", "04:20 PM", "192.168.3.32", "Edge", "Login"}
        };
        for (Object[] sample : samples) {
            MultiBranchReportEntry entry = new MultiBranchReportEntry();
            entry.setReportType("user-log");
            entry.setReportDate(SAMPLE_DATE);
            entry.setBranch(String.valueOf(sample[0]));
            entry.setUserId(String.valueOf(sample[1]));
            entry.setName(String.valueOf(sample[2]));
            entry.setRole(String.valueOf(sample[3]));
            entry.setLoginTime(String.valueOf(sample[4]));
            entry.setLogoutTime(String.valueOf(sample[5]));
            entry.setIpAddress(String.valueOf(sample[6]));
            entry.setBrowser(String.valueOf(sample[7]));
            entry.setAction(String.valueOf(sample[8]));
            entry.setAdjustment(0.0);
            entry.setAmount(0.0);
            repository.save(entry);
        }
    }

    private void saveMoneyEntry(String reportType, LocalDate reportDate, Object[] sample) {
        MultiBranchReportEntry entry = new MultiBranchReportEntry();
        entry.setReportType(reportType);
        entry.setReportDate(reportDate);
        entry.setBranch(String.valueOf(sample[0]));
        entry.setReferenceNo(String.valueOf(sample[1]));
        entry.setName(String.valueOf(sample[2]));
        entry.setDetail(String.valueOf(sample[3]));

        if ("daily-collection".equals(reportType)) {
            entry.setCategory(String.valueOf(sample[4]));
            entry.setPaymentMode(String.valueOf(sample[5]));
            entry.setPaymentId(String.valueOf(sample[6]));
            entry.setHandledBy(String.valueOf(sample[7]));
            entry.setAdjustment(toDouble(sample[8]));
            entry.setAmount(toDouble(sample[9]));
        } else {
            entry.setCategory(String.valueOf(sample[4]));
            entry.setPaymentMode(String.valueOf(sample[4]));
            entry.setPaymentId(String.valueOf(sample[5]));
            entry.setHandledBy(String.valueOf(sample[6]));
            entry.setAdjustment(toDouble(sample[7]));
            entry.setAmount(toDouble(sample[8]));
        }

        repository.save(entry);
    }

    private double toDouble(Object value) {
        if (value == null) {
            return 0.0;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (NumberFormatException ex) {
            return 0.0;
        }
    }
}
