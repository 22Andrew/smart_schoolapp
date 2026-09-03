package com.kantechsolution.smart_school.student;

import com.kantechsolution.smart_school.model.StudentCategory;
import com.kantechsolution.smart_school.repository.StudentCategoryRepository;
import com.kantechsolution.smart_school.service.StudentCategoryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentCategoryServiceTest {

    @Mock
    private StudentCategoryRepository categoryRepository;

    @InjectMocks
    private StudentCategoryService studentCategoryService;

    @Test
    void getAllCategoriesReturnsRepositoryResults() {
        StudentCategory general = new StudentCategory("General");
        general.setId(1L);
        when(categoryRepository.findAllByOrderByIdAsc()).thenReturn(List.of(general));

        List<StudentCategory> categories = studentCategoryService.getAllCategories();

        assertEquals(1, categories.size());
        assertEquals("General", categories.get(0).getCategoryName());
    }

    @Test
    void createCategoryRequiresName() {
        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> studentCategoryService.createCategory("  "));

        assertEquals("Category name is required", error.getMessage());
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void createCategoryRejectsDuplicates() {
        when(categoryRepository.existsByCategoryNameIgnoreCase("General")).thenReturn(true);

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> studentCategoryService.createCategory("General"));

        assertEquals("Category already exists", error.getMessage());
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void updateCategoryRequiresExistingRecord() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> studentCategoryService.updateCategory(99L, "Updated"));

        assertEquals("Category not found", error.getMessage());
    }

    @Test
    void deleteCategoryRequiresExistingRecord() {
        when(categoryRepository.existsById(5L)).thenReturn(false);

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> studentCategoryService.deleteCategory(5L));

        assertEquals("Category not found", error.getMessage());
        verify(categoryRepository, never()).deleteById(5L);
    }
}
