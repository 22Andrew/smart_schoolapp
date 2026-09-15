(function () {
    'use strict';

    const INTERNATIONAL_PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
    const PHONE_SELECTOR = [
        'input[type="tel"]',
        'input#phone',
        'input#phoneNumber',
        'input#fromNumber',
        'input#supplierPhone',
        'input#contactPersonPhone',
        'input#driverContact',
        'input#alumniPhone',
        'input#frontSiteMobileNo',
        'input#adminPanelMobileNo',
        'input#studentGuardianPanelMobileNo'
    ].join(',');
    const VALIDATION_MESSAGE =
        'Enter a telephone number with country code, for example +12025550123 (8 to 15 digits).';

    function sanitize(value) {
        const trimmed = String(value || '').trim();
        const hasLeadingPlus = trimmed.startsWith('+');
        const digits = trimmed.replace(/\D/g, '').slice(0, 15);
        return (hasLeadingPlus ? '+' : '') + digits;
    }

    function updateValidity(input) {
        const value = input.value.trim();
        input.setCustomValidity(
            value && !INTERNATIONAL_PHONE_PATTERN.test(value) ? VALIDATION_MESSAGE : ''
        );
    }

    function bindPhoneInput(input) {
        if (input.dataset.phoneValidationBound === 'true') {
            return;
        }
        input.dataset.phoneValidationBound = 'true';
        input.type = 'tel';
        input.inputMode = 'tel';
        input.maxLength = 16;
        input.pattern = '\\+[1-9][0-9]{7,14}';
        input.title = VALIDATION_MESSAGE;
        if (!input.placeholder) {
            input.placeholder = '+12025550123';
        }

        input.addEventListener('input', function () {
            const sanitized = sanitize(input.value);
            if (input.value !== sanitized) {
                input.value = sanitized;
            }
            updateValidity(input);
        });
        input.addEventListener('blur', function () {
            updateValidity(input);
            if (!input.checkValidity()) {
                input.reportValidity();
            }
        });
        updateValidity(input);
    }

    function initializePhoneValidation(root) {
        (root || document).querySelectorAll(PHONE_SELECTOR).forEach(bindPhoneInput);
    }

    window.PhoneNumberValidation = {
        initialize: initializePhoneValidation,
        isValid: function (value) {
            return INTERNATIONAL_PHONE_PATTERN.test(String(value || '').trim());
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initializePhoneValidation(document);
        });
    } else {
        initializePhoneValidation(document);
    }
})();
