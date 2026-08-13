document.addEventListener('DOMContentLoaded', function() {
    setupStudentGuardianPanelForm();
    loadStudentGuardianPanelSettings();
});

function setupStudentGuardianPanelForm() {
    document.getElementById('studentGuardianPanelForm')?.addEventListener('submit', handleSave);
}

async function loadStudentGuardianPanelSettings() {
    try {
        const response = await fetch('/api/schsettings/student-guardian-panel');
        if (!response.ok) throw new Error('Failed to load Student / Guardian Panel settings');
        const data = await response.json();

        setChecked('studentLoginEnabled', data.studentLoginEnabled);
        setChecked('parentLoginEnabled', data.parentLoginEnabled);
        setChecked('studentLoginAdmissionNo', data.studentLoginAdmissionNo);
        setChecked('studentLoginMobileNumber', data.studentLoginMobileNumber);
        setChecked('studentLoginEmail', data.studentLoginEmail);
        setChecked('parentLoginMobileNumber', data.parentLoginMobileNumber);
        setChecked('parentLoginEmail', data.parentLoginEmail);
        setChecked('allowStudentAddTimeline', data.allowStudentAddTimeline);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load Student / Guardian Panel settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function handleSave(event) {
    event.preventDefault();

    const payload = {
        studentLoginEnabled: getChecked('studentLoginEnabled'),
        parentLoginEnabled: getChecked('parentLoginEnabled'),
        studentLoginAdmissionNo: getChecked('studentLoginAdmissionNo'),
        studentLoginMobileNumber: getChecked('studentLoginMobileNumber'),
        studentLoginEmail: getChecked('studentLoginEmail'),
        parentLoginMobileNumber: getChecked('parentLoginMobileNumber'),
        parentLoginEmail: getChecked('parentLoginEmail'),
        allowStudentAddTimeline: getChecked('allowStudentAddTimeline')
    };

    try {
        const response = await fetch('/api/schsettings/student-guardian-panel', {
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
            text: error.message || 'Failed to save Student / Guardian Panel settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

function getChecked(id) {
    return document.getElementById(id)?.checked || false;
}

function setChecked(id, value) {
    const field = document.getElementById(id);
    if (field) {
        field.checked = !!value;
    }
}
