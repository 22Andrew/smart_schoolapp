let backupFiles = [];
let selectedFile = null;
let keyVisible = true;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('createBackupBtn')?.addEventListener('click', createBackup);
    document.getElementById('uploadBtn')?.addEventListener('click', uploadBackup);
    document.getElementById('regenerateKeyBtn')?.addEventListener('click', regenerateKey);
    document.getElementById('toggleKeyBtn')?.addEventListener('click', toggleKeyVisibility);

    const dropzone = document.getElementById('uploadDropzone');
    const fileInput = document.getElementById('backupFileInput');
    dropzone?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', () => {
        selectedFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
        updateUploadHint();
    });
    dropzone?.addEventListener('dragover', event => {
        event.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone?.addEventListener('drop', event => {
        event.preventDefault();
        dropzone.classList.remove('dragover');
        selectedFile = event.dataTransfer.files && event.dataTransfer.files[0] ? event.dataTransfer.files[0] : null;
        if (fileInput) fileInput.value = '';
        updateUploadHint();
    });

    loadOverview();
});

async function loadOverview() {
    try {
        const response = await fetch('/api/backup');
        if (!response.ok) throw new Error('Failed to load backup data');
        const data = await response.json();
        backupFiles = data.files || [];
        document.getElementById('cronSecretKey').value = data.cronSecretKey || '';
        applyKeyVisibility();
        renderTable();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load backups',
            confirmButtonColor: '#ef4444'
        });
    }
}

function renderTable() {
    const tbody = document.getElementById('backupTableBody');
    if (!tbody) return;

    if (!backupFiles.length) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;padding:40px;">No backup files found</td></tr>';
        return;
    }

    tbody.innerHTML = backupFiles.map(file => `
        <tr>
            <td>
                <a class="backup-link" href="/api/backup/${file.id}/download">${escapeHtml(file.fileName)}</a>
            </td>
            <td>
                <div class="action-buttons">
                    <a class="btn-action btn-download" href="/api/backup/${file.id}/download" title="Download">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="8 17 12 21 16 17"></polyline>
                            <line x1="12" y1="12" x2="12" y2="21"></line>
                            <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path>
                        </svg>
                    </a>
                    <button type="button" class="btn-action btn-restore" onclick="restoreBackup(${file.id})" title="Restore">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                            <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3"></path>
                            <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"></path>
                        </svg>
                    </button>
                    <button type="button" class="btn-action btn-delete" onclick="deleteBackup(${file.id})" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function createBackup() {
    const result = await Swal.fire({
        title: 'Create Backup?',
        text: 'A SQL dump of the current database will be saved.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Create Backup',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#8b5cf6'
    });
    if (!result.isConfirmed) return;

    Swal.fire({
        title: 'Creating backup...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const response = await fetch('/api/backup/create', { method: 'POST' });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        await Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: data.message,
            confirmButtonColor: '#10b981',
            timer: 2200,
            timerProgressBar: true
        });
        loadOverview();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to create backup',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function uploadBackup() {
    if (!selectedFile) {
        Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Please choose a SQL file to upload',
            confirmButtonColor: '#ef4444'
        });
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    Swal.fire({
        title: 'Uploading...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const response = await fetch('/api/backup/upload', { method: 'POST', body: formData });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        selectedFile = null;
        const fileInput = document.getElementById('backupFileInput');
        if (fileInput) fileInput.value = '';
        updateUploadHint();
        await Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: data.message,
            confirmButtonColor: '#10b981',
            timer: 2200,
            timerProgressBar: true
        });
        loadOverview();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to upload backup',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function restoreBackup(id) {
    const result = await Swal.fire({
        title: 'Restore this backup?',
        text: 'This will overwrite the current database.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, restore',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#f59e0b'
    });
    if (!result.isConfirmed) return;

    Swal.fire({
        title: 'Restoring database...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const response = await fetch(`/api/backup/${id}/restore`, { method: 'POST' });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        await Swal.fire({
            icon: 'success',
            title: 'Restored!',
            text: data.message,
            confirmButtonColor: '#10b981'
        });
        loadOverview();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to restore backup',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function deleteBackup(id) {
    const result = await Swal.fire({
        title: 'Delete Backup?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444'
    });
    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`/api/backup/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: data.message,
            confirmButtonColor: '#10b981',
            timer: 2000,
            timerProgressBar: true
        });
        loadOverview();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to delete backup',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function regenerateKey() {
    const result = await Swal.fire({
        title: 'Regenerate Cron Secret Key?',
        text: 'The current key will be replaced and saved.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Regenerate',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#8b5cf6'
    });
    if (!result.isConfirmed) return;

    try {
        const response = await fetch('/api/backup/cron-key', { method: 'POST' });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        document.getElementById('cronSecretKey').value = data.data?.cronSecretKey || '';
        applyKeyVisibility();
        Swal.fire({
            icon: 'success',
            title: 'Saved!',
            text: data.message,
            confirmButtonColor: '#10b981',
            timer: 2000,
            timerProgressBar: true
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save cron secret key',
            confirmButtonColor: '#ef4444'
        });
    }
}

function toggleKeyVisibility() {
    keyVisible = !keyVisible;
    applyKeyVisibility();
}

function applyKeyVisibility() {
    const input = document.getElementById('cronSecretKey');
    if (!input) return;
    input.type = keyVisible ? 'text' : 'password';
}

function updateUploadHint() {
    const hint = document.getElementById('uploadHint');
    if (!hint) return;
    hint.textContent = selectedFile ? selectedFile.name : 'Drag and drop a file here or click';
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.restoreBackup = restoreBackup;
window.deleteBackup = deleteBackup;
