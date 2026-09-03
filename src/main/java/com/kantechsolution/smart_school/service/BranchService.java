package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Branch;
import com.kantechsolution.smart_school.repository.BranchRepository;
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
public class BranchService implements ApplicationRunner {

    @Autowired
    private BranchRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }

        seed("Mount Carmel School 1", "https://demo.smart-school.in/branch1/");
        seed("Mount Carmel School 2", "https://demo.smart-school.in/branch2/");
    }

    private void seed(String name, String url) {
        Branch branch = new Branch();
        branch.setName(name);
        branch.setUrl(url);
        branch.setEnvatoPurchaseCode("demo-purchase-code");
        branch.setHostname(url.replace("https://", "").replace("/", ""));
        branch.setDbUsername("root");
        branch.setDatabaseName(name.replace(" ", "_").toLowerCase());
        branch.setDbPassword("password");
        repository.save(branch);
    }

    public List<Map<String, Object>> listAll() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Branch branch : repository.findAllByOrderByIdAsc()) {
            rows.add(toMap(branch));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        Branch branch = new Branch();
        apply(branch, body);
        return toMap(repository.save(branch));
    }

    @Transactional
    public Map<String, Object> update(Long id, Map<String, Object> body) {
        Branch branch = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Branch not found"));
        apply(branch, body);
        return toMap(repository.save(branch));
    }

    @Transactional
    public void delete(Long id) {
        Branch branch = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Branch not found"));
        repository.delete(branch);
    }

    private void apply(Branch branch, Map<String, Object> body) {
        String envatoPurchaseCode = text(body.get("envatoPurchaseCode"));
        if (envatoPurchaseCode.isBlank()) {
            throw new IllegalArgumentException("Envato purchase code is required");
        }

        String hostname = text(body.get("hostname"));
        if (hostname.isBlank()) {
            throw new IllegalArgumentException("Hostname is required");
        }

        String dbUsername = text(body.get("dbUsername"));
        if (dbUsername.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }

        String databaseName = text(body.get("databaseName"));
        if (databaseName.isBlank()) {
            throw new IllegalArgumentException("Database name is required");
        }

        String dbPassword = text(body.get("dbPassword"));
        boolean isUpdate = branch.getId() != null;
        if (dbPassword.isBlank() && !isUpdate) {
            throw new IllegalArgumentException("Password is required");
        }

        branch.setEnvatoPurchaseCode(envatoPurchaseCode);
        branch.setHostname(hostname);
        branch.setDbUsername(dbUsername);
        branch.setDatabaseName(databaseName);
        if (!dbPassword.isBlank()) {
            branch.setDbPassword(dbPassword);
        }

        branch.setName(databaseName);
        branch.setUrl(buildBranchUrl(hostname));
    }

    private String buildBranchUrl(String hostname) {
        String value = hostname.trim();
        if (!value.startsWith("http://") && !value.startsWith("https://")) {
            value = "https://" + value;
        }
        if (!value.endsWith("/")) {
            value += "/";
        }
        return value;
    }

    private Map<String, Object> toMap(Branch branch) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", branch.getId());
        map.put("name", branch.getName());
        map.put("url", branch.getUrl());
        map.put("envatoPurchaseCode", branch.getEnvatoPurchaseCode());
        map.put("hostname", branch.getHostname());
        map.put("dbUsername", branch.getDbUsername());
        map.put("databaseName", branch.getDatabaseName());
        return map;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
