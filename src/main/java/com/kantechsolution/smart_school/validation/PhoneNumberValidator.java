package com.kantechsolution.smart_school.validation;

import java.util.regex.Pattern;

public final class PhoneNumberValidator {

    private static final Pattern INTERNATIONAL_PHONE = Pattern.compile("^\\+[1-9]\\d{7,14}$");
    public static final String FORMAT_MESSAGE =
            "Phone must include a country code, for example +12025550123 (8 to 15 digits)";

    private PhoneNumberValidator() {
    }

    public static String requireInternational(String value) {
        String phone = value == null ? "" : value.trim();
        if (!INTERNATIONAL_PHONE.matcher(phone).matches()) {
            throw new IllegalArgumentException(FORMAT_MESSAGE);
        }
        return phone;
    }

    public static String optionalInternational(String value) {
        if (value == null || value.isBlank()) {
            return value == null ? null : "";
        }
        return requireInternational(value);
    }
}
