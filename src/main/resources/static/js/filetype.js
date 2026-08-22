let fileTypeSettings = {};

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('saveFileTypeBtn')?.addEventListener('click', saveSettings);
    loadSettings();
});

async function loadSettings() {
    try {
        const response = await fetch('/api/file-type-settings');
        if (!response.ok) throw new Error('Failed to load file type settings');
        fileTypeSettings = await response.json();
        populateForm();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load file type settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

function populateForm() {
    document.getElementById('fileAllowedExtension').value = fileTypeSettings.fileAllowedExtension || '';
    document.getElementById('fileAllowedMimeType').value = fileTypeSettings.fileAllowedMimeType || '';
    document.getElementById('fileUploadSize').value = fileTypeSettings.fileUploadSize || '';
    document.getElementById('imageAllowedExtension').value = fileTypeSettings.imageAllowedExtension || '';
    document.getElementById('imageAllowedMimeType').value = fileTypeSettings.imageAllowedMimeType || '';
    document.getElementById('imageUploadSize').value = fileTypeSettings.imageUploadSize || '';
}

async function saveSettings() {
    const payload = {
        fileAllowedExtension: document.getElementById('fileAllowedExtension').value.trim(),
        fileAllowedMimeType: document.getElementById('fileAllowedMimeType').value.trim(),
        fileUploadSize: document.getElementById('fileUploadSize').value.trim(),
        imageAllowedExtension: document.getElementById('imageAllowedExtension').value.trim(),
        imageAllowedMimeType: document.getElementById('imageAllowedMimeType').value.trim(),
        imageUploadSize: document.getElementById('imageUploadSize').value.trim()
    };

    try {
        const response = await fetch('/api/file-type-settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        fileTypeSettings = data.data || fileTypeSettings;
        populateForm();

        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: data.message || 'Record saved successfully',
            confirmButtonColor: '#10b981',
            timer: 1500,
            timerProgressBar: true
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save file type settings',
            confirmButtonColor: '#ef4444'
        });
    }
}
