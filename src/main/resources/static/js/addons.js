let addons = [];

document.addEventListener('DOMContentLoaded', function () {
    loadAddons();
    bindUpload();
});

async function loadAddons() {
    const grid = document.getElementById('addonsGrid');
    try {
        const response = await fetch('/api/addons');
        if (!response.ok) throw new Error('Failed to load addons');
        addons = await response.json();
        renderAddons();
    } catch (error) {
        if (grid) {
            grid.innerHTML = '<div class="addons-empty">Failed to load addons.</div>';
        }
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load addons',
            confirmButtonColor: '#ef4444'
        });
    }
}

function renderAddons() {
    const grid = document.getElementById('addonsGrid');
    if (!grid) return;

    if (!addons.length) {
        grid.innerHTML = '<div class="addons-empty">No addons installed.</div>';
        return;
    }

    grid.innerHTML = addons.map(function (addon) {
        return ''
            + '<article class="addon-card">'
            + '<div class="addon-card-body">'
            + '<div class="addon-icon">' + addonIcon(addon.iconKey) + '</div>'
            + '<div class="addon-content">'
            + '<h3 class="addon-title">' + escapeHtml(addon.name) + '</h3>'
            + '<p class="addon-description">' + escapeHtml(addon.description) + '</p>'
            + '</div>'
            + '</div>'
            + '<div class="addon-card-footer">'
            + '<span class="addon-version">Version ' + escapeHtml(addon.version) + '</span>'
            + '<button type="button" class="btn-uninstall" onclick="uninstallAddon(' + addon.id + ')">Uninstall</button>'
            + '</div>'
            + '</article>';
    }).join('');
}

function bindUpload() {
    const dropzone = document.getElementById('addonDropzone');
    const fileInput = document.getElementById('addonFileInput');
    const uploadBtn = document.getElementById('uploadAddonBtn');
    const hint = document.getElementById('addonUploadHint');

    if (!dropzone || !fileInput || !uploadBtn) return;

    dropzone.addEventListener('click', function () {
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        if (fileInput.files.length && hint) {
            hint.textContent = fileInput.files[0].name;
        }
    });

    ['dragenter', 'dragover'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function (event) {
            event.preventDefault();
            dropzone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function (event) {
            event.preventDefault();
            dropzone.classList.remove('dragover');
        });
    });

    dropzone.addEventListener('drop', function (event) {
        const files = event.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            if (hint) hint.textContent = files[0].name;
        }
    });

    uploadBtn.addEventListener('click', uploadAddon);
}

async function uploadAddon() {
    const fileInput = document.getElementById('addonFileInput');
    const hint = document.getElementById('addonUploadHint');
    if (!fileInput || !fileInput.files.length) {
        Swal.fire({
            icon: 'warning',
            title: 'Required',
            text: 'Please select an addon .zip file to upload.',
            confirmButtonColor: '#8b5cf6'
        });
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const response = await fetch('/api/addons/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: data.message || 'Addon uploaded successfully!',
            confirmButtonColor: '#8b5cf6'
        });

        fileInput.value = '';
        if (hint) hint.textContent = 'Drag and drop a file here or click';
        await loadAddons();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to upload addon',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function uninstallAddon(id) {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Uninstall Addon?',
        text: 'This will remove the addon from your system.',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Uninstall'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch('/api/addons/' + id, { method: 'DELETE' });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        Swal.fire({
            icon: 'success',
            title: 'Removed',
            text: data.message || 'Addon uninstalled successfully!',
            confirmButtonColor: '#8b5cf6'
        });
        await loadAddons();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to uninstall addon',
            confirmButtonColor: '#ef4444'
        });
    }
}

function addonIcon(iconKey) {
    const overlays = {
        whatsapp: '<circle cx="34" cy="34" r="10" fill="#25D366"/><path d="M31 34l2 2 5-5" stroke="#fff" stroke-width="2" fill="none"/>',
        thermal: '<rect x="26" y="28" width="16" height="12" rx="2" fill="#64748b"/><rect x="29" y="31" width="10" height="2" fill="#fff"/>',
        fees: '<circle cx="34" cy="34" r="10" fill="#f59e0b"/><text x="34" y="38" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">$</text>',
        qr: '<rect x="26" y="26" width="16" height="16" rx="2" fill="#111827"/><rect x="29" y="29" width="4" height="4" fill="#fff"/><rect x="35" y="29" width="4" height="4" fill="#fff"/><rect x="29" y="35" width="4" height="4" fill="#fff"/>',
        cbse: '<circle cx="34" cy="34" r="10" fill="#3b82f6"/><text x="34" y="38" text-anchor="middle" fill="#fff" font-size="8" font-weight="700">CBSE</text>',
        twofa: '<circle cx="34" cy="34" r="10" fill="#6366f1"/><path d="M31 34l2 2 5-5" stroke="#fff" stroke-width="2" fill="none"/>',
        branch: '<circle cx="34" cy="34" r="10" fill="#0ea5e9"/><path d="M30 34h8M34 30v8" stroke="#fff" stroke-width="2"/>',
        behaviour: '<circle cx="34" cy="34" r="10" fill="#ec4899"/><circle cx="34" cy="34" r="3" fill="#fff"/>',
        course: '<circle cx="34" cy="34" r="10" fill="#10b981"/><path d="M31 34l2 2 5-5" stroke="#fff" stroke-width="2" fill="none"/>',
        custom: '<circle cx="34" cy="34" r="10" fill="#8b5cf6"/><text x="34" y="38" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">+</text>'
    };

    const overlay = overlays[iconKey] || overlays.custom;

    return ''
        + '<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
        + '<defs>'
        + '<linearGradient id="addonBook" x1="0%" y1="0%" x2="100%" y2="100%">'
        + '<stop offset="0%" stop-color="#f6c544"/>'
        + '<stop offset="100%" stop-color="#f39c12"/>'
        + '</linearGradient>'
        + '</defs>'
        + '<rect x="8" y="10" width="34" height="32" fill="url(#addonBook)" rx="2"/>'
        + '<rect x="10" y="12" width="30" height="28" fill="#f39c12" rx="1"/>'
        + '<path d="M25 12 L25 40" stroke="#f6c544" stroke-width="2"/>'
        + '<polygon points="15,20 35,20 25,15" fill="#2d3748"/>'
        + '<rect x="24" y="20" width="2" height="8" fill="#2d3748"/>'
        + '<circle cx="26" cy="29" r="1.5" fill="#e74c3c"/>'
        + overlay
        + '</svg>';
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.uninstallAddon = uninstallAddon;
