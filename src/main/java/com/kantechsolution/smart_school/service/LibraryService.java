package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Library;
import com.kantechsolution.smart_school.repository.LibraryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.List;
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

    private void applyFields(Library book, Map<String, Object> payload) {
        String title = text(payload.get("title"));
        if (title.isBlank()) {
            throw new IllegalArgumentException("Book Title is required");
        }

        Integer qty = parseInteger(payload.get("qty"), "Qty");
        if (qty != null && qty < 0) {
            throw new IllegalArgumentException("Qty cannot be negative");
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
            book.setAvailableCopies(qty);
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
            return Integer.parseInt(raw);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(label + " must be a number");
        }
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
