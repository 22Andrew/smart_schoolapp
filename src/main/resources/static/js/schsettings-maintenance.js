document.addEventListener('DOMContentLoaded', function () {
    setupMaintenanceForm();
    loadMaintenanceSettings();
});

function setupMaintenanceForm() {
    document.getElementById('maintenanceSettingsForm')?.addEventListener('submit', handleSave);
}

async function loadMaintenanceSettings() {
    try {
        const response = await fetch('/api/schsettings/maintenance');
        if (!response.ok) throw new Error('Failed to load Maintenance settings');
        const data = await response.json();
        setChecked('maintenanceMode', data.maintenanceMode);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load Maintenance settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function handleSave(event) {
    event.preventDefault();

    const payload = {
        maintenanceMode: getChecked('maintenanceMode')
    };

    try {
        const response = await fetch('/api/schsettings/maintenance', {
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
            text: error.message || 'Failed to save Maintenance settings',
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
