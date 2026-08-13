document.addEventListener('DOMContentLoaded', function () {
    setupChatForm();
    loadChatSettings();
});

function setupChatForm() {
    document.getElementById('chatSettingsForm')?.addEventListener('submit', handleSave);
}

async function loadChatSettings() {
    try {
        const response = await fetch('/api/schsettings/chat');
        if (!response.ok) throw new Error('Failed to load Chat settings');
        const data = await response.json();

        setChecked('allowStudentDeleteChat', data.allowStudentDeleteChat);
        setChecked('allowGuardianDeleteChat', data.allowGuardianDeleteChat);
        setChecked('allowStaffDeleteChat', data.allowStaffDeleteChat);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load Chat settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function handleSave(event) {
    event.preventDefault();

    const payload = {
        allowStudentDeleteChat: getChecked('allowStudentDeleteChat'),
        allowGuardianDeleteChat: getChecked('allowGuardianDeleteChat'),
        allowStaffDeleteChat: getChecked('allowStaffDeleteChat')
    };

    try {
        const response = await fetch('/api/schsettings/chat', {
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
            text: error.message || 'Failed to save Chat settings',
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
