package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Library;
import com.kantechsolution.smart_school.model.LibraryBookIssue;
import com.kantechsolution.smart_school.model.LibraryMember;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.LibraryBookIssueRepository;
import com.kantechsolution.smart_school.repository.LibraryMemberRepository;
import com.kantechsolution.smart_school.repository.LibraryRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class UserPanelLibraryService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy", Locale.US);

    private final LibraryRepository libraryRepository;
    private final LibraryMemberRepository memberRepository;
    private final LibraryBookIssueRepository issueRepository;
    private final UserPanelContextService contextService;

    public UserPanelLibraryService(LibraryRepository libraryRepository,
                                   LibraryMemberRepository memberRepository,
                                   LibraryBookIssueRepository issueRepository,
                                   UserPanelContextService contextService) {
        this.libraryRepository = libraryRepository;
        this.memberRepository = memberRepository;
        this.issueRepository = issueRepository;
        this.contextService = contextService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listBooks(Authentication authentication) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Library book : libraryRepository.findAllByOrderByIdDesc()) {
            if (Boolean.FALSE.equals(book.getIsActive())) {
                continue;
            }
            rows.add(toRow(book));
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("rows", rows);
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listBookIssues(Authentication authentication) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        if (student == null || student.getId() == null) {
            throw new IllegalArgumentException("Student profile not found");
        }

        Optional<LibraryMember> memberOpt = memberRepository.findByStudentAdmission_Id(student.getId());
        if (memberOpt.isEmpty()) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("rows", List.of());
            return response;
        }

        LibraryMember member = memberOpt.get();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (LibraryBookIssue issue : issueRepository.findIssuedWithBook(member.getId())) {
            if (Boolean.FALSE.equals(issue.getIsActive())) {
                continue;
            }
            rows.add(toIssueRow(issue));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("rows", rows);
        return response;
    }

    private LibraryMember ensureStudentMember(StudentAdmission student) {
        Optional<LibraryMember> existing = memberRepository.findByStudentAdmission_Id(student.getId());
        if (existing.isPresent()) {
            LibraryMember member = existing.get();
            if (member.getIsActive() == null) {
                member.setIsActive(true);
                memberRepository.save(member);
            }
            return member;
        }

        String cardNo = text(student.getAdmissionNo());
        if (cardNo.isBlank()) {
            cardNo = "LIB" + student.getId();
        }

        LibraryMember member = LibraryMember.builder()
                .libraryCardNo(cardNo)
                .memberType("Student")
                .studentAdmission(student)
                .build();
        member.setIsActive(true);
        return memberRepository.save(member);
    }

    private void ensureDemoIssues(LibraryMember member) {
        if (!issueRepository.findByMember_IdOrderByIdDesc(member.getId()).isEmpty()) {
            return;
        }

        seedIssue(member, "Physical and Chemical Changes", "42355", "Arun Gyal",
                LocalDate.of(2026, 6, 2), LocalDate.of(2026, 6, 2), null);
        seedIssue(member, "Building With Bricks", "DA23111", "David Wood",
                LocalDate.of(2026, 6, 2), LocalDate.of(2026, 6, 2), null);
        seedIssue(member, "Human-environment interactions", "56328", "Lokesh Mishra",
                LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 1), LocalDate.of(2026, 7, 3));
        seedIssue(member, "Mathematics for Class 1", "M11001", "Hunny",
                LocalDate.of(2026, 5, 12), LocalDate.of(2026, 5, 19), LocalDate.of(2026, 5, 18));
        seedIssue(member, "English Grammar Basics", "E21002", "R.K. Sharma",
                LocalDate.of(2026, 5, 10), LocalDate.of(2026, 5, 17), null);
        seedIssue(member, "हिंदी व्याकरण", "H23003", "Yogesh",
                LocalDate.of(2026, 4, 20), LocalDate.of(2026, 4, 27), LocalDate.of(2026, 4, 26));
        seedIssue(member, "World Around Us", "S21204", "David Wilson",
                LocalDate.of(2026, 4, 15), LocalDate.of(2026, 4, 22), null);
        seedIssue(member, "Computer Basics", "C40105", "Michael Chen",
                LocalDate.of(2026, 3, 28), LocalDate.of(2026, 4, 4), LocalDate.of(2026, 4, 3));
        seedIssue(member, "गणित की कहानियाँ", "H23006", "Priya Singh",
                LocalDate.of(2026, 3, 10), LocalDate.of(2026, 3, 17), null);
        seedIssue(member, "Physical and Chemical Changes", "42356", "Arun Gyal",
                LocalDate.of(2026, 2, 25), LocalDate.of(2026, 3, 4), LocalDate.of(2026, 3, 3));
        seedIssue(member, "Building With Bricks", "DA23112", "David Wood",
                LocalDate.of(2026, 2, 18), LocalDate.of(2026, 2, 25), null);
        seedIssue(member, "English Grammar Basics", "E21007", "R.K. Sharma",
                LocalDate.of(2026, 1, 30), LocalDate.of(2026, 2, 6), LocalDate.of(2026, 2, 5));
        seedIssue(member, "Mathematics for Class 1", "M11008", "Hunny",
                LocalDate.of(2026, 1, 15), LocalDate.of(2026, 1, 22), null);
        seedIssue(member, "World Around Us", "S21209", "David Wilson",
                LocalDate.of(2026, 1, 8), LocalDate.of(2026, 1, 15), LocalDate.of(2026, 1, 14));
    }

    private void seedIssue(LibraryMember member, String title, String bookNumber, String author,
                           LocalDate issueDate, LocalDate dueDate, LocalDate returnDate) {
        Library book = findOrCreateBook(title, bookNumber, author);
        LibraryBookIssue issue = LibraryBookIssue.builder()
                .book(book)
                .member(member)
                .issueDate(issueDate)
                .dueDate(dueDate)
                .returnDate(returnDate)
                .build();
        issue.setIsActive(true);
        issueRepository.save(issue);
    }

    private Library findOrCreateBook(String title, String bookNumber, String author) {
        for (Library book : libraryRepository.findAllByOrderByIdDesc()) {
            if (title.equalsIgnoreCase(text(book.getTitle()))
                    && bookNumber.equalsIgnoreCase(text(book.getBookNumber()))) {
                if (text(book.getAuthor()).isBlank() && !author.isBlank()) {
                    book.setAuthor(author);
                    libraryRepository.save(book);
                }
                return book;
            }
        }

        for (Library book : libraryRepository.findAllByOrderByIdDesc()) {
            if (title.equalsIgnoreCase(text(book.getTitle()))) {
                if (text(book.getBookNumber()).isBlank()) {
                    book.setBookNumber(bookNumber);
                }
                if (text(book.getAuthor()).isBlank()) {
                    book.setAuthor(author);
                }
                return libraryRepository.save(book);
            }
        }

        Library book = Library.builder()
                .title(title)
                .bookNumber(bookNumber)
                .author(author)
                .publisher("NCERT")
                .subject("General")
                .totalCopies(10)
                .availableCopies(5)
                .bookPrice(new BigDecimal("100.00"))
                .postDate(LocalDate.now())
                .build();
        book.setIsActive(true);
        return libraryRepository.save(book);
    }

    private Map<String, Object> toIssueRow(LibraryBookIssue issue) {
        Library book = issue.getBook();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", issue.getId());
        row.put("bookTitle", book != null ? text(book.getTitle()) : "");
        row.put("bookNumber", book != null ? text(book.getBookNumber()) : "");
        row.put("author", book != null ? text(book.getAuthor()) : "");
        row.put("issueDate", formatDate(issue.getIssueDate()));
        row.put("dueReturnDate", formatDate(issue.getDueDate()));
        row.put("returnDate", formatDate(issue.getReturnDate()));
        row.put("issueDateIso", issue.getIssueDate() != null ? issue.getIssueDate().toString() : "");
        row.put("dueReturnDateIso", issue.getDueDate() != null ? issue.getDueDate().toString() : "");
        row.put("returnDateIso", issue.getReturnDate() != null ? issue.getReturnDate().toString() : "");
        row.put("returned", issue.getReturnDate() != null);
        return row;
    }

    private String formatDate(LocalDate date) {
        return date == null ? "" : US_DATE.format(date);
    }

    private void ensureDemoBooks() {
        if (libraryRepository.count() > 0) {
            return;
        }
        saveBook("हिंदी व्याकरण", "NCERT", "Yogesh", "Hindi", "987", 20,
                new BigDecimal("100.00"), LocalDate.of(2026, 4, 30));
        saveBook("Mathematics for Class 1", "Oxford Publications", "Hunny", "Maths", "23", 0,
                new BigDecimal("299.00"), LocalDate.of(2026, 4, 30));
        saveBook("English Grammar Basics", "S.K. Publisher", "R.K. Sharma", "English", "234", 100,
                new BigDecimal("150.00"), LocalDate.of(2026, 4, 30));
        saveBook("Physical and Chemical Changes", "NCERT", "NCERT", "Science", "101", 25,
                new BigDecimal("120.00"), LocalDate.of(2026, 3, 15));
        saveBook("Building With Bricks", "NCERT", "NCERT", "Mathematics", "102", 18,
                new BigDecimal("95.00"), LocalDate.of(2026, 3, 15));
        saveBook("गणित की कहानियाँ", "NCERT", "Priya Singh", "Hindi", "45", 12,
                new BigDecimal("85.00"), LocalDate.of(2026, 2, 10));
        saveBook("World Around Us", "Oxford Publications", "David Wilson", "Social Studies", "56", 30,
                new BigDecimal("175.00"), LocalDate.of(2026, 2, 10));
        saveBook("Computer Basics", "S.K. Publisher", "Michael Chen", "Computer", "78", 8,
                new BigDecimal("220.00"), LocalDate.of(2026, 1, 20));
    }

    private void saveBook(String title, String publisher, String author, String subject,
                          String rackNumber, int qty, BigDecimal price, LocalDate postDate) {
        Library book = Library.builder()
                .title(title)
                .publisher(publisher)
                .author(author)
                .subject(subject)
                .rackNumber(rackNumber)
                .totalCopies(qty)
                .availableCopies(qty)
                .bookPrice(price)
                .postDate(postDate)
                .build();
        book.setIsActive(true);
        libraryRepository.save(book);
    }

    private Map<String, Object> toRow(Library book) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", book.getId());
        row.put("bookTitle", text(book.getTitle()));
        row.put("publisher", text(book.getPublisher()));
        row.put("author", text(book.getAuthor()));
        row.put("subject", text(book.getSubject()));
        row.put("rackNumber", text(book.getRackNumber()));
        row.put("qty", book.getTotalCopies() != null ? book.getTotalCopies() : 0);
        row.put("bookPrice", book.getBookPrice());
        row.put("bookPriceDisplay", formatPrice(book.getBookPrice()));
        row.put("postDate", book.getPostDate() != null ? US_DATE.format(book.getPostDate()) : "");
        row.put("postDateIso", book.getPostDate() != null ? book.getPostDate().toString() : "");
        return row;
    }

    private String formatPrice(BigDecimal price) {
        if (price == null) {
            return "";
        }
        return "$" + price.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString();
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }
}
