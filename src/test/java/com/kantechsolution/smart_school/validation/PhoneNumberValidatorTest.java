package com.kantechsolution.smart_school.validation;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PhoneNumberValidatorTest {

    @Test
    void acceptsInternationalNumbersWithCountryCode() {
        assertEquals("+12025550123",
                PhoneNumberValidator.requireInternational("+12025550123"));
        assertDoesNotThrow(() ->
                PhoneNumberValidator.requireInternational("+447911123456"));
    }

    @Test
    void rejectsNumbersWithoutCountryCodeOrWithFormattingCharacters() {
        assertThrows(IllegalArgumentException.class,
                () -> PhoneNumberValidator.requireInternational("2025550123"));
        assertThrows(IllegalArgumentException.class,
                () -> PhoneNumberValidator.requireInternational("+1 202 555 0123"));
        assertThrows(IllegalArgumentException.class,
                () -> PhoneNumberValidator.requireInternational("+1-202-555-0123"));
    }

    @Test
    void optionalNumbersMayBeBlankButOtherwiseUseInternationalFormat() {
        assertEquals("", PhoneNumberValidator.optionalInternational(""));
        assertEquals("+233501234567",
                PhoneNumberValidator.optionalInternational("+233501234567"));
        assertThrows(IllegalArgumentException.class,
                () -> PhoneNumberValidator.optionalInternational("0501234567"));
    }
}
