const LOGO_TYPES = [
    { type: 'print', key: 'printLogo', dimensionsKey: 'printLogoDimensions', previewId: 'printLogoPreview', inputId: 'printLogoInput' },
    { type: 'admin', key: 'adminLogo', dimensionsKey: 'adminLogoDimensions', previewId: 'adminLogoPreview', inputId: 'adminLogoInput' },
    { type: 'adminSmall', key: 'adminSmallLogo', dimensionsKey: 'adminSmallLogoDimensions', previewId: 'adminSmallLogoPreview', inputId: 'adminSmallLogoInput' },
    { type: 'app', key: 'appLogo', dimensionsKey: 'appLogoDimensions', previewId: 'appLogoPreview', inputId: 'appLogoInput' }
];

document.addEventListener('DOMContentLoaded', function() {
    setupLogoUploads();
    loadLogos();
});

function setupLogoUploads() {
    LOGO_TYPES.forEach(({ type, inputId }) => {
        const input = document.getElementById(inputId);
        const button = document.querySelector(`[data-logo-type="${type}"]`);
        if (!button || !input) return;

        button.addEventListener('click', () => input.click());
        input.addEventListener('change', () => uploadLogo(type, input));
    });
}

async function loadLogos() {
    try {
        const response = await fetch('/api/schsettings/logo');
        if (!response.ok) throw new Error('Failed to load logos');
        const data = await response.json();
        renderLogos(data);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load logos',
            confirmButtonColor: '#ef4444'
        });
    }
}

function renderLogos(data) {
    LOGO_TYPES.forEach(({ key, dimensionsKey, previewId }) => {
        const preview = document.getElementById(previewId);
        const dimensionsEl = document.querySelector(`[data-dimensions-for="${key}"]`);
        if (dimensionsEl && data[dimensionsKey]) {
            dimensionsEl.textContent = `(${data[dimensionsKey]})`;
        }
        if (!preview) return;

        if (data[key]) {
            preview.innerHTML = `<img src="${escapeHtml(data[key])}" alt="Logo preview">`;
        } else {
            preview.innerHTML = '<div class="logo-placeholder">SMART<br>SCHOOL</div>';
        }
    });
}

async function uploadLogo(type, input) {
    const file = input.files && input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
        const response = await fetch(`/api/schsettings/logo/${type}`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: result.message,
                confirmButtonColor: '#10b981',
                timer: 2000,
                timerProgressBar: true
            });
            renderLogos(result.data);
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
            text: error.message || 'Failed to update logo',
            confirmButtonColor: '#ef4444'
        });
    } finally {
        input.value = '';
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
