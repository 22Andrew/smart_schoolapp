document.addEventListener('DOMContentLoaded', function() {
    setupForm();
    loadSettings();
});

function setupForm() {
    document.getElementById('generalSettingForm')?.addEventListener('submit', handleSave);
}

async function loadSettings() {
    try {
        const [optionsRes, settingsRes] = await Promise.all([
            fetch('/api/schsettings/form-options'),
            fetch('/api/schsettings/general')
        ]);

        if (!optionsRes.ok || !settingsRes.ok) {
            throw new Error('Failed to load general settings');
        }

        const options = await optionsRes.json();
        const settings = await settingsRes.json();

        populateSelect('session', options.sessions, settings.session);
        populateSelect('sessionStartMonth', options.sessionStartMonths, settings.sessionStartMonth);
        populateSelect('dateFormat', options.dateFormats, settings.dateFormat);
        populateSelect('timezone', options.timezones, settings.timezone);
        populateSelect('startDayOfWeek', options.startDaysOfWeek, settings.startDayOfWeek);
        populateSelect('currencyFormat', options.currencyFormats, settings.currencyFormat);

        setValue('schoolName', settings.schoolName);
        setValue('schoolCode', settings.schoolCode);
        setValue('address', settings.address);
        setValue('phone', settings.phone);
        setValue('email', settings.email);
        setValue('baseUrl', settings.baseUrl);
        setValue('fileUploadPath', settings.fileUploadPath);
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load general settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function handleSave(event) {
    event.preventDefault();

    const payload = {
        schoolName: getValue('schoolName'),
        schoolCode: getValue('schoolCode'),
        address: getValue('address'),
        phone: getValue('phone'),
        email: getValue('email'),
        session: getValue('session'),
        sessionStartMonth: getValue('sessionStartMonth'),
        dateFormat: getValue('dateFormat'),
        timezone: getValue('timezone'),
        startDayOfWeek: getValue('startDayOfWeek'),
        currencyFormat: getValue('currencyFormat'),
        baseUrl: getValue('baseUrl'),
        fileUploadPath: getValue('fileUploadPath')
    };

    try {
        const response = await fetch('/api/schsettings/general', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: result.message,
                confirmButtonColor: '#10b981',
                timer: 2500,
                timerProgressBar: true
            });
            if (window.applyAppBranding) {
                window.applyAppBranding(true);
            }
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save general settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

function populateSelect(id, values, selected) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '';
    (values || []).forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        if (value === selected) option.selected = true;
        select.appendChild(option);
    });
}

function getValue(id) {
    return document.getElementById(id)?.value.trim() || '';
}

function setValue(id, value) {
    const field = document.getElementById(id);
    if (field) field.value = value ?? '';
}
