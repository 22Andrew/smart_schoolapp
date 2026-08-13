document.addEventListener('DOMContentLoaded', function () {
    setupMiscellaneousForm();
    loadMiscellaneousSettings();
});

function setupMiscellaneousForm() {
    document.getElementById('miscellaneousSettingsForm')?.addEventListener('submit', handleSave);
}

async function loadMiscellaneousSettings() {
    try {
        const response = await fetch('/api/schsettings/miscellaneous');
        if (!response.ok) throw new Error('Failed to load Miscellaneous settings');
        const data = await response.json();

        setChecked('showMeOnlyMyQuestion', data.showMeOnlyMyQuestion);
        setScanType(data.idCardScanType);
        setChecked('examResultPageInFrontSite', data.examResultPageInFrontSite);
        setChecked('downloadAdmitCardInStudentParentPanel', data.downloadAdmitCardInStudentParentPanel);
        setChecked('teacherRestrictedMode', data.teacherRestrictedMode);
        setChecked('superadminVisibility', data.superadminVisibility);
        setChecked('eventReminder', data.eventReminder);
        setValue('staffApplyLeaveNotificationEmail', data.staffApplyLeaveNotificationEmail);
        setChecked('enableMultiClassSelectionInStudentAdmission', data.enableMultiClassSelectionInStudentAdmission);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load Miscellaneous settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function handleSave(event) {
    event.preventDefault();

    const payload = {
        showMeOnlyMyQuestion: getChecked('showMeOnlyMyQuestion'),
        idCardScanType: getScanType(),
        examResultPageInFrontSite: getChecked('examResultPageInFrontSite'),
        downloadAdmitCardInStudentParentPanel: getChecked('downloadAdmitCardInStudentParentPanel'),
        teacherRestrictedMode: getChecked('teacherRestrictedMode'),
        superadminVisibility: getChecked('superadminVisibility'),
        eventReminder: getChecked('eventReminder'),
        staffApplyLeaveNotificationEmail: getValue('staffApplyLeaveNotificationEmail'),
        enableMultiClassSelectionInStudentAdmission: getChecked('enableMultiClassSelectionInStudentAdmission')
    };

    try {
        const response = await fetch('/api/schsettings/miscellaneous', {
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
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save Miscellaneous settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

function getScanType() {
    const selected = document.querySelector('input[name="idCardScanType"]:checked');
    return selected ? selected.value : 'BARCODE';
}

function setScanType(value) {
    const normalized = (value || 'BARCODE').toUpperCase();
    const targetValue = normalized === 'QR_CODE' ? 'QR_CODE' : 'BARCODE';
    const field = document.querySelector(`input[name="idCardScanType"][value="${targetValue}"]`);
    if (field) field.checked = true;
}

function getChecked(id) {
    return document.getElementById(id)?.checked || false;
}

function setChecked(id, value) {
    const field = document.getElementById(id);
    if (field) field.checked = !!value;
}

function getValue(id) {
    return document.getElementById(id)?.value.trim() || '';
}

function setValue(id, value) {
    const field = document.getElementById(id);
    if (field) field.value = value ?? '';
}
