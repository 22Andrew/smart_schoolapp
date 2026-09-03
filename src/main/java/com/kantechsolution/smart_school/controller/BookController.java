package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.LibraryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class BookController {

    private final LibraryService libraryService;

    public BookController(LibraryService libraryService) {
        this.libraryService = libraryService;
    }

    @GetMapping("/dailyassignment/admin/book/getall")
    public String showBookListPage() {
        return "book-list";
    }

    @GetMapping("/api/books")
    @ResponseBody
    public ResponseEntity<?> listBooks() {
        try {
            return ResponseEntity.ok(libraryService.listBooks());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load books"));
        }
    }

    @PostMapping("/api/books")
    @ResponseBody
    public ResponseEntity<?> createBook(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = libraryService.createBook(payload);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Book saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save book"));
        }
    }

    @PutMapping("/api/books/{id}")
    @ResponseBody
    public ResponseEntity<?> updateBook(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = libraryService.updateBook(id, payload);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Book updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update book"));
        }
    }

    @DeleteMapping("/api/books/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        try {
            libraryService.deleteBook(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Book deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete book"));
        }
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return body;
    }
}
