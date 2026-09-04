document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('refreshInfoBtn')?.addEventListener('click', loadOverview);
    loadOverview();
});

async function loadOverview() {
    try {
        const response = await fetch('/api/system-update');
        if (!response.ok) throw new Error('Failed to load system information');
        const data = await response.json();
        renderOverview(data);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load system information',
            confirmButtonColor: '#ef4444'
        });
    }
}

function renderOverview(data) {
    const db = data.database || {};
    setText('infoAppName', data.applicationName);
    setText('infoAppVersion', data.appVersion);
    setText('infoSpringBoot', data.springBootVersion);
    setText('infoJava', [data.javaVersion, data.javaVendor].filter(Boolean).join(' — '));
    setText('infoOs', [data.osName, data.osVersion].filter(Boolean).join(' '));
    setText('infoServerTime', data.serverTime);
    setText('infoDatabase', db.productName || '-');
    setText('infoDbVersion', db.productVersion || '-');
    setText('infoBootstrapBackup', data.bootstrapBackupFile || 'Not configured');
    setText('schemaReference', data.bootstrapBackupFile || 'Not configured');
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value == null || String(value).trim() === '' ? '-' : String(value);
}
