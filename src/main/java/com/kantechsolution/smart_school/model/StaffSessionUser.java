package com.kantechsolution.smart_school.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight session user shown in the admin header profile dropdown.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffSessionUser {
    private String name;
    private String role;
    private String email;
}
