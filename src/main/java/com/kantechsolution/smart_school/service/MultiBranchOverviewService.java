package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.MultiBranchOverview;
import com.kantechsolution.smart_school.repository.MultiBranchOverviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MultiBranchOverviewService implements ApplicationRunner {

    @Autowired
    private MultiBranchOverviewRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        seedOverviewData();
    }

    public Map<String, Object> getOverviewData() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("feesDetails", mapSection("fees"));
        data.put("transportFeesDetails", mapSection("transport-fees"));
        data.put("studentAdmission", mapSection("student-admission"));
        data.put("libraryDetails", mapSection("library"));
        return data;
    }

    private List<Map<String, Object>> mapSection(String sectionType) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (MultiBranchOverview item : repository.findBySectionTypeOrderByDisplayOrderAscIdAsc(sectionType)) {
            rows.add(toMap(item));
        }
        return rows;
    }

    private Map<String, Object> toMap(MultiBranchOverview item) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("branch", item.getBranchName());
        row.put("currentSession", item.getCurrentSession());
        row.put("totalStudents", item.getTotalStudents());
        row.put("totalFees", item.getTotalFees());
        row.put("totalPaidFees", item.getTotalPaidFees());
        row.put("totalBalanceFees", item.getTotalBalanceFees());
        row.put("offlineAdmission", item.getOfflineAdmission());
        row.put("onlineAdmission", item.getOnlineAdmission());
        row.put("totalBooks", item.getTotalBooks());
        row.put("members", item.getMembers());
        row.put("booksIssued", item.getBooksIssued());
        return row;
    }

    private void seedOverviewData() {
        seedFees();
        seedTransportFees();
        seedStudentAdmission();
        seedLibrary();
    }

    private void seedFees() {
        saveFees("fees", "Home Branch", "2026-27", 89, 8984485.71, 45280.00, 8939205.71, 1);
        saveFees("fees", "Mount Carmel School 1", "2026-27", 4, 1000.00, 900.00, 100.00, 2);
        saveFees("fees", "Mount Carmel School 2", "2026-27", 6, 24000.00, 5775.00, 18225.00, 3);
    }

    private void seedTransportFees() {
        saveTransport("transport-fees", "Home Branch", "2026-27", 62600.00, 8845.00, 53755.00, 1);
        saveTransport("transport-fees", "Mount Carmel School 1", "2026-27", 13750.00, 3100.00, 10650.00, 2);
        saveTransport("transport-fees", "Mount Carmel School 2", "2026-27", 29950.00, 1600.00, 28350.00, 3);
    }

    private void seedStudentAdmission() {
        saveAdmission("student-admission", "Home Branch", "2026-27", 7, 0, 1);
        saveAdmission("student-admission", "Mount Carmel School 1", "2026-27", 2, 0, 2);
        saveAdmission("student-admission", "Mount Carmel School 2", "2026-27", 2, 0, 3);
    }

    private void seedLibrary() {
        saveLibrary("library", "Home Branch", 29, 58, 216, 1);
        saveLibrary("library", "Mount Carmel School 1", 12, 16, 40, 2);
        saveLibrary("library", "Mount Carmel School 2", 11, 16, 40, 3);
    }

    private void saveFees(String sectionType, String branch, String session, int students,
                          double totalFees, double paidFees, double balanceFees, int order) {
        MultiBranchOverview item = new MultiBranchOverview();
        item.setSectionType(sectionType);
        item.setBranchName(branch);
        item.setCurrentSession(session);
        item.setTotalStudents(students);
        item.setTotalFees(totalFees);
        item.setTotalPaidFees(paidFees);
        item.setTotalBalanceFees(balanceFees);
        item.setDisplayOrder(order);
        repository.save(item);
    }

    private void saveTransport(String sectionType, String branch, String session,
                               double totalFees, double paidFees, double balanceFees, int order) {
        MultiBranchOverview item = new MultiBranchOverview();
        item.setSectionType(sectionType);
        item.setBranchName(branch);
        item.setCurrentSession(session);
        item.setTotalFees(totalFees);
        item.setTotalPaidFees(paidFees);
        item.setTotalBalanceFees(balanceFees);
        item.setDisplayOrder(order);
        repository.save(item);
    }

    private void saveAdmission(String sectionType, String branch, String session,
                               int offline, int online, int order) {
        MultiBranchOverview item = new MultiBranchOverview();
        item.setSectionType(sectionType);
        item.setBranchName(branch);
        item.setCurrentSession(session);
        item.setOfflineAdmission(offline);
        item.setOnlineAdmission(online);
        item.setDisplayOrder(order);
        repository.save(item);
    }

    private void saveLibrary(String sectionType, String branch, int books, int members, int issued, int order) {
        MultiBranchOverview item = new MultiBranchOverview();
        item.setSectionType(sectionType);
        item.setBranchName(branch);
        item.setTotalBooks(books);
        item.setMembers(members);
        item.setBooksIssued(issued);
        item.setDisplayOrder(order);
        repository.save(item);
    }
}
