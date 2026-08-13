const BACKGROUND_TYPES = [
    { type: 'admin', key: 'adminPanelBackground', previewId: 'adminPanelPreview', inputId: 'adminPanelInput' },
    { type: 'user', key: 'userPanelBackground', previewId: 'userPanelPreview', inputId: 'userPanelInput' }
];

document.addEventListener('DOMContentLoaded', function() {
    setupBackgroundUploads();
    loadBackgrounds();
});

function setupBackgroundUploads() {
    BACKGROUND_TYPES.forEach(({ type, inputId }) => {
        const input = document.getElementById(inputId);
        const button = document.querySelector(`[data-background-type="${type}"]`);
        if (!button || !input) return;

        button.addEventListener('click', () => input.click());
        input.addEventListener('change', () => uploadBackground(type, input));
    });
}

async function loadBackgrounds() {
    try {
        const response = await fetch('/api/schsettings/login-background');
        if (!response.ok) throw new Error('Failed to load login backgrounds');
        const data = await response.json();
        renderBackgrounds(data);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load login backgrounds',
            confirmButtonColor: '#ef4444'
        });
    }
}

function renderBackgrounds(data) {
    const dimensionsEl = document.querySelector('[data-dimensions-for="background"]');
    if (dimensionsEl && data.backgroundDimensions) {
        dimensionsEl.textContent = `(${data.backgroundDimensions})`;
    }

    BACKGROUND_TYPES.forEach(({ key, previewId }) => {
        const preview = document.getElementById(previewId);
        if (!preview) return;

        if (data[key]) {
            preview.innerHTML = `<img src="${escapeHtml(data[key])}" alt="Background preview">`;
        } else {
            preview.innerHTML = '<div class="logo-placeholder">No image<br>uploaded</div>';
        }
    });
}

async function uploadBackground(type, input) {
    const file = input.files && input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('background', file);

    try {
        const response = await fetch(`/api/schsettings/login-background/${type}`, {
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
            renderBackgrounds(result.data);
            if (window.applyLoginBackground) {
                window.applyLoginBackground(true);
            }
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to update background',
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
