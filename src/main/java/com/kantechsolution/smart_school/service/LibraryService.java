package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Library;
import com.kantechsolution.smart_school.repository.LibraryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class LibraryService {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter US = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final LibraryRepository libraryRepository;

    public LibraryService(LibraryRepository libraryRepository) {
        this.libraryRepository = libraryRepository;
    }

    public List<Map<String, Object>> listBooks() {
        return libraryRepository.findAllByOrderByIdDesc().stream().map(this::toMap).toList();
    }

    @Transactional
    public Map<String, Object> createBook(Map<String, Object> payload) {
        Library book = new Library();
        applyFields(book, payload);
        return toMap(libraryRepository.save(book));
    }

    @Transactional
    public Map<String, Object> updateBook(Long id, Map<String, Object> payload) {
        Library book = libraryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        applyFields(book, payload);
        return toMap(libraryRepository.save(book));
    }

    @Transactional
    public void deleteBook(Long id) {
        if (!libraryRepository.existsById(id)) {
            throw new IllegalArgumentException("Book not found");
        }
        libraryRepository.deleteById(id);
    }

    public byte[] sampleImportCsv() {
        String csv = "\uFEFF"
                + "Book Title,Book Number,ISBN Number,Subject,Rack Number,Publisher,Author,Qty,Book Price,Post Date,Description,Available\n"
                + "Sample Data,BK-001,978-0000000000,English,R1,Sample Publisher,Sample Author,10,25.00,2018-06-06,Sample Data,10\n";
        return csv.getBytes(StandardCharsets.UTF_8);
    }

    @Transactional
    public Map<String, Object> importBooks(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select a CSV file");
        }
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        if (!filename.isBlank() && !filename.endsWith(".csv") && !filename.endsWith(".txt")) {
            throw new IllegalArgumentException("Please upload a CSV file");
        }

        String content;
        try {
            content = new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalArgumentException("Unable to read the CSV file");
        }
        if (content.startsWith("\uFEFF")) {
            content = content.substring(1);
        }
        if (content.isBlank()) {
            throw new IllegalArgumentException("The CSV file is empty");
        }

        List<List<String>> rows = parseCsv(content);
        if (rows.isEmpty()) {
            throw new IllegalArgumentException("The CSV file is empty");
        }

        List<String> headers = rows.get(0).stream().map(this::normalizeHeader).toList();
        int titleIndex = headerIndex(headers, "booktitle", "title");
        if (titleIndex < 0) {
            throw new IllegalArgumentException("CSV must include a Book Title column");
        }

        List<String> errors = new ArrayList<>();
        int imported = 0;
        for (int i = 1; i < rows.size(); i++) {
            List<String> cells = rows.get(i);
            if (isBlankRow(cells)) {
                continue;
            }
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("title", cell(cells, titleIndex));
            payload.put("bookNumber", cellByHeader(cells, headers, "booknumber", "bookno"));
            payload.put("isbn", cellByHeader(cells, headers, "isbnnumber", "isbn"));
            payload.put("subject", cellByHeader(cells, headers, "subject"));
            payload.put("rackNumber", cellByHeader(cells, headers, "racknumber", "rack"));
            payload.put("publisher", cellByHeader(cells, headers, "publisher"));
            payload.put("author", cellByHeader(cells, headers, "author"));
            payload.put("qty", cellByHeader(cells, headers, "qty", "quantity", "totalcopies"));
            payload.put("bookPrice", cellByHeader(cells, headers, "bookprice", "price"));
            payload.put("postDate", cellByHeader(cells, headers, "postdate", "date"));
            payload.put("description", cellByHeader(cells, headers, "description"));
            payload.put("available", cellByHeader(cells, headers, "available", "availablecopies"));
            try {
                createBook(payload);
                imported++;
            } catch (IllegalArgumentException e) {
                errors.add("Row " + (i + 1) + ": " + e.getMessage());
            }
        }

        if (imported == 0) {
            String firstError = errors.isEmpty() ? "No valid book rows were found in the CSV file" : errors.get(0);
            throw new IllegalArgumentException(firstError);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("imported", imported);
        result.put("skipped", errors.size());
        result.put("errors", errors);
        result.put("message", imported + (imported == 1 ? " book imported successfully!" : " books imported successfully!"));
        return result;
    }

    private void applyFields(Library book, Map<String, Object> payload) {
        String title = text(payload.get("title"));
        if (title.isBlank()) {
            throw new IllegalArgumentException("Book Title is required");
        }

        Integer qty = parseInteger(payload.get("qty"), "Qty");
        if (qty != null && qty < 0) {
            throw new IllegalArgumentException("Qty cannot be negative");
        }
        Integer available = parseInteger(payload.get("available"), "Available");
        if (available != null && available < 0) {
            throw new IllegalArgumentException("Available cannot be negative");
        }

        book.setTitle(title);
        book.setBookNumber(blankToNull(text(payload.get("bookNumber"))));
        book.setIsbn(blankToNull(text(payload.get("isbn"))));
        book.setAuthor(blankToNull(text(payload.get("author"))));
        book.setPublisher(blankToNull(text(payload.get("publisher"))));
        book.setSubject(blankToNull(text(payload.get("subject"))));
        book.setCategory(blankToNull(text(payload.get("subject"))));
        book.setRackNumber(blankToNull(text(payload.get("rackNumber"))));
        book.setDescription(blankToNull(text(payload.get("description"))));
        book.setBookPrice(parseMoney(payload.get("bookPrice")));
        book.setPostDate(parseDate(payload.get("postDate")));
        book.setTotalCopies(qty);
        if (book.getId() == null || book.getAvailableCopies() == null) {
            book.setAvailableCopies(available != null ? available : qty);
        } else if (available != null) {
            book.setAvailableCopies(available);
        }
        book.setIsActive(true);
    }

    private Map<String, Object> toMap(Library book) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", book.getId());
        map.put("title", book.getTitle());
        map.put("description", book.getDescription());
        map.put("bookNumber", book.getBookNumber());
        map.put("isbn", book.getIsbn());
        map.put("publisher", book.getPublisher());
        map.put("author", book.getAuthor());
        map.put("subject", book.getSubject());
        map.put("rackNumber", book.getRackNumber());
        map.put("qty", book.getTotalCopies());
        map.put("available", book.getAvailableCopies());
        map.put("bookPrice", book.getBookPrice());
        map.put("postDate", book.getPostDate() != null ? book.getPostDate().toString() : null);
        return map;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private Integer parseInteger(Object value, String label) {
        String raw = text(value);
        if (raw.isBlank()) {
            return null;
        }
        try {
            if (raw.contains(".")) {
                return (int) Math.round(Double.parseDouble(raw));
            }
            return Integer.parseInt(raw);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(label + " must be a number");
        }
    }

    private String normalizeHeader(String header) {
        return text(header).toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    private int headerIndex(List<String> headers, String... aliases) {
        for (int i = 0; i < headers.size(); i++) {
            String header = headers.get(i);
            for (String alias : aliases) {
                if (alias.equals(header)) {
                    return i;
                }
            }
        }
        return -1;
    }

    private String cellByHeader(List<String> cells, List<String> headers, String... aliases) {
        int index = headerIndex(headers, aliases);
        return index < 0 ? "" : cell(cells, index);
    }

    private String cell(List<String> cells, int index) {
        if (index < 0 || index >= cells.size()) {
            return "";
        }
        return text(cells.get(index));
    }

    private boolean isBlankRow(List<String> cells) {
        if (cells == null || cells.isEmpty()) {
            return true;
        }
        for (String cell : cells) {
            if (!text(cell).isBlank()) {
                return false;
            }
        }
        return true;
    }

    private List<List<String>> parseCsv(String content) {
        List<List<String>> rows = new ArrayList<>();
        List<String> currentRow = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < content.length(); i++) {
            char c = content.charAt(i);
            if (inQuotes) {
                if (c == '"') {
                    if (i + 1 < content.length() && content.charAt(i + 1) == '"') {
                        current.append('"');
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current.append(c);
                }
            } else if (c == '"') {
                inQuotes = true;
            } else if (c == ',') {
                currentRow.add(current.toString());
                current.setLength(0);
            } else if (c == '\n') {
                currentRow.add(current.toString());
                current.setLength(0);
                rows.add(currentRow);
                currentRow = new ArrayList<>();
            } else if (c != '\r') {
                current.append(c);
            }
        }
        if (inQuotes || !current.isEmpty() || !currentRow.isEmpty()) {
            currentRow.add(current.toString());
            rows.add(currentRow);
        }
        return rows;
    }

    private BigDecimal parseMoney(Object value) {
        String raw = text(value);
        if (raw.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(raw);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Book Price must be a number");
        }
    }

    private LocalDate parseDate(Object value) {
        String raw = text(value);
        if (raw.isBlank()) {
            return LocalDate.now();
        }
        try {
            if (raw.contains("-")) {
                return LocalDate.parse(raw, ISO);
            }
            return LocalDate.parse(raw, US);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Post Date must be a valid date");
        }
    }
}
