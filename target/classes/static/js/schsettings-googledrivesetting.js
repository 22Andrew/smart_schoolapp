document.addEventListener('DOMContentLoaded', function () {
    setupGoogleDriveForm();
    loadGoogleDriveSettings();
});

function setupGoogleDriveForm() {
    document.getElementById('googleDriveSettingsForm')?.addEventListener('submit', handleSave);
}

async function loadGoogleDriveSettings() {
    try {
        const response = await fetch('/api/schsettings/google-drive');
        if (!response.ok) throw new Error('Failed to load Google Drive settings');
        const data = await response.json();

        setValue('clientId', data.clientId);
        setValue('apiKey', data.apiKey);
        setValue('projectNumberAppId', data.projectNumberAppId);
        setChecked('googleDriveStatus', data.status);
        setChecked('allowStudentUpload', data.allowStudentUpload);
        setChecked('allowGuardianUpload', data.allowGuardianUpload);
        setChecked('allowStaffUpload', data.allowStaffUpload);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load Google Drive settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function handleSave(event) {
    event.preventDefault();

    const payload = {
        clientId: getValue('clientId'),
        apiKey: getValue('apiKey'),
        projectNumberAppId: getValue('projectNumberAppId'),
        status: getChecked('googleDriveStatus'),
        allowStudentUpload: getChecked('allowStudentUpload'),
        allowGuardianUpload: getChecked('allowGuardianUpload'),
        allowStaffUpload: getChecked('allowStaffUpload')
    };

    if (!payload.clientId || !payload.apiKey || !payload.projectNumberAppId) {
        Swal.fire({
            icon: 'warning',
            title: 'Required',
            text: 'Please fill Client ID, API Key, and Project Number/APP ID.',
            confirmButtonColor: '#8b5cf6'
        });
        return;
    }

    try {
        const response = await fetch('/api/schsettings/google-drive', {
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
            text: error.message || 'Failed to save Google Drive settings',
            confirmButtonColor: '#ef4444'
        });
    }
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
